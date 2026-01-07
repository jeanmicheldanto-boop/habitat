const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Lire .env.local manuellement
const envContent = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1];
const serviceRoleKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1];

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixRLSPolicies() {
  console.log('🔧 Ajout des politiques INSERT pour les tables de liaison...\n');

  const policies = [
    {
      table: 'etablissement_sous_categorie',
      policy: 'admin_insert_etablissement_sous_categorie',
      sql: `
        CREATE POLICY "admin_insert_etablissement_sous_categorie"
        ON public.etablissement_sous_categorie
        FOR INSERT
        TO authenticated, service_role
        WITH CHECK (true);
      `
    },
    {
      table: 'etablissement_service',
      policy: 'admin_insert_etablissement_service',
      sql: `
        CREATE POLICY "admin_insert_etablissement_service"
        ON public.etablissement_service
        FOR INSERT
        TO authenticated, service_role
        WITH CHECK (true);
      `
    },
    {
      table: 'etablissement_equipement',
      policy: 'admin_insert_etablissement_equipement',
      sql: `
        CREATE POLICY "admin_insert_etablissement_equipement"
        ON public.etablissement_equipement
        FOR INSERT
        TO authenticated, service_role
        WITH CHECK (true);
      `
    }
  ];

  for (const { table, policy, sql } of policies) {
    console.log(`\n📋 Table: ${table}`);
    console.log(`   Politique: ${policy}`);
    
    // Supprimer la politique existante si elle existe
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql_query: `DROP POLICY IF EXISTS "${policy}" ON public.${table};`
    });

    if (dropError) {
      console.log(`   ⚠️ Note: ${dropError.message}`);
    }

    // Créer la nouvelle politique
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql_query: sql
    });

    if (createError) {
      console.error(`   ❌ Erreur création: ${createError.message}`);
    } else {
      console.log(`   ✅ Politique créée avec succès`);
    }
  }

  console.log('\n\n🔍 Vérification des politiques créées...\n');
  
  const { data: checkPolicies } = await supabase
    .from('pg_policies')
    .select('tablename, policyname, cmd, roles')
    .in('tablename', ['etablissement_sous_categorie', 'etablissement_service', 'etablissement_equipement'])
    .eq('cmd', 'INSERT');

  if (checkPolicies && checkPolicies.length > 0) {
    console.table(checkPolicies);
  } else {
    console.log('⚠️ Impossible de vérifier via pg_policies (normal si pas de fonction exec_sql)');
    console.log('Essayez manuellement via le SQL Editor de Supabase avec le contenu de:');
    console.log('supabase/fix-rls-insert-liaisons.sql');
  }
}

fixRLSPolicies().catch(console.error);
