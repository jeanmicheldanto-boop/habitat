require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkCompetitorEmails() {
  console.log('🔍 Vérification des emails avec références aux concurrents...\n');

  // Récupérer TOUS les emails (pas de limite)
  let allData = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('v_liste_publication')
      .select('etab_id, nom, email, commune, departement')
      .not('email', 'is', null)
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }

    allData = allData.concat(data);
    
    if (data.length < pageSize) {
      hasMore = false;
    } else {
      from += pageSize;
    }
  }

  const data = allData;
  console.log(`📊 Total emails récupérés: ${data.length}\n`);

  const competitorKeywords = [
    'papyhappy',
    'papy happy',
    'capretraite',
    'cap retraite',
    'essentiel-autonomie',
    'essentiel autonomie',
    'essentionautonomie'
  ];

  const suspiciousEmails = [];

  data.forEach(etab => {
    const emailLower = etab.email.toLowerCase();
    
    for (const keyword of competitorKeywords) {
      if (emailLower.includes(keyword)) {
        suspiciousEmails.push({
          ...etab,
          keyword: keyword
        });
        break; // Un seul match suffit
      }
    }
  });

  if (suspiciousEmails.length === 0) {
    console.log('✅ Aucun email suspect trouvé !');
    console.log('✅ Tous les emails sont OK pour l\'envoi en masse.\n');
  } else {
    console.log(`⚠️  ${suspiciousEmails.length} email(s) suspect(s) trouvé(s) :\n`);
    
    suspiciousEmails.forEach((etab, index) => {
      console.log(`${index + 1}. ${etab.nom}`);
      console.log(`   📧 Email: ${etab.email}`);
      console.log(`   🔍 Mot-clé: "${etab.keyword}"`);
      console.log(`   📍 ${etab.commune} (${etab.departement})`);
      console.log(`   🆔 ID: ${etab.etab_id}`);
      console.log('');
    });

    console.log(`\n⚠️  RECOMMANDATION: Vérifier manuellement ces ${suspiciousEmails.length} établissement(s) avant envoi.`);
  }

  // Statistiques
  console.log('\n📈 Statistiques:');
  console.log(`   - Emails totaux: ${data.length}`);
  console.log(`   - Emails suspects: ${suspiciousEmails.length}`);
  console.log(`   - Emails OK: ${data.length - suspiciousEmails.length}`);
}

checkCompetitorEmails();
