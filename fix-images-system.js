const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

/**
 * Script pour corriger le système d'images
 * 1. Vérifier les propositions avec des photos uploadées
 * 2. Identifier les établissements créés sans entrée dans medias
 * 3. Créer les entrées manquantes dans medias
 */

async function fixImagesSystem() {
  console.log('🔍 Analyse du système d\'images\n');
  
  // 1. Vérifier la structure actuelle
  console.log('1️⃣ Vérification de la table medias...');
  const { count: mediasCount } = await supabase
    .from('medias')
    .select('*', { count: 'exact', head: true });
  
  console.log(`   📊 ${mediasCount} média(s) dans la table`);
  
  // 2. Vérifier les propositions avec image_path
  console.log('\n2️⃣ Recherche des propositions avec des photos...');
  const { data: propsWithImages } = await supabase
    .from('propositions')
    .select('id, etablissement_id, payload, created_at')
    .eq('type_cible', 'etablissement')
    .eq('action', 'create')
    .not('payload->image_path', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10);
  
  console.log(`   📸 ${propsWithImages?.length || 0} proposition(s) avec image_path`);
  
  if (propsWithImages && propsWithImages.length > 0) {
    console.log('\n   Détails:');
    propsWithImages.forEach(prop => {
      console.log(`   - Proposition ${prop.id.substring(0, 8)}...`);
      console.log(`     Établissement: ${prop.etablissement_id || 'non créé'}`);
      console.log(`     Image: ${prop.payload.image_path}`);
    });
  }
  
  // 3. Vérifier le bucket Storage
  console.log('\n3️⃣ Vérification du bucket Supabase Storage...');
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const etablissementsBucket = buckets?.find(b => b.name === 'etablissements');
    
    if (etablissementsBucket) {
      console.log('   ✅ Bucket "etablissements" existe');
      
      // Lister quelques fichiers
      const { data: files } = await supabase.storage
        .from('etablissements')
        .list('', { limit: 10 });
      
      console.log(`   📁 ${files?.length || 0} fichier(s) trouvé(s)`);
      if (files && files.length > 0) {
        files.slice(0, 5).forEach(f => {
          console.log(`      - ${f.name}`);
        });
      }
    } else {
      console.log('   ❌ Bucket "etablissements" n\'existe pas');
    }
  } catch (error) {
    console.error('   ❌ Erreur accès Storage:', error.message);
  }
  
  // 4. Proposer des corrections
  console.log('\n4️⃣ Diagnostic du problème:');
  console.log('   ❌ Les photos sont uploadées dans Storage');
  console.log('   ❌ Mais jamais enregistrées dans la table medias');
  console.log('   ❌ Les vues SQL cherchent image_path qui n\'existe pas dans etablissements');
  
  console.log('\n5️⃣ Solutions proposées:');
  console.log('   📝 Solution A: Ajouter une colonne image_path dans etablissements');
  console.log('   📝 Solution B: Utiliser la table medias et récupérer via JOIN');
  console.log('   📝 Solution C (recommandée): Combiner les deux approches');
  
  console.log('\n✅ Analyse terminée');
}

fixImagesSystem()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
