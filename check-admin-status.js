const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkAdminStatus() {
  // L'email du compte admin
  const adminEmail = 'patrick.genevaux@gmail.com'; // ou votre email

  // Trouver l'utilisateur
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', adminEmail)
    .single();

  console.log('👤 Profile admin:', JSON.stringify(profile, null, 2));

  // Tester la fonction is_admin
  const { data: isAdminResult, error } = await supabase
    .rpc('is_admin');

  console.log('\n🔐 Résultat is_admin():', isAdminResult);
  if (error) console.error('Erreur:', error);
}

checkAdminStatus().catch(console.error);
