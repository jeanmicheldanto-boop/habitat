#!/usr/bin/env node

/**
 * Test du flux complet : Création → Modération → Établissement
 * Vérifie que le champ organisation passe correctement à travers tout le processus
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function testFluxComplet() {
  console.log('🧪 Test du flux complet Gestionnaire → Admin → Établissement\n');
  console.log('━'.repeat(80));
  
  const testOrganisation = 'Test Organisation SARL';
  const testUserId = '3b5a5a02-b8c3-4e54-9ead-de6023927333'; // lcg1331
  
  // ÉTAPE 1 : Simuler la création d'une proposition par le gestionnaire
  console.log('\n📝 ÉTAPE 1 : Création de proposition par le gestionnaire');
  console.log('─'.repeat(80));
  
  const propositionPayload = {
    nom: 'Résidence Test Modération',
    description: 'Test du flux complet',
    adresse: '123 rue de Test',
    ville: 'Paris',
    code_postal: '75001',
    departement: '75',
    latitude: 48.8566,
    longitude: 2.3522,
    habitat_type: 'habitat_partage',
    sous_categories: ['colocation_avec_services'],
    telephone: '0123456789',
    email: 'test@example.com',
    // ⭐ CHAMP CLÉ : Le nom de l'organisation (pas l'UUID)
    gestionnaire: testOrganisation,
    // Mappages automatiques du formulaire
    commune: 'Paris',
    adresse_l1: '123 rue de Test'
  };
  
  console.log('   Payload de la proposition :');
  console.log(`   - nom: ${propositionPayload.nom}`);
  console.log(`   - gestionnaire: "${propositionPayload.gestionnaire}" ← NOM de l'organisation`);
  console.log(`   - adresse_l1: ${propositionPayload.adresse_l1}`);
  console.log(`   - commune: ${propositionPayload.commune}`);
  
  const { data: proposition, error: propError } = await supabase
    .from('propositions')
    .insert([{
      type_cible: 'etablissement',
      action: 'create',
      statut: 'en_attente',
      source: 'gestionnaire',
      created_by: testUserId,
      payload: propositionPayload
    }])
    .select()
    .single();
  
  if (propError) {
    console.error('   ❌ Erreur création proposition:', propError);
    return;
  }
  
  console.log(`   ✅ Proposition créée avec ID: ${proposition.id}`);
  
  // ÉTAPE 2 : Vérifier le contenu de la proposition
  console.log('\n🔍 ÉTAPE 2 : Vérification du payload de la proposition');
  console.log('─'.repeat(80));
  
  const payload = proposition.payload;
  console.log('   Champs dans le payload :');
  console.log(`   - nom: ${payload.nom || '❌ MANQUANT'}`);
  console.log(`   - gestionnaire: "${payload.gestionnaire || '❌ MANQUANT'}" ${payload.gestionnaire ? '✅' : '❌'}`);
  console.log(`   - adresse_l1: ${payload.adresse_l1 || '❌ MANQUANT'} ${payload.adresse_l1 ? '✅' : '❌'}`);
  console.log(`   - commune: ${payload.commune || '❌ MANQUANT'} ${payload.commune ? '✅' : '❌'}`);
  console.log(`   - habitat_type: ${payload.habitat_type || '❌ MANQUANT'} ${payload.habitat_type ? '✅' : '❌'}`);
  console.log(`   - latitude/longitude: ${payload.latitude}/${payload.longitude} ${payload.latitude && payload.longitude ? '✅' : '❌'}`);
  
  // ÉTAPE 3 : Simuler l'approbation par l'admin
  console.log('\n✅ ÉTAPE 3 : Approbation par l\'admin (simulation)');
  console.log('─'.repeat(80));
  
  // Simuler la logique d'approbation
  const etablissementData = {};
  
  // Copier les champs valides
  const validFields = [
    'nom', 'adresse_l1', 'code_postal', 'commune', 'departement',
    'telephone', 'email', 'habitat_type', 'gestionnaire'
  ];
  
  for (const field of validFields) {
    if (payload[field] !== undefined && payload[field] !== null) {
      etablissementData[field] = payload[field];
    }
  }
  
  // Mapper description → presentation
  if (payload.description) {
    etablissementData.presentation = payload.description;
  }
  
  // Mapper ville → commune (si besoin)
  if (payload.ville && !etablissementData.commune) {
    etablissementData.commune = payload.ville;
  }
  
  // Mapper adresse → adresse_l1 (si besoin)
  if (payload.adresse && !etablissementData.adresse_l1) {
    etablissementData.adresse_l1 = payload.adresse;
  }
  
  // ⭐ MAPPER GESTIONNAIRE (le point clé du test)
  if (!etablissementData.gestionnaire && payload.gestionnaire) {
    etablissementData.gestionnaire = String(payload.gestionnaire);
  }
  
  // Construire la géométrie
  if (payload.latitude && payload.longitude) {
    etablissementData.geom = `POINT(${payload.longitude} ${payload.latitude})`;
  }
  
  // Statut par défaut
  etablissementData.statut_editorial = 'publie';
  
  console.log('   Données préparées pour insertion établissement :');
  console.log(`   - nom: ${etablissementData.nom || '❌'} ${etablissementData.nom ? '✅' : '❌'}`);
  console.log(`   - gestionnaire: "${etablissementData.gestionnaire || '❌'}" ${etablissementData.gestionnaire === testOrganisation ? '✅' : '❌'}`);
  console.log(`   - adresse_l1: ${etablissementData.adresse_l1 || '❌'} ${etablissementData.adresse_l1 ? '✅' : '❌'}`);
  console.log(`   - commune: ${etablissementData.commune || '❌'} ${etablissementData.commune ? '✅' : '❌'}`);
  console.log(`   - code_postal: ${etablissementData.code_postal || '❌'} ${etablissementData.code_postal ? '✅' : '❌'}`);
  console.log(`   - habitat_type: ${etablissementData.habitat_type || '❌'} ${etablissementData.habitat_type ? '✅' : '❌'}`);
  console.log(`   - geom: ${etablissementData.geom || '❌'} ${etablissementData.geom ? '✅' : '❌'}`);
  console.log(`   - statut_editorial: ${etablissementData.statut_editorial || '❌'} ${etablissementData.statut_editorial ? '✅' : '❌'}`);
  
  // ÉTAPE 4 : Créer l'établissement
  console.log('\n🏗️ ÉTAPE 4 : Création de l\'établissement dans la base');
  console.log('─'.repeat(80));
  
  const { data: etablissement, error: etabError } = await supabase
    .from('etablissements')
    .insert([etablissementData])
    .select()
    .single();
  
  if (etabError) {
    console.error('   ❌ Erreur création établissement:', etabError.message);
    console.error('   Détails:', etabError);
    
    // Nettoyer la proposition de test
    await supabase.from('propositions').delete().eq('id', proposition.id);
    return;
  }
  
  console.log(`   ✅ Établissement créé avec ID: ${etablissement.id}`);
  
  // ÉTAPE 5 : Vérifier l'établissement créé
  console.log('\n🎯 ÉTAPE 5 : Vérification de l\'établissement final');
  console.log('─'.repeat(80));
  
  const { data: verif, error: verifError } = await supabase
    .from('etablissements')
    .select('id, nom, gestionnaire, commune, adresse_l1, code_postal, habitat_type, statut_editorial')
    .eq('id', etablissement.id)
    .single();
  
  if (verifError || !verif) {
    console.error('   ❌ Erreur vérification');
  } else {
    console.log('   Établissement dans la base :');
    console.log(`   - ID: ${verif.id}`);
    console.log(`   - Nom: ${verif.nom}`);
    console.log(`   - Gestionnaire: "${verif.gestionnaire}" ${verif.gestionnaire === testOrganisation ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`   - Commune: ${verif.commune}`);
    console.log(`   - Adresse: ${verif.adresse_l1}`);
    console.log(`   - Code postal: ${verif.code_postal}`);
    console.log(`   - Type: ${verif.habitat_type}`);
    console.log(`   - Statut: ${verif.statut_editorial}`);
  }
  
  // ÉTAPE 6 : Nettoyer les données de test
  console.log('\n🧹 ÉTAPE 6 : Nettoyage des données de test');
  console.log('─'.repeat(80));
  
  await supabase.from('etablissements').delete().eq('id', etablissement.id);
  await supabase.from('propositions').delete().eq('id', proposition.id);
  console.log('   ✅ Données de test supprimées');
  
  // RÉSULTAT FINAL
  console.log('\n' + '━'.repeat(80));
  if (verif && verif.gestionnaire === testOrganisation) {
    console.log('✅ TEST RÉUSSI : Le champ organisation passe correctement du formulaire à la base');
    console.log('\nFlux validé :');
    console.log('  1. Gestionnaire crée proposition avec gestionnaire = "Test Organisation SARL"');
    console.log('  2. Payload stocke gestionnaire = "Test Organisation SARL"');
    console.log('  3. Admin approuve');
    console.log('  4. Établissement créé avec gestionnaire = "Test Organisation SARL"');
    console.log('  5. Pas de jointure nécessaire, affichage direct du nom ✅');
  } else {
    console.log('❌ TEST ÉCHOUÉ : Le champ gestionnaire n\'est pas correct');
  }
  console.log('━'.repeat(80) + '\n');
}

testFluxComplet().catch(console.error);
