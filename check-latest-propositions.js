const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkLatestPropositions() {
  // Toutes les propositions récentes
  const { data, error } = await supabase
    .from('propositions')
    .select('id, created_at, statut, action, type_cible, payload')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log('📋 Dernières propositions:\n');
  data?.forEach(prop => {
    console.log(`ID: ${prop.id}`);
    console.log(`Statut: ${prop.statut}`);
    console.log(`Action: ${prop.action}`);
    console.log(`Type: ${prop.type_cible}`);
    console.log(`Nom: ${prop.payload?.nom || 'N/A'}`);
    console.log(`Sous-catégories: ${JSON.stringify(prop.payload?.sous_categories)}`);
    console.log(`Créé: ${prop.created_at}`);
    console.log('---\n');
  });

  // Compter par statut
  const { data: counts } = await supabase
    .from('propositions')
    .select('statut', { count: 'exact', head: true });

  console.log('\n📊 Statistiques:');
  const { data: enAttente } = await supabase.from('propositions').select('*', { count: 'exact', head: true }).eq('statut', 'en_attente');
  const { data: approuve } = await supabase.from('propositions').select('*', { count: 'exact', head: true }).eq('statut', 'approuve');
  const { data: rejete } = await supabase.from('propositions').select('*', { count: 'exact', head: true }).eq('statut', 'rejete');
  
  console.log(`En attente: ${enAttente?.length || 0}`);
  console.log(`Approuvé: ${approuve?.length || 0}`);
  console.log(`Rejeté: ${rejete?.length || 0}`);
}

checkLatestPropositions().catch(console.error);
