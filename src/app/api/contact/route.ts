import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nom, prenom, email, sujet, message } = body;

    // Validation basique
    if (!nom || !email || !sujet || !message) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis.' },
        { status: 400 }
      );
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide.' },
        { status: 400 }
      );
    }

    // Protection anti-injection
    if (sujet.toLowerCase().includes('ignore') || 
        message.toLowerCase().includes('bcc:') ||
        message.toLowerCase().includes('cc:')) {
      return NextResponse.json(
        { error: 'Contenu suspect détecté.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELASTICEMAIL_API_KEY;
    if (!apiKey) {
      console.error('ELASTICEMAIL_API_KEY non configurée');
      return NextResponse.json(
        { error: 'Configuration serveur manquante.' },
        { status: 500 }
      );
    }

    // Formater l'email pour Elastic Email
    const emailData = {
      recipients: {
        to: ['patrick.danto@confidensia.fr']
      },
      content: {
        from: 'patrick.danto@habitat-intermediaire.fr',
        subject: `[Contact Site] ${sujet}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #d9876a; border-bottom: 2px solid #d9876a; padding-bottom: 10px;">
              Nouveau message de contact
            </h2>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Nom :</strong> ${nom} ${prenom || ''}</p>
              <p style="margin: 5px 0;"><strong>Email :</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Sujet :</strong> ${sujet}</p>
            </div>

            <div style="background: white; padding: 20px; border-left: 4px solid #d9876a; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Message :</h3>
              <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #888;">
              <p>Email envoyé depuis habitat-intermediaire.fr</p>
              <p>Pour répondre, utilisez directement l'adresse : ${email}</p>
            </div>
          </div>
        `,
        text: `
Nouveau message de contact

Nom : ${nom} ${prenom || ''}
Email : ${email}
Sujet : ${sujet}

Message :
${message}

---
Email envoyé depuis habitat-intermediaire.fr
Pour répondre : ${email}
        `
      }
    };

    // Envoi via Elastic Email API v4
    const response = await fetch('https://api.elasticemail.com/v4/emails/transactional', {
      method: 'POST',
      headers: {
        'X-ElasticEmail-ApiKey': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur Elastic Email:', response.status, errorText);
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi du message. Veuillez réessayer.' },
        { status: 500 }
      );
    }

    const result = await response.json();
    console.log('Email envoyé avec succès:', result);

    return NextResponse.json(
      { success: true, message: 'Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Erreur API contact:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer plus tard.' },
      { status: 500 }
    );
  }
}
