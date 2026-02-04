/**
 * Script pour envoyer la campagne d'information de référencement
 * Usage: node send-referencing-campaign.js
 * 
 * Configuration requise:
 * - Clés Mailgun dans .env.local
 * - npm install form-data mailgun.js
 */

const { createClient } = require('@supabase/supabase-js');
const formData = require('form-data');
const Mailgun = require('mailgun.js');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

// Configuration
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN; // ex: mg.habitat-intermediaire.fr
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérification des variables
if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
  console.error('❌ Variables Mailgun manquantes dans .env.local:');
  console.error('   MAILGUN_API_KEY');
  console.error('   MAILGUN_DOMAIN');
  console.error('');
  console.error('💡 Ajoutez ces lignes dans .env.local:');
  console.error('   MAILGUN_API_KEY=your-api-key');
  console.error('   MAILGUN_DOMAIN=mg.habitat-intermediaire.fr');
  process.exit(1);
}

// Initialiser les clients
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: MAILGUN_API_KEY
});

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Configuration de la campagne
const CAMPAIGN_CONFIG = {
  subject: "Votre établissement est référencé sur habitat-intermediaire.fr",
  from: "Patrick Danto - confidensIA <patrick.danto@confidensia.fr>",
  replyTo: "patrick.danto@confidensia.fr",
  tags: ['campaign', 'referencing-notification', '2026-02'],
  testMode: true, // Mettre à false pour envoyer vraiment
  testEmails: ['lgenevaux@yahoo.fr', 'patrick.danto@outlook.fr'], // Emails de test (Ossun)
};

// Template HTML de l'email
function getEmailTemplate(nom, gestionnaire) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Référencement habitat-intermediaire.fr</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: left;">
              <p style="font-size: 16px; color: #333; margin: 0;">
                Madame, Monsieur,
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <p style="font-size: 16px; color: #333; margin: 0 0 20px;">
                Nous vous informons que votre établissement <strong>${nom}</strong> a été référencé sur la plateforme 
                <strong>habitat-intermediaire.fr</strong>, un démonstrateur de recherche et développement porté par 
                <strong>confidensIA</strong>, dont l'objectif est de faciliter l'accès à une information fiable, lisible 
                et à jour sur l'habitat intermédiaire et inclusif à destination des personnes âgées et des personnes en 
                situation de handicap.
              </p>
              
              <h2 style="color: #2563eb; font-size: 18px; margin: 30px 0 15px; font-weight: 600;">
                📋 Pourquoi recevez-vous ce message ?
              </h2>
              
              <p style="font-size: 16px; color: #333; margin: 0 0 20px;">
                Les informations actuellement publiées concernant votre établissement ont été collectées à partir de 
                <strong>sources publiques</strong> (notamment les annuaires institutionnels publics, tels que 
                personnes-agees.gouv.fr) et complétées, le cas échéant, par des informations issues de votre site 
                internet public, selon un processus métier documenté et assisté par des outils d'analyse automatisée.
              </p>
              
              <p style="font-size: 16px; color: #333; margin: 0 0 20px;">
                Ce référencement s'inscrit dans une <strong>démarche d'intérêt général</strong>, visant à améliorer 
                la visibilité et la compréhension de l'offre existante. À ce jour, environ <strong>3 400 habitats</strong> 
                ont été référencés sur la plateforme.
              </p>
              
              <h2 style="color: #2563eb; font-size: 18px; margin: 30px 0 15px; font-weight: 600;">
                ⚖️ Vos droits et possibilités d'action
              </h2>
              
              <p style="font-size: 16px; color: #333; margin: 0 0 15px;">
                Conformément à la réglementation relative à la protection des données (RGPD), vous disposez à tout moment 
                des droits suivants :
              </p>
              
              <ul style="font-size: 16px; color: #333; padding-left: 20px; margin: 0 0 20px;">
                <li style="margin-bottom: 10px;">Accéder aux informations concernant votre établissement</li>
                <li style="margin-bottom: 10px;">Demander leur rectification ou leur mise à jour</li>
                <li style="margin-bottom: 10px;">Compléter librement votre fiche (description, photographie, informations pratiques), sans frais, sous réserve d'une preuve simple de gestion ou de représentation de l'établissement</li>
                <li style="margin-bottom: 10px;"><strong>Vous opposer à la publication</strong> de votre établissement sur la plateforme</li>
              </ul>
              
              <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 25px 0;">
                <p style="margin: 0; font-size: 15px; color: #1e40af; font-weight: 600;">
                  👉 L'ensemble de ces démarches peut être effectué via le formulaire dédié accessible à l'adresse suivante :
                </p>
                <p style="margin: 10px 0 0; font-size: 16px;">
                  <a href="https://habitat-intermediaire.fr/opt-out" 
                     style="color: #2563eb; text-decoration: underline; font-weight: 600;">
                    https://habitat-intermediaire.fr/opt-out
                  </a>
                </p>
              </div>
              
              <h2 style="color: #2563eb; font-size: 18px; margin: 30px 0 15px; font-weight: 600;">
                ℹ️ À propos de la plateforme
              </h2>
              
              <p style="font-size: 16px; color: #333; margin: 0 0 15px;">
                Le service est :
              </p>
              
              <ul style="font-size: 16px; color: #333; padding-left: 20px; margin: 0 0 20px;">
                <li style="margin-bottom: 10px;">✅ Gratuit pour les usagers</li>
                <li style="margin-bottom: 10px;">✅ Gratuit pour les établissements concernant la gestion et la mise à jour de leurs informations publiques</li>
              </ul>
              
              <p style="font-size: 16px; color: #333; margin: 0 0 20px;">
                Les données ont vocation à être rendues accessibles au public, notamment via une API en marque blanche pour 
                les informations essentielles, afin de favoriser leur réutilisation par des acteurs publics, associatifs ou 
                institutionnels. Des services techniques spécifiques pourront ultérieurement être proposés pour l'accès à 
                des jeux de données enrichis.
              </p>
              
              <p style="font-size: 16px; color: #333; margin: 0 0 20px;">
                L'objectif exclusif de cette démarche est de renforcer la visibilité de l'offre existante, au bénéfice des 
                personnes concernées et de leurs proches.
              </p>
              
              <p style="font-size: 16px; color: #333; margin: 30px 0 0;">
                Nous restons à votre disposition pour toute question relative à ce référencement ou à l'exercice de vos droits.
              </p>
              
              <p style="font-size: 16px; color: #333; margin: 20px 0 0;">
                Cordialement,
              </p>
              
              <p style="font-size: 16px; color: #333; margin: 10px 0 0; font-weight: 600;">
                Patrick Danto<br>
                confidensIA<br>
                <a href="mailto:patrick.danto@confidensia.fr" style="color: #2563eb; text-decoration: none;">patrick.danto@confidensia.fr</a><br>
                <a href="https://confidensia.fr" style="color: #2563eb; text-decoration: none;">confidensia.fr</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.5;">
                <strong>habitat-intermediaire.fr</strong> est une initiative de confidensIA visant à améliorer 
                l'accès à l'information sur l'habitat intermédiaire et inclusif en France.
              </p>
              <p style="font-size: 12px; color: #9ca3af; margin: 15px 0 0;">
                Vous recevez cet email car votre établissement est référencé dans notre base de données.<br>
                Pour exercer vos droits : 
                <a href="https://habitat-intermediaire.fr/opt-out" style="color: #6b7280; text-decoration: underline;">
                  Formulaire opt-out
                </a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

