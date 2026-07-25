import {
  AlertCircle,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Crosshair,
  Heart,
  Loader2,
  Lock,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import type { Category, PostType } from "../types";
import { CATEGORIES } from "../types";

type Step = 1 | 2 | 3;

function generateCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export default function NewPostModal({ onClose }: { onClose: () => void }) {
  const addPost = useStore((s) => s.addPost);

  const [step, setStep] = useState<Step>(1);
  const [type, setType] = useState<PostType | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(0);
  const [contact, setContact] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationName, setLocationName] = useState("");
  const [secretCode, setSecretCode] = useState(generateCode());
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Address search state
  const [addrQuery, setAddrQuery] = useState("");
  const [addrResults, setAddrResults] = useState<
    Array<{ display_name: string; lat: number; lon: number }>
  >([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrOpen, setAddrOpen] = useState(false);
  const addrDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addrContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (addrDebounce.current) clearTimeout(addrDebounce.current);
    if (addrQuery.trim().length < 3) {
      setAddrResults([]);
      return;
    }
    setAddrLoading(true);
    addrDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addrQuery)}&limit=5&countrycodes=fr`,
        );
        const data = await res.json();
        setAddrResults(data);
      } catch {
        setAddrResults([]);
      } finally {
        setAddrLoading(false);
      }
    }, 400);
    return () => {
      if (addrDebounce.current) clearTimeout(addrDebounce.current);
    };
  }, [addrQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        addrContainerRef.current &&
        !addrContainerRef.current.contains(e.target as Node)
      ) {
        setAddrOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddressSelect = (r: {
    display_name: string;
    lat: number;
    lon: number;
  }) => {
    setLat(r.lat);
    setLng(r.lon);
    setLocationName(r.display_name.split(",").slice(0, 3).join(", "));
    setAddrQuery("");
    setAddrResults([]);
    setAddrOpen(false);
  };

  const handleGeolocate = () => {
    setGeoLoading(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocationName(
          `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        );
        setGeoLoading(false);
      },
      (err) => {
        setGeoError(err.message);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const canSubmit =
    type &&
    category &&
    title.trim() &&
    contact.trim() &&
    lat !== null &&
    lng !== null;

  const handleSubmit = () => {
    if (!canSubmit) return;
    addPost({
      type: type!,
      category: category!,
      title: title.trim(),
      description: description.trim(),
      capacity,
      lat: lat!,
      lng: lng!,
      locationName: locationName || "Localisation non précisée",
      contact: contact.trim(),
      secretCode,
    });
    setSubmitted(true);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(secretCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const typeOptions = [
    {
      value: "offer" as PostType,
      label: "J'propose de l'aide",
      icon: Heart,
      color: "#16a34a",
    },
    {
      value: "request" as PostType,
      label: "Je demande de l'aide",
      icon: AlertCircle,
      color: "#dc2626",
    },
    {
      value: "official" as PostType,
      label: "Point officiel",
      icon: Building2,
      color: "#2563eb",
    },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/70 animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-crisis-surface border-t border-crisis-border rounded-t-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-crisis-surface pt-3 pb-2 px-4 border-b border-crisis-border z-10">
          <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              {submitted ? "Annonce publiée" : "Proposer / Demander"}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-crisis-border text-gray-400"
            >
              <X size={20} />
            </button>
          </div>
          {!submitted && (
            <div className="flex items-center gap-1.5 mt-3">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    s <= step ? "bg-crisis-red" : "bg-crisis-border"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-4">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-crisis-green/20 flex items-center justify-center mx-auto">
                <Check size={32} className="text-crisis-green" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  C'est en ligne !
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Votre annonce est visible sur la carte et dans la liste.
                </p>
              </div>
              <div className="bg-crisis-dark border border-crisis-border rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Lock size={16} />
                  Votre code secret
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold tracking-widest text-white">
                    {secretCode}
                  </span>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1.5 text-xs text-crisis-blue hover:text-blue-400"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copié" : "Copier"}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Notez ce code. Il vous permettra de marquer votre annonce
                  comme résolue ou de la supprimer.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-crisis-red text-white py-3 rounded-xl font-semibold hover:brightness-110"
              >
                Fermer
              </button>
            </div>
          ) : (
            <>
              {/* Step 1: Type */}
              {step === 1 && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400 mb-3">
                    Que souhaitez-vous faire ?
                  </p>
                  {typeOptions.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setType(opt.value);
                          setStep(2);
                        }}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
                          type === opt.value
                            ? "border-current"
                            : "border-crisis-border hover:border-gray-600"
                        }`}
                        style={type === opt.value ? { color: opt.color } : {}}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${opt.color}22` }}
                        >
                          <Icon size={20} style={{ color: opt.color }} />
                        </div>
                        <span className="font-semibold text-white flex-1 text-left">
                          {opt.label}
                        </span>
                        <ChevronRight size={20} className="text-gray-500" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Step 2: Category + Location */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-3">Catégorie</p>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.key}
                          onClick={() => setCategory(cat.key)}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            category === cat.key
                              ? "border-crisis-red bg-crisis-red/10"
                              : "border-crisis-border hover:border-gray-600"
                          }`}
                        >
                          <span className="text-xl">{cat.emoji}</span>
                          <span className="text-sm font-medium text-white text-left">
                            {cat.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-sm text-gray-400 mb-3">Localisation</p>
                    <button
                      onClick={handleGeolocate}
                      disabled={geoLoading}
                      className="w-full flex items-center justify-center gap-2 bg-crisis-blue text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:brightness-110"
                    >
                      <Crosshair
                        size={20}
                        className={geoLoading ? "animate-spin" : ""}
                      />
                      {geoLoading
                        ? "Localisation..."
                        : "Me localiser automatiquement"}
                    </button>
                    {geoError && (
                      <p className="text-xs text-crisis-red mt-2">{geoError}</p>
                    )}

                    {/* Address search */}
                    <div ref={addrContainerRef} className="relative mt-2">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                      <input
                        type="text"
                        placeholder="Ou recherchez une adresse..."
                        value={addrQuery}
                        onChange={(e) => {
                          setAddrQuery(e.target.value);
                          setAddrOpen(true);
                        }}
                        onFocus={() => setAddrOpen(true)}
                        className="w-full bg-crisis-dark border border-crisis-border rounded-lg pl-9 pr-9 py-2.5 text-white text-sm focus:outline-none focus:border-crisis-blue"
                      />
                      {addrLoading && (
                        <Loader2
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-crisis-blue animate-spin"
                        />
                      )}
                      {addrOpen && addrResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-crisis-surface border border-crisis-border rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                          {addrResults.map((r, i) => (
                            <button
                              key={i}
                              onClick={() => handleAddressSelect(r)}
                              className="w-full flex items-start gap-2 px-3 py-2.5 text-left hover:bg-crisis-dark transition-colors border-b border-crisis-border last:border-0"
                            >
                              <MapPin
                                size={14}
                                className="text-crisis-blue mt-0.5 flex-shrink-0"
                              />
                              <span className="text-xs text-gray-300 line-clamp-2">
                                {r.display_name}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {lat !== null && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-crisis-green">
                        <MapPin size={16} />
                        <span className="truncate">{locationName}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-crisis-border text-gray-300 text-sm font-medium"
                    >
                      <ChevronLeft size={18} />
                      Retour
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!category || lat === null}
                      className="flex-1 flex items-center justify-center gap-1 bg-crisis-red text-white py-2.5 rounded-xl font-semibold disabled:opacity-40"
                    >
                      Continuer
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Details */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">
                      Titre court *
                    </label>
                    <input
                      type="text"
                      maxLength={80}
                      placeholder="ex: Maison avec 2 chambres disponibles"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-crisis-dark border border-crisis-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-crisis-red"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">
                      Description
                    </label>
                    <textarea
                      maxLength={500}
                      rows={3}
                      placeholder="Détails importants : conditions, disponibilités..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-crisis-dark border border-crisis-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-crisis-red resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">
                        {type === "offer"
                          ? "Places / Capacité"
                          : "Nb personnes"}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={capacity || ""}
                        onChange={(e) =>
                          setCapacity(parseInt(e.target.value) || 0)
                        }
                        placeholder="0"
                        className="w-full bg-crisis-dark border border-crisis-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-crisis-red"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        placeholder="06 12 34 56 78"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        className="w-full bg-crisis-dark border border-crisis-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-crisis-red"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">
                      Code secret (4 chiffres)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={secretCode}
                        onChange={(e) =>
                          setSecretCode(
                            e.target.value.replace(/\D/g, "").slice(0, 4),
                          )
                        }
                        className="w-24 bg-crisis-dark border border-crisis-border rounded-lg px-4 py-2.5 text-white text-center text-lg tracking-widest focus:outline-none focus:border-crisis-red"
                      />
                      <span className="text-xs text-gray-500">
                        Pour gérer votre annonce plus tard
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setStep(2)}
                      className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-crisis-border text-gray-300 text-sm font-medium"
                    >
                      <ChevronLeft size={18} />
                      Retour
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className="flex-1 bg-crisis-green text-white py-2.5 rounded-xl font-semibold disabled:opacity-40 hover:brightness-110"
                    >
                      Publier
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
