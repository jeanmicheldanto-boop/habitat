# Configuration des Notifications Email

Ce guide explique comment configurer les notifications automatiques et les campagnes email.

## 📋 Prérequis

1. Compte Mailgun actif
2. Domaine vérifié dans Mailgun
3. Accès à la console Supabase

## 🔧 Configuration Mailgun

### 1. Obtenir vos clés API

1. Aller sur https://app.mailgun.com/
2. Settings → API Keys
3. Copier votre "Private API key"

### 2. Configurer votre domaine

Option A: Utiliser un sous-domaine (recommandé)
- Créer `mg.habitat-intermediaire.fr` dans Mailgun
- Ajouter les enregistrements DNS fournis

Option B: Utiliser le domaine principal
- Configurer `habitat-intermediaire.fr` directement

### 3. Vérifier SPF/DKIM

Dans Mailgun → Sending → Domains → Vérifier que les icônes sont vertes ✅

## 🚀 Déploiement des Notifications Automatiques

### Étape 1: Configurer les variables d'environnement

Dans Supabase → Project Settings → Edge Functions → Secrets:

```bash
MAILGUN_API_KEY=votre_cle_api_mailgun
MAILGUN_DOMAIN=mg.habitat-intermediaire.fr
```

### Étape 2: Déployer la fonction Edge

```bash
# Installer Supabase CLI si pas déjà fait
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref votre-ref-projet

# Déployer la fonction
supabase functions deploy send-notification
```

### Étape 3: Créer le trigger SQL

1. Aller dans Supabase → SQL Editor
2. Ouvrir le fichier `supabase/add-notification-trigger.sql`
3. **IMPORTANT**: Remplacer `votre-projet-ref` par votre vraie référence projet (ligne 46)
4. Exécuter le script

### Étape 4: Tester

```sql
-- Dans SQL Editor, tester avec une proposition existante
UPDATE propositions 
SET statut = 'approuvee' 
WHERE id = 'un-id-de-test';

-- Vérifier dans Mailgun → Logs que l'email a été envoyé
```

## 📧 Utilisation du Script de Campagne

### Installation des dépendances

```bash
npm install form-data mailgun.js dotenv
```

### Configuration

1. Ajouter dans `.env.local`:

```env
MAILGUN_API_KEY=votre_cle_api
MAILGUN_DOMAIN=mg.habitat-intermediaire.fr
```

2. Éditer `send-campaign.js`:
   - Ligne 37: Modifier `testEmails` avec votre email
   - Ligne 43-45: Personnaliser le sujet et l'expéditeur
   - Ligne 46: `testMode: true` pour tester, `false` pour envoyer vraiment

### Test de la campagne

```bash
# Mode test (envoie seulement aux emails de test)
node send-campaign.js
```

### Envoi en production

1. Modifier `testMode: false` dans le script
2. Exécuter:

```bash
node send-campaign.js
# Attend 5 secondes pour confirmation
# Ctrl+C pour annuler
```

## 📊 Suivi des emails

### Mailgun Dashboard

- Voir les statistiques: https://app.mailgun.com/
- Logs → Voir tous les emails envoyés
- Analytics → Taux d'ouverture, clics, etc.

### Webhooks (optionnel)

Pour recevoir les événements (ouvertures, clics, etc.):

1. Mailgun → Webhooks
2. Ajouter: `https://votre-projet.supabase.co/functions/v1/mailgun-webhook`
3. Créer la fonction correspondante si besoin

## ⚠️ Checklist avant envoi en production

- [ ] Domaine vérifié dans Mailgun (SPF + DKIM verts)
- [ ] Email de test envoyé et reçu correctement
- [ ] Lien de désabonnement présent (`%unsubscribe_url%`)
- [ ] Template HTML testé sur différents clients (Gmail, Outlook, etc.)
- [ ] Mode test désactivé (`testMode: false`)
- [ ] Heure d'envoi optimale (mardi-jeudi 10h-15h)

## 🐛 Dépannage

### Les emails n'arrivent pas

1. Vérifier les logs Mailgun (Sending → Logs)
2. Vérifier le dossier spam
3. Tester avec un autre email
4. Vérifier SPF/DKIM

### Erreur "Invalid API key"

- Vérifier que la clé est bien copiée (sans espaces)
- Régénérer une nouvelle clé dans Mailgun

### Fonction Edge ne se déclenche pas

```sql
-- Vérifier que le trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'proposition_status_notification';

-- Voir les logs de la fonction
SELECT * FROM extensions WHERE name = 'http';
```

## 📝 Templates disponibles

Les emails sont envoyés automatiquement pour:

- ✅ **Statut "en_attente"**: Confirmation de réception
- ✅ **Statut "approuvee"**: Demande approuvée
- ❌ **Statut "rejetee"**: Demande refusée (avec motif)

Personnalisez les templates dans `supabase/functions/send-notification/index.ts`

## 🔒 Sécurité

- ✅ Les clés API sont stockées dans les secrets Supabase (chiffrés)
- ✅ La fonction Edge s'exécute côté serveur (pas d'exposition au client)
- ✅ Le trigger SQL utilise `SECURITY DEFINER` pour les permissions
- ✅ Gestion d'erreurs: si l'email échoue, la transaction DB n'est pas bloquée

## 💡 Améliorations futures

- [ ] Templates dynamiques selon le type d'établissement
- [ ] Envoi de rappels (7 jours sans réponse)
- [ ] Statistiques d'engagement dans un dashboard
- [ ] A/B testing des sujets d'emails
