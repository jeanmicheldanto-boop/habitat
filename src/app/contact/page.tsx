import type { Metadata } from "next";
import SecondaryMenu from "../../components/SecondaryMenu";

export const metadata: Metadata = {
  title: "Contact & Qui sommes-nous · Habitat Intermédiaire",
  description: "Contactez l'équipe habitat-intermediaire.fr pour toute question ou découvrez qui nous sommes : une plateforme dédiée aux solutions de logement inclusif pour séniors, créée par Danto & Frère.",
  keywords: [
    "contact habitat intermédiaire",
    "qui sommes nous",
    "Danto Frère",
    "solutions technologiques seniors",
    "IA automatisation humain",
    "nouvelles solutions habitat",
    "plateforme logement seniors",
    "innovation sociale"
  ],
  openGraph: {
    title: "Contact & Qui sommes-nous - Habitat Intermédiaire",
    description: "Découvrez l'équipe et la mission d'habitat-intermediaire.fr : promouvoir les solutions innovantes de logement pour seniors avec humanité et technologie.",
  },
  alternates: {
    canonical: 'https://habitat-intermediaire.fr/contact',
  }
};

export default function ContactPage() {
  return (
    <>
      <SecondaryMenu />
      <section className="section">
        <div className="container max-w-4xl mx-auto py-8">
          {/* Objectif d'habitat-intermediaire.fr */}
          <div className="mb-16">
            <h1 className="text-3xl font-bold mb-6 text-center">Notre mission</h1>
            
            <div className="bg-orange-50 rounded-lg p-8 mb-8 border border-orange-100">
              <h2 className="text-2xl font-semibold text-orange-900 mb-4">L&apos;objectif d&apos;habitat-intermediaire.fr</h2>
              <p className="text-orange-800 mb-4 text-lg leading-relaxed">
                <strong>Habitat-intermediaire.fr</strong> est une plateforme experte dédiée à la lisibilité et à l&apos;accessibilité 
                des solutions de logement inclusif pour séniors, entre le domicile et l&apos;EHPAD : logements adaptés, 
                résidences autonomie, habitats partagés, béguinages, MARPA.
              </p>
              <p className="text-orange-800 mb-4 text-lg leading-relaxed">
                <strong>Notre objectif</strong> : offrir une information claire, gratuite et indépendante sur toutes les 
                solutions non médicalisées qui permettent de penser un cadre de vie adapté au projet de vie, 
                pour préparer sereinement l&apos;avenir.
              </p>
              <p className="text-orange-700 text-lg leading-relaxed">
                Nous mettons en avant la diversité des solutions, les aides disponibles, et nous nous engageons 
                à délivrer un message non institutionnel, accessible à tous, sans pression commerciale ni jargon administratif.
              </p>
            </div>
          </div>

          {/* Présentation Danto & Frère */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Qui sommes-nous ?</h2>
            
            <div className="bg-gray-50 rounded-lg p-8 mb-8 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Danto & Frère</h3>
              <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                Habitat-intermediaire.fr est édité par <strong>Danto &amp; Frère</strong>, une société qui développe 
                des solutions technologiques dans le champ de l&apos;IA et de l&apos;automatisation au service de l&apos;essentiel : 
                <strong> l&apos;humain</strong>.
              </p>
              <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                Notre mission : faciliter l&apos;accès à l&apos;information, accompagner les parcours de vie, et promouvoir 
                l&apos;innovation sociale au bénéfice des personnes âgées et de leurs proches.
              </p>
            </div>

            {/* Esprit et valeurs */}
            <div className="bg-orange-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-orange-900 mb-4">Notre esprit & nos valeurs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-orange-800 mb-2">🚀 Innovation humaniste</h4>
                  <p className="text-orange-700 text-sm">
                    Nous mettons la technologie au service de l&apos;humain, pas l&apos;inverse. 
                    Chaque solution développée place la personne au centre.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-800 mb-2">🏠 Nouvelles solutions d&apos;habitat</h4>
                  <p className="text-orange-700 text-sm">
                    Nous promouvons activement les alternatives innovantes à l&apos;institutionnalisation 
                    traditionnelle, pour un vieillissement choisi et digne.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-800 mb-2">🤝 Accessibilité & transparence</h4>
                  <p className="text-orange-700 text-sm">
                    Information gratuite, claire et indépendante. Nous refusons le jargon 
                    administratif et les pressions commerciales.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-800 mb-2">🌱 Innovation sociale</h4>
                  <p className="text-orange-700 text-sm">
                    Nous développons des outils qui favorisent le lien social, l&apos;autonomie 
                    et le bien-être dans les parcours de vie.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Contactez-nous</h2>
            
            <div className="bg-gray-50 rounded-lg p-8 max-w-2xl mx-auto">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">💬 Contact principal</h3>
                <p className="text-gray-700 mb-2 text-lg">
                  <strong>Email :</strong> 
                  <a href="mailto:jeanmichel.danto@gmail.com" className="text-blue-600 hover:text-blue-800 underline ml-2">
                    jeanmichel.danto@gmail.com
                  </a>
                </p>
                <p className="text-gray-600 text-sm">
                  Pour toute question, suggestion d'amélioration, partenariat ou demande d'information
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">🏢 Gestionnaires & Professionnels</h3>
                <p className="text-gray-700 mb-2">
                  <strong>Email :</strong> 
                  <a href="mailto:gestionnaires@habitat-intermediaire.fr" className="text-blue-600 hover:text-blue-800 underline ml-2">
                    gestionnaires@habitat-intermediaire.fr
                  </a>
                </p>
                <p className="text-gray-600 text-sm">
                  Pour les demandes d'ajout d'établissement, imports en masse (CSV), partenariats professionnels
                </p>
              </div>
            </div>
          </div>

          {/* Note sur l'originalité */}
          <div className="mt-16 text-center">
            <div className="bg-orange-50 rounded-lg p-6 max-w-3xl mx-auto border border-orange-100">
              <h3 className="text-lg font-semibold text-orange-900 mb-3">Notre originalité</h3>
              <p className="text-orange-800 leading-relaxed">
                La gratuité, la focalisation sur les solutions alternatives à l'institution, et la volonté 
                de donner à chacun les moyens de choisir un habitat qui corresponde à ses besoins et à ses envies, 
                sans pression commerciale ni jargon administratif.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}