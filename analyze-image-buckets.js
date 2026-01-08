const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function analyzeImageBuckets() {
  console.log('\n🔍 ANALYSE DES BUCKETS ET CHEMINS D\'IMAGES\n');
  console.log('='.repeat(80));
  
  // 1. Lister les buckets
  console.log('\n📦 Buckets disponibles:');
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets) {
    buckets.forEach(b => console.log(`   - ${b.name} (${b.public ? 'public' : 'privé'})`));
  }
  
  // 2. Vérifier le bucket "etablissements"
  console.log('\n\n📂 Bucket "etablissements":');
  const { data: etabFiles } = await supabase.storage
    .from('etablissements')
    .list('', { limit: 20 });
  
  if (etabFiles && etabFiles.length > 0) {
    console.log(`   ${etabFiles.length} dossier(s)/fichier(s) à la racine:`);
    etabFiles.forEach(f => {
      if (f.name && !f.name.includes('.emptyFolderPlaceholder')) {
        console.log(`      - ${f.name}/`);
      }
    });
  } else {
    console.log('   ❌ Vide ou erreur');
  }
  
  // 3. Vérifier le bucket "medias"
  console.log('\n\n📂 Bucket "medias":');
  const { data: mediaFiles } = await supabase.storage
    .from('medias')
    .list('', { limit: 20 });
  
  if (mediaFiles && mediaFiles.length > 0) {
    console.log(`   ${mediaFiles.length} dossier(s)/fichier(s) à la racine:`);
    mediaFiles.forEach(f => {
      if (f.name && !f.name.includes('.emptyFolderPlaceholder')) {
        console.log(`      - ${f.name}/`);
      }
    });
    
    // Lister le contenu de quelques dossiers
    console.log('\n   📁 Contenu de quelques dossiers:');
    for (const folder of mediaFiles.slice(0, 5)) {
      if (folder.name && !folder.name.includes('.emptyFolderPlaceholder')) {
        const { data: folderFiles } = await supabase.storage
          .from('medias')
          .list(folder.name);
        if (folderFiles && folderFiles.length > 0) {
          console.log(`      ${folder.name}/ (${folderFiles.length} fichier(s))`);
          folderFiles.forEach(f => console.log(`         → ${f.name}`));
        }
      }
    }
  } else {
    console.log('   ❌ Vide ou erreur');
  }
  
  // 4. Vérifier l'établissement Patgen
  console.log('\n\n🏠 Analyse Maison Patgen:');
  const ETAB_ID = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';
  
  const { data: etab } = await supabase
    .from('etablissements')
    .select('nom, image_path')
    .eq('id', ETAB_ID)
    .single();
  
  console.log(`   Nom: ${etab.nom}`);
  console.log(`   image_path: ${etab.image_path}`);
  
  if (etab.image_path) {
    // Tester les différentes URL possibles
    console.log('\n   🔗 Tests d\'URLs:');
    
    const tests = [
      {
        desc: 'URL directe (tel quel)',
        url: `https://minwoumfgutampcgrcbr.supabase.co/storage/v1/object/public/${etab.image_path}`
      },
      {
        desc: 'URL avec bucket etablissements',
        url: `https://minwoumfgutampcgrcbr.supabase.co/storage/v1/object/public/etablissements/${etab.image_path}`
      },
      {
        desc: 'URL avec bucket medias',
        url: `https://minwoumfgutampcgrcbr.supabase.co/storage/v1/object/public/medias/${etab.image_path}`
      }
    ];
    
    console.log('');
    tests.forEach((test, i) => {
      console.log(`   ${i + 1}. ${test.desc}:`);
      console.log(`      ${test.url}`);
    });
  }
  
  // 5. Vérifier où l'image existe réellement
  console.log('\n\n🔎 Recherche de l\'image réelle:');
  const wrongPath = 'f6211dcb-ba95-4219-aad4-246edee15346';
  const realPath = 'a1a02ce0-f95a-4dd1-a181-d0df29b5a94f';
  
  // Dans etablissements
  const { data: inEtab } = await supabase.storage
    .from('etablissements')
    .list(wrongPath);
  console.log(`   Dans etablissements/${wrongPath}: ${inEtab && inEtab.length > 0 ? '✅ Trouvé' : '❌ Absent'}`);
  
  const { data: inEtab2 } = await supabase.storage
    .from('etablissements')
    .list(realPath);
  console.log(`   Dans etablissements/${realPath}: ${inEtab2 && inEtab2.length > 0 ? '✅ Trouvé' : '❌ Absent'}`);
  
  // Dans medias
  const { data: inMedia } = await supabase.storage
    .from('medias')
    .list(wrongPath);
  console.log(`   Dans medias/${wrongPath}: ${inMedia && inMedia.length > 0 ? '✅ Trouvé' : '❌ Absent'}`);
  
  const { data: inMedia2 } = await supabase.storage
    .from('medias')
    .list(realPath);
  console.log(`   Dans medias/${realPath}: ${inMedia2 && inMedia2.length > 0 ? '✅ Trouvé' : '❌ Absent'}`);
  
  console.log('\n' + '='.repeat(80));
  console.log('\n💡 CONCLUSION:');
  console.log('   Le problème vient de l\'API upload-image qui uploade dans le bucket "medias"');
  console.log('   alors que les vues et le code frontend s\'attendent à ce que l\'image soit dans');
  console.log('   le bucket "etablissements" OU que le chemin soit préfixé correctement.');
  console.log('\n   Il faut corriger l\'API pour uploader dans le bon bucket.');
}

analyzeImageBuckets().catch(console.error);
