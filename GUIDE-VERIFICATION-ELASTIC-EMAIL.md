# 📧 Guide de Vérification des Notifications Elastic Email

## Vue d'ensemble

Votre système utilise **Elastic Email** pour envoyer les notifications automatiques via:
- **Triggers PostgreSQL** (détection des changements de statut)
- **Edge Function Supabase** (`send-notification`) qui appelle l'API Elastic Email

## Architecture

```
Changement de statut dans DB
    ↓
Trigger PostgreSQL (notify_proposition_status_change)
    ↓
Appel HTTP → Edge Function (/functions/v1/send-notification)
    ↓
API Elastic Email
    ↓
📧 Email envoyé
```

## ✅ Vérifications à faire

### 1. Vérifier la clé API Elastic Email dans Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Menu **Edge Functions** → **send-notification** → **Settings**
4. Vérifiez que le secret `ELASTICEMAIL_API_KEY` est configuré

**Comment obtenir/vérifier votre clé:**
- https://elasticemail.com/account#/settings/new/manage-api
- La clé doit avoir les permissions d'envoi d'emails

### 2. Vérifier que les triggers sont activés

**Dans Supabase SQL Editor**, exécutez:

```sql
-- Lister tous les triggers sur la table propositions
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'propositions'
  AND trigger_schema = 'public';
```

Vous devriez voir:
- **notification_trigger** ou **proposition_status_notification**
- Event: **UPDATE**
- Function: **notify_proposition_status_change()**

### 3. Vérifier que la fonction est présente

```sql
-- Vérifier la fonction trigger
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%notify%';
```

### 4. Vérifier l'Edge Function

1. Menu **Edge Functions** → **send-notification**
2. Onglet **Logs** pour voir les dernières exécutions
3. Vérifier qu'il n'y a pas d'erreurs

## 🧪 Test manuel

### Option 1: Via le script Node.js (Recommandé)

```bash
node test-notification-trigger.js
```

Ce script:
1. ✅ Trouve ou crée une proposition de test
2. ✅ Change le statut (en_attente → approuvee)
3. ✅ Déclenche le trigger automatiquement
4. ✅ Vérifie que tout fonctionne
5. ✅ Nettoie après le test

### Option 2: Via SQL directement

Dans **Supabase SQL Editor**:

```sql
-- 1. Trouver une proposition avec créateur authentifié
SELECT 
  id, 
  created_by, 
  statut,
  (SELECT email FROM profiles WHERE id = propositions.created_by) as email
FROM propositions
WHERE created_by IS NOT NULL
  AND statut = 'en_attente'
LIMIT 1;

-- 2. Copier l'ID et l'email, puis changer le statut
UPDATE propositions
SET 
  statut = 'approuvee',
  review_note = 'Test manuel notification'
WHERE id = 'COPIER_ID_ICI';

-- L'email devrait être envoyé automatiquement via le trigger
```

### Option 3: Via l'interface admin

1. Connectez-vous en tant qu'admin
2. Allez dans **Modération** ou **Propositions**
3. Approuvez ou rejetez une proposition
4. L'email devrait être envoyé automatiquement

## 📊 Vérifier que l'email a été envoyé

### Dans Elastic Email Dashboard

1. https://elasticemail.com/reports
2. Onglet **Logs** ou **Activity**
3. Recherchez l'email envoyé (filtrer par destinataire ou date)

**Statuts possibles:**
- ✅ **Delivered** - Email reçu avec succès
- ⏳ **Sent** - En cours d'acheminement
- ❌ **Bounced** - Adresse invalide
- ⚠️ **Spam** - Marqué comme spam

### Dans Supabase Logs

1. **Edge Functions** → **send-notification** → **Logs**
2. Regardez les dernières invocations
3. Vérifiez qu'il n'y a pas d'erreur

**Log successful typique:**
```
Email sent successfully: { success: true, messageId: "..." }
```

**Log d'erreur typique:**
```
Elastic Email API error: 401 - Invalid API key
```

## ❌ Problèmes courants

### 1. Aucun email reçu

**Causes possibles:**

1. **Clé API invalide ou manquante**
   - Vérifiez `ELASTICEMAIL_API_KEY` dans Edge Function secrets
   - Regénérez la clé si nécessaire sur elasticemail.com

2. **Trigger désactivé**
   ```sql
   -- Vérifier
   SELECT * FROM information_schema.triggers WHERE event_object_table = 'propositions';
   
   -- Réactiver si nécessaire
   -- Exécutez: supabase/add-notification-trigger.sql
   ```

3. **Email du créateur manquant**
   - Le trigger ne peut envoyer que si `created_by` existe ET a un email dans `profiles`
   - Les propositions publiques (`created_by = null`) ne reçoivent pas de notification

4. **Email marqué comme spam**
   - Vérifiez dans les SPAM du destinataire
   - Vérifiez le statut dans Elastic Email Dashboard

### 2. Erreur "401 Unauthorized"

➡️ La clé API Elastic Email n'est pas valide
- Allez sur https://elasticemail.com/account#/settings/new/manage-api
- Générez une nouvelle clé
- Mettez-la à jour dans Supabase Edge Function secrets

### 3. Erreur "Failed to send notification"

➡️ La fonction Edge ne peut pas être appelée
- Vérifiez que l'extension `http` est activée:
  ```sql
  CREATE EXTENSION IF NOT EXISTS http;
  ```
- Vérifiez l'URL de la fonction dans le trigger (ligne 43 du trigger SQL)

## 📝 Types de notifications envoyées

1. **welcome** - Email de bienvenue nouveau gestionnaire
2. **etablissement_created** - Confirmation création établissement
3. **etablissement_updated** - Notification modification établissement
4. **reclamation_created** - Confirmation réclamation propriété
5. **reclamation_status_change** - Changement statut réclamation
6. **approuvee** - Proposition approuvée
7. **rejetee** - Proposition rejetée
8. **en_attente** - Proposition en attente

## 🔧 Réinstaller le trigger si nécessaire

Si le trigger ne fonctionne pas, réexécutez dans **Supabase SQL Editor**:

```bash
# Fichier à exécuter
supabase/add-notification-trigger.sql
```

Ou directement:

```sql
-- Supprimer l'ancien
DROP TRIGGER IF EXISTS proposition_status_notification ON propositions;
DROP FUNCTION IF EXISTS notify_proposition_status_change();

-- Puis réexécuter le contenu de add-notification-trigger.sql
```

## 📞 Support

En cas de problème persistant:
1. Vérifiez les logs Supabase Edge Function
2. Vérifiez les rapports Elastic Email
3. Testez avec le script `test-notification-trigger.js`
4. Vérifiez que l'email de test n'est pas dans les SPAM

## ✅ Checklist finale

- [ ] Clé API Elastic Email configurée dans Supabase
- [ ] Trigger activé sur la table `propositions`
- [ ] Fonction `notify_proposition_status_change()` existe
- [ ] Edge Function `send-notification` déployée
- [ ] Extension `http` activée
- [ ] Test réussi avec `test-notification-trigger.js`
- [ ] Email de test reçu (vérifier SPAM aussi)
