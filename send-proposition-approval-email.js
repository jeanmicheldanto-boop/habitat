const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.trim().split('=');
  if (key && !key.startsWith('#')) envVars[key] = valueParts.join('=');
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || 'https://minwoumfgutampcgrcbr.supabase.co';
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Erreur: SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PROPOSITION_ID = '38b4d49d-15c8-48a9-912a-0593098d426e';

async function sendApprovalEmail() {
  console.log('📧 Envoi d\'email pour proposition approuvée...\n');

  // 1. Récupérer les détails de la proposition
  const { data: proposition, error: propError } = await supabase
    .from('propositions')
    .select('*, profiles:created_by(email, prenom, nom)')
    .eq('id', PROPOSITION_ID)
    .single();

  if (propError || !proposition) {
    console.error('❌ Erreur récupération proposition:', propError);
    return;
  }

  console.log('📊 Proposition:');
  console.log(`   ID: ${proposition.id}`);
  console.log(`   Statut: ${proposition.statut}`);
  console.log(`   Action: ${proposition.action}`);
  console.log(`   Établissement: ${proposition.payload?.nom || proposition.payload?.modifications?.nom || 'N/A'}`);
  console.log(`   Créateur: ${proposition.profiles?.prenom} ${proposition.profiles?.nom}`);
  console.log(`   Email: ${proposition.profiles?.email}`);

  if (!proposition.profiles?.email) {
    console.error('\n❌ Pas d\'email trouvé pour l\'utilisateur');
    return;
  }

  // 2. Préparer le payload pour l'email
  const etabName = proposition.payload?.nom || 
                   proposition.payload?.modifications?.nom || 
                   'votre établissement';

  const emailPayload = {
    email: proposition.profiles.email,
    name: `${proposition.profiles.prenom || ''} ${proposition.profiles.nom || ''}`.trim() || 'Utilisateur',
    type: proposition.statut === 'approuvee' ? 'approuvee' : 'rejetee',
    etablissement: etabName,
    statut: proposition.statut,
    action: proposition.action,
    review_note: proposition.review_note
  };

  console.log('\n📤 Payload email:');
  console.log(JSON.stringify(emailPayload, null, 2));

  // 3. Appeler la fonction edge send-notification
  try {
    const response = await fetch('https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.supabaseKey}`
      },
      body: JSON.stringify(emailPayload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('\n❌ Erreur envoi email:', response.status, result);
    } else {
      console.log('\n✅ Email envoyé avec succès!');
      console.log('   Réponse:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('\n❌ Erreur appel fonction:', error);
  }

  // 4. Créer aussi la notification in-app
  const notificationType = proposition.statut === 'approuvee' 
    ? 'proposition_approved' 
    : 'proposition_rejected';
  
  const notificationTitle = proposition.statut === 'approuvee'
    ? 'Proposition approuvée'
    : 'Proposition rejetée';
  
  const notificationMessage = proposition.statut === 'approuvee'
    ? `Votre demande de ${proposition.action === 'create' ? 'création' : 'modification'} d'établissement a été approuvée !`
    : `Votre demande de ${proposition.action === 'create' ? 'création' : 'modification'} d'établissement a été rejetée.`;

  const { data: notification, error: notifError } = await supabase
    .from('notifications')
    .insert({
      user_id: proposition.created_by,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      data: {
        proposition_id: proposition.id,
        review_note: proposition.review_note
      }
    })
    .select()
    .single();

  if (notifError) {
    console.error('\n⚠️ Erreur création notification in-app:', notifError);
  } else {
    console.log('\n✅ Notification in-app créée:', notification.id);
  }
}

sendApprovalEmail();