async function sendCampaign() {
  console.log('\n📧 CAMPAGNE RÉFÉRENCEMENT - Habitat Intermédiaire\n');
  console.log('Configuration:');
  console.log(`  Mode: ${CAMPAIGN_CONFIG.testMode ? '🧪 TEST' : '🚀 PRODUCTION'}`);
  console.log(`  Domain: ${MAILGUN_DOMAIN}`);
  console.log('');

  try {
    // 1. Récupérer tous les établissements avec email
    console.log('📊 Récupération des établissements...');
    
    let query = supabase
      .from('etablissements')
      .select('id, email, nom, gestionnaire, commune')
      .not('email', 'is', null)
      .neq('email', '');

    // En mode test, filtrer uniquement Ossun
    if (CAMPAIGN_CONFIG.testMode) {
      query = query.ilike('commune', '%ossun%');
    }

    const { data: etabs, error } = await query;

    if (error) {
      throw new Error(`Erreur Supabase: ${error.message}`);
    }

    console.log(`✅ ${etabs.length} établissements avec email trouvés\n`);

    if (etabs.length === 0) {
      console.log('⚠️  Aucun établissement à traiter');
      return;
    }

    // 2. Afficher les destinataires en mode test
    if (CAMPAIGN_CONFIG.testMode) {
      console.log('⚠️  MODE TEST activé - Emails qui seront envoyés:\n');
      etabs.forEach((etab, index) => {
        console.log(`   ${index + 1}. ${etab.nom}`);
        console.log(`      Email: ${etab.email}`);
        console.log(`      Commune: ${etab.commune}`);
        console.log('');
      });
    }

    // 3. Envoyer les emails individuellement (personnalisés)
    let totalSent = 0;
    let errors = 0;

    for (let i = 0; i < etabs.length; i++) {
      const etab = etabs[i];
      const progress = `[${i + 1}/${etabs.length}]`;

      console.log(`📤 ${progress} Envoi à: ${etab.nom} (${etab.email})...`);

      try {
        // Préparer le message personnalisé
        const messageData = {
          from: CAMPAIGN_CONFIG.from,
          to: etab.email,
          subject: CAMPAIGN_CONFIG.subject,
          html: getEmailTemplate(etab.nom, etab.gestionnaire),
          'o:tag': CAMPAIGN_CONFIG.tags,
          'o:tracking': 'yes',
          'o:tracking-clicks': 'yes',
          'o:tracking-opens': 'yes',
          'h:Reply-To': CAMPAIGN_CONFIG.replyTo,
          // Variables pour personnalisation et tracking
          'v:etablissement_id': etab.id,
          'v:etablissement_nom': etab.nom,
        };

        // Envoyer via Mailgun
        const result = await mg.messages.create(MAILGUN_DOMAIN, messageData);
        
        console.log(`   ✅ Envoyé - ID: ${result.id}`);
        totalSent++;

        // Pause entre les emails pour éviter le rate limiting
        if (i < etabs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (emailError) {
        console.error(`   ❌ Erreur: ${emailError.message}`);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Campagne terminée !');
    console.log(`   Total envoyé: ${totalSent} emails`);
    if (errors > 0) {
      console.log(`   Erreurs: ${errors}`);
    }
    console.log(`\n📊 Suivez les statistiques sur: https://app.mailgun.com/`);

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Confirmation avant envoi en mode production
if (!CAMPAIGN_CONFIG.testMode) {
  console.log('\n⚠️  ATTENTION: Vous êtes sur le point d\'envoyer en MODE PRODUCTION');
  console.log(`   ${2016} emails seront envoyés à tous les établissements`);
  console.log('   Appuyez sur Ctrl+C pour annuler, ou attendez 5 secondes...\n');
  setTimeout(sendCampaign, 5000);
} else {
  sendCampaign();
}
