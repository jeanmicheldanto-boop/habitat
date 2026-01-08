const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

const ETAB_ID = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';
const CORRECT_PATH = `etablissements/${ETAB_ID}/main.jpg`;

async function fixPatgenImage() {
  console.log('\n🔧 Correction de l\'image de Maison Patgen...\n');
  
  // 1. Trouver le bon dossier avec l'image
  console.log('📂 Recherche du fichier...');
  const possibleFolder = 'a1a02ce0-f95a-4dd1-a181-d0df29b5a94f';
  const sourcePath = `${possibleFolder}/main.jpg`;
  
  // Vérifier si le fichier source existe
  const { data: sourceFiles } = await supabase.storage
    .from('etablissements')
    .list(possibleFolder);
  
  if (!sourceFiles || sourceFiles.length === 0) {
    console.log('❌ Le fichier source n\'existe pas');
    return;
  }
  
  console.log(`✅ Fichier trouvé: ${sourcePath}`);
  
  // 2. Vérifier l'URL actuelle
  const wrongPath = 'f6211dcb-ba95-4219-aad4-246edee15346/main.jpg';
  console.log('\n🔗 URL actuelle (incorrecte):');
  const { data: wrongUrl } = supabase.storage.from('etablissements').getPublicUrl(wrongPath);
  console.log(`   ${wrongUrl.publicUrl}`);
  
  console.log('\n🔗 URL qui devrait être utilisée:');
  const { data: sourceUrl } = supabase.storage.from('etablissements').getPublicUrl(sourcePath);
  console.log(`   ${sourceUrl.publicUrl}`);
  
  // 3. Copier le fichier vers le bon emplacement
  console.log('\n📤 Copie du fichier vers le bon emplacement...');
  
  // D'abord, télécharger le fichier
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('etablissements')
    .download(sourcePath);
  
  if (downloadError) {
    console.error('❌ Erreur téléchargement:', downloadError.message);
    return;
  }
  
  console.log('✅ Fichier téléchargé');
  
  // Uploader vers le bon emplacement
  const { error: uploadError } = await supabase.storage
    .from('etablissements')
    .upload(CORRECT_PATH, fileData, {
      contentType: 'image/jpeg',
      upsert: true
    });
  
  if (uploadError) {
    console.error('❌ Erreur upload:', uploadError.message);
    return;
  }
  
  console.log('✅ Fichier copié vers:', CORRECT_PATH);
  
  // 4. Mettre à jour le champ image_path dans la table etablissements
  console.log('\n📝 Mise à jour de la base de données...');
  const { error: updateError } = await supabase
    .from('etablissements')
    .update({ image_path: CORRECT_PATH })
    .eq('id', ETAB_ID);
  
  if (updateError) {
    console.error('❌ Erreur mise à jour:', updateError.message);
    return;
  }
  
  console.log('✅ Base de données mise à jour');
  
  // 5. Vérifier le résultat
  console.log('\n✅ Vérification finale...');
  const { data: etab } = await supabase
    .from('etablissements')
    .select('nom, image_path')
    .eq('id', ETAB_ID)
    .single();
  
  console.log(`   Établissement: ${etab.nom}`);
  console.log(`   Nouveau image_path: ${etab.image_path}`);
  
  const { data: finalUrl } = supabase.storage.from('etablissements').getPublicUrl(etab.image_path);
  console.log(`   URL publique: ${finalUrl.publicUrl}`);
  
  console.log('\n✅ Correction terminée!');
}

fixPatgenImage().catch(console.error);
