import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =====================================================
// GOOGLE CALENDAR WORKER
// Handles OAuth, CRUD operations, and polling triggers
// =====================================================

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') || '';
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface OAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  scope: string;
  token_type: string;
}

// =====================================================
// Helper: Refresh Google OAuth Token
// =====================================================
async function refreshGoogleToken(refreshToken: string): Promise<OAuthTokens | null> {
  console.log('[GCAL] Refreshing token...');
  
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[GCAL] Token refresh failed:', error);
      return null;
    }

    const data = await response.json();
    const expiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000);

    return {
      access_token: data.access_token,
      refresh_token: refreshToken, // Keep original refresh token
      expires_at: expiresAt.toISOString(),
      scope: data.scope || 'https://www.googleapis.com/auth/calendar',
      token_type: data.token_type || 'Bearer',
    };
  } catch (error) {
    console.error('[GCAL] Token refresh exception:', error);
    return null;
  }
}

// =====================================================
// Helper: Get valid access token (refresh if needed)
// =====================================================
async function getValidAccessToken(supabase: any, oauthId: string): Promise<string | null> {
  const { data: oauth, error } = await supabase
    .from('genesis_google_oauth')
    .select('*')
    .eq('id', oauthId)
    .single();

  if (error || !oauth) {
    console.error('[GCAL] OAuth record not found:', oauthId);
    return null;
  }

  // Check if token is expired (with 5 min buffer)
  const expiresAt = new Date(oauth.expires_at);
  const now = new Date(Date.now() + 5 * 60 * 1000);

  if (expiresAt > now) {
    return oauth.access_token;
  }

  // Token expired, refresh it
  console.log('[GCAL] Token expired, refreshing...');
  const newTokens = await refreshGoogleToken(oauth.refresh_token);

  if (!newTokens) {
    return null;
  }

  // Update tokens in database
  const { error: updateError } = await supabase
    .from('genesis_google_oauth')
    .update({
      access_token: newTokens.access_token,
      expires_at: newTokens.expires_at,
    })
    .eq('id', oauthId);

  if (updateError) {
    console.error('[GCAL] Failed to update tokens:', updateError);
  }

  // Log the refresh
  await supabase.from('genesis_calendar_logs').insert({
    action: 'oauth_refresh',
    status: 'success',
    details: { oauth_id: oauthId },
  });

  return newTokens.access_token;
}

