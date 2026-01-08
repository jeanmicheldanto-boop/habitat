const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Lire .env.local manuellement
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkImage() {
  console.log('Checking etablissement 9 image...\n');

  // Trouver l'établissement
  const { data: etab } = await supabase
    .from('etablissements')
    .select('id, nom, gestionnaire')
    .eq('nom', 'etablissement 9')
    .single();

  if (!etab) {
    console.log('Établissement non trouvé');
    return;
  }

  console.log('Établissement:', etab);
  console.log('\nChecking medias...');

  // Vérifier les images
  const { data: medias, error } = await supabase
    .from('medias')
    .select('*')
    .eq('etablissement_id', etab.id);

  if (error) {
    console.log('Error:', error);
    return;
  }

  console.log('Medias found:', medias);
  
  if (medias && medias.length > 0) {
    console.log('\nImage URL:', `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${medias[0].storage_path}`);
  }
}

checkImage();
