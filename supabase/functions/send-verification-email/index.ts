// Edge Function: Envoyer l'email de vérification
// Déclenché au moment du signup via trigger SQL
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const ELASTICEMAIL_API_KEY = Deno.env.get('ELASTICEMAIL_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface VerificationPayload {
  userId: string
  email: string
  userName?: string
  userPrenom?: string
}

serve(async (req) => {
  try {
    // Seulement POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
    }

    const { userId, email, userName = '', userPrenom = '' }: VerificationPayload = await req.json()

    if (!userId || !email) {
      return new Response(JSON.stringify({ error: 'Missing userId or email' }), { status: 400 })
    }

    // Créer un token aléatoire
    const tokenBuffer = crypto.getRandomValues(new Uint8Array(32))
    const token = Array.from(tokenBuffer)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Insérer le token dans la base de données
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { error: insertError } = await supabase
      .from('email_verification_tokens')
      .insert({
        user_id: userId,
        email: email,
        token: token
      })

    if (insertError) {
      console.error('Error inserting token:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create verification token' }),
        { status: 500 }
      )
    }

    // Créer le lien de vérification
    const verificationUrl = `https://habitat-intermediaire.fr/gestionnaire/verify-email?token=${token}`

    // Préparer l'email
    const emailBody = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #667eea; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
      .content { background-color: #f9f9f9; padding: 20px; }
      .button { display: inline-block; background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      .footer { background-color: #f0f0f0; padding: 10px; font-size: 12px; text-align: center; color: #666; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Vérifiez votre adresse email</h1>
      </div>
      <div class="content">
        <p>Bonjour ${userPrenom || userName || 'Gestionnaire'},</p>
        <p>Bienvenue sur <strong>Habitat Intermédiaire</strong> ! 🏠</p>
        <p>Pour activer votre compte et accéder à votre espace de gestion, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
        
        <center>
          <a href="${verificationUrl}" class="button">Vérifier mon email</a>
        </center>

        <p style="color: #666; font-size: 14px;">
          <strong>Ou copiez ce lien dans votre navigateur :</strong><br/>
          <code>${verificationUrl}</code>
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
          Ce lien expire dans 24 heures. Si vous n'avez pas demandé cet email, ignorez-le.
        </p>
      </div>
      <div class="footer">
        <p>&copy; 2026 Carrefour des Solutions de Habitat Intermédiaire. Tous droits réservés.</p>
      </div>
    </div>
  </body>
</html>
`

    // Envoyer via Elastic Email
    const formData = new FormData()
    formData.append('apikey', ELASTICEMAIL_API_KEY)
    formData.append('from', 'noreply@habitat-intermediaire.fr')
    formData.append('fromName', 'Habitat Intermédiaire')
    formData.append('to', email)
    formData.append('subject', 'Vérifiez votre adresse email')
    formData.append('bodyHtml', emailBody)
    formData.append('isTransactional', 'true')

    const emailResponse = await fetch('https://api.elasticemail.com/v2/email/send', {
      method: 'POST',
      body: formData
    })

    if (!emailResponse.ok) {
      console.error('Error sending email:', await emailResponse.text())
      return new Response(
        JSON.stringify({ error: 'Failed to send verification email' }),
        { status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Verification email sent' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
