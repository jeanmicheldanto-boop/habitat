const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testInsertProposition() {
  // Simuler une insertion de proposition
  const testData = {
    type_cible: 'etablissement',
    action: 'create',
    statut: 'en_attente',
    source: 'gestionnaire',
    created_by: 'test-user-id', // Remplacer par un vrai ID utilisateur
    payload: {
      nom: 'Test proposition',
      habitat_type: 'residence',
      sous_categories: ['marpa']
    }
  };

  const { data, error } = await supabase
    .from('propositions')
    .insert([testData])
    .select();

  if (error) {
    console.error('❌ Erreur insertion:', error);
  } else {
    console.log('✅ Proposition créée:', data);
  }
}

testInsertProposition().catch(console.error);