// =====================================================
// ACTION: Exchange authorization code for tokens
// =====================================================
async function handleOAuthCallback(supabase: any, body: any): Promise<Response> {
  const { code, redirect_uri, user_id, project_id } = body;

  if (!code || !redirect_uri || !user_id) {
    return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('[GCAL] Token exchange failed:', error);
      return new Response(JSON.stringify({ success: false, error: 'Token exchange failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tokens = await tokenResponse.json();
    const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000);

    // Get user email from Google
    let email = null;
    try {
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        email = userInfo.email;
      }
    } catch (e) {
      console.warn('[GCAL] Could not get user email:', e);
    }

    // Upsert OAuth record
    const { data: oauthRecord, error: upsertError } = await supabase
      .from('genesis_google_oauth')
      .upsert({
        user_id,
        project_id: project_id || 'default',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt.toISOString(),
        scope: tokens.scope || 'https://www.googleapis.com/auth/calendar',
        token_type: tokens.token_type || 'Bearer',
        email,
      }, {
        onConflict: 'user_id,project_id',
      })
      .select()
      .single();

    if (upsertError) {
      console.error('[GCAL] Failed to save OAuth:', upsertError);
      return new Response(JSON.stringify({ success: false, error: 'Failed to save OAuth' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log successful connection
    await supabase.from('genesis_calendar_logs').insert({
      action: 'oauth_connect',
      status: 'success',
      details: { email, user_id },
    });

    return new Response(JSON.stringify({ 
      success: true, 
      oauth_id: oauthRecord?.id,
      email 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[GCAL] OAuth callback error:', error);
    return new Response(JSON.stringify({ success: false, error: error?.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// =====================================================
// ACTION: List calendar events
// =====================================================
async function handleListEvents(supabase: any, body: any): Promise<Response> {
  const { oauth_id, calendar_id = 'primary', time_min, time_max, max_results = 10, query } = body;

  if (!oauth_id) {
    return new Response(JSON.stringify({ success: false, error: 'Missing oauth_id' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const accessToken = await getValidAccessToken(supabase, oauth_id);
  if (!accessToken) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid or expired OAuth' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const params = new URLSearchParams({
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: String(max_results),
    });

    if (time_min) params.set('timeMin', new Date(time_min).toISOString());
    if (time_max) params.set('timeMax', new Date(time_max).toISOString());
    if (query) params.set('q', query);

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar_id)}/events?${params}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[GCAL] List events failed:', error);
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch events' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    // Normalize events
    const events = (data.items || []).map((event: any) => ({
      event_id: event.id,
      title: event.summary || '',
      description: event.description || '',
      start_time: event.start?.dateTime || event.start?.date,
      end_time: event.end?.dateTime || event.end?.date,
      location: event.location || '',
      attendees: (event.attendees || []).map((a: any) => ({
        email: a.email,
        name: a.displayName,
        response_status: a.responseStatus,
      })),
      created: event.created,
      updated: event.updated,
      status: event.status,
      html_link: event.htmlLink,
    }));

    // Log
    await supabase.from('genesis_calendar_logs').insert({
      action: 'list_events',
      status: 'success',
      details: { calendar_id, count: events.length },
    });

    return new Response(JSON.stringify({ success: true, events }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[GCAL] List events error:', error);
    return new Response(JSON.stringify({ success: false, error: error?.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// =====================================================
// ACTION: Create calendar event
// =====================================================
async function handleCreateEvent(supabase: any, body: any): Promise<Response> {
  const { 
    oauth_id, 
    calendar_id = 'primary', 
    title, 
    description, 
    start_time, 
    end_time, 
    timezone = 'America/Sao_Paulo',
    attendees = [],
    location,
    reminders 
  } = body;

  if (!oauth_id || !title || !start_time || !end_time) {
    return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const accessToken = await getValidAccessToken(supabase, oauth_id);
  if (!accessToken) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid or expired OAuth' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const event: any = {
      summary: title,
      description,
      start: {
        dateTime: new Date(start_time).toISOString(),
        timeZone: timezone,
      },
      end: {
        dateTime: new Date(end_time).toISOString(),
        timeZone: timezone,
      },
    };

    if (location) event.location = location;
    if (attendees.length > 0) {
      event.attendees = attendees.map((email: string) => ({ email }));
    }
    if (reminders) event.reminders = reminders;

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar_id)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[GCAL] Create event failed:', error);
      return new Response(JSON.stringify({ success: false, error: 'Failed to create event' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const createdEvent = await response.json();

    // Log
    await supabase.from('genesis_calendar_logs').insert({
      action: 'create_event',
      status: 'success',
      details: { event_id: createdEvent.id, title },
    });

    return new Response(JSON.stringify({ 
      success: true, 
      event: {
        event_id: createdEvent.id,
        title: createdEvent.summary,
        html_link: createdEvent.htmlLink,
        start_time: createdEvent.start?.dateTime,
        end_time: createdEvent.end?.dateTime,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[GCAL] Create event error:', error);
    return new Response(JSON.stringify({ success: false, error: error?.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// =====================================================
// ACTION: Update calendar event
// =====================================================
async function handleUpdateEvent(supabase: any, body: any): Promise<Response> {
  const { 
    oauth_id, 
    calendar_id = 'primary', 
    event_id,
    title, 
    description, 
    start_time, 
    end_time, 
    timezone = 'America/Sao_Paulo',
    attendees,
    location 
  } = body;

  if (!oauth_id || !event_id) {
    return new Response(JSON.stringify({ success: false, error: 'Missing oauth_id or event_id' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const accessToken = await getValidAccessToken(supabase, oauth_id);
  if (!accessToken) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid or expired OAuth' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // First, get current event
    const getResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar_id)}/events/${event_id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!getResponse.ok) {
      return new Response(JSON.stringify({ success: false, error: 'Event not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const currentEvent = await getResponse.json();

    // Merge updates
    const updatedEvent: any = { ...currentEvent };
    if (title) updatedEvent.summary = title;
    if (description !== undefined) updatedEvent.description = description;
    if (start_time) {
      updatedEvent.start = {
        dateTime: new Date(start_time).toISOString(),
        timeZone: timezone,
      };
    }
    if (end_time) {
      updatedEvent.end = {
        dateTime: new Date(end_time).toISOString(),
        timeZone: timezone,
      };
    }
    if (location !== undefined) updatedEvent.location = location;
    if (attendees) {
      updatedEvent.attendees = attendees.map((email: string) => ({ email }));
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar_id)}/events/${event_id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[GCAL] Update event failed:', error);
      return new Response(JSON.stringify({ success: false, error: 'Failed to update event' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();

    // Log
    await supabase.from('genesis_calendar_logs').insert({
      action: 'update_event',
      status: 'success',
      details: { event_id, updates: { title, start_time, end_time } },
    });

    return new Response(JSON.stringify({ 
      success: true, 
      event: {
        event_id: result.id,
        title: result.summary,
        html_link: result.htmlLink,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[GCAL] Update event error:', error);
    return new Response(JSON.stringify({ success: false, error: error?.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// =====================================================
// ACTION: Delete calendar event
// =====================================================
async function handleDeleteEvent(supabase: any, body: any): Promise<Response> {
  const { oauth_id, calendar_id = 'primary', event_id, send_updates = 'all' } = body;

  if (!oauth_id || !event_id) {
    return new Response(JSON.stringify({ success: false, error: 'Missing oauth_id or event_id' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const accessToken = await getValidAccessToken(supabase, oauth_id);
  if (!accessToken) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid or expired OAuth' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar_id)}/events/${event_id}?sendUpdates=${send_updates}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok && response.status !== 204) {
      const error = await response.text();
      console.error('[GCAL] Delete event failed:', error);
      return new Response(JSON.stringify({ success: false, error: 'Failed to delete event' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log
    await supabase.from('genesis_calendar_logs').insert({
      action: 'delete_event',
      status: 'success',
      details: { event_id, calendar_id },
    });

    return new Response(JSON.stringify({ success: true, deleted: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[GCAL] Delete event error:', error);
    return new Response(JSON.stringify({ success: false, error: error?.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// =====================================================
// ACTION: Poll for trigger events
// =====================================================
async function handlePollTriggers(supabase: any): Promise<Response> {
  console.log('[GCAL] Polling for calendar triggers...');

  try {
    // Get active calendar configs
    const { data: configs, error: configError } = await supabase
      .from('genesis_calendar_configs')
      .select('*, genesis_google_oauth!inner(*)')
      .eq('is_active', true);

    if (configError || !configs || configs.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No active configs' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let triggersProcessed = 0;

    for (const config of configs) {
      try {
        const accessToken = await getValidAccessToken(supabase, config.oauth_id);
        if (!accessToken) continue;

        const now = new Date();
        const triggerConfig = config.trigger_config || {};
        const minutesBefore = triggerConfig.minutes_before || 30;

        // Fetch upcoming events
        const timeMin = now.toISOString();
        const timeMax = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // Next 24 hours

        const params = new URLSearchParams({
          singleEvents: 'true',
          orderBy: 'startTime',
          timeMin,
          timeMax,
          maxResults: '50',
        });

        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendar_id)}/events?${params}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!response.ok) continue;

        const data = await response.json();
        const events = data.items || [];

        for (const event of events) {
          const eventStart = new Date(event.start?.dateTime || event.start?.date);
          const triggerTime = new Date(eventStart.getTime() - minutesBefore * 60 * 1000);

          // Check if we should trigger now
          if (config.trigger_type === 'event_start' && triggerTime <= now && triggerTime > new Date(now.getTime() - 5 * 60 * 1000)) {
            // Check if already processed (deduplication)
            const { data: existing } = await supabase
              .from('genesis_calendar_events')
              .select('id')
              .eq('config_id', config.id)
              .eq('event_id', event.id)
              .eq('status', 'triggered')
              .single();

            if (existing) continue;

            // Upsert event and mark for trigger
            const { error: upsertError } = await supabase
              .from('genesis_calendar_events')
              .upsert({
                config_id: config.id,
                event_id: event.id,
                event_data: {
                  event_id: event.id,
                  title: event.summary,
                  description: event.description,
                  start_time: event.start?.dateTime || event.start?.date,
                  end_time: event.end?.dateTime || event.end?.date,
                  location: event.location,
                  attendees: event.attendees?.map((a: any) => ({
                    email: a.email,
                    name: a.displayName,
                  })) || [],
                },
                status: 'triggered',
                trigger_at: triggerTime.toISOString(),
                triggered_at: now.toISOString(),
              }, {
                onConflict: 'config_id,event_id',
              });

            if (!upsertError) {
              // Dispatch to automation worker
              const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
              
              await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-automation-worker`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                  event_type: 'google_calendar_trigger',
                  flow_id: config.flow_id,
                  event_data: {
                    trigger_type: config.trigger_type,
                    event: {
                      event_id: event.id,
                      title: event.summary,
                      description: event.description,
                      start_time: event.start?.dateTime || event.start?.date,
                      end_time: event.end?.dateTime || event.end?.date,
                      location: event.location,
                      attendees: event.attendees?.map((a: any) => a.email) || [],
                    },
                    calendar_id: config.calendar_id,
                    oauth_id: config.oauth_id,
                  },
                }),
              });

              triggersProcessed++;
              
              await supabase.from('genesis_calendar_logs').insert({
                config_id: config.id,
                action: 'trigger_fired',
                status: 'success',
                details: { event_id: event.id, title: event.summary },
              });
            }
          }
        }

        // Update last sync
        await supabase
          .from('genesis_calendar_configs')
          .update({ last_sync_at: now.toISOString() })
          .eq('id', config.id);

      } catch (configError) {
        console.error(`[GCAL] Error processing config ${config.id}:`, configError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: configs.length,
      triggered: triggersProcessed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[GCAL] Poll triggers error:', error);
    return new Response(JSON.stringify({ success: false, error: error?.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// =====================================================
// ACTION: Get OAuth status
// =====================================================
async function handleGetOAuthStatus(supabase: any, body: any): Promise<Response> {
  const { user_id, project_id } = body;

  if (!user_id) {
    return new Response(JSON.stringify({ success: false, error: 'Missing user_id' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: oauth, error } = await supabase
    .from('genesis_google_oauth')
    .select('id, email, created_at, expires_at')
    .eq('user_id', user_id)
    .eq('project_id', project_id || 'default')
    .single();

  if (error || !oauth) {
    return new Response(JSON.stringify({ success: true, connected: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ 
    success: true, 
    connected: true,
    oauth_id: oauth.id,
    email: oauth.email,
    expires_at: oauth.expires_at,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// =====================================================
// MAIN HANDLER
// =====================================================
Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'status';

    console.log(`[GCAL] Action: ${action}`);

    switch (action) {
      case 'oauth_callback':
        return await handleOAuthCallback(supabase, body);
      
      case 'list_events':
        return await handleListEvents(supabase, body);
      
      case 'create_event':
        return await handleCreateEvent(supabase, body);
      
      case 'update_event':
        return await handleUpdateEvent(supabase, body);
      
      case 'delete_event':
        return await handleDeleteEvent(supabase, body);
      
      case 'poll_triggers':
        return await handlePollTriggers(supabase);
      
      case 'status':
        return await handleGetOAuthStatus(supabase, body);
      
      default:
        return new Response(JSON.stringify({ success: false, error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error: any) {
    console.error('[GCAL] Handler error:', error);
    return new Response(JSON.stringify({ success: false, error: error?.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
