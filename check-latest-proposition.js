const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function checkLatestProposition() {
  console.log('🔍 Vérification de la dernière proposition créée\n');

  // Récupérer la proposition la plus récente
  const { data: latestProps, error } = await supabase
    .from('propositions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  if (!latestProps || latestProps.length === 0) {
    console.log('❌ Aucune proposition trouvée');
    return;
  }

  console.log(`📊 ${latestProps.length} proposition(s) récente(s):\n`);

  for (const prop of latestProps) {
    const payload = prop.payload;
    const createdAt = new Date(prop.created_at);
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📝 ${payload.nom || 'Sans nom'}`);
    console.log(`   ID: ${prop.id}`);
    console.log(`   Statut: ${prop.statut}`);
    console.log(`   Créée: ${createdAt.toLocaleString('fr-FR')}`);
    console.log(`   Action: ${prop.action}`);
    
    // Informations critiques
    console.log(`\n   ✅ CHAMPS CRITIQUES:`);
    console.log(`      Adresse: ${payload.adresse || payload.adresse_l1 || '❌ MANQUANT'}`);
    console.log(`      Commune: ${payload.commune || payload.ville || '❌ MANQUANT'}`);
    console.log(`      Latitude: ${payload.latitude !== undefined ? payload.latitude : '❌ MANQUANT'}`);
    console.log(`      Longitude: ${payload.longitude !== undefined ? payload.longitude : '❌ MANQUANT'}`);
    console.log(`      Habitat type: ${payload.habitat_type || '❌ MANQUANT'}`);
    
    // Image
    console.log(`\n   📸 IMAGE:`);
    console.log(`      image_path: ${payload.image_path || 'NULL'}`);
    console.log(`      temp_etablissement_id: ${payload.temp_etablissement_id || 'NULL'}`);
    
    // Vérifier le dossier Storage si temp_id existe
    if (payload.temp_etablissement_id) {
      const { data: files } = await supabase.storage
        .from('etablissements')
        .list(payload.temp_etablissement_id);
      
      if (files && files.length > 0) {
        console.log(`      ✅ ${files.length} fichier(s) dans Storage:`);
        files.forEach(f => {
          console.log(`         - ${f.name} (${(f.metadata?.size / 1024).toFixed(2)} KB)`);
        });
      } else {
        console.log(`      ❌ Aucun fichier dans le dossier Storage`);
      }
    }
    
    // Vérifier si approuvée et établissement créé
    if (prop.statut === 'approuvee') {
      console.log(`\n   ✅ APPROUVÉE`);
      
      if (prop.etablissement_id) {
        console.log(`      Établissement ID: ${prop.etablissement_id}`);
        
        const { data: etab } = await supabase
          .from('etablissements')
          .select('id, nom, statut_editorial, geom')
          .eq('id', prop.etablissement_id)
          .single();
        
        if (etab) {
          console.log(`      ✅ Établissement créé: ${etab.nom}`);
          console.log(`      Statut: ${etab.statut_editorial}`);
          console.log(`      Géolocalisation: ${etab.geom ? '✅ OUI' : '❌ NON'}`);
        } else {
          console.log(`      ❌ Établissement NON TROUVÉ`);
        }
      } else {
        console.log(`      ❌ AUCUN établissement créé`);
      }
    } else if (prop.statut === 'en_attente') {
      console.log(`\n   ⏳ EN ATTENTE (pas encore approuvée)`);
    }
  }
  
  console.log(`\n${'='.repeat(70)}\n`);
}

checkLatestProposition().catch(console.error);
