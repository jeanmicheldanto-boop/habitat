"use client";

import { useState } from "react";
import type { Metadata } from "next";
import SecondaryMenu from "../../components/SecondaryMenu";
import './contact.css';

function ContactForm() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    sujet: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      setSuccess(data.message || 'Message envoyé avec succès !');
      setFormData({ nom: '', prenom: '', email: '', sujet: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form" style={{ marginTop: '30px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label htmlFor="nom" style={{ display: 'block', marginBottom: '5px', fontWeight: 500, color: '#333' }}>
            Nom *
          </label>
          <input
            type="text"
            id="nom"
            required
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#d9876a'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
        </div>

        <div>
          <label htmlFor="prenom" style={{ display: 'block', marginBottom: '5px', fontWeight: 500, color: '#333' }}>
            Prénom
          </label>
          <input
            type="text"
            id="prenom"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#d9876a'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
        </div>
      </div>

      <div style={{ marginTop: '15px' }}>
        <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 500, color: '#333' }}>
          Email *
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#d9876a'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
      </div>

      <div style={{ marginTop: '15px' }}>
        <label htmlFor="sujet" style={{ display: 'block', marginBottom: '5px', fontWeight: 500, color: '#333' }}>
          Sujet *
        </label>
        <input
          type="text"
          id="sujet"
          required
          value={formData.sujet}
          onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
          placeholder="Ex: Demande d'accès API, Question sur un établissement..."
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#d9876a'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
      </div>

      <div style={{ marginTop: '15px' }}>
        <label htmlFor="message" style={{ display: 'block', marginBottom: '5px', fontWeight: 500, color: '#333' }}>
          Message *
        </label>
        <textarea
          id="message"
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={6}
          placeholder="Décrivez votre demande..."
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#d9876a'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
      </div>

      {error && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c33'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          backgroundColor: '#efe',
          border: '1px solid #cfc',
          borderRadius: '8px',
          color: '#3c3'
        }}>
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          marginTop: '20px',
          width: '100%',
          padding: '14px',
          backgroundColor: loading ? '#ccc' : '#d9876a',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          opacity: loading ? 0.7 : 1
        }}
        onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#c67659')}
        onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#d9876a')}
      >
        {loading ? 'Envoi en cours...' : 'Envoyer le message'}
      </button>

      <p style={{ marginTop: '15px', fontSize: '13px', color: '#888', textAlign: 'center' }}>
        Vos données sont traitées conformément à notre <a href="/politique-confidentialite" style={{ color: '#d9876a' }}>politique de confidentialité</a>.
      </p>
    </form>
  );
}

