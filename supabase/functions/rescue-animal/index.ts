import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

export default {
  async fetch(req: Request): Promise<Response> {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      const data = await req.json();

      const yesNo = (v: string) => v || "Non précisé";

      const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
</head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #a855f7;">Demande de sauvetage animal</h2>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%;">Adresse exacte</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.address}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Téléphone</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.phone}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Nombre d'animaux</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.animalCount}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Description des animaux</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.animalDetails}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Identifié</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${yesNo(data.identified)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Tempérament</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${yesNo(data.temperament)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Lieu de cachette</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.hidingSpot || "—"}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Mode d'accès</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.accessMode || "—"}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Eau et nourriture</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${yesNo(data.foodWater)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Cage de transport</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${yesNo(data.transportCage)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Récupération après intervention</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${yesNo(data.canRecover)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Famille d'accueil nécessaire</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${yesNo(data.needFoster)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Autres informations</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.additionalInfo || "—"}</td></tr>
  </table>

  <h3 style="color: #a855f7; margin-top: 24px;">Charte d'autorisation</h3>
  <p style="font-size: 13px; color: #555; font-style: italic; background: #f5f5f5; padding: 12px; border-radius: 8px;">
    « Je certifie être autorisé(e) à demander cette intervention et j'autorise les bénévoles à accéder, sans effraction, à l'adresse indiquée afin de rechercher, nourrir, récupérer et transporter mon ou mes animaux vers un lieu sécurisé si nécessaire. Je comprends que l'intervention dépend des conditions de sécurité, des consignes des autorités et qu'aucun résultat ne peut être garanti. »
  </p>
  <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Nom</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.name}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Date</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.date}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Heure</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.time}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Mention</td><td style="padding: 8px; border-bottom: 1px solid #eee;">Bon pour autorisation</td></tr>
  </table>
</body>
</html>`;

      const emailBody: Record<string, unknown> = {
        from: "GirondeEntraide <contact@eliaman.com>",
        to: "contact@eliaman.com",
        subject: `Sauvetage animal - ${data.animalCount} animal(aux) - ${data.address.slice(0, 50)}`,
        html,
      };

      if (data.pdfBase64) {
        emailBody.attachments = [
          {
            filename: `sauvetage-${data.name.replace(/\s+/g, "-").toLowerCase()}-${data.date}.pdf`,
            content: data.pdfBase64,
          },
        ];
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailBody),
      });

      if (!res.ok) {
        const errText = await res.text();
        return new Response(JSON.stringify({ error: errText }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ sent: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: (err as Error).message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  },
};
