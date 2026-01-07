const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkLatestTest() {
  // Chercher les établissements de test les plus récents
  const { data } = await supabase
    .from('v_liste_publication_geoloc')
    .select('etab_id, nom, sous_categories, image_path')
    .ilike('nom', '%test%')
    .order('etab_id', { ascending: false })
    .limit(3);
  
  console.log('🔍 Derniers établissements de test:\n');
  data?.forEach(etab => {
    console.log(`ID: ${etab.etab_id}`);
    console.log(`Nom: ${etab.nom}`);
    console.log(`Sous-catégories: ${JSON.stringify(etab.sous_categories)}`);
    console.log(`Image: ${etab.image_path}`);
    console.log('---');
  });

  // Vérifier les liaisons pour le dernier
  if (data && data.length > 0) {
    const etabId = data[0].etab_id;
    const { data: liaisons } = await supabase
      .from('etablissement_sous_categorie')
      .select('sous_categorie_id, sous_categories(slug, libelle)')
      .eq('etablissement_id', etabId);
    
    console.log(`\n📊 Liaisons pour ${data[0].nom}:`);
    console.log(JSON.stringify(liaisons, null, 2));
  }
}

checkLatestTest().catch(console.error);
