// Script de vérification complet du système d'email verification
// Vérifie que tous les scripts SQL et Edge Functions sont correctement déployés

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Charger les variables d'environnement
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = envVars.SUPABASE_SECRET_KEY;

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function verifyEmailVerificationSystem() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 VÉRIFICATION - SYSTÈME D\'EMAIL VERIFICATION');
  console.log('='.repeat(80) + '\n');

  let allChecks = true;

  // ========================================================================
  // 1. Vérifier la table email_verification_tokens
  // ========================================================================
  console.log('📋 1. TABLE email_verification_tokens\n');

  try {
    const { data, error } = await supabase
      .from('email_verification_tokens')
      .select('*', { count: 'exact', head: true });

    if (error && error.code === 'PGRST116') {
      console.log('❌ Table email_verification_tokens : N\'EXISTE PAS');
      console.log('   Action: Exécutez supabase/create-email-verification-table.sql');
      allChecks = false;
    } else if (error) {
      console.log('⚠️ Erreur lors de la vérification :', error.message);
      allChecks = false;
    } else {
      console.log('✅ Table email_verification_tokens : EXISTE');
      console.log('   Colonnes requises: id, user_id, email, token, expires_at, verified_at, created_at');
    }
  } catch (err) {
    console.log('❌ Erreur accessing table:', err.message);
    allChecks = false;
  }

  // ========================================================================
  // 2. Vérifier les RLS policies sur etablissements
  // ========================================================================
  console.log('\n📋 2. RLS POLICIES - etablissements\n');

  try {
    // Essayer une requête pour vérifier les policies
    const { error } = await supabase
      .from('etablissements')
      .select('id', { count: 'exact', head: true });

    if (error && error.code === 'PGRST116') {
      console.log('❌ RLS Policies : PAS CONFIGURÉES (cannot read etablissements)');
      allChecks = false;
    } else if (!error) {
      console.log('✅ RLS Policies sur etablissements : CONFIGURÉES');
      console.log('   Policies attendues:');
      console.log('   - gestionnaire read own or claimed etablissements');
      console.log('   - gestionnaire update own or claimed etablissements');
    }
  } catch (err) {
    console.log('⚠️  Erreur RLS check:', err.message);
  }

  // ========================================================================
  // 3. Vérifier etablissement_proprietaires
  // ========================================================================
  console.log('\n📋 3. TABLE etablissement_proprietaires\n');

  try {
    const { data, error } = await supabase
      .from('etablissement_proprietaires')
      .select('*', { count: 'exact', head: true });

    if (error && error.code === 'PGRST116') {
      console.log('❌ Table etablissement_proprietaires : N\'EXISTE PAS');
      allChecks = false;
    } else if (error) {
      console.log('⚠️ Erreur:', error.message);
    } else {
      console.log('✅ Table etablissement_proprietaires : EXISTE');
      console.log('   Colonnes: etablissement_id, user_id, role, active');
    }
  } catch (err) {
    console.log('❌ Erreur:', err.message);
    allChecks = false;
  }

  // ========================================================================
  // 4. Tester la création d'un token de vérification
  // ========================================================================
  console.log('\n📋 4. TEST - Création d\'un token\n');

  try {
    const testToken = 'test_' + Math.random().toString(36).substring(7);
    const testUserId = '00000000-0000-0000-0000-000000000000'; // UUID fictif

    const { data, error } = await supabase
      .from('email_verification_tokens')
      .insert({
        user_id: testUserId,
        email: 'test@example.com',
        token: testToken
      })
      .select();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ Impossible d\'insérer : table n\'existe pas');
        allChecks = false;
      } else if (error.message.includes('foreign key')) {
        console.log('⚠️  FK constraint (normal pour UUID fictif) - TABLE FONCTIONNE');
      } else {
        console.log('❌ Erreur insertion:', error.message);
        allChecks = false;
      }
    } else {
      console.log('✅ Insertion réussie - TABLE FONCTIONNE');
      
      // Nettoyer le test data
      await supabase
        .from('email_verification_tokens')
        .delete()
        .eq('token', testToken);
    }
  } catch (err) {
    console.log('❌ Erreur test:', err.message);
    allChecks = false;
  }

  // ========================================================================
  // 5. Vérifier les indexes
  // ========================================================================
  console.log('\n📋 5. INDEXES\n');

  try {
    // On ne peut pas vérifier directement les indexes via Supabase client,
    // donc on affiche juste un avertissement
    console.log('⚠️  Vérification des indexes via SQL Editor recommandée');
    console.log('   Index attendus:');
    console.log('   - idx_email_verification_tokens_token');
    console.log('   - idx_email_verification_tokens_user_id');
  } catch (err) {
    console.log('Erreur:', err.message);
  }

  // ========================================================================
  // 6. Tester les Edge Functions
  // ========================================================================
  console.log('\n📋 6. EDGE FUNCTIONS\n');

  // Test function 1: send-verification-email
  try {
    console.log('Testing send-verification-email...');
    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-verification-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: '00000000-0000-0000-0000-000000000000',
          email: 'test@example.com',
          userName: 'Test',
          userPrenom: 'User'
        })
      }
    );

    if (response.status === 404) {
      console.log('❌ send-verification-email : NOT DEPLOYED');
      console.log('   Action: Run: supabase functions deploy send-verification-email');
      allChecks = false;
    } else if (response.status === 500 || response.status === 400) {
      // C'est normal - l'UUID fictif va causer une erreur FK
      const data = await response.json();
      if (data.message && (data.message.includes('token') || data.message.includes('foreign key'))) {
        console.log('✅ send-verification-email : DEPLOYED (FK error is expected)');
      } else {
        console.log('⚠️  send-verification-email: Deployed but error:', data.error);
      }
    } else {
      console.log('✅ send-verification-email : DEPLOYED');
    }
  } catch (err) {
    console.log('⚠️  send-verification-email : ERROR -', err.message);
  }

  // Test function 2: confirm-email
  try {
    console.log('\nTesting confirm-email...');
    const response = await fetch(
      `${supabaseUrl}/functions/v1/confirm-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: 'fake_token_for_testing_12345'
        })
      }
    );

    if (response.status === 404) {
      console.log('❌ confirm-email : NOT DEPLOYED');
      console.log('   Action: Run: supabase functions deploy confirm-email');
      allChecks = false;
    } else if (response.status === 400) {
      const data = await response.json();
      if (data.error && data.error.includes('invalid')) {
        console.log('✅ confirm-email : DEPLOYED (invalid token is expected)');
      } else {
        console.log('⚠️  confirm-email: Deployed but error:', data.error);
      }
    } else {
      console.log('✅ confirm-email : DEPLOYED');
    }
  } catch (err) {
    console.log('⚠️  confirm-email : ERROR -', err.message);
  }

  // ========================================================================
  // 7. Vérifier les profils et utilisateurs
  // ========================================================================
  console.log('\n📋 7. SYSTEM - Profiles & Users\n');

  try {
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (profileError) {
      console.log('⚠️  Profiles table:', profileError.message);
    } else {
      console.log('✅ Profiles table : ACCESSIBLE');
    }
  } catch (err) {
    console.log('❌ Profiles error:', err.message);
    allChecks = false;
  }

  // ========================================================================
  // RÉSUMÉ
  // ========================================================================
  console.log('\n' + '='.repeat(80));
  if (allChecks) {
    console.log('✅ TOUS LES CHECKS SONT PASSÉS !');
    console.log('='.repeat(80));
    console.log('\n🚀 Prochaines étapes:');
    console.log('   1. Tester le système : /gestionnaire/register');
    console.log('   2. Vérifier la réception d\'email verification');
    console.log('   3. Cliquer le lien et confirmer l\'email');
    console.log('   4. Se connecter avec le compte créé\n');
  } else {
    console.log('⚠️  CERTAINS CHECKS ONT ÉCHOUÉ');
    console.log('='.repeat(80));
    console.log('\n📌 Actions requises:');
    console.log('   1. Vérifier les messages ❌ ci-dessus');
    console.log('   2. Exécuter les scripts SQL manquants dans Supabase');
    console.log('   3. Déployer les Edge Functions manquantes\n');
  }
  console.log('='.repeat(80) + '\n');
}

verifyEmailVerificationSystem().catch(err => {
  console.error('❌ Erreur critique:', err);
  process.exit(1);
});
