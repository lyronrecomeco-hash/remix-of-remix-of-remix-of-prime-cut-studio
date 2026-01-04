// Genesis Session Backup Edge Function
// Gerencia backup e restore de sessões WhatsApp
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-instance-token',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface BackupRequest {
  action: 'create_backup' | 'get_latest' | 'restore' | 'list_backups' | 'upload_complete';
  instance_id: string;
  backup_type?: 'automatic' | 'manual' | 'pre_disconnect' | 'scheduled';
  checksum?: string;
  file_size?: number;
  metadata?: Record<string, unknown>;
  backup_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: BackupRequest = await req.json();
    const { action, instance_id } = body;

    if (!instance_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'instance_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se a instância existe
    const { data: instance, error: instanceError } = await supabase
      .from('genesis_instances')
      .select('id, name, user_id, backup_enabled')
      .eq('id', instance_id)
      .single();

    if (instanceError || !instance) {
      return new Response(
        JSON.stringify({ success: false, error: 'Instance not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (action) {
      case 'create_backup': {
        // Criar registro de backup e retornar URL para upload
        const { data: backupId, error: createError } = await supabase.rpc(
          'genesis_create_backup_record',
          {
            p_instance_id: instance_id,
            p_checksum: body.checksum || null,
            p_file_size: body.file_size || 0,
            p_backup_type: body.backup_type || 'automatic',
            p_metadata: body.metadata || {}
          }
        );

        if (createError) {
          console.error('Error creating backup record:', createError);
          return new Response(
            JSON.stringify({ success: false, error: createError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Buscar o storage_path gerado
        const { data: backup } = await supabase
          .from('genesis_session_backups')
          .select('storage_path, version')
          .eq('id', backupId)
          .single();

        // Gerar URL de upload assinada
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('genesis-sessions')
          .createSignedUploadUrl(backup?.storage_path || '');

        if (uploadError) {
          console.error('Error creating upload URL:', uploadError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to create upload URL' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Limpar backups antigos (manter últimos 5)
        await supabase.rpc('genesis_cleanup_old_backups', {
          p_instance_id: instance_id,
          p_keep_count: 5
        });

        return new Response(
          JSON.stringify({
            success: true,
            backup_id: backupId,
            storage_path: backup?.storage_path,
            version: backup?.version,
            upload_url: uploadData?.signedUrl,
            upload_token: uploadData?.token
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'upload_complete': {
        // Atualizar instância com referência ao backup
        const { error: updateError } = await supabase
          .from('genesis_instances')
          .update({
            last_backup_id: body.backup_id,
            last_backup_at: new Date().toISOString()
          })
          .eq('id', instance_id);

        if (updateError) {
          console.error('Error updating instance:', updateError);
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Backup completed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_latest': {
        // Buscar último backup válido
        const { data: latestBackup, error: latestError } = await supabase.rpc(
          'genesis_get_latest_backup',
          { p_instance_id: instance_id }
        );

        if (latestError) {
          console.error('Error getting latest backup:', latestError);
          return new Response(
            JSON.stringify({ success: false, error: latestError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!latestBackup || latestBackup.length === 0) {
          return new Response(
            JSON.stringify({ success: true, backup: null, message: 'No backup found' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const backup = latestBackup[0];

        // Gerar URL de download assinada
        const { data: downloadData, error: downloadError } = await supabase.storage
          .from('genesis-sessions')
          .createSignedUrl(backup.storage_path, 3600); // 1 hora

        if (downloadError) {
          console.error('Error creating download URL:', downloadError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to create download URL' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            backup: {
              ...backup,
              download_url: downloadData?.signedUrl
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'restore': {
        if (!body.backup_id) {
          return new Response(
            JSON.stringify({ success: false, error: 'backup_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Buscar backup
        const { data: backup, error: backupError } = await supabase
          .from('genesis_session_backups')
          .select('*')
          .eq('id', body.backup_id)
          .eq('instance_id', instance_id)
          .single();

        if (backupError || !backup) {
          return new Response(
            JSON.stringify({ success: false, error: 'Backup not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!backup.is_valid) {
          return new Response(
            JSON.stringify({ success: false, error: 'Backup is no longer valid' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Gerar URL de download
        const { data: downloadData, error: downloadError } = await supabase.storage
          .from('genesis-sessions')
          .createSignedUrl(backup.storage_path, 3600);

        if (downloadError) {
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to create download URL' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Marcar como restaurado
        await supabase.rpc('genesis_mark_backup_restored', { p_backup_id: body.backup_id });

        return new Response(
          JSON.stringify({
            success: true,
            backup: {
              id: backup.id,
              checksum: backup.checksum,
              version: backup.version,
              download_url: downloadData?.signedUrl
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list_backups': {
        const { data: backups, error: listError } = await supabase
          .from('genesis_session_backups')
          .select('id, storage_path, version, backup_type, checksum, file_size_bytes, is_valid, restored_at, created_at')
          .eq('instance_id', instance_id)
          .eq('is_valid', true)
          .order('version', { ascending: false })
          .limit(10);

        if (listError) {
          return new Response(
            JSON.stringify({ success: false, error: listError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, backups: backups || [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Session backup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
