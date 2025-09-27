"use client";


"use client";

import Image from "next/image";
import Link from "next/link";

// Images associées (à adapter selon les noms exacts dans /public)
const images = {
  habitat_regroupe: "/habitat_regroupe.webp",
  village_seniors: "/village_seniors.webp",
  beguinage: "/beguinage.webp",
  habitat_inclusif: "/habitat_inclusif.webp",
  accueil_familial: "/accueil_familial.webp",
  colocation_avec_services: "/colocation_avec_services.webp",
  habitat_alternatif: "/habitat_alternatif.webp",
  habitat_intergenerationnel: "/habitat_intergenerationnel.webp",
  maison_accueil_familial: "/maison_accueil_familial.webp",
  marpa: "/marpa.webp",
  residence_autonomie: "/residence_autonomie.webp",
  residence_services_seniors: "/residence_services_seniors.webp",
};

const sections = [
  {
    key: "habitat_individuel",
    title: "🏠 Habitat individuel : rester autonome, mais dans un cadre pensé pour les seniors",
    description:
      "Solutions pour garder un logement à soi, intégré dans un cadre collectif adapté : accessibilité, convivialité, sécurité.",
    solutions: [
      {
        key: "habitat_regroupe",
        title: "Habitat regroupé",
        image: images.habitat_regroupe,
        summary:
          "Petits logements individuels côte à côte, avec espaces communs. Autonomie + voisinage solidaire.",
        details: [
          "Pour qui ? Ceux qui veulent garder leur indépendance sans s’isoler.",
          "À retenir : compromis souple, souvent porté par des collectivités.",
          "Réflexe : vérifier le dynamisme du lieu (animations, vie collective).",
        ],
      },
      {
        key: "village_seniors",
        title: "Village seniors",
        image: images.village_seniors,
        summary:
          "Petit quartier pensé pour les retraités, avec maisons/appartements et services adaptés.",
        details: [
          "Pour qui ? Seniors actifs, vie entre pairs, confort et tranquillité.",
          "À retenir : convivialité et sécurité.",
          "Réflexe : attention aux frais annexes (entretien, services).",
        ],
      },
      {
        key: "beguinage",
        title: "Béguinage",
        image: images.beguinage,
        summary:
          "Logements indépendants autour d’espaces communs, ambiance conviviale portée par associations.",
        details: [
          "Pour qui ? Seniors autonomes, petit collectif.",
          "À retenir : esprit simple et solidaire.",
          "Réflexe : vérifier l’animation réelle de la vie collective.",
        ],
      },
    ],
  },
  {
    key: "habitat_partage",
    title: "👥 Habitat partagé : inventer d’autres façons de vivre ensemble",
    description:
      "Catégorie innovante : colocation, habitat inclusif, accueil familial… Ici, on réinvente la vie collective.",
    solutions: [
      {
        key: "habitat_inclusif",
        title: "Habitat inclusif",
        image: images.habitat_inclusif,
        summary:
          "Logements regroupés avec projet de vie sociale et partagée, soutenu par l’AVP.",
        details: [
          "Pour qui ? Autonomie + vie collective, cadre sécurisant.",
          "À retenir : projet collectif en plein essor.",
          "Réflexe : bien comprendre le projet de vie sociale.",
        ],
      },
      {
        key: "accueil_familial",
        title: "Accueil familial",
        image: images.accueil_familial,
        summary:
          "Une personne/couple accueille une ou deux personnes âgées chez eux, ambiance familiale.",
        details: [
          "Pour qui ? Cadre intime, moins cher qu’un établissement.",
          "À retenir : relation humaine forte.",
          "Réflexe : tester la compatibilité avant de s’engager.",
        ],
      },
      {
        key: "colocation_avec_services",
        title: "Colocation avec services",
        image: images.colocation_avec_services,
        summary:
          "Plusieurs personnes âgées partagent une maison adaptée, avec services mutualisés.",
        details: [
          "Pour qui ? Ceux qui veulent éviter la solitude.",
          "À retenir : équilibre entre intimité et vie commune.",
          "Réflexe : clarifier le rôle du gestionnaire.",
        ],
      },
      {
        key: "habitat_alternatif",
        title: "Habitat alternatif",
        image: images.habitat_alternatif,
        summary:
          "Projets militants : éco-hameaux, coopératives, résidences solidaires.",
        details: [
          "Pour qui ? Ceux qui veulent s’engager dans un collectif.",
          "À retenir : enthousiasmant mais parfois exigeant.",
          "Réflexe : mesurer son envie réelle d’implication.",
        ],
      },
      {
        key: "habitat_intergenerationnel",
        title: "Habitat intergénérationnel",
        image: images.habitat_intergenerationnel,
        summary:
          "Seniors et jeunes partagent un logement ou immeuble, échanges de services contre loyer modéré.",
        details: [
          "Pour qui ? Seniors ouverts, connectés aux jeunes générations.",
          "À retenir : riche humainement, demande flexibilité.",
          "Réflexe : clarifier les règles de vie commune.",
        ],
      },
      {
        key: "maison_accueil_familial",
        title: "Maison d’accueil familial",
        image: images.maison_accueil_familial,
        summary:
          "Plusieurs accueillants familiaux regroupent leurs accueils sous un même toit.",
        details: [
          "Pour qui ? Personnes âgées fragiles, ambiance familiale.",
          "À retenir : proximité humaine + encadrement solide.",
          "Réflexe : regarder la taille du lieu et le ratio encadrement/résidents.",
        ],
      },
    ],
  },
  {
    key: "logement_individuel_en_residence",
    title: "🏢 Logement individuel en résidence : entre confort et institution légère",
    description:
      "Résidences : cadre institutionnel léger, logement individuel, services collectifs.",
    solutions: [
      {
        key: "marpa",
        title: "MARPA",
        image: images.marpa,
        summary:
          "Petites structures rurales (25 max), portées par les communes, cadre convivial.",
        details: [
          "Pour qui ? Personnes âgées en milieu rural.",
          "À retenir : proximité et ancrage territorial.",
          "Réflexe : vérifier la viabilité financière.",
        ],
      },
      {
        key: "residence_autonomie",
        title: "Résidence autonomie",
        image: images.residence_autonomie,
        summary:
          "Appartements adaptés, services collectifs, gérés par les communes.",
        details: [
          "Pour qui ? Seniors autonomes mais isolés.",
          "À retenir : compromis abordable, variable selon la commune.",
          "Réflexe : vérifier l’état du bâti et la qualité des animations.",
        ],
      },
      {
        key: "residence_services_seniors",
        title: "Résidence services seniors",
        image: images.residence_services_seniors,
        summary:
          "Logements indépendants avec services hôteliers, formule premium.",
        details: [
          "Pour qui ? Seniors recherchant confort et services clé en main.",
          "À retenir : cadre attractif mais coûteux.",
          "Réflexe : décortiquer les charges et services.",
        ],
      },
    ],
  },
];


