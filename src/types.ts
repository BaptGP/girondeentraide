export type PostType = "offer" | "request" | "official" | "volunteer" | "pet";

export type Category =
  | "hebergement"
  | "animaux"
  | "transport"
  | "materiel"
  | "nourriture"
  | "volontaires"
  | "perdu"
  | "trouve"
  | "autre";

export interface Post {
  id: string;
  type: PostType;
  category: Category;
  title: string;
  description: string;
  capacity: number;
  lat: number;
  lng: number;
  locationName: string;
  contact: string;
  secretCode?: string;
  urgent: boolean;
  imageUrl?: string;
  status: "active" | "resolved";
  createdAt: string;
}

export interface CategoryInfo {
  key: Category;
  label: string;
  emoji: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: "hebergement", label: "Hébergement", emoji: "🏠" },
  { key: "animaux", label: "Animaux / Bétail", emoji: "🐴" },
  { key: "transport", label: "Transport", emoji: "🚗" },
  { key: "materiel", label: "Matériel", emoji: "📦" },
  { key: "nourriture", label: "Nourriture / Eau", emoji: "🍞" },
  { key: "volontaires", label: "Volontaires", emoji: "🤝" },
  { key: "autre", label: "Autre", emoji: "❤️" },
];

export const PET_CATEGORIES: CategoryInfo[] = [
  { key: "perdu", label: "Perdu", emoji: "�" },
  { key: "trouve", label: "Trouvé", emoji: "🐾" },
];

export const CATEGORY_MAP: Record<Category, CategoryInfo> = [
  ...CATEGORIES,
  ...PET_CATEGORIES,
].reduce(
  (acc, c) => ({ ...acc, [c.key]: c }),
  {} as Record<Category, CategoryInfo>,
);

export const TYPE_LABELS: Record<PostType, string> = {
  offer: "Offre",
  request: "Demande",
  official: "Point officiel",
  volunteer: "Volontaires",
  pet: "Animal perdu/trouvé",
};

export const TYPE_COLORS: Record<PostType, string> = {
  offer: "#16a34a",
  request: "#dc2626",
  official: "#2563eb",
  volunteer: "#f59e0b",
  pet: "#a855f7",
};

export const TYPE_FILTERS: { key: string; label: string; color: string }[] = [
  { key: "all", label: "Tous", color: "#fafafa" },
  { key: "offer", label: "Offres", color: "#16a34a" },
  { key: "request", label: "Demandes", color: "#dc2626" },
  { key: "volunteer", label: "Volontaires", color: "#f59e0b" },
  { key: "pet", label: "Animaux", color: "#a855f7" },
  { key: "official", label: "Officiels", color: "#2563eb" },
];
