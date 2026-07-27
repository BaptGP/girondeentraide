import { Phone, Siren, X } from "lucide-react";
import { useState } from "react";

const EMERGENCY_NUMBERS = [
  {
    number: "18",
    label: "Pompiers",
    desc: "Incendie, secours d'urgence",
    color: "#dc2626",
  },
  {
    number: "112",
    label: "Urgence européenne",
    desc: "Numéro d'urgence général",
    color: "#2563eb",
  },
  {
    number: "15",
    label: "SAMU",
    desc: "Urgence médicale",
    color: "#16a34a",
  },
  {
    number: "17",
    label: "Police",
    desc: "Secours police",
    color: "#2563eb",
  },
  {
    number: "0970809040",
    label: "Numéro vert Gironde",
    desc: "Infos évacuations incendies",
    color: "#f59e0b",
  },
  {
    number: "0 800 006 090",
    label: "Numéro vert dons",
    desc: "Aider : dons et solidarité",
    color: "#16a34a",
  },
];

export default function EmergencyNumbers() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Ouvrir les numéros d'urgence"
        className="absolute bottom-5 left-5 z-30 flex items-center gap-2 bg-crisis-red text-white px-4 py-3.5 rounded-full font-bold shadow-lg shadow-crisis-red/30 hover:brightness-110 active:scale-95 transition-all"
      >
        <Siren size={20} />
        <span className="text-sm">SOS</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Numéros d'urgence"
            className="fixed bottom-0 left-0 right-0 z-50 bg-crisis-surface border-t border-crisis-border rounded-t-2xl max-h-[80vh] overflow-y-auto animate-slide-up"
          >
            <div className="sticky top-0 bg-crisis-surface pt-3 pb-2 px-4 border-b border-crisis-border z-10">
              <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Siren size={20} className="text-crisis-red" />
                  Numéros d'urgence
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-crisis-border text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="px-4 py-4 space-y-3">
              {EMERGENCY_NUMBERS.map((num) => (
                <a
                  key={num.number}
                  href={`tel:${num.number.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 p-3 bg-crisis-dark rounded-xl border border-crisis-border hover:border-gray-600 transition-colors active:scale-[0.98]"
                >
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${num.color}22` }}
                  >
                    <Phone size={20} style={{ color: num.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-lg font-bold"
                        style={{ color: num.color }}
                      >
                        {num.number}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {num.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{num.desc}</p>
                  </div>
                </a>
              ))}

              <p className="text-xs text-gray-600 text-center pt-2">
                En cas de danger immédiat, appelez le 18 ou le 112
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
