const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1];
const serviceRoleKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1];

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkTest8() {
  console.log('🔍 Vérification établissement test 8...\n');

  // 1. Établissement
  const { data: etab } = await supabase
    .from('etablissements')
    .select('id, nom, image_path, statut_editorial')
    .eq('nom', 'etablissement test 8')
    .single();

  if (!etab) {
    console.log('❌ Établissement non trouvé');
    return;
  }

  console.log('1️⃣ ÉTABLISSEMENT:');
  console.log(`   ID: ${etab.id}`);
  console.log(`   Nom: ${etab.nom}`);
  console.log(`   Statut: ${etab.statut_editorial}`);
  console.log(`   Image: ${etab.image_path || 'AUCUNE'}`);

  // 2. Liaisons sous-catégories
  const { data: liaisons } = await supabase
    .from('etablissement_sous_categorie')
    .select(`
      sous_categorie_id,
      sous_categories(id, libelle, slug)
    `)
    .eq('etablissement_id', etab.id);

  console.log('\n2️⃣ LIAISONS SOUS-CATÉGORIES:');
  console.log(`   Nombre: ${liaisons?.length || 0}`);
  if (liaisons && liaisons.length > 0) {
    liaisons.forEach(l => {
      const sc = l.sous_categories;
      console.log(`   ✅ ${sc.libelle} (slug: ${sc.slug}, id: ${sc.id})`);
    });
  }

  // 3. Vue v_liste_publication_geoloc
  const { data: vue } = await supabase
    .from('v_liste_publication_geoloc')
    .select('id, nom, sous_categories, image_path')
    .eq('id', etab.id)
    .single();

  console.log('\n3️⃣ VUE v_liste_publication_geoloc:');
  if (vue) {
    console.log(`   sous_categories: ${vue.sous_categories || 'null'}`);
    console.log(`   image_path: ${vue.image_path || 'null'}`);
  }

  // 4. Table medias
  const { data: medias } = await supabase
    .from('medias')
    .select('storage_path, priority')
    .eq('etablissement_id', etab.id);

  console.log('\n4️⃣ TABLE MEDIAS:');
  console.log(`   Nombre d'entrées: ${medias?.length || 0}`);
  if (medias && medias.length > 0) {
    medias.forEach(m => {
      console.log(`   - ${m.storage_path} (priorité: ${m.priority})`);
    });
  }

  // 5. Vérifier si fichier existe dans bucket
  if (etab.image_path) {
    const { data: files } = await supabase.storage
      .from('medias')
      .list(etab.image_path.split('/')[0]);
    
    console.log('\n5️⃣ BUCKET medias:');
    if (files && files.length > 0) {
      files.forEach(f => console.log(`   ✅ ${f.name}`));
    } else {
      console.log('   ❌ Aucun fichier trouvé');
    }
  }

  console.log('\n✅ Vérification terminée!');
}

checkTest8().catch(console.error);
