// Appliquer les logements_types et tarifications d'une proposition
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyLogementsAndTarifs(propositionId) {
  console.log(`🏠 Application des logements et tarifications\n`);

  // Récupérer la proposition
  const { data: proposition, error: propError } = await supabase
    .from('propositions')
    .select('*')
    .eq('id', propositionId)
    .single();

  if (propError || !proposition) {
    console.error('❌ Proposition non trouvée:', propError);
    return false;
  }

  const modifications = proposition.payload?.modifications || {};
  const etablissementId = proposition.etablissement_id;

  if (!etablissementId) {
    console.error('❌ Pas d\'établissement lié');
    return false;
  }

  console.log(`Établissement: ${etablissementId}\n`);

  // 1. Gérer les logements_types
  if (Array.isArray(modifications.logements_types)) {
    console.log(`🏠 Traitement des logements (${modifications.logements_types.length})...`);
    
    try {
      // Supprimer les anciens logements
      const { error: deleteError } = await supabase
        .from('logements_types')
        .delete()
        .eq('etablissement_id', etablissementId);

      if (deleteError) {
        console.error('   ❌ Erreur suppression:', deleteError);
      } else {
        console.log('   ✅ Anciens logements supprimés');

        // Insérer les nouveaux
        if (modifications.logements_types.length > 0) {
          const inserts = modifications.logements_types.map(logement => ({
            etablissement_id: etablissementId,
            libelle: logement.libelle || null,
            surface_min: logement.surface_min || null,
            surface_max: logement.surface_max || null,
            meuble: logement.meuble || false,
            pmr: logement.pmr || false,
            domotique: logement.domotique || false,
            nb_unites: logement.nb_unites || null,
            plain_pied: logement.plain_pied || false
          }));

          console.log(`   📤 Insertion de ${inserts.length} logement(s)...`);
          console.log('   Données:', JSON.stringify(inserts, null, 2));

          const { error: insertError } = await supabase
            .from('logements_types')
            .insert(inserts);

          if (insertError) {
            console.error('   ❌ Erreur insertion:', insertError);
          } else {
            console.log(`   ✅ ${inserts.length} logement(s) inséré(s) avec succès`);
          }
        }
      }
    } catch (error) {
      console.error('   ❌ Erreur logements:', error);
    }
  } else {
    console.log('ℹ️  Pas de logements_types à traiter');
  }

  // 2. Gérer les tarifications
  if (Array.isArray(modifications.tarifications)) {
    console.log(`\n💰 Traitement des tarifications (${modifications.tarifications.length})...`);
    
    try {
      // Supprimer les anciennes tarifications
      const { error: deleteError } = await supabase
        .from('tarifications')
        .delete()
        .eq('etablissement_id', etablissementId);

      if (deleteError) {
        console.error('   ❌ Erreur suppression:', deleteError);
      } else {
        console.log('   ✅ Anciennes tarifications supprimées');

        // Insérer les nouvelles
        if (modifications.tarifications.length > 0) {
          const inserts = modifications.tarifications.map(tarif => ({
            etablissement_id: etablissementId,
            periode: tarif.periode || null,
            fourchette_prix: tarif.fourchette_prix || null,
            prix_min: tarif.prix_min || null,
            prix_max: tarif.prix_max || null,
            loyer_base: tarif.loyer_base || null,
            charges: tarif.charges || null,
            devise: tarif.devise || 'EUR',
            logements_type_id: tarif.logements_type_id || null
          }));

          console.log(`   📤 Insertion de ${inserts.length} tarification(s)...`);
          console.log('   Données:', JSON.stringify(inserts, null, 2));

          const { error: insertError } = await supabase
            .from('tarifications')
            .insert(inserts);

          if (insertError) {
            console.error('   ❌ Erreur insertion:', insertError);
          } else {
            console.log(`   ✅ ${inserts.length} tarification(s) insérée(s) avec succès`);
          }
        }
      }
    } catch (error) {
      console.error('   ❌ Erreur tarifications:', error);
    }
  } else {
    console.log('ℹ️  Pas de tarifications à traiter');
  }

  // 3. Gérer restauration (objet JSON)
  if (modifications.restauration && typeof modifications.restauration === 'object') {
    console.log(`\n🍽️  Traitement de la restauration...`);
    
    try {
      // Vérifier si une entrée restauration existe déjà
      const { data: existing } = await supabase
        .from('restaurations')
        .select('id')
        .eq('etablissement_id', etablissementId)
        .single();

      const restaurationData = {
        etablissement_id: etablissementId,
        resto_collectif: modifications.restauration.resto_collectif || false,
        resto_collectif_midi: modifications.restauration.resto_collectif_midi || false,
        kitchenette: modifications.restauration.kitchenette || false,
        portage_repas: modifications.restauration.portage_repas || false
      };

      if (existing) {
        // Mise à jour
        const { error } = await supabase
          .from('restaurations')
          .update(restaurationData)
          .eq('etablissement_id', etablissementId);

        if (error) {
          console.error('   ❌ Erreur mise à jour:', error);
        } else {
          console.log('   ✅ Restauration mise à jour');
        }
      } else {
        // Insertion
        const { error } = await supabase
          .from('restaurations')
          .insert([restaurationData]);

        if (error) {
          console.error('   ❌ Erreur insertion:', error);
        } else {
          console.log('   ✅ Restauration insérée');
        }
      }
    } catch (error) {
      console.error('   ❌ Erreur restauration:', error);
    }
  }

  console.log(`\n✅ Traitement terminé`);
  return true;
}

const propositionId = process.argv[2] || '38b4d49d-15c8-48a9-912a-0593098d426e';

applyLogementsAndTarifs(propositionId)
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
