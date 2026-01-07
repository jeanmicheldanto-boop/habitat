# Résumé des modifications - Système de notifications

## ✅ Problèmes résolus

### 1. Pas d'email lors de l'inscription
**Solution** : Ajout de `emailRedirectTo` dans le signup
- Fichier modifié : [src/app/gestionnaire/register/page.tsx](src/app/gestionnaire/register/page.tsx)
- Les gestionnaires reçoivent maintenant l'email de confirmation Supabase standard

### 2. Pas d'email lors de la création d'établissement
**Solution** : Nouveau trigger SQL `etablissement_creation_notification`
- Envoie un email de confirmation immédiate lors de la création
- Informe que la demande est en attente de modération

### 3. Pas d'email lors de la modification d'établissement
**Solution** : Nouveau trigger SQL `etablissement_update_notification`
- Notifie le propriétaire quand son établissement est modifié
- Ne se déclenche que pour les changements importants (nom, statut, adresse, commune)

### 4. Pas d'email lors de la réclamation de propriété
**Solution** : Nouveau trigger SQL `reclamation_creation_notification`
- Confirmation immédiate de réception de la réclamation
- Informe du délai de traitement (48-72h)

### 5. Gestion des propriétaires après approbation
**Solution** : Nouveau trigger SQL `add_owner_on_approval`
- Ajoute automatiquement l'utilisateur dans `etablissement_proprietaires`
- Donne l'accès à la modification de l'établissement

## 📁 Fichiers créés/modifiés

### Nouveaux fichiers
1. **supabase/fix-notifications-signup.sql** (NOUVEAU)
   - Script SQL complet avec tous les triggers
   - Fonctions pour chaque type de notification
   - Gestion automatique des propriétaires

2. **GUIDE-NOTIFICATIONS-COMPLET.md** (NOUVEAU)
   - Documentation complète du système
   - Instructions de déploiement
   - Tests et dépannage

### Fichiers modifiés
1. **src/app/gestionnaire/register/page.tsx**
   - Ajout de `emailRedirectTo` dans `signUp`

2. **supabase/functions/send-notification/index.ts**
   - Nouveaux templates d'emails :
     - `welcome` : Bienvenue gestionnaire
     - `etablissement_created` : Confirmation création
     - `etablissement_updated` : Notification modification
     - `reclamation_created` : Confirmation réclamation
     - `reclamation_status_change` : Changement statut réclamation
   - Interface étendue pour supporter tous les types

## 🚀 Prochaines étapes

### 1. Déployer la fonction Edge mise à jour

```powershell
cd c:\Users\Lenovo\habitat
supabase functions deploy send-notification
```

### 2. Exécuter le script SQL

**IMPORTANT** : Avant d'exécuter, dans `supabase/fix-notifications-signup.sql`, remplacer :
```
https://minwoumfgutampcgrcbr.supabase.co
```
Par votre vraie URL :
```
https://VOTRE-PROJET-REF.supabase.co
```

Puis dans l'éditeur SQL Supabase :
1. Ouvrir le fichier `fix-notifications-signup.sql`
2. Exécuter le script complet

### 3. Configurer Supabase Auth

Dans Supabase Dashboard → Authentication → URL Configuration :
1. **Site URL** : `https://votre-domaine.fr`
2. **Redirect URLs** : Ajouter `https://votre-domaine.fr/gestionnaire/dashboard`

### 4. Tests recommandés

```powershell
# Test 1 : Inscription
# Créer un compte sur /gestionnaire/register
# Vérifier réception email Supabase

# Test 2 : Création établissement (via SQL)
# Dans SQL Editor :
INSERT INTO etablissements (nom, commune, departement, created_by)
VALUES ('Test', 'Paris', '75', 'USER_ID')
RETURNING id;
# Vérifier email reçu

# Test 3 : Réclamation
# Via l'interface /gestionnaire/claim
# Vérifier email de confirmation
```

## 📊 Flux des notifications

