import { MapPin, Clock, Users } from 'lucide-react'
import type { Post } from '../types'
import { TYPE_LABELS, TYPE_COLORS, CATEGORY_MAP } from '../types'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}

export default function PostCard({
  post,
  onClick,
}: {
  post: Post
  onClick: () => void
}) {
  const color = TYPE_COLORS[post.type]
  const cat = CATEGORY_MAP[post.category]

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-crisis-card border border-crisis-border rounded-xl p-4 hover:border-gray-600 transition-colors active:scale-[0.98] cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ backgroundColor: color }}
        >
          {cat?.emoji ?? '📍'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded"
              style={{ backgroundColor: `${color}22`, color }}
            >
              {TYPE_LABELS[post.type]}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={12} />
              {timeAgo(post.createdAt)}
            </span>
          </div>

          <h3 className="font-semibold text-white text-sm leading-snug truncate">
            {post.title}
          </h3>

          <p className="text-gray-400 text-xs mt-1 line-clamp-2">
            {post.description}
          </p>

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {post.locationName}
            </span>
            {post.capacity > 0 && (
              <span className="flex items-center gap-1">
                <Users size={12} />
                {post.capacity} {post.type === 'offer' ? 'places' : 'pers.'}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
