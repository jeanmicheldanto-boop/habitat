// Diagnostic complet de l'authentification
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://minwoumfgutampcgrcbr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Mzc5MDcsImV4cCI6MjA3NDMxMzkwN30.PWbq0NaB8ZyBIR5XgSn2pD_VoiH9eMjyjUYvvLmA3ng';

async function diagnostic() {
  console.log('🔍 DIAGNOSTIC AUTHENTIFICATION\n');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // 1. Test connexion basique
  console.log('1️⃣ Test connexion patrick.danto@outlook.fr...');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'patrick.danto@outlook.fr',
      password: 'Admin2025!'
    });
    
    if (error) {
      console.error('❌ Erreur:', error.message, '- Status:', error.status);
    } else {
      console.log('✅ Connexion réussie!');
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
  
  // Test avec lgenevaux
  console.log('\n1bis️⃣ Test connexion lgenevaux@yahoo.fr...');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'lgenevaux@yahoo.fr',
      password: 'Admin2025!'
    });
    
    if (error) {
      console.error('❌ Erreur:', error.message, '- Status:', error.status);
    } else {
      console.log('✅ Connexion réussie!');
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
  
  // 1. Test connexion basique
  console.log('\n2️⃣ Test connexion avec mot de passe...');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'patrick.danto@outlook.fr',
      password: 'Admin2025!'
    });
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      console.error('   Code:', error.status);
      console.error('   Détails:', error);
    } else {
      console.log('✅ Connexion réussie!');
      console.log('   User ID:', data.user?.id);
      console.log('   Email:', data.user?.email);
      console.log('   Session valide:', !!data.session);
      
      // 2. Test lecture profil
      console.log('\n2️⃣ Test lecture profil...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_admin')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Erreur lecture profil:', profileError.message);
        console.error('   Code:', profileError.code);
        console.error('   Détails:', profileError);
      } else {
        console.log('✅ Profil lu avec succès:');
        console.log('   Role:', profile.role);
        console.log('   Is Admin:', profile.is_admin);
      }
      
      // 3. Déconnexion
      console.log('\n3️⃣ Déconnexion...');
      await supabase.auth.signOut();
      console.log('✅ Déconnecté');
    }
  } catch (err) {
    console.error('❌ ERREUR CRITIQUE:', err);
  }
  
  // 4. Test getUser sans session
  console.log('\n4️⃣ Test getUser() sans session...');
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.log('⚠️ Erreur attendue (pas de session):', error.message);
    } else {
      console.log('🤔 User retourné sans session?', data.user?.email);
    }
  } catch (err) {
    console.log('⚠️ Exception:', err.message);
  }
  
  console.log('\n✅ Diagnostic terminé');
}

diagnostic();
