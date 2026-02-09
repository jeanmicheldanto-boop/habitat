-- ====================================================================
-- TABLE POUR LES TOKENS DE VÉRIFICATION D'EMAIL
-- ====================================================================

CREATE TABLE public.email_verification_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Index pour recherche rapide par token
CREATE INDEX idx_email_verification_tokens_token ON public.email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_user_id ON public.email_verification_tokens(user_id);

-- Activer RLS
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Permettre aux utilisateurs de voir leurs propres tokens (pas necessary mais pour la sécurité)
CREATE POLICY "users_view_own_tokens" ON public.email_verification_tokens
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Service role et public peuvent insérer (pour la function)
CREATE POLICY "allow_token_insert" ON public.email_verification_tokens
  FOR INSERT TO authenticated, anon, service_role
  WITH CHECK (true);

-- Service role peut mettre à jour (pour marquer comme vérifié)
CREATE POLICY "allow_token_update" ON public.email_verification_tokens
  FOR UPDATE TO service_role
  USING (true)
  WITH CHECK (true);
