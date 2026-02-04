import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom_etablissement, email_contact, nom_contact, telephone, demande_type, message } = body;

    // Validation basique
    if (!nom_etablissement || !email_contact || !nom_contact || !demande_type || !message) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_contact)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    // Mapper les types de demande
    const demandeLabels: Record<string, string> = {
      retrait: '❌ Retrait de la plateforme',
      acces: '📋 Accès aux données',
      rectification: '✏️ Rectification de données',
      completion: '➕ Complétion de fiche',
      autre: '❓ Autre demande',
    };

    const demandeLabel = demandeLabels[demande_type] || demande_type;

    // Construire l'email à envoyer
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .field { margin-bottom: 20px; }
    .field-label { font-weight: bold; color: #1f2937; margin-bottom: 5px; }
    .field-value { background-color: white; padding: 10px; border-left: 3px solid #2563eb; }
    .footer { background-color: #1f2937; color: #9ca3af; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">🔔 Nouvelle demande RGPD</h1>
      <p style="margin: 5px 0 0; opacity: 0.9;">habitat-intermediaire.fr</p>
    </div>
    
    <div class="content">
      <div class="field">
        <div class="field-label">Type de demande :</div>
        <div class="field-value" style="font-size: 18px; font-weight: bold; color: #2563eb;">
          ${demandeLabel}
        </div>
      </div>

      <div class="field">
        <div class="field-label">📍 Établissement concerné :</div>
        <div class="field-value">${nom_etablissement}</div>
      </div>

      <div class="field">
        <div class="field-label">👤 Contact :</div>
        <div class="field-value">
          <strong>${nom_contact}</strong><br>
          Email : <a href="mailto:${email_contact}">${email_contact}</a><br>
          ${telephone ? `Téléphone : ${telephone}` : 'Pas de téléphone fourni'}
        </div>
      </div>

      <div class="field">
        <div class="field-label">💬 Message :</div>
        <div class="field-value" style="white-space: pre-wrap;">${message}</div>
      </div>

      <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          <strong>⏰ Action requise :</strong> Cette demande doit être traitée sous 48h ouvrées conformément au RGPD.
        </p>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0;">Formulaire opt-out habitat-intermediaire.fr</p>
      <p style="margin: 5px 0 0;">Reçu le ${new Date().toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const emailText = `
NOUVELLE DEMANDE RGPD - habitat-intermediaire.fr

Type de demande : ${demandeLabel}
Établissement : ${nom_etablissement}

Contact :
- Nom : ${nom_contact}
- Email : ${email_contact}
${telephone ? `- Téléphone : ${telephone}` : ''}

Message :
${message}

---
Reçu le ${new Date().toLocaleString('fr-FR')}
    `.trim();

    // Envoyer l'email via Elastic Email
    if (!process.env.ELASTICEMAIL_API_KEY) {
      console.error('⚠️  Configuration Elastic Email manquante - Email non envoyé');
      console.log('Demande reçue:', { nom_etablissement, nom_contact, email_contact, demande_type });
      
      // En développement, renvoyer success quand même
      return NextResponse.json({ 
        success: true, 
        message: 'Demande enregistrée (mode développement - email non envoyé)' 
      });
    }

    const response = await fetch('https://api.elasticemail.com/v2/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        apikey: process.env.ELASTICEMAIL_API_KEY,
        from: 'patrick.danto@habitat-intermediaire.fr',
        fromName: 'Opt-out Habitat Intermédiaire',
        to: 'patrick.danto@confidensia.fr',
        replyTo: email_contact,
        subject: `[RGPD] ${demandeLabel} - ${nom_etablissement}`,
        bodyHtml: emailHtml,
        bodyText: emailText
      }).toString()
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Erreur Elastic Email:', result);
      throw new Error(`Elastic Email API error: ${response.status}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Demande envoyée avec succès' 
    });

  } catch (error) {
    console.error('Erreur API opt-out:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'envoi' },
      { status: 500 }
    );
  }
}
