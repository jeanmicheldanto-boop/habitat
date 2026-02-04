/**
 * Test simple d'envoi email avec Elastic Email
 * Usage: node test-elastic-email.js
 */

require('dotenv').config({ path: '.env.local' });

const ELASTICEMAIL_API_KEY = process.env.ELASTICEMAIL_API_KEY;

async function testElasticEmail() {
  console.log('\n🧪 Test Elastic Email API...\n');

  if (!ELASTICEMAIL_API_KEY) {
    console.error('❌ ELASTICEMAIL_API_KEY manquante dans .env.local');
    process.exit(1);
  }

  try {
    const response = await fetch('https://api.elasticemail.com/v2/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        apikey: ELASTICEMAIL_API_KEY,
        from: 'patrick.danto@habitat-intermediaire.fr',
        fromName: 'Patrick Danto - Test',
        to: 'patrick.danto@outlook.fr',
        subject: '🧪 Test Elastic Email - Habitat Intermédiaire',
        bodyHtml: `
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #2563eb;">✅ Test réussi !</h2>
              <p>Si vous recevez cet email, <strong>Elastic Email fonctionne parfaitement</strong>.</p>
              <hr style="margin: 20px 0;">
              <p style="color: #666; font-size: 14px;">
                Test envoyé depuis le script test-elastic-email.js<br>
                Configuration : habitat-intermediaire.fr
              </p>
            </body>
          </html>
        `,
        isTransactional: 'false'
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Email envoyé avec succès !');
      console.log('📧 TransactionID:', result.data.transactionid);
      console.log('📨 MessageID:', result.data.messageid);
      console.log('\n👉 Vérifiez votre boîte mail patrick.danto@outlook.fr');
      console.log('📊 Dashboard : https://elasticemail.com/reports\n');
    } else {
      console.error('❌ Erreur:', result.error || result);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

testElasticEmail();
