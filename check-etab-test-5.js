const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkEtablissementTest5() {
  const propId = '21fdbf30-1236-4e80-af75-c80a1856f3ca';
  
  const { data: prop, error } = await supabase
    .from('propositions')
    .select('*')
    .eq('id', propId)
    .single();

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log('📋 Proposition "etablissement test 5":');
  console.log(`   ID: ${prop.id}`);
  console.log(`   Statut: ${prop.statut}`);
  console.log(`   Created by: ${prop.created_by}`);
  console.log(`   Type: ${prop.type_cible} - ${prop.action}`);
  console.log(`   Source: ${prop.source}`);
  console.log(`   Créé: ${prop.created_at}`);
  console.log(`   Nom: ${prop.payload?.nom}`);
  console.log(`   Sous-catégories: ${JSON.stringify(prop.payload?.sous_categories)}`);

  // Vérifier le profil de created_by
  if (prop.created_by) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', prop.created_by)
      .single();

    console.log('\n👤 Créateur:');
    console.log(`   Email: ${profile?.email}`);
    console.log(`   Nom: ${profile?.full_name}`);
    console.log(`   Admin: ${profile?.is_admin}`);
  }
}

checkEtablissementTest5().catch(console.error);
