// Test simple pour vérifier les propositions
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Lire le fichier .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');
const env = {};

lines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testPropositions() {
  console.log('🔍 Test des propositions...\n');
  
  try {
    // 1. Compter toutes les propositions
    const { data: allPropositions, error: allError } = await supabase
      .from('propositions')
      .select('*');
    
    if (allError) {
      console.error('❌ Erreur lors de la lecture des propositions:', allError);
      return;
    }
    
    console.log(`✅ Total propositions dans la base: ${allPropositions.length}`);
    
    if (allPropositions.length > 0) {
      console.log('\n📋 Liste des propositions:');
      allPropositions.forEach((prop, idx) => {
        console.log(`${idx + 1}. ID: ${prop.id}`);
        console.log(`   - Type cible: ${prop.type_cible}`);
        console.log(`   - Action: ${prop.action}`);
        console.log(`   - Statut: ${prop.statut}`);
        console.log(`   - Créé le: ${prop.created_at}`);
        if (prop.payload && prop.payload.nom) {
          console.log(`   - Nom établissement: ${prop.payload.nom}`);
        }
        console.log('');
      });
    }
    
    // 2. Vérifier aussi les établissements
    const { data: etablissements, error: etabError } = await supabase
      .from('etablissements')
      .select('id, nom, statut, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (etabError) {
      console.error('❌ Erreur lors de la lecture des établissements:', etabError);
      return;
    }
    
    console.log(`\n🏢 Établissements récents (${etablissements.length}):`);
    etablissements.forEach((etab, idx) => {
      console.log(`${idx + 1}. ${etab.nom} (${etab.statut}) - ${etab.created_at}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testPropositions().catch(console.error);