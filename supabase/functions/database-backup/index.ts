import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!adminUser) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Tables to backup
    const tablesToBackup = [
      "appointments",
      "barbers",
      "services",
      "queue",
      "feedbacks",
      "gallery_images",
      "admin_settings",
      "admin_users",
      "blocked_slots",
      "barber_schedules",
      "barber_availability",
    ];

    const backupData: Record<string, any[]> = {};
    const errors: string[] = [];

    // Fetch data from each table
    for (const table of tablesToBackup) {
      try {
        const { data, error } = await supabase.from(table).select("*");
        if (error) {
          errors.push(`Error backing up ${table}: ${error.message}`);
        } else {
          backupData[table] = data || [];
        }
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        errors.push(`Exception backing up ${table}: ${errorMsg}`);
      }
    }

    const backup = {
      version: "1.0",
      createdAt: new Date().toISOString(),
      createdBy: user.email,
      tables: backupData,
      metadata: {
        totalRecords: Object.values(backupData).reduce((sum, arr) => sum + arr.length, 0),
        tableCount: Object.keys(backupData).length,
      },
      errors: errors.length > 0 ? errors : undefined,
    };

    // Log the backup action
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "database_backup",
      entity_type: "system",
      details: {
        tables: Object.keys(backupData),
        recordCount: backup.metadata.totalRecords,
      },
    });

    return new Response(
      JSON.stringify(backup),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="backup-${new Date().toISOString().split("T")[0]}.json"`,
        },
      }
    );
  } catch (error: unknown) {
    console.error("Backup error:", error);
    const errorMsg = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
