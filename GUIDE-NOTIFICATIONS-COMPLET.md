# Guide de Configuration - Emails de Notifications pour Gestionnaires

## 📋 Vue d'ensemble des notifications

Votre système envoie maintenant des emails automatiques pour :

### 1. **Inscription d'un gestionnaire** ✅
- **Quand** : Lors de la création d'un compte gestionnaire
- **Email** : Confirmation d'inscription avec lien de vérification
- **Statut** : ✅ Configuré (côté client dans register page)

### 2. **Création d'établissement** 📝
- **Quand** : Quand un gestionnaire crée un nouvel établissement
- **Email** : Confirmation de création et information sur la modération
- **Statut** : ⚠️ Nécessite déploiement SQL

### 3. **Modification d'établissement** 🔄
- **Quand** : Quand un établissement est modifié
- **Email** : Confirmation des modifications
- **Statut** : ⚠️ Nécessite déploiement SQL

### 4. **Réclamation de propriété** 🏢
- **Quand** : Un gestionnaire revendique un établissement
- **Email** : Confirmation de réception de la réclamation
- **Statut** : ⚠️ Nécessite déploiement SQL

### 5. **Approbation/Rejet de réclamation** ✅/❌
- **Quand** : L'admin approuve ou rejette une réclamation
- **Email** : Notification du résultat avec accès automatique à l'établissement si approuvé
- **Statut** : ⚠️ Nécessite déploiement SQL

### 6. **Changement de statut de proposition** (existant)
- **Quand** : Une proposition est approuvée/rejetée
- **Email** : Notification du changement de statut
- **Statut** : ✅ Déjà configuré

## 🚀 Installation

### Étape 1 : Vérifier la configuration Mailgun

Assurez-vous que vos variables d'environnement sont configurées dans Supabase :

```bash
# Dans Supabase → Settings → Edge Functions → Secrets
MAILGUN_API_KEY=votre_cle_api
MAILGUN_DOMAIN=mg.habitat-intermediaire.fr (ou votre domaine)
```

### Étape 2 : Déployer la fonction Edge mise à jour

```powershell
# Redéployer la fonction avec les nouveaux templates
cd c:\Users\Lenovo\habitat
supabase functions deploy send-notification
```

### Étape 3 : Exécuter le script SQL

Dans l'éditeur SQL de Supabase, exécutez le fichier :

```sql
-- Fichier: supabase/fix-notifications-signup.sql
```

**⚠️ IMPORTANT** : Avant d'exécuter, remplacez dans le fichier SQL toutes les occurrences de :
```
https://minwoumfgutampcgrcbr.supabase.co
```
Par votre vraie URL projet :
```
https://VOTRE-PROJET-REF.supabase.co
```

### Étape 4 : Activer l'email de confirmation Supabase

Dans Supabase → Authentication → Settings :

1. **Email Templates** : Personnalisez le template "Confirm signup"
2. **Redirect URLs** : Ajoutez `https://votre-domaine.fr/gestionnaire/dashboard`
3. **Site URL** : Configurez votre URL de production

## 🔍 Vérification des déploiements

### Test 1 : Inscription gestionnaire

```powershell
# Tester l'inscription d'un nouveau gestionnaire
# Aller sur /gestionnaire/register
# Créer un compte de test
# Vérifier la réception de l'email de confirmation Supabase
```

### Test 2 : Création d'établissement

```sql
-- Dans SQL Editor, vérifier que le trigger existe
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'etablissement_creation_notification';

-- Test d'insertion (remplacer USER_ID par un vrai ID)
INSERT INTO etablissements (nom, commune, departement, created_by)
VALUES ('Test Établissement', 'Paris', '75', 'USER_ID')
RETURNING id;

-- Vérifier les logs Mailgun pour voir si l'email est envoyé
```

### Test 3 : Réclamation de propriété

```sql
-- Vérifier que les triggers existent
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname LIKE '%reclamation%';

-- Test d'insertion réclamation
INSERT INTO reclamations_propriete (etablissement_id, user_id, commentaire)
VALUES ('ETAB_ID', 'USER_ID', 'Test de réclamation')
RETURNING id;
```

## 📊 Suivi des emails

### Dans Mailgun Dashboard

1. Aller sur https://app.mailgun.com/
2. **Sending → Logs** : Voir tous les emails envoyés
3. **Analytics** : Statistiques d'ouverture et de clics

### Types d'emails envoyés

