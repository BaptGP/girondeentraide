export type PostType = 'offer' | 'request' | 'official'

export type Category =
  | 'hebergement'
  | 'animaux'
  | 'transport'
  | 'materiel'
  | 'autre'

export interface Post {
  id: string
  type: PostType
  category: Category
  title: string
  description: string
  capacity: number
  lat: number
  lng: number
  locationName: string
  contact: string
  secretCode: string
  status: 'active' | 'resolved'
  createdAt: string
}

export interface CategoryInfo {
  key: Category
  label: string
  emoji: string
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'hebergement', label: 'Hébergement', emoji: '🏠' },
  { key: 'animaux', label: 'Animaux / Bétail', emoji: '🐴' },
  { key: 'transport', label: 'Transport', emoji: '🚗' },
  { key: 'materiel', label: 'Matériel / Vivres', emoji: '📦' },
  { key: 'autre', label: 'Autre', emoji: '❤️' },
]

export const CATEGORY_MAP: Record<Category, CategoryInfo> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.key]: c }),
  {} as Record<Category, CategoryInfo>
)

export const TYPE_LABELS: Record<PostType, string> = {
  offer: 'Offre',
  request: 'Demande',
  official: 'Point officiel',
}

export const TYPE_COLORS: Record<PostType, string> = {
  offer: '#16a34a',
  request: '#dc2626',
  official: '#2563eb',
}
