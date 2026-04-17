// @ts-ignore - Antigravity TS Server doesn't support JSR imports natively
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore - Antigravity TS Server doesn't support JSR imports natively
import { createClient } from "jsr:@supabase/supabase-js@2";

// Declare Deno locally to stop the Antigravity TypeScript server from throwing errors
declare const Deno: any;


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get request body
    const { email, password, sendEmail } = await req.json();

    if (!email || !password) {
      throw new Error("Missing email or password");
    }

    // Create the user in Auth
    const { data: user, error } = await supabaseClient.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm since it's created by an admin
      // sendEmail logic could be handled via Supabase custom emails, but usually admin.createUser doesn't explicitly send an invite unless generateLink is used.
      // If generateLink is needed for invites:
      // const { data: inviteLink } = await supabaseClient.auth.admin.generateLink({ type: 'invite', email })
      // For now, we stick to direct creation.
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ user: user.user }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
