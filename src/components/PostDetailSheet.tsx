import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flag,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useStore } from "../store";
import type { Post } from "../types";
import { CATEGORY_MAP, TYPE_COLORS, TYPE_LABELS } from "../types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export default function PostDetailSheet({
  post,
  onClose,
}: {
  post: Post;
  onClose: () => void;
}) {
  const [showManage, setShowManage] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [error, setError] = useState("");
  const resolvePost = useStore((s) => s.resolvePost);
  const deletePost = useStore((s) => s.deletePost);

  const color = TYPE_COLORS[post.type];
  const cat = CATEGORY_MAP[post.category];

  const phoneDigits = post.contact.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${phoneDigits.startsWith("0") ? "33" + phoneDigits.slice(1) : phoneDigits}`;
  const phoneUrl = `tel:${phoneDigits}`;
  const directionsUrl = `https://www.openstreetmap.org/directions?from=&to=${post.lat}%2C${post.lng}`;

  const handleResolve = () => {
    if (codeInput.length !== 4) {
      setError("Code à 4 chiffres requis");
      return;
    }
    const ok = resolvePost(post.id, codeInput);
    if (!ok) {
      setError("Code incorrect");
      return;
    }
    onClose();
  };

  const handleDelete = () => {
    if (codeInput.length !== 4) {
      setError("Code à 4 chiffres requis");
      return;
    }
    const ok = deletePost(post.id, codeInput);
    if (!ok) {
      setError("Code incorrect");
      return;
    }
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-crisis-surface border-t border-crisis-border rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-crisis-surface pt-3 pb-2 px-4 border-b border-crisis-border z-10">
          <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded"
                style={{ backgroundColor: `${color}22`, color }}
              >
                {TYPE_LABELS[post.type]}
              </span>
              {post.urgent && (
                <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded bg-crisis-red/20 text-crisis-red animate-pulse">
                  Urgent
                </span>
              )}
              <span className="text-sm text-gray-400">
                {cat?.emoji} {cat?.label}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-crisis-border text-gray-400"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          <h2 className="text-xl font-bold text-white leading-snug">
            {post.title}
          </h2>

          <p className="text-gray-300 text-sm leading-relaxed">
            {post.description}
          </p>

          <div className="flex flex-wrap gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <MapPin size={16} style={{ color }} />
              {post.locationName}
            </span>
            {post.capacity > 0 && (
              <span className="flex items-center gap-1.5">
                <Users size={16} />
                {post.capacity}{" "}
                {post.type === "offer" ? "places dispo." : "personnes"}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock size={16} />
              {timeAgo(post.createdAt)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <a
              href={phoneUrl}
              className="flex flex-col items-center gap-1.5 bg-crisis-green text-white py-3 rounded-xl font-semibold text-sm hover:brightness-110 active:scale-95 transition-all"
            >
              <Phone size={20} />
              Appeler
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 bg-[#25D366] text-white py-3 rounded-xl font-semibold text-sm hover:brightness-110 active:scale-95 transition-all"
            >
              <MessageCircle size={20} />
              WhatsApp
            </a>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 bg-crisis-blue text-white py-3 rounded-xl font-semibold text-sm hover:brightness-110 active:scale-95 transition-all"
            >
              <Navigation size={20} />
              Itinéraire
            </a>
          </div>

          {/* Manage section */}
          <div className="pt-2 border-t border-crisis-border">
            <div className="flex items-center justify-between">
              {!showManage ? (
                <button
                  onClick={() => setShowManage(true)}
                  className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1.5"
                >
                  <AlertTriangle size={14} />
                  C'est mon annonce — la gérer
                </button>
              ) : (
                <span className="text-xs text-gray-500 flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  Gérer mon annonce
                </span>
              )}
              <a
                href={`mailto:contact@eliaman.com?subject=Signalement%20annonce%20${post.id}&body=Signalement%20de%20l'annonce%20:%20${post.title}%0AID%20:%20${post.id}%0A%0ARaison%20du%20signalement%20:%20`}
                className="text-xs text-gray-500 hover:text-crisis-red flex items-center gap-1.5"
              >
                <Flag size={14} />
                Signaler
              </a>
            </div>
            {showManage && (
              <div className="space-y-3 mt-3">
                <p className="text-xs text-gray-400">
                  Entrez votre code secret à 4 chiffres pour marquer comme
                  résolu ou supprimer :
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(e.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  className="w-full bg-crisis-dark border border-crisis-border rounded-lg px-4 py-2.5 text-white text-center text-lg tracking-widest focus:outline-none focus:border-crisis-red"
                />
                {error && <p className="text-xs text-crisis-red">{error}</p>}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleResolve}
                    className="flex items-center justify-center gap-1.5 bg-crisis-green/20 text-crisis-green border border-crisis-green/40 py-2.5 rounded-lg text-sm font-semibold hover:bg-crisis-green/30"
                  >
                    <CheckCircle2 size={16} />
                    Résolu
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center justify-center gap-1.5 bg-crisis-red/20 text-crisis-red border border-crisis-red/40 py-2.5 rounded-lg text-sm font-semibold hover:bg-crisis-red/30"
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
