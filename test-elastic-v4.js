/**
 * Test avec l'API v4 d'Elastic Email
 */

require('dotenv').config({ path: '.env.local' });

const ELASTICEMAIL_API_KEY = process.env.ELASTICEMAIL_API_KEY;

async function testElasticV4() {
  console.log('\n🧪 Test Elastic Email API v4...\n');

  try {
    const response = await fetch('https://api.elasticemail.com/v4/emails/transactional', {
      method: 'POST',
      headers: {
        'X-ElasticEmail-ApiKey': ELASTICEMAIL_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Recipients: {
          To: ['patrick.danto@outlook.fr']
        },
        Content: {
          From: 'patrick.danto@habitat-intermediaire.fr',
          FromName: 'Patrick Danto - Test',
          Subject: '🧪 Test Elastic Email v4',
          Body: [
            {
              ContentType: 'HTML',
              Content: '<h2>✅ Test réussi API v4!</h2><p>Elastic Email fonctionne.</p>',
              Charset: 'utf-8'
            }
          ]
        }
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Email envoyé !');
      console.log('📧 TransactionID:', result.TransactionID);
      console.log('\n👉 Vérifiez patrick.danto@outlook.fr\n');
    } else {
      console.error('❌ Erreur:', result);
      console.log('\n💡 Vérifiez :');
      console.log('   1. Compte Elastic Email vérifié ?');
      console.log('   2. Email expéditeur vérifié ?');
      console.log('   3. Clé API active ?');
      console.log('\n📍 https://elasticemail.com/account#/settings\n');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testElasticV4();
