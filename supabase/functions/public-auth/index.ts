import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ message: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ message: "Authentication service is not configured." }, 500);
  }

  try {
    const body = await request.json();
    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    if (body.action === "login-by-usn") {
      const usn = typeof body.usn === "string" ? body.usn.trim().toUpperCase() : "";
      const password = typeof body.password === "string" ? body.password : "";
      if (!/^[A-Z0-9]{4,20}$/.test(usn) || !password) {
        return jsonResponse({ message: "Invalid login credentials." }, 401);
      }

      const { data: student } = await adminClient
        .from("student")
        .select("user_id")
        .eq("usn", usn)
        .maybeSingle();
      if (!student?.user_id) return jsonResponse({ message: "Invalid login credentials." }, 401);

      const { data: profile } = await adminClient
        .from("users")
        .select("email")
        .eq("user_id", student.user_id)
        .maybeSingle();
      if (!profile?.email) return jsonResponse({ message: "Invalid login credentials." }, 401);

      const { data: authData, error } = await authClient.auth.signInWithPassword({
        email: profile.email,
        password,
      });
      if (error || !authData.session) return jsonResponse({ message: "Invalid login credentials." }, 401);

      return jsonResponse({ success: true, session: authData.session });
    }

    if (body.action === "request-password-reset") {
      const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";
      let email = identifier.toLowerCase();

      if (!identifier.includes("@")) {
        const usn = identifier.toUpperCase();
        if (/^[A-Z0-9]{4,20}$/.test(usn)) {
          const { data: student } = await adminClient
            .from("student")
            .select("user_id")
            .eq("usn", usn)
            .maybeSingle();
          if (student?.user_id) {
            const { data: profile } = await adminClient
              .from("users")
              .select("email")
              .eq("user_id", student.user_id)
              .maybeSingle();
            email = profile?.email || "";
          } else {
            email = "";
          }
        } else {
          email = "";
        }
      }

      if (email) {
        await authClient.auth.resetPasswordForEmail(email, {
          ...(typeof body.redirectTo === "string" ? { redirectTo: body.redirectTo } : {}),
        });
      }

      // Use the same response whether or not the account exists.
      return jsonResponse({ success: true });
    }

    return jsonResponse({ message: "Unsupported authentication action." }, 400);
  } catch {
    return jsonResponse({ message: "Authentication request failed." }, 500);
  }
});
