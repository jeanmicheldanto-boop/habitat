const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

const PROPOSITION_ID = '756dd12c-c6c3-434f-ba21-1892bab54fd9';

async function manualApproval() {
  console.log('🔧 Test d\'approbation manuelle\n');
  console.log(`Proposition ID: ${PROPOSITION_ID}\n`);

  // 1. Récupérer la proposition
  const { data: proposition, error: propError } = await supabase
    .from('propositions')
    .select('*')
    .eq('id', PROPOSITION_ID)
    .single();

  if (propError || !proposition) {
    console.error('❌ Erreur récupération proposition:', propError);
    return;
  }

  console.log('✅ Proposition récupérée');
  console.log(`   Nom: ${proposition.payload.nom}`);
  console.log(`   Statut actuel: ${proposition.statut}`);
  console.log(`   Latitude: ${proposition.payload.latitude}`);
  console.log(`   Longitude: ${proposition.payload.longitude}\n`);

  if (proposition.statut !== 'approuvee') {
    console.log('⚠️ Proposition pas encore approuvée\n');
    return;
  }

  if (proposition.etablissement_id) {
    console.log('✅ Établissement déjà créé:', proposition.etablissement_id);
    return;
  }

  console.log('🔨 Tentative de création de l\'établissement...\n');

  const payload = proposition.payload;
  const etablissementData = { ...payload };

  // Mapper adresse -> adresse_l1
  if (payload.adresse && !etablissementData.adresse_l1) {
    etablissementData.adresse_l1 = payload.adresse;
    console.log('✓ Mapped adresse -> adresse_l1');
  }

  // Mapper ville -> commune
  if (payload.ville && !etablissementData.commune) {
    etablissementData.commune = payload.ville;
    console.log('✓ Mapped ville -> commune');
  }

  // Mapper description -> presentation
  if (payload.description && !etablissementData.presentation) {
    etablissementData.presentation = payload.description;
    console.log('✓ Mapped description -> presentation');
  }

  // Construire le geom
  if (payload.latitude && payload.longitude) {
    etablissementData.geom = `POINT(${payload.longitude} ${payload.latitude})`;
    console.log(`✓ Created geom: POINT(${payload.longitude} ${payload.latitude})`);
  } else {
    console.error('❌ Pas de coordonnées GPS!');
    return;
  }

  // Définir le statut éditorial
  etablissementData.statut_editorial = 'publie';
  console.log('✓ Set statut_editorial = publie');

  // Supprimer tous les champs qui ne sont pas des colonnes directes
  delete etablissementData.adresse; // On utilise adresse_l1
  delete etablissementData.ville; // On utilise commune
  delete etablissementData.description; // On utilise presentation
  delete etablissementData.latitude;
  delete etablissementData.longitude;
  delete etablissementData.temp_etablissement_id;
  delete etablissementData.image_path; // NULL de toute façon
  delete etablissementData.sous_categories; // Relation many-to-many
  delete etablissementData.services; // Relation many-to-many
  delete etablissementData.equipements; // Relation many-to-many
  delete etablissementData.prix_min; // Dans table tarifications
  delete etablissementData.prix_max; // Dans table tarifications
  delete etablissementData.capacite_totale; // Pas sûr si cette colonne existe
  delete etablissementData.photo_url; // Pas une colonne
  delete etablissementData.photo_file; // Pas une colonne
  console.log('✓ Cleaned data\n');

  console.log('📦 Données à insérer:', JSON.stringify(etablissementData, null, 2));
  console.log('\n');

  // Insertion
  const { data: newEtab, error: createError } = await supabase
    .from('etablissements')
    .insert([etablissementData])
    .select()
    .single();

  if (createError) {
    console.error('❌ Erreur création:', createError.message);
    console.error('   Code:', createError.code);
    console.error('   Details:', createError.details);
    console.error('   Hint:', createError.hint);
    return;
  }

  console.log('✅ ÉTABLISSEMENT CRÉÉ!\n');
  console.log('   ID:', newEtab.id);
  console.log('   Nom:', newEtab.nom);
  console.log('   Geom:', newEtab.geom ? '✅' : '❌');
  console.log('\n');

  // Mettre à jour la proposition avec le lien
  const { error: updateError } = await supabase
    .from('propositions')
    .update({ etablissement_id: newEtab.id })
    .eq('id', PROPOSITION_ID);

  if (updateError) {
    console.error('❌ Erreur mise à jour proposition:', updateError.message);
    return;
  }

  console.log('✅ Proposition mise à jour avec etablissement_id\n');

  // Vérifier dans la vue
  const { data: inView, error: viewError } = await supabase
    .from('v_liste_publication_geoloc')
    .select('etab_id, nom, commune, latitude, longitude')
    .eq('etab_id', newEtab.id)
    .single();

  if (viewError) {
    console.error('❌ Pas dans la vue:', viewError.message);
  } else {
    console.log('✅ VISIBLE DANS v_liste_publication_geoloc!');
    console.log(`   ${inView.nom} - ${inView.commune}`);
    console.log(`   Coordonnées: ${inView.latitude}, ${inView.longitude}`);
  }
}

manualApproval().catch(console.error);
