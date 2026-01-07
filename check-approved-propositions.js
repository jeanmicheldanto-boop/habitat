const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function checkApprovedPropositions() {
  console.log('🔍 Vérification des propositions APPROUVÉES récemment...\n');

  const { data: approved, error } = await supabase
    .from('propositions')
    .select('*')
    .eq('statut', 'approuvee')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log(`📊 ${approved?.length || 0} propositions approuvées récentes:\n`);

  if (approved && approved.length > 0) {
    for (const prop of approved) {
      const payload = prop.payload;
      
      console.log(`\n✅ ${payload.nom || 'Sans nom'}`);
      console.log(`   ID proposition: ${prop.id}`);
      console.log(`   ID établissement créé: ${prop.etablissement_id || '❌ AUCUN'}`);
      console.log(`   Action: ${prop.action}`);
      console.log(`   Commune: ${payload.commune || 'N/A'}`);
      console.log(`   Créée le: ${new Date(prop.created_at).toLocaleString('fr-FR')}`);
      
      // Vérifier les données du payload
      console.log(`   📋 Payload:`);
      console.log(`      Latitude: ${payload.latitude || '❌ MANQUANT'}`);
      console.log(`      Longitude: ${payload.longitude || '❌ MANQUANT'}`);
      console.log(`      Habitat type: ${payload.habitat_type || '❌ MANQUANT'}`);
      console.log(`      Sous-catégories: ${payload.sous_categories ? JSON.stringify(payload.sous_categories) : '❌ MANQUANT'}`);
      
      // Si établissement créé, vérifier ses données
      if (prop.etablissement_id) {
        const { data: etab } = await supabase
          .from('etablissements')
          .select('id, nom, statut_editorial, geom, commune')
          .eq('id', prop.etablissement_id)
          .single();

        if (etab) {
          console.log(`   🏠 Établissement:`);
          console.log(`      Nom: ${etab.nom}`);
          console.log(`      Statut: ${etab.statut_editorial}`);
          console.log(`      Géolocalisation: ${etab.geom ? '✅ OUI' : '❌ NON'}`);
          
          // Vérifier dans la vue
          const { data: inView } = await supabase
            .from('v_liste_publication_geoloc')
            .select('etab_id')
            .eq('etab_id', etab.id)
            .maybeSingle();
          
          console.log(`      Dans la vue: ${inView ? '✅ OUI' : '❌ NON'}`);
          
          if (!inView) {
            console.log(`      ⚠️ RAISONS POSSIBLES:`);
            if (etab.statut_editorial !== 'publie') {
              console.log(`         - Statut != 'publie' (actuel: ${etab.statut_editorial})`);
            }
            if (!etab.geom) {
              console.log(`         - Pas de géolocalisation`);
            }
          }
        } else {
          console.log(`   ❌ Établissement NON TROUVÉ (ID: ${prop.etablissement_id})`);
        }
      } else {
        console.log(`   ⚠️ Aucun établissement créé pour cette proposition`);
      }
    }
  }
}

checkApprovedPropositions().catch(console.error);
