import { Flame, Mail } from "lucide-react";
import { useState } from "react";
import ClosureBanner from "./components/ClosureBanner";
import MapContainerView from "./components/MapContainerView";
import PrivacyPolicy from "./components/PrivacyPolicy";

// Vue affichée lorsque le site est en mode "Archivé permanent"
// (variable d'environnement VITE_ARCHIVED="true").
// La page d'accueil n'affiche que le message de remerciement/fermeture,
// sans récupérer ni afficher d'annonces.
export default function ArchivedView() {
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="fixed inset-0 flex flex-col bg-crisis-dark overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-crisis-surface border-b border-crisis-border z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Flame size={22} className="text-crisis-red" />
            <div>
              <h1 className="text-base font-bold text-white leading-none">
                GirondeEntraide
              </h1>
              <p className="text-[10px] text-gray-500 leading-none mt-0.5">
                Entraide d'urgence 33 · Archivé
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content — message d'archivage permanent */}
      <main className="flex-1 relative overflow-hidden">
        {/* Carte en fond : assombrie & floutée, non interactive */}
        <div className="absolute inset-0 scale-110 blur-[3px] pointer-events-none select-none">
          <MapContainerView
            posts={[]}
            selectedPostId={null}
            onSelectPost={() => {}}
            userPos={null}
            mapTarget={null}
          />
        </div>
        {/* Voile d'assombrissement */}
        <div className="absolute inset-0 bg-crisis-dark/75 pointer-events-none" />

        {/* Message par-dessus */}
        <div className="relative z-10 h-full">
          <ClosureBanner />
        </div>
      </main>

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
          onClick={() => setShowPrivacy(true)}
          className="text-[11px] text-gray-500 hover:text-gray-300"
        >
          Confidentialité
        </button>
        <a
          href="https://www.eliaman.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-gray-600 hover:text-gray-400"
        >
          Eliaman
        </a>
      </footer>

      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
    </div>
  );
}
