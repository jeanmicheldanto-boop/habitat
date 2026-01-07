const { createClient } = require('@supabase/supabase-js');

// Service role (devrait fonctionner)
const supabaseAdmin = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

// Anon key (ce qu'utilise le client)
const supabaseAnon = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxNDg3NDcsImV4cCI6MjA1MjcyNDc0N30.8HLTM6x2bVqVvDCWwUfvIADOaOqPG_l8QLUH2kYWQKg'
);

async function testUploadPermissions() {
  console.log('🧪 Test des permissions d\'upload\n');

  // Créer un fichier image factice (PNG 1x1)
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

  const testId = crypto.randomUUID();
  const testPath = `${testId}/test.png`;

  // Test 1: Upload avec service role
  console.log('1️⃣ Test upload avec SERVICE ROLE KEY:');
  console.log(`   Path: ${testPath}`);
  const { error: adminError } = await supabaseAdmin.storage
    .from('etablissements')
    .upload(testPath, pngBuffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (adminError) {
    console.log('   ❌ ÉCHEC:', adminError.message);
  } else {
    console.log('   ✅ SUCCÈS');
  }

  // Test 2: Upload avec anon key (sans auth)
  console.log('\n2️⃣ Test upload avec ANON KEY (comme le client):');
  console.log(`   Path: ${testPath}`);
  const { error: anonError } = await supabaseAnon.storage
    .from('etablissements')
    .upload(testPath + '_anon', pngBuffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (anonError) {
    console.log('   ❌ ÉCHEC:', anonError.message);
    console.log('   Code:', anonError.statusCode || 'N/A');
  } else {
    console.log('   ✅ SUCCÈS');
  }

  // Test 3: Upload avec anon key + auth simulée
  console.log('\n3️⃣ Vérification policies du bucket:');
  const { data: policies } = await supabaseAdmin
    .rpc('get_storage_policies', { bucket_name: 'etablissements' })
    .then(() => ({ data: null }))
    .catch(() => ({ data: null }));

  console.log('   (Les policies RLS ne sont pas facilement queryables)');

  // Nettoyage
  console.log('\n🧹 Nettoyage...');
  await supabaseAdmin.storage.from('etablissements').remove([testPath, testPath + '_anon']);
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📋 DIAGNOSTIC:');
  if (!adminError && anonError) {
    console.log('❌ Le bucket accepte les uploads avec service_role mais PAS avec anon');
    console.log('   → Le client web ne peut pas uploader directement');
    console.log('   → Solution: Créer une route API serveur pour l\'upload');
  } else if (!adminError && !anonError) {
    console.log('✅ Le bucket accepte les uploads anon');
    console.log('   → Le problème est ailleurs');
  } else {
    console.log('❌ Problème de configuration du bucket');
  }
}

testUploadPermissions().catch(console.error);
