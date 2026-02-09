#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

(async () => {
  const { data } = await supabase
    .from('profiles')
    .select('id, email, nom, prenom, role, organisation')
    .order('nom');
  
  console.log('\nTous les utilisateurs dans profiles:\n');
  data?.forEach(p => {
    console.log(`  ${p.nom || p.prenom || '(sans nom)'} (${p.email})`);
    console.log(`    ID: ${p.id}`);
    console.log(`    Rôle: ${p.role}, Org: ${p.organisation}`);
    console.log('');
  });
})();
