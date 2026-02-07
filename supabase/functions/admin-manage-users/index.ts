import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is admin
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await callerClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminUserId = claimsData.claims.sub;

    // Check admin role using service client
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", adminUserId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...payload } = await req.json();

    if (action === "create_user") {
      const { email, password, display_name, father_name, cnic, address } = payload;

      if (!email || !password || !display_name || !father_name) {
        return new Response(
          JSON.stringify({ error: "Email, password, display name, and father name are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create user with service role (auto-confirms)
      const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update profile with additional info
      await serviceClient
        .from("profiles")
        .update({ display_name, father_name, cnic: cnic || null, address: address || null })
        .eq("user_id", newUser.user.id);

      // Assign user role
      await serviceClient
        .from("user_roles")
        .insert({ user_id: newUser.user.id, role: "user" });

      return new Response(
        JSON.stringify({ success: true, user_id: newUser.user.id, email, password }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete_user") {
      const { user_id } = payload;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user_id);
      if (deleteError) {
        return new Response(JSON.stringify({ error: deleteError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_user") {
      const { user_id, display_name, father_name, cnic, address } = payload;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await serviceClient
        .from("profiles")
        .update({ display_name, father_name, cnic: cnic || null, address: address || null })
        .eq("user_id", user_id);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list_users") {
      // Get all profiles with user role
      const { data: profiles, error: profilesError } = await serviceClient
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) {
        return new Response(JSON.stringify({ error: profilesError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get roles to filter out admins
      const { data: roles } = await serviceClient.from("user_roles").select("user_id, role");
      const adminIds = new Set((roles || []).filter((r) => r.role === "admin").map((r) => r.user_id));

      // Get all attendance data
      const { data: attendance } = await serviceClient
        .from("prayer_attendance")
        .select("*")
        .order("date", { ascending: false });

      // Get user emails from auth
      const { data: authUsers } = await serviceClient.auth.admin.listUsers({ perPage: 1000 });

      const emailMap = new Map<string, string>();
      (authUsers?.users || []).forEach((u) => {
        if (u.email) emailMap.set(u.id, u.email);
      });

      const users = (profiles || [])
        .filter((p) => !adminIds.has(p.user_id))
        .map((p) => ({
          ...p,
          email: emailMap.get(p.user_id) || "",
          attendance: (attendance || []).filter((a) => a.user_id === p.user_id),
        }));

      return new Response(JSON.stringify({ users }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_stats") {
      // Get all attendance
      const { data: attendance } = await serviceClient
        .from("prayer_attendance")
        .select("*");

      // Get all profiles (non-admin)
      const { data: roles } = await serviceClient.from("user_roles").select("user_id, role");
      const adminIds = new Set((roles || []).filter((r) => r.role === "admin").map((r) => r.user_id));

      const { data: profiles } = await serviceClient.from("profiles").select("*");
      const userProfiles = (profiles || []).filter((p) => !adminIds.has(p.user_id));

      return new Response(
        JSON.stringify({ attendance: attendance || [], profiles: userProfiles }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
