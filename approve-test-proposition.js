const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

const PROPOSITION_ID = 'c62a50fa-fe25-45ea-b9d8-e741685c5352';

async function approveProposition() {
  console.log('🔧 Approbation manuelle de la proposition\n');
  
  // 1. Récupérer la proposition
  const { data: prop } = await supabase
    .from('propositions')
    .select('*')
    .eq('id', PROPOSITION_ID)
    .single();

  if (!prop) {
    console.error('❌ Proposition non trouvée');
    return;
  }

  const payload = prop.payload;
  console.log('✅ Proposition récupérée:', payload.nom);
  console.log('   habitat_type:', payload.habitat_type);
  console.log('   sous_categories:', payload.sous_categories);

  // 2. Créer l'établissement
  const validFields = [
    'nom', 'presentation', 'adresse_l1', 'adresse_l2', 'code_postal', 
    'commune', 'code_insee', 'departement', 'region', 'pays',
    'statut_editorial', 'eligibilite_statut', 'public_cible',
    'source', 'url_source', 'date_observation', 'date_verification',
    'confiance_score', 'telephone', 'email', 'site_web', 
    'gestionnaire', 'habitat_type', 'image_path'
  ];

  const etablissementData = {};
  for (const field of validFields) {
    if (payload[field] !== undefined && payload[field] !== null && payload[field] !== '') {
      etablissementData[field] = payload[field];
    }
  }

  // Mappings
  if (payload.description && !etablissementData.presentation) {
    etablissementData.presentation = payload.description;
  }
  if (payload.ville && !etablissementData.commune) {
    etablissementData.commune = payload.ville;
  }
  if (payload.adresse && !etablissementData.adresse_l1) {
    etablissementData.adresse_l1 = payload.adresse;
  }
  if (payload.latitude && payload.longitude) {
    etablissementData.geom = `POINT(${payload.longitude} ${payload.latitude})`;
  }
  if (!etablissementData.statut_editorial) {
    etablissementData.statut_editorial = 'publie';
  }

  console.log('\n📦 Création établissement...');
  const { data: newEtab, error: createError } = await supabase
    .from('etablissements')
    .insert([etablissementData])
    .select()
    .single();

  if (createError) {
    console.error('❌ Erreur:', createError.message);
    return;
  }

  console.log('✅ Établissement créé:', newEtab.id);

  // 3. Traiter les sous-catégories
  if (Array.isArray(payload.sous_categories) && payload.sous_categories.length > 0) {
    console.log('\n🏷️ Traitement sous-catégories:', payload.sous_categories);

    const { data: allSousCategories } = await supabase
      .from('sous_categories')
      .select('id, libelle, slug')
      .not('slug', 'is', null);

    const normalize = (str) => {
      return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/[_\s-]+/g, '_');
    };

    const sousCategoriesData = [];

    for (const scKey of payload.sous_categories) {
      const normalizedKey = normalize(scKey);
      console.log(`\n   Recherche: "${scKey}"`);
      console.log(`   Normalisé: "${normalizedKey}"`);

      // Recherche par slug
      let matchingSc = allSousCategories.find(sc => normalize(sc.slug || '') === normalizedKey);

      if (matchingSc) {
        console.log(`   ✅ Trouvé par slug: "${matchingSc.libelle}" (${matchingSc.id})`);
        sousCategoriesData.push({
          etablissement_id: newEtab.id,
          sous_categorie_id: matchingSc.id
        });
      } else {
        console.log(`   ❌ Non trouvé par slug`);
        
        // Essayer par libellé
        matchingSc = allSousCategories.find(sc => {
          const normalizedLibelle = normalize(sc.libelle);
          return normalizedLibelle === normalizedKey;
        });

        if (matchingSc) {
          console.log(`   ✅ Trouvé par libellé: "${matchingSc.libelle}" (${matchingSc.id})`);
          sousCategoriesData.push({
            etablissement_id: newEtab.id,
            sous_categorie_id: matchingSc.id
          });
        } else {
          console.log(`   ❌ Pas trouvé du tout`);
        }
      }
    }

    // Insérer les liens
    if (sousCategoriesData.length > 0) {
      console.log(`\n📝 Insertion ${sousCategoriesData.length} lien(s)...`);
      const { error: linkError } = await supabase
        .from('etablissement_sous_categorie')
        .insert(sousCategoriesData);

      if (linkError) {
        console.error('❌ Erreur:', linkError.message);
      } else {
        console.log('✅ Liens créés avec succès');
      }
    }
  }

  // 4. Mettre à jour la proposition
  console.log('\n📝 Mise à jour proposition...');
  await supabase
    .from('propositions')
    .update({ 
      statut: 'approuvee',
      etablissement_id: newEtab.id 
    })
    .eq('id', PROPOSITION_ID);

  // 5. Vérifier le résultat
  console.log('\n🔍 Vérification finale...');
  const { data: etabLinks } = await supabase
    .from('etablissement_sous_categorie')
    .select('sous_categorie_id, sous_categories(libelle)')
    .eq('etablissement_id', newEtab.id);

  if (etabLinks && etabLinks.length > 0) {
    console.log('✅ Sous-catégories liées:');
    etabLinks.forEach(link => {
      console.log(`   - ${link.sous_categories.libelle}`);
    });
  } else {
    console.log('❌ Aucune sous-catégorie liée');
  }

  console.log('\n✅ TERMINÉ - Établissement ID:', newEtab.id);
}

approveProposition().catch(console.error);
