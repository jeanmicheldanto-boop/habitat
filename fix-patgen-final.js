const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

const ETAB_ID = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';
const CORRECT_PATH = `etablissements/${ETAB_ID}/main.jpg`;

async function finalFix() {
  console.log('\n🔧 Correction finale de l\'image de Maison Patgen...\n');
  
  // 1. Récupérer les données actuelles
  const { data: etab } = await supabase
    .from('etablissements')
    .select('*')
    .eq('id', ETAB_ID)
    .single();
  
  console.log('📊 État actuel:');
  console.log(`   Nom: ${etab.nom}`);
  console.log(`   Gestionnaire (texte): "${etab.gestionnaire || 'VIDE'}"`);
  console.log(`   Adresse: ${etab.adresse_l1}`);
  console.log(`   Commune: ${etab.commune}`);
  console.log(`   Code postal: ${etab.code_postal}`);
  console.log(`   Géolocalisation: ${etab.geom ? 'OK' : 'NULL'}`);
  console.log(`   Habitat type: ${etab.habitat_type}`);
  console.log(`   Image path actuel: ${etab.image_path}`);
  
  // 2. Mise à jour avec TOUTES les données requises
  console.log('\n📝 Mise à jour...');
  
  const { error: updateError } = await supabase
    .from('etablissements')
    .update({
      image_path: CORRECT_PATH,
      gestionnaire: etab.gestionnaire || 'CCAS Ossun', // Ajouter un gestionnaire si manquant
      nom: etab.nom,
      adresse_l1: etab.adresse_l1,
      commune: etab.commune,
      code_postal: etab.code_postal,
      departement: etab.departement,
      habitat_type: etab.habitat_type
    })
    .eq('id', ETAB_ID);
  
  if (updateError) {
    console.error('❌ Erreur mise à jour:', updateError.message);
    
    // Si cela échoue toujours, on doit passer par l'admin
    console.log('\n⚠️ La mise à jour via API a échoué.');
    console.log('\n💡 Solution : Utiliser l\'interface admin pour modifier directement');
    console.log(`\n📋 URL admin: https://habitat-intermediaire.fr/admin/etablissements/${ETAB_ID}/edit`);
    console.log(`\n🔧 Actions à faire via l\'interface admin:`);
    console.log(`   1. Aller sur la page d'édition`);
    console.log(`   2. Uploader la nouvelle photo`);
    console.log(`   3. Le système utilisera automatiquement le bon chemin`);
    
    // Vérifier si le fichier est prêt
    const { data: files } = await supabase.storage
      .from('etablissements')
      .list(`etablissements/${ETAB_ID}`);
    
    if (files && files.length > 0) {
      console.log(`\n✅ Le fichier est prêt au bon emplacement:`);
      console.log(`   ${CORRECT_PATH}`);
      const { data: url } = supabase.storage.from('etablissements').getPublicUrl(CORRECT_PATH);
      console.log(`   URL: ${url.publicUrl}`);
    }
    
    return;
  }
  
  console.log('✅ Mise à jour réussie!');
  
  // 3. Vérification finale
  console.log('\n✅ Vérification finale...');
  const { data: result } = await supabase
    .from('v_liste_publication')
    .select('nom, image_path, gestionnaire')
    .eq('etab_id', ETAB_ID)
    .single();
  
  if (result) {
    console.log(`   Nom: ${result.nom}`);
    console.log(`   Gestionnaire: ${result.gestionnaire || 'N/A'}`);
    console.log(`   Image path: ${result.image_path}`);
    
    const { data: url } = supabase.storage.from('etablissements').getPublicUrl(result.image_path);
    console.log(`   URL: ${url.publicUrl}`);
    
    console.log('\n🎉 Correction terminée avec succès!');
    console.log('\n📍 L\'image devrait maintenant s\'afficher sur:');
    console.log('   ✓ La liste de la plateforme');
    console.log('   ✓ La carte interactive');
    console.log('   ✓ La fiche détaillée de l\'établissement');
  }
}

finalFix().catch(console.error);
