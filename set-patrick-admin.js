const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function setPatrickAdmin() {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_admin: true })
    .eq('email', 'patrick.genevaux@gmail.com');

  if (error) {
    console.error('❌ Erreur:', error);
  } else {
    console.log('✅ patrick.genevaux@gmail.com est maintenant admin');
  }
}

setPatrickAdmin().catch(console.error);
