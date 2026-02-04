/**
 * Script pour tester le formulaire opt-out localement
 * Usage: node test-opt-out-form.js
 */

const http = require('http');

// Configuration du test
const TEST_DATA = {
  nom_etablissement: 'Maison Patgen (TEST)',
  email_contact: 'patrick.danto@outlook.fr',
  nom_contact: 'Patrick Danto',
  telephone: '06 12 34 56 78',
  demande_type: 'retrait',
  message: `Ceci est un test du formulaire opt-out.

Je souhaite tester le retrait de mon établissement de la plateforme.

Merci de confirmer la bonne réception de ce message.`,
};

async function testOptOutForm() {
  console.log('\n🧪 TEST FORMULAIRE OPT-OUT\n');
  console.log('Données du test:');
  console.log(JSON.stringify(TEST_DATA, null, 2));
  console.log('\n');

  const postData = JSON.stringify(TEST_DATA);

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/opt-out',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`📡 Status: ${res.statusCode}`);
        console.log('📦 Réponse:');
        
        try {
          const response = JSON.parse(data);
          console.log(JSON.stringify(response, null, 2));

          if (res.statusCode === 200) {
            console.log('\n✅ Test réussi !');
            console.log('📧 Vérifiez votre boîte mail : patrick.danto@confidensia.fr');
          } else {
            console.log('\n❌ Test échoué');
          }
        } catch (error) {
          console.log(data);
        }

        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('\n❌ Erreur de connexion:');
      console.error('   Assurez-vous que le serveur Next.js est lancé:');
      console.error('   npm run dev');
      console.error('');
      console.error('Détails:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Vérifier que le serveur est accessible
async function checkServer() {
  return new Promise((resolve) => {
    const req = http.request(
      { hostname: 'localhost', port: 3000, method: 'HEAD' },
      () => {
        resolve(true);
      }
    );
    req.on('error', () => {
      resolve(false);
    });
    req.end();
  });
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('\n❌ Le serveur Next.js ne semble pas être lancé\n');
    console.log('Lancez-le avec: npm run dev\n');
    process.exit(1);
  }

  try {
    await testOptOutForm();
  } catch (error) {
    process.exit(1);
  }
}

main();
