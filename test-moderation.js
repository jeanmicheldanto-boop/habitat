// Test simple pour vérifier les données de modération
console.log('🧪 Test des données de modération');

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (vous devrez ajuster selon votre .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Variables d\'environnement Supabase manquantes');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testModerationData() {
  try {
    // Test 1: Vérifier les propositions
    console.log('\n📋 Test des propositions...');
    const { data: propositions, error: propError } = await supabase
      .from('propositions')
      .select('*')
      .limit(5);
    
    if (propError) {
      console.error('❌ Erreur propositions:', propError);
    } else {
      console.log(`✅ Trouvé ${propositions?.length || 0} propositions`);
      if (propositions && propositions.length > 0) {
        propositions.forEach((p, i) => {
          console.log(`  ${i + 1}. ID: ${p.id}, Type: ${p.type_cible}, Action: ${p.action}, Statut: ${p.statut}`);
        });
      }
    }

    // Test 2: Vérifier les réclamations
    console.log('\n🏢 Test des réclamations...');
    const { data: reclamations, error: reclamError } = await supabase
      .from('reclamations_propriete')
      .select('*')
      .limit(5);
    
    if (reclamError) {
      console.error('❌ Erreur réclamations:', reclamError);
    } else {
      console.log(`✅ Trouvé ${reclamations?.length || 0} réclamations`);
      if (reclamations && reclamations.length > 0) {
        reclamations.forEach((r, i) => {
          console.log(`  ${i + 1}. ID: ${r.id}, Établissement: ${r.etablissement_id}, Statut: ${r.statut}`);
        });
      }
    }

    // Test 3: Vérifier les profils (pour le système d'auth)
    console.log('\n👤 Test des profils...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, email')
      .limit(5);
    
    if (profileError) {
      console.error('❌ Erreur profils:', profileError);
    } else {
      console.log(`✅ Trouvé ${profiles?.length || 0} profils`);
      if (profiles && profiles.length > 0) {
        profiles.forEach((p, i) => {
          console.log(`  ${i + 1}. ID: ${p.id}, Role: ${p.role}, Email: ${p.email}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testModerationData();