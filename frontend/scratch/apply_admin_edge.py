import sys

with open("../supabase/functions/support/index.ts", "r") as f:
    content = f.read()

target1 = """    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );"""

replacement1 = """    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );"""

target2 = """        // Download from storage
        const { data: fileData, error: downloadError } = await supabaseClient
          .storage
          .from('support-attachments')
          .download(path);"""

replacement2 = """        // Download from storage using admin client to bypass RLS (since user only has INSERT policy)
        const { data: fileData, error: downloadError } = await supabaseAdmin
          .storage
          .from('support-attachments')
          .download(path);"""

if target1 in content and target2 in content:
    content = content.replace(target1, replacement1)
    content = content.replace(target2, replacement2)
    with open("../supabase/functions/support/index.ts", "w") as f:
        f.write(content)
    print("Edge Function admin client updated successfully!")
else:
    print("Target not found.")
