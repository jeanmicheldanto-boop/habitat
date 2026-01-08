const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function checkLastEtablissement() {
  console.log('\n🔍 DIAGNOSTIC DERNIER ÉTABLISSEMENT CRÉÉ\n');
  console.log('='.repeat(80));
  
  // 1. Trouver le dernier établissement créé
  console.log('\n📋 Dernier établissement créé:');
  const { data: lastEtab } = await supabase
    .from('etablissements')
    .select('id, nom, gestionnaire, image_path, statut_editorial, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (!lastEtab) {
    console.log('   ❌ Aucun établissement trouvé');
    return;
  }
  
  console.log(`   ID: ${lastEtab.id}`);
  console.log(`   Nom: ${lastEtab.nom}`);
  console.log(`   Gestionnaire: ${lastEtab.gestionnaire || '❌ NULL'}`);
  console.log(`   image_path: ${lastEtab.image_path || '✅ NULL (normal)'}`);
  console.log(`   Statut: ${lastEtab.statut_editorial}`);
  console.log(`   Créé le: ${lastEtab.created_at}`);
  
  const ETAB_ID = lastEtab.id;
  
  // 2. Vérifier la table medias
  console.log('\n\n📷 Table medias:');
  const { data: medias } = await supabase
    .from('medias')
    .select('storage_path, priority, created_at')
    .eq('etablissement_id', ETAB_ID);
  
  if (medias && medias.length > 0) {
    medias.forEach((m, i) => {
      console.log(`   ${i + 1}. storage_path: ${m.storage_path}`);
      console.log(`      priority: ${m.priority}`);
      
      // Vérifier le préfixe
      if (m.storage_path.startsWith('etablissements/')) {
        console.log('      ✅ Préfixe correct');
      } else if (m.storage_path.startsWith('medias/')) {
        console.log('      ⚠️  Préfixe "medias/" - devrait être "etablissements/"');
      } else {
        console.log('      ❌ Pas de préfixe - PROBLÈME !');
      }
      
      // Tester l'URL
      const url = `https://minwoumfgutampcgrcbr.supabase.co/storage/v1/object/public/${m.storage_path}`;
      console.log(`      🔗 ${url}`);
    });
  } else {
    console.log('   ❌ Aucune entrée dans medias - pas d\'image uploadée');
  }
  
  // 3. Vérifier la vue
  console.log('\n\n📊 Vue v_liste_publication:');
  const { data: vue } = await supabase
    .from('v_liste_publication')
    .select('etab_id, nom, image_path, gestionnaire')
    .eq('etab_id', ETAB_ID)
    .single();
  
  if (vue) {
    console.log(`   Nom: ${vue.nom}`);
    console.log(`   Gestionnaire (vue): ${vue.gestionnaire || '❌ NULL'}`);
    console.log(`   image_path: ${vue.image_path || '❌ NULL'}`);
    
    if (vue.image_path) {
      const url = `https://minwoumfgutampcgrcbr.supabase.co/storage/v1/object/public/${vue.image_path}`;
      console.log(`   🔗 URL finale: ${url}`);
    }
  } else {
    console.log('   ❌ Pas de données dans la vue (établissement non publié ?)');
  }
  
  // 4. Vérifier la dernière proposition
  console.log('\n\n📝 Dernière proposition associée:');
  const { data: prop } = await supabase
    .from('propositions')
    .select('id, statut, payload, created_at, created_by')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (prop) {
    console.log(`   ID: ${prop.id}`);
    console.log(`   Statut: ${prop.statut}`);
    console.log(`   Créée le: ${prop.created_at}`);
    console.log(`   Créée par: ${prop.created_by}`);
    
    if (prop.payload) {
      console.log(`\n   Payload:`);
      console.log(`      nom: ${prop.payload.nom}`);
      console.log(`      gestionnaire: ${prop.payload.gestionnaire || '❌ ABSENT'}`);
      console.log(`      image_path: ${prop.payload.image_path || '❌ ABSENT'}`);
      console.log(`      temp_etablissement_id: ${prop.payload.temp_etablissement_id || '❌ ABSENT'}`);
    }
  }
  
  // 5. Vérifier le profil du créateur
  if (prop?.created_by) {
    console.log('\n\n👤 Profil du créateur:');
    const { data: profile } = await supabase
      .from('profiles')
      .select('organisation, role')
      .eq('id', prop.created_by)
      .single();
    
    if (profile) {
      console.log(`   Organisation: ${profile.organisation || '❌ VIDE'}`);
      console.log(`   Role: ${profile.role}`);
    }
  }
  
  // 6. Vérifier le storage directement
  if (medias && medias.length > 0) {
    console.log('\n\n💾 Vérification Storage Supabase:');
    const path = medias[0].storage_path;
    
    // Test des différents buckets possibles
    const tests = [
      { bucket: 'etablissements', path: path.replace('etablissements/', '').replace('medias/', '') },
      { bucket: 'medias', path: path.replace('etablissements/', '').replace('medias/', '') }
    ];
    
    for (const test of tests) {
      const { data, error } = await supabase.storage
        .from(test.bucket)
        .list(test.path.split('/')[0]);
      
      if (!error && data && data.length > 0) {
        console.log(`   ✅ Fichier trouvé dans bucket "${test.bucket}"`);
        console.log(`      Dossier: ${test.path.split('/')[0]}/`);
        data.forEach(f => console.log(`         - ${f.name}`));
      }
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n💡 DIAGNOSTIC:');
  
  if (!lastEtab.gestionnaire) {
    console.log('   🔴 PROBLÈME: Champ gestionnaire est NULL');
    console.log('   → Vérifier que profile.organisation est rempli');
    console.log('   → Vérifier que le helper utilise bien payload.gestionnaire directement');
  } else {
    console.log('   ✅ Gestionnaire correctement rempli');
  }
  
  if (!medias || medias.length === 0) {
    console.log('   🔴 PROBLÈME: Pas d\'image dans la table medias');
    console.log('   → Vérifier que l\'upload a réussi');
    console.log('   → Vérifier les logs de l\'API upload-image');
  } else if (!medias[0].storage_path.startsWith('etablissements/')) {
    console.log('   🔴 PROBLÈME: storage_path sans le bon préfixe');
    console.log('   → Le code corrigé n\'a pas été utilisé');
    console.log('   → Vérifier que Vercel a bien déployé la dernière version');
  } else if (!vue?.image_path) {
    console.log('   🔴 PROBLÈME: Vue retourne NULL pour image_path');
    console.log('   → Vérifier la définition de la vue SQL');
    console.log('   → Possibilité de cache');
  } else {
    console.log('   ✅ Image correctement configurée');
  }
  
  console.log('\n📍 URL de test:');
  console.log(`   Fiche: https://habitat-intermediaire.vercel.app/plateforme/fiche?id=${ETAB_ID}`);
}

checkLastEtablissement().catch(console.error);
