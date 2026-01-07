/**
 * Script pour envoyer une campagne email à tous les établissements
 * Usage: node send-campaign.js
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
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérification des variables
if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
  console.error('❌ Variables Mailgun manquantes dans .env.local:');
  console.error('   MAILGUN_API_KEY');
  console.error('   MAILGUN_DOMAIN');
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
  subject: "🚀 Nouveau : API gratuite pour diffuser vos offres d'habitat intermédiaire",
  from: "Habitat Intermédiaire <hello@habitat-intermediaire.fr>",
  replyTo: "contact@habitat-intermediaire.fr",
  tags: ['campaign', 'api-launch', '2025-12'],
  testMode: true, // Mettre à false pour envoyer vraiment
  testEmails: ['votre-email@exemple.com'], // Emails de test
};

// Template HTML de l'email
function getEmailTemplate(nom, gestionnaire) {
  const name = gestionnaire || 'cher partenaire';
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle API Habitat Intermédiaire</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: #a85b2b; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">
                🚀 Une nouvelle façon de diffuser vos offres
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 16px; line-height: 1.6; color: #333; margin-top: 0;">
                Bonjour <strong>${name}</strong>,
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Nous sommes ravis d'annoncer le lancement de notre <strong>API gratuite</strong> pour l'habitat intermédiaire !
              </p>
              
              <h2 style="color: #a85b2b; font-size: 20px; margin-top: 30px; margin-bottom: 15px;">
                Qu'est-ce que ça change pour <em>${nom}</em> ?
              </h2>
              
              <ul style="font-size: 16px; line-height: 1.8; color: #333;">
                <li>✅ Vos offres diffusées automatiquement sur d'autres sites partenaires</li>
                <li>✅ Plus de visibilité sans effort supplémentaire</li>
                <li>✅ Intégration technique simple (webhooks, JSON)</li>
                <li>✅ 100% gratuit, sans limitation</li>
              </ul>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #a85b2b; padding: 20px; margin: 30px 0;">
                <p style="margin: 0; font-size: 15px; color: #666;">
                  <strong>Exemple d'usage :</strong> Un site web de conseil aux seniors pourra afficher vos disponibilités en temps réel, redirigeant les visiteurs vers votre établissement.
                </p>
              </div>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://habitat-intermediaire.fr/api" 
                       style="display: inline-block; padding: 15px 40px; background-color: #a85b2b; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                      Découvrir l'API
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Des questions ? N'hésitez pas à nous contacter à <a href="mailto:contact@habitat-intermediaire.fr" style="color: #a85b2b;">contact@habitat-intermediaire.fr</a>
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 0;">
                Cordialement,<br>
                <strong>L'équipe Habitat Intermédiaire</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
              <p style="font-size: 12px; color: #666; text-align: center; margin: 0;">
                Vous recevez cet email car vous êtes partenaire de Habitat Intermédiaire.<br>
                <a href="%unsubscribe_url%" style="color: #666; text-decoration: underline;">Se désinscrire</a> | 
                <a href="https://habitat-intermediaire.fr" style="color: #666; text-decoration: underline;">Visiter le site</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

async function sendCampaign() {
  console.log('\n📧 CAMPAGNE EMAIL - Habitat Intermédiaire\n');
  console.log('Configuration:');
  console.log(`  Mode: ${CAMPAIGN_CONFIG.testMode ? '🧪 TEST' : '🚀 PRODUCTION'}`);
  console.log(`  Domain: ${MAILGUN_DOMAIN}`);
  console.log('');

  try {
    // 1. Récupérer tous les établissements avec email
    console.log('📊 Récupération des établissements...');
    const { data: etabs, error } = await supabase
      .from('etablissements')
      .select('email, nom, gestionnaire')
      .not('email', 'is', null);

    if (error) {
      throw new Error(`Erreur Supabase: ${error.message}`);
    }

    console.log(`✅ ${etabs.length} établissements avec email trouvés\n`);

    // 2. Mode test : envoyer uniquement aux emails de test
    const recipients = CAMPAIGN_CONFIG.testMode 
      ? CAMPAIGN_CONFIG.testEmails.map(email => ({ email, nom: 'Test', gestionnaire: 'Test' }))
      : etabs;

    if (CAMPAIGN_CONFIG.testMode) {
      console.log(`⚠️  MODE TEST activé - Email envoyé uniquement à: ${CAMPAIGN_CONFIG.testEmails.join(', ')}\n`);
    }

    // 3. Envoyer par batch de 1000 (limite Mailgun)
    const batchSize = 1000;
    let totalSent = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(recipients.length / batchSize);

      console.log(`📤 Envoi batch ${batchNum}/${totalBatches} (${batch.length} emails)...`);

      // Préparer le message
      const messageData = {
        from: CAMPAIGN_CONFIG.from,
        to: batch.map(e => e.email),
        subject: CAMPAIGN_CONFIG.subject,
        html: getEmailTemplate(batch[0].nom, batch[0].gestionnaire),
        'o:tag': CAMPAIGN_CONFIG.tags,
        'o:tracking': 'yes',
        'o:tracking-clicks': 'yes',
        'o:tracking-opens': 'yes',
        'h:Reply-To': CAMPAIGN_CONFIG.replyTo,
      };

      // Envoyer via Mailgun
      const result = await mg.messages.create(MAILGUN_DOMAIN, messageData);
      
      console.log(`   ✅ Batch envoyé - ID: ${result.id}`);
      totalSent += batch.length;

      // Pause entre les batches pour éviter le rate limiting
      if (i + batchSize < recipients.length) {
        console.log('   ⏳ Pause 2 secondes...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n🎉 Campagne terminée avec succès !');
    console.log(`   Total envoyé: ${totalSent} emails`);
    console.log(`\n📊 Suivez les statistiques sur: https://app.mailgun.com/`);

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Confirmation avant envoi en mode production
if (!CAMPAIGN_CONFIG.testMode) {
  console.log('\n⚠️  ATTENTION: Vous êtes sur le point d\'envoyer en MODE PRODUCTION');
  console.log('   Appuyez sur Ctrl+C pour annuler, ou attendez 5 secondes...\n');
  setTimeout(sendCampaign, 5000);
} else {
  sendCampaign();
}
