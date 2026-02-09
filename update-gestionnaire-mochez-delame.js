// Script pour vérifier et mettre à jour le gestionnaire pour Maison Mochez et Delame
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Charger les variables d'environnement manuellement
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
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateGestionnaires() {
  console.log('🔍 VÉRIFICATION ET MISE À JOUR DES GESTIONNAIRES\n');

  // IDs
  const mochez = '6e5fbddb-b373-4d8e-8707-f1a7661ce6ba';
  const delame = 'e55d42b0-d0fd-4975-8ff5-674beaf34785';

  // 1. Vérifier l'état actuel
  console.log('📋 État AVANT mise à jour:\n');

  // Maison Mochez
  const { data: mochezBefore, error: mochezError } = await supabase
    .from('etablissements')
    .select('id, nom, gestionnaire')
    .eq('id', mochez)
    .single();

  if (mochezError) {
    console.error('❌ Erreur lecture Maison Mochez:', mochezError);
  } else {
    console.log('✏️ Maison Mochez:');
    console.log(`  Nom: ${mochezBefore.nom}`);
    console.log(`  Gestionnaire actuel: "${mochezBefore.gestionnaire || '(vide)'}"`);
  }

  // Maison Delame
  const { data: delameBefore, error: delameError } = await supabase
    .from('etablissements')
    .select('id, nom, gestionnaire, presentation')
    .eq('id', delame)
    .single();

  if (delameError) {
    console.error('❌ Erreur lecture Maison Delame:', delameError);
  } else {
    console.log('\n✏️ Maison Delame:');
    console.log(`  Nom: ${delameBefore.nom}`);
    console.log(`  Gestionnaire actuel: "${delameBefore.gestionnaire || '(vide)'}"`);
    console.log(`  Description: ${delameBefore.presentation ? delameBefore.presentation.substring(0, 80) + '...' : '(vide)'}`);
  }

  // 2. Mettre à jour Maison Mochez si gestionnaire vide
  console.log('\n\n🔄 MISE À JOUR:\n');

  if (mochezBefore && (!mochezBefore.gestionnaire || mochezBefore.gestionnaire.trim() === '')) {
    console.log('✅ Maison Mochez - Mise à jour gestionnaire en "Watt\'Home"');
    const { error: updateError } = await supabase
      .from('etablissements')
      .update({ gestionnaire: 'Watt\'Home' })
      .eq('id', mochez);
    
    if (updateError) {
      console.error('❌ Erreur Maison Mochez:', updateError);
    } else {
      console.log('   ✓ Mise à jour réussie');
    }
  } else if (mochezBefore) {
    console.log(`⏭️ Maison Mochez - Gestionnaire déjà défini: "${mochezBefore.gestionnaire}"`);
  }

  // 3. Mettre à jour Maison Delame (gestionnaire + description)
  if (delameBefore) {
    console.log('\n✅ Maison Delame - Mise à jour gestionnaire et description');
    const newDescription = `La Maison Delame, ouverte en octobre 2017 à Onnaing, est le premier habitat inclusif développé par Watt'Home. Cette maison accueille 5 personnes âgées en perte d'autonomie modérée dans un cadre familial et sécurisant. Avec un accompagnement 24h/24, des repas préparés sur place et des activités quotidiennes adaptées, elle offre une alternative bienveillante entre le domicile et l'EHPAD. Les résidents y conservent leur liberté de choix tout en bénéficiant d'un environnement chaleureux où se tissent des liens d'entraide.`;

    const { error: updateError } = await supabase
      .from('etablissements')
      .update({
        gestionnaire: 'Watt\'Home',
        presentation: newDescription
      })
      .eq('id', delame);

    if (updateError) {
      console.error('❌ Erreur Maison Delame:', updateError);
    } else {
      console.log('   ✓ Mise à jour réussie');
    }
  }

  // 4. Vérifier après mise à jour
  console.log('\n\n✅ État APRÈS mise à jour:\n');

  const { data: mochezAfter } = await supabase
    .from('etablissements')
    .select('id, nom, gestionnaire')
    .eq('id', mochez)
    .single();

  console.log('✏️ Maison Mochez:');
  console.log(`  Nom: ${mochezAfter.nom}`);
  console.log(`  Gestionnaire: "${mochezAfter.gestionnaire}"`);

  const { data: delameAfter } = await supabase
    .from('etablissements')
    .select('id, nom, gestionnaire, presentation')
    .eq('id', delame)
    .single();

  console.log('\n✏️ Maison Delame:');
  console.log(`  Nom: ${delameAfter.nom}`);
  console.log(`  Gestionnaire: "${delameAfter.gestionnaire}"`);
  console.log(`  Description (100 premiers caractères): ${delameAfter.presentation.substring(0, 100)}...`);
  console.log(`  Longueur description: ${delameAfter.presentation.length} caractères`);

  console.log('\n\n✅ Mise à jour terminée avec succès!');
}

updateGestionnaires().catch(err => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});
