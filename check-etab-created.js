// Vérifier si l'établissement de test a été créé
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCreatedEstablishment() {
  console.log('🔍 Recherche de l\'établissement créé...\n');

  // L'établissement créé par le diagnostic
  const etabId = '3cbf701e-bfee-4dcb-b98a-3525dc5c2765';

  const { data: etab, error } = await supabase
    .from('etablissements')
    .select('*')
    .eq('id', etabId)
    .single();

  if (error) {
    console.error('❌ Établissement non trouvé:', error.message);
    return;
  }

  console.log('✅ Établissement trouvé dans la base!');
  console.log(`   Nom: ${etab.nom}`);
  console.log(`   Commune: ${etab.commune}`);
  console.log(`   Type: ${etab.habitat_type}`);
  console.log(`   Statut: ${etab.statut_editorial}`);
  console.log(`   Gestionnaire: ${etab.gestionnaire || 'Non défini'}`);
  console.log(`\n💡 L'établissement est bien créé et devrait être visible sur:`);
  console.log(`   https://habitat-intermediaire.fr/plateforme/${etabId}\n`);

  // Vérifier la proposition associée
  const { data: prop } = await supabase
    .from('propositions')
    .select('id, statut, etablissement_id')
    .eq('etablissement_id', etabId)
    .single();

  if (prop) {
    console.log('📝 Proposition associée:');
    console.log(`   ID: ${prop.id}`);
    console.log(`   Statut: ${prop.statut}`);
    console.log(`   Lié à établissement: ${prop.etablissement_id}\n`);
  }
}

checkCreatedEstablishment()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Erreur:', err);
    process.exit(1);
  });
