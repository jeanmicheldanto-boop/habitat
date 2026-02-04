/**
 * Script de dry-run pour vérifier la campagne sans envoyer d'emails
 * Usage: node dry-run-campaign.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function dryRun() {
  console.log('\n🔍 DRY-RUN - Vérification avant envoi\n');
  console.log('=' .repeat(60));

  try {
    // 1. Vérifier les variables d'environnement
    console.log('\n📋 1. VARIABLES D\'ENVIRONNEMENT\n');
    
    const requiredVars = {
      'MAILGUN_API_KEY': process.env.MAILGUN_API_KEY,
      'MAILGUN_DOMAIN': process.env.MAILGUN_DOMAIN,
      'SUPABASE_URL': SUPABASE_URL,
      'SUPABASE_KEY': SUPABASE_KEY ? '✓ Définie' : null,
    };

    let missingVars = [];
    for (const [key, value] of Object.entries(requiredVars)) {
      if (!value || value === 'your-mailgun-api-key-here') {
        console.log(`   ❌ ${key}: NON CONFIGURÉE`);
        missingVars.push(key);
      } else {
        const displayValue = key.includes('KEY') ? '***' : value;
        console.log(`   ✅ ${key}: ${displayValue}`);
      }
    }

    if (missingVars.length > 0) {
      console.log('\n⚠️  ATTENTION: Variables manquantes ou non configurées');
      console.log('   Configurez-les dans .env.local avant l\'envoi en production\n');
    }

    // 2. Récupérer les stats de la base
    console.log('\n📊 2. STATISTIQUES BASE DE DONNÉES\n');
    
    const { count: totalCount } = await supabase
      .from('etablissements')
      .select('*', { count: 'exact', head: true });

    const { count: withEmailCount } = await supabase
      .from('etablissements')
      .select('*', { count: 'exact', head: true })
      .not('email', 'is', null)
      .neq('email', '');

    const { data: ossunData } = await supabase
      .from('etablissements')
      .select('id, nom, email, commune, gestionnaire')
      .ilike('commune', '%ossun%');

    console.log(`   Total établissements: ${totalCount}`);
    console.log(`   Avec email: ${withEmailCount} (${((withEmailCount / totalCount) * 100).toFixed(1)}%)`);
    console.log(`   Sans email: ${totalCount - withEmailCount}`);
    console.log(`   Ossun (test): ${ossunData.length}`);

    // 3. Détails établissements de test
    console.log('\n🧪 3. ÉTABLISSEMENTS DE TEST (OSSUN)\n');
    
    if (ossunData.length === 0) {
      console.log('   ⚠️  Aucun établissement trouvé à Ossun');
    } else {
      ossunData.forEach((etab, index) => {
        console.log(`   ${index + 1}. ${etab.nom}`);
        console.log(`      Email: ${etab.email || '❌ Aucun'}`);
        console.log(`      Gestionnaire: ${etab.gestionnaire || 'Non défini'}`);
        console.log(`      ID: ${etab.id}`);
        console.log('');
      });
    }

    // 4. Simuler le template pour un établissement
    console.log('\n📝 4. APERÇU DU TEMPLATE (premier établissement)\n');
    
    if (ossunData.length > 0 && ossunData[0].email) {
      const etab = ossunData[0];
      console.log('   Destinataire:', etab.email);
      console.log('   Nom établissement:', etab.nom);
      console.log('   Sujet: "Votre établissement est référencé sur habitat-intermediaire.fr"');
      console.log('   De: Patrick Danto - confidensIA <patrick.danto@confidensia.fr>');
      console.log('   Répondre à: patrick.danto@confidensia.fr');
      console.log('\n   Template inclut:');
      console.log('   ✓ Salutation personnalisée');
      console.log('   ✓ Explication du référencement');
      console.log('   ✓ Droits RGPD');
      console.log('   ✓ Lien formulaire opt-out');
      console.log('   ✓ Coordonnées de contact');
    }

    // 5. Estimation coûts et timing
    console.log('\n💰 5. ESTIMATION PRODUCTION\n');
    
    const emailsToSend = withEmailCount;
    const delayPerEmail = 100; // ms
    const durationMinutes = (emailsToSend * delayPerEmail) / 1000 / 60;
    
    console.log(`   Emails à envoyer: ${emailsToSend}`);
    console.log(`   Durée estimée: ${durationMinutes.toFixed(1)} minutes`);
    console.log(`   Coût Mailgun: GRATUIT (sous 5,000 emails/mois)`);
    console.log(`   Rate limiting: ${delayPerEmail}ms entre chaque email`);

    // 6. Recommandations
    console.log('\n✅ 6. CHECKLIST AVANT ENVOI\n');
    
    const checklist = [
      { item: 'Configuration Mailgun (compte créé)', check: !!process.env.MAILGUN_API_KEY && process.env.MAILGUN_API_KEY !== 'your-mailgun-api-key-here' },
      { item: 'Clés API dans .env.local', check: !!process.env.MAILGUN_API_KEY },
      { item: 'Domaine configuré', check: !!process.env.MAILGUN_DOMAIN },
      { item: 'Au moins un établissement de test', check: ossunData.length > 0 },
      { item: 'Établissements test ont des emails', check: ossunData.some(e => e.email) },
      { item: 'Plus de 1000 emails à envoyer', check: withEmailCount >= 1000 },
    ];

    checklist.forEach(({ item, check }) => {
      console.log(`   ${check ? '✅' : '⚠️ '} ${item}`);
    });

    const allChecked = checklist.every(c => c.check);

    console.log('\n' + '='.repeat(60));
    
    if (allChecked) {
      console.log('\n🎉 SYSTÈME PRÊT POUR LE TEST !\n');
      console.log('Prochaines étapes:');
      console.log('  1. Tester avec Ossun:');
      console.log('     node send-referencing-campaign.js');
      console.log('');
      console.log('  2. Si le test réussit, passer en production:');
      console.log('     - Modifier testMode: false dans send-referencing-campaign.js');
      console.log('     - Relancer le script');
    } else {
      console.log('\n⚠️  CONFIGURATION INCOMPLÈTE\n');
      console.log('Complétez les points marqués ⚠️  avant de continuer');
      console.log('Voir: GUIDE-EMAIL-CAMPAIGN.md pour les instructions détaillées');
    }

    console.log('');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

dryRun();
