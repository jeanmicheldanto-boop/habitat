const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function fixPropositionsStatut() {
  const proposToFix = [
    '5881ba38-0aa6-4991-be03-2ee3033f7a8e', // Etablissement test final
    'efd88231-d7e7-4621-bd79-4e410e1b7ab7', // etablissement de Patrick 2
    'da4a9e4b-6dea-4664-b361-b19513301c0f', // etablissement de Patrick
    'bb538509-0360-4858-b695-78ba4677a0fe'  // Etablissement de Loic
  ];

  for (const id of proposToFix) {
    const { error } = await supabase
      .from('propositions')
      .update({ statut: 'approuvee' })
      .eq('id', id);

    if (error) {
      console.error(`❌ Erreur ${id}:`, error);
    } else {
      console.log(`✅ ${id} → approuvee`);
    }
  }

  console.log('\n🎉 Correction terminée !');
}

fixPropositionsStatut().catch(console.error);