export default function ContactPage() {
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
              <strong>habitat-intermédiaire.fr</strong> est un projet de recherche et développement porté par <a href="https://confidensia.fr" target="_blank" rel="noopener noreferrer" className="qsn-link"><strong>ConfidensIA</strong></a>, 
              une structure dédiée à la création de solutions technologiques au service de l&apos;humain dans le secteur social et médico-social.
            </p>
            <div className="qsn-conviction">
              <strong>Notre conviction :</strong> les problèmes les plus difficiles du secteur — accès à l&apos;information, 
              complexité administrative, manque de transparence — peuvent être résolus en mobilisant intelligemment 
              le data engineering et l&apos;intelligence artificielle.
            </div>
          </div>
        </section>

        {/* ConfidensIA */}
        <section className="qsn-section">
          <h2 className="qsn-section-title"><a href="https://confidensia.fr" target="_blank" rel="noopener noreferrer" className="qsn-link" style={{textDecoration: 'none', color: 'inherit'}}>ConfidensIA</a> : la technologie au service de l&apos;humain</h2>
          <div className="qsn-card">
            <p>
              <a href="https://confidensia.fr" target="_blank" rel="noopener noreferrer" className="qsn-link"><strong>ConfidensIA</strong></a> développe des outils innovants pour répondre aux défis concrets du secteur social et médico-social : 
              conformité réglementaire (RGPD), tarification complexe, et accès aux ressources dispersées.
            </p>
            <p>
              <strong>Notre approche :</strong> s&apos;attaquer aux problèmes réellement difficiles, ceux qui demandent à la fois une expertise 
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
              <li>Documents publics (rapports d&apos;activité, plaquettes d&apos;information accessibles en ligne)</li>
            </ul>

            <h3 className="qsn-subsection-title qsn-mt">Ce que nous ne faisons pas :</h3>
            <div className="qsn-no-list">
              <div className="qsn-no-item">❌ Pas d&apos;extraction depuis des annuaires privés ou commerciaux</div>
              <div className="qsn-no-item">❌ Pas de revente de données personnelles</div>
              <div className="qsn-no-item">❌ Pas de scraping de contenus protégés</div>
            </div>

            <h3 className="qsn-subsection-title qsn-mt">Notre méthode :</h3>
            <p>
              Nous utilisons des technologies d&apos;<strong>intelligence artificielle</strong> pour enrichir et structurer ces données publiques : 
              géolocalisation précise, extraction de tarifs, identification des services proposés, amélioration de la qualité des descriptions.
            </p>
            <div className="qsn-highlight">
              <strong>Le résultat :</strong> une base de plus de <strong>3 400 établissements</strong> d&apos;habitat intermédiaire 
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
                <li>Type d&apos;établissement (résidence services, résidence autonomie, EHPAD, etc.)</li>
                <li>Coordonnées de contact</li>
              </ul>
            </div>

            <div className="qsn-card qsn-api-card qsn-premium">
              <h3 className="qsn-api-title">Pour les besoins professionnels avancés :</h3>
              <p>Une <strong>API premium</strong> donne accès à l&apos;ensemble des données enrichies :</p>
              <ul className="qsn-list">
                <li>Tarifs détaillés par type de logement</li>
                <li>Services proposés (restauration, animation, soins, etc.)</li>
                <li>Caractéristiques des logements (surfaces, équipements)</li>
                <li>Descriptions détaillées et actualisées</li>
              </ul>
            </div>
          </div>

          <div className="qsn-cta">
            👉 <a href="mailto:contact@confidensia.fr" className="qsn-link">Contactez-nous</a> pour en savoir plus sur l&apos;API complète 
            et discuter de vos besoins spécifiques.
          </div>
        </section>

        {/* Valeurs */}
        <section className="qsn-section">
          <h2 className="qsn-section-title">Nos valeurs</h2>
          
          <div className="qsn-card">
            <h3 className="qsn-value-title">💚 La gratuité pour les familles</h3>
            <p>
              L&apos;accès à l&apos;information sur l&apos;habitat intermédiaire ne doit jamais être un privilège. Notre plateforme est 
              <strong> 100% gratuite</strong> pour les familles et les personnes en recherche d&apos;un lieu de vie adapté.
            </p>
            <p>
              Vous consultez librement, sans formulaire obligatoire, sans publicité intrusive. Vous décidez si et quand 
              vous souhaitez entrer en contact avec un établissement.
            </p>
          </div>

          <div className="qsn-card">
            <h3 className="qsn-value-title">🏡 La focalisation sur les solutions alternatives à l&apos;institution</h3>
            <p>
              Nous croyons que l&apos;EHPAD n&apos;est pas la seule réponse au vieillissement ou à la perte d&apos;autonomie.
            </p>
            <p>
              Notre plateforme valorise les <strong>habitats intermédiaires</strong> — résidences autonomie, résidences services seniors, 
              habitats inclusifs, habitats intergénérationnels — qui permettent de préserver autonomie, lien social et liberté 
              de choix le plus longtemps possible.
            </p>
            <p className="qsn-emphasis">Ces solutions, souvent méconnues, méritent d&apos;être mises en lumière.</p>
          </div>

          <div className="qsn-card">
            <h3 className="qsn-value-title">✨ Donner à chacun les moyens de choisir</h3>
            
            <div className="qsn-choice-item">
              <strong>Sans pression commerciale :</strong>
              <p>
                Nous ne touchons aucune commission sur les mises en relation. Notre seul intérêt est que vous trouviez 
                l&apos;habitat qui vous correspond.
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
              Nous proposons un <strong>assistant conversationnel</strong> spécialisé dans l&apos;habitat intermédiaire.
            </p>
            <p>Grâce à l&apos;intelligence artificielle, il peut :</p>
            <ul className="qsn-list">
              <li>Répondre à vos questions sur les différents types d&apos;habitat (« C&apos;est quoi une résidence autonomie ? »)</li>
              <li>Vous guider dans vos choix selon vos critères (autonomie, budget, localisation, services)</li>
              <li>Rechercher des établissements adaptés dans notre base enrichie</li>
              <li>Vous fournir des informations fiables sur les aides financières, les démarches d&apos;admission, etc.</li>
            </ul>
            <p className="qsn-emphasis">Un expert accessible 24/7, sans jugement, sans jargon, gratuitement.</p>
          </div>

          <div className="qsn-card">
            <h3 className="qsn-value-title">🔬 Une démarche de R&D au service du bien commun</h3>
            <p>
              <strong>habitat-intermédiaire.fr</strong> est avant tout un laboratoire d&apos;innovation.
            </p>
            <p>
              Nous testons des technologies avancées (intelligence artificielle, traitement automatique du langage naturel, 
              enrichissement de données) pour répondre à une question simple : <em>comment rendre l&apos;information accessible à tous ?</em>
            </p>
            <p>
              Les enseignements de ce projet nourrissent d&apos;autres initiatives <a href="https://confidensia.fr" target="_blank" rel="noopener noreferrer" className="qsn-link">ConfidensIA</a>, et nous partageons nos méthodes 
              avec les acteurs du secteur qui souhaitent améliorer la transparence et l&apos;accès aux ressources sociales et médico-sociales.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="qsn-section qsn-contact-section">
          <h2 className="qsn-section-title">Contact</h2>
          <div className="qsn-card qsn-contact-card">
            <p>Vous avez des questions, des suggestions, ou vous souhaitez accéder à l&apos;API complète ?</p>
            <p className="qsn-contact-text">Remplissez le formulaire ci-dessous, nous vous répondrons dans les plus brefs délais.</p>
            
            <ContactForm />
          </div>
        </section>

        {/* Footer tagline */}
        <div className="qsn-tagline">
          <strong>habitat-intermédiaire.fr</strong> — Parce que bien vieillir, c&apos;est d&apos;abord bien choisir.
        </div>
      </div>
    </div>
  );
}
