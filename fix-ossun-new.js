#!/usr/bin/env node

/**
 * Correction de l'établissement "maison sainte michelle ossun"
 * - Ajouter la sous-catégorie village_seniors
 * - Vérifier/ajouter la photo si elle existe
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

const ETAB_ID = '210b9b5e-6444-4381-9edc-b76d2b3fe932';

async function fixOssunNew() {
  console.log('🔧 Correction de l\'établissement Ossun (nouveau)\n');
  console.log('━'.repeat(80));
  
  // 1. Vérifier l'établissement
  console.log('\n1️⃣ Vérification de l\'établissement');
  const { data: etab, error: etabError } = await supabase
    .from('etablissements')
    .select('*')
    .eq('id', ETAB_ID)
    .single();
  
  if (etabError || !etab) {
    console.error('   ❌ Établissement introuvable:', etabError?.message);
    return;
  }
  
  console.log(`   ✅ ${etab.nom} - ${etab.commune}`);
  console.log(`   - habitat_type: ${etab.habitat_type}`);
  console.log(`   - image_path: ${etab.image_path || 'null'}`);
  
  // 2. Vérifier les sous-catégories actuelles
  console.log('\n2️⃣ Sous-catégories actuelles');
  const { data: currentSc } = await supabase
    .from('etablissement_sous_categorie')
    .select('sous_categorie_id, sous_categories(libelle, slug)')
    .eq('etablissement_id', ETAB_ID);
  
  console.log(`   ${currentSc.length} sous-catégorie(s) liée(s):`);
  if (currentSc.length > 0) {
    currentSc.forEach(sc => {
      console.log(`   - ${sc.sous_categories.libelle} (${sc.sous_categories.slug})`);
    });
  }
  
  // 3. Récupérer la proposition
  console.log('\n3️⃣ Proposition source');
  const { data: prop } = await supabase
    .from('propositions')
    .select('payload')
    .eq('etablissement_id', ETAB_ID)
    .single();
  
  if (prop && prop.payload.sous_categories) {
    console.log(`   Sous-catégories demandées: ${JSON.stringify(prop.payload.sous_categories)}`);
    
    // 4. Ajouter les sous-catégories manquantes
    console.log('\n4️⃣ Ajout des sous-catégories manquantes');
    
    // Récupérer toutes les sous-catégories
    const { data: allSc } = await supabase
      .from('sous_categories')
      .select('id, libelle, slug')
      .not('slug', 'is', null);
    
    const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/[_\s-]+/g, '_');
    
    for (const scKey of prop.payload.sous_categories) {
      const normalizedKey = normalize(scKey);
      
      // Vérifier si déjà liée
      const alreadyLinked = currentSc.some(sc => 
        normalize(sc.sous_categories.slug) === normalizedKey
      );
      
      if (alreadyLinked) {
        console.log(`   ⏭️ "${scKey}" déjà liée`);
        continue;
      }
      
      // Rechercher la sous-catégorie
      const matchingSc = allSc.find(sc => normalize(sc.slug || '') === normalizedKey);
      
      if (matchingSc) {
        const { error } = await supabase
          .from('etablissement_sous_categorie')
          .insert([{
            etablissement_id: ETAB_ID,
            sous_categorie_id: matchingSc.id
          }]);
        
        if (error) {
          console.error(`   ❌ Erreur création lien "${scKey}":`, error.message);
        } else {
          console.log(`   ✅ Lien créé: "${scKey}" → "${matchingSc.libelle}" (${matchingSc.slug})`);
        }
      } else {
        console.warn(`   ⚠️ Sous-catégorie non trouvée: "${scKey}"`);
      }
    }
  }
  
  // 5. Vérifier la photo
  console.log('\n5️⃣ Vérification de la photo');
  
  if (prop && prop.payload.temp_etablissement_id) {
    const tempId = prop.payload.temp_etablissement_id;
    console.log(`   Recherche avec temp_id: ${tempId}`);
    
    const { data: files } = await supabase.storage
      .from('etablissements')
      .list(tempId);
    
    if (files && files.length > 0) {
      console.log(`   📁 ${files.length} fichier(s) trouvé(s):`);
      files.forEach(f => console.log(`      - ${f.name}`));
      
      // Récupérer le premier fichier
      const mainFile = files.find(f => f.name.startsWith('main.'));
      if (mainFile) {
        const oldPath = `${tempId}/${mainFile.name}`;
        const newPath = `${ETAB_ID}/${mainFile.name}`;
        
        console.log(`   🔄 Déplacement: ${oldPath} → ${newPath}`);
        
        // Copier le fichier
        const { data: fileData } = await supabase.storage
          .from('etablissements')
          .download(oldPath);
        
        if (fileData) {
          const { error: uploadError } = await supabase.storage
            .from('etablissements')
            .upload(newPath, fileData, { upsert: true });
          
          if (uploadError) {
            console.error(`   ❌ Erreur upload:`, uploadError.message);
          } else {
            // Mettre à jour image_path
            const { error: updateError } = await supabase
              .from('etablissements')
              .update({ image_path: newPath })
              .eq('id', ETAB_ID);
            
            if (updateError) {
              console.error(`   ❌ Erreur MAJ image_path:`, updateError.message);
            } else {
              console.log(`   ✅ Photo déplacée et image_path mis à jour`);
              
              // Supprimer l'ancien fichier
              await supabase.storage
                .from('etablissements')
                .remove([oldPath]);
              console.log(`   🗑️ Ancien fichier supprimé`);
            }
          }
        }
      }
    } else {
      console.log(`   ℹ️ Aucun fichier trouvé avec temp_id`);
    }
  }
  
  // 6. Vérification finale
  console.log('\n6️⃣ Vérification finale');
  const { data: finalSc } = await supabase
    .from('etablissement_sous_categorie')
    .select('sous_categories(libelle, slug)')
    .eq('etablissement_id', ETAB_ID);
  
  const { data: finalEtab } = await supabase
    .from('etablissements')
    .select('image_path')
    .eq('id', ETAB_ID)
    .single();
  
  console.log(`   Sous-catégories: ${finalSc.length}`);
  finalSc.forEach(sc => {
    console.log(`   - ${sc.sous_categories.libelle}`);
  });
  console.log(`   Photo: ${finalEtab.image_path ? '✅' : '❌ Aucune'}`);
  
  console.log('\n' + '━'.repeat(80));
  console.log('✅ Correction terminée\n');
}

fixOssunNew().catch(console.error);
