import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Vérification du système de triggers...\n');

// 1. Vérifier que la fonction existe
console.log('1️⃣ Vérification de la fonction notify_proposition_status_change...');
const { data: functions, error: funcError } = await supabase.rpc('exec_sql', {
  sql: `
    SELECT 
      routine_name,
      routine_type,
      routine_definition
    FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name IN ('notify_proposition_status_change', 'notify_reclamation_status_change');
  `
}).catch(() => ({ data: null, error: 'RPC not available' }));

if (funcError || !functions) {
  console.log('⚠️  Impossible de vérifier via RPC, essayons une autre méthode...\n');
} else {
  console.log('✅ Fonctions trouvées:', functions.length);
  functions.forEach(f => console.log(`   - ${f.routine_name}`));
}

// 2. Test direct : mettre à jour une proposition et observer
console.log('\n2️⃣ Test direct : modification de statut...');
const propositionId = 'b1d7b998-4389-4967-9c5c-68b738f266e4';

// D'abord, récupérer l'état actuel
const { data: before } = await supabase
  .from('propositions')
  .select('id, statut, created_by')
  .eq('id', propositionId)
  .single();

console.log('État avant:', before);

// Mettre à jour vers 'approuvee'
const { data: updated, error: updateError } = await supabase
  .from('propositions')
  .update({ statut: 'approuvee' })
  .eq('id', propositionId)
  .select()
  .single();

if (updateError) {
  console.error('❌ Erreur lors de la mise à jour:', updateError);
} else {
  console.log('✅ Mise à jour effectuée:', updated.statut);
}

// Attendre 2 secondes
console.log('\n⏳ Attente de 2 secondes pour que le trigger s\'exécute...');
await new Promise(resolve => setTimeout(resolve, 2000));

// 3. Vérifier si une notification a été créée
console.log('\n3️⃣ Vérification des notifications créées...');
const { data: notifications } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', before.created_by)
  .order('created_at', { ascending: false })
  .limit(3);

console.log(`Notifications récentes pour user ${before.created_by}:`, notifications?.length || 0);
if (notifications && notifications.length > 0) {
  notifications.forEach(n => {
    console.log(`   - ${n.type}: ${n.title} (${new Date(n.created_at).toLocaleString()})`);
  });
} else {
  console.log('   ⚠️  Aucune notification trouvée - le trigger ne s\'exécute peut-être pas');
}

// Remettre en attente
console.log('\n🔙 Remise du statut à "en_attente"...');
await supabase
  .from('propositions')
  .update({ statut: 'en_attente' })
  .eq('id', propositionId);

console.log('\n✅ Diagnostic terminé!');
console.log('\n💡 Si aucune notification n\'a été créée, le trigger ne s\'exécute pas.');
console.log('   Vérifiez dans Supabase Dashboard → SQL Editor:');
console.log('   SELECT * FROM pg_trigger WHERE tgname LIKE \'%notification%\';');
