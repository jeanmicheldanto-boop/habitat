/**
 * Script pour envoyer la campagne via Elastic Email (VERSION DÉDUPLIQUÉE)
 * Usage: node send-campaign-elastic-dedup.js
 * 
 * Configuration : Clé API Elastic Email dans .env.local
 * Dashboard : https://elasticemail.com/
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration
const ELASTICEMAIL_API_KEY = process.env.ELASTICEMAIL_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!ELASTICEMAIL_API_KEY || ELASTICEMAIL_API_KEY === 'votre-clé-elastic-email-ici') {
  console.error('❌ ELASTICEMAIL_API_KEY manquante dans .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Configuration de la campagne
const CAMPAIGN_CONFIG = {
  subject: "Votre établissement est référencé sur habitat-intermediaire.fr",
  from: "Patrick Danto - confidensIA",
  fromEmail: "patrick.danto@habitat-intermediaire.fr",
  replyTo: "patrick.danto@confidensia.fr",
  testMode: true, // Changer en false pour production
};

// Template HTML pour UN établissement
function getEmailTemplateSingle(nom) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 30px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- En-tête -->
          <tr>
            <td style="background: linear-gradient(135deg, #d9876a 0%, #c1694a 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                🏡 Habitat Intermédiaire
              </h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                Annuaire national des solutions de logement accompagné
              </p>
            </td>
          </tr>
          
          <!-- Corps principal -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #333;">
                Madame, Monsieur,
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #333;">
                Nous avons le plaisir de vous informer que votre établissement <strong>${nom}</strong> est référencé sur notre plateforme <strong>habitat-intermediaire.fr</strong>, l'annuaire national des solutions de logement accompagné pour seniors et personnes en perte d'autonomie.
              </p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #d9876a; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 15px; color: #2c3e50; line-height: 1.7;">
                  <strong>Notre mission :</strong> Faciliter l'accès à l'information pour les familles et professionnels en quête de solutions d'habitat intermédiaire (résidences autonomie, habitat inclusif, maisons partagées, béguinages, etc.).
                </p>
              </div>
              
              <h2 style="color: #2c3e50; font-size: 20px; margin: 30px 0 15px; border-bottom: 2px solid #d9876a; padding-bottom: 10px;">
                📋 Vos droits RGPD
              </h2>
              
              <p style="margin: 0 0 15px; font-size: 15px; color: #333;">
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants concernant les informations relatives à votre établissement :
              </p>
              
              <ul style="margin: 0 0 20px; padding-left: 25px; font-size: 15px; color: #333; line-height: 1.8;">
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
              
              <p style="margin: 25px 0 0; font-size: 15px; color: #333;">
                Nous restons à votre disposition pour toute question ou demande d'information complémentaire.
              </p>
              
              <p style="margin: 25px 0 0; font-size: 15px; color: #333;">
                Cordialement,
              </p>
              
              <div style="margin: 20px 0 0; padding: 15px; background-color: #f8f9fa; border-radius: 6px;">
                <p style="margin: 0; font-size: 14px; color: #2c3e50; font-weight: 600;">
                  Patrick Danto
                </p>
                <p style="margin: 5px 0 0; font-size: 14px; color: #666;">
                  Fondateur – confidensIA<br>
                  <a href="mailto:patrick.danto@confidensia.fr" style="color: #d9876a; text-decoration: none;">patrick.danto@confidensia.fr</a>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Pied de page -->
          <tr>
            <td style="background-color: #2c3e50; padding: 25px 30px; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 13px; color: #b8bdc5;">
                <a href="https://habitat-intermediaire.fr" style="color: #d9876a; text-decoration: none; font-weight: 600;">habitat-intermediaire.fr</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #8b919a; line-height: 1.6;">
                Vous recevez cet email car votre établissement est référencé sur notre plateforme.<br>
                Pour exercer vos droits ou vous désinscrire : 
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

// Template HTML pour PLUSIEURS établissements
function getEmailTemplateMultiple(etablissements) {
  const count = etablissements.length;
  const etabsList = etablissements.map((etab, index) => 
    `<li style="margin-bottom: 8px; font-size: 15px; color: #2c3e50;">
      <strong>${etab.nom}</strong>${etab.commune ? ` – ${etab.commune}` : ''}
    </li>`
  ).join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 30px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- En-tête -->
          <tr>
            <td style="background: linear-gradient(135deg, #d9876a 0%, #c1694a 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                🏡 Habitat Intermédiaire
              </h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                Annuaire national des solutions de logement accompagné
              </p>
            </td>
          </tr>
          
          <!-- Corps principal -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #333;">
                Madame, Monsieur,
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #333;">
                Nous avons le plaisir de vous informer que <strong>${count} établissements</strong> associés à votre adresse email sont référencés sur notre plateforme <strong>habitat-intermediaire.fr</strong>, l'annuaire national des solutions de logement accompagné pour seniors et personnes en perte d'autonomie.
              </p>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px; font-size: 15px; color: #92400e; font-weight: 600;">
                  📍 Établissements concernés :
                </p>
                <ul style="margin: 10px 0 0; padding-left: 20px; list-style: none;">
                  ${etabsList}
                </ul>
              </div>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #d9876a; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 15px; color: #2c3e50; line-height: 1.7;">
                  <strong>Notre mission :</strong> Faciliter l'accès à l'information pour les familles et professionnels en quête de solutions d'habitat intermédiaire (résidences autonomie, habitat inclusif, maisons partagées, béguinages, etc.).
                </p>
              </div>
              
              <h2 style="color: #2c3e50; font-size: 20px; margin: 30px 0 15px; border-bottom: 2px solid #d9876a; padding-bottom: 10px;">
                📋 Vos droits RGPD
              </h2>
              
              <p style="margin: 0 0 15px; font-size: 15px; color: #333;">
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants concernant les informations relatives à vos établissements :
              </p>
              
              <ul style="margin: 0 0 20px; padding-left: 25px; font-size: 15px; color: #333; line-height: 1.8;">
                <li style="margin-bottom: 10px;">Accéder aux informations concernant vos établissements</li>
                <li style="margin-bottom: 10px;">Demander leur rectification ou leur mise à jour</li>
                <li style="margin-bottom: 10px;">Compléter librement vos fiches (description, photographies, informations pratiques), sans frais, sous réserve d'une preuve simple de gestion ou de représentation</li>
                <li style="margin-bottom: 10px;"><strong>Vous opposer à la publication</strong> d'un ou plusieurs de vos établissements sur la plateforme</li>
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
              
              <p style="margin: 25px 0 0; font-size: 15px; color: #333;">
                Nous restons à votre disposition pour toute question ou demande d'information complémentaire.
              </p>
              
              <p style="margin: 25px 0 0; font-size: 15px; color: #333;">
                Cordialement,
              </p>
              
              <div style="margin: 20px 0 0; padding: 15px; background-color: #f8f9fa; border-radius: 6px;">
                <p style="margin: 0; font-size: 14px; color: #2c3e50; font-weight: 600;">
                  Patrick Danto
                </p>
                <p style="margin: 5px 0 0; font-size: 14px; color: #666;">
                  Fondateur – confidensIA<br>
                  <a href="mailto:patrick.danto@confidensia.fr" style="color: #d9876a; text-decoration: none;">patrick.danto@confidensia.fr</a>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Pied de page -->
          <tr>
            <td style="background-color: #2c3e50; padding: 25px 30px; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 13px; color: #b8bdc5;">
                <a href="https://habitat-intermediaire.fr" style="color: #d9876a; text-decoration: none; font-weight: 600;">habitat-intermediaire.fr</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #8b919a; line-height: 1.6;">
                Vous recevez cet email car ${count} établissements associés à cette adresse sont référencés sur notre plateforme.<br>
                Pour exercer vos droits ou vous désinscrire : 
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

async function sendEmail(email, subject, htmlContent) {
  const response = await fetch('https://api.elasticemail.com/v2/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      apikey: ELASTICEMAIL_API_KEY,
      from: CAMPAIGN_CONFIG.fromEmail,
      fromName: CAMPAIGN_CONFIG.from,
      to: email,
      replyTo: CAMPAIGN_CONFIG.replyTo,
      subject: subject,
      bodyHtml: htmlContent
    }).toString()
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(`Elastic Email API error: ${response.status} - ${JSON.stringify(result)}`);
  }
  
  return result;
}

async function runCampaign() {
  console.log('\n📧 CAMPAGNE RÉFÉRENCEMENT - Habitat Intermédiaire (VERSION DÉDUPLIQUÉE)\n');
  console.log('Configuration:');
  console.log(`  Mode: ${CAMPAIGN_CONFIG.testMode ? '🧪 TEST' : '🚀 PRODUCTION'}`);
  console.log(`  From: ${CAMPAIGN_CONFIG.from} <${CAMPAIGN_CONFIG.fromEmail}>\n`);

  try {
    console.log('📊 Récupération des établissements...');
    
    let query = supabase
      .from('etablissements')
      .select('id, nom, email, commune')
      .not('email', 'is', null)
      .neq('email', '');

    if (CAMPAIGN_CONFIG.testMode) {
      query = query.ilike('commune', '%ossun%');
    }

    const { data: etabs, error } = await query;
    if (error) throw error;

    console.log(`✅ ${etabs.length} établissements avec email trouvés\n`);

    if (etabs.length === 0) {
      console.log('⚠️  Aucun établissement à traiter');
      return;
    }

    // Grouper par email
    const emailGroups = new Map();
    etabs.forEach(etab => {
      const email = etab.email.toLowerCase().trim();
      if (!emailGroups.has(email)) {
        emailGroups.set(email, []);
      }
      emailGroups.get(email).push(etab);
    });

    const uniqueEmails = Array.from(emailGroups.entries());
    console.log(`📨 ${uniqueEmails.length} emails uniques à envoyer`);
    console.log(`💾 ${etabs.length - uniqueEmails.length} emails économisés grâce à la déduplication\n`);

    if (CAMPAIGN_CONFIG.testMode) {
      console.log('⚠️  MODE TEST activé - Emails qui seront envoyés:\n');
      uniqueEmails.forEach(([email, etabsList], index) => {
        console.log(`   ${index + 1}. ${email} (${etabsList.length} établissement${etabsList.length > 1 ? 's' : ''})`);
        etabsList.forEach(etab => {
          console.log(`      - ${etab.nom}`);
        });
        console.log('');
      });
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      await new Promise(resolve => {
        readline.question('Continuer ? (o/n) ', answer => {
          readline.close();
          if (answer.toLowerCase() !== 'o') {
            console.log('❌ Annulé');
            process.exit(0);
          }
          resolve();
        });
      });
      console.log('');
    }

    // Envoi des emails
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < uniqueEmails.length; i++) {
      const [email, etabsList] = uniqueEmails[i];
      const count = etabsList.length;
      
      const displayName = count === 1 
        ? etabsList[0].nom 
        : `${count} établissements`;
      
      console.log(`📤 [${i + 1}/${uniqueEmails.length}] Envoi à: ${displayName} (${email})...`);
      
      try {
        const htmlContent = count === 1 
          ? getEmailTemplateSingle(etabsList[0].nom)
          : getEmailTemplateMultiple(etabsList);

        const result = await sendEmail(
          email,
          CAMPAIGN_CONFIG.subject,
          htmlContent
        );
        
        console.log(`   ✅ Envoyé - TransactionID: ${result.data?.transactionid || result.transactionid}`);
        successCount++;
        
        // Délai entre chaque envoi (100ms)
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n============================================================');
    console.log('🎉 Campagne terminée !');
    console.log(`   Emails uniques envoyés: ${successCount}`);
    console.log(`   Établissements couverts: ${etabs.length}`);
    if (errorCount > 0) {
      console.log(`   ⚠️  Erreurs: ${errorCount}`);
    }
    console.log('\n📊 Suivez les statistiques sur: https://elasticemail.com/reports');

  } catch (error) {
    console.error('\n❌ Erreur fatale:', error.message);
    process.exit(1);
  }
}

// Protection contre l'exécution accidentelle en mode production
if (!CAMPAIGN_CONFIG.testMode) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('\n⚠️  MODE PRODUCTION ACTIVÉ ⚠️');
  console.log('Cette action enverra des emails à TOUS les établissements.\n');
  
  readline.question('Êtes-vous ABSOLUMENT SÛR de vouloir continuer ? Tapez "ENVOYER" pour confirmer: ', answer => {
    readline.close();
    if (answer !== 'ENVOYER') {
      console.log('❌ Annulé par sécurité');
      process.exit(0);
    }
    runCampaign();
  });
} else {
  runCampaign();
}
