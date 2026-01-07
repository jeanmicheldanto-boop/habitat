const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function checkPropositionImage() {
  console.log('🔍 Vérification de l\'image pour la proposition problématique\n');

  const propositionId = '97dd51d8-c3f3-4e98-957f-42e901183e53';

  const { data: prop, error } = await supabase
    .from('propositions')
    .select('*')
    .eq('id', propositionId)
    .single();

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  const payload = prop.payload;
  
  console.log('📋 Proposition:', payload.nom);
  console.log('\n📸 Vérification de l\'image:\n');
  console.log('   image_path dans payload:', payload.image_path || '❌ NULL');
  console.log('   temp_etablissement_id:', payload.temp_etablissement_id || '❌ NON DÉFINI');

  // Vérifier si une photo existe dans le dossier temporaire
  if (payload.temp_etablissement_id) {
    const tempId = payload.temp_etablissement_id;
    
    console.log('\n🗂️ Vérification du dossier Storage temporaire...\n');
    
    try {
      const { data: files, error: listError } = await supabase.storage
        .from('etablissements')
        .list(tempId);

      if (listError) {
        console.log(`   ❌ Erreur lors de la lecture du dossier: ${listError.message}`);
      } else if (files && files.length > 0) {
        console.log(`   ✅ ${files.length} fichier(s) trouvé(s) dans le dossier temporaire:\n`);
        
        for (const file of files) {
          console.log(`      📄 ${file.name}`);
          console.log(`         Taille: ${(file.metadata?.size / 1024).toFixed(2)} KB`);
          console.log(`         Créé le: ${new Date(file.created_at).toLocaleString('fr-FR')}`);
          console.log(`         Chemin complet: etablissements/${tempId}/${file.name}\n`);
        }

        // Afficher l'URL publique du premier fichier
        if (files.length > 0) {
          const publicUrl = `https://minwoumfgutampcgrcbr.supabase.co/storage/v1/object/public/etablissements/${tempId}/${files[0].name}`;
          console.log(`   🌐 URL publique: ${publicUrl}`);
        }
      } else {
        console.log(`   ❌ Aucun fichier trouvé dans le dossier temporaire (établissements/${tempId})`);
      }
    } catch (err) {
      console.error(`   ❌ Erreur lors de l'accès au Storage:`, err);
    }
  } else {
    console.log('   ⚠️ Pas de temp_etablissement_id, impossible de vérifier le Storage');
  }

  // Vérifier aussi dans la table medias (au cas où)
  console.log('\n📊 Vérification dans la table medias...\n');
  
  const { data: medias } = await supabase
    .from('medias')
    .select('*')
    .or(`etablissement_id.eq.${prop.etablissement_id || '00000000-0000-0000-0000-000000000000'}`);

  if (medias && medias.length > 0) {
    console.log(`   ✅ ${medias.length} image(s) trouvée(s) dans medias:`);
    medias.forEach(m => {
      console.log(`      - ${m.storage_path}`);
    });
  } else {
    console.log(`   ❌ Aucune image dans la table medias (normal car l'établissement n'a pas été créé)`);
  }
}

checkPropositionImage().catch(console.error);
