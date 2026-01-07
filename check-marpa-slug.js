const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Lire .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkMARPA() {
  // Vérifier le slug de MARPA dans sous_categories
  const { data: sousCategories } = await supabase
    .from('sous_categories')
    .select('*')
    .ilike('libelle', '%marpa%');
  
  console.log('📋 Sous-catégories MARPA:', JSON.stringify(sousCategories, null, 2));

  // Vérifier un établissement test avec image
  const { data: etablissements } = await supabase
    .from('v_liste_publication_geoloc')
    .select('*')
    .contains('sous_categories', ['marpa']);
  
  console.log('\n🏢 Établissements MARPA:', etablissements?.length || 0);
  if (etablissements && etablissements.length > 0) {
    console.log('Premier établissement:', JSON.stringify(etablissements[0], null, 2));
  }

  // Vérifier l'établissement de test récent
  const { data: recent } = await supabase
    .from('v_liste_publication_geoloc')
    .select('*')
    .order('etab_id', { ascending: false })
    .limit(1);
  
  console.log('\n📍 Dernier établissement créé:', JSON.stringify(recent, null, 2));
}

checkMARPA().catch(console.error);
