const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function checkFicheData() {
  const ETAB_ID = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';
  
  console.log('\n🔍 COMPARAISON DONNÉES CARTE vs FICHE - Patgen\n');
  console.log('='.repeat(80));
  
  // 1. Données de la vue géolocalisée (utilisée par la carte)
  console.log('\n📍 Vue v_liste_publication_geoloc (CARTE):');
  const { data: carteDonnees, error: carteError } = await supabase
    .from('v_liste_publication_geoloc')
    .select('etab_id, nom, image_path, latitude, longitude')
    .eq('etab_id', ETAB_ID)
    .single();
  
  if (carteError) {
    console.log('   ❌ Erreur:', carteError.message);
  } else if (carteDonnees) {
    console.log('   Nom:', carteDonnees.nom);
    console.log('   image_path:', carteDonnees.image_path || '❌ NULL');
    console.log('   Coordonnées:', carteDonnees.latitude, carteDonnees.longitude);
    if (carteDonnees.image_path) {
      const url = `https://minwoumfgutampcgrcbr.supabase.co/storage/v1/object/public/${carteDonnees.image_path}`;
      console.log('   🔗 URL:', url);
    }
  }
  
  // 2. Données de la vue standard (utilisée par la fiche)
  console.log('\n\n📄 Vue v_liste_publication (FICHE):');
  const { data: ficheDonnees, error: ficheError } = await supabase
    .from('v_liste_publication')
    .select('etab_id, nom, image_path, presentation, sous_categories')
    .eq('etab_id', ETAB_ID)
    .single();
  
  if (ficheError) {
    console.log('   ❌ Erreur:', ficheError.message);
  } else if (ficheDonnees) {
    console.log('   Nom:', ficheDonnees.nom);
    console.log('   image_path:', ficheDonnees.image_path || '❌ NULL');
    console.log('   presentation:', ficheDonnees.presentation?.substring(0, 50) + '...');
    console.log('   sous_categories:', ficheDonnees.sous_categories);
    if (ficheDonnees.image_path) {
      const url = `https://minwoumfgutampcgrcbr.supabase.co/storage/v1/object/public/${ficheDonnees.image_path}`;
      console.log('   🔗 URL:', url);
    }
  }
  
  // 3. Comparaison
  console.log('\n\n🔎 ANALYSE:');
  
  if (carteDonnees && ficheDonnees) {
    if (carteDonnees.image_path === ficheDonnees.image_path) {
      console.log('   ✅ Les deux vues retournent le même image_path');
      if (!ficheDonnees.image_path) {
        console.log('   ⚠️  MAIS les deux retournent NULL !');
        console.log('   → Vérifier que la table medias a bien le storage_path corrigé');
      }
    } else {
      console.log('   ❌ Les vues retournent des image_path DIFFÉRENTS !');
      console.log(`      Carte: "${carteDonnees.image_path}"`);
      console.log(`      Fiche: "${ficheDonnees.image_path}"`);
      console.log('   → Les deux vues doivent utiliser la même source');
    }
  }
  
  // 4. Vérifier directement la table medias
  console.log('\n\n💾 Table medias (source de vérité):');
  const { data: mediasData } = await supabase
    .from('medias')
    .select('storage_path, priority, created_at')
    .eq('etablissement_id', ETAB_ID)
    .order('priority', { ascending: false });
  
  if (mediasData && mediasData.length > 0) {
    mediasData.forEach((m, i) => {
      console.log(`   ${i + 1}. storage_path: ${m.storage_path}`);
      console.log(`      priority: ${m.priority}`);
      console.log(`      created_at: ${m.created_at}`);
    });
  } else {
    console.log('   ❌ Aucune entrée dans medias');
  }
  
  // 5. Vérifier la colonne image_path de etablissements
  console.log('\n\n🏠 Table etablissements.image_path:');
  const { data: etabData } = await supabase
    .from('etablissements')
    .select('image_path')
    .eq('id', ETAB_ID)
    .single();
  
  if (etabData) {
    console.log(`   image_path: ${etabData.image_path || '✅ NULL (correct)'}`);
    if (etabData.image_path) {
      console.log('   ⚠️  La colonne image_path devrait être NULL pour utiliser medias');
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n💡 DIAGNOSTIC:');
  
  if (carteDonnees?.image_path && !ficheDonnees?.image_path) {
    console.log('   🔴 La carte a une image mais pas la fiche');
    console.log('   → Les vues utilisent des requêtes différentes ou sont désynchronisées');
    console.log('   → Possibilité de cache côté Next.js (Server Component)');
  } else if (!carteDonnees?.image_path && !ficheDonnees?.image_path) {
    console.log('   🔴 Aucune des vues ne retourne d\'image_path');
    console.log('   → Vérifier que le storage_path dans medias a bien le préfixe "etablissements/"');
    console.log('   → Vérifier la définition des vues SQL (COALESCE)');
  } else if (carteDonnees?.image_path && ficheDonnees?.image_path) {
    console.log('   ✅ Les deux vues retournent une image_path');
    console.log('   → Le problème doit être côté affichage dans le code de la fiche');
    console.log('   → Vérifier le code de plateforme/fiche/page.tsx');
  }
}

checkFicheData().catch(console.error);
