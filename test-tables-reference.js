// Script pour vérifier les tables de référence
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tnezhdggjrncaxrnmcky.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZXpoZGdnanJuY2F4cm5tY2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MzkzMzEsImV4cCI6MjA1MTExNTMzMX0.T2oXvCOPh72z8IujQu-Fyk97Ct1T6s9OEU3gOJlAX7M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkReferenceTables() {
  console.log('🔍 Vérification des tables de référence...\n');

  // Vérifier categories
  const { data: categories, error: catError, count: catCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact' });
  
  console.log('📊 CATEGORIES:');
  console.log('  Count:', catCount);
  console.log('  Data:', categories);
  console.log('  Erreur:', catError);
  console.log('');

  // Vérifier services
  const { data: services, error: servError, count: servCount } = await supabase
    .from('services')
    .select('*', { count: 'exact' });
  
  console.log('📊 SERVICES:');
  console.log('  Count:', servCount);
  console.log('  Data:', services?.slice(0, 5));
  console.log('  Erreur:', servError);
  console.log('');

  // Vérifier sous_categories
  const { data: sousCategories, error: scError, count: scCount } = await supabase
    .from('sous_categories')
    .select('*', { count: 'exact' });
  
  console.log('📊 SOUS_CATEGORIES:');
  console.log('  Count:', scCount);
  console.log('  Data:', sousCategories);
  console.log('  Erreur:', scError);
}

checkReferenceTables();
