const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function checkNestedFolder() {
  console.log('🔍 Recherche dans le dossier "etablissements/" (imbriqué)\n');

  // Chercher si un dossier "etablissements" existe dans le bucket
  const { data: rootFiles, error: rootError } = await supabase.storage
    .from('etablissements')
    .list('');

  if (rootError) {
    console.error('❌ Erreur:', rootError.message);
    return;
  }

  console.log(`📂 ${rootFiles.length} dossier(s) à la racine du bucket:\n`);
  
  let foundEtablissementsFolder = false;
  for (const item of rootFiles) {
    console.log(`   ${item.name}${item.id ? '/' : ''}`);
    
    if (item.name === 'etablissements') {
      foundEtablissementsFolder = true;
      console.log('      ⚠️ Dossier imbriqué "etablissements" trouvé!\n');
      
      // Lister le contenu
      const { data: nestedFiles } = await supabase.storage
        .from('etablissements')
        .list('etablissements');
      
      if (nestedFiles && nestedFiles.length > 0) {
        console.log(`      📁 Contenu (${nestedFiles.length} élément(s)):`);
        for (const nested of nestedFiles) {
          console.log(`         - ${nested.name}/`);
          
          // Lister les fichiers dans ce dossier
          const { data: innerFiles } = await supabase.storage
            .from('etablissements')
            .list(`etablissements/${nested.name}`);
          
          if (innerFiles && innerFiles.length > 0) {
            innerFiles.forEach(f => {
              console.log(`            → ${f.name} (${(f.metadata?.size / 1024).toFixed(2)} KB)`);
            });
          }
        }
      }
    }
  }

  if (!foundEtablissementsFolder) {
    console.log('\n✅ Pas de dossier imbriqué "etablissements" trouvé');
  } else {
    console.log('\n⚠️ Des fichiers ont été uploadés dans le mauvais dossier!');
    console.log('   Path incorrect: etablissements/xxx/main.jpg');
    console.log('   Path correct: xxx/main.jpg');
  }

  console.log('\n' + '='.repeat(70));
}

checkNestedFolder().catch(console.error);
