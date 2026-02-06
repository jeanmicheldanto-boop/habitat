/**
 * Script pour supprimer l'établissement:
 * - Résidence Autonomie Faccenda à Creil
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function deleteFaccenda() {
  console.log('\n🗑️  SUPPRESSION RÉSIDENCE AUTONOMIE FACCENDA\n');

  try {
    // 1. Chercher l'établissement à Creil
    const { data: etabs, error: fetchError } = await supabase
      .from('etablissements')
      .select('id, nom, commune, email')
      .eq('commune', 'Creil')
      .ilike('nom', '%Faccenda%');

    if (fetchError) throw fetchError;

    if (!etabs || etabs.length === 0) {
      console.log('❌ Établissement "Faccenda" non trouvé à Creil');
      return;
    }

    const etab = etabs[0];
    console.log('📋 Établissement à supprimer:');
    console.log(`   Nom: ${etab.nom}`);
    console.log(`   Commune: ${etab.commune}`);
    console.log(`   Email: ${etab.email}`);
    console.log(`   ID: ${etab.id}\n`);

    // 2. Confirmation
    console.log('⚠️  Confirmation dans 5 secondes... (Ctrl+C pour annuler)\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('🗑️  Suppression en cours...\n');

    const etabId = etab.id;

    // 3. Supprimer les liaisons sous-catégories
    const { error: scError } = await supabase
      .from('etablissement_sous_categorie')
      .delete()
      .eq('etablissement_id', etabId);
    if (scError) throw scError;
    console.log('   ✅ Liaisons sous-catégories supprimées');

    // 4. Supprimer les liaisons services
    const { error: servError } = await supabase
      .from('etablissement_service')
      .delete()
      .eq('etablissement_id', etabId);
    if (servError) throw servError;
    console.log('   ✅ Liaisons services supprimées');

    // 5. Supprimer les médias
    const { error: mediaError } = await supabase
      .from('medias')
      .delete()
      .eq('etablissement_id', etabId);
    if (mediaError) throw mediaError;
    console.log('   ✅ Médias supprimés');

    // 6. Mettre à jour les propositions (set etab_id à null)
    const { error: propError } = await supabase
      .from('propositions')
      .update({ etablissement_id: null })
      .eq('etablissement_id', etabId);
    if (propError) throw propError;
    console.log('   ✅ Propositions mises à jour');

    // 7. Supprimer l'établissement
    const { error: deleteError } = await supabase
      .from('etablissements')
      .delete()
      .eq('id', etabId);
    if (deleteError) throw deleteError;
    console.log('   ✅ Établissement supprimé');

    console.log('\n✅ Suppression terminée avec succès !');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

deleteFaccenda();
