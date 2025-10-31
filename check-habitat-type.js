const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://saqujdywlbhgnuwsrzrk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhcXVqZHl3bGJoZ251d3NyenJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxMjQzNDQsImV4cCI6MjA1MjcwMDM0NH0.fD6DucUNq6GkT2T0OyI2y9aHfGrqz7OPzKkQXPKKq5k'
);

async function checkHabitatType() {
  console.log('🔍 Liste de toutes les sous-catégories...\n');
  
  // 1. Trouver toutes les sous-catégories
  const { data: allSc } = await supabase
    .from('sous_categories')
    .select('id, libelle, slug')
    .order('libelle');
  
  console.log('📂 Toutes les sous-catégories:');
  console.log(JSON.stringify(allSc, null, 2));
}

checkHabitatType()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
