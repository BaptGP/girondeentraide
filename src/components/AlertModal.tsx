import { Bell, Crosshair, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createAlert } from "../lib/supabase";
import type { FilterType } from "../store";
import { TYPE_FILTERS } from "../types";

export default function AlertModal({
  onClose,
  userPos,
}: {
  onClose: () => void;
  userPos: [number, number] | null;
}) {
  const [email, setEmail] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [radius, setRadius] = useState(20);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    if (userPos) {
      setLat(userPos[0]);
      setLng(userPos[1]);
      setLocationName("Ma position");
    }
  }, [userPos]);

  const handleLocate = () => {
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocationName("Ma position");
        setGeoLoading(false);
      },
      () => {
        setError("Impossible de récupérer votre position");
        setGeoLoading(false);
      },
    );
  };

  const canSubmit = email.trim() && lat !== null && lng !== null;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      await createAlert({
        email: email.trim(),
        filterType,
        category: "all",
        lat: lat!,
        lng: lng!,
        radiusKm: radius,
      });
      setSuccess(true);
    } catch {
      setError("Erreur lors de la création de l'alerte");
    }
    setLoading(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/70 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-crisis-surface border-t border-crisis-border rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-crisis-surface pt-3 pb-2 px-4 border-b border-crisis-border z-10">
          <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell size={20} className="text-crisis-red" />
              Alerte email
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-crisis-border text-gray-400"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {success ? (
          <div className="px-4 py-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="text-green-500" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Alerte créée !
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Vous recevrez un email à{" "}
              <span className="text-white">{email}</span> dès qu'une annonce
              correspondante sera publiée dans un rayon de {radius}km.
            </p>
            <button
              onClick={onClose}
              className="bg-crisis-card text-white px-6 py-2.5 rounded-xl font-medium"
            >
              Fermer
            </button>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-4">
            <p className="text-sm text-gray-400">
              Recevez un email dès qu'une annonce correspondante est publiée
              près de vous.
            </p>

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.fr"
                className="w-full bg-crisis-dark border border-crisis-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-crisis-red"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">
                Type d'annonce
              </label>
              <div className="flex flex-wrap gap-2">
                {TYPE_FILTERS.map((tf) => (
                  <button
                    key={tf.key}
                    onClick={() => setFilterType(tf.key as FilterType)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      filterType === tf.key
                        ? "bg-crisis-card text-white border-gray-600"
                        : "text-gray-400 border-crisis-border bg-crisis-dark"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">
                Rayon : {radius}km
              </label>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-crisis-red"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">
                Localisation
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-crisis-dark border border-crisis-border rounded-lg px-4 py-2.5 text-white text-sm">
                  {locationName || "Aucune position"}
                </div>
                <button
                  onClick={handleLocate}
                  disabled={geoLoading}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-crisis-border text-gray-300 text-sm font-medium hover:border-gray-500"
                >
                  <Crosshair size={16} />
                  {geoLoading ? "..." : "Localiser"}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-crisis-red">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              className="w-full bg-crisis-red text-white py-3 rounded-xl font-semibold disabled:opacity-40 hover:brightness-110"
            >
              {loading ? "Création..." : "Créer l'alerte"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
