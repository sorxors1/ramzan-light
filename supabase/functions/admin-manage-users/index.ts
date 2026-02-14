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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { action, ...payload } = await req.json();

    // lookup_username does NOT require auth (used at login screen)
    if (action === "lookup_username") {
      const { username } = payload;
      if (!username) {
        return new Response(JSON.stringify({ error: "Username is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: profile } = await serviceClient
        .from("profiles")
        .select("user_id")
        .eq("username", username.trim().toLowerCase())
        .maybeSingle();

      if (!profile) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get email from auth
      const { data: authUser } = await serviceClient.auth.admin.getUserById(profile.user_id);
      if (!authUser?.user?.email) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ email: authUser.user.email }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // All other actions require admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: callerUser }, error: userError } = await serviceClient.auth.getUser(token);
    if (userError || !callerUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminUserId = callerUser.id;

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

    if (action === "create_user") {
      const { username, email, password, display_name, father_name, cnic, address } = payload;

      if (!username || !password || !display_name || !father_name) {
        return new Response(
          JSON.stringify({ error: "Username, password, display name, and father name are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const cleanUsername = username.trim().toLowerCase();

      // Check if username already exists
      const { data: existingProfile } = await serviceClient
        .from("profiles")
        .select("id")
        .eq("username", cleanUsername)
        .maybeSingle();

      if (existingProfile) {
        return new Response(JSON.stringify({ error: "Username already taken" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Use provided email or generate one from username
      const authEmail = email?.trim() || `${cleanUsername}@kyc.prayer`;

      let userId: string;

      const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
        email: authEmail,
        password,
        email_confirm: true,
      });

      if (createError) {
        if (createError.message.includes("already been registered")) {
          const { data: authUsers } = await serviceClient.auth.admin.listUsers({ perPage: 1000 });
          const existingUser = authUsers?.users?.find((u) => u.email === authEmail);
          if (!existingUser) {
            return new Response(JSON.stringify({ error: "User exists but could not be found" }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          userId = existingUser.id;
          await serviceClient.auth.admin.updateUserById(userId, { password });
        } else {
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        userId = newUser.user.id;
      }

      await serviceClient
        .from("profiles")
        .upsert(
          {
            user_id: userId,
            username: cleanUsername,
            display_name,
            father_name,
            cnic: cnic || null,
            address: address || null,
          },
          { onConflict: "user_id" }
        );

      await serviceClient
        .from("user_roles")
        .upsert({ user_id: userId, role: "user" }, { onConflict: "user_id,role" });

      return new Response(
        JSON.stringify({ success: true, user_id: userId, username: cleanUsername, password }),
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

      const { data: roles } = await serviceClient.from("user_roles").select("user_id, role");
      const adminIds = new Set((roles || []).filter((r) => r.role === "admin").map((r) => r.user_id));

      const { data: attendance } = await serviceClient
        .from("prayer_attendance")
        .select("*")
        .order("date", { ascending: false });

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
      const { data: attendance } = await serviceClient
        .from("prayer_attendance")
        .select("*");

      const { data: qazaRecords } = await serviceClient
        .from("qaza_records")
        .select("*");

      const { data: roles } = await serviceClient.from("user_roles").select("user_id, role");
      const adminIds = new Set((roles || []).filter((r) => r.role === "admin").map((r) => r.user_id));

      const { data: profiles } = await serviceClient.from("profiles").select("*");
      const userProfiles = (profiles || []).filter((p) => !adminIds.has(p.user_id));

      return new Response(
        JSON.stringify({ attendance: attendance || [], profiles: userProfiles, qaza_records: qazaRecords || [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "reset_all_data") {
      const { error: attErr } = await serviceClient
        .from("prayer_attendance")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (attErr) {
        return new Response(JSON.stringify({ error: "Failed to clear attendance: " + attErr.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: qazaErr } = await serviceClient
        .from("qaza_records")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (qazaErr) {
        return new Response(JSON.stringify({ error: "Failed to clear qaza records: " + qazaErr.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: profileErr } = await serviceClient
        .from("profiles")
        .update({ first_login_at: null })
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (profileErr) {
        return new Response(JSON.stringify({ error: "Failed to reset profiles: " + profileErr.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, message: "All data has been reset successfully" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
