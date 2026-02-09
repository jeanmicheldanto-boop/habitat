// Diagnostic de la proposition Maison Delame
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnoseDelame() {
  console.log('🔍 Recherche de la Maison Delame...\n');

  // 1. Chercher l'établissement
  const { data: etabs, error: etabError } = await supabase
    .from('etablissements')
    .select('id, nom, presentation, public_cible, image_path')
    .ilike('nom', '%delame%');

  if (etabError) {
    console.error('Erreur:', etabError);
    return;
  }

  console.log('📍 Établissement(s) trouvé(s):', etabs.length);
  etabs.forEach(e => {
    console.log(`   ID: ${e.id}`);
    console.log(`   Nom: ${e.nom}`);
    console.log(`   Public cible: ${e.public_cible || 'Non renseigné'}`);
    console.log(`   Image: ${e.image_path || 'Non renseignée'}`);
    console.log(`   Présentation: ${e.presentation ? e.presentation.substring(0, 100) + '...' : 'Non renseignée'}`);
    console.log('');
  });

  // 2. Chercher les propositions liées
  console.log('\n🔎 Recherche des propositions pour Maison Delame...\n');
  
  const { data: props, error: propsError } = await supabase
    .from('propositions')
    .select('*')
    .or(etabs.map(e => `etablissement_id.eq.${e.id}`).join(','))
    .order('created_at', { ascending: false });

  if (propsError) {
    console.error('Erreur propositions:', propsError);
    return;
  }

  console.log(`📋 ${props.length} proposition(s) trouvée(s):\n`);
  
  for (const p of props) {
    console.log(`   Proposition ID: ${p.id}`);
    console.log(`   Statut: ${p.statut}`);
    console.log(`   Action: ${p.action}`);
    console.log(`   Créée le: ${p.created_at}`);
    console.log(`   Revue le: ${p.reviewed_at || 'Non revue'}`);
    console.log(`   Établissement ID: ${p.etablissement_id}`);
    
    // Afficher le payload
    if (p.payload) {
      console.log('\n   📦 Payload:');
      if (p.payload.proposeur) {
        console.log(`      Proposeur: ${p.payload.proposeur.nom} (${p.payload.proposeur.email})`);
      }
      if (p.payload.modifications) {
        console.log('      Modifications demandées:');
        Object.keys(p.payload.modifications).forEach(key => {
          const val = p.payload.modifications[key];
          if (val !== null && val !== undefined && val !== '' && 
              !(Array.isArray(val) && val.length === 0) &&
              key !== 'nouvelle_photo_data' && key !== 'nouvelle_photo_base64') {
            console.log(`         - ${key}: ${typeof val === 'object' ? JSON.stringify(val).substring(0, 80) : String(val).substring(0, 80)}`);
          }
        });
      }
    }
    console.log('\n   ---\n');
  }
}

diagnoseDelame().catch(console.error);
