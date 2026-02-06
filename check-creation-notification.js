// Vérifier la dernière création d'établissement et pourquoi l'email n'a pas été envoyé
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRecentCreation() {
  console.log('🔍 Vérification de votre dernière création d\'établissement...\n');

  // Trouver les dernières propositions de création
  const { data: propositions, error } = await supabase
    .from('propositions')
    .select(`
      id,
      created_at,
      statut,
      action,
      source,
      created_by,
      payload,
      profiles:created_by (
        email,
        nom,
        prenom
      )
    `)
    .eq('action', 'create')
    .eq('type_cible', 'etablissement')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log(`📊 ${propositions.length} dernières créations d'établissements:\n`);

  for (const prop of propositions) {
    console.log('─'.repeat(80));
    console.log(`📝 ID: ${prop.id}`);
    console.log(`   Créé le: ${new Date(prop.created_at).toLocaleString('fr-FR')}`);
    console.log(`   Statut: ${prop.statut}`);
    console.log(`   Source: ${prop.source}`);
    
    if (prop.profiles) {
      console.log(`   Créé par: ${prop.profiles.prenom} ${prop.profiles.nom}`);
      console.log(`   Email: ${prop.profiles.email}`);
    } else if (prop.created_by) {
      console.log(`   Créé par ID: ${prop.created_by} (profil non trouvé)`);
    } else {
      console.log(`   Créé par: Anonyme/Public`);
    }

    console.log(`   Établissement: ${prop.payload?.nom || 'Sans nom'}`);
    
    // Analyser pourquoi l'email n'a pas été envoyé
    console.log('\n   📧 Analyse notification:');
    
    if (!prop.created_by) {
      console.log('   ❌ Pas de created_by → Pas d\'email envoyé (proposition publique)');
    } else if (!prop.profiles) {
      console.log('   ❌ Profil non trouvé → Impossible d\'envoyer un email');
    } else if (!prop.profiles.email) {
      console.log('   ❌ Pas d\'email dans le profil → Impossible d\'envoyer un email');
    } else if (prop.statut === 'en_attente') {
      console.log('   ⏳ Statut "en_attente" → Email envoyé uniquement au changement de statut');
      console.log('   💡 L\'email sera envoyé quand un admin approuve/rejette la proposition');
    } else {
      console.log(`   ✅ Conditions réunies → Email devrait avoir été envoyé`);
      console.log(`   📬 Si non reçu, vérifier:`);
      console.log(`      - SPAM de ${prop.profiles.email}`);
      console.log(`      - Logs Supabase Edge Function`);
      console.log(`      - Dashboard Elastic Email`);
    }
    console.log('');
  }

  // Vérifier si le trigger existe
  console.log('\n🔍 Vérification du trigger de notification...\n');
  
  const { data: triggers, error: triggerError } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT 
          trigger_name,
          event_manipulation,
          action_statement
        FROM information_schema.triggers
        WHERE event_object_table = 'propositions'
          AND trigger_schema = 'public'
          AND trigger_name LIKE '%notification%';
      `
    });

  if (triggerError) {
    console.log('⚠️  Impossible de vérifier les triggers (nécessite fonction exec_sql)');
    console.log('   Vérifiez manuellement dans Supabase SQL Editor avec:');
    console.log('   SELECT * FROM information_schema.triggers WHERE event_object_table = \'propositions\';');
  } else if (!triggers || triggers.length === 0) {
    console.log('❌ Aucun trigger de notification trouvé!');
    console.log('   Le trigger n\'est pas installé ou a été désactivé');
    console.log('\n💡 Solution: Exécutez dans Supabase SQL Editor:');
    console.log('   supabase/add-notification-trigger.sql');
  } else {
    console.log('✅ Trigger de notification trouvé et actif');
  }

  console.log('\n' + '='.repeat(80));
  console.log('📝 Résumé du flux de notification:');
  console.log('='.repeat(80));
  console.log('1. Gestionnaire crée un établissement → Proposition en "en_attente"');
  console.log('2. ✉️  AUCUN email automatique à ce stade (comportement normal)');
  console.log('3. Admin approuve/rejette → Changement de statut');
  console.log('4. 🔔 Trigger détecte le changement → Appel Edge Function');
  console.log('5. 📧 Edge Function envoie l\'email via Elastic Email');
  console.log('6. ✅ Gestionnaire reçoit notification de la décision');
  console.log('\n💡 Pour recevoir un email maintenant:');
  console.log('   → Un admin doit approuver/rejeter votre proposition');
  console.log('   → Ou testez manuellement en changeant le statut en SQL\n');
}

checkRecentCreation()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
