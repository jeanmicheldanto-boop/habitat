const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Mzc5MDcsImV4cCI6MjA3NDMxMzkwN30.PWbq0NaB8ZyBIR5XgSn2pD_VoiH9eMjyjUYvvLmA3ng'
);

async function checkDepartementFormats() {
  console.log('\n=== ANALYSE DES FORMATS DE DÉPARTEMENTS ===\n');

  // 1. Récupérer tous les formats de départements
  const { data: allData } = await supabase
    .from('v_liste_publication_geoloc')
    .select('departement');

  if (allData) {
    const uniqueDepts = [...new Set(allData.map(d => d.departement))].filter(Boolean).sort();
    
    console.log(`Total: ${uniqueDepts.length} départements uniques\n`);
    
    // Analyser les formats
    const formats = {
      'avec_code_parentheses': [], // "Indre (36)"
      'nom_seul': [],                // "Indre"
      'code_seul': [],               // "36"
      'autre': []
    };

    uniqueDepts.forEach(dept => {
      if (/^[^(]+\s*\(\d{1,3}[AB]?\)$/.test(dept)) {
        formats.avec_code_parentheses.push(dept);
      } else if (/^\d{1,3}[AB]?$/.test(dept)) {
        formats.code_seul.push(dept);
      } else if (!/\(\d/.test(dept)) {
        formats.nom_seul.push(dept);
      } else {
        formats.autre.push(dept);
      }
    });

    console.log('📊 RÉPARTITION PAR FORMAT:\n');
    console.log(`Format "Nom (Code)": ${formats.avec_code_parentheses.length} départements`);
    if (formats.avec_code_parentheses.length > 0) {
      console.log('Exemples:', formats.avec_code_parentheses.slice(0, 5).join(', '));
    }
    
    console.log(`\nFormat "Nom seul": ${formats.nom_seul.length} départements`);
    if (formats.nom_seul.length > 0) {
      console.log('Exemples:', formats.nom_seul.slice(0, 5).join(', '));
    }
    
    console.log(`\nFormat "Code seul": ${formats.code_seul.length} départements`);
    if (formats.code_seul.length > 0) {
      console.log('Exemples:', formats.code_seul.slice(0, 5).join(', '));
    }
    
    console.log(`\nFormat "Autre": ${formats.autre.length} départements`);
    if (formats.autre.length > 0) {
      console.log('Exemples:', formats.autre.join(', '));
    }

    // 2. Vérifier dans la table source etablissements
    console.log('\n\n=== DANS LA TABLE ETABLISSEMENTS ===\n');
    
    const { data: etabData } = await supabase
      .from('etablissements')
      .select('departement')
      .limit(1000);

    if (etabData) {
      const uniqueEtabDepts = [...new Set(etabData.map(d => d.departement))].filter(Boolean).sort();
      console.log(`Total: ${uniqueEtabDepts.length} formats uniques dans etablissements\n`);
      
      const etabFormats = {
        avec_code_parentheses: [],
        nom_seul: [],
        code_seul: [],
        autre: []
      };

      uniqueEtabDepts.forEach(dept => {
        if (/^[^(]+\s*\(\d{1,3}[AB]?\)$/.test(dept)) {
          etabFormats.avec_code_parentheses.push(dept);
        } else if (/^\d{1,3}[AB]?$/.test(dept)) {
          etabFormats.code_seul.push(dept);
        } else if (!/\(\d/.test(dept)) {
          etabFormats.nom_seul.push(dept);
        } else {
          etabFormats.autre.push(dept);
        }
      });

      console.log('📊 RÉPARTITION PAR FORMAT:\n');
      console.log(`Format "Nom (Code)": ${etabFormats.avec_code_parentheses.length}`);
      console.log(`Format "Nom seul": ${etabFormats.nom_seul.length}`);
      console.log(`Format "Code seul": ${etabFormats.code_seul.length}`);
      console.log(`Format "Autre": ${etabFormats.autre.length}`);
    }

    // 3. Recommandations
    console.log('\n\n=== RECOMMANDATIONS ===\n');
    
    const totalWithCode = formats.avec_code_parentheses.length;
    const totalNomSeul = formats.nom_seul.length;
    const totalCodeSeul = formats.code_seul.length;
    
    if (totalWithCode > totalNomSeul && totalWithCode > totalCodeSeul) {
      console.log('✅ FORMAT MAJORITAIRE: "Nom (Code)" - ex: "Indre (36)"');
      console.log('\n📝 NORMALISATION RECOMMANDÉE:');
      console.log('   → Utiliser le format "Nom (Code)" partout');
      console.log('   → Créer une fonction de normalisation côté application');
      console.log('   → OU mettre à jour la base pour uniformiser');
    } else if (totalCodeSeul > 0) {
      console.log('⚠️  FORMAT MIXTE DÉTECTÉ');
      console.log('\n📝 NORMALISATION NÉCESSAIRE:');
      console.log('   → Choisir un format unique: "Nom (Code)" recommandé');
      console.log('   → Mettre à jour les données incohérentes');
    }
  }
}

checkDepartementFormats().then(() => {
  console.log('\n=== FIN DE L\'ANALYSE ===\n');
  process.exit(0);
}).catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
