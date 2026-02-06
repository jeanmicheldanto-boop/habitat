import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Vérification des notifications créées...\n');

// Vérifier les notifications créées récemment
const { data: notifications, error: notifError } = await supabase
  .from('notifications')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(5);

if (notifError) {
  console.error('❌ Erreur:', notifError);
} else {
  console.log('📬 Dernières notifications dans la base:', notifications.length);
  notifications.forEach(notif => {
    console.log(`  - ${notif.type} pour user ${notif.user_id} à ${notif.created_at}`);
    console.log(`    Titre: ${notif.title}`);
  });
}

console.log('\n🔍 Vérification des triggers actifs...\n');

// Vérifier que les triggers existent
const { data: triggers, error: trigError } = await supabase.rpc('exec_sql', {
  sql: `
    SELECT 
      trigger_name,
      event_object_table,
      action_statement,
      action_timing,
      event_manipulation
    FROM information_schema.triggers
    WHERE trigger_name LIKE '%notification%'
    ORDER BY event_object_table, trigger_name;
  `
});

if (trigError) {
  console.log('⚠️  Utilisons une requête alternative...');
  
  // Alternative: exécuter via SQL direct
  const { data, error } = await supabase
    .from('propositions')
    .select('id, statut, created_by')
    .eq('id', 'b1d7b998-4389-4967-9c5c-68b738f266e4')
    .single();
  
  console.log('\n📋 Proposition testée:');
  console.log(data);
} else {
  console.log('✅ Triggers trouvés:', triggers);
}
