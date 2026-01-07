const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function testNormalization() {
  console.log('🧪 Test de normalisation des sous-catégories\n');
  
  // Simuler les clés front-end envoyées par le gestionnaire
  const testKeys = [
    'habitat_intergenerationnel',
    'colocation_avec_services',
    'residence_autonomie',
    'marpa',
    'beguinage'
  ];
  
  // Récupérer les sous-catégories de la base
  const { data: allSousCategories } = await supabase
    .from('sous_categories')
    .select('id, libelle, slug')
    .not('slug', 'is', null);
  
  console.log('📋 Sous-catégories en base avec slug:');
  console.log(`   Total: ${allSousCategories?.length || 0}\n`);
  
  // Fonction de normalisation (identique au code)
  const normalize = (str) => {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/[_\s-]+/g, '_');
  };
  
  console.log('🔍 Test de correspondance:\n');
  
  for (const testKey of testKeys) {
    const normalizedKey = normalize(testKey);
    
    // Rechercher par slug
    let matchingSc = allSousCategories?.find(sc => normalize(sc.slug || '') === normalizedKey);
    
    if (matchingSc) {
      console.log(`✅ "${testKey}"`);
      console.log(`   → Trouvé: "${matchingSc.libelle}" [slug: ${matchingSc.slug}]`);
      console.log(`   → UUID: ${matchingSc.id}`);
    } else {
      console.log(`❌ "${testKey}"`);
      console.log(`   → Non trouvé (normalisé: ${normalizedKey})`);
      
      // Essayer de montrer les correspondances potentielles
      const potentials = allSousCategories?.filter(sc => {
        const scNormalized = normalize(sc.slug || '');
        return scNormalized.includes(normalizedKey.substring(0, 5)) || 
               normalizedKey.includes(scNormalized.substring(0, 5));
      });
      
      if (potentials && potentials.length > 0) {
        console.log('   → Correspondances possibles:');
        potentials.forEach(p => {
          console.log(`      • "${p.libelle}" [slug: ${p.slug}]`);
        });
      }
    }
    console.log('');
  }
  
  console.log('✅ Test terminé');
}

testNormalization()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
