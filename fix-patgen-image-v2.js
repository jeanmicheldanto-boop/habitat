const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

const ETAB_ID = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';
const CORRECT_PATH = `etablissements/${ETAB_ID}/main.jpg`;

async function fixPatgenImageWithConstraint() {
  console.log('\n🔧 Correction de l\'image de Maison Patgen (avec gestion contrainte)...\n');
  
  // 1. Récupérer les données actuelles de l'établissement
  console.log('📊 Récupération des données actuelles...');
  const { data: currentEtab, error: fetchError } = await supabase
    .from('etablissements')
    .select('*')
    .eq('id', ETAB_ID)
    .single();
  
  if (fetchError) {
    console.error('❌ Erreur:', fetchError.message);
    return;
  }
  
  console.log('✅ Données récupérées:');
  console.log(`   Nom: ${currentEtab.nom}`);
  console.log(`   Statut: ${currentEtab.statut_editorial}`);
  console.log(`   Image path actuel: ${currentEtab.image_path}`);
  console.log(`   Adresse: ${currentEtab.adresse_l1}`);
  console.log(`   Gestionnaire ID: ${currentEtab.gestionnaire_id}`);
  
  // 2. Copier le fichier
  console.log('\n📤 Copie du fichier...');
  const sourcePath = 'a1a02ce0-f95a-4dd1-a181-d0df29b5a94f/main.jpg';
  
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('etablissements')
    .download(sourcePath);
  
  if (downloadError) {
    console.error('❌ Erreur téléchargement:', downloadError.message);
    return;
  }
  
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
  
  // 3. Mettre à jour avec toutes les données nécessaires pour la contrainte
  console.log('\n📝 Mise à jour de la base de données...');
  
  const updateData = {
    image_path: CORRECT_PATH,
    // Assurer que les champs obligatoires sont présents
    nom: currentEtab.nom,
    adresse_l1: currentEtab.adresse_l1,
    code_postal: currentEtab.code_postal,
    commune: currentEtab.commune,
    departement: currentEtab.departement,
    habitat_type: currentEtab.habitat_type,
    statut_editorial: currentEtab.statut_editorial,
    gestionnaire_id: currentEtab.gestionnaire_id,
  };
  
  const { error: updateError } = await supabase
    .from('etablissements')
    .update(updateData)
    .eq('id', ETAB_ID);
  
  if (updateError) {
    console.error('❌ Erreur mise à jour:', updateError.message);
    console.log('\n🔍 Tentative avec SQL direct...');
    
    // Utiliser une requête SQL directe via RPC si disponible
    const { error: sqlError } = await supabase.rpc('exec_sql', {
      query: `UPDATE etablissements SET image_path = '${CORRECT_PATH}' WHERE id = '${ETAB_ID}'`
    });
    
    if (sqlError) {
      console.error('❌ Erreur SQL:', sqlError.message);
      console.log('\n⚠️ Il faudra mettre à jour manuellement via l\'interface admin ou SQL');
      console.log(`\nRequête SQL à exécuter:`);
      console.log(`UPDATE etablissements SET image_path = '${CORRECT_PATH}' WHERE id = '${ETAB_ID}';`);
    }
    return;
  }
  
  console.log('✅ Base de données mise à jour');
  
  // 4. Vérifier le résultat
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

fixPatgenImageWithConstraint().catch(console.error);
