const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function fixEtabSousCategorie() {
  const etabId = 'ee93177d-6041-40f2-849f-286ba46c0260';
  const marpaId = 'af6adfe0-5f76-44ba-a4fb-ada756ff2ede';

  // Ajouter la liaison
  const { error } = await supabase
    .from('etablissement_sous_categorie')
    .insert({
      etablissement_id: etabId,
      sous_categorie_id: marpaId
    });

  if (error) {
    console.error('❌ Erreur:', error);
  } else {
    console.log('✅ Liaison MARPA ajoutée pour "Etablissement test final"');
  }

  // Vérifier
  const { data } = await supabase
    .from('v_liste_publication_geoloc')
    .select('nom, sous_categories')
    .eq('etab_id', etabId)
    .single();

  console.log('\n📊 Résultat:', JSON.stringify(data, null, 2));
}

fixEtabSousCategorie().catch(console.error);
