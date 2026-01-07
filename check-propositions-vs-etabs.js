const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPropositionsVsEtablissements() {
  // Les 5 propositions en_attente
  const proposIds = [
    '21fdbf30-1236-4e80-af75-c80a1856f3ca', // etablissement test 5
    '5881ba38-0aa6-4991-be03-2ee3033f7a8e', // Etablissement test final
    'efd88231-d7e7-4621-bd79-4e410e1b7ab7', // etablissement de Patrick 2
    'da4a9e4b-6dea-4664-b361-b19513301c0f', // etablissement de Patrick
    'bb538509-0360-4858-b695-78ba4677a0fe'  // Etablissement de Loic
  ];

  for (const propId of proposIds) {
    const { data: prop } = await supabase
      .from('propositions')
      .select('id, statut, payload')
      .eq('id', propId)
      .single();

    const nom = prop?.payload?.nom || 'Sans nom';
    
    // Chercher si l'établissement existe
    const { data: etabs } = await supabase
      .from('etablissements')
      .select('id, nom')
      .ilike('nom', `%${nom}%`);

    console.log(`📋 ${nom}`);
    console.log(`   Statut proposition: ${prop?.statut}`);
    console.log(`   Établissement créé: ${etabs?.length > 0 ? 'OUI ✅' : 'NON ❌'}`);
    if (etabs?.length > 0) {
      console.log(`   → ${etabs[0].id}`);
    }
    console.log('');
  }
}

checkPropositionsVsEtablissements().catch(console.error);
