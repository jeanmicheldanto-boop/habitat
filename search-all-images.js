const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function searchAllImages() {
  console.log('🔍 Recherche exhaustive d\'images liées à la proposition\n');

  const propositionId = '97dd51d8-c3f3-4e98-957f-42e901183e53';
  const tempId = '25087530-ef5e-464b-98f4-10228afd7623';

  // 1. Vérifier le dossier temporaire spécifique
  console.log('1️⃣ Vérification du dossier temp spécifique...\n');
  
  try {
    const { data: tempFiles, error: tempError } = await supabase.storage
      .from('etablissements')
      .list(tempId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (tempError) {
      console.log(`   ❌ Erreur: ${tempError.message}`);
    } else if (tempFiles && tempFiles.length > 0) {
      console.log(`   ✅ ${tempFiles.length} fichier(s) trouvé(s):\n`);
      for (const file of tempFiles) {
        console.log(`      📄 ${file.name}`);
        console.log(`         Taille: ${(file.metadata?.size / 1024).toFixed(2)} KB`);
        console.log(`         Type: ${file.metadata?.mimetype || 'N/A'}`);
        console.log(`         Créé: ${new Date(file.created_at).toLocaleString('fr-FR')}\n`);
      }
    } else {
      console.log(`   ℹ️ Aucun fichier dans ${tempId}`);
    }
  } catch (err) {
    console.log(`   ❌ Erreur lors de l'accès: ${err.message}`);
  }

  // 2. Lister tous les dossiers récents dans etablissements
  console.log('\n2️⃣ Recherche dans tous les dossiers récents...\n');
  
  try {
    const { data: allFolders, error: allError } = await supabase.storage
      .from('etablissements')
      .list('', {
        limit: 50,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (allError) {
      console.log(`   ❌ Erreur: ${allError.message}`);
    } else if (allFolders) {
      console.log(`   📁 ${allFolders.length} dossier(s) trouvé(s):\n`);
      
      // Filtrer uniquement les dossiers créés aujourd'hui ou hier
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      for (const folder of allFolders.slice(0, 10)) {
        const folderDate = new Date(folder.created_at);
        const isRecent = folderDate >= yesterday;
        
        if (isRecent || folder.name === tempId) {
          console.log(`      ${folder.name === tempId ? '🎯' : '📂'} ${folder.name}`);
          console.log(`         Créé: ${folderDate.toLocaleString('fr-FR')}`);
          
          // Lister le contenu de ce dossier
          const { data: folderFiles } = await supabase.storage
            .from('etablissements')
            .list(folder.name);
          
          if (folderFiles && folderFiles.length > 0) {
            console.log(`         📄 ${folderFiles.length} fichier(s):`);
            folderFiles.forEach(f => {
              console.log(`            - ${f.name} (${(f.metadata?.size / 1024).toFixed(2)} KB)`);
            });
          }
          console.log('');
        }
      }
    }
  } catch (err) {
    console.log(`   ❌ Erreur: ${err.message}`);
  }

  // 3. Vérifier s'il y a des fichiers avec "ossun" dans le nom
  console.log('\n3️⃣ Recherche de fichiers contenant "ossun"...\n');
  
  try {
    // Parcourir les dossiers pour chercher des fichiers
    const { data: folders } = await supabase.storage
      .from('etablissements')
      .list('', { limit: 100 });
    
    if (folders) {
      for (const folder of folders) {
        const { data: files } = await supabase.storage
          .from('etablissements')
          .list(folder.name);
        
        if (files) {
          const ossunFiles = files.filter(f => 
            f.name.toLowerCase().includes('ossun') || 
            folder.name.toLowerCase().includes('ossun')
          );
          
          if (ossunFiles.length > 0) {
            console.log(`   📁 Dossier ${folder.name}:`);
            ossunFiles.forEach(f => {
              console.log(`      📄 ${f.name} (${(f.metadata?.size / 1024).toFixed(2)} KB)`);
            });
          }
        }
      }
    }
  } catch (err) {
    console.log(`   ℹ️ Recherche textuelle non disponible`);
  }

  // 4. Vérifier les logs/métadonnées de la proposition
  console.log('\n4️⃣ Métadonnées de la proposition:\n');
  
  const { data: prop } = await supabase
    .from('propositions')
    .select('payload, created_at')
    .eq('id', propositionId)
    .single();
  
  if (prop && prop.payload) {
    console.log(`   Créée le: ${new Date(prop.created_at).toLocaleString('fr-FR')}`);
    console.log(`   temp_etablissement_id: ${prop.payload.temp_etablissement_id}`);
    console.log(`   image_path: ${prop.payload.image_path || 'NULL'}`);
    console.log(`   photo_url: ${prop.payload.photo_url || 'NULL'}`);
    
    // Vérifier si d'autres champs photo existent
    const photoKeys = Object.keys(prop.payload).filter(k => 
      k.toLowerCase().includes('photo') || 
      k.toLowerCase().includes('image')
    );
    
    if (photoKeys.length > 0) {
      console.log(`\n   Champs liés aux photos:`);
      photoKeys.forEach(key => {
        console.log(`      ${key}: ${prop.payload[key]}`);
      });
    }
  }
}

searchAllImages().catch(console.error);
