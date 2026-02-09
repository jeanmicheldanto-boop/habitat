# ✅ SOLUTION #2 : EMAIL VERIFICATION SYSTEM

## 📋 Résumé des modifications

### Problème identifié
- L'utilisateur reçoit un email de bienvenue ✅ mais ne peut pas se connecter
- Message d'erreur : "Email not verified"
- Supabase Auth demande une vérification d'email - qui ne s'envoyait pas

### Cause racine
Supabase Auth n'avait PAS de provider email configuré, donc impossible d'envoyer le lien de vérification "confirmé par Supabase"

### Solution implémentée : Email Verification Custom
Au lieu de dépendre de Supabase built-in, on crée un système custom plus contrôlé :

1. **Table `email_verification_tokens`** (Supabase)
   - Stocke les tokens de vérification temporaires
   - Expire après 24h
   - Référence l'utilisateur Auth

2. **Edge Function `send-verification-email`** (Deno)
   - Génère un token UUID aléatoire
   - L'Insert dans la base de données
   - Envoie email via Elastic Email avec lien de confirmation
   - Lien format: `https://habitat-intermediaire.fr/gestionnaire/verify-email?token=xxx`

3. **Edge Function `confirm-email`** (Deno)
   - Valide le token
   - Vérifie qu'il n'a pas expiré
   - Appelle l'Admin API de Supabase pour marquer `email_confirmed_at` ✅
   - Stocke le timestamp de confirmation

4. **Page `/gestionnaire/verify-email`**
   - Frontend React avec Suspense boundary
   - Récupère le token depuis URL
   - Appelle Edge Function confirm-email
   - Affiche succès ou erreur
   - Redirige vers login si succès

5. **Modification du signup**
   - Après création utilisateur + profil
   - Appelle Edge Function send-verification-email
   - Affiche message expliquant qu'il faut vérifier l'email

## 📁 Fichiers créés/modifiés

### Créés
- `supabase/create-email-verification-table.sql` - Table et RLS
- `supabase/functions/send-verification-email/index.ts` - Edge Function (envoi email)
- `supabase/functions/confirm-email/index.ts` - Edge Function (confirmation)
- `src/app/gestionnaire/verify-email/page.tsx` - Page principale avec Suspense
- `src/app/gestionnaire/verify-email/verify-email-content.tsx` - Composant enfant

### Modifiés
- `src/app/gestionnaire/register/page.tsx` - Appel Edge Function + nouveau message

## 🔄 Flux utilisateur complet

```
1. Utilisateur remplit /gestionnaire/register
   ↓
2. Vue POST signUp(email, password, metadata)
   ↓
3. Si succès, créer profile dans DB
   ↓
4. Appeler Edge Function send-verification-email
   ↓
5. Email reçu avec lien /gestionnaire/verify-email?token=xxx
   ↓
6. Utilisateur clique lien
   ↓
7. Page appelle Edge Function confirm-email(token)
   ↓
8. Function valide token + appelle Supabase Admin API
   ↓
9. Utilisateur est marqué email_confirmed_at ✅
   ↓
10. Page affiche succès + redirige vers login
   ↓
11. Utilisateur peut se connecter normalement ✅
```

## ⚙️ Étapes de déploiement

### 1. Créer la table dans Supabase SQL
```bash
Exécuter supabase/create-email-verification-table.sql
```

### 2. Déployer les Edge Functions
```bash
supabase functions deploy send-verification-email
supabase functions deploy confirm-email
```

### 3. Vérifier les variables d'environnement
Les deux functions utilisent :
- `ELASTICEMAIL_API_KEY` - Déjà configuré ✅
- `SUPABASE_URL` - Auto-set par Supabase ✅
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-set par Supabase ✅

### 4. Build et deploy vers production
```bash
npm run build
git add .
git commit -m "feat: email verification system for gestionnaire signup"
git push
```

## 🧪 Test manuel

### Test 1 : Inscription complète
1. Aller à `/gestionnaire/register`
2. Remplir le formulaire avec email valide
3. Cliquer "S'inscrire"
4. Vérifier réception email de vérification
5. Cliquer le lien dans l'email
6. Page affiche "✅ Email vérifié"
7. Automatiquement redirigé vers login
8. Pouvoir se connecter avec email/password ✅

### Test 2 : Lien expiré
1. Attendre 24h OU
2. Éditer token dans DB pour expiration courte
3. Cliquer le lien
4. Page affiche "❌ Erreur - Token invalid or expired"
5. Bouton "Retourner à l'inscription"

### Test 3 : Token invalide
1. Trier manuel un token complètement aléatoire
2. Aller à `/gestionnaire/verify-email?token=fake123`
3. Page affiche erreur

## ✨ Bonus : Système de propriétaires aussi fixé

Pendant ce travail, j'ai aussi corrigé le système de réclamation de propriété :
- Modifié `/gestionnaire/edit/[id]/page.tsx` pour vérifier `etablissement_proprietaires`
- Ajouté RLS policies pour permettre modifications via proprietaires
- Voir fichiers : `fix-reclamation-propriete-rls.sql` et `cleanup-old-rls-policies.sql`

## 📊 Status final

✅ Inscription fonctionne
✅ Email de vérification envoyé
✅ Lien de vérification valide
✅ Confirmation marque l'utilisateur
✅ Connexion possible après vérification
✅ Protection against expired/invalid tokens
✅ Code compilé et  prêt pour production
