// Appliquer les modifications approuvées de la Maison Delame
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PROPOSITION_ID = 'd0beaf56-be64-4600-be87-5748214f4955';
const ETABLISSEMENT_ID = 'e55d42b0-d0fd-4975-8ff5-674beaf34785';

async function applyModifications() {
  console.log('🔧 Application des modifications de la Maison Delame...\n');

  // 1. Récupérer la proposition
  const { data: proposition, error: propError } = await supabase
    .from('propositions')
    .select('*')
    .eq('id', PROPOSITION_ID)
    .single();

  if (propError || !proposition) {
    console.error('❌ Proposition non trouvée:', propError);
    return;
  }

  console.log('✅ Proposition trouvée, statut:', proposition.statut);
  
  if (proposition.statut !== 'approuvee') {
    console.log('⚠️ La proposition n\'est pas approuvée');
    return;
  }

  const modifications = proposition.payload?.modifications || {};
  console.log('📝 Modifications à appliquer:', Object.keys(modifications).join(', '));

  // 2. Mettre à jour les champs simples de l'établissement
  const fieldsToUpdate = [
    'nom', 'adresse_l1', 'adresse_l2', 'code_postal', 'commune', 
    'departement', 'telephone', 'email', 'site_web', 'habitat_type',
    'presentation', 'gestionnaire', 'eligibilite_statut'
  ];

  const etablissementUpdates = {};
  fieldsToUpdate.forEach(field => {
    if (modifications[field] !== undefined && modifications[field] !== null && modifications[field] !== '') {
      etablissementUpdates[field] = modifications[field];
    }
  });

  // Gérer public_cible (tableau -> chaîne séparée par virgules)
  if (modifications.public_cible && Array.isArray(modifications.public_cible)) {
    etablissementUpdates.public_cible = modifications.public_cible.join(',');
    console.log('   📌 public_cible:', etablissementUpdates.public_cible);
  }

  if (Object.keys(etablissementUpdates).length > 0) {
    console.log('\n📊 Mise à jour des champs de base:', Object.keys(etablissementUpdates));
    const { error: updateError } = await supabase
      .from('etablissements')
      .update(etablissementUpdates)
      .eq('id', ETABLISSEMENT_ID);
    
    if (updateError) {
      console.error('❌ Erreur mise à jour établissement:', updateError);
    } else {
      console.log('✅ Champs de base mis à jour');
    }
  }

  // 3. Mettre à jour les sous-catégories
  if (modifications.sous_categories && Array.isArray(modifications.sous_categories)) {
    console.log('\n🏷️ Mise à jour des sous-catégories...');
    
    // Supprimer les anciennes relations
    await supabase
      .from('etablissement_sous_categorie')
      .delete()
      .eq('etablissement_id', ETABLISSEMENT_ID);
    
    // Insérer les nouvelles
    for (const scId of modifications.sous_categories) {
      const { error } = await supabase
        .from('etablissement_sous_categorie')
        .insert({ etablissement_id: ETABLISSEMENT_ID, sous_categorie_id: scId });
      
      if (error) {
        console.error(`   ❌ Erreur sous-catégorie ${scId}:`, error.message);
      }
    }
    console.log(`✅ ${modifications.sous_categories.length} sous-catégorie(s) mise(s) à jour`);
  }

  // 4. Mettre à jour les services
  if (modifications.services && Array.isArray(modifications.services)) {
    console.log('\n🔧 Mise à jour des services...');
    
    // Supprimer les anciennes relations
    await supabase
      .from('etablissement_service')
      .delete()
      .eq('etablissement_id', ETABLISSEMENT_ID);
    
    // Insérer les nouveaux
    for (const serviceId of modifications.services) {
      const { error } = await supabase
        .from('etablissement_service')
        .insert({ etablissement_id: ETABLISSEMENT_ID, service_id: serviceId });
      
      if (error) {
        console.error(`   ❌ Erreur service ${serviceId}:`, error.message);
      }
    }
    console.log(`✅ ${modifications.services.length} service(s) mis à jour`);
  }

  // 5. Mettre à jour les types de logements
  if (modifications.logements_types && Array.isArray(modifications.logements_types)) {
    console.log('\n🛏️ Mise à jour des types de logements...');
    
    // Supprimer les anciens
    await supabase
      .from('logements_types')
      .delete()
      .eq('etablissement_id', ETABLISSEMENT_ID);
    
    // Insérer les nouveaux
    for (const logement of modifications.logements_types) {
      const { error } = await supabase
        .from('logements_types')
        .insert({
          etablissement_id: ETABLISSEMENT_ID,
          libelle: logement.libelle,
          surface_min: logement.surface_min || null,
          surface_max: logement.surface_max || null,
          meuble: logement.meuble || false,
          pmr: logement.pmr || false,
          domotique: logement.domotique || false,
          plain_pied: logement.plain_pied || false,
          nb_unites: logement.nb_unites || null
        });
      
      if (error) {
        console.error(`   ❌ Erreur logement ${logement.libelle}:`, error.message);
      }
    }
    console.log(`✅ ${modifications.logements_types.length} type(s) de logement(s) mis à jour`);
  }

  // 6. Mettre à jour les tarifications
  if (modifications.tarifications && Array.isArray(modifications.tarifications)) {
    console.log('\n💰 Mise à jour des tarifications...');
    
    // Supprimer les anciennes
    await supabase
      .from('tarifications')
      .delete()
      .eq('etablissement_id', ETABLISSEMENT_ID);
    
    // Insérer les nouvelles
    for (const tarif of modifications.tarifications) {
      const { error } = await supabase
        .from('tarifications')
        .insert({
          etablissement_id: ETABLISSEMENT_ID,
          periode: tarif.periode || 'mensuel',
          fourchette_prix: tarif.fourchette_prix || null,
          prix_min: tarif.prix_min || null,
          prix_max: tarif.prix_max || null,
          loyer_base: tarif.loyer_base || null,
          charges: tarif.charges || null
        });
      
      if (error) {
        console.error(`   ❌ Erreur tarification:`, error.message);
      }
    }
    console.log(`✅ ${modifications.tarifications.length} tarification(s) mise(s) à jour`);
  }

  // 7. Mettre à jour la restauration
  if (modifications.restauration) {
    console.log('\n🍽️ Mise à jour de la restauration...');
    
    // Supprimer l'ancienne
    await supabase
      .from('restaurations')
      .delete()
      .eq('etablissement_id', ETABLISSEMENT_ID);
    
    // Insérer la nouvelle
    const { error } = await supabase
      .from('restaurations')
      .insert({
        etablissement_id: ETABLISSEMENT_ID,
        kitchenette: modifications.restauration.kitchenette || false,
        resto_collectif_midi: modifications.restauration.resto_collectif_midi || false,
        resto_collectif: modifications.restauration.resto_collectif || false,
        portage_repas: modifications.restauration.portage_repas || false
      });
    
    if (error) {
      console.error('❌ Erreur restauration:', error.message);
    } else {
      console.log('✅ Restauration mise à jour');
    }
  }

  // 8. Gérer la photo si présente
  if (modifications.nouvelle_photo_base64 && modifications.nouvelle_photo_filename) {
    console.log('\n📷 Traitement de la photo...');
    
    try {
      // Décoder le base64
      const base64Data = modifications.nouvelle_photo_base64.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      const filename = modifications.nouvelle_photo_filename;
      const storagePath = `${ETABLISSEMENT_ID}/${filename}`;
      
      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('etablissements')
        .upload(storagePath, imageBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });
      
      if (uploadError) {
        console.error('❌ Erreur upload image:', uploadError);
      } else {
        // Mettre à jour le chemin de l'image avec le préfixe du bucket
        const { error: updateImgError } = await supabase
          .from('etablissements')
          .update({ image_path: 'etablissements/' + storagePath })
          .eq('id', ETABLISSEMENT_ID);
        
        if (updateImgError) {
          console.error('❌ Erreur mise à jour image_path:', updateImgError);
        } else {
          console.log('✅ Photo uploadée et chemin mis à jour:', 'etablissements/' + storagePath);
        }
      }
    } catch (err) {
      console.error('❌ Erreur traitement photo:', err.message);
    }
  }

  // 9. Mettre à jour reviewed_at
  const { error: reviewError } = await supabase
    .from('propositions')
    .update({ reviewed_at: new Date().toISOString() })
    .eq('id', PROPOSITION_ID);
  
  if (reviewError) {
    console.error('❌ Erreur mise à jour reviewed_at:', reviewError);
  }

  console.log('\n✅ ========================================');
  console.log('✅ Toutes les modifications ont été appliquées !');
  console.log('✅ ========================================\n');

  // Vérification finale
  const { data: finalEtab } = await supabase
    .from('etablissements')
    .select('nom, email, telephone, site_web, public_cible, image_path, habitat_type')
    .eq('id', ETABLISSEMENT_ID)
    .single();
  
  console.log('📊 État final de l\'établissement:');
  console.log(finalEtab);
}

applyModifications().catch(console.error);
