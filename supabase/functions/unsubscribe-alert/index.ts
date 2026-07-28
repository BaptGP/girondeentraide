import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return new Response("Email manquant", { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    await supabase.from("alerts").delete().eq("email", email);

    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; text-align: center;">
        <h2 style="color: #16a34a;">Désabonnement confirmé</h2>
        <p>Vous ne recevrez plus d'alertes email de GirondeEntraide.</p>
        <a href="https://www.girondeentraide.fr" style="display: inline-block; margin-top: 20px; color: #dc2626; text-decoration: none; font-weight: bold;">Retour au site</a>
      </div>
    `;

    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  },
};
