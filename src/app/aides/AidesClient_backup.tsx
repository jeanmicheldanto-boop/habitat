"use client";

import Link from "next/link";



export default function AidesClient() {
  return (
    <main className="max-w-5xl mx-auto py-10 px-4">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-orange-700 mb-4">Les aides</h1>
        <p className="text-lg text-gray-700 mb-2">
          Rassurez-vous, même des professionnels aguerris s&#39;y perdent parfois dans les dispositifs. Si ce n&#39;est pas clair pour vous, ce n&#39;est pas vous le responsable. La plateforme <em>habitat-intermediaire.fr</em> met à votre disposition des outils <strong>simples</strong> et <strong>pratiques</strong> pour vous repérer et mettre en place, pour vous ou vos proches, les aides utiles pour bien vieillir.
        </p>
        <p className="text-md text-gray-600 mb-2">
          Notre objectif n&#39;est pas de vous vendre quoi que ce soit, mais de rendre accessibles les services offerts aux personnes en perte d&#39;autonomie, quel que soit leur statut. Notre approche s&#39;appuie sur notre <strong>expérience d&#39;aidant</strong> et notre <strong>expertise du secteur</strong>. Nous ne sommes pas une institution officielle, ce qui nous permet de parler vrai. On parle ici de ce qui compte au quotidien : <em>participation</em> à l&#39;APA, <em>vrai coût</em> des solutions, et repères concrets.
        </p>
        <div className="mt-6 p-6 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-md text-orange-900">
            Si vous traversez une période de stress — “Comment on s&#39;organise ?”, “Rester chez moi ?”, “Combien ça coûte ?” — vous n&#39;êtes pas seul. Ces moments peuvent aussi ouvrir sur de <strong>belles rencontres</strong> et une vraie <strong>prévention</strong>. Bonne nouvelle : <strong>des aides existent</strong> et vous pouvez être accompagné.
          </p>
        </div>
      </header>

      {/* Navigation rapide - masquée sur mobile */}
      <nav className="mb-8 hidden md:flex flex-wrap gap-4 justify-center">
        <a href="#bons-reflexes" className="px-4 py-2 rounded-full bg-orange-100 text-orange-900 font-semibold hover:bg-orange-200 transition">Bons réflexes</a>
        <a href="#reperes-aides" className="px-4 py-2 rounded-full bg-orange-100 text-orange-900 font-semibold hover:bg-orange-200 transition">Repères sur les aides</a>
        <a href="#simulateurs" className="px-4 py-2 rounded-full bg-orange-700 text-white font-semibold hover:bg-orange-800 transition">Simulateurs</a>
      </nav>

      <main className="space-y-20">
        <Section id="bons-reflexes">
          <h2 className="text-2xl font-bold text-orange-800 mb-2">Les bons réflexes</h2>
          <p className="text-md text-gray-700 mb-6">Ces conseils peuvent s’appliquer aux personnes qui avancent en âge comme à leurs proches aidants.</p>
          <ol className="mt-6 space-y-5">
            {/* 1 */}
            <li className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">1</span>
                <div className="space-y-1">
                  <h3 className="font-semibold text-orange-900">Penser prévention avant de penser « dépendance »</h3>
                  <p className="text-gray-700">
                    Inutile de trop anticiper sur ce qui n’ira pas : on peut agir aujourd’hui pour aller mieux demain. Trois domaines ont largement fait leurs preuves : <strong>parler</strong>, <strong>bouger</strong>, <strong>bien manger</strong>. Le <em>lien social</em> (conversations régulières), l’<em>activité physique</em> (même douce) et une <em>alimentation</em> saine et plaisante préservent vos capacités. Pour évaluer votre degré d&#39;autonomie et accéder à des conseils personnalisés, vous pouvez utiliser {" "}
                    <Link href="https://jeanmicheldanto-boop-simulateur-apa-simple-app-ynirfr.streamlit.app/" target="_blank" rel="noopener noreferrer" className="font-semibold !text-orange-600 hover:!text-orange-700 underline !decoration-orange-600 decoration-2 underline-offset-2">notre simulateur GIR</Link>
                  </p>
                </div>
              </div>
            </li>
            {/* 2 */}
            <li className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">2</span>
                <div className="space-y-1">
                  <h3 className="font-semibold text-orange-900">Faites ce qui vous plaît</h3>
                  <p className="text-gray-700">
                    Ce sont <strong>vos choix de vie</strong>. Ne cherchez pas d’abord ce qui rassurerait vos proches (ou vous-même si vous êtes aidant), mais ce dont <strong>vous avez envie</strong>. La variété des solutions d’<em>habitat intermédiaire</em> permet d’aligner envies et moyens. Un point vous stresse ? <strong>Parlez-en</strong> plutôt que de vous convaincre seul(e).
                  </p>
                </div>
              </div>
            </li>
            {/* 3 */}
            <li className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">3</span>
                <div className="space-y-1">
                  <h3 className="font-semibold text-orange-900">Le point d&#39;entrée pour les infos : votre mairie</h3>
                  <p className="text-gray-700">
                    Le paysage des aides est un vrai labyrinthe (CLIC, France Services, Département, Service public départemental de l&#39;autonomie…). Dans la pratique, la <strong>mairie</strong> est souvent le meilleur point d&#39;entrée : elle vous oriente vers la bonne porte du territoire.
                  </p>
                </div>
              </div>
            </li>
            {/* 4 */}
            <li className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">4</span>
                <div className="space-y-1">
                  <h3 className="font-semibold text-orange-900">Soignez les transitions</h3>
                  <p className="text-gray-700">
                    Les <strong>ruptures</strong> (départ en retraite, déménagement, retour d’hospitalisation, chute…) fragilisent. Ces moments se <strong>préparent</strong> et se <strong>parlent</strong>. N’hésitez pas à demander de l’aide pour éviter la marche trop haute.
                  </p>
                </div>
              </div>
            </li>
            {/* 5 */}
            <li className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">5</span>
                <div className="space-y-1">
                  <h3 className="font-semibold text-orange-900">Le coût n’est pas tabou</h3>
                  <p className="text-gray-700">
                    Les non-dits financiers créent du stress. Mieux vaut clarifier tôt : les aides liées au vieillissement sont <em>moins avantageuses</em> que celles de la maladie/du handicap, et tiennent compte des <strong>ressources</strong> (parfois du <strong>patrimoine</strong>). Ici, on en parle franchement : commencez par notre {" "}
                    <Link href="https://jeanmicheldanto-boop-simulateur-apa-app-rchkyz.streamlit.app/" target="_blank" rel="noopener noreferrer" className="font-semibold !text-orange-600 hover:!text-orange-700 underline !decoration-orange-600 decoration-2 underline-offset-2">simulateur APA</Link> (participation et reste à charge).
                  </p>
                </div>
              </div>
            </li>
          </ol>
        </Section>

        <Section id="reperes-aides">
          <h2 className="text-2xl font-bold text-orange-800 mb-2">Repères sur les aides</h2>
          <p className="text-md text-gray-700 mb-6">On vous donne ici quelques grands repères pour les aides.</p>
          <div className="mt-6 grid gap-5">
            {/* 1) Les grands types d’aide */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-semibold text-orange-900">Quatre grands types d’aide</h3>
              <ul className="mt-2 space-y-2 list-disc pl-5 text-gray-800">
                <li><strong>Autonomie au quotidien</strong> : l’<strong>APA</strong> en <strong>GIR 1 à 4</strong> dès qu’un acte essentiel (toilette, habillage…) nécessite de l’aide, et les <strong>caisses de retraite</strong> pour les <strong>GIR 5–6</strong> (heures de prévention : ménage, convivialité, coordination).</li>
                <li><strong>Via le médecin</strong> (pathologies) : <abbr title="Service de soins infirmiers à domicile">SSIAD</abbr>, hospitalisation à domicile, matériel médical. En général, <em>quasi aucun reste à charge</em>.</li>
                <li><strong>Adapter son logement</strong> : <Link href="https://france-renov.gouv.fr/aides/maprimeadapt" target="_blank" rel="noopener noreferrer" className="font-semibold !text-orange-600 hover:!text-orange-700 underline !decoration-orange-600 decoration-2 underline-offset-2">MaPrime’Adapt</Link> (50–70 % des travaux, jusqu’à 10 000 €).</li>
                <li><strong>Accès à un établissement</strong> : <em>aide sociale</em>, surtout pour les EHPAD (les résidences autonomie peuvent aussi être concernées). Le Département peut solliciter l’<em>obligation alimentaire</em> (participation des enfants) et pratiquer une <em>récupération sur succession</em>.</li>
              </ul>
            </div>
            {/* 2) Focus APA */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-semibold text-orange-900">Focus sur l’APA</h3>
              <ul className="mt-2 space-y-2 list-disc pl-5 text-gray-800">
                <li>L’APA concerne celles et ceux qui ont besoin d’aide pour des <strong>actes essentiels</strong> (se laver, s’habiller…). Elle finance principalement des <strong>heures d’aide humaine</strong>.</li>
                <li><strong>Trois modes d’intervention</strong> au choix :
                  <ul className="mt-2 list-[circle] pl-5 space-y-1">
                    <li><strong>Emploi direct</strong> : vous êtes l’employeur (ex. CESU).</li>
                    <li><strong>Mandataire</strong> : une structure vous accompagne, mais vous restez l’employeur.</li>
                    <li><strong>Prestataire</strong> : la structure emploie directement les intervenant·es.</li>
                  </ul>
                </li>
                <li>C’est donc d’abord un <strong>volume d’heures</strong> plus qu’un virement d’argent : en prestataire, l’APA est souvent versée à la structure et vous ne payez que le <strong>reste à charge</strong>.</li>
                <li><strong>Participation</strong> : <em>0 €</em> jusqu’à ~1 000 € de ressources mensuelles, puis de <em>0 à 90 %</em>. Faites le point avec {" "}<Link href="https://jeanmicheldanto-boop-simulateur-apa-app-rchkyz.streamlit.app/" target="_blank" rel="noopener noreferrer" className="font-semibold !text-orange-600 hover:!text-orange-700 underline !decoration-orange-600 decoration-2 underline-offset-2">notre calculateur APA</Link>.</li>
              </ul>
            </div>
            {/* 3) Nos deux conseils */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-semibold text-orange-900">Nos deux conseils</h3>
              <ul className="mt-2 space-y-2 list-disc pl-5 text-gray-800">
                <li>Pensez aux <strong>aides des caisses de retraite</strong> en amont de l’APA. Elles ont été refondues dans le {" "}<Link href="https://www.partenairesactionsociale.fr/sites/ppas/home/oscar.html" target="_blank" rel="noopener noreferrer" className="font-medium !text-orange-600 hover:!text-orange-700 underline !decoration-orange-600 underline-offset-2">plan OSCAR</Link>, souvent bien pensé et parfois plus avantageux. La demande est la même que pour l’APA (demande d’aide à l’autonomie).</li>
                <li>Renseignez-vous sur les <strong>aides complémentaires</strong> à l’APA : <em>aides techniques</em> (barres d’appui, antidérapant, éclairage à détection…), <em>heures de répit</em>, <em>heures de convivialité</em> pour le lien social. Elles ne sont pas toujours proposées spontanément.</li>
              </ul>
            </div>
          </div>
        </Section>

        <section id="simulateurs" className="mb-16">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-orange-900 mb-2">🧮 Simulateurs</h2>
            <p className="text-md text-orange-800 mb-2">Deux outils pour vous repérer rapidement et préparer vos démarches.</p>
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              <Link href="https://jeanmicheldanto-boop-simulateur-apa-simple-app-ynirfr.streamlit.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-md bg-orange-700 px-4 py-2 text-white hover:bg-orange-800">Ouvrir l’outil d’estimation du GIR</Link>
              <Link href="https://jeanmicheldanto-boop-simulateur-apa-app-rchkyz.streamlit.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-md bg-orange-700 px-4 py-2 text-white hover:bg-orange-800">Ouvrir le simulateur APA</Link>
            </div>
          </div>
        </section>
      </main>
    </main>
  );
}
function Section({
  id,
  children,
}: React.PropsWithChildren<{ id: string }>) {
  // adapte la valeur si tu as un header/sous-menu fixe au-dessus
  return <section id={id} style={{ scrollMarginTop: 160 }}>{children}</section>;
}