| Type | Tag Mailgun | Description |
|------|-------------|-------------|
| `welcome` | type-welcome | Email de bienvenue gestionnaire |
| `etablissement_created` | type-etablissement_created | Confirmation création établissement |
| `etablissement_updated` | type-etablissement_updated | Notification modification |
| `reclamation_created` | type-reclamation_created | Confirmation réclamation |
| `reclamation_status_change` | type-reclamation_status_change | Changement statut réclamation |
| `approuvee` | statut-approuvee | Proposition approuvée |
| `rejetee` | statut-rejetee | Proposition rejetée |
| `en_attente` | statut-en_attente | Proposition en attente |

## 🔧 Gestion des propriétaires/gestionnaires

### Table `etablissement_proprietaires`

Cette table lie les gestionnaires aux établissements :

```sql
-- Structure
CREATE TABLE etablissement_proprietaires (
    etablissement_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'gestionnaire',
    active boolean DEFAULT true,
    PRIMARY KEY (etablissement_id, user_id)
);
```

### Ajout automatique après approbation

Lorsqu'une réclamation est approuvée (`statut = 'verifiee'`), le gestionnaire est automatiquement ajouté :

```sql
-- Trigger : add_owner_on_approval
-- Fonction : add_owner_after_reclamation_approval()
```

### Vérifier les propriétaires d'un établissement

```sql
-- Liste des propriétaires/gestionnaires
SELECT 
  e.nom as etablissement,
  p.email,
  p.nom,
  p.prenom,
  ep.role,
  ep.active
FROM etablissement_proprietaires ep
JOIN etablissements e ON e.id = ep.etablissement_id
JOIN profiles p ON p.id = ep.user_id
WHERE ep.active = true
ORDER BY e.nom;
```

### Ajouter manuellement un gestionnaire

```sql
-- Ajouter un gestionnaire à un établissement
INSERT INTO etablissement_proprietaires (etablissement_id, user_id, role)
VALUES ('ETABLISSEMENT_ID', 'USER_ID', 'gestionnaire')
ON CONFLICT (etablissement_id, user_id) 
DO UPDATE SET active = true;
```

## 🐛 Dépannage

### Problème : Les emails ne sont pas envoyés

1. **Vérifier les logs de la fonction Edge**
```powershell
supabase functions logs send-notification --project-ref VOTRE_REF
```

2. **Vérifier que les triggers sont activés**
```sql
SELECT tgname, tgenabled, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname LIKE '%notification%';
```

3. **Vérifier les secrets Mailgun**
```sql
-- Ne devrait PAS retourner de résultat (les secrets sont masqués)
-- Mais confirme qu'ils existent
SELECT name FROM pg_catalog.pg_settings 
WHERE name LIKE '%mailgun%';
```

### Problème : L'URL de redirection ne fonctionne pas

Dans [register\page.tsx](src/app/gestionnaire/register/page.tsx), vérifiez :
```typescript
emailRedirectTo: `${window.location.origin}/gestionnaire/dashboard`
```

### Problème : Les gestionnaires n'ont pas accès aux établissements

1. **Vérifier les RLS policies**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'etablissement_proprietaires';
```

2. **Vérifier que l'utilisateur est lié**
```sql
SELECT * FROM etablissement_proprietaires 
WHERE user_id = 'USER_ID' AND active = true;
```

## 📝 Personnalisation des templates

Les templates d'emails se trouvent dans :
```
supabase/functions/send-notification/index.ts
```

Pour modifier un template :

1. Éditer le fichier `index.ts`
2. Modifier le template souhaité dans l'objet `templates`
3. Redéployer la fonction :
```powershell
supabase functions deploy send-notification
```

### Exemple de personnalisation

```typescript
etablissement_created: {
  subject: '🎉 Votre établissement est en cours de validation',
  html: `
    <!-- Votre HTML personnalisé -->
  `
}
```

## ✅ Checklist de déploiement

- [ ] Variables Mailgun configurées dans Supabase
- [ ] Fonction Edge `send-notification` déployée avec nouveaux templates
- [ ] Script SQL `fix-notifications-signup.sql` exécuté (avec bonne URL projet)
- [ ] URL de redirection configurée dans Authentication Settings
- [ ] Tests effectués pour chaque type de notification
- [ ] Logs Mailgun vérifiés
- [ ] Documentation mise à jour avec votre domaine

## 🔒 Sécurité et Performance

### Gestion d'erreurs

Tous les triggers utilisent `EXCEPTION WHEN OTHERS` pour ne pas bloquer les transactions principales si l'envoi d'email échoue.

### Permissions

Les fonctions utilisent `SECURITY DEFINER` pour exécuter avec les permissions nécessaires.

### Async

Les appels HTTP vers Mailgun sont non-bloquants grâce à l'utilisation de `PERFORM http_post()`.

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs Supabase
2. Vérifiez les logs Mailgun
3. Testez avec un email de test
4. Vérifiez que SPF/DKIM sont configurés

---

**Dernière mise à jour** : 29 décembre 2025