```
┌─────────────────────────────────────────────────────────────┐
│                    Inscription Gestionnaire                 │
│  1. User remplit formulaire                                 │
│  2. supabase.auth.signUp() avec emailRedirectTo            │
│  3. Supabase envoie email de confirmation                   │
│  4. User clique lien → redirigé vers dashboard              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Création Établissement                     │
│  1. Gestionnaire crée établissement (via proposition)       │
│  2. Proposition insérée avec created_by                     │
│  3. Trigger SQL → appelle fonction Edge                     │
│  4. Fonction Edge → envoie email via Mailgun                │
│  5. Email "Établissement créé, en attente modération"       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Réclamation Propriété                       │
│  1. Gestionnaire soumet réclamation                         │
│  2. Insert dans reclamations_propriete                      │
│  3. Trigger creation → email "Réclamation reçue"            │
│  4. Admin approuve/rejette                                  │
│  5. Trigger status → email "Approuvée/Rejetée"              │
│  6. Si approuvée → Ajout auto dans proprietaires            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 Modification Établissement                   │
│  1. Établissement modifié (UPDATE)                          │
│  2. Trigger compare OLD vs NEW                              │
│  3. Si changements importants → email notification          │
│  4. Propriétaire informé des changements                    │
└─────────────────────────────────────────────────────────────┘
```

## 🔍 Vérification de la base de données

### Table etablissement_proprietaires

```sql
-- Vérifier la structure
\d etablissement_proprietaires

-- Devrait montrer :
-- etablissement_id | uuid | not null
-- user_id          | uuid | not null  
-- role             | text | default 'gestionnaire'
-- active           | boolean | default true

-- Vérifier les liens existants
SELECT 
  e.nom,
  p.email,
  ep.role,
  ep.active
FROM etablissement_proprietaires ep
JOIN etablissements e ON e.id = ep.etablissement_id
JOIN profiles p ON p.id = ep.user_id;
```

### Vérification des triggers

```sql
-- Lister tous les triggers de notification
SELECT 
  t.tgname as trigger_name,
  t.tgenabled as enabled,
  c.relname as table_name,
  p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE t.tgname LIKE '%notification%'
   OR t.tgname LIKE '%owner%'
ORDER BY c.relname, t.tgname;
```

## 📧 Types d'emails configurés

| Événement | Destinataire | Template | Trigger |
|-----------|--------------|----------|---------|
| Inscription | Nouveau gestionnaire | Supabase standard | Supabase Auth |
| Création établissement | Créateur | `etablissement_created` | `etablissement_creation_notification` |
| Modification établissement | Propriétaire | `etablissement_updated` | `etablissement_update_notification` |
| Nouvelle réclamation | Demandeur | `reclamation_created` | `reclamation_creation_notification` |
| Réclamation approuvée | Demandeur | `reclamation_status_change` | `reclamation_status_notification` |
| Réclamation rejetée | Demandeur | `reclamation_status_change` | `reclamation_status_notification` |
| Proposition approuvée | Créateur | `approuvee` | `proposition_status_notification` |
| Proposition rejetée | Créateur | `rejetee` | `proposition_status_notification` |

## ⚠️ Points d'attention

1. **URL du projet** : N'oubliez pas de remplacer l'URL dans le script SQL
2. **Mailgun** : Vérifiez que les secrets sont bien configurés
3. **SPF/DKIM** : Assurez-vous que votre domaine est vérifié dans Mailgun
4. **Tests** : Testez avec un vrai email avant de déployer en production
5. **Logs** : Surveillez les logs Mailgun et Supabase après déploiement

## 🎯 Avantages de cette solution

✅ **Automatique** : Tous les emails sont envoyés automatiquement via triggers SQL
✅ **Fiable** : Les erreurs d'email ne bloquent pas les transactions DB
✅ **Traçable** : Tags Mailgun permettent de suivre tous les envois
✅ **Extensible** : Facile d'ajouter de nouveaux types de notifications
✅ **Sécurisé** : Utilise SECURITY DEFINER et gère les permissions correctement
✅ **Performant** : Appels HTTP asynchrones, pas de blocage

---

Pour toute question, consultez [GUIDE-NOTIFICATIONS-COMPLET.md](GUIDE-NOTIFICATIONS-COMPLET.md)
