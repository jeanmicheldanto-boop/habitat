const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

const ETAB_ID = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';
const CORRECT_PATH = 'a1a02ce0-f95a-4dd1-a181-d0df29b5a94f/main.jpg';

async function finalSolution() {
  console.log('\n📋 RÉSUMÉ DU PROBLÈME ET SOLUTION\n');
  console.log('='.repeat(70));
  
  console.log('\n🔍 Diagnostic:');
  console.log('   - L\'image uploadée est dans: a1a02ce0-f95a-4dd1-a181-d0df29b5a94f/main.jpg');
  console.log('   - Le champ etablissements.image_path contient: f6211dcb-ba95-4219-aad4-246edee15346/main.jpg');
  console.log('   - Ce chemin est incorrect et l\'image n\'existe pas');
  console.log('   - La vue v_liste_publication priorise etablissements.image_path sur medias');
  
  console.log('\n❌ Problème:');
  console.log('   - La contrainte etablissements_publish_check empêche la modification');
  console.log('   - Cette contrainte vérifie que le gestionnaire est rempli');
  console.log('   - L\'établissement n\'a pas de gestionnaire défini');
  
  console.log('\n💡 Solutions possibles:');
  console.log('');
  console.log('   OPTION 1 - Via SQL (RECOMMANDÉ)');
  console.log('   --------------------------------');
  console.log('   1. Ouvrir l\'interface Supabase SQL Editor');
  console.log('   2. Exécuter le script: supabase/fix-maison-patgen-image.sql');
  console.log('   3. Ce script désactive temporairement la contrainte');
  console.log('   4. Ajoute le gestionnaire manquant');
  console.log('   5. Met à NULL etablissements.image_path');
  console.log('   6. Crée l\'entrée correcte dans la table medias');
  console.log('   7. Réactive la contrainte');
  
  console.log('\n   OPTION 2 - Via l\'interface admin');
  console.log('   ----------------------------------');
  console.log('   1. Aller sur: https://habitat-intermediaire.fr/admin/etablissements/' + ETAB_ID + '/edit');
  console.log('   2. Uploader à nouveau la photo depuis l\'interface');
  console.log('   3. L\'UploadPhotoEtablissement créera automatiquement le bon chemin');
  
  console.log('\n   OPTION 3 - Mise à jour manuelle du gestionnaire puis de l\'image');
  console.log('   -----------------------------------------------------------------');
  console.log('   Exécuter ces commandes SQL dans l\'ordre:');
  console.log('');
  console.log('   -- 1. Ajouter le gestionnaire');
  console.log(`   UPDATE etablissements`);
  console.log(`   SET gestionnaire = 'CCAS Ossun'`);
  console.log(`   WHERE id = '${ETAB_ID}'`);
  console.log(`     AND (gestionnaire IS NULL OR TRIM(gestionnaire) = '');`);
  console.log('');
  console.log('   -- 2. Mettre image_path à NULL');
  console.log(`   UPDATE etablissements`);
  console.log(`   SET image_path = NULL`);
  console.log(`   WHERE id = '${ETAB_ID}';`);
  console.log('');
  console.log('   -- 3. Créer l\'entrée dans medias');
  console.log(`   DELETE FROM medias WHERE etablissement_id = '${ETAB_ID}';`);
  console.log(`   INSERT INTO medias (etablissement_id, storage_path, alt_text, priority)`);
  console.log(`   VALUES ('${ETAB_ID}', '${CORRECT_PATH}', 'Maison Patgen', 1000);`);
  
  console.log('\n');
  console.log('='.repeat(70));
  
  // Vérifier l\'état actuel
  console.log('\n📊 État actuel des données:');
  
  const { data: etab } = await supabase
    .from('etablissements')
    .select('nom, gestionnaire, image_path')
    .eq('id', ETAB_ID)
    .single();
  
  console.log(`   Nom: ${etab.nom}`);
  console.log(`   Gestionnaire: "${etab.gestionnaire || 'VIDE'}"`);
  console.log(`   Image path (etablissements): ${etab.image_path || 'NULL'}`);
  
  const { data: medias } = await supabase
    .from('medias')
    .select('storage_path, priority')
    .eq('etablissement_id', ETAB_ID)
    .order('priority', { ascending: false })
    .limit(1);
  
  if (medias && medias.length > 0) {
    console.log(`   Image path (medias): ${medias[0].storage_path} (priority: ${medias[0].priority})`);
  } else {
    console.log(`   Image path (medias): AUCUNE`);
  }
  
  const { data: vue } = await supabase
    .from('v_liste_publication')
    .select('image_path')
    .eq('etab_id', ETAB_ID)
    .single();
  
  console.log(`   Image path (vue): ${vue.image_path || 'NULL'}`);
  
  console.log('\n💾 Le fichier fix-maison-patgen-image.sql a été créé dans supabase/');
  console.log('   Exécutez-le dans l\'éditeur SQL de Supabase pour corriger le problème.');
}

finalSolution().catch(console.error);
