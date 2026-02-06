import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🧪 Test manuel du trigger de notification\n');

const propositionId = 'b1d7b998-4389-4967-9c5c-68b738f266e4';

// Étape 1 : Mettre le statut à 'en_attente'
console.log('1️⃣ Mise du statut à "en_attente"...');
let { error: error1 } = await supabase
  .from('propositions')
  .update({ statut: 'en_attente' })
  .eq('id', propositionId);

if (error1) {
  console.error('❌ Erreur:', error1.message);
  process.exit(1);
}
console.log('✅ Statut mis à "en_attente"\n');

// Attendre 1 seconde
await new Promise(resolve => setTimeout(resolve, 1000));

// Étape 2 : Changer à 'approuvee' pour déclencher le trigger
console.log('2️⃣ Changement du statut à "approuvee" (déclenche le trigger)...');
let { error: error2 } = await supabase
  .from('propositions')
  .update({ statut: 'approuvee' })
  .eq('id', propositionId);

if (error2) {
  console.error('❌ Erreur:', error2.message);
  process.exit(1);
}
console.log('✅ Statut changé à "approuvee"');
console.log('   🔥 Le trigger devrait s\'exécuter maintenant!\n');

// Attendre que le trigger s'exécute
console.log('⏳ Attente de 3 secondes pour l\'exécution...\n');
await new Promise(resolve => setTimeout(resolve, 3000));

// Étape 3 : Vérifier si une notification a été créée
console.log('3️⃣ Vérification des notifications...');
const { data: notif } = await supabase
  .from('notifications')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

if (notif && new Date(notif.created_at).getTime() > Date.now() - 10000) {
  console.log('✅ Notification créée !');
  console.log(`   Type: ${notif.type}`);
  console.log(`   Titre: ${notif.title}`);
  console.log(`   User: ${notif.user_id}`);
  console.log(`   Créée: ${notif.created_at}\n`);
} else {
  console.log('⚠️  Aucune notification récente trouvée\n');
}

console.log('============================================================');
console.log('📬 Vérifications à faire:');
console.log('============================================================');
console.log('1. Vérifier votre email (patrick.genevaux@gmail.com)');
console.log('2. Vérifier les logs Edge Function:');
console.log('   → Supabase → Edge Functions → send-notification → Logs');
console.log('3. Vérifier Elastic Email:');
console.log('   → https://elasticemail.com/reports');
console.log('============================================================\n');

console.log('✅ Test terminé!');
