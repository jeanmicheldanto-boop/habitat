const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://saqujdywlbhgnuwsrzrk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhcXVqZHl3bGJoZ251d3NyenJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxMjQzNDQsImV4cCI6MjA1MjcwMDM0NH0.fD6DucUNq6GkT2T0OyI2y9aHfGrqz7OPzKkQXPKKq5k'
);

async function debugSousCategories() {
  console.log('🔍 Vérification des sous-catégories en base...\n');
  
  // 1. Lister toutes les sous-catégories
  const { data: allSc, error: scError } = await supabase
    .from('sous_categories')
    .select('id, libelle, slug')
    .order('libelle');
  
  if (scError) {
    console.error('❌ Erreur:', scError);
    return;
  }
  
  console.log('📂 Toutes les sous-catégories en base:');
  allSc.forEach(sc => {
    console.log(`  - "${sc.libelle}" (slug: ${sc.slug || 'null'})`);
  });
  
  // 2. Chercher spécifiquement "intergénérationnel"
  const intergen = allSc.filter(sc => 
    sc.libelle.toLowerCase().includes('inter') || 
    (sc.slug && sc.slug.toLowerCase().includes('inter'))
  );
  
  console.log('\n🔎 Sous-catégories contenant "inter":');
  console.log(JSON.stringify(intergen, null, 2));
  
  // 3. Vérifier ce que retourne la vue pour un établissement avec cette sous-catégorie
  console.log('\n📋 Recherche d\'établissements avec ces sous-catégories...');
  
  for (const sc of intergen) {
    const { data: etabs } = await supabase
      .from('etablissement_sous_categorie')
      .select('etablissement_id')
      .eq('sous_categorie_id', sc.id)
      .limit(3);
    
    if (etabs && etabs.length > 0) {
      console.log(`\n  ✅ ${etabs.length} établissement(s) avec "${sc.libelle}"`);
      
      // Vérifier ce que la vue retourne pour ces établissements
      const etabIds = etabs.map(e => e.etablissement_id);
      const { data: vueData } = await supabase
        .from('v_liste_publication_geoloc')
        .select('etab_id, nom, sous_categories')
        .in('etab_id', etabIds);
      
      console.log('  📊 Ce que la vue retourne:');
      vueData?.forEach(v => {
        console.log(`    - ${v.nom}`);
        console.log(`      sous_categories: ${JSON.stringify(v.sous_categories)}`);
      });
    }
  }
}

debugSousCategories()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
