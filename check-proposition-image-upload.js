const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

const PROPOSITION_ID = '756dd12c-c6c3-434f-ba21-1892bab54fd9';
const TEMP_ID = '141f37d6-8534-4c39-8956-092fafdfb345';

async function checkImageUpload() {
  console.log('🔍 Vérification upload image\n');
  console.log(`Proposition ID: ${PROPOSITION_ID}`);
  console.log(`Temp ID: ${TEMP_ID}\n`);

  // 1. Vérifier le dossier temp dans Storage
  console.log('📂 Vérification dossier temp dans Storage...');
  const { data: tempFiles, error: tempError } = await supabase.storage
    .from('etablissements')
    .list(TEMP_ID);

  if (tempError) {
    console.error('❌ Erreur:', tempError.message);
  } else if (tempFiles && tempFiles.length > 0) {
    console.log(`✅ ${tempFiles.length} fichier(s) trouvé(s) dans ${TEMP_ID}:`);
    for (const file of tempFiles) {
      console.log(`   - ${file.name}`);
      console.log(`     Taille: ${(file.metadata?.size / 1024).toFixed(2)} KB`);
      console.log(`     Créé: ${file.created_at}`);
      console.log(`     Type: ${file.metadata?.mimetype}`);
    }
  } else {
    console.log('❌ Aucun fichier dans le dossier temp');
  }

  // 2. Lister TOUS les dossiers dans le bucket pour voir s'il y a une image ailleurs
  console.log('\n📂 Listing de TOUS les dossiers du bucket...');
  const { data: allFolders, error: foldersError } = await supabase.storage
    .from('etablissements')
    .list('', { limit: 100 });

  if (foldersError) {
    console.error('❌ Erreur:', foldersError.message);
  } else if (allFolders && allFolders.length > 0) {
    console.log(`\n📊 ${allFolders.length} dossier(s) dans le bucket:\n`);
    
    let totalImages = 0;
    for (const folder of allFolders) {
      if (folder.name && !folder.name.includes('.emptyFolderPlaceholder')) {
        const { data: filesInFolder } = await supabase.storage
          .from('etablissements')
          .list(folder.name);
        
        if (filesInFolder && filesInFolder.length > 0) {
          totalImages += filesInFolder.length;
          console.log(`   ${folder.name}/ (${filesInFolder.length} fichier(s))`);
          
          // Afficher les détails si c'est notre dossier
          if (folder.name === TEMP_ID || folder.name.includes('141f37d6')) {
            filesInFolder.forEach(f => {
              console.log(`      → ${f.name} (${(f.metadata?.size / 1024).toFixed(2)} KB)`);
            });
          }
        }
      }
    }
    console.log(`\n   Total: ${totalImages} image(s) dans le bucket`);
  }

  // 3. Vérifier la proposition payload
  console.log('\n📋 Vérification payload proposition...');
  const { data: prop, error: propError } = await supabase
    .from('propositions')
    .select('payload, created_at')
    .eq('id', PROPOSITION_ID)
    .single();

  if (propError) {
    console.error('❌ Erreur:', propError.message);
  } else if (prop) {
    const payload = prop.payload;
    console.log(`   temp_etablissement_id: ${payload.temp_etablissement_id || 'NULL'}`);
    console.log(`   image_path: ${payload.image_path || 'NULL'}`);
    console.log(`   photo_url: ${payload.photo_url || 'NULL'}`);
    console.log(`   Créée le: ${new Date(prop.created_at).toLocaleString('fr-FR')}`);
  }

  // 4. Vérifier l'établissement créé
  console.log('\n🏢 Vérification établissement créé...');
  const { data: etab, error: etabError } = await supabase
    .from('etablissements')
    .select('id, nom, image_path')
    .eq('id', 'eb533822-71eb-4f62-bb28-cc7dd3ffad0e')
    .single();

  if (etabError) {
    console.error('❌ Erreur:', etabError.message);
  } else if (etab) {
    console.log(`   ID: ${etab.id}`);
    console.log(`   Nom: ${etab.nom}`);
    console.log(`   image_path: ${etab.image_path || '❌ NULL'}`);
  }

  // 5. Chercher des images uploadées récemment (dernier jour)
  console.log('\n🕐 Recherche d\'images récentes (dernier jour)...');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (allFolders) {
    for (const folder of allFolders) {
      if (folder.name && !folder.name.includes('.emptyFolderPlaceholder')) {
        const { data: filesInFolder } = await supabase.storage
          .from('etablissements')
          .list(folder.name);
        
        if (filesInFolder && filesInFolder.length > 0) {
          for (const file of filesInFolder) {
            const fileDate = new Date(file.created_at);
            if (fileDate > yesterday) {
              console.log(`   ✅ ${folder.name}/${file.name}`);
              console.log(`      Taille: ${(file.metadata?.size / 1024).toFixed(2)} KB`);
              console.log(`      Créé: ${fileDate.toLocaleString('fr-FR')}`);
            }
          }
        }
      }
    }
  }

  console.log('\n' + '='.repeat(70));
}

checkImageUpload().catch(console.error);
