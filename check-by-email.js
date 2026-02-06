/**
 * Script pour vérifier l'établissement avec email rsl@residencesaintlouis.org
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkByEmail() {
  console.log('\n🔍 RECHERCHE PAR EMAIL: rsl@residencesaintlouis.org\n');

  try {
    const { data: etabs, error } = await supabase
      .from('etablissements')
      .select('*')
      .eq('email', 'rsl@residencesaintlouis.org');

    if (error) throw error;

    if (!etabs || etabs.length === 0) {
      console.log('❌ Aucun établissement trouvé avec cet email');
      return;
    }

    console.log('✅ Établissement trouvé:\n');
    
    const etab = etabs[0];
    console.log(`Nom: ${etab.nom}`);
    console.log(`ID: ${etab.etab_id}`);
    console.log(`Commune: ${etab.commune || 'N/A'}`);
    console.log(`Département: ${etab.departement || 'N/A'}`);
    console.log(`Code postal: ${etab.code_postal || 'N/A'}`);
    console.log(`Email: ${etab.email}`);
    console.log(`Gestionnaire: ${etab.gestionnaire || 'N/A'}`);
    console.log(`Créé le: ${new Date(etab.created_at).toLocaleString('fr-FR')}`);
    console.log('');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkByEmail();
