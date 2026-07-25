import { Loader2, MapPin, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AddressResult {
  display_name: string;
  lat: number;
  lon: number;
  type: string;
  importance: number;
}

interface AddressSearchProps {
  onSelect: (lat: number, lng: number, label: string) => void;
}

export default function AddressSearch({ onSelect }: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query,
          )}&limit=5&countrycodes=fr`,
          {
            headers: {
              Accept: "application/json",
            },
          },
        );
        if (!res.ok) {
          setResults([]);
          return;
        }
        const data: AddressResult[] = await res.json();
        console.log("[AddressSearch] results:", data.length, data.slice(0, 2));
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (r: AddressResult) => {
    onSelect(r.lat, r.lon, r.display_name);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-crisis-blue"
      />
      <input
        type="text"
        placeholder="Rechercher une adresse..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full bg-crisis-dark border border-crisis-border rounded-lg pl-9 pr-9 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-crisis-blue"
      />
      {loading && (
        <Loader2
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-crisis-blue animate-spin"
        />
      )}
      {!loading && query && (
        <button
          onClick={() => {
            setQuery("");
            setResults([]);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
        >
          <X size={16} />
        </button>
      )}

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-crisis-surface border border-crisis-border rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
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
  );
}
