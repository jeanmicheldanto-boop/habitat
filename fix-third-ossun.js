const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function fixThirdOssun() {
  console.log('🔧 Création du 3e établissement Ossun à partir de la proposition approuvée\n');
  
  // 1. Récupérer la proposition approuvée sans établissement
  console.log('1️⃣ Recherche de la proposition...');
  const { data: proposition, error: propError } = await supabase
    .from('propositions')
    .select('*')
    .eq('id', 'c62529f9-da63-4dc3-9e2a-cc754b8dc4f6')
    .single();
  
  if (propError) {
    console.error('❌ Erreur:', propError);
    return;
  }
  
  if (!proposition) {
    console.error('❌ Proposition non trouvée');
    return;
  }
  
  console.log('✅ Proposition trouvée:', {
    id: proposition.id,
    statut: proposition.statut,
    nom: proposition.payload?.nom
  });
  
  if (proposition.etablissement_id) {
    console.log('⚠️ Cette proposition a déjà un établissement associé:', proposition.etablissement_id);
    return;
  }
  
  if (proposition.statut !== 'approuvee') {
    console.log('⚠️ La proposition n\'est pas approuvée (statut:', proposition.statut + ')');
    return;
  }
  
  // 2. Créer l'établissement à partir du payload
  console.log('\n2️⃣ Création de l\'établissement...');
  const payload = proposition.payload;
  
  // Récupérer l'ID du gestionnaire
  let gestionnaire_id = null;
  if (payload.gestionnaire) {
    const { data: gestionnaires } = await supabase
      .from('gestionnaires')
      .select('id, nom')
      .ilike('nom', payload.gestionnaire)
      .limit(1);
    
    if (gestionnaires && gestionnaires.length > 0) {
      gestionnaire_id = gestionnaires[0].id;
      console.log('   Gestionnaire trouvé:', gestionnaires[0].nom, '→', gestionnaire_id);
    } else {
      console.log('   ⚠️ Gestionnaire non trouvé, sera null');
    }
  }
  
  const etablissementData = {
    nom: payload.nom,
    presentation: payload.description || null,
    adresse_l1: payload.adresse_l1 || payload.adresse,
    adresse_l2: payload.adresse_l2 || null,
    code_postal: payload.code_postal,
    commune: payload.commune || payload.ville,
    departement: payload.departement,
    telephone: payload.telephone,
    email: payload.email,
    site_web: payload.site_web || null,
    habitat_type: payload.habitat_type,
    gestionnaire: gestionnaire_id,
    statut_editorial: 'publie',
    eligibilite_statut: 'a_verifier'
  };
  
  // Ajouter la géolocalisation si disponible
  if (payload.latitude && payload.longitude) {
    etablissementData.geom = `POINT(${payload.longitude} ${payload.latitude})`;
  }
  
  console.log('   Données établissement:', {
    nom: etablissementData.nom,
    commune: etablissementData.commune,
    habitat_type: etablissementData.habitat_type,
    gestionnaire: gestionnaire_id
  });
  
  const { data: newEtab, error: createError } = await supabase
    .from('etablissements')
    .insert([etablissementData])
    .select()
    .single();
  
  if (createError) {
    console.error('❌ Erreur création établissement:', createError);
    return;
  }
  
  console.log('✅ Établissement créé:', newEtab.id);
  
  // 3. Traiter les sous-catégories
  if (Array.isArray(payload.sous_categories) && payload.sous_categories.length > 0) {
    console.log('\n3️⃣ Traitement des sous-catégories...');
    
    // Récupérer toutes les sous-catégories pour normaliser
    const { data: allSousCategories } = await supabase
      .from('sous_categories')
      .select('id, libelle');
    
    if (!allSousCategories) {
      console.error('❌ Impossible de récupérer les sous-catégories');
      return;
    }
    
    const sousCategoriesMap = new Map(
      allSousCategories.map(sc => [sc.libelle.toLowerCase().trim(), sc.id])
    );
    
    const links = [];
    for (const scLabel of payload.sous_categories) {
      const normalizedLabel = scLabel.toLowerCase().trim();
      const scId = sousCategoriesMap.get(normalizedLabel);
      
      if (scId) {
        links.push({
          etablissement_id: newEtab.id,
          sous_categorie_id: scId
        });
        console.log(`   ✅ ${scLabel} → ${scId}`);
      } else {
        console.log(`   ⚠️ Sous-catégorie non trouvée: ${scLabel}`);
      }
    }
    
    if (links.length > 0) {
      const { error: linkError } = await supabase
        .from('etablissement_sous_categorie')
        .insert(links);
      
      if (linkError) {
        console.error('❌ Erreur liaison sous-catégories:', linkError);
      } else {
        console.log(`   ✅ ${links.length} liaison(s) créée(s)`);
      }
    }
  }
  
  // 4. Mettre à jour la proposition avec l'ID de l'établissement
  console.log('\n4️⃣ Mise à jour de la proposition...');
  const { error: updateError } = await supabase
    .from('propositions')
    .update({ etablissement_id: newEtab.id })
    .eq('id', proposition.id);
  
  if (updateError) {
    console.error('❌ Erreur mise à jour proposition:', updateError);
  } else {
    console.log('✅ Proposition mise à jour');
  }
  
  // 5. Vérifier l'affichage
  console.log('\n5️⃣ Vérification de l\'affichage...');
  const { data: vueData } = await supabase
    .from('v_liste_publication_geoloc')
    .select('etab_id, nom, commune, sous_categories')
    .eq('etab_id', newEtab.id)
    .single();
  
  if (vueData) {
    console.log('✅ Établissement visible dans la vue:');
    console.log('   Nom:', vueData.nom);
    console.log('   Commune:', vueData.commune);
    console.log('   Sous-catégories:', vueData.sous_categories);
  } else {
    console.log('⚠️ Établissement non visible dans la vue (peut-être un délai de propagation)');
  }
  
  // 6. Liste finale des établissements Ossun
  console.log('\n6️⃣ Liste finale des établissements à Ossun:');
  const { data: ossunEtabs } = await supabase
    .from('v_liste_publication_geoloc')
    .select('etab_id, nom, habitat_type, sous_categories')
    .ilike('commune', '%ossun%')
    .order('nom');
  
  if (ossunEtabs) {
    console.log(`   ${ossunEtabs.length} établissement(s) trouvé(s):`);
    ossunEtabs.forEach((etab, idx) => {
      console.log(`   ${idx + 1}. ${etab.nom}`);
      console.log(`      Type: ${etab.habitat_type}`);
      console.log(`      Sous-catégories: ${etab.sous_categories?.join(', ') || 'aucune'}`);
    });
  }
  
  console.log('\n✅ Correction terminée !');
}

fixThirdOssun()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
