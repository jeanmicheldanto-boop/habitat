import type { Metadata } from "next";
import SecondaryMenu from "@/components/SecondaryMenu";
import './mentions.css';

export const metadata: Metadata = {
  title: "Mentions Légales · Habitat Intermédiaire",
  description: "Mentions légales du site habitat-intermédiaire.fr édité par ConfidensIA SAS.",
};

export default function MentionsLegales() {
  return (
    <div className="legal-page">
      <SecondaryMenu />
      
      <div className="legal-container">
        <h1 className="legal-title">Mentions Légales</h1>
        <p className="legal-date">Dernière mise à jour : 1er février 2026</p>

        <section className="legal-section">
          <h2>Éditeur du site</h2>
          <p>Le site <strong>habitat-intermédiaire.fr</strong> est édité par :</p>
          <div className="legal-card">
            <p><strong>ConfidensIA SAS</strong><br/>
            Société par Actions Simplifiée en cours d&apos;immatriculation<br/>
            Siège social : 55 rue de l&apos;Abbé Carton, 75014 Paris, France<br/>
            Capital social : 5 000 euros<br/>
            Numéro SIRET : 10081943200012<br/>
            RCS Paris : En cours d&apos;immatriculation</p>
            <p><strong>Directeur de la publication :</strong> Patrick Danto, Directeur Général<br/>
            <strong>Contact :</strong> <a href="mailto:contact@confidensia.fr" className="legal-link">contact@confidensia.fr</a></p>
          </div>
        </section>

        <section className="legal-section">
          <h2>Hébergement</h2>
          
          <h3>Interface utilisateur (frontend)</h3>
          <div className="legal-card">
            <p><strong>Vercel Inc.</strong><br/>
            440 N Barranca Ave #4133<br/>
            Covina, CA 91723<br/>
            États-Unis<br/>
            Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="legal-link">https://vercel.com</a></p>
          </div>

          <h3>Base de données</h3>
          <div className="legal-card">
            <p><strong>Supabase (AWS Europe)</strong><br/>
            Les données sont hébergées sur des serveurs situés dans l&apos;Union Européenne via Amazon Web Services (AWS) région EU.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>Propriété intellectuelle</h2>
          <p>L&apos;ensemble du contenu de ce site (textes, images, logos, structure, base de données) est la propriété exclusive de <strong>ConfidensIA SAS</strong>, sauf mention contraire.</p>
          <p>Les données relatives aux établissements proviennent de sources publiques (répertoire FINESS, sites web officiels des établissements, portail gouvernemental pour-les-personnes-agees.gouv.fr, documents publics).</p>
          <p className="legal-warning">Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l&apos;autorisation écrite préalable de ConfidensIA SAS.</p>
        </section>

        <section className="legal-section">
          <h2>Données sur les établissements</h2>
          
          <h3>Sources des données</h3>
          <p>Les informations sur les établissements d&apos;habitat intermédiaire proviennent exclusivement de sources publiques :</p>
          <ul>
            <li>Répertoire FINESS (Fichier National des Établissements Sanitaires et Sociaux)</li>
            <li>Portail gouvernemental pour-les-personnes-agees.gouv.fr</li>
            <li>Sites web officiels des établissements</li>
            <li>Documents publics accessibles en ligne</li>
          </ul>

          <h3>Exactitude des informations</h3>
          <p>Nous mettons tout en œuvre pour garantir l&apos;exactitude et l&apos;actualité des informations présentées. Toutefois, malgré nos efforts, des erreurs ou omissions peuvent subsister.</p>
          <p className="legal-warning">Les informations affichées sur habitat-intermédiaire.fr ont une valeur purement indicative. Nous recommandons vivement de vérifier directement auprès des établissements concernés les informations essentielles (tarifs, disponibilités, services, conditions d&apos;admission) avant toute décision.</p>

          <h3>Droit de rectification pour les gestionnaires</h3>
          <p>Les gestionnaires d&apos;établissements disposent d&apos;un droit de rectification sur l&apos;ensemble des données les concernant.</p>
          <p>Pour modifier, compléter ou supprimer les informations relatives à votre établissement :</p>
          <ul>
            <li>Connectez-vous à votre espace gestionnaire sur habitat-intermédiaire.fr</li>
            <li>Ou contactez-nous à : <a href="mailto:contact@confidensia.fr" className="legal-link">contact@confidensia.fr</a></li>
          </ul>
          <p>Toute demande de rectification sera traitée dans un délai maximum de 30 jours.</p>
        </section>

        <section className="legal-section">
          <h2>Utilisation de l&apos;API</h2>
          
          <h3>API gratuite</h3>
          <p>L&apos;accès à l&apos;API gratuite est soumis aux conditions suivantes :</p>
          <ul>
            <li>Usage non commercial ou à des fins de recherche</li>
            <li>Respect des limites de volumétrie communiquées</li>
            <li>Attribution de la source (« Données : habitat-intermédiaire.fr »)</li>
          </ul>

          <h3>API premium</h3>
          <p>L&apos;accès à l&apos;API premium contenant les données enrichies fait l&apos;objet d&apos;un contrat spécifique. Pour toute demande : <a href="mailto:contact@confidensia.fr" className="legal-link">contact@confidensia.fr</a></p>
        </section>

        <section className="legal-section">
          <h2>Limitation de responsabilité</h2>
          <p>ConfidensIA SAS ne pourra être tenue responsable :</p>
          <ul>
            <li>Des dommages directs ou indirects résultant de l&apos;accès au site ou de son utilisation</li>
            <li>De l&apos;inexactitude, de l&apos;obsolescence ou de l&apos;incomplétude des informations mises à disposition</li>
            <li>Des interruptions temporaires d&apos;accès au site pour des opérations de maintenance ou pour toute autre raison</li>
          </ul>
          <p className="legal-warning">L&apos;utilisateur est seul responsable de l&apos;utilisation qu&apos;il fait des informations présentes sur le site.</p>
        </section>

        <section className="legal-section">
          <h2>Liens hypertextes</h2>
          <p>Le site peut contenir des liens hypertextes vers d&apos;autres sites. ConfidensIA SAS n&apos;exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.</p>
        </section>

        <section className="legal-section">
          <h2>Droit applicable</h2>
          <p>Les présentes mentions légales sont régies par le droit français. Tout litige relatif à l&apos;utilisation du site sera soumis à la compétence exclusive des tribunaux de Paris.</p>
        </section>
      </div>
    </div>
  );
}
