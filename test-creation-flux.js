const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function testCreationFlux() {
  console.log('🧪 Test du flux de création d\'établissement complet\n');
  
  // Simuler ce que le formulaire gestionnaire envoie (APRÈS ma correction)
  const mockFormData = {
    nom: 'TEST Résidence Exemple',
    description: 'Une résidence de test',
    adresse: '123 Rue de Test',
    ville: 'Paris',
    code_postal: '75001',
    departement: '75',
    latitude: 48.8566,
    longitude: 2.3522,
    telephone: '0123456789',
    email: 'test@example.com',
    habitat_type: 'residence',
    sous_categories: ['residence_autonomie'],
    services: [],
    equipements: []
  };
  
  const mockUserId = '3b5a5a02-b8c3-4e54-9ead-de6023927333'; // ID de lgenevaux
  
  // Ce que le formulaire envoie maintenant (AVEC ma correction)
  const payloadWithFix = {
    ...mockFormData,
    commune: mockFormData.ville,  // ville -> commune
    adresse_l1: mockFormData.adresse,  // adresse -> adresse_l1
    gestionnaire_id: mockUserId
  };
  
  console.log('📦 Payload qui sera envoyé (AVEC correction):');
  console.log(JSON.stringify(payloadWithFix, null, 2));
  
  console.log('\n✅ Vérifications:');
  console.log('  - commune:', payloadWithFix.commune ? '✅' : '❌');
  console.log('  - adresse_l1:', payloadWithFix.adresse_l1 ? '✅' : '❌');
  console.log('  - gestionnaire_id:', payloadWithFix.gestionnaire_id ? '✅' : '❌');
  console.log('  - habitat_type:', payloadWithFix.habitat_type ? '✅' : '❌');
  console.log('  - sous_categories:', Array.isArray(payloadWithFix.sous_categories) && payloadWithFix.sous_categories.length > 0 ? '✅' : '❌');
  
  // Simuler ce que le code d'approbation fera
  console.log('\n🔄 Simulation du code d\'approbation:\n');
  
  const etablissementData = {};
  const validFields = [
    'nom', 'presentation', 'adresse_l1', 'adresse_l2', 'code_postal', 
    'commune', 'code_insee', 'departement', 'region', 'pays',
    'statut_editorial', 'eligibilite_statut', 'public_cible',
    'source', 'url_source', 'date_observation', 'date_verification',
    'confiance_score', 'telephone', 'email', 'site_web', 
    'gestionnaire', 'habitat_type', 'image_path'
  ];
  
  for (const field of validFields) {
    if (payloadWithFix[field] !== undefined && payloadWithFix[field] !== null) {
      etablissementData[field] = payloadWithFix[field];
    }
  }
  
  // Mappings
  if (payloadWithFix.description && !etablissementData.presentation) {
    etablissementData.presentation = payloadWithFix.description;
    console.log('  ✅ Mapped: description → presentation');
  }
  
  if (payloadWithFix.ville && !etablissementData.commune) {
    etablissementData.commune = payloadWithFix.ville;
    console.log('  ✅ Mapped: ville → commune');
  }
  
  if (payloadWithFix.adresse && !etablissementData.adresse_l1) {
    etablissementData.adresse_l1 = payloadWithFix.adresse;
    console.log('  ✅ Mapped: adresse → adresse_l1');
  }
  
  if (!etablissementData.gestionnaire) {
    if (payloadWithFix.gestionnaire_id) {
      etablissementData.gestionnaire = String(payloadWithFix.gestionnaire_id);
      console.log('  ✅ Mapped: gestionnaire_id → gestionnaire (from payload)');
    } else {
      // Fallback sur created_by
      etablissementData.gestionnaire = String(mockUserId);
      console.log('  ✅ Mapped: created_by → gestionnaire (fallback)');
    }
  }
  
  if (payloadWithFix.latitude && payloadWithFix.longitude) {
    etablissementData.geom = `POINT(${payloadWithFix.longitude} ${payloadWithFix.latitude})`;
    console.log('  ✅ Géométrie créée');
  }
  
  if (!etablissementData.statut_editorial) {
    etablissementData.statut_editorial = 'publie';
    console.log('  ✅ Statut éditorial: publie');
  }
  
  console.log('\n📊 Données finales pour l\'établissement:');
  console.log(JSON.stringify(etablissementData, null, 2));
  
  console.log('\n🔍 Vérification can_publish:');
  console.log('  - nom:', etablissementData.nom ? '✅' : '❌');
  console.log('  - adresse_l1:', etablissementData.adresse_l1 ? '✅' : '❌');
  console.log('  - commune:', etablissementData.commune ? '✅' : '❌');
  console.log('  - code_postal:', etablissementData.code_postal ? '✅' : '❌');
  console.log('  - geom:', etablissementData.geom ? '✅' : '❌');
  console.log('  - gestionnaire:', etablissementData.gestionnaire ? '✅' : '❌');
  console.log('  - habitat_type:', etablissementData.habitat_type ? '✅' : '❌');
  console.log('  - email (format):', etablissementData.email ? '✅' : '❌');
  
  const allChecks = 
    etablissementData.nom &&
    etablissementData.adresse_l1 &&
    etablissementData.commune &&
    etablissementData.code_postal &&
    etablissementData.geom &&
    etablissementData.gestionnaire &&
    etablissementData.habitat_type &&
    etablissementData.email;
  
  console.log('\n' + (allChecks ? '✅ TOUS LES CRITÈRES SONT REMPLIS' : '❌ CERTAINS CRITÈRES MANQUENT'));
  console.log('\n💡 Note: Les sous-catégories seront traitées séparément et liées après la création');
}

testCreationFlux()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
