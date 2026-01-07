const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function checkAllStorage() {
  console.log('🔍 Vérification COMPLÈTE du Storage\n');

  // 1. Liste de TOUS les buckets
  console.log('📦 Buckets disponibles:');
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets) {
    buckets.forEach(b => console.log(`   - ${b.name} (${b.public ? 'public' : 'private'})`));
  }

  // 2. Liste TOUT le contenu du bucket etablissements
  console.log('\n📂 Contenu du bucket "etablissements":');
  const { data: rootFiles } = await supabase.storage
    .from('etablissements')
    .list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });

  if (rootFiles && rootFiles.length > 0) {
    console.log(`   ${rootFiles.length} élément(s) à la racine:\n`);
    
    for (const item of rootFiles.slice(0, 20)) {
      if (item.id) {
        // C'est un dossier
        const { data: files } = await supabase.storage
          .from('etablissements')
          .list(item.name);
        
        if (files && files.length > 0) {
          console.log(`   📁 ${item.name}/ (${files.length} fichier(s))`);
          files.forEach(f => {
            const size = f.metadata?.size ? `${(f.metadata.size / 1024).toFixed(2)} KB` : 'unknown';
            const created = f.created_at ? new Date(f.created_at).toLocaleString('fr-FR') : 'unknown';
            console.log(`      → ${f.name} (${size}, créé: ${created})`);
          });
        } else {
          console.log(`   📁 ${item.name}/ (vide)`);
        }
      } else {
        // C'est un fichier à la racine
        const size = item.metadata?.size ? `${(item.metadata.size / 1024).toFixed(2)} KB` : 'unknown';
        console.log(`   📄 ${item.name} (${size})`);
      }
    }
    
    if (rootFiles.length > 20) {
      console.log(`   ... et ${rootFiles.length - 20} autre(s) élément(s)`);
    }
  } else {
    console.log('   ❌ Bucket vide');
  }

  // 3. Vérifier les dossiers temp récents
  const tempIds = [
    'fe92eace-c8dc-43bc-9631-cc444e28b566',
    '141f37d6-8534-4c39-8956-092fafdfb345'
  ];

  console.log('\n🔍 Vérification dossiers temp spécifiques:');
  for (const tempId of tempIds) {
    const { data: files } = await supabase.storage
      .from('etablissements')
      .list(tempId);
    
    if (files && files.length > 0) {
      console.log(`   ✅ ${tempId}: ${files.length} fichier(s)`);
      files.forEach(f => console.log(`      - ${f.name}`));
    } else {
      console.log(`   ❌ ${tempId}: vide`);
    }
  }

  console.log('\n' + '='.repeat(70));
}

checkAllStorage().catch(console.error);
