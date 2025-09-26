"use client";

import Link from "next/link";

const SUBNAV_GUARD = 64; // marge de sécurité pour l’offset quand on arrive par ancre

export default function AidesClient() {
  return (
    <section className="container mx-auto max-w-6xl px-4 pt-28 md:pt-32 pb-24 space-y-20">
      {/* Intro */}
      <header className="container mx-auto max-w-5xl px-4 pt-6 md:pt-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Les aides</h1>
        <p className="mt-3 max-w-3xl text-neutral-700">
          Rassurez-vous, même des professionnels aguerris s’y perdent parfois dans les dispositifs.
          Si ce n’est pas clair pour vous, ce n’est pas vous le responsable. La plateforme
          <em> habitat-intermediaire.fr</em> met à votre disposition des outils
          <strong> simples</strong> et <strong> pratiques</strong> pour vous repérer et mettre en place,
          pour vous ou vos proches, les aides utiles pour bien vieillir.
        </p>
        <p className="mt-3 max-w-3xl text-neutral-700">
          Notre objectif n’est pas de vous vendre quoi que ce soit, mais de rendre accessibles les
          services offerts aux personnes en perte d’autonomie, quel que soit leur statut. Notre approche
          s’appuie sur notre <strong>expérience d’aidant</strong> et notre <strong>expertise du secteur</strong>.
          Nous ne sommes pas une institution officielle, ce qui nous permet de parler vrai. On parle ici
          de ce qui compte au quotidien&nbsp;: <em>participation</em> à l’APA, <em>vrai coût</em> des solutions,
          et repères concrets.
        </p>
        <p className="mt-3 max-w-3xl text-neutral-700">
          Si vous traversez une période de stress — “Comment on s’organise ?”, “Rester chez moi ?”,
          “Combien ça coûte ?” — vous n’êtes pas seul. Ces moments peuvent aussi ouvrir sur de
          <strong> belles rencontres</strong> et une vraie <strong>prévention</strong>. Bonne nouvelle :
          <strong> des aides existent</strong> et vous pouvez être accompagné.
        </p>
      </header>

      {/* Contenu */}
      <main className="container mx-auto max-w-5xl px-4 pb-20 space-y-20">
        <Section id="bons-reflexes">
            <h2 className="text-2xl font-semibold">Les bons réflexes</h2>
            <p className="mt-2 text-neutral-700">
                Ces conseils peuvent s’appliquer aux personnes qui avancent en âge comme à leurs proches aidants.
            </p>

            <ol className="mt-6 space-y-5">
                {/* 1 */}
                <li className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex items-start gap-3">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-700">1</span>
                    <div className="space-y-1">
                    <h3 className="font-medium">Penser prévention avant de penser « dépendance »</h3>
                    <p className="text-neutral-700">
                        Inutile de trop anticiper sur ce qui n’ira pas : on peut agir aujourd’hui pour aller mieux demain.
                        Trois domaines ont largement fait leurs preuves&nbsp;: <strong>parler</strong>, <strong>bouger</strong>, <strong>bien manger</strong>.
                        Le <em>lien social</em> (conversations régulières), l’<em>activité physique</em> (même douce) et une
                        <em>alimentation</em> saine et plaisante préservent vos capacités.pour évaluer votre degré d'autonomie et accéder à des conseils personnalisés, 
                        vous pouvez utiliser {" "}
                        <Link
                            href="https://jeanmicheldanto-boop-simulateur-apa-simple-app-ynirfr.streamlit.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold !text-orange-600 hover:!text-orange-700 underline !decoration-orange-600 decoration-2 underline-offset-2"
                            >
                             notre simulateur GIR
                            </Link>
                    </p>
                    </div>
                </div>
                </li>

                {/* 2 */}
                <li className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex items-start gap-3">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-700">2</span>
                    <div className="space-y-1">
                    <h3 className="font-medium">Faites ce qui vous plaît</h3>
                    <p className="text-neutral-700">
                        Ce sont <strong>vos choix de vie</strong>. Ne cherchez pas d’abord ce qui rassurerait vos proches (ou vous-même si vous êtes aidant),
                        mais ce dont <strong>vous avez envie</strong>. La variété des solutions d’<em>habitat intermédiaire</em> permet
                        d’aligner envies et moyens. Un point vous stresse&nbsp;? <strong>Parlez-en</strong> plutôt que de vous convaincre seul(e).
                    </p>
                    </div>
                </div>
                </li>

                {/* 3 */}
                <li className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex items-start gap-3">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-700">3</span>
                    <div className="space-y-1">
                    <h3 className="font-medium">Le point d’entrée pour les infos : votre mairie</h3>
                    <p className="text-neutral-700">
                        Le paysage des aides est un vrai labyrinthe (CLIC, France Services, Département, Service public départemental de l’autonomie…).
                        Dans la pratique, la <strong>mairie</strong> est souvent le meilleur point d’entrée&nbsp;: elle vous oriente vers la bonne porte du territoire.
                    </p>
                    </div>
                </div>
                </li>

                {/* 4 */}
                <li className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex items-start gap-3">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-700">4</span>
                    <div className="space-y-1">
                    <h3 className="font-medium">Soignez les transitions</h3>
                    <p className="text-neutral-700">
                        Les <strong>ruptures</strong> (départ en retraite, déménagement, retour d’hospitalisation, chute…) fragilisent.
                        Ces moments se <strong>préparent</strong> et se <strong>parlent</strong>. N’hésitez pas à demander de l’aide pour éviter la marche trop haute.
                    </p>
                    </div>
                </div>
                </li>

                {/* 5 */}
                <li className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex items-start gap-3">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-700">5</span>
                    <div className="space-y-1">
                    <h3 className="font-medium">Le coût n’est pas tabou</h3>
                    <p className="text-neutral-700">
                        Les non-dits financiers créent du stress. Mieux vaut clarifier tôt&nbsp;: les aides liées au vieillissement sont
                        <em> moins avantageuses</em> que celles de la maladie/du handicap, et tiennent compte des <strong>ressources</strong> (parfois du <strong>patrimoine</strong>).
                        Ici, on en parle franchement&nbsp;: commencez par notre{" "}
                        <Link
                            href="https://jeanmicheldanto-boop-simulateur-apa-app-rchkyz.streamlit.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold !text-orange-500 hover:!text-orange-600 underline !decoration-orange-500 decoration-2 underline-offset-2"
                            >
                            simulateur APA
                            </Link>
                        (participation et reste à charge).
                    </p>
                    </div>
                </div>
                </li>
            </ol>
            </Section>

        <Section id="reperes-aides">
            <h2 className="text-2xl font-semibold">Repères sur les aides</h2>
            <p className="mt-2 text-neutral-700">
                On vous donne ici quelques grands repères pour les aides.
            </p>

            <div className="mt-6 grid gap-5">
                {/* 1) Les grands types d’aide */}
                <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <h3 className="font-medium">Quatre grands types d’aide</h3>
                <ul className="mt-2 space-y-2 list-disc pl-5 text-neutral-800">
                    <li>
                    <strong>Autonomie au quotidien</strong> : l’<strong>APA</strong> en <strong>GIR 1 à 4</strong> dès qu’un acte
                    essentiel (toilette, habillage…) nécessite de l’aide, et les <strong>caisses de retraite</strong> pour les
                    <strong> GIR 5–6</strong> (heures de prévention&nbsp;: ménage, convivialité, coordination).
                    </li>
                    <li>
                    <strong>Via le médecin</strong> (pathologies) : <abbr title="Service de soins infirmiers à domicile">SSIAD</abbr>,
                    hospitalisation à domicile, matériel médical. En général, <em>quasi aucun reste à charge</em>.
                    </li>
                    <li>
                    <strong>Adapter son logement</strong> :{" "}
                    <Link
                        href="https://france-renov.gouv.fr/aides/maprimeadapt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold !text-orange-600 hover:!text-orange-700 underline !decoration-orange-600 decoration-2 underline-offset-2"
                    >
                        MaPrime’Adapt
                    </Link>{" "}
                    (50–70&nbsp;% des travaux, jusqu’à 10&nbsp;000&nbsp;€).
                    </li>
                    <li>
                    <strong>Accès à un établissement</strong> : <em>aide sociale</em>, surtout pour les EHPAD (les résidences
                    autonomie peuvent aussi être concernées). Le Département peut solliciter l’<em>obligation alimentaire</em>
                    (participation des enfants) et pratiquer une <em>récupération sur succession</em>.
                    </li>
                </ul>
                </div>

                {/* 2) Focus APA */}
                <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <h3 className="font-medium">Focus sur l’APA</h3>
                <ul className="mt-2 space-y-2 list-disc pl-5 text-neutral-800">
                    <li>
                    L’APA concerne celles et ceux qui ont besoin d’aide pour des <strong>actes essentiels</strong> (se laver,
                    s’habiller…). Elle finance principalement des <strong>heures d’aide humaine</strong>.
                    </li>
                    <li>
                    <strong>Trois modes d’intervention</strong> au choix :
                    <ul className="mt-2 list-[circle] pl-5 space-y-1">
                        <li>
                        <strong>Emploi direct</strong> : vous êtes l’employeur (ex. CESU).
                        </li>
                        <li>
                        <strong>Mandataire</strong> : une structure vous accompagne, mais vous restez l’employeur.
                        </li>
                        <li>
                        <strong>Prestataire</strong> : la structure emploie directement les intervenant·es.
                        </li>
                    </ul>
                    </li>
                    <li>
                    C’est donc d’abord un <strong>volume d’heures</strong> plus qu’un virement d’argent&nbsp;: en prestataire,
                    l’APA est souvent versée à la structure et vous ne payez que le <strong>reste à charge</strong>.
                    </li>
                    <li>
                    <strong>Participation</strong> : <em>0&nbsp;€</em> jusqu’à ~1 000&nbsp;€ de ressources mensuelles, puis de <em>0 à 90&nbsp;%</em>.
                    Faites le point avec{" "}
                    <Link
                        href="https://jeanmicheldanto-boop-simulateur-apa-app-rchkyz.streamlit.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold !text-orange-600 hover:!text-orange-700 underline !decoration-orange-600 decoration-2 underline-offset-2"
                    >
                        notre calculateur APA
                    </Link>
                    .
                    </li>
                </ul>
                </div>

                {/* 3) Nos deux conseils */}
                <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <h3 className="font-medium">Nos deux conseils</h3>
                <ul className="mt-2 space-y-2 list-disc pl-5 text-neutral-800">
                    <li>
                    Pensez aux <strong>aides des caisses de retraite</strong> en amont de l’APA. Elles ont été refondues dans le{" "}
                    <Link
                        href="https://www.partenairesactionsociale.fr/sites/ppas/home/oscar.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium !text-orange-600 hover:!text-orange-700 underline !decoration-orange-600 underline-offset-2"
                    >
                        plan OSCAR
                    </Link>
                    , souvent bien pensé et parfois plus avantageux. La demande est la même que pour l’APA (demande d’aide à
                    l’autonomie).
                    </li>
                    <li>
                    Renseignez-vous sur les <strong>aides complémentaires</strong> à l’APA&nbsp;: <em>aides techniques</em> (barres
                    d’appui, antidérapant, éclairage à détection…), <em>heures de répit</em>, <em>heures de convivialité</em> pour
                    le lien social. Elles ne sont pas toujours proposées spontanément.
                    </li>
                </ul>
                </div>
            </div>
            </Section>

        <section id="simulateurs" style={{ scrollMarginTop: SUBNAV_GUARD }}>
          <h2 className="text-2xl font-semibold">Les simulateurs</h2>
          <p className="mt-2 text-neutral-700">
            Deux outils pour vous repérer rapidement et préparer vos démarches.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="https://jeanmicheldanto-boop-simulateur-apa-simple-app-ynirfr.streamlit.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border px-4 py-2 text-neutral-900 border-neutral-300 hover:bg-neutral-50"
            >
              Ouvrir l’outil d’estimation du GIR
            </Link>
            <Link
              href="https://jeanmicheldanto-boop-simulateur-apa-app-rchkyz.streamlit.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border px-4 py-2 text-neutral-900 border-neutral-300 hover:bg-neutral-50"
            >
              Ouvrir le simulateur APA
            </Link>
          </div>
        </section>
      </main>
    </section>
  );
}
function Section({
  id,
  children,
}: React.PropsWithChildren<{ id: string }>) {
  // adapte la valeur si tu as un header/sous-menu fixe au-dessus
  return <section id={id} style={{ scrollMarginTop: 160 }}>{children}</section>;
}
