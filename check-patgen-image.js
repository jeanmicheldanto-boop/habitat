const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function checkPatgenImage() {
  console.log('\n🔍 Recherche établissement Maison Patgen à Ossun...\n');
  
  // 1. Rechercher l'établissement
  const { data: etabs, error } = await supabase
    .from('v_liste_publication')
    .select('*')
    .ilike('nom', '%patgen%');
  
  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }
  
  if (!etabs || etabs.length === 0) {
    console.log('❌ Aucun établissement trouvé avec "patgen" dans le nom');
    
    // Lister tous les établissements à Ossun
    const { data: ossun } = await supabase
      .from('v_liste_publication')
      .select('*')
      .ilike('commune', '%ossun%');
    
    console.log('\n📍 Établissements à Ossun:', ossun?.length || 0);
    if (ossun && ossun.length > 0) {
      ossun.forEach(e => console.log(`  - ${e.nom} (ID: ${e.etab_id})`));
    }
    return;
  }
  
  console.log(`✅ ${etabs.length} établissement(s) trouvé(s):\n`);
  
  for (const etab of etabs) {
    console.log('='.repeat(70));
    console.log(`📋 Nom: ${etab.nom}`);
    console.log(`   ID: ${etab.etab_id}`);
    console.log(`   Commune: ${etab.commune}`);
    console.log(`   Image path: ${etab.image_path || '❌ NULL'}`);
    console.log(`   Sous-catégories: ${etab.sous_categories}`);
    console.log('');
    
    // 2. Vérifier la table etablissements directement
    const { data: etabData, error: etabError } = await supabase
      .from('etablissements')
      .select('id, nom, image_path')
      .eq('id', etab.etab_id)
      .single();
    
    if (etabError) {
      console.error('❌ Erreur table etablissements:', etabError.message);
    } else {
      console.log('📊 Données table etablissements:');
      console.log(`   ID: ${etabData.id}`);
      console.log(`   Nom: ${etabData.nom}`);
      console.log(`   image_path: ${etabData.image_path || '❌ NULL'}`);
    }
    
    // 3. Vérifier les fichiers dans le storage
    if (etabData && etabData.id) {
      console.log('\n📂 Vérification Storage...');
      const { data: files, error: storageError } = await supabase.storage
        .from('etablissements')
        .list(`etablissements/${etabData.id}`);
      
      if (storageError) {
        console.error('❌ Erreur storage:', storageError.message);
      } else if (files && files.length > 0) {
        console.log(`✅ ${files.length} fichier(s) trouvé(s):`);
        files.forEach(f => {
          console.log(`   - ${f.name}`);
          console.log(`     Taille: ${(f.metadata?.size / 1024).toFixed(2)} KB`);
          console.log(`     Créé: ${f.created_at}`);
          console.log(`     Path complet: etablissements/${etabData.id}/${f.name}`);
        });
        
        // 4. Tester l'URL publique
        if (files[0]) {
          const fullPath = `etablissements/${etabData.id}/${files[0].name}`;
          const { data } = supabase.storage
            .from('etablissements')
            .getPublicUrl(fullPath);
          console.log(`\n🌐 URL publique: ${data.publicUrl}`);
        }
      } else {
        console.log('❌ Aucun fichier dans ce dossier');
        
        // Lister les autres dossiers possibles
        console.log('\n🔍 Recherche dans d\'autres emplacements...');
        const { data: allFolders } = await supabase.storage
          .from('etablissements')
          .list('', { limit: 1000 });
        
        if (allFolders) {
          const matchingFolders = allFolders.filter(f => 
            f.name && (f.name === etabData.id || f.name.includes(etabData.id.substring(0, 8)))
          );
          
          if (matchingFolders.length > 0) {
            console.log(`📁 Dossiers potentiels trouvés:`);
            for (const folder of matchingFolders) {
              console.log(`   - ${folder.name}`);
              const { data: folderFiles } = await supabase.storage
                .from('etablissements')
                .list(folder.name);
              if (folderFiles && folderFiles.length > 0) {
                folderFiles.forEach(f => console.log(`     → ${f.name}`));
              }
            }
          } else {
            console.log('❌ Aucun dossier correspondant trouvé');
          }
        }
      }
    }
    
    console.log('\n' + '='.repeat(70));
  }
}

checkPatgenImage().catch(console.error);
