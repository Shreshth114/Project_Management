import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Environment variables will be fetched inside the handler

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    const brevoSenderEmail = Deno.env.get("BREVO_SENDER_EMAIL") || "support@projectmanagement.com";
    const supportEmail = Deno.env.get("SUPPORT_EMAIL") || "projectmanagement.auth@gmail.com";

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { issueType, subject, description, role, attachments } = await req.json();

    if (!issueType || !subject || !description) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!brevoApiKey) {
      return new Response(
        JSON.stringify({ error: "Email service (Brevo) not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const brevoAttachments = [];
    
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      for (const path of attachments) {
        // Download from storage using admin client to bypass RLS (since user only has INSERT policy)
        const { data: fileData, error: downloadError } = await supabaseAdmin
          .storage
          .from('support-attachments')
          .download(path);
          
        if (downloadError) {
          console.error(`Failed to download ${path} from storage:`, downloadError);
          return new Response(JSON.stringify({ error: `Failed to retrieve attachment ${path} from storage` }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }
        
        if (fileData) {
          try {
            const arrayBuffer = await fileData.arrayBuffer();
            const base64Data = encode(new Uint8Array(arrayBuffer));
            const fileName = path.split('/').pop() || 'attachment';
            
            brevoAttachments.push({
              name: fileName,
              content: base64Data
            });
          } catch (e) {
            console.error("Base64 encode error for", path, e);
            return new Response(JSON.stringify({ error: `Failed to encode attachment ${path}` }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            });
          }
        }
      }
    }

    const htmlBody = `
      <h3>PMS SUPPORT REPORT</h3>
      <hr />
      <p><strong>Reporter:</strong> ${user.email}</p>
      <p><strong>Role:</strong> ${role || 'Unknown'}</p>
      <p><strong>Issue Type:</strong> ${issueType}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Reported At:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
      <hr />
      <h4>Description:</h4>
      <p>${description.replace(/\n/g, '<br />')}</p>
      <hr />
      <p><em>Portal: Project Management System</em></p>
    `;

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "PMS Support", email: brevoSenderEmail },
        to: [{ email: supportEmail }],
        subject: `[PMS Support] ${issueType}: ${subject}`,
        htmlContent: htmlBody,
        ...(brevoAttachments.length > 0 && { attachment: brevoAttachments })
      }),
    });

    const resData = await res.json();

    if (res.ok) {
      return new Response(JSON.stringify({ success: true, data: resData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      // Log Brevo error server-side for debugging
      console.error("Brevo API Error:", resData);
      return new Response(JSON.stringify({ error: "Failed to send email", details: resData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
  } catch (err) {
    console.error("Edge Function Exception:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
