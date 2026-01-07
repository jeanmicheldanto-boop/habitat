# Guide de configuration Resend pour Supabase

## 1. Configurer le secret Resend dans Supabase

Ouvrez un terminal PowerShell dans le dossier du projet et exécutez :

```powershell
# Se connecter à Supabase (si pas déjà fait)
supabase login

# Lier votre projet
supabase link --project-ref minwoumfgutampcgrcbr

# Créer le secret RESEND_API_KEY
supabase secrets set RESEND_API_KEY=re_BuTH23CZ_DDZQ6VrbXHMkxYCchGuFp9RL
```

## 2. Déployer la fonction mise à jour

```powershell
# Déployer la fonction send-notification avec Resend
supabase functions deploy send-notification
```

## 3. Tester l'envoi d'email

Vous pouvez tester avec curl ou depuis le SQL Editor de Supabase :

```sql
-- Test d'envoi d'email de bienvenue
SELECT
  net.http_post(
    url:='https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('request.jwt.claims', true)::json->>'token' || '"}'::jsonb,
    body:=jsonb_build_object(
      'email', 'votre-email@exemple.com',
      'name', 'Test User',
      'type', 'welcome'
    )
  ) as request_id;
```

## 4. Vérifier la configuration dans Resend

1. Connectez-vous à https://resend.com/domains
2. Vérifiez que `habitat-intermediaire.fr` est bien vérifié
3. Vérifiez que les enregistrements DNS sont corrects :
   - SPF
   - DKIM
   - Return-Path (bounce)

## 5. Vérifier les emails envoyés

- Dashboard Resend : https://resend.com/emails
- Vous verrez tous les emails envoyés avec leur statut (delivered, bounced, etc.)

## Avantages de Resend vs Mailgun

✅ API plus simple et moderne
✅ Interface plus claire
✅ Meilleure délivrabilité
✅ Pricing plus avantageux (3000 emails/mois gratuits)
✅ Support React Email pour templates
✅ Webhooks plus faciles à configurer

## En cas d'erreur

Si vous voyez une erreur lors du déploiement :

1. Vérifiez que le secret est bien défini :
   ```powershell
   supabase secrets list
   ```

2. Vérifiez les logs de la fonction :
   ```powershell
   supabase functions logs send-notification
   ```

3. Testez directement via l'API Resend pour vérifier la clé :
   ```powershell
   curl -X POST https://api.resend.com/emails `
     -H "Authorization: Bearer re_BuTH23CZ_DDZQ6VrbXHMkxYCchGuFp9RL" `
     -H "Content-Type: application/json" `
     -d '{
       "from": "Habitat Intermédiaire <notifications@habitat-intermediaire.fr>",
       "to": ["votre-email@exemple.com"],
       "subject": "Test",
       "html": "<p>Test email</p>"
     }'
   ```
