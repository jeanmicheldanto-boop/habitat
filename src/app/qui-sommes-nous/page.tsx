import React from 'react';
import SecondaryMenu from '@/components/SecondaryMenu';
import './qui-sommes-nous.css';

export default function QuiSommesNous() {
  return (
    <div className="qui-sommes-nous-page">
      <SecondaryMenu />
      
      <div className="qsn-container">
        {/* Hero Section */}
        <section className="qsn-hero">
          <h1 className="qsn-title">Qui sommes-nous ?</h1>
          <p className="qsn-subtitle">
            <strong>habitat-intermédiaire.fr</strong> : un projet R&D ConfidensIA
          </p>
        </section>

        {/* Introduction */}
        <section className="qsn-section">
          <div className="qsn-card">
            <p className="qsn-intro">
              <strong>habitat-intermédiaire.fr</strong> est un projet de recherche et développement porté par <strong>ConfidensIA</strong>, 
              une structure dédiée à la création de solutions technologiques au service de l'humain dans le secteur social et médico-social.
            </p>
            <div className="qsn-conviction">
              <strong>Notre conviction :</strong> les problèmes les plus difficiles du secteur — accès à l'information, 
              complexité administrative, manque de transparence — peuvent être résolus en mobilisant intelligemment 
              le data engineering et l'intelligence artificielle.
            </div>
          </div>
        </section>

        {/* ConfidensIA */}
        <section className="qsn-section">
          <h2 className="qsn-section-title">ConfidensIA : la technologie au service de l'humain</h2>
          <div className="qsn-card">
            <p>
              <strong>ConfidensIA</strong> développe des outils innovants pour répondre aux défis concrets du secteur social et médico-social : 
              conformité réglementaire (RGPD), tarification complexe, et accès aux ressources dispersées.
            </p>
            <p>
              <strong>Notre approche :</strong> s'attaquer aux problèmes réellement difficiles, ceux qui demandent à la fois une expertise 
              métier approfondie et une maîtrise technique avancée. Nous croyons que la technologie doit simplifier le quotidien 
              des professionnels et faciliter les choix de vie des familles.
            </p>
          </div>
        </section>

        {/* Base de données */}
        <section className="qsn-section">
          <h2 className="qsn-section-title">Comment la base de données a été constituée</h2>
          <div className="qsn-card">
            <h3 className="qsn-subsection-title">Transparence totale sur nos sources :</h3>
            <p>Nous avons construit notre base de données <strong>uniquement à partir de sources publiques</strong> :</p>
            <ul className="qsn-list">
              <li>Données officielles du répertoire <strong>FINESS</strong> (établissements sanitaires, sociaux et médico-sociaux)</li>
              <li>Sites web officiels des établissements</li>
              <li>Documents publics (rapports d'activité, plaquettes d'information accessibles en ligne)</li>
            </ul>

            <h3 className="qsn-subsection-title qsn-mt">Ce que nous ne faisons pas :</h3>
            <div className="qsn-no-list">
              <div className="qsn-no-item">❌ Pas d'extraction depuis des annuaires privés ou commerciaux</div>
              <div className="qsn-no-item">❌ Pas de revente de données personnelles</div>
              <div className="qsn-no-item">❌ Pas de scraping de contenus protégés</div>
            </div>

            <h3 className="qsn-subsection-title qsn-mt">Notre méthode :</h3>
            <p>
              Nous utilisons des technologies d'<strong>intelligence artificielle</strong> pour enrichir et structurer ces données publiques : 
              géolocalisation précise, extraction de tarifs, identification des services proposés, amélioration de la qualité des descriptions.
            </p>
            <div className="qsn-highlight">
              <strong>Le résultat :</strong> une base de plus de <strong>3 400 établissements</strong> d'habitat intermédiaire 
              avec des informations claires, vérifiées et actualisées régulièrement.
            </div>
          </div>
        </section>

        {/* API */}
        <section className="qsn-section">
          <h2 className="qsn-section-title">Accès aux données : API gratuite et API complète</h2>
          
          <div className="qsn-two-cols">
            <div className="qsn-card qsn-api-card">
              <h3 className="qsn-api-title">Pour les développeurs, chercheurs et acteurs du secteur :</h3>
              <p>Nous mettons à disposition une <strong>API gratuite</strong> donnant accès aux informations principales :</p>
              <ul className="qsn-list">
                <li>Nom, adresse, localisation (géolocalisation)</li>
                <li>Type d'établissement (résidence services, résidence autonomie, EHPAD, etc.)</li>
                <li>Coordonnées de contact</li>
              </ul>
            </div>

            <div className="qsn-card qsn-api-card qsn-premium">
              <h3 className="qsn-api-title">Pour les besoins professionnels avancés :</h3>
              <p>Une <strong>API premium</strong> donne accès à l'ensemble des données enrichies :</p>
              <ul className="qsn-list">
                <li>Tarifs détaillés par type de logement</li>
                <li>Services proposés (restauration, animation, soins, etc.)</li>
                <li>Caractéristiques des logements (surfaces, équipements)</li>
                <li>Descriptions détaillées et actualisées</li>
              </ul>
            </div>
          </div>

          <div className="qsn-cta">
            👉 <a href="mailto:contact@confidensia.fr" className="qsn-link">Contactez-nous</a> pour en savoir plus sur l'API complète 
            et discuter de vos besoins spécifiques.
          </div>
        </section>

        {/* Valeurs */}
        <section className="qsn-section">
          <h2 className="qsn-section-title">Nos valeurs</h2>
          
          <div className="qsn-card">
            <h3 className="qsn-value-title">💚 La gratuité pour les familles</h3>
            <p>
              L'accès à l'information sur l'habitat intermédiaire ne doit jamais être un privilège. Notre plateforme est 
              <strong> 100% gratuite</strong> pour les familles et les personnes en recherche d'un lieu de vie adapté.
            </p>
            <p>
              Vous consultez librement, sans formulaire obligatoire, sans publicité intrusive. Vous décidez si et quand 
              vous souhaitez entrer en contact avec un établissement.
            </p>
          </div>

          <div className="qsn-card">
            <h3 className="qsn-value-title">🏡 La focalisation sur les solutions alternatives à l'institution</h3>
            <p>
              Nous croyons que l'EHPAD n'est pas la seule réponse au vieillissement ou à la perte d'autonomie.
            </p>
            <p>
              Notre plateforme valorise les <strong>habitats intermédiaires</strong> — résidences autonomie, résidences services seniors, 
              habitats inclusifs, habitats intergénérationnels — qui permettent de préserver autonomie, lien social et liberté 
              de choix le plus longtemps possible.
            </p>
            <p className="qsn-emphasis">Ces solutions, souvent méconnues, méritent d'être mises en lumière.</p>
          </div>

          <div className="qsn-card">
            <h3 className="qsn-value-title">✨ Donner à chacun les moyens de choisir</h3>
            
            <div className="qsn-choice-item">
              <strong>Sans pression commerciale :</strong>
              <p>
                Nous ne touchons aucune commission sur les mises en relation. Notre seul intérêt est que vous trouviez 
                l'habitat qui vous correspond.
              </p>
            </div>

            <div className="qsn-choice-item">
              <strong>Sans jargon administratif :</strong>
              <p>
                Nous traduisons la complexité réglementaire en informations claires et accessibles. GIR, AGGIR, tarification ternaire ? 
                Nous vous expliquons ce que cela signifie concrètement pour vous.
              </p>
            </div>

            <div className="qsn-choice-item">
              <strong>Avec respect de votre singularité :</strong>
              <p>
                Chaque personne a des besoins, des envies et un parcours de vie unique. Notre outil vous aide à identifier 
                ce qui compte vraiment pour vous, au-delà des étiquettes institutionnelles.
              </p>
            </div>
          </div>
        </section>

        {/* Originalité */}
        <section className="qsn-section">
          <h2 className="qsn-section-title">Notre originalité</h2>
          
          <div className="qsn-card qsn-highlight-card">
            <h3 className="qsn-value-title">🤖 Un assistant conversationnel intelligent</h3>
            <p>
              Nous proposons un <strong>assistant conversationnel</strong> spécialisé dans l'habitat intermédiaire.
            </p>
            <p>Grâce à l'intelligence artificielle, il peut :</p>
            <ul className="qsn-list">
              <li>Répondre à vos questions sur les différents types d'habitat (« C'est quoi une résidence autonomie ? »)</li>
              <li>Vous guider dans vos choix selon vos critères (autonomie, budget, localisation, services)</li>
              <li>Rechercher des établissements adaptés dans notre base enrichie</li>
              <li>Vous fournir des informations fiables sur les aides financières, les démarches d'admission, etc.</li>
            </ul>
            <p className="qsn-emphasis">Un expert accessible 24/7, sans jugement, sans jargon, gratuitement.</p>
          </div>

          <div className="qsn-card">
            <h3 className="qsn-value-title">🔬 Une démarche de R&D au service du bien commun</h3>
            <p>
              <strong>habitat-intermédiaire.fr</strong> est avant tout un laboratoire d'innovation.
            </p>
            <p>
              Nous testons des technologies avancées (intelligence artificielle, traitement automatique du langage naturel, 
              enrichissement de données) pour répondre à une question simple : <em>comment rendre l'information accessible à tous ?</em>
            </p>
            <p>
              Les enseignements de ce projet nourrissent d'autres initiatives ConfidensIA, et nous partageons nos méthodes 
              avec les acteurs du secteur qui souhaitent améliorer la transparence et l'accès aux ressources sociales et médico-sociales.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="qsn-section qsn-contact-section">
          <h2 className="qsn-section-title">Contact</h2>
          <div className="qsn-card qsn-contact-card">
            <p>Vous avez des questions, des suggestions, ou vous souhaitez accéder à l'API complète ?</p>
            <div className="qsn-contact-info">
              📧 <a href="mailto:contact@confidensia.fr" className="qsn-contact-link">contact@confidensia.fr</a>
            </div>
            <p className="qsn-contact-text">Nous serions ravis d'échanger avec vous.</p>
          </div>
        </section>

        {/* Footer tagline */}
        <div className="qsn-tagline">
          <strong>habitat-intermédiaire.fr</strong> — Parce que bien vieillir, c'est d'abord bien choisir.
        </div>
      </div>
    </div>
  );
}
