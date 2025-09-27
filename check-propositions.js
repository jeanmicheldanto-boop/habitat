// Script pour vérifier le contenu de la table propositions
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Fonction pour lire les variables d'environnement depuis .env.local
function loadEnvVars() {
  const envPath = path.join(__dirname, '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Fichier .env.local non trouvé');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  const env = {};
  lines.forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });

  return env;
}

async function checkPropositions() {
  console.log('🔍 Vérification du contenu de la table propositions...\n');
  
  try {
    const env = loadEnvVars();
    
    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ Variables Supabase manquantes dans .env.local');
      console.log('Variables trouvées:', Object.keys(env));
      process.exit(1);
    }

    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 1. Compter toutes les propositions
    console.log('📊 Statistiques des propositions:');
    
    const { count: totalCount, error: countError } = await supabase
      .from('propositions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Erreur lors du comptage:', countError);
      return;
    }

    console.log(`   Total propositions: ${totalCount}`);

    // 2. Si des propositions existent, les lister
    if (totalCount > 0) {
      const { data: propositions, error: listError } = await supabase
        .from('propositions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (listError) {
        console.error('❌ Erreur lors de la récupération:', listError);
        return;
      }

      console.log('\n📋 Liste des propositions (dernières 10):');
      console.log('=' .repeat(60));
      
      propositions.forEach((prop, idx) => {
        console.log(`\n${idx + 1}. ID: ${prop.id}`);
        console.log(`   Type cible: ${prop.type_cible}`);
        console.log(`   Action: ${prop.action}`);
        console.log(`   Statut: ${prop.statut}`);
        console.log(`   Source: ${prop.source}`);
        console.log(`   Créé le: ${new Date(prop.created_at).toLocaleString('fr-FR')}`);
        
        if (prop.payload) {
          if (prop.payload.nom) {
            console.log(`   Nom établissement: ${prop.payload.nom}`);
          }
          if (prop.payload.ville) {
            console.log(`   Ville: ${prop.payload.ville}`);
          }
        }
        
        if (prop.reviewed_at) {
          console.log(`   Révisé le: ${new Date(prop.reviewed_at).toLocaleString('fr-FR')}`);
        }
        
        if (prop.review_note) {
          console.log(`   Note de révision: ${prop.review_note}`);
        }
      });

      // 3. Statistiques par statut
      console.log('\n📈 Répartition par statut:');
      const { data: stats, error: statsError } = await supabase
        .from('propositions')
        .select('statut')
        .not('statut', 'is', null);

      if (!statsError && stats) {
        const statusCount = stats.reduce((acc, item) => {
          acc[item.statut] = (acc[item.statut] || 0) + 1;
          return acc;
        }, {});

        Object.entries(statusCount).forEach(([status, count]) => {
          console.log(`   ${status}: ${count}`);
        });
      }

    } else {
      console.log('\n💭 Aucune proposition trouvée dans la base de données.');
      console.log('\n🔧 Pour tester le système de modération:');
      console.log('   1. Allez sur http://localhost:3000/admin');
      console.log('   2. Cliquez sur "🧪 Créer des propositions de test"');
      console.log('   3. Puis testez la modération sur /admin/moderation');
    }

    // 4. Vérifier aussi les établissements pour comparaison
    const { count: etabCount, error: etabCountError } = await supabase
      .from('etablissements')
      .select('*', { count: 'exact', head: true });

    if (!etabCountError) {
      console.log(`\n🏢 Pour comparaison - Total établissements: ${etabCount}`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

checkPropositions().catch(console.error);