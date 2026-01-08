const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1];
const serviceRoleKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1];

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function deleteOssunEstablishments() {
  console.log('🔍 Recherche des établissements à Ossun...\n');

  // 1. Lister tous les établissements à Ossun
  const { data: etablissements, error } = await supabase
    .from('etablissements')
    .select('id, nom, commune, created_at')
    .eq('commune', 'Ossun')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  if (!etablissements || etablissements.length === 0) {
    console.log('✅ Aucun établissement trouvé à Ossun');
    return;
  }

  console.log(`📋 ${etablissements.length} établissement(s) trouvé(s) à Ossun:\n`);
  etablissements.forEach((e, idx) => {
    console.log(`${idx + 1}. ${e.nom} (ID: ${e.id})`);
    console.log(`   Créé le: ${new Date(e.created_at).toLocaleString('fr-FR')}\n`);
  });

  console.log('🗑️ Suppression en cours...\n');

  for (const etab of etablissements) {
    console.log(`\n🔧 Traitement: ${etab.nom}`);

    // Supprimer les liaisons sous-catégories
    const { error: scError } = await supabase
      .from('etablissement_sous_categorie')
      .delete()
      .eq('etablissement_id', etab.id);
    if (scError) console.log(`   ⚠️ Erreur liaisons sous-cat: ${scError.message}`);
    else console.log('   ✅ Liaisons sous-catégories supprimées');

    // Supprimer les liaisons services
    const { error: servError } = await supabase
      .from('etablissement_service')
      .delete()
      .eq('etablissement_id', etab.id);
    if (servError) console.log(`   ⚠️ Erreur liaisons services: ${servError.message}`);
    else console.log('   ✅ Liaisons services supprimées');

    // Supprimer les medias
    const { error: mediaError } = await supabase
      .from('medias')
      .delete()
      .eq('etablissement_id', etab.id);
    if (mediaError) console.log(`   ⚠️ Erreur medias: ${mediaError.message}`);
    else console.log('   ✅ Medias supprimés');

    // Mettre à jour les propositions liées (établissement_id = NULL)
    const { error: propError } = await supabase
      .from('propositions')
      .update({ etablissement_id: null })
      .eq('etablissement_id', etab.id);
    if (propError) console.log(`   ⚠️ Erreur propositions: ${propError.message}`);
    else console.log('   ✅ Propositions mises à jour');

    // Supprimer l'établissement
    const { error: etabError } = await supabase
      .from('etablissements')
      .delete()
      .eq('id', etab.id);
    if (etabError) console.log(`   ❌ Erreur suppression établissement: ${etabError.message}`);
    else console.log('   ✅ Établissement supprimé');

    // Supprimer les images du bucket (si image_path existe)
    if (etab.image_path) {
      const folder = etab.image_path.split('/')[0];
      const { error: storageError } = await supabase.storage
        .from('medias')
        .remove([`${folder}/main.jpg`]);
      if (storageError) console.log(`   ⚠️ Erreur suppression image: ${storageError.message}`);
      else console.log('   ✅ Image supprimée du bucket');
    }
  }

  console.log('\n\n✅ Suppression terminée!');
}

deleteOssunEstablishments().catch(console.error);
