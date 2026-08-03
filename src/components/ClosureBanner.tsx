import { ExternalLink, Heart } from "lucide-react";

export default function ClosureBanner() {
  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-crisis-blue/40 bg-gradient-to-b from-[#141a24] to-crisis-surface shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="flex items-center gap-2.5 border-b border-crisis-border/70 bg-[#141a24]/95 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-crisis-red/15 text-crisis-red">
              <Heart size={18} className="fill-crisis-red/30" />
            </div>
            <h2 className="text-lg font-bold text-white">
              Merci à toutes et à tous
            </h2>
          </div>

          {/* Body */}
          <div className="space-y-4 px-5 py-5 text-sm leading-relaxed text-gray-300">
            <p>
              Il y a quelques jours, face à l'urgence des incendies qui ont
              frappé notre région, j'ai développé et mis en ligne{" "}
              <em className="text-gray-200">Gironde Entraide</em> dans l'unique
              but d'apporter une pierre à l'édifice : faciliter l'entraide
              rapide, locale et sans barrière pour celles et ceux qui devaient
              être évacués ou prêter main-forte.
            </p>

            <p>
              Aujourd'hui, alors que la situation sur le terrain se stabilise et
              que chacun commence à pouvoir regagner son foyer,{" "}
              <strong className="text-white">
                le site accomplit sa mission et se met en pause.
              </strong>
            </p>

            <p>
              Je tenais à adresser un{" "}
              <strong className="text-white">immense merci</strong> :
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-crisis-red">•</span>
                <span>
                  <strong className="text-white">
                    À vous, utilisateurs et citoyens
                  </strong>
                  , pour votre solidarité incroyable, votre réactivité et
                  l'attention portée aux données de chacun.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-crisis-red">•</span>
                <span>
                  <strong className="text-white">
                    À toutes les personnes qui ont relayé et partagé le site
                  </strong>{" "}
                  sur les réseaux sociaux pour lui donner la visibilité dont il
                  avait besoin au pire de la crise.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-crisis-red">•</span>
                <span>
                  <strong className="text-white">
                    Aux forces de l'ordre, aux agriculteurs, aux bénévoles sur
                    le terrain
                  </strong>{" "}
                  et évidemment{" "}
                  <strong className="text-white">à nos sapeurs-pompiers</strong>{" "}
                  qui luttent sans relâche face aux flammes. Votre dévouement
                  est exemplaire.
                </span>
              </li>
            </ul>

            <div className="rounded-xl border border-crisis-border bg-crisis-dark/60 p-4">
              <p className="font-semibold text-white">Et pour la suite ?</p>
              <p className="mt-1.5 text-gray-300">
                <em className="text-gray-200">Gironde Entraide</em> repasse en
                mode dormant. L'outil et son code source restent archivés et
                prêts à être redéployés rapidement en cas de besoin ou lors
                d'une future crise, ici ou ailleurs.
              </p>
            </div>

            <p>
              Si vous souhaitez suivre l'évolution de ce projet, échanger sur la
              dimension technique ou me proposer de nouvelles initiatives
              d'engagement citoyen / tech, vous pouvez me retrouver sur mon site
              :{" "}
              <a
                href="https://www.eliaman.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-crisis-blue hover:underline"
              >
                eliaman.com
                <ExternalLink size={12} />
              </a>
              .
            </p>

            <p>
              Prenez soin de vous et encore merci pour cet élan de solidarité.
            </p>

            <p className="text-right italic text-gray-400">— Eliaman</p>
          </div>
        </div>
      </div>
    </div>
  );
}
