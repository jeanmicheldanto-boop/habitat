const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

const ETAB_ID = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';
const CORRECT_PATH = `etablissements/${ETAB_ID}/main.jpg`;

async function fixWithGestionnaire() {
  console.log('\n🔧 Correction avec gestionnaire...\n');
  
  // 1. Récupérer les données actuelles
  const { data: etab } = await supabase
    .from('etablissements')
    .select('*')
    .eq('id', ETAB_ID)
    .single();
  
  console.log('📊 Données actuelles:');
  console.log('   Nom:', etab.nom);
  console.log('   Gestionnaire ID:', etab.gestionnaire_id || 'NULL');
  console.log('   Statut:', etab.statut_editorial);
  
  // 2. Si pas de gestionnaire, en trouver un ou en créer un
  if (!etab.gestionnaire_id) {
    console.log('\n📝 Recherche d\'un gestionnaire...');
    
    // Chercher un gestionnaire existant
    const { data: gestionnaires } = await supabase
      .from('gestionnaires')
      .select('id, nom')
      .limit(5);
    
    if (gestionnaires && gestionnaires.length > 0) {
      console.log('✅ Gestionnaires disponibles:');
      gestionnaires.forEach(g => console.log(`   - ${g.nom} (${g.id})`));
      
      // Utiliser le premier gestionnaire disponible
      const gestionnaireId = gestionnaires[0].id;
      console.log(`\n   Utilisation de: ${gestionnaires[0].nom}`);
      
      // Mise à jour avec gestionnaire + image_path
      const { error: updateError } = await supabase
        .from('etablissements')
        .update({ 
          image_path: CORRECT_PATH,
          gestionnaire_id: gestionnaireId
        })
        .eq('id', ETAB_ID);
      
      if (updateError) {
        console.error('❌ Erreur:', updateError.message);
        return;
      }
      
      console.log('✅ Établissement mis à jour');
    } else {
      console.log('❌ Aucun gestionnaire trouvé');
    }
  } else {
    // Gestionnaire existe, simple update de l'image
    const { error: updateError } = await supabase
      .from('etablissements')
      .update({ image_path: CORRECT_PATH })
      .eq('id', ETAB_ID);
    
    if (updateError) {
      console.error('❌ Erreur:', updateError.message);
      return;
    }
    
    console.log('✅ Établissement mis à jour');
  }
  
  // 3. Vérification
  console.log('\n✅ Vérification finale...');
  const { data: result } = await supabase
    .from('v_liste_publication')
    .select('nom, image_path')
    .eq('etab_id', ETAB_ID)
    .single();
  
  console.log(`   Établissement: ${result.nom}`);
  console.log(`   Image path: ${result.image_path}`);
  
  const { data: url } = supabase.storage.from('etablissements').getPublicUrl(result.image_path);
  console.log(`   URL: ${url.publicUrl}`);
  
  console.log('\n✅ Correction terminée!');
}

fixWithGestionnaire().catch(console.error);
