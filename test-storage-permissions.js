const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function testStoragePermissions() {
  console.log('🔍 Test des permissions Storage\n');

  // Test 1: Créer un fichier texte simple
  const testId = '141f37d6-8534-4c39-8956-092fafdfb345';
  const testContent = 'Test file content';
  const testPath = `${testId}/test.txt`;

  console.log('📝 Test 1: Upload fichier texte...');
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('etablissements')
    .upload(testPath, testContent, {
      contentType: 'text/plain',
      upsert: true
    });

  if (uploadError) {
    console.error('❌ Erreur upload:', uploadError.message);
    console.error('   Code:', uploadError.statusCode);
    console.error('   Details:', JSON.stringify(uploadError, null, 2));
  } else {
    console.log('✅ Upload réussi!');
    console.log('   Path:', uploadData.path);
  }

  // Test 2: Lister les fichiers
  console.log('\n📂 Test 2: Lister les fichiers...');
  const { data: listData, error: listError } = await supabase.storage
    .from('etablissements')
    .list(testId);

  if (listError) {
    console.error('❌ Erreur listing:', listError.message);
  } else if (listData && listData.length > 0) {
    console.log(`✅ ${listData.length} fichier(s) trouvé(s):`);
    listData.forEach(file => {
      console.log(`   - ${file.name} (${file.metadata?.size} bytes)`);
    });
  } else {
    console.log('❌ Aucun fichier trouvé');
  }

  // Test 3: Vérifier les buckets disponibles
  console.log('\n🗂️ Test 3: Liste des buckets...');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.error('❌ Erreur:', bucketsError.message);
  } else if (buckets) {
    console.log(`✅ ${buckets.length} bucket(s):`);
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
  }

  // Test 4: Vérifier les policies du bucket etablissements
  console.log('\n🔐 Test 4: Vérification bucket "etablissements"...');
  const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('etablissements');

  if (bucketError) {
    console.error('❌ Erreur:', bucketError.message);
  } else if (bucketData) {
    console.log('✅ Bucket trouvé:');
    console.log(`   ID: ${bucketData.id}`);
    console.log(`   Name: ${bucketData.name}`);
    console.log(`   Public: ${bucketData.public}`);
    console.log(`   File size limit: ${bucketData.file_size_limit ? bucketData.file_size_limit + ' bytes' : 'Aucune limite'}`);
    console.log(`   Allowed mime types: ${bucketData.allowed_mime_types ? bucketData.allowed_mime_types.join(', ') : 'Tous'}`);
  }

  // Nettoyer le fichier test
  console.log('\n🧹 Nettoyage...');
  const { error: deleteError } = await supabase.storage
    .from('etablissements')
    .remove([testPath]);

  if (deleteError) {
    console.error('❌ Erreur suppression:', deleteError.message);
  } else {
    console.log('✅ Fichier test supprimé');
  }

  console.log('\n' + '='.repeat(70));
}

testStoragePermissions().catch(console.error);
