import { X } from "lucide-react";

export default function PrivacyPolicy({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/70 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Politique de confidentialité"
        className="fixed bottom-0 left-0 right-0 z-50 bg-crisis-surface border-t border-crisis-border rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up"
      >
        <div className="sticky top-0 bg-crisis-surface pt-3 pb-2 px-4 border-b border-crisis-border z-10">
          <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              Politique de confidentialité
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

        <div className="px-4 py-4 space-y-4 text-sm text-gray-300 leading-relaxed">
          <div>
            <h3 className="text-white font-semibold mb-1">
              Responsable de traitement
            </h3>
            <p>
              Le responsable du traitement des données est Eliaman, joignable
              par email à contact@eliaman.com. Cette plateforme est un projet
              bénévole, non commercial et à but humanitaire.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-1">
              Données collectées
            </h3>
            <p>
              Lors de la création d'une annonce, nous collectons les données
              suivantes : type d'annonce, catégorie, titre, description,
              localisation (adresse ou GPS), numéro de téléphone, et
              facultativement une photo pour les animaux perdus/trouvés.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-1">
              Utilisation des données
            </h3>
            <p>
              Les données servent exclusivement à mettre en relation les
              personnes proposant de l'aide et celles en demandant. Aucune
              donnée n'est vendue, partagée ou utilisée à des fins commerciales.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-1">
              Numéro de téléphone
            </h3>
            <p>
              Votre numéro de téléphone n'est visible qu'à l'ouverture d'une
              annonce spécifique. Il n'est pas inclus dans la liste globale des
              annonces et n'est pas accessible par scrapping de masse.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-1">
              Suppression des données
            </h3>
            <p>
              Vous pouvez supprimer votre annonce à tout moment en utilisant le
              code secret à 4 chiffres fourni lors de la création. La
              suppression efface également les photos associées stockées sur nos
              serveurs.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-1">
              Conservation des données
            </h3>
            <p>
              Les annonces actives sont conservées tant que la plateforme est en
              service. Les annonces résolues sont supprimées automatiquement
              après 7 jours. La plateforme sera désactivée à la fin de la
              situation d'urgence, entraînant la suppression de toutes les
              données et images associées.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-1">
              Formulaire de sauvetage animal
            </h3>
            <p>
              Le formulaire de signalement d'animaux à sauver collecte les
              données suivantes : nom, adresse exacte, numéro de téléphone,
              informations sur les animaux (nombre, description, tempérament,
              identification), conditions d'accès et informations
              complémentaires.
            </p>
            <p className="mt-2">
              Ces données sont transmises par email à l'association{" "}
              <a
                href="https://www.lesamisdesam.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Les Amis de SAM
              </a>
              , partenaire de la plateforme, uniquement pour la finalité de
              l'intervention de sauvetage demandée. Un PDF récapitulatif est
              également généré et joint à l'email. Les données ne sont pas
              stockées sur la plateforme ni affichées publiquement sur la carte.
            </p>
            <p className="mt-2">
              L'utilisateur autorise explicitement, par une case à cocher, la
              transmission de ses données à l'association. L'utilisateur
              certifie également être autorisé à demander l'intervention et
              autorise les bénévoles à accéder à l'adresse indiquée.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-1">Hébergement</h3>
            <p>
              Les données sont hébergées sur Supabase (serveurs européens) et
              les images sur Supabase Storage. Le site est protégé par
              Cloudflare.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-1">Cookies</h3>
            <p>
              Ce site n'utilise aucun cookie de suivi publicitaire. Les seules
              données stockées localement sont nécessaires au fonctionnement de
              l'application (PWA).
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-1">Vos droits (RGPD)</h3>
            <p>
              Conformément au Règlement Général sur la Protection des Données
              (RGPD), vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Droit d'accès à vos données personnelles</li>
              <li>Droit de rectification des données inexactes</li>
              <li>Droit à l'effacement de vos données</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
            <p className="mt-2">
              Pour exercer ces droits, utilisez le code secret fourni lors de la
              création de l'annonce pour supprimer vos données, ou
              contactez-nous par email à contact@eliaman.com.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-1">Contact</h3>
            <p>
              Pour toute question concernant vos données, vous pouvez ouvrir une
              issue sur le dépôt GitHub du projet.
            </p>
          </div>

          <p className="text-xs text-gray-500 pt-2">
            Dernière mise à jour : juillet 2026
          </p>
        </div>
      </div>
    </>
  );
}
