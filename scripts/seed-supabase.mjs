import { readFileSync } from "fs";

const env = readFileSync(".env", "utf-8");
const urlMatch = env.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

const url = urlMatch?.[1]?.trim();
const key = keyMatch?.[1]?.trim();

if (!url || !key) {
  console.error("Missing env vars in .env");
  process.exit(1);
}

const mockPosts = [
  {
    type: "offer",
    category: "hebergement",
    title: "Maison avec 2 chambres disponibles",
    description:
      "Famille à La Teste-de-Buch, on peut accueillir 4-5 personnes. Animaux bienvenus.",
    capacity: 5,
    lat: 44.6474,
    lng: -1.1556,
    location_name: "La Teste-de-Buch",
    contact: "0612345678",
    secret_code: "1234",
    status: "active",
  },
  {
    type: "offer",
    category: "animaux",
    title: "Van + box pour chevaux",
    description: "Van 2 chevaux et pré sécurisé à Biganos.",
    capacity: 2,
    lat: 44.6372,
    lng: -0.9497,
    location_name: "Biganos",
    contact: "0687654321",
    secret_code: "4567",
    status: "active",
  },
  {
    type: "offer",
    category: "materiel",
    title: "Point d'eau et ravitaillement",
    description: "Commerce à Gujan-Mestras, distribution gratuite.",
    capacity: 0,
    lat: 44.6286,
    lng: -1.0364,
    location_name: "Gujan-Mestras",
    contact: "0556000000",
    secret_code: "7890",
    status: "active",
  },
  {
    type: "offer",
    category: "transport",
    title: "Covoiturage vers centres d'accueil",
    description: "Berline 5 places, Arcachon vers Bordeaux.",
    capacity: 4,
    lat: 44.6583,
    lng: -1.1732,
    location_name: "Arcachon",
    contact: "0611223344",
    secret_code: "2468",
    status: "active",
  },
  {
    type: "offer",
    category: "hebergement",
    title: "Gîte rural — 8 places",
    description: "Gîte à Belin-Béliet. Idéal familles.",
    capacity: 8,
    lat: 44.5186,
    lng: -0.7836,
    location_name: "Belin-Béliet",
    contact: "0699887766",
    secret_code: "1357",
    status: "active",
  },
  {
    type: "offer",
    category: "animaux",
    title: "Accueil chiens/chats urgents",
    description: "Refuge à Mios, capacité 15 animaux.",
    capacity: 15,
    lat: 44.6181,
    lng: -0.8764,
    location_name: "Mios",
    contact: "0644556677",
    secret_code: "9876",
    status: "active",
  },
  {
    type: "request",
    category: "hebergement",
    title: "Famille de 4 cherche hébergement urgent",
    description: "Évacués de Landiras, 2 enfants. À Hostens.",
    capacity: 4,
    lat: 44.5033,
    lng: -0.6553,
    location_name: "Hostens",
    contact: "0633445566",
    secret_code: "1111",
    status: "active",
  },
  {
    type: "request",
    category: "animaux",
    title: "Transport urgent pour 3 chevaux",
    description: "3 chevaux à Saumos, zone d'évacuation.",
    capacity: 3,
    lat: 44.9936,
    lng: -1.1708,
    location_name: "Saumos",
    contact: "0677889900",
    secret_code: "2222",
    status: "active",
  },
  {
    type: "request",
    category: "transport",
    title: "Personne âgée isolée — besoin transport",
    description: "Mère de 82 ans à Cazalis, mobilité réduite.",
    capacity: 1,
    lat: 44.4667,
    lng: -0.5833,
    location_name: "Cazalis",
    contact: "0655443322",
    secret_code: "3333",
    status: "active",
  },
  {
    type: "request",
    category: "materiel",
    title: "Besoin masques FFP2 et eau potable",
    description: "Campement à Saint-Symphorien, 12 personnes.",
    capacity: 12,
    lat: 44.5333,
    lng: -0.7167,
    location_name: "Saint-Symphorien",
    contact: "0612340000",
    secret_code: "4444",
    status: "active",
  },
  {
    type: "official",
    category: "hebergement",
    title: "Centre d'accueil — Gymnase de La Teste",
    description: "Gymnase 24h/24. Capacité 200 personnes.",
    capacity: 200,
    lat: 44.641,
    lng: -1.15,
    location_name: "La Teste-de-Buch",
    contact: "0800003333",
    secret_code: "0000",
    status: "active",
  },
  {
    type: "official",
    category: "autre",
    title: "Poste de commandement — Pompiers 33",
    description: "PC SDIS 33. Appeler le 18.",
    capacity: 0,
    lat: 44.8378,
    lng: -0.5792,
    location_name: "Bordeaux",
    contact: "18",
    secret_code: "0000",
    status: "active",
  },
  {
    type: "official",
    category: "hebergement",
    title: "Centre d'accueil — Belin-Béliet",
    description: "Salle des fêtes. Capacité 80 personnes.",
    capacity: 80,
    lat: 44.519,
    lng: -0.784,
    location_name: "Belin-Béliet",
    contact: "0556001122",
    secret_code: "0000",
    status: "active",
  },
];

async function main() {
  const res = await fetch(`${url}/rest/v1/posts`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(mockPosts),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Insert error: ${res.status} ${text}`);
    process.exit(1);
  }
  const data = await res.json();
  console.log(`Inserted ${data.length} posts into Supabase`);
}

main();
