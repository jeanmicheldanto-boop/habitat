const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

const ETAB_ID = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';
const WRONG_PATH = 'f6211dcb-ba95-4219-aad4-246edee15346';

async function findPatgenImage() {
  console.log('\n🔍 Recherche de l\'image de Maison Patgen...\n');
  
  // 1. Lister tous les dossiers du bucket
  console.log('📂 Listing de TOUS les dossiers...');
  const { data: allFolders, error: foldersError } = await supabase.storage
    .from('etablissements')
    .list('', { limit: 1000 });
  
  if (foldersError) {
    console.error('❌ Erreur:', foldersError.message);
    return;
  }
  
  console.log(`📊 ${allFolders.length} dossier(s) trouvé(s)\n`);
  
  // 2. Chercher le dossier avec l'UUID incorrect
  const wrongFolder = allFolders.find(f => f.name === WRONG_PATH);
  if (wrongFolder) {
    console.log('✅ Dossier trouvé avec le mauvais UUID:', WRONG_PATH);
    const { data: files } = await supabase.storage
      .from('etablissements')
      .list(WRONG_PATH);
    
    if (files && files.length > 0) {
      console.log(`   ${files.length} fichier(s):`);
      files.forEach(f => {
        console.log(`   - ${f.name}`);
        const fullPath = `${WRONG_PATH}/${f.name}`;
        const { data } = supabase.storage.from('etablissements').getPublicUrl(fullPath);
        console.log(`     URL: ${data.publicUrl}`);
      });
    }
  }
  
  // 3. Chercher le dossier avec le bon UUID
  const correctFolder = allFolders.find(f => f.name === `etablissements/${ETAB_ID}`);
  if (correctFolder) {
    console.log('\n✅ Dossier trouvé avec le bon UUID:', `etablissements/${ETAB_ID}`);
    const { data: files } = await supabase.storage
      .from('etablissements')
      .list(`etablissements/${ETAB_ID}`);
    
    if (files && files.length > 0) {
      console.log(`   ${files.length} fichier(s):`);
      files.forEach(f => console.log(`   - ${f.name}`));
    }
  }
  
  // 4. Chercher tous les dossiers contenant "patgen" ou similaires
  console.log('\n🔍 Recherche de dossiers récents...');
  const recentFolders = allFolders
    .filter(f => f.name && !f.name.includes('.emptyFolderPlaceholder'))
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 20);
  
  console.log('\n📅 20 dossiers les plus récents:');
  for (const folder of recentFolders) {
    const { data: files } = await supabase.storage
      .from('etablissements')
      .list(folder.name);
    
    if (files && files.length > 0) {
      console.log(`\n   📁 ${folder.name}/`);
      console.log(`      Créé: ${folder.created_at}`);
      files.forEach(f => {
        console.log(`      → ${f.name} (${(f.metadata?.size / 1024).toFixed(2)} KB)`);
      });
    }
  }
  
  // 5. Vérifier les propositions liées à cet établissement
  console.log('\n\n📋 Recherche des propositions liées...');
  const { data: props, error: propsError } = await supabase
    .from('propositions')
    .select('id, created_at, payload, statut')
    .eq('etablissement_id', ETAB_ID)
    .order('created_at', { ascending: false });
  
  if (propsError) {
    console.error('❌ Erreur:', propsError.message);
  } else if (props && props.length > 0) {
    console.log(`✅ ${props.length} proposition(s) trouvée(s):`);
    props.forEach(p => {
      console.log(`\n   ID: ${p.id}`);
      console.log(`   Statut: ${p.statut}`);
      console.log(`   Créée: ${p.created_at}`);
      console.log(`   Payload image_path: ${p.payload?.image_path || 'NULL'}`);
      console.log(`   Payload temp_etablissement_id: ${p.payload?.temp_etablissement_id || 'NULL'}`);
    });
  } else {
    console.log('❌ Aucune proposition trouvée');
  }
}

findPatgenImage().catch(console.error);
