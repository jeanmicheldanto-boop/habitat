const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkAube() {
  console.log('🔍 RECHERCHE AUBE DANS LA BASE\n');

  // 0. Derniers établissements ajoutés
  console.log('📅 20 derniers établissements ajoutés:');
  const { data: recent } = await supabase
    .from('etablissements')
    .select('nom, commune, departement, code_postal, created_at, statut_editorial')
    .order('created_at', { ascending: false })
    .limit(20);

  if (recent) {
    recent.forEach((e, i) => {
      const date = new Date(e.created_at).toLocaleString('fr-FR');
      console.log(`  ${i + 1}. ${e.nom || '[SANS NOM]'}`);
      console.log(`     ${e.commune} (${e.code_postal}) - ${e.departement}`);
      console.log(`     Ajouté: ${date} - Statut: ${e.statut_editorial}`);
      console.log('');
    });
  }
  console.log('---\n');

  // 1. Recherche exacte "Aube"
  const { count: aube1 } = await supabase
    .from('etablissements')
    .select('*', { count: 'exact', head: true })
    .eq('departement', 'Aube');
  console.log('1. Exactement "Aube":', aube1);

  // 2. Recherche "Aube (10)"
  const { count: aube2 } = await supabase
    .from('etablissements')
    .select('*', { count: 'exact', head: true })
    .eq('departement', 'Aube (10)');
  console.log('2. Exactement "Aube (10)":', aube2);

  // 3. Recherche code "10"
  const { count: aube3 } = await supabase
    .from('etablissements')
    .select('*', { count: 'exact', head: true })
    .eq('departement', '10');
  console.log('3. Exactement "10":', aube3);

  // 4. Contient "aube" (insensible à la casse)
  const { count: aube4, data: aubeData } = await supabase
    .from('etablissements')
    .select('departement, nom, commune', { count: 'exact' })
    .ilike('departement', '%aube%');
  console.log('4. Contient "aube" (ilike):', aube4);

  // 5. Chercher par code postal 10xxx
  const { count: aube5, data: cpData } = await supabase
    .from('etablissements')
    .select('nom, commune, departement, code_postal', { count: 'exact' })
    .like('code_postal', '10%');
  console.log('5. Code postal 10xxx:', aube5);

  if (aube5 > 0) {
    console.log('\n📄 Établissements avec code postal 10xxx:');
    cpData?.slice(0, 5).forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.nom} - ${e.commune} (${e.code_postal})`);
      console.log(`     Département: "${e.departement}"`);
    });
  }

  // 6. Vérifier les statuts éditoriaux avec Aube ou code postal 10xxx
  console.log('\n📋 Par statut_editorial (code postal 10xxx):');
  const { data: statutData } = await supabase
    .from('etablissements')
    .select('statut_editorial, nom, commune, departement, code_postal')
    .like('code_postal', '10%');

  if (statutData && statutData.length > 0) {
    const byStatut = {};
    statutData.forEach(e => {
      const s = e.statut_editorial || 'NULL';
      byStatut[s] = (byStatut[s] || 0) + 1;
    });
    
    Object.entries(byStatut).forEach(([statut, count]) => {
      console.log(`  - "${statut}": ${count}`);
    });

    console.log('\n📄 Exemples (statut draft/brouillon):');
    const drafts = statutData.filter(e => 
      e.statut_editorial && (e.statut_editorial.includes('draft') || e.statut_editorial.includes('brouillon'))
    );
    drafts.slice(0, 5).forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.nom} - ${e.commune} - Statut: ${e.statut_editorial}`);
    });
  }

  // 7. Tous les départements uniques qui commencent par quelque chose ressemblant à l'Aube
  console.log('\n📋 Départements contenant "10" ou commençant par "A":');
  const { data: allDepts } = await supabase
    .from('etablissements')
    .select('departement');

  if (allDepts) {
    const unique = [...new Set(allDepts.map(d => d.departement))];
    const filtered = unique.filter(d => 
      d && (d.includes('10') || d.toLowerCase().startsWith('a') || d.toLowerCase().includes('aube'))
    ).sort();
    
    filtered.forEach(dept => {
      const count = allDepts.filter(d => d.departement === dept).length;
      console.log(`  - "${dept}": ${count}`);
    });
  }
}

checkAube().catch(console.error);
