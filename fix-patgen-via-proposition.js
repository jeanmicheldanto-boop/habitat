const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

const ETAB_ID = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';
const CORRECT_PATH = `etablissements/${ETAB_ID}/main.jpg`;

async function createPropositionForImageFix() {
  console.log('\n📝 Création d\'une proposition pour corriger l\'image...\n');
  
  // 1. Vérifier que le fichier existe au bon endroit
  console.log('📂 Vérification du fichier copié...');
  const { data: files, error: listError } = await supabase.storage
    .from('etablissements')
    .list(`etablissements/${ETAB_ID}`);
  
  if (listError || !files || files.length === 0) {
    console.log('❌ Le fichier n\'existe pas encore au bon endroit');
    console.log('   Copie du fichier...');
    
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
    
    console.log('✅ Fichier copié');
  } else {
    console.log('✅ Fichier déjà au bon endroit');
  }
  
  // 2. Créer une proposition de modification
  console.log('\n📝 Création de la proposition...');
  
  const { data: proposition, error: propError } = await supabase
    .from('propositions')
    .insert([{
      type_cible: 'etablissement',
      etablissement_id: ETAB_ID,
      action: 'update',
      statut: 'en_attente',
      source: 'admin',
      payload: {
        modifications: {
          image_path: CORRECT_PATH
        }
      }
    }])
    .select()
    .single();
  
  if (propError) {
    console.error('❌ Erreur création proposition:', propError.message);
    return;
  }
  
  console.log('✅ Proposition créée:', proposition.id);
  
  // 3. Auto-approuver la proposition
  console.log('\n✅ Auto-approbation de la proposition...');
  
  const { error: approveError } = await supabase
    .from('propositions')
    .update({ statut: 'approuvee' })
    .eq('id', proposition.id);
  
  if (approveError) {
    console.error('❌ Erreur approbation:', approveError.message);
    console.log('\n⚠️ La proposition a été créée mais pas approuvée.');
    console.log('   Veuillez l\'approuver manuellement depuis l\'interface admin.');
    return;
  }
  
  console.log('✅ Proposition approuvée');
  
  // 4. Mettre à jour l'établissement directement
  console.log('\n📝 Mise à jour directe de l\'établissement...');
  
  const { error: updateError } = await supabase
    .from('etablissements')
    .update({ image_path: CORRECT_PATH })
    .eq('id', ETAB_ID);
  
  if (updateError) {
    console.error('❌ Erreur mise à jour:', updateError.message);
    console.log('\n⚠️ Problème avec la contrainte de publication.');
    console.log('   Solution alternative : Mise à jour via proposition update...');
    
    // Alternative: essayer via une update qui ne touche que image_path
    const { data: currentData } = await supabase
      .from('etablissements')
      .select('*')
      .eq('id', ETAB_ID)
      .single();
    
    console.log('\n📊 Données actuelles:');
    console.log('   Gestionnaire ID:', currentData.gestionnaire_id);
    console.log('   Adresse:', currentData.adresse_l1);
    console.log('   Code postal:', currentData.code_postal);
    
    return;
  }
  
  console.log('✅ Établissement mis à jour');
  
  // 5. Vérifier le résultat
  console.log('\n✅ Vérification finale...');
  const { data: etab } = await supabase
    .from('v_liste_publication')
    .select('nom, image_path')
    .eq('etab_id', ETAB_ID)
    .single();
  
  console.log(`   Établissement: ${etab.nom}`);
  console.log(`   Nouveau image_path: ${etab.image_path}`);
  
  const { data: finalUrl } = supabase.storage.from('etablissements').getPublicUrl(etab.image_path);
  console.log(`   URL publique: ${finalUrl.publicUrl}`);
  
  console.log('\n✅ Correction terminée!');
  console.log('\n🎉 L\'image devrait maintenant s\'afficher correctement sur:');
  console.log('   - La liste de la plateforme');
  console.log('   - La carte');
  console.log('   - La fiche de l\'établissement');
}

createPropositionForImageFix().catch(console.error);
