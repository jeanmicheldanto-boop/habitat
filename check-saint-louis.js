/**
 * Script pour vérifier l'établissement SAINT-LOUIS
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSaintLouis() {
  console.log('\n🔍 RECHERCHE DE LA RÉSIDENCE SAINT-LOUIS\n');

  try {
    const { data: etabs, error } = await supabase
      .from('etablissements')
      .select('*')
      .ilike('nom', '%saint-louis%');

    if (error) throw error;

    if (!etabs || etabs.length === 0) {
      console.log('❌ Aucun établissement trouvé avec "SAINT-LOUIS" dans le nom');
      return;
    }

    console.log(`✅ ${etabs.length} établissement(s) trouvé(s):\n`);
    
    etabs.forEach((etab, index) => {
      console.log(`${index + 1}. ${etab.nom}`);
      console.log(`   ID: ${etab.etab_id}`);
      console.log(`   Commune: ${etab.commune || 'N/A'}`);
      console.log(`   Département: ${etab.departement || 'N/A'}`);
      console.log(`   Email: ${etab.email || 'N/A'}`);
      console.log(`   Gestionnaire: ${etab.gestionnaire || 'N/A'}`);
      console.log(`   Créé le: ${new Date(etab.created_at).toLocaleString('fr-FR')}`);
      console.log('');
    });

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkSaintLouis();
