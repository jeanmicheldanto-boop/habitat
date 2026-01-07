// Test Node.js simple pour vérifier que Resend fonctionne
// Exécutez: node test-resend-direct.js

const RESEND_API_KEY = 're_BuTH23CZ_DDZQ6VrbXHMkxYCchGuFp9RL';

async function testResend() {
  console.log('🧪 Test Resend API...\n');
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Habitat Intermédiaire <notifications@habitat-intermediaire.fr>',
      to: ['patrick.danto@outlook.fr'],
      subject: '🧪 Test Direct Resend',
      html: '<p>Si vous recevez cet email, <strong>Resend fonctionne parfaitement</strong> ! ✅</p>'
    })
  });

  const result = await response.json();
  
  if (response.ok) {
    console.log('✅ Email envoyé avec succès !');
    console.log('📧 ID:', result.id);
    console.log('\n👉 Vérifiez votre boîte mail et https://resend.com/emails\n');
  } else {
    console.error('❌ Erreur:', result);
  }
}

testResend().catch(console.error);
