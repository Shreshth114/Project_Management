import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: unknown, status: number) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ success: false, message: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ success: false, message: "Registration service is not configured." }, 500);
  }

  let authUserId: string | null = null;
  let adminClient: ReturnType<typeof createClient> | null = null;

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const requestedRole = typeof body.role === "string" ? body.role.toUpperCase() : "";
    const role = requestedRole === "FACULTY" ? "TEACHER" : requestedRole;

    if (!email.endsWith("@msrit.edu") || !name || password.length < 6) {
      return jsonResponse({ success: false, message: "Enter a name, valid institutional email, and password of at least 6 characters." }, 400);
    }
    if (role !== "STUDENT" && role !== "TEACHER") {
      return jsonResponse({ success: false, message: "This registration role is not permitted." }, 400);
    }

    const subjectCode = String(body.subjectCode || body.subject || "").trim();
    const usn = String(body.usn || "").trim().toUpperCase();
    const teamCode = String(body.groupName || (usn ? `GROUP-${usn.slice(-3)}` : "")).trim().toUpperCase();
    const guideId = Number(body.guideId);

    if (role === "STUDENT" && (!usn || !subjectCode || !teamCode || !Number.isInteger(guideId) || guideId <= 0)) {
      return jsonResponse({ success: false, message: "Select a subject and faculty guide, and provide the student and team details." }, 400);
    }
    if (role === "TEACHER" && !subjectCode) {
      return jsonResponse({ success: false, message: "Select a subject before registering faculty." }, 400);
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const origin = request.headers.get("origin");
    const emailRedirectTo = origin ? new URL("/pms/", origin).toString() : undefined;
    const { data: authData, error: authError } = await authClient.auth.signUp({
      email,
      password,
      options: {
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
        data: { name, role, ...(role === "STUDENT" ? { usn } : {}) },
      },
    });

    if (authError) {
      return jsonResponse({ success: false, message: "Registration could not be completed. Check the details or contact the administrator." }, 400);
    }
    if (!authData.user || authData.user.identities?.length === 0) {
      return jsonResponse({ success: false, message: "Registration could not be completed. Check the details or contact the administrator." }, 400);
    }
    authUserId = authData.user.id;

    const { error: profileError } = await adminClient.rpc("register_app_profile", {
      p_auth_id: authUserId,
      p_email: email,
      p_role: role,
      p_name: name,
      p_usn: role === "STUDENT" ? usn : null,
      p_subject_code: subjectCode,
      p_guide_id: role === "STUDENT" ? guideId : null,
      p_team_code: role === "STUDENT" ? teamCode : null,
    });

    if (profileError) {
      console.error("register_app_profile RPC failed", {
        code: profileError.code,
        message: profileError.message,
      });
      await adminClient.auth.admin.deleteUser(authUserId);
      authUserId = null;
      return jsonResponse({ success: false, message: profileError.message }, 400);
    }

    return jsonResponse({
      success: true,
      requiresEmailConfirmation: !authData.session,
    }, 201);
  } catch {
    if (authUserId && adminClient) {
      await adminClient.auth.admin.deleteUser(authUserId);
    }
    return jsonResponse({ success: false, message: "Registration failed. Please retry or contact the administrator." }, 500);
  }
});
