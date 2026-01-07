const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSousCategories() {
  const etabId = '4a579403-7f21-4c2c-b8e2-f42b065510d7';
  
  // Vérifier dans la table de liaison
  const { data: liaisons } = await supabase
    .from('etablissement_sous_categorie')
    .select('*')
    .eq('etablissement_id', etabId);
  
  console.log('📊 Liaisons établissement-sous_categorie:', JSON.stringify(liaisons, null, 2));

  // Vérifier l'établissement lui-même
  const { data: etab } = await supabase
    .from('etablissements')
    .select('*')
    .eq('id', etabId)
    .single();
  
  console.log('\n🏢 Établissement:', JSON.stringify(etab, null, 2));

  // Vérifier les sous-catégories marpa
  const { data: marpa } = await supabase
    .from('sous_categories')
    .select('*')
    .eq('slug', 'marpa');
  
  console.log('\n📋 Sous-catégorie MARPA:', JSON.stringify(marpa, null, 2));
}

checkSousCategories().catch(console.error);
