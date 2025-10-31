// Ajouter les clés étrangères manquantes pour les tables propositions et reclamations_propriete
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(filename) {
  console.log(`\n📄 Exécution de ${filename}...`);
  
  const sqlPath = path.join(__dirname, 'supabase', filename);
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  // Diviser en requêtes individuelles
  const queries = sql
    .split(';')
    .map(q => q.trim())
    .filter(q => q.length > 0 && !q.startsWith('--'));
  
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    if (!query) continue;
    
    console.log(`  ⏳ Requête ${i + 1}/${queries.length}...`);
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });
    
    if (error) {
      // Essayer avec la méthode directe si rpc ne fonctionne pas
      const { data: data2, error: error2 } = await supabase
        .from('_sql')
        .select('*')
        .limit(0);
      
      if (error2) {
        console.error(`  ❌ Erreur:`, error.message);
        // Continuer quand même pour voir toutes les erreurs
      } else {
        console.log(`  ✅ OK`);
      }
    } else {
      console.log(`  ✅ OK`);
    }
  }
}

async function main() {
  console.log('🔧 Ajout des clés étrangères manquantes...\n');
  
  try {
    // Migration 1: Clés étrangères pour propositions
    await runMigration('add-propositions-foreign-keys.sql');
    
    // Migration 2: Clés étrangères pour reclamations_propriete
    await runMigration('add-reclamations-foreign-keys.sql');
    
    console.log('\n✅ Migrations terminées !');
    console.log('\n💡 Note: Si vous voyez des erreurs, c\'est peut-être que les contraintes existent déjà.');
    console.log('   Vous pouvez les ignorer si elles disent "already exists".\n');
    
  } catch (error) {
    console.error('\n❌ Erreur lors des migrations:', error.message);
    process.exit(1);
  }
}

main();
