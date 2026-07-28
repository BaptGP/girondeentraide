import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const haversineKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default {
  async fetch(req: Request): Promise<Response> {
    try {
      const { record } = await req.json();
      const post = record;

      if (!post || post.status !== "active") {
        return new Response("OK", { status: 200 });
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      const { data: alerts } = await supabase
        .from("alerts")
        .select("email,filter_type,category,lat,lng,radius_km");

      if (!alerts || alerts.length === 0) {
        return new Response("OK", { status: 200 });
      }

      const matched = alerts.filter((alert: any) => {
        if (alert.filter_type !== "all" && alert.filter_type !== post.type) {
          return false;
        }
        if (
          alert.category &&
          post.category &&
          alert.category !== post.category
        ) {
          if (alert.category === "perdu" && post.category === "trouve") {
            // match: perdu alert matches trouvé posts
          } else if (alert.category === "trouve" && post.category === "perdu") {
            // match: trouvé alert matches perdu posts
          } else {
            return false;
          }
        }
        const dist = haversineKm(alert.lat, alert.lng, post.lat, post.lng);
        return dist <= alert.radius_km;
      });

      if (matched.length === 0) {
        return new Response("OK", { status: 200 });
      }

      const postUrl = "https://www.girondeentraide.fr";
      const typeLabel: Record<string, string> = {
        offer: "Offre",
        request: "Demande",
        volunteer: "Volontaire",
        pet: "Animal perdu/trouvé",
        official: "Point officiel",
      };

      const emails = [...new Set(matched.map((a: any) => a.email))];

      const sendPromises = emails.map((email: string) => {
        return fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "GirondeEntraide <contact@eliaman.com>",
            to: email,
            subject: `Nouvelle annonce près de vous : ${post.title}`,
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #dc2626;">Nouvelle annonce près de vous</h2>
                <p><strong>Type :</strong> ${typeLabel[post.type] || post.type}</p>
                <p><strong>Titre :</strong> ${post.title}</p>
                <p><strong>Description :</strong> ${post.description || "—"}</p>
                <p><strong>Localisation :</strong> ${post.location_name || "—"}</p>
                ${post.urgent ? '<p style="color: #dc2626; font-weight: bold;">⚠️ Annonce urgente</p>' : ""}
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p>Pour voir cette annonce et contacter la personne, rendez-vous sur GirondeEntraide :</p>
                <a href="${postUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Voir l'annonce</a>
                <p style="color: #999; font-size: 12px; margin-top: 20px;">
                  Vous recevez cet email car vous avez créé une alerte sur GirondeEntraide.<br />
                  <a href="https://dxmdnjmgffvyjeirgaae.functions.supabase.co/unsubscribe-alert?email=${encodeURIComponent(email)}" style="color: #999;">Se désabonner</a>
                </p>
              </div>
            `,
          }),
        });
      });

      await Promise.all(sendPromises);

      return new Response(JSON.stringify({ sent: emails.length }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: (err as Error).message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
