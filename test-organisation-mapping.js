#!/usr/bin/env node

/**
 * Test du mapping organisation → gestionnaire
 * Vérifie que le nom de l'organisation est bien passé depuis le formulaire
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function testOrganisationMapping() {
  console.log('🧪 Test du mapping organisation → gestionnaire\n');
  console.log('━'.repeat(80));
  
  // 1. Vérifier le profil gestionnaire
  console.log('\n1️⃣ Profil du gestionnaire lcg1331@gmail.com');
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, nom, prenom, organisation, role')
    .eq('email', 'lcg1331@gmail.com')
    .single();
  
  if (profile) {
    console.log('   ✅ Profil trouvé:');
    console.log(`      - ID: ${profile.id}`);
    console.log(`      - Nom complet: ${profile.prenom} ${profile.nom}`);
    console.log(`      - Organisation: "${profile.organisation}"`);
    console.log(`      - Rôle: ${profile.role}`);
  } else {
    console.log('   ❌ Profil introuvable');
    return;
  }
  
  // 2. Vérifier les établissements créés par ce gestionnaire
  console.log('\n2️⃣ Établissements avec cette organisation comme gestionnaire');
  const { data: etablissements } = await supabase
    .from('etablissements')
    .select('id, nom, commune, gestionnaire, created_at')
    .eq('gestionnaire', profile.organisation)
    .order('created_at', { ascending: false });
  
  if (etablissements && etablissements.length > 0) {
    console.log(`   ✅ ${etablissements.length} établissement(s) trouvé(s):`);
    etablissements.forEach((etab, index) => {
      console.log(`\n   ${index + 1}. ${etab.nom}`);
      console.log(`      - Commune: ${etab.commune}`);
      console.log(`      - Gestionnaire: "${etab.gestionnaire}"`);
      console.log(`      - Créé le: ${new Date(etab.created_at).toLocaleDateString('fr-FR')}`);
    });
  } else {
    console.log('   ⚠️ Aucun établissement trouvé avec cette organisation');
  }
  
  // 3. Vérifier les propositions en attente
  console.log('\n3️⃣ Propositions en attente pour ce gestionnaire');
  const { data: propositions } = await supabase
    .from('propositions')
    .select('id, statut, payload, created_at')
    .eq('created_by', profile.id)
    .eq('type_cible', 'etablissement')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (propositions && propositions.length > 0) {
    console.log(`   📋 ${propositions.length} proposition(s) trouvée(s):`);
    propositions.forEach((prop, index) => {
      const payload = prop.payload;
      console.log(`\n   ${index + 1}. Proposition ${prop.statut}`);
      console.log(`      - Nom établissement: ${payload.nom || 'Non renseigné'}`);
      console.log(`      - Gestionnaire dans payload: "${payload.gestionnaire || 'NON RENSEIGNÉ ❌'}"`);
      console.log(`      - Commune: ${payload.commune || payload.ville || 'Non renseigné'}`);
      console.log(`      - Créée le: ${new Date(prop.created_at).toLocaleDateString('fr-FR')}`);
    });
  } else {
    console.log('   ℹ️ Aucune proposition en cours');
  }
  
  // 4. Simulation de création
  console.log('\n4️⃣ Simulation de création d\'établissement');
  console.log('   📝 Payload qui serait envoyé:');
  console.log(JSON.stringify({
    nom: 'Résidence Test',
    commune: 'Paris',
    adresse_l1: '123 rue de Test',
    gestionnaire: profile.organisation,  // ← NOM de l'organisation
    habitat_type: 'habitat_individuel'
  }, null, 2));
  
  console.log('\n   ✅ Le champ "gestionnaire" contiendrait: "' + profile.organisation + '"');
  console.log('   ✅ Pas besoin de jointure, le nom est directement dans la table');
  
  console.log('\n' + '━'.repeat(80));
  console.log('✅ Test terminé\n');
}

testOrganisationMapping().catch(console.error);
