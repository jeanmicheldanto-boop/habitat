# Vérification Complète du Système de Notification

## 🔍 Votre situation
✅ L'approbation fonctionne (proposition disparaît de la liste)
❌ Aucun email reçu

## Checklist de vérification

### 1. Vérifier que le trigger est installé

**Dans Supabase SQL Editor**, exécutez:
```sql
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'propositions' 
AND trigger_name LIKE '%notification%';
```

**Résultat attendu:** Une ligne montrant le trigger `proposition_status_notification`

**Si vide:** Le trigger n'est PAS installé!
→ **Solution:** Exécutez le fichier `supabase/add-notification-trigger.sql` dans le SQL Editor

### 2. Vérifier l'extension HTTP

```sql
SELECT * FROM pg_extension WHERE extname = 'http';
```

**Si vide:** 
```sql
CREATE EXTENSION IF NOT EXISTS http;
```

### 3. Vérifier la clé API Elastic Email dans Supabase

1. https://supabase.com/dashboard → Votre projet
2. **Edge Functions** → **send-notification**
3. Onglet **Settings** ou **Secrets**
4. Vérifier que `ELASTICEMAIL_API_KEY` est configurée

**Comment obtenir la clé:**
- https://elasticemail.com/account#/settings/new/manage-api
- Créer une clé avec permissions d'envoi d'emails
- Copier la clé dans Supabase

### 4. Tester l'Edge Function manuellement

**Via curl (dans PowerShell):**
```powershell
$headers = @{
    "Authorization" = "Bearer VOTRE_SUPABASE_ANON_KEY"
    "Content-Type" = "application/json"
}

$body = @{
    email = "votre-email@test.com"
    name = "Test"
    type = "approuvee"
    etablissement = "Test"
    action = "create"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

### 5. Vérifier les logs de l'Edge Function

1. https://supabase.com/dashboard → Edge Functions
2. Cliquez sur **send-notification**
3. Onglet **Logs**
4. Regardez les dernières exécutions

**Logs possibles:**
- ✅ `Email sent successfully` → Tout va bien
- ❌ `401 Unauthorized` → Clé API invalide
- ❌ `Missing API key` → ELASTICEMAIL_API_KEY non configurée
- ❌ Aucun log → Le trigger n'appelle pas la fonction

### 6. Vérifier dans Elastic Email Dashboard

https://elasticemail.com/reports
- **Onglet Logs** ou **Activity**
- Filtrer par date/heure de votre test
- Vérifier si l'email apparaît (même en Failed)

## 🔧 Solutions aux problèmes courants

### Problème: Trigger non installé
```bash
# Exécutez dans Supabase SQL Editor:
supabase/add-notification-trigger.sql
```

### Problème: Clé API manquante
1. Allez sur https://elasticemail.com/account#/settings/new/manage-api
2. Créez une nouvelle clé API
3. Dans Supabase → Edge Functions → send-notification → Settings
4. Ajoutez le secret `ELASTICEMAIL_API_KEY` avec votre clé

### Problème: Extension http manquante
```sql
CREATE EXTENSION IF NOT EXISTS http;
```

### Problème: URL Edge Function incorrecte dans le trigger
Le trigger doit pointer vers:
```
https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification
```

Vérifiez dans `supabase/add-notification-trigger.sql` ligne ~43

## 🧪 Test rapide

**Script Node.js:** (déjà créé)
```bash
node test-notification-trigger.js
```

Ce script:
1. Change le statut d'une proposition
2. Déclenche le trigger
3. Vérifie que l'email part

## 📊 Diagnostic complet

Exécutez:
```bash
node check-latest-propositions-modifier.js
```

Pour voir toutes les propositions et leur statut.

## ✅ Validation finale

Pour confirmer que tout fonctionne:

1. **Créez une proposition de test** depuis l'interface gestionnaire
2. **Approuvez-la** depuis l'admin
3. **Vérifiez:**
   - La proposition disparaît de la liste ✅
   - Vous recevez un email ❓
   - L'email apparaît dans Elastic Email Dashboard ❓
   - Les logs Supabase montrent l'envoi ❓

Si l'email n'arrive toujours pas après avoir tout vérifié:
- Vérifiez vos **SPAM**
- Vérifiez que l'adresse email dans **profiles** est correcte
- Testez avec une autre adresse email

## 🆘 Besoin d'aide?

Partagez-moi:
1. Le résultat de la requête SQL de vérification du trigger
2. Les logs de l'Edge Function (dernières lignes)
3. Votre clé API Elastic Email est-elle bien configurée? (Oui/Non)
