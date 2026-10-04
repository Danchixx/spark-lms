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
    const body = await req.json();
    const { action } = body;

    // ─── DELETE USER ───────────────────────────────────────────────
    if (action === "delete") {
      const { userId } = body;

      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Missing userId for deletion" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Step 1: Verify the user exists in auth before attempting deletion
      const { data: authUser, error: fetchError } = await supabaseClient.auth.admin.getUserById(userId);
      
      if (fetchError || !authUser?.user) {
        // Auth user doesn't exist — still allow LMS table cleanup
        // Delete from public.users directly (in case the auth record was already removed)
        const { error: dbDeleteError } = await supabaseClient
          .from("users")
          .delete()
          .eq("id", userId);

        if (dbDeleteError) {
          return new Response(
            JSON.stringify({ error: `Database cleanup failed: ${dbDeleteError.message}` }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }

        return new Response(
          JSON.stringify({ success: true, message: "User deleted from database (auth user was already missing)" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      // Step 2: Delete from auth.users — CASCADE will clean public.users and all related tables
      const { error: authDeleteError } = await supabaseClient.auth.admin.deleteUser(userId);

      if (authDeleteError) {
        return new Response(
          JSON.stringify({ error: `Auth deletion failed: ${authDeleteError.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "User permanently deleted from Auth and database" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ─── RESET PASSWORD ────────────────────────────────────────────
    if (action === "reset_password") {
      const { userId, newPassword } = body;

      if (!userId || !newPassword) {
        return new Response(
          JSON.stringify({ error: "Missing userId or newPassword for reset" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      const { error } = await supabaseClient.auth.admin.updateUserById(userId, {
        password: newPassword
      });

      if (error) {
        return new Response(
          JSON.stringify({ error: `Failed to reset password: ${error.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Password reset successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ─── CREATE USER (existing logic) ──────────────────────────────
    const { email, password, sendEmail, name } = body;

    // Use `email` as `to` if `to` is not provided, since existing workflow uses `email`
    const to = body.to || email;

    if (!to || !password) {
      throw new Error("Missing email or password");
    }

    // Create the user in Auth
    const { data: user, error } = await supabaseClient.auth.admin.createUser({
      email: to,
      password: password,
      email_confirm: true, // Auto-confirm since it's created by an admin
    });

    if (error) {
      throw error;
    }

    // Send email via Resend if requested and RESEND_API_KEY is available
    if (sendEmail) {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (!resendApiKey) {
        throw new Error("RESEND_API_KEY is missing in environment variables");
      }

      const emailContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Spark CPD, ${name || "User"}!</h2>
          <p>An account has been created for you on the Spark CPD LMS platform.</p>
          <p>Here are your login credentials:</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${to}</p>
            <p style="margin: 0;"><strong>Password:</strong> ${password}</p>
          </div>
          <p>You can use these credentials to log in to the Spark CPD LMS.</p>
          <p><strong>Security Reminder:</strong> Please log in and change your password as soon as possible to keep your account secure.</p>
          <p>Best regards,<br>The Spark CPD Team</p>
        </div>
      `;

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: to,
          subject: "Your Spark CPD Account",
          html: emailContent,
        }),
      });

      if (!resendResponse.ok) {
        const resendData = await resendResponse.json().catch(() => ({}));
        console.error("Resend API error:", resendData);
        // Do not throw here, otherwise the Auth user is orphaned.
        // We gracefully fail the email but succeed the user creation.
        return new Response(JSON.stringify({ 
          user: user.user, 
          emailStatus: "failed", 
          emailError: `Failed to send email via Resend: ${resendResponse.statusText}` 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    // Do NOT return the password
    return new Response(JSON.stringify({ user: user.user }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