export default function Client() {
  return (
    <main className="max-w-5xl mx-auto py-10 px-4">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-orange-700 mb-4">
          Habitats intermédiaires : mieux comprendre pour mieux choisir
        </h1>
        <p className="text-lg text-gray-700 mb-2">
          Entre le domicile « classique » et l’EHPAD, il existe une galaxie de solutions qu’on regroupe sous un terme encore flou pour beaucoup : l’habitat intermédiaire.
        </p>
        <p className="text-md text-gray-600 mb-2">
          Derrière ce mot se cachent des réalités très variées : du petit béguinage convivial à la résidence autonomie, en passant par l’habitat inclusif ou les villages seniors.
        </p>
        <div className="mt-6 p-6 bg-orange-50 rounded-lg border border-orange-200">
          <h2 className="text-xl font-semibold text-orange-800 mb-2">L’idée commune ?</h2>
          <ul className="list-disc pl-6 text-orange-900 space-y-1">
            <li>Proposer une alternative qui permet de vieillir chez soi, mais pas tout seul, avec un environnement plus adapté qu’un logement standard, et moins médicalisé qu’un établissement.</li>
            <li>Répondre aux enjeux de solitude, accessibilité, coût et, surtout, au désir de choisir comment on veut vivre demain.</li>
          </ul>
        </div>
        <div className="mt-6 p-6 bg-amber-100 rounded-lg border border-amber-300">
          <p className="text-md text-orange-900">
            Rendre cette offre lisible, c’est donc un enjeu citoyen : pour les familles, les élus, les professionnels… mais surtout pour les personnes âgées elles-mêmes. Voici une boussole pour comprendre ce que recouvre chaque solution, ses atouts, ses limites, et quelques réflexes à garder en tête avant de s’engager.
          </p>
        </div>
      </header>

      {/* Navigation rapide */}
      <nav className="mb-8 flex flex-wrap gap-4 justify-center">
        {sections.map((section) => (
          <a
            key={section.key}
            href={`#${section.key}`}
            className="px-4 py-2 rounded-full bg-orange-100 text-orange-900 font-semibold hover:bg-orange-200 transition"
          >
            {section.title.split(":")[0]}
          </a>
        ))}
        <a
          href="#simulateurs"
          className="px-4 py-2 rounded-full bg-orange-700 text-white font-semibold hover:bg-orange-800 transition"
        >
          Simulateurs
        </a>
      </nav>

      {/* Sections */}
      {sections.map((section) => (
        <section key={section.key} id={section.key} className="mb-12">
          <h2 className="text-2xl font-bold text-orange-800 mb-2">{section.title}</h2>
          <p className="text-md text-gray-700 mb-6">{section.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {section.solutions.map((sol) => (
              <div
                key={sol.key}
                className="bg-amber-50 rounded-xl shadow-lg border border-amber-200 p-6 flex flex-col"
              >
                <div className="mb-4 flex justify-center">
                  <Image
                    src={sol.image}
                    alt={sol.title}
                    width={220}
                    height={140}
                    className="rounded-lg object-cover shadow"
                  />
                </div>
                <h3 className="text-xl font-semibold text-orange-900 mb-2">{sol.title}</h3>
                <p className="text-gray-700 mb-2">{sol.summary}</p>
                <ul className="list-disc pl-5 text-gray-600 mb-2 space-y-1">
                  {sol.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Espace simulateurs */}
      <section id="simulateurs" className="mb-16">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-orange-900 mb-2">🧮 Simulateurs à venir</h2>
          <p className="text-md text-orange-800 mb-2">
            Bientôt, vous pourrez accéder à des outils interactifs pour comparer les solutions, estimer les coûts, et simuler votre projet d’habitat intermédiaire.
          </p>
          <p className="text-sm text-orange-700">
            <em>Cette section sera enrichie prochainement avec des simulateurs pratiques et des guides personnalisés.</em>
          </p>
        </div>
      </section>

      {/* Résumé final */}
      <section className="mb-10">
        <div className="bg-amber-100 border border-amber-300 rounded-xl p-8">
          <h2 className="text-xl font-bold text-orange-900 mb-2">🎯 En résumé</h2>
          <p className="text-md text-orange-900 mb-2">
            L’habitat intermédiaire, ce n’est pas « une case unique » mais une constellation de réponses.
            Chaque solution a ses promesses et ses angles morts. L’essentiel, c’est de ne pas choisir sur un coup de cœur ou une plaquette commerciale : aller voir, poser des questions, tester la vie quotidienne.
          </p>
          <p className="text-md text-orange-800">
            👉 L’habitat, ce n’est pas que des murs. C’est un projet de vie.
          </p>
        </div>
      </section>
    </main>
  );
}
