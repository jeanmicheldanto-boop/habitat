/**
 * Script pour compter les emails disponibles dans la base de données
 * Usage: node count-emails.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function countEmails() {
  console.log('\n📊 COMPTAGE DES EMAILS EN BASE\n');

  try {
    // 1. Compter tous les établissements
    const { count: totalCount, error: totalError } = await supabase
      .from('etablissements')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // 2. Compter ceux avec email
    const { count: withEmailCount, error: emailError } = await supabase
      .from('etablissements')
      .select('*', { count: 'exact', head: true })
      .not('email', 'is', null)
      .neq('email', '');

    if (emailError) throw emailError;

    // 3. Compter ceux à Ossun (pour test)
    const { data: ossunData, error: ossunError } = await supabase
      .from('etablissements')
      .select('id, nom, email, commune')
      .ilike('commune', '%ossun%');

    if (ossunError) throw ossunError;

    // 4. Afficher les résultats
    console.log('📈 RÉSULTATS:');
    console.log(`   Total établissements: ${totalCount}`);
    console.log(`   Avec email: ${withEmailCount} (${((withEmailCount / totalCount) * 100).toFixed(1)}%)`);
    console.log(`   Sans email: ${totalCount - withEmailCount}`);
    console.log(`\n🧪 Établissements à Ossun (pour test):`);
    console.log(`   Total: ${ossunData.length}`);
    
    if (ossunData.length > 0) {
      console.log('\n   Détails:');
      ossunData.forEach((etab, index) => {
        console.log(`   ${index + 1}. ${etab.nom}`);
        console.log(`      Email: ${etab.email || 'Aucun'}`);
        console.log(`      ID: ${etab.id}`);
      });
    }

    // 5. Estimation coût Mailgun
    console.log(`\n💰 ESTIMATION COÛTS:`);
    console.log(`   Mailgun (flex plan): ~${(withEmailCount * 0.0008).toFixed(2)}$ pour ${withEmailCount} emails`);
    console.log(`   (Gratuit jusqu'à 5,000 emails/mois)`);

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

countEmails();
