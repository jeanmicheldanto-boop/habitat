require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSousCategories() {
  console.log('🔍 Récupération de TOUS les établissements...\n');

  // Récupérer TOUS les établissements sans limite
  const { data, error, count } = await supabase
    .from('v_liste_publication')
    .select('sous_categories, nom', { count: 'exact' });

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log(`📊 Total établissements dans la base: ${count}\n`);

  const allCategories = new Set();
  const categoryCounts = {};
  let withoutCategories = 0;
  let withCategories = 0;

  data.forEach(row => {
    if (!row.sous_categories || row.sous_categories.length === 0) {
      withoutCategories++;
    } else {
      withCategories++;
      row.sous_categories.forEach(cat => {
        allCategories.add(cat);
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    }
  });

  console.log('📊 Sous-catégories trouvées (triées alphabétiquement):\n');
  const sorted = Array.from(allCategories).sort();
  sorted.forEach(cat => {
    console.log(`  - "${cat}" (${categoryCounts[cat]} établissements)`);
  });

  console.log('\n📝 Statistiques:');
  console.log(`  - Sous-catégories uniques: ${allCategories.size}`);
  console.log(`  - Établissements AVEC sous-catégories: ${withCategories}`);
  console.log(`  - Établissements SANS sous-catégories: ${withoutCategories}`);
  console.log(`  - Total établissements analysés: ${data.length}`);
}

checkSousCategories();
