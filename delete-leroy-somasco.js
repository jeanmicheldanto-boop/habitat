/**
 * Script pour supprimer les établissements:
 * - Résidence Autonomie Leroy à Creil
 * - Résidence Autonomie Somasco à Creil
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function deleteEstablishments() {
  console.log('\n🗑️  SUPPRESSION RÉSIDENCES AUTONOMIE LEROY ET SOMASCO\n');

  try {
    // 1. Chercher les établissements à Creil
    const { data: etabs, error: fetchError } = await supabase
      .from('etablissements')
      .select('id, nom, commune, email')
      .eq('commune', 'Creil')
      .or('nom.ilike.%Leroy%,nom.ilike.%Somasco%');

    if (fetchError) throw fetchError;

    if (!etabs || etabs.length === 0) {
      console.log('❌ Aucun établissement trouvé correspondant aux critères');
      return;
    }

    // Filtrer pour ne garder que ceux qu'on cherche
    const toDelete = etabs.filter(e => 
      (e.nom.toLowerCase().includes('leroy') || e.nom.toLowerCase().includes('somasco')) &&
      e.commune === 'Creil'
    );

    if (toDelete.length === 0) {
      console.log('❌ Aucun établissement "Leroy" ou "Somasco" trouvé à Creil');
      console.log('\nÉtablissements trouvés à Creil:');
      etabs.forEach(e => console.log(`   - ${e.nom}`));
      return;
    }

    console.log('📋 Établissements à supprimer:');
    toDelete.forEach(etab => {
      console.log(`   - ${etab.nom}`);
      console.log(`     Commune: ${etab.commune}`);
      console.log(`     Email: ${etab.email}`);
      console.log(`     ID: ${etab.id}\n`);
    });

    // 2. Confirmation
    console.log('⚠️  Confirmation dans 5 secondes... (Ctrl+C pour annuler)\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('🗑️  Suppression en cours...\n');

    // 3. Supprimer chaque établissement
    for (const etab of toDelete) {
      const etabId = etab.id;
      console.log(`Suppression de ${etab.nom}...`);

      // Supprimer les liaisons sous-catégories
      const { error: scError } = await supabase
        .from('etablissement_sous_categorie')
        .delete()
        .eq('etablissement_id', etabId);
      if (scError) throw scError;
      console.log(`   ✅ Liaisons sous-catégories supprimées`);

      // Supprimer les liaisons services
      const { error: servError } = await supabase
        .from('etablissement_service')
        .delete()
        .eq('etablissement_id', etabId);
      if (servError) throw servError;
      console.log(`   ✅ Liaisons services supprimées`);

      // Supprimer les médias
      const { error: mediaError } = await supabase
        .from('medias')
        .delete()
        .eq('etablissement_id', etabId);
      if (mediaError) throw mediaError;
      console.log(`   ✅ Médias supprimés`);

      // Mettre à jour les propositions (set etab_id à null)
      const { error: propError } = await supabase
        .from('propositions')
        .update({ etablissement_id: null })
        .eq('etablissement_id', etabId);
      if (propError) throw propError;
      console.log(`   ✅ Propositions mises à jour`);

      // Supprimer l'établissement
      const { error: deleteError } = await supabase
        .from('etablissements')
        .delete()
        .eq('id', etabId);
      if (deleteError) throw deleteError;
      console.log(`   ✅ Établissement supprimé\n`);
    }

    console.log(`✅ Suppression de ${toDelete.length} établissement(s) terminée avec succès !`);

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

deleteEstablishments();
