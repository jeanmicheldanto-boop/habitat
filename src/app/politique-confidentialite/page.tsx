import type { Metadata } from "next";
import SecondaryMenu from "@/components/SecondaryMenu";
import '../mentions-legales/mentions.css';

export const metadata: Metadata = {
  title: "Politique de Confidentialité · Habitat Intermédiaire",
  description: "Politique de confidentialité et protection des données personnelles sur habitat-intermédiaire.fr - Conformité RGPD.",
};

export default function PolitiqueConfidentialite() {
  return (
    <div className="legal-page">
      <SecondaryMenu />
      
      <div className="legal-container">
        <h1 className="legal-title">Politique de Confidentialité</h1>
        <p className="legal-date">Dernière mise à jour : 1er février 2026</p>

        <section className="legal-section">
          <h2>Introduction</h2>
          <p><strong>ConfidensIA SAS</strong>, éditeur du site habitat-intermédiaire.fr, s&apos;engage à protéger la vie privée de ses utilisateurs et à traiter leurs données personnelles dans le respect du Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679) et de la loi Informatique et Libertés.</p>
          <p>Cette politique de confidentialité a pour objectif de vous informer de manière claire et transparente sur :</p>
          <ul>
            <li>Les données que nous collectons</li>
            <li>L&apos;utilisation que nous en faisons</li>
            <li>Vos droits concernant vos données personnelles</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>1. Responsable de traitement</h2>
          <div className="legal-card">
            <p><strong>ConfidensIA SAS</strong><br/>
            55 rue de l&apos;Abbé Carton<br/>
            75014 Paris, France<br/>
            Email : <a href="mailto:contact@confidensia.fr" className="legal-link">contact@confidensia.fr</a><br/>
            Représentant légal : Patrick Danto, Directeur Général</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>2. Données collectées et finalités</h2>
          
          <h3>2.1 Navigation sur le site (utilisateurs)</h3>
          <p><strong>Données collectées :</strong> Aucune donnée personnelle n&apos;est collectée lors de la simple navigation sur le site.</p>
          <p className="legal-warning">Nous n&apos;utilisons actuellement aucun cookie analytique, publicitaire ou de suivi.</p>
          <p><strong>Données techniques (logs serveur) :</strong></p>
          <ul>
            <li>Adresse IP (anonymisée après 24 heures)</li>
            <li>Type de navigateur</li>
            <li>Pages consultées</li>
            <li>Horodatage des visites</li>
          </ul>
          <p><strong>Finalité :</strong> Sécurité du site, détection d&apos;abus, amélioration technique.<br/>
          <strong>Base légale :</strong> Intérêt légitime (sécurité et bon fonctionnement du service).<br/>
          <strong>Durée de conservation :</strong> 90 jours maximum.</p>

          <h3>2.2 Utilisation de l&apos;assistant conversationnel</h3>
          <p><strong>Données collectées :</strong></p>
          <ul>
            <li>Contenu des conversations (questions posées, réponses fournies)</li>
            <li>Horodatage</li>
            <li>Identifiant de session (anonyme)</li>
          </ul>
          <p><strong>Finalité :</strong></p>
          <ul>
            <li>Amélioration de la qualité des réponses</li>
            <li>Formation et amélioration du modèle d&apos;intelligence artificielle</li>
            <li>Recherche et développement</li>
          </ul>
          <p><strong>Base légale :</strong> Intérêt légitime (amélioration du service) et consentement implicite par l&apos;utilisation du service.<br/>
          <strong>Durée de conservation :</strong> 24 mois maximum, puis anonymisation complète ou suppression.</p>
          <p className="legal-warning"><strong>Précision importante :</strong> Les conversations sont anonymes par défaut. Aucune donnée personnelle identifiante (nom, email, adresse) n&apos;est associée aux échanges, sauf si vous choisissez volontairement de les mentionner dans votre message.</p>
          <p><strong>Vos droits :</strong> Vous pouvez à tout moment nous demander la suppression de vos conversations en nous contactant à : <a href="mailto:contact@confidensia.fr" className="legal-link">contact@confidensia.fr</a></p>

          <h3>2.3 Espace gestionnaire d&apos;établissement</h3>
          <p><strong>Données collectées :</strong></p>
          <ul>
            <li>Nom et prénom de l&apos;interlocuteur</li>
            <li>Organisation (nom de l&apos;établissement)</li>
            <li>Adresse email professionnelle</li>
          </ul>
          <p><strong>Finalité :</strong></p>
          <ul>
            <li>Validation de votre qualité de gestionnaire ou représentant de l&apos;établissement</li>
            <li>Gestion des demandes de modification des fiches établissements</li>
            <li>Communication relative à votre établissement</li>
          </ul>
          <p><strong>Base légale :</strong> Exécution de mesures précontractuelles (demande de rectification des données) et intérêt légitime (qualité de la base de données).<br/>
          <strong>Durée de conservation :</strong></p>
          <ul>
            <li>Compte actif : Durée de la relation + 3 ans</li>
            <li>Compte inactif (aucune connexion pendant 3 ans) : Suppression automatique après notification</li>
          </ul>

          <h3>2.4 Utilisation de l&apos;API</h3>
          <p><strong>Données collectées (API gratuite et premium) :</strong></p>
          <ul>
            <li>Clé API (identifiant technique)</li>
            <li>Logs d&apos;utilisation (endpoints appelés, volumétrie, horodatage)</li>
            <li>Adresse IP (anonymisée après 24 heures)</li>
          </ul>
          <p><strong>Finalité :</strong></p>
          <ul>
            <li>Gestion des quotas d&apos;utilisation</li>
            <li>Détection d&apos;abus ou d&apos;usage anormal</li>
            <li>Facturation (API premium uniquement)</li>
            <li>Amélioration du service</li>
          </ul>
          <p><strong>Base légale :</strong> Exécution du contrat (conditions d&apos;utilisation de l&apos;API).<br/>
          <strong>Durée de conservation :</strong> 12 mois maximum.</p>
        </section>

        <section className="legal-section">
          <h2>3. Données sur les établissements</h2>
          <p className="legal-warning"><strong>Important :</strong> La base de données d&apos;habitat-intermédiaire.fr contient des informations sur des personnes morales (établissements, organisations) issues de sources publiques.</p>
          <p><strong>Informations publiées :</strong></p>
          <ul>
            <li>Nom de l&apos;établissement</li>
            <li>Adresse, commune, département</li>
            <li>Téléphone, email, site web (coordonnées professionnelles publiques)</li>
            <li>Services, tarifs, caractéristiques (informations publiques)</li>
          </ul>
          <p>Ces informations concernent les établissements en tant que structures d&apos;accueil et relèvent de l&apos;information publique.</p>
          <p><strong>Droit de rectification des gestionnaires :</strong> Les gestionnaires d&apos;établissements ou leurs représentants disposent d&apos;un droit de rectification, de modification ou de suppression de l&apos;ensemble des informations concernant leur établissement (voir section 5).</p>
        </section>

        <section className="legal-section">
          <h2>4. Destinataires des données</h2>
          <p className="legal-warning">Vos données personnelles ne sont jamais vendues, louées ou échangées à des tiers.</p>
          <p><strong>Accès limité aux données :</strong></p>
          <ul>
            <li>Équipe technique de ConfidensIA (strictement nécessaire pour gestion et support)</li>
            <li>Hébergeurs : Vercel Inc. (interface) et Supabase/AWS EU (base de données)</li>
          </ul>
          <p><strong>Transferts hors Union Européenne :</strong></p>
          <ul>
            <li><strong>Vercel Inc. (États-Unis) :</strong> Interface utilisateur hébergée aux États-Unis. Vercel est conforme aux clauses contractuelles types de la Commission européenne.</li>
            <li><strong>Supabase/AWS :</strong> Base de données hébergée dans l&apos;Union Européenne (région EU).</li>
          </ul>
          <p>Nous nous assurons que tous nos sous-traitants présentent des garanties suffisantes quant à la mise en œuvre de mesures techniques et organisationnelles appropriées pour la protection des données.</p>
        </section>

        <section className="legal-section">
          <h2>5. Vos droits</h2>
          <p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
          
          <div className="legal-card">
            <p><strong>Droit d&apos;accès</strong><br/>
            Vous pouvez demander la confirmation que nous traitons vos données personnelles et en obtenir une copie.</p>
            
            <p><strong>Droit de rectification</strong><br/>
            Vous pouvez demander la correction de données inexactes ou incomplètes.</p>
            
            <p><strong>Droit à l&apos;effacement (&quot;droit à l&apos;oubli&quot;)</strong><br/>
            Vous pouvez demander la suppression de vos données personnelles dans certaines conditions.</p>
            
            <p><strong>Droit à la limitation du traitement</strong><br/>
            Vous pouvez demander la limitation du traitement de vos données dans certaines situations.</p>
            
            <p><strong>Droit d&apos;opposition</strong><br/>
            Vous pouvez vous opposer au traitement de vos données fondé sur l&apos;intérêt légitime.</p>
            
            <p><strong>Droit à la portabilité</strong><br/>
            Vous pouvez recevoir vos données dans un format structuré et couramment utilisé, ou demander leur transmission directe à un autre responsable de traitement.</p>
            
            <p><strong>Droit de retirer votre consentement</strong><br/>
            Lorsque le traitement est fondé sur votre consentement, vous pouvez le retirer à tout moment.</p>
            
            <p><strong>Droit de définir des directives post-mortem</strong><br/>
            Vous pouvez définir des directives relatives au sort de vos données après votre décès.</p>
          </div>

          <h3>Comment exercer vos droits ?</h3>
          <p><strong>Par email :</strong> <a href="mailto:contact@confidensia.fr" className="legal-link">contact@confidensia.fr</a><br/>
          Objet : &quot;Exercice de mes droits RGPD&quot;</p>
          <p><strong>Ou par courrier postal :</strong><br/>
          ConfidensIA SAS<br/>
          À l&apos;attention du Responsable des données<br/>
          55 rue de l&apos;Abbé Carton<br/>
          75014 Paris</p>
          <p>Nous nous engageons à répondre à votre demande dans un délai maximum de 30 jours à compter de sa réception.</p>

          <h3>Droit de réclamation auprès de la CNIL :</h3>
          <p>Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la Commission Nationale de l&apos;Informatique et des Libertés (CNIL) :</p>
          <div className="legal-card">
            <p><strong>CNIL</strong><br/>
            3 Place de Fontenoy<br/>
            TSA 80715<br/>
            75334 Paris Cedex 07<br/>
            Téléphone : 01 53 73 22 22<br/>
            Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="legal-link">https://www.cnil.fr</a></p>
          </div>
        </section>

        <section className="legal-section">
          <h2>6. Sécurité des données</h2>
          <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour assurer la sécurité de vos données personnelles et les protéger contre :</p>
          <ul>
            <li>La destruction accidentelle ou illicite</li>
            <li>La perte accidentelle</li>
            <li>L&apos;altération, la diffusion ou l&apos;accès non autorisé</li>
          </ul>
          <p><strong>Mesures de sécurité :</strong></p>
          <ul>
            <li>Chiffrement des communications (HTTPS/TLS)</li>
            <li>Authentification sécurisée pour l&apos;espace gestionnaire</li>
            <li>Sauvegardes régulières et redondantes</li>
            <li>Accès aux données strictement limité et tracé</li>
            <li>Hébergement sur infrastructures certifiées (AWS, Vercel)</li>
            <li>Anonymisation des adresses IP après 24 heures</li>
          </ul>
          <p className="legal-warning">En cas de violation de données susceptible d&apos;engendrer un risque élevé pour vos droits et libertés, nous nous engageons à vous en informer dans les meilleurs délais, conformément à la réglementation.</p>
        </section>

        <section className="legal-section">
          <h2>7. Cookies et technologies similaires</h2>
          <p className="legal-warning"><strong>Situation actuelle :</strong> habitat-intermédiaire.fr n&apos;utilise actuellement aucun cookie analytique, publicitaire ou de suivi.</p>
          <p><strong>Cookies techniques strictement nécessaires :</strong><br/>
          Nous utilisons uniquement des cookies essentiels au fonctionnement du site (session utilisateur pour l&apos;espace gestionnaire). Ces cookies ne nécessitent pas de consentement préalable.</p>
          <p><strong>Évolution future :</strong><br/>
          Si nous devions introduire des cookies analytiques ou autres technologies de suivi, nous vous en informerions préalablement et recueillerions votre consentement via un bandeau dédié.</p>
          <p>Vous pouvez configurer votre navigateur pour refuser tous les cookies ou vous alerter lorsqu&apos;un cookie est déposé. Attention : le refus de cookies techniques peut affecter le bon fonctionnement de certaines fonctionnalités du site.</p>
        </section>

        <section className="legal-section">
          <h2>8. Modifications de la politique de confidentialité</h2>
          <p>Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment, notamment pour l&apos;adapter aux évolutions réglementaires, techniques ou de nos services.</p>
          <p><strong>Date de dernière mise à jour :</strong> 1er février 2026</p>
          <p>Toute modification substantielle fera l&apos;objet d&apos;une information claire lors de votre prochaine visite sur le site.</p>
          <p>Nous vous invitons à consulter régulièrement cette page pour prendre connaissance des éventuelles modifications.</p>
        </section>

        <section className="legal-section">
          <h2>9. Contact</h2>
          <p>Pour toute question relative à la protection de vos données personnelles ou pour exercer vos droits :</p>
          <div className="legal-card">
            <p><strong>Email :</strong> <a href="mailto:contact@confidensia.fr" className="legal-link">contact@confidensia.fr</a></p>
            <p><strong>Courrier :</strong><br/>
            ConfidensIA SAS<br/>
            À l&apos;attention du Responsable des données<br/>
            55 rue de l&apos;Abbé Carton<br/>
            75014 Paris</p>
          </div>
          <p>Nous nous engageons à vous répondre dans les meilleurs délais.</p>
        </section>

        <div style={{textAlign: 'center', marginTop: '60px', padding: '24px', background: 'linear-gradient(135deg, rgba(217, 135, 106, 0.08) 0%, rgba(193, 105, 74, 0.08) 100%)', borderRadius: '12px'}}>
          <p style={{margin: 0, fontSize: '18px', fontWeight: 600, color: '#d9876a'}}>
            habitat-intermédiaire.fr — Vos données, votre choix, notre engagement.
          </p>
        </div>
      </div>
    </div>
  );
}
