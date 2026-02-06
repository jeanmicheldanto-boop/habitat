// Diagnostic du flux d'approbation d'une proposition
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnosticApproval() {
  console.log('🔍 Diagnostic du flux d\'approbation\n');

  // 1. Trouver votre dernière proposition
  const { data: propositions, error } = await supabase
    .from('propositions')
    .select('*')
    .eq('action', 'create')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !propositions) {
    console.error('❌ Aucune proposition trouvée:', error);
    return;
  }

  const propId = propositions.id;
  console.log(`📝 Proposition testée: ${propId}`);
  console.log(`   Nom: ${propositions.payload?.nom || 'N/A'}`);
  console.log(`   Statut actuel: ${propositions.statut}`);
  console.log(`   Établissement lié: ${propositions.etablissement_id || 'Aucun'}\n`);

  if (propositions.statut !== 'en_attente') {
    console.log('⚠️  Cette proposition n\'est pas en attente, cherchons-en une autre...\n');
    
    const { data: propEnAttente } = await supabase
      .from('propositions')
      .select('*')
      .eq('action', 'create')
      .eq('statut', 'en_attente')
      .limit(1)
      .single();

    if (!propEnAttente) {
      console.log('❌ Aucune proposition en attente trouvée pour tester');
      console.log('   Créez d\'abord un établissement depuis l\'interface gestionnaire\n');
      return;
    }

    console.log(`✅ Proposition en attente trouvée: ${propEnAttente.id}`);
    console.log(`   Nom: ${propEnAttente.payload?.nom || 'N/A'}\n`);
  }

  console.log('📋 Simulation du flux d\'approbation...\n');

  console.log('Étape 1: Mise à jour du statut → "approuvee"');
  const { data: updated, error: updateError } = await supabase
    .from('propositions')
    .update({ 
      statut: 'approuvee',
      review_note: 'Test diagnostic - Approbation simulée',
      reviewed_at: new Date().toISOString()
    })
    .eq('id', propId)
    .select()
    .single();

  if (updateError) {
    console.error('❌ Erreur lors de la mise à jour:', updateError);
    return;
  }

  console.log('✅ Statut mis à jour avec succès');
  console.log(`   Nouveau statut: ${updated.statut}\n`);

  console.log('⏳ Attente 2 secondes pour le trigger...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('\nÉtape 2: Création de l\'établissement');
  
  // Récupérer le payload
  const payload = propositions.payload;
  
  console.log('📦 Payload de la proposition:');
  console.log(`   - nom: ${payload?.nom || '❌ MANQUANT'}`);
  console.log(`   - commune: ${payload?.commune || payload?.ville || '❌ MANQUANT'}`);
  console.log(`   - habitat_type: ${payload?.habitat_type || '❌ MANQUANT'}`);
  console.log(`   - sous_categories: ${payload?.sous_categories?.length || 0} sélectionnées`);
  console.log(`   - gestionnaire: ${payload?.gestionnaire || '❌ MANQUANT'}`);
  console.log(`   - latitude: ${payload?.latitude || '❌ MANQUANT'}`);
  console.log(`   - longitude: ${payload?.longitude || '❌ MANQUANT'}`);

  // Vérifier les champs obligatoires
  const champsObligatoires = ['nom', 'habitat_type'];
  const champsManquants = champsObligatoires.filter(champ => !payload?.[champ] && !payload?.[champ === 'commune' ? 'ville' : champ]);
  
  if (champsManquants.length > 0) {
    console.error(`\n❌ Champs obligatoires manquants: ${champsManquants.join(', ')}`);
    console.log('   L\'établissement ne peut pas être créé\n');
    
    // Remettre en attente
    await supabase
      .from('propositions')
      .update({ statut: 'en_attente', review_note: null, reviewed_at: null })
      .eq('id', propId);
    return;
  }

  // Préparer les données pour créer l'établissement
  const etablissementData = {
    nom: payload.nom,
    presentation: payload.presentation || payload.description || null,
    adresse_l1: payload.adresse_l1 || payload.adresse || null,
    adresse_l2: payload.adresse_l2 || null,
    code_postal: payload.code_postal || null,
    commune: payload.commune || payload.ville || null,
    departement: payload.departement || null,
    telephone: payload.telephone || null,
    email: payload.email || null,
    site_web: payload.site_web || null,
    habitat_type: payload.habitat_type,
    gestionnaire: payload.gestionnaire || null,
    statut_editorial: 'publie',
    eligibilite_statut: payload.eligibilite_statut || 'a_verifier'
  };

  // Ajouter la géométrie si coordonnées présentes
  if (payload.latitude && payload.longitude) {
    etablissementData.geom = `POINT(${payload.longitude} ${payload.latitude})`;
  }

  console.log('\n📤 Tentative de création de l\'établissement...');
  
  const { data: newEtab, error: createError } = await supabase
    .from('etablissements')
    .insert([etablissementData])
    .select()
    .single();

  if (createError) {
    console.error('❌ Erreur lors de la création:', createError);
    console.error('   Message:', createError.message);
    console.error('   Code:', createError.code);
    console.error('   Details:', createError.details);
    
    // Remettre en attente
    await supabase
      .from('propositions')
      .update({ statut: 'en_attente', review_note: null, reviewed_at: null })
      .eq('id', propId);
    
    console.log('\n💡 Solutions possibles:');
    console.log('   1. Vérifier les contraintes de la table etablissements');
    console.log('   2. Vérifier les valeurs par défaut requises');
    console.log('   3. Vérifier les foreign keys (gestionnaire, etc.)');
    return;
  }

  console.log('✅ Établissement créé avec succès!');
  console.log(`   ID: ${newEtab.id}`);
  console.log(`   Nom: ${newEtab.nom}\n`);

  // Lier l'établissement à la proposition
  console.log('Étape 3: Liaison proposition ↔ établissement');
  await supabase
    .from('propositions')
    .update({ etablissement_id: newEtab.id })
    .eq('id', propId);
  
  console.log('✅ Proposition liée à l\'établissement\n');

  // Traiter les sous-catégories
  if (payload.sous_categories && Array.isArray(payload.sous_categories) && payload.sous_categories.length > 0) {
    console.log(`Étape 4: Création des sous-catégories (${payload.sous_categories.length})`);
    
    // Récupérer les UUIDs depuis les slugs
    const { data: sousCategories } = await supabase
      .from('sous_categories')
      .select('id, slug')
      .in('slug', payload.sous_categories);

    if (sousCategories && sousCategories.length > 0) {
      const links = sousCategories.map(sc => ({
        etablissement_id: newEtab.id,
        sous_categorie_id: sc.id
      }));

      const { error: scError } = await supabase
        .from('etablissement_sous_categorie')
        .insert(links);

      if (scError) {
        console.warn('⚠️  Erreur liaison sous-catégories (non bloquant):', scError.message);
      } else {
        console.log(`✅ ${links.length} sous-catégorie(s) liée(s)`);
      }
    } else {
      console.warn('⚠️  Aucune sous-catégorie trouvée en base pour:', payload.sous_categories);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ FLUX D\'APPROBATION COMPLÉTÉ AVEC SUCCÈS');
  console.log('='.repeat(80));
  console.log(`📝 Proposition ${propId} → statut "approuvee"`);
  console.log(`🏢 Établissement ${newEtab.id} → créé et publié`);
  console.log(`🔗 Liaison créée entre proposition et établissement`);
  console.log('\n💡 L\'établissement devrait maintenant être visible sur la plateforme!');
  console.log(`   URL: https://habitat-intermediaire.fr/plateforme/${newEtab.id}\n`);

  // Vérifier que la proposition n'apparaît plus dans les en_attente
  const { data: stillPending } = await supabase
    .from('propositions')
    .select('id')
    .eq('id', propId)
    .eq('statut', 'en_attente')
    .single();

  if (stillPending) {
    console.error('❌ PROBLÈME: La proposition est toujours "en_attente"!');
  } else {
    console.log('✅ Vérification: La proposition n\'est plus en attente\n');
  }
}

diagnosticApproval()
  .then(() => {
    console.log('✅ Diagnostic terminé\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
