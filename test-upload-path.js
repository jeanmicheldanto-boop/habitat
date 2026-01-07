const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function testImageUpload() {
  console.log('🧪 Test upload image\n');

  // Créer un buffer d'image factice (1x1 pixel PNG transparent)
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82
  ]);

  const testId = '141f37d6-8534-4c39-8956-092fafdfb345';

  // Test avec le chemin INCORRECT (comme dans le code actuel)
  console.log('❌ Test 1: Path INCORRECT "etablissements/xxx/main.png"');
  const wrongPath = `etablissements/${testId}/main.png`;
  console.log('   Path:', wrongPath);
  
  const { error: error1 } = await supabase.storage
    .from('etablissements')
    .upload(wrongPath, pngBuffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (error1) {
    console.log('   ❌ Erreur:', error1.message);
  } else {
    console.log('   ✅ Upload réussi (inattendu!)');
  }

  // Test avec le chemin CORRECT
  console.log('\n✅ Test 2: Path CORRECT "xxx/main.png"');
  const correctPath = `${testId}/main.png`;
  console.log('   Path:', correctPath);
  
  const { error: error2 } = await supabase.storage
    .from('etablissements')
    .upload(correctPath, pngBuffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (error2) {
    console.log('   ❌ Erreur:', error2.message);
  } else {
    console.log('   ✅ Upload réussi!');
  }

  // Vérifier le listing
  console.log('\n📂 Listing du dossier...');
  const { data: files, error: listError } = await supabase.storage
    .from('etablissements')
    .list(testId);

  if (listError) {
    console.log('   ❌ Erreur:', listError.message);
  } else if (files && files.length > 0) {
    console.log(`   ✅ ${files.length} fichier(s):`);
    files.forEach(f => console.log(`      - ${f.name}`));
  } else {
    console.log('   ❌ Aucun fichier');
  }

  // Nettoyer
  console.log('\n🧹 Nettoyage...');
  await supabase.storage.from('etablissements').remove([correctPath]);
  await supabase.storage.from('etablissements').remove([wrongPath]);
  console.log('   ✅ Fichiers supprimés');

  console.log('\n' + '='.repeat(70));
}

testImageUpload().catch(console.error);
