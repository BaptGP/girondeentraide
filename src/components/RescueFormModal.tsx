import { jsPDF } from "jspdf";
import { Check, ChevronRight, PawPrint, X } from "lucide-react";
import { useState } from "react";

interface RescueFormModalProps {
  onClose: () => void;
}

export default function RescueFormModal({ onClose }: RescueFormModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [animalCount, setAnimalCount] = useState("");
  const [animalDetails, setAnimalDetails] = useState("");
  const [identified, setIdentified] = useState("");
  const [temperament, setTemperament] = useState("");
  const [hidingSpot, setHidingSpot] = useState("");
  const [accessMode, setAccessMode] = useState("");
  const [foodWater, setFoodWater] = useState("");
  const [transportCage, setTransportCage] = useState("");
  const [canRecover, setCanRecover] = useState("");
  const [needFoster, setNeedFoster] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [effraction, setEffraction] = useState("");
  const [charterAccepted, setCharterAccepted] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [name, setName] = useState("");

  const canSubmit = Boolean(
    name.trim() &&
    address.trim() &&
    phone.trim() &&
    animalCount.trim() &&
    animalDetails.trim() &&
    effraction &&
    charterAccepted &&
    dataConsent,
  );

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const dateStr = new Date().toLocaleDateString("fr-FR");
      const timeStr = new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const body = {
        address: address.trim(),
        phone: phone.trim(),
        animalCount: animalCount.trim(),
        animalDetails: animalDetails.trim(),
        identified,
        temperament,
        hidingSpot: hidingSpot.trim(),
        accessMode: accessMode.trim(),
        foodWater,
        transportCage,
        canRecover,
        needFoster,
        additionalInfo: additionalInfo.trim(),
        effraction,
        charterAccepted,
        dataConsent,
        name: name.trim(),
        date: dateStr,
        time: timeStr,
      };

      const doc = new jsPDF();
      let y = 20;
      doc.setFontSize(18);
      doc.setTextColor(168, 85, 247);
      doc.text("Demande de sauvetage animal", 20, y);
      y += 12;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le ${dateStr} à ${timeStr}`, 20, y);
      y += 10;

      doc.setDrawColor(220);
      doc.line(20, y, 190, y);
      y += 10;

      const fields: [string, string][] = [
        ["Nom", body.name],
        ["Adresse exacte", body.address],
        ["Téléphone", body.phone],
        ["Nombre d'animaux", body.animalCount],
        ["Description des animaux", body.animalDetails],
        ["Identifié", body.identified || "Non précisé"],
        ["Tempérament", body.temperament || "Non précisé"],
        ["Lieu de cachette", body.hidingSpot || "—"],
        ["Mode d'accès", body.accessMode || "—"],
        ["Eau et nourriture", body.foodWater || "Non précisé"],
        ["Cage de transport", body.transportCage || "Non précisé"],
        ["Récupération après", body.canRecover || "Non précisé"],
        ["Famille d'accueil", body.needFoster || "Non précisé"],
        ["Autres informations", body.additionalInfo || "—"],
        ["Effraction", body.effraction || "Non précisé"],
      ];

      doc.setFontSize(11);
      for (const [label, value] of fields) {
        doc.setTextColor(80);
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, 20, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40);
        const lines = doc.splitTextToSize(value, 110);
        doc.text(lines, 75, y);
        y += 7 * lines.length + 3;
      }

      y += 5;
      doc.setDrawColor(220);
      doc.line(20, y, 190, y);
      y += 10;

      doc.setFontSize(13);
      doc.setTextColor(168, 85, 247);
      doc.text("Charte d'autorisation", 20, y);
      y += 8;
      doc.setFontSize(9);
      doc.setTextColor(60);
      const charter = `« Je certifie être autorisé(e) à demander cette intervention et j'autorise les bénévoles à accéder, sans effraction, à l'adresse indiquée afin de rechercher, nourrir, récupérer et transporter mon ou mes animaux vers un lieu sécurisé si nécessaire. Je comprends que l'intervention dépend des conditions de sécurité, des consignes des autorités et qu'aucun résultat ne peut être garanti. Je m'engage à ne pas porter plainte contre Mme Emery Anne Sophie. »`;
      const charterLines = doc.splitTextToSize(charter, 170);
      doc.text(charterLines, 20, y);
      y += 7 * charterLines.length + 5;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Nom: ${body.name}`, 20, y);
      y += 6;
      doc.text(`Date: ${body.date}`, 20, y);
      y += 6;
      doc.text(`Heure: ${body.time}`, 20, y);
      y += 6;
      doc.text("Mention: Bon pour autorisation", 20, y);

      const pdfBase64 = doc.output("datauristring").split(",")[1];

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rescue-animal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ ...body, pdfBase64 }),
        },
      );

      if (!res.ok) throw new Error("Erreur lors de l'envoi");
      setSubmitted(true);
    } catch {
      setError("Erreur lors de l'envoi du formulaire. Réessayez.");
    }
    setLoading(false);
  };

  const inputClass =
    "w-full bg-crisis-dark border border-crisis-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-crisis-red";

  const yesNoOptions = [
    { value: "", label: "—" },
    { value: "oui", label: "Oui" },
    { value: "non", label: "Non" },
  ];

  const temperamentOptions = [
    { value: "", label: "—" },
    { value: "sociable", label: "Sociable" },
    { value: "craintif", label: "Craintif" },
    { value: "difficile", label: "Difficile à attraper" },
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
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <PawPrint size={20} className="text-purple-500" />
              {submitted ? "Demande envoyée" : "Sauvetage animal"}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-crisis-border text-gray-400"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="px-4 py-4">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-crisis-green/20 flex items-center justify-center mx-auto">
                <Check size={32} className="text-crisis-green" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Demande transmise
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Votre demande de sauvetage a été envoyée à l'association. Elle
                  vous contactera dans les meilleurs délais.
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-crisis-red text-white px-6 py-2.5 rounded-xl font-semibold text-sm"
              >
                Fermer
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Signalez les animaux enfermés en intérieur (maison, chenil, cour
                clôturée, clapier) qui nécessitent une intervention de
                l'association. Les animaux en liberté extérieure ne sont pas
                concernés. Les informations seront transmises directement à
                l'association.
              </p>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
                <p className="text-xs text-purple-300 leading-relaxed">
                  Ce service est assuré par l'association{" "}
                  <a
                    href="http://assosam.free.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    SAM Libourne
                  </a>{" "}
                  et est réservé aux communes de Lège-Cap-Ferret, Andernos,
                  Lacanau, Le Porge, Arès, Lanton, Audenge et Biganos.
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Nom <span className="text-crisis-red">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Adresse exacte <span className="text-crisis-red">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 rue exemple, 33500 Libourne"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Téléphone <span className="text-crisis-red">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Nombre d'animaux concernés{" "}
                  <span className="text-crisis-red">*</span>
                </label>
                <input
                  type="number"
                  value={animalCount}
                  onChange={(e) => setAnimalCount(e.target.value)}
                  placeholder="2"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Nom et description de chaque animal{" "}
                  <span className="text-crisis-red">*</span>
                </label>
                <textarea
                  value={animalDetails}
                  onChange={(e) => setAnimalDetails(e.target.value)}
                  placeholder="Rex - chien berger, noir et feu. Minette - chat gris..."
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Identifié (puce/tatouage)
                </label>
                <select
                  value={identified}
                  onChange={(e) => setIdentified(e.target.value)}
                  className={inputClass}
                >
                  {yesNoOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Sociable, craintif ou difficile à attraper
                </label>
                <select
                  value={temperament}
                  onChange={(e) => setTemperament(e.target.value)}
                  className={inputClass}
                >
                  {temperamentOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Lieu où il peut se cacher
                </label>
                <input
                  type="text"
                  value={hidingSpot}
                  onChange={(e) => setHidingSpot(e.target.value)}
                  placeholder="Sous le lit, dans le grenier..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Mode d'accès
                </label>
                <input
                  type="text"
                  value={accessMode}
                  onChange={(e) => setAccessMode(e.target.value)}
                  placeholder="Clés, code, portail, boîte à clés..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Eau et nourriture disponibles sur place
                </label>
                <select
                  value={foodWater}
                  onChange={(e) => setFoodWater(e.target.value)}
                  className={inputClass}
                >
                  {yesNoOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Cage de transport sur place
                </label>
                <select
                  value={transportCage}
                  onChange={(e) => setTransportCage(e.target.value)}
                  className={inputClass}
                >
                  {yesNoOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Pouvez-vous récupérer l'animal après l'intervention ?
                </label>
                <select
                  value={canRecover}
                  onChange={(e) => setCanRecover(e.target.value)}
                  className={inputClass}
                >
                  {yesNoOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Famille d'accueil nécessaire
                </label>
                <select
                  value={needFoster}
                  onChange={(e) => setNeedFoster(e.target.value)}
                  className={inputClass}
                >
                  {yesNoOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Accès au logement <span className="text-crisis-red">*</span>
                </label>
                <select
                  value={effraction}
                  onChange={(e) => setEffraction(e.target.value)}
                  className={inputClass}
                >
                  <option value="">—</option>
                  <option value="sans effraction">Sans effraction</option>
                  <option value="avec effraction">Avec effraction</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Autres informations importantes
                </label>
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Informations complémentaires..."
                  rows={2}
                  className={inputClass}
                />
              </div>

              <div className="bg-crisis-dark border border-crisis-border rounded-xl p-4 space-y-3">
                <p className="text-sm text-gray-300 font-medium">
                  Charte d'autorisation
                </p>
                <p className="text-xs text-gray-400 italic leading-relaxed">
                  « Je certifie être autorisé(e) à demander cette intervention
                  et j'autorise les bénévoles à accéder, sans effraction, à
                  l'adresse indiquée afin de rechercher, nourrir, récupérer et
                  transporter mon ou mes animaux vers un lieu sécurisé si
                  nécessaire. Je comprends que l'intervention dépend des
                  conditions de sécurité, des consignes des autorités et
                  qu'aucun résultat ne peut être garanti. Je m'engage à ne pas
                  porter plainte contre Mme Emery Anne Sophie. »
                </p>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setCharterAccepted(!charterAccepted)}
                >
                  <button
                    type="button"
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                      charterAccepted
                        ? "bg-crisis-red border-crisis-red"
                        : "bg-crisis-dark border-crisis-border"
                    }`}
                  >
                    {charterAccepted && (
                      <Check size={14} className="text-white" />
                    )}
                  </button>
                  <span className="text-sm text-white">
                    J'accepte et certifie cette autorisation{" "}
                    <span className="text-crisis-red">*</span>
                  </span>
                </div>
              </div>

              <div
                className="flex items-start gap-2 cursor-pointer"
                onClick={() => setDataConsent(!dataConsent)}
              >
                <button
                  type="button"
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    dataConsent
                      ? "bg-crisis-red border-crisis-red"
                      : "bg-crisis-dark border-crisis-border"
                  }`}
                >
                  {dataConsent && <Check size={14} className="text-white" />}
                </button>
                <span className="text-xs text-gray-400 leading-relaxed">
                  J'accepte que les informations transmises via ce formulaire
                  soient communiquées à l'association en charge du sauvetage
                  animal, pour la seule finalité de l'intervention demandée.
                  Conformément au RGPD, je dispose d'un droit d'accès, de
                  rectification et de suppression de mes données.{" "}
                  <span className="text-crisis-red">*</span>
                </span>
              </div>

              {error && (
                <p className="text-sm text-crisis-red text-center">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                  canSubmit && !loading
                    ? "bg-crisis-red text-white active:scale-[0.98]"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  "Envoi en cours..."
                ) : (
                  <>
                    Envoyer la demande
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
