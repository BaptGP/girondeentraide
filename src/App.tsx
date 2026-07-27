import {
  AlertCircle,
  Crosshair,
  ExternalLink,
  Flame,
  Info,
  List as ListIcon,
  Mail,
  Map as MapIcon,
  Plus,
  Search,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import AddressSearch from "./components/AddressSearch";
import EmergencyNumbers from "./components/EmergencyNumbers";
import MapContainerView from "./components/MapContainerView";
import NewPostModal from "./components/NewPostModal";
import PostCard from "./components/PostCard";
import PostDetailSheet from "./components/PostDetailSheet";
import type { FilterType } from "./store";
import { getFilteredPosts, useStore } from "./store";
import type { Category } from "./types";
import { CATEGORIES } from "./types";

const TYPE_FILTERS: { key: FilterType; label: string; color: string }[] = [
  { key: "all", label: "Tous", color: "#fafafa" },
  { key: "offer", label: "Offres", color: "#16a34a" },
  { key: "request", label: "Demandes", color: "#dc2626" },
  { key: "volunteer", label: "Volontaires", color: "#f59e0b" },
  { key: "official", label: "Officiels", color: "#2563eb" },
];

export default function App() {
  const viewMode = useStore((s) => s.viewMode);
  const filterType = useStore((s) => s.filterType);
  const filterCategory = useStore((s) => s.filterCategory);
  const searchQuery = useStore((s) => s.searchQuery);
  const sortByUrgent = useStore((s) => s.sortByUrgent);
  const selectedPostId = useStore((s) => s.selectedPostId);
  const isNewPostModalOpen = useStore((s) => s.isNewPostModalOpen);
  const posts = useStore((s) => s.posts);
  const isSynced = useStore((s) => s.isSynced);

  const setViewMode = useStore((s) => s.setViewMode);
  const setFilterType = useStore((s) => s.setFilterType);
  const setFilterCategory = useStore((s) => s.setFilterCategory);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const setSortByUrgent = useStore((s) => s.setSortByUrgent);
  const selectPost = useStore((s) => s.selectPost);
  const openNewPostModal = useStore((s) => s.openNewPostModal);
  const closeNewPostModal = useStore((s) => s.closeNewPostModal);
  const initSupabaseSync = useStore((s) => s.initSupabaseSync);

  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [mapTarget, setMapTarget] = useState<[number, number] | null>(null);
  const [showVigilance, setShowVigilance] = useState(false);
  const [searchPos, setSearchPos] = useState<[number, number] | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(20);
  const prevPostCount = useRef(posts.length);

  useEffect(() => {
    const unsub = initSupabaseSync();
    return unsub;
  }, [initSupabaseSync]);

  // Toast notification on new posts
  useEffect(() => {
    if (posts.length > prevPostCount.current) {
      const newPost = posts[0];
      if (newPost && newPost.id.startsWith("post-")) {
        setToast(`Nouvelle annonce: ${newPost.title}`);
        setTimeout(() => setToast(null), 4000);
      }
    }
    prevPostCount.current = posts.length;
  }, [posts]);

  // Auto-open post from URL ?post=ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("post");
    if (postId && posts.length > 0 && !selectedPostId) {
      const post = posts.find((p) => p.id === postId);
      if (post) {
        selectPost(post.id);
      }
    }
  }, [posts, selectedPostId, selectPost]);

  const filteredPosts = useMemo(
    () =>
      getFilteredPosts({
        posts,
        filterType,
        filterCategory,
        searchQuery,
        sortByUrgent,
      }),
    [posts, filterType, filterCategory, searchQuery, sortByUrgent],
  );

  // Sort by proximity if user position is available
  const sortedPosts = useMemo(() => {
    let result = filteredPosts;
    if (searchPos) {
      result = filteredPosts.filter((p) => {
        const distKm = Math.hypot(
          (p.lat - searchPos[0]) * 111,
          (p.lng - searchPos[1]) *
            111 *
            Math.cos((searchPos[0] * Math.PI) / 180),
        );
        return distKm <= searchRadius;
      });
    }
    if (userPos) {
      return [...result].sort((a, b) => {
        const da = Math.hypot(a.lat - userPos[0], a.lng - userPos[1]);
        const db = Math.hypot(b.lat - userPos[0], b.lng - userPos[1]);
        return da - db;
      });
    }
    if (searchPos) {
      return [...result].sort((a, b) => {
        const da = Math.hypot(a.lat - searchPos[0], a.lng - searchPos[1]);
        const db = Math.hypot(b.lat - searchPos[0], b.lng - searchPos[1]);
        return da - db;
      });
    }
    return result;
  }, [filteredPosts, userPos, searchPos, searchRadius]);

  const selectedPost = useMemo(
    () => posts.find((p) => p.id === selectedPostId) || null,
    [posts, selectedPostId],
  );

  // Count posts per type for badges
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: 0,
      offer: 0,
      request: 0,
      volunteer: 0,
      official: 0,
    };
    for (const p of posts) {
      if (p.status === "resolved") continue;
      counts.all++;
      counts[p.type]++;
    }
    return counts;
  }, [posts]);

  const handleLocate = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleAddressSelect = (lat: number, lng: number, label: string) => {
    setSearchPos([lat, lng]);
    setMapTarget([lat, lng]);
    setViewMode("map");
    setToast(`📍 ${label.slice(0, 50)}`);
    setTimeout(() => setToast(null), 4000);
  };

  const clearSearchPos = () => {
    setSearchPos(null);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-crisis-dark overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-crisis-surface border-b border-crisis-border z-20">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Flame size={22} className="text-crisis-red" />
            <div>
              <h1 className="text-base font-bold text-white leading-none flex items-center gap-1.5">
                GirondeEntraide
                {isSynced ? (
                  <Wifi size={12} className="text-crisis-green" />
                ) : (
                  <WifiOff size={12} className="text-gray-600" />
                )}
              </h1>
              <p className="text-[10px] text-gray-500 leading-none mt-0.5">
                Entraide d'urgence 33
              </p>
            </div>
          </div>

          {/* Fire map link */}
          <a
            href="https://feux.fixvault.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-950/50 border border-orange-800/50 text-orange-400 text-xs font-medium hover:bg-orange-900/40 transition-colors"
          >
            <Flame size={14} />
            <span>Feux en direct</span>
            <ExternalLink size={10} />
          </a>

          {/* View toggle */}
          <div className="flex bg-crisis-dark rounded-lg p-0.5 border border-crisis-border">
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "map"
                  ? "bg-crisis-red text-white"
                  : "text-gray-400"
              }`}
            >
              <MapIcon size={14} />
              Carte
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-crisis-red text-white"
                  : "text-gray-400"
              }`}
            >
              <ListIcon size={14} />
              Liste
            </button>
          </div>
        </div>

        {/* Search bar — annonces + adresse */}
        <div className="flex gap-2 px-4 pb-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Filtrer annonces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filtrer les annonces par texte"
              className="w-full bg-crisis-dark border border-crisis-border rounded-lg pl-9 pr-9 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-crisis-red"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <AddressSearch onSelect={handleAddressSelect} />
        </div>

        {/* Radius filter */}
        {searchPos && (
          <div className="flex items-center gap-2 px-4 pb-2">
            <span className="text-xs text-gray-500 flex-shrink-0">
              Dans un rayon de :
            </span>
            {[5, 10, 20, 50, 100].map((km) => (
              <button
                key={km}
                onClick={() => setSearchRadius(km)}
                className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all ${
                  searchRadius === km
                    ? "bg-crisis-blue text-white border-crisis-blue"
                    : "text-gray-400 border-crisis-border bg-crisis-dark"
                }`}
              >
                {km} km
              </button>
            ))}
            <button
              onClick={clearSearchPos}
              className="flex-shrink-0 ml-auto text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
            >
              <X size={12} />
              Effacer
            </button>
          </div>
        )}

        {/* Type filters */}
        <div className="flex gap-1.5 px-4 pb-2 overflow-x-auto scrollbar-hide">
          {TYPE_FILTERS.map((tf) => (
            <button
              key={tf.key}
              onClick={() => setFilterType(tf.key)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                filterType === tf.key
                  ? "text-white"
                  : "text-gray-400 border-crisis-border bg-crisis-dark"
              }`}
              style={
                filterType === tf.key
                  ? {
                      backgroundColor: tf.color,
                      borderColor: tf.color,
                      color: tf.key === "all" ? "#0a0a0a" : "#fff",
                    }
                  : {}
              }
            >
              {tf.label}
              <span
                className={`ml-1.5 text-[10px] ${
                  filterType === tf.key ? "opacity-80" : "text-gray-600"
                }`}
              >
                {typeCounts[tf.key] || 0}
              </span>
            </button>
          ))}
          <button
            onClick={() => setSortByUrgent(!sortByUrgent)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 ${
              sortByUrgent
                ? "bg-crisis-red text-white border-crisis-red"
                : "text-gray-400 border-crisis-border bg-crisis-dark"
            }`}
          >
            <AlertCircle size={12} />
            Urgents d'abord
          </button>
        </div>

        {/* Category filters */}
        <div className="flex gap-1.5 px-4 pb-2.5 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setFilterCategory("all")}
            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              filterCategory === "all"
                ? "bg-crisis-card text-white border-gray-600"
                : "text-gray-500 border-crisis-border bg-crisis-dark"
            }`}
          >
            Toutes catégories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilterCategory(cat.key as Category | "all")}
              className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                filterCategory === cat.key
                  ? "bg-crisis-card text-white border-gray-600"
                  : "text-gray-500 border-crisis-border bg-crisis-dark"
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative overflow-hidden">
        {viewMode === "map" ? (
          <MapContainerView
            posts={filteredPosts}
            selectedPostId={selectedPostId}
            onSelectPost={selectPost}
            userPos={userPos}
            mapTarget={mapTarget}
          />
        ) : (
          <div className="h-full overflow-y-auto px-4 py-3 space-y-2.5">
            {sortedPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                <Search size={32} />
                <p className="text-sm">Aucune annonce trouvée</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-500">
                    {sortedPosts.length} annonce
                    {sortedPosts.length > 1 ? "s" : ""}
                    {userPos && " \u00b7 triées par proximité"}
                  </p>
                  {!userPos && (
                    <button
                      onClick={handleLocate}
                      className="flex items-center gap-1 text-xs text-crisis-blue"
                    >
                      <Crosshair size={12} />
                      Trier par proximité
                    </button>
                  )}
                </div>
                {sortedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onClick={() => selectPost(post.id)}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {/* Locate button (map mode) */}
        {viewMode === "map" && (
          <button
            onClick={handleLocate}
            aria-label="Me localiser"
            className="absolute bottom-24 right-5 z-30 w-11 h-11 bg-crisis-surface border border-crisis-border rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:border-gray-500 shadow-lg active:scale-95 transition-all"
            title="Ma position"
          >
            <Crosshair size={20} />
          </button>
        )}

        {/* Toast notification */}
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-crisis-green text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium animate-slide-up max-w-[90%] truncate">
            {toast}
          </div>
        )}

        {/* SOS Emergency numbers */}
        <EmergencyNumbers />

        {/* FAB */}
        <button
          onClick={openNewPostModal}
          aria-label="Créer une nouvelle annonce"
          className="absolute bottom-5 right-5 z-30 flex items-center gap-2 bg-crisis-red text-white pl-4 pr-5 py-3.5 rounded-full font-semibold shadow-lg shadow-crisis-red/30 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus size={22} />
          <span className="text-sm">Proposer / Demander</span>
        </button>
      </main>

      {/* Modals */}
      {selectedPost && (
        <PostDetailSheet post={selectedPost} onClose={() => selectPost(null)} />
      )}
      {isNewPostModalOpen && <NewPostModal onClose={closeNewPostModal} />}

      {/* Footer */}
      <footer className="flex-shrink-0 bg-crisis-surface border-t border-crisis-border px-4 py-2 flex items-center justify-between gap-2">
        <a
          href="mailto:contact@eliaman.com"
          className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-300"
        >
          <Mail size={12} />
          <span className="hidden sm:inline">contact@eliaman.com</span>
        </a>
        <button
          onClick={() => setShowVigilance(true)}
          className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-300"
        >
          <Info size={12} />
          Vigilance
        </button>
        <a
          href="https://feux.fixvault.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[11px] text-orange-400 hover:text-orange-300"
        >
          <Flame size={12} />
          <span>Feux</span>
        </a>
        <span className="text-[11px] text-gray-600">Eliaman</span>
      </footer>

      {/* Vigilance sheet */}
      {showVigilance && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 animate-fade-in"
            onClick={() => setShowVigilance(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-crisis-surface border-t border-crisis-border rounded-t-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-crisis-surface pt-3 pb-2 px-4 border-b border-crisis-border z-10">
              <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Info size={20} className="text-crisis-red" />
                  Vigilance & responsabilités
                </h2>
                <button
                  onClick={() => setShowVigilance(false)}
                  className="p-1.5 rounded-lg hover:bg-crisis-border text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="px-4 py-4 space-y-3 text-sm text-gray-300 leading-relaxed">
              <p>
                GirondeEntraide est une plateforme de mise en relation
                indépendante et non commerciale. Les annonces sont publiées par
                les utilisateurs sous leur propre responsabilité.
              </p>
              <p className="text-white font-medium">À retenir :</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-crisis-red mt-0.5">•</span>
                  Aucune transaction financière ne doit s'effectuer via ce site
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-crisis-red mt-0.5">•</span>
                  Ne partagez jamais d'informations bancaires
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-crisis-red mt-0.5">•</span>
                  Privilégiez les échanges en personne dans des lieux sûrs
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-crisis-red mt-0.5">•</span>
                  Vérifiez l'identité de votre interlocuteur
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-crisis-red mt-0.5">•</span>
                  En cas d'urgence, appelez le 18 ou le 112
                </li>
              </ul>
              <p className="text-xs text-gray-500 pt-2 border-t border-crisis-border">
                Le site et son développeur ne sauraient être tenus responsables
                des interactions entre utilisateurs ou des informations publiées
                sur la plateforme.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
