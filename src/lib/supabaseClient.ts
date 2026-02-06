import { createClient } from '@supabase/supabase-js';

// ATTENTION: Ne jamais commiter les clés en dur dans le code
// Utilisez toujours des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://minwoumfgutampcgrcbr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.error('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY manquante dans les variables d\'environnement');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
