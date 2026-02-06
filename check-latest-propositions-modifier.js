// Vérifier les dernières propositions pour voir si elles sont bien créées
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Utiliser service_role pour voir toutes les données
);

async function checkPropositions() {
  console.log('🔍 Vérification des dernières propositions...\n');

  // Charger les 10 dernières propositions
  const { data: propositions, error } = await supabase
    .from('propositions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Erreur lors de la récupération des propositions:', error);
    return;
  }

  console.log(`📊 ${propositions.length} dernières propositions trouvées:\n`);

  for (const prop of propositions) {
    console.log('─'.repeat(80));
    console.log(`📝 ID: ${prop.id}`);
    console.log(`   Type: ${prop.type_cible} / Action: ${prop.action}`);
    console.log(`   Statut: ${prop.statut}`);
    console.log(`   Source: ${prop.source || 'N/A'}`);
    console.log(`   Créé par: ${prop.created_by || 'Anonyme/Public'}`);
    console.log(`   Établissement ID: ${prop.etablissement_id || 'N/A'}`);
    console.log(`   Créé le: ${new Date(prop.created_at).toLocaleString('fr-FR')}`);
    
    // Afficher le payload pour les propositions de modification publiques
    if (prop.source === 'public' && prop.action === 'update') {
      console.log(`   📋 Payload:`);
      const payload = prop.payload;
      if (payload.proposeur) {
        console.log(`      Proposeur: ${payload.proposeur.nom} (${payload.proposeur.email})`);
      }
      if (payload.modifications) {
        const modifs = payload.modifications;
        console.log(`      Modifications:`);
        Object.keys(modifs).forEach(key => {
          if (key !== 'nouvelle_photo_base64' && modifs[key] !== undefined && modifs[key] !== null) {
            const value = typeof modifs[key] === 'object' ? JSON.stringify(modifs[key]).substring(0, 100) : modifs[key];
            console.log(`        - ${key}: ${value}`);
          }
        });
      }
    }
    console.log('');
  }

  // Statistiques par statut
  console.log('\n📊 Statistiques par statut:');
  const stats = propositions.reduce((acc, prop) => {
    acc[prop.statut] = (acc[prop.statut] || 0) + 1;
    return acc;
  }, {});
  
  Object.entries(stats).forEach(([statut, count]) => {
    console.log(`   ${statut}: ${count}`);
  });

  // Compter TOUTES les propositions en_attente
  const { count: totalEnAttente, error: countError } = await supabase
    .from('propositions')
    .select('*', { count: 'exact', head: true })
    .eq('statut', 'en_attente');

  if (!countError) {
    console.log(`\n⏳ Total propositions en_attente: ${totalEnAttente}`);
  }

  // Compter les propositions publiques de modification
  const { count: totalPublicUpdate, error: publicError } = await supabase
    .from('propositions')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'public')
    .eq('action', 'update')
    .eq('statut', 'en_attente');

  if (!publicError) {
    console.log(`📢 Propositions publiques de modification en attente: ${totalPublicUpdate}`);
  }
}

checkPropositions()
  .then(() => {
    console.log('\n✅ Vérification terminée');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
