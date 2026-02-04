/**
 * Script pour vérifier les emails dupliqués dans la base
 * Usage: node check-duplicate-emails.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkDuplicates() {
  console.log('\n🔍 Analyse des emails dupliqués...\n');

  try {
    // Récupérer tous les établissements avec email
    const { data: etabs, error } = await supabase
      .from('etablissements')
      .select('id, nom, email, commune')
      .not('email', 'is', null)
      .neq('email', '');

    if (error) throw error;

    console.log(`📊 Total établissements avec email: ${etabs.length}\n`);

    // Grouper par email
    const emailMap = new Map();
    
    etabs.forEach(etab => {
      const email = etab.email.toLowerCase().trim();
      if (!emailMap.has(email)) {
        emailMap.set(email, []);
      }
      emailMap.get(email).push(etab);
    });

    // Trouver les doublons
    const duplicates = Array.from(emailMap.entries())
      .filter(([email, etabs]) => etabs.length > 1)
      .sort((a, b) => b[1].length - a[1].length);

    if (duplicates.length === 0) {
      console.log('✅ Aucun email dupliqué trouvé !');
      return;
    }

    console.log(`⚠️  ${duplicates.length} emails utilisés pour plusieurs établissements:\n`);

    let totalDuplicateEmails = 0;
    duplicates.forEach(([email, etabs], index) => {
      totalDuplicateEmails += etabs.length;
      console.log(`${index + 1}. ${email} (${etabs.length} établissements)`);
      etabs.forEach(etab => {
        console.log(`   - ${etab.nom} (${etab.commune || 'Commune inconnue'})`);
      });
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════');
    console.log(`📊 Statistiques:`);
    console.log(`   Total emails uniques: ${emailMap.size}`);
    console.log(`   Emails dupliqués: ${duplicates.length}`);
    console.log(`   Établissements concernés: ${totalDuplicateEmails}`);
    console.log(`   Emails économisés si on déduplique: ${totalDuplicateEmails - duplicates.length}`);
    console.log('═══════════════════════════════════════════════════\n');

    // Suggestion
    console.log('💡 Recommandations:');
    console.log('   1. Pour la campagne, regrouper les établissements par email');
    console.log('   2. Envoyer 1 seul email listant tous les établissements concernés');
    console.log('   3. Économiser des envois et éviter de spammer\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkDuplicates();
