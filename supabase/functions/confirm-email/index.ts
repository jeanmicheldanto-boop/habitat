// Edge Function: Confirmer l'email avec le token
// Appelée depuis /gestionnaire/verify-email?token=xxx
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface ConfirmPayload {
  token: string
}

serve(async (req) => {
  try {
    // Seulement POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
    }

    const { token }: ConfirmPayload = await req.json()

    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing token' }), { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Chercher le token valide et non expiré
    const { data: verificationData, error: fetchError } = await supabase
      .from('email_verification_tokens')
      .select('user_id, email')
      .eq('token', token)
      .is('verified_at', null)  // Pas encore vérifié
      .gt('expires_at', 'now()')  // Pas expiré
      .single()

    if (fetchError || !verificationData) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 400 }
      )
    }

    // 2. Marquer comme vérifié dans email_verification_tokens
    const { error: updateTokenError } = await supabase
      .from('email_verification_tokens')
      .update({ verified_at: new Date().toISOString() })
      .eq('token', token)

    if (updateTokenError) {
      console.error('Error updating token:', updateTokenError)
      return new Response(
        JSON.stringify({ error: 'Failed to confirm email' }),
        { status: 500 }
      )
    }

    // 3. Marquer l'utilisateur comme email confirmé dans auth.users
    // Utiliser l'Admin API de Supabase
    const adminApi = `${SUPABASE_URL}/auth/v1/admin/users/${verificationData.user_id}`
    
    const updateResponse = await fetch(adminApi, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email_confirm: true
      })
    })

    if (!updateResponse.ok) {
      console.error('Error confirming email in auth.users:', await updateResponse.text())
      return new Response(
        JSON.stringify({ error: 'Failed to confirm email in auth system' }),
        { status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email verified successfully',
        userId: verificationData.user_id
      }),
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
