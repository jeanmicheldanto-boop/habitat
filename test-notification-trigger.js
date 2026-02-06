// Test des triggers de notification avec Elastic Email
// Vérifie que le trigger déclenche bien l'envoi d'email lors du changement de statut

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testNotificationTrigger() {
  console.log('🧪 Test des triggers de notification avec Elastic Email\n');

  // 1. Vérifier qu'il existe des propositions en attente
  console.log('📋 Étape 1: Recherche de propositions en attente...');
  const { data: propositions, error: propError } = await supabase
    .from('propositions')
    .select('id, created_by, etablissement_id, action, statut, payload')
    .eq('statut', 'en_attente')
    .not('created_by', 'is', null)  // Uniquement celles avec un créateur authentifié
    .limit(1);

  if (propError) {
    console.error('❌ Erreur:', propError);
    return;
  }

  if (!propositions || propositions.length === 0) {
    console.log('⚠️  Aucune proposition en attente avec créateur authentifié trouvée');
    console.log('   Pour tester, créez une proposition depuis l\'interface gestionnaire\n');
    
    // Créer une proposition de test
    console.log('📝 Création d\'une proposition de test...');
    
    // Récupérer un gestionnaire
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, nom, prenom')
      .eq('role', 'gestionnaire')
      .limit(1)
      .single();

    if (!profiles) {
      console.error('❌ Aucun gestionnaire trouvé pour créer une proposition de test');
      return;
    }

    console.log(`   Gestionnaire: ${profiles.nom} ${profiles.prenom} (${profiles.email})`);

    const { data: newProp, error: createError } = await supabase
      .from('propositions')
      .insert({
        type_cible: 'etablissement',
        action: 'create',
        statut: 'en_attente',
        source: 'gestionnaire',
        created_by: profiles.id,
        payload: {
          nom: 'Test Établissement pour Notification',
          presentation: 'Test pour vérifier les notifications',
          adresse_l1: '1 rue de Test',
          commune: 'Test City',
          code_postal: '75000',
          departement: 'Test (75)',
          habitat_type: 'residence',
          sous_categories: [],
          gestionnaire: 'Test Organisation'
        }
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur création proposition:', createError);
      return;
    }

    console.log(`   ✅ Proposition de test créée: ${newProp.id}\n`);
    
    // Utiliser cette nouvelle proposition
    propositions[0] = newProp;
  }

  const testProp = propositions[0];
  console.log(`✅ Proposition trouvée: ${testProp.id}`);
  console.log(`   Créé par: ${testProp.created_by}`);
  console.log(`   Action: ${testProp.action}`);
  console.log(`   Statut actuel: ${testProp.statut}\n`);

  // 2. Récupérer l'email du créateur
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, nom, prenom')
    .eq('id', testProp.created_by)
    .single();

  if (!profile || !profile.email) {
    console.error('❌ Impossible de récupérer l\'email du créateur');
    return;
  }

  console.log(`📧 Email de notification sera envoyé à: ${profile.email}\n`);

  // 3. Changer le statut pour déclencher le trigger
  console.log('🔄 Étape 2: Changement de statut pour déclencher le trigger...');
  console.log('   en_attente → approuvee\n');

  const { error: updateError } = await supabase
    .from('propositions')
    .update({ 
      statut: 'approuvee',
      review_note: 'Test automatique - Notification via Elastic Email'
    })
    .eq('id', testProp.id);

  if (updateError) {
    console.error('❌ Erreur lors de la mise à jour:', updateError);
    return;
  }

  console.log('✅ Statut mis à jour avec succès!\n');

  // 4. Attendre un peu pour que le trigger s'exécute
  console.log('⏳ Attente de 3 secondes pour l\'exécution du trigger...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('\n' + '='.repeat(60));
  console.log('📬 Vérifications à faire:');
  console.log('='.repeat(60));
  console.log(`1. Vérifier l'email reçu sur: ${profile.email}`);
  console.log('2. Vérifier les logs dans Supabase Dashboard:');
  console.log('   → Edge Functions → send-notification → Logs');
  console.log('3. Vérifier les envois dans Elastic Email:');
  console.log('   → https://elasticemail.com/reports');
  console.log('\n💡 Si aucun email n\'est reçu, vérifiez:');
  console.log('   - La clé ELASTICEMAIL_API_KEY dans Supabase Edge Function secrets');
  console.log('   - Les logs de la fonction Edge pour voir les erreurs');
  console.log('   - Le trigger est bien activé: verifier-triggers.sql');

  // 5. Remettre le statut en attente pour ne pas polluer
  console.log('\n🔙 Remise du statut à "en_attente" pour cleanup...');
  await supabase
    .from('propositions')
    .update({ statut: 'en_attente', review_note: null })
    .eq('id', testProp.id);

  console.log('✅ Test terminé!\n');
}

testNotificationTrigger()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
