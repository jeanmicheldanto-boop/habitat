// Vérifier les clés étrangères sur les tables propositions et reclamations_propriete
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Lire manuellement le fichier .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkForeignKeys() {
  console.log('🔍 Vérification des clés étrangères...\n');
  
  // Vérifier les FK sur propositions
  const { data: propFK, error: propError } = await supabase
    .from('propositions')
    .select('created_by, profiles!created_by(nom, email)')
    .limit(1);
  
  console.log('📋 Test JOIN propositions -> profiles (created_by):');
  if (propError) {
    console.error('❌ Erreur:', propError.message);
    console.log('\n🔧 La clé étrangère propositions.created_by -> profiles.id n\'existe PAS\n');
  } else {
    console.log('✅ JOIN fonctionne ! La clé étrangère existe.');
    console.log('Données:', JSON.stringify(propFK, null, 2));
  }
  
  // Vérifier les FK sur reclamations_propriete
  const { data: reclamFK, error: reclamError } = await supabase
    .from('reclamations_propriete')
    .select('user_id, profiles!user_id(nom, email)')
    .limit(1);
  
  console.log('\n📋 Test JOIN reclamations_propriete -> profiles (user_id):');
  if (reclamError) {
    console.error('❌ Erreur:', reclamError.message);
    console.log('\n🔧 La clé étrangère reclamations_propriete.user_id -> profiles.id n\'existe PAS\n');
  } else {
    console.log('✅ JOIN fonctionne ! La clé étrangère existe.');
    console.log('Données:', JSON.stringify(reclamFK, null, 2));
  }
}

checkForeignKeys();
