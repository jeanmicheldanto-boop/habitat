const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function checkSousCategories() {
  console.log('🔍 Vérification table sous_categories\n');

  // Récupérer toutes les sous-catégories
  const { data: sousCategories, error } = await supabase
    .from('sous_categories')
    .select('id, libelle, slug')
    .order('libelle');

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log(`📊 ${sousCategories.length} sous-catégories dans la base:\n`);

  sousCategories.forEach(sc => {
    console.log(`   ${sc.libelle}`);
    console.log(`      slug: ${sc.slug || 'NULL'}`);
    console.log(`      id: ${sc.id}`);
  });

  // Recherche spécifique
  console.log('\n\n🔍 Recherche "residence_autonomie":');
  const normalize = (str) => {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/[_\s-]+/g, '_');
  };

  const searchKey = 'residence_autonomie';
  const normalizedSearch = normalize(searchKey);
  console.log(`   Clé recherchée: "${searchKey}"`);
  console.log(`   Normalisée: "${normalizedSearch}"`);

  const bySlug = sousCategories.find(sc => normalize(sc.slug || '') === normalizedSearch);
  if (bySlug) {
    console.log(`   ✅ Trouvé par slug: "${bySlug.libelle}" [${bySlug.slug}]`);
  } else {
    console.log(`   ❌ Pas trouvé par slug`);
  }

  const byLibelle = sousCategories.find(sc => normalize(sc.libelle) === normalizedSearch);
  if (byLibelle) {
    console.log(`   ✅ Trouvé par libellé: "${byLibelle.libelle}" [${byLibelle.slug}]`);
  } else {
    console.log(`   ❌ Pas trouvé par libellé`);
  }

  // Afficher toutes les correspondances partielles
  console.log('\n   🔎 Correspondances partielles:');
  sousCategories.forEach(sc => {
    const normalizedSlug = normalize(sc.slug || '');
    const normalizedLibelle = normalize(sc.libelle);
    
    if (normalizedSlug.includes('residence') || normalizedSlug.includes('autonomie') ||
        normalizedLibelle.includes('residence') || normalizedLibelle.includes('autonomie')) {
      console.log(`      - "${sc.libelle}" (slug: ${sc.slug})`);
      console.log(`        Slug normalisé: "${normalizedSlug}"`);
      console.log(`        Libellé normalisé: "${normalizedLibelle}"`);
    }
  });
}

checkSousCategories().catch(console.error);
