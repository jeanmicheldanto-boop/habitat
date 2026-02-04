// Edge Function pour envoyer des notifications par email via Elastic Email
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ELASTICEMAIL_API_KEY = Deno.env.get('ELASTICEMAIL_API_KEY')

interface NotificationPayload {
  email: string;
  name: string;
  type?: string;
  etablissement?: string;
  statut?: 'en_attente' | 'approuvee' | 'rejetee' | 'verifiee';
  action?: 'create' | 'update' | 'delete';
  review_note?: string;
  role?: string;
  etablissement_id?: string;
  reclamation_id?: string;
  statut_editorial?: string;
  old_statut?: string;
  note_moderation?: string;
}

serve(async (req) => {
  try {
    const payload: NotificationPayload = await req.json()
    const { email, name, type, etablissement, statut, action, review_note, role, note_moderation } = payload

    if (!ELASTICEMAIL_API_KEY) {
      throw new Error('Elastic Email API key missing')
    }

    // Templates d'email selon le type/statut
    const templates: Record<string, { subject: string; html: string }> = {
      // Email de bienvenue pour les nouveaux gestionnaires
      welcome: {
        subject: '👋 Bienvenue sur Habitat Intermédiaire',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #a85b2b;">👋 Bienvenue ${name} !</h2>
              <p>Votre compte gestionnaire a été créé avec succès.</p>
              <p>Vous pouvez maintenant :</p>
              <ul style="line-height: 2;">
                <li>📝 Créer de nouveaux établissements</li>
                <li>✏️ Modifier vos établissements existants</li>
                <li>🏢 Revendiquer la propriété d'établissements</li>
                <li>📊 Suivre vos demandes et réclamations</li>
              </ul>
              <p style="margin: 30px 0;">
                <a href="https://habitat-intermediaire.fr/gestionnaire/dashboard" 
                   style="background-color: #a85b2b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Accéder à mon espace
                </a>
              </p>
              <p style="background-color: #f0f9ff; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0;">
                <strong>📧 Important :</strong> Veuillez confirmer votre adresse email en cliquant sur le lien que nous vous avons envoyé.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="font-size: 0.9em; color: #666;">
                Cordialement,<br>
                L'équipe Habitat Intermédiaire
              </p>
            </div>
          </body>
          </html>
        `
      },
      
      // Confirmation de création d'établissement
      etablissement_created: {
        subject: '✅ Votre établissement a été créé',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2ecc71;">✅ Établissement créé avec succès</h2>
              <p>Bonjour ${name},</p>
              <p>Votre établissement <strong>${etablissement || 'sans nom'}</strong> a été créé.</p>
              <p>Votre demande est maintenant en attente de modération par notre équipe. Vous recevrez une notification dès qu'elle sera examinée.</p>
              <p style="margin: 30px 0;">
                <a href="https://habitat-intermediaire.fr/gestionnaire/etablissements" 
                   style="background-color: #a85b2b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Voir mes établissements
                </a>
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="font-size: 0.9em; color: #666;">
                Cordialement,<br>
                L'équipe Habitat Intermédiaire
              </p>
            </div>
          </body>
          </html>
        `
      },

      // Notification de modification d'établissement
      etablissement_updated: {
        subject: '🔄 Votre établissement a été modifié',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #3498db;">🔄 Modifications enregistrées</h2>
              <p>Bonjour ${name},</p>
              <p>Les modifications de votre établissement <strong>${etablissement || 'sans nom'}</strong> ont été enregistrées.</p>
              <p style="margin: 30px 0;">
                <a href="https://habitat-intermediaire.fr/gestionnaire/etablissements" 
                   style="background-color: #a85b2b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Voir l'établissement
                </a>
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="font-size: 0.9em; color: #666;">
                Cordialement,<br>
                L'équipe Habitat Intermédiaire
              </p>
            </div>
          </body>
          </html>
        `
      },

      // Confirmation de création de réclamation
      reclamation_created: {
        subject: '📝 Votre réclamation a été reçue',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #3498db;">📝 Réclamation reçue</h2>
              <p>Bonjour ${name},</p>
              <p>Nous avons bien reçu votre demande de propriété pour <strong>${etablissement || 'l\'établissement'}</strong>.</p>
              <p>Notre équipe va examiner votre réclamation et les justificatifs fournis. Vous recevrez une réponse sous 48 à 72 heures.</p>
              <p style="margin: 30px 0;">
                <a href="https://habitat-intermediaire.fr/gestionnaire/dashboard?tab=reclamations" 
                   style="background-color: #a85b2b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Suivre ma réclamation
                </a>
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="font-size: 0.9em; color: #666;">
                Cordialement,<br>
                L'équipe Habitat Intermédiaire
              </p>
            </div>
          </body>
          </html>
        `
      },

      // Changement de statut de réclamation
      reclamation_status_change: {
        subject: statut === 'verifiee' 
          ? '✅ Votre réclamation a été approuvée' 
          : '❌ Votre réclamation a été rejetée',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: ${statut === 'verifiee' ? '#2ecc71' : '#e74c3c'};">
                ${statut === 'verifiee' ? '✅ Réclamation approuvée' : '❌ Réclamation rejetée'}
              </h2>
              <p>Bonjour ${name},</p>
              ${statut === 'verifiee' ? `
                <p>Votre réclamation concernant <strong>${etablissement || 'l\'établissement'}</strong> a été approuvée !</p>
                <p>Vous êtes maintenant reconnu comme gestionnaire de cet établissement et pouvez le modifier depuis votre espace.</p>
              ` : `
                <p>Votre réclamation concernant <strong>${etablissement || 'l\'établissement'}</strong> n'a pas pu être approuvée.</p>
                ${note_moderation ? `
                  <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                    <strong>Motif :</strong> ${note_moderation}
                  </div>
                ` : ''}
                <p>Si vous pensez qu'il s'agit d'une erreur, vous pouvez soumettre une nouvelle réclamation avec des justificatifs supplémentaires.</p>
              `}
              <p style="margin: 30px 0;">
                <a href="https://habitat-intermediaire.fr/gestionnaire/dashboard" 
                   style="background-color: #a85b2b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Accéder à mon espace
                </a>
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="font-size: 0.9em; color: #666;">
                Cordialement,<br>
                L'équipe Habitat Intermédiaire
              </p>
            </div>
          </body>
          </html>
        `
      },

      approuvee: {
        subject: `✅ Votre ${action === 'create' ? 'création' : 'modification'} a été approuvée`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2ecc71;">✅ Bonne nouvelle !</h2>
              <p>Bonjour ${name},</p>
              <p>Votre demande concernant <strong>${etablissement}</strong> a été approuvée par notre équipe.</p>
              ${action === 'create' 
                ? '<p>L\'établissement est maintenant visible sur la plateforme.</p>' 
                : '<p>Les modifications ont été appliquées.</p>'
              }
              <p style="margin: 30px 0;">
                <a href="https://habitat-intermediaire.fr/gestionnaire/dashboard" 
                   style="background-color: #a85b2b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Voir mon tableau de bord
                </a>
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="font-size: 0.9em; color: #666;">
                Cordialement,<br>
                L'équipe Habitat Intermédiaire
              </p>
            </div>
          </body>
          </html>
        `
      },
      rejetee: {
        subject: `❌ Votre ${action === 'create' ? 'création' : 'modification'} a été refusée`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #e74c3c;">Demande refusée</h2>
              <p>Bonjour ${name},</p>
              <p>Votre demande concernant <strong>${etablissement}</strong> n'a pas pu être approuvée.</p>
              ${review_note ? `
                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                  <strong>Motif :</strong> ${review_note}
                </div>
              ` : ''}
              <p>Vous pouvez soumettre une nouvelle demande corrigée depuis votre tableau de bord.</p>
              <p style="margin: 30px 0;">
                <a href="https://habitat-intermediaire.fr/gestionnaire/dashboard" 
                   style="background-color: #a85b2b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Retour au tableau de bord
                </a>
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="font-size: 0.9em; color: #666;">
                Cordialement,<br>
                L'équipe Habitat Intermédiaire
              </p>
            </div>
          </body>
          </html>
        `
      },
      en_attente: {
        subject: `⏳ Votre demande est en cours d'examen`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #3498db;">Demande reçue</h2>
              <p>Bonjour ${name},</p>
              <p>Nous avons bien reçu votre demande concernant <strong>${etablissement}</strong>.</p>
              <p>Notre équipe l'examine et vous tiendra informé sous 48 heures.</p>
              <p style="margin: 30px 0;">
                <a href="https://habitat-intermediaire.fr/gestionnaire/dashboard" 
                   style="background-color: #a85b2b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Suivre ma demande
                </a>
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="font-size: 0.9em; color: #666;">
                Cordialement,<br>
                L'équipe Habitat Intermédiaire
              </p>
            </div>
          </body>
          </html>
        `
      }
    }

    // Déterminer le template à utiliser
    const templateKey = type || statut
    const template = templateKey ? templates[templateKey] : null
    
    if (!template) {
      throw new Error(`Unknown notification type/status: ${templateKey}`)
    }

    // Envoyer via Elastic Email
    const response = await fetch('https://api.elasticemail.com/v2/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        apikey: ELASTICEMAIL_API_KEY,
        from: 'patrick.danto@habitat-intermediaire.fr',
        fromName: 'Habitat Intermédiaire',
        to: email,
        subject: template.subject,
        bodyHtml: template.html
      }).toString()
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Elastic Email error:', result)
      throw new Error(`Elastic Email API error: ${response.status} - ${JSON.stringify(result)}`)
    }

    console.log('Email sent successfully:', result)

    return new Response(
      JSON.stringify({ success: true, messageId: result.data?.messageid || result.messageid }), 
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error sending notification:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }), 
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
