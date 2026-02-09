// Appliquer manuellement les modifications d'une proposition approuvée
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyApprovedPropositionChanges(propositionId) {
  console.log(`🔧 Application des modifications de la proposition ${propositionId}\n`);

  // 1. Récupérer la proposition
  const { data: proposition, error: propError } = await supabase
    .from('propositions')
    .select('*')
    .eq('id', propositionId)
    .single();

  if (propError || !proposition) {
    console.error('❌ Proposition non trouvée:', propError);
    return false;
  }

  console.log(`📝 Proposition trouvée:`);
  console.log(`   Statut: ${proposition.statut}`);
  console.log(`   Action: ${proposition.action}`);
  console.log(`   Établissement: ${proposition.etablissement_id}`);

  // Vérifier que c'est une proposition approuvée de type update
  if (proposition.statut !== 'approuvee') {
    console.error(`❌ La proposition n'est pas approuvée (statut: ${proposition.statut})`);
    return false;
  }

  if (proposition.action !== 'update') {
    console.error(`❌ Ce n'est pas une proposition de modification (action: ${proposition.action})`);
    return false;
  }

  if (!proposition.etablissement_id) {
    console.error('❌ Pas d\'établissement lié à cette proposition');
    return false;
  }

  // 2. Extraire les modifications
  const modifications = proposition.payload?.modifications || {};
  
  if (Object.keys(modifications).length === 0) {
    console.error('❌ Aucune modification trouvée dans le payload');
    console.log('Payload complet:', JSON.stringify(proposition.payload, null, 2));
    return false;
  }

  console.log(`\n✅ ${Object.keys(modifications).length} champ(s) à modifier:`);
  Object.entries(modifications).forEach(([key, value]) => {
    if (key === 'nouvelle_photo_base64' || key === 'nouvelle_photo_data') {
      console.log(`   - ${key}: [IMAGE DATA - ${typeof value}]`);
    } else if (Array.isArray(value)) {
      console.log(`   - ${key}: [Array de ${value.length} élément(s)]`);
    } else if (typeof value === 'object' && value !== null) {
      console.log(`   - ${key}: [Object]`);
    } else {
      const displayValue = typeof value === 'string' && value.length > 100 
        ? value.substring(0, 100) + '...' 
        : value;
      console.log(`   - ${key}: ${displayValue}`);
    }
  });

  // 3. Préparer les mises à jour pour etablissements
  const etablissementUpdates = {};
  const fieldsToUpdate = [
    'nom', 'adresse_l1', 'adresse_l2', 'code_postal', 'commune', 
    'departement', 'telephone', 'email', 'site_web', 'habitat_type',
    'presentation', 'public_cible', 'gestionnaire', 'eligibilite_statut'
  ];

  fieldsToUpdate.forEach(field => {
    if (modifications[field] !== undefined) {
      etablissementUpdates[field] = modifications[field];
    }
  });

  // 4. Gérer les coordonnées GPS
  if (modifications.latitude && modifications.longitude) {
    etablissementUpdates.geom = `POINT(${modifications.longitude} ${modifications.latitude})`;
    console.log(`   📍 Coordonnées GPS mises à jour`);
  }

  // 5. Appliquer les mises à jour principales
  if (Object.keys(etablissementUpdates).length > 0) {
    console.log(`\n📤 Application de ${Object.keys(etablissementUpdates).length} mise(s) à jour sur etablissements...`);
    
    const { error: updateError } = await supabase
      .from('etablissements')
      .update(etablissementUpdates)
      .eq('id', proposition.etablissement_id);

    if (updateError) {
      console.error('❌ Erreur:', updateError);
      return false;
    }

    console.log('✅ Champs de base mis à jour avec succès');
  }

  // 6. Gérer la photo
  if (modifications.nouvelle_photo_base64 || modifications.nouvelle_photo_data) {
    console.log(`\n📷 Traitement de l'image...`);
    
    try {
      const photoData = modifications.nouvelle_photo_base64 || modifications.nouvelle_photo_data;
      const filename = modifications.nouvelle_photo_filename || 'main.jpg';
      
      // Extraire le base64 pur (sans le préfixe data:image/...)
      let base64Data = photoData;
      if (typeof photoData === 'string' && photoData.includes('base64,')) {
        base64Data = photoData.split('base64,')[1];
      }

      // Convertir en Buffer
      const imageBuffer = Buffer.from(base64Data, 'base64');
      console.log(`   Taille de l'image: ${(imageBuffer.length / 1024).toFixed(2)} KB`);

      // Upload vers Supabase Storage
      const storagePath = `${proposition.etablissement_id}/${filename}`;
      
      const { error: uploadError } = await supabase.storage
        .from('etablissements')
        .upload(storagePath, imageBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        console.error('   ❌ Erreur upload:', uploadError);
      } else {
        // Mettre à jour le champ image_path avec le préfixe du bucket
        const fullPath = `etablissements/${storagePath}`;
        const { error: pathError } = await supabase
          .from('etablissements')
          .update({ image_path: fullPath })
          .eq('id', proposition.etablissement_id);

        if (pathError) {
          console.error('   ❌ Erreur mise à jour path:', pathError);
        } else {
          console.log(`   ✅ Photo uploadée: ${fullPath}`);
        }
      }
    } catch (photoError) {
      console.error('   ❌ Erreur traitement photo:', photoError);
    }
  }

  // 7. Gérer les sous-catégories
  if (Array.isArray(modifications.sous_categories)) {
    console.log(`\n🏷️  Traitement des sous-catégories (${modifications.sous_categories.length})...`);
    
    try {
      // Supprimer les anciennes associations
      const { error: deleteError } = await supabase
        .from('etablissement_sous_categorie')
        .delete()
        .eq('etablissement_id', proposition.etablissement_id);

      if (deleteError) {
        console.error('   ❌ Erreur suppression anciennes:', deleteError);
      } else {
        // Insérer les nouvelles
        if (modifications.sous_categories.length > 0) {
          const inserts = modifications.sous_categories.map(scId => ({
            etablissement_id: proposition.etablissement_id,
            sous_categorie_id: scId
          }));

          const { error: insertError } = await supabase
            .from('etablissement_sous_categorie')
            .insert(inserts);

          if (insertError) {
            console.error('   ❌ Erreur insertion nouvelles:', insertError);
          } else {
            console.log(`   ✅ ${modifications.sous_categories.length} sous-catégorie(s) mise(s) à jour`);
          }
        }
      }
    } catch (scError) {
      console.error('   ❌ Erreur sous-catégories:', scError);
    }
  }

  // 8. Gérer d'autres relations (services, équipements, etc.)
  // Note: logements_types n'est PAS une table de jointure mais contient directement les données
  const relationFields = [
    { field: 'services', table: 'etablissement_service', fk: 'service_id' },
    { field: 'equipements', table: 'etablissement_equipement', fk: 'equipement_id' }
  ];

  for (const rel of relationFields) {
    if (Array.isArray(modifications[rel.field])) {
      console.log(`\n🔗 Traitement ${rel.field} (${modifications[rel.field].length})...`);
      
      try {
        // Supprimer anciennes relations
        await supabase
          .from(rel.table)
          .delete()
          .eq('etablissement_id', proposition.etablissement_id);

        // Insérer nouvelles
        if (modifications[rel.field].length > 0) {
          const inserts = modifications[rel.field].map(id => ({
            etablissement_id: proposition.etablissement_id,
            [rel.fk]: id
          }));

          const { error: insertError } = await supabase
            .from(rel.table)
            .insert(inserts);

          if (insertError) {
            console.error(`   ❌ Erreur ${rel.field}:`, insertError);
          } else {
            console.log(`   ✅ ${modifications[rel.field].length} ${rel.field} mis à jour`);
          }
        }
      } catch (err) {
        console.error(`   ❌ Erreur ${rel.field}:`, err);
      }
    }
  }

  // 9. Vérification finale
  console.log(`\n${'='.repeat(80)}`);
  console.log('🎉 MODIFICATIONS APPLIQUÉES AVEC SUCCÈS !');
  console.log('='.repeat(80));
  
  const { data: updatedEtab } = await supabase
    .from('etablissements')
    .select('nom, commune, statut_editorial, image_path')
    .eq('id', proposition.etablissement_id)
    .single();

  if (updatedEtab) {
    console.log(`\n📊 État final de l'établissement:`);
    console.log(`   Nom: ${updatedEtab.nom}`);
    console.log(`   Commune: ${updatedEtab.commune}`);
    console.log(`   Statut: ${updatedEtab.statut_editorial}`);
    console.log(`   Photo: ${updatedEtab.image_path || 'Aucune'}`);
    console.log(`   Visible en ligne: ${updatedEtab.statut_editorial === 'publie' ? '✅ OUI' : '❌ NON'}`);
  }

  return true;
}

// Usage: node apply-approved-proposition.js <proposition_id>
const propositionId = process.argv[2];

if (!propositionId) {
  console.error('❌ Usage: node apply-approved-proposition.js <proposition_id>');
  console.log('\nExemple avec la dernière proposition approuvée à Onnaing:');
  console.log('node apply-approved-proposition.js 34de3bb9-ee83-4dda-bd90-62f766c86e69');
  process.exit(1);
}

applyApprovedPropositionChanges(propositionId)
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
