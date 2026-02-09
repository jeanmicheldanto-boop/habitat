# 🚨 INCIDENT DE SÉCURITÉ - SECRETS EXPOSÉS

**Date:** 9 février 2026  
**Sévérité:** 🔴 CRITIQUE  
**Status:** En cours de nettoyage

## 📌 Résumé

GitGuardian a détecté des **Supabase JWT tokens (service_role)** exposés dans le dépôt Git.

### Secrets Exposés

#### 1. **JWT SERVICE_ROLE (PROJET ACTUEL) - CRITIQUE**
```
Projet: minwoumfgutampcgrcbr (PRODUCTION)
Fichiers:
  - supabase/send-approval-email-maison-mochez.sql:61
  - supabase/fix-proposition-emails.sql:126
```

**Durée d'exposition:** Depuis les commits de test d'emails  
**Impact:** Accès complet au serveur Supabase (CREATE, UPDATE, DELETE sur toutes les tables)  
**Action requise:** 🔴 **ROTATION IMMÉDIATE**

---

#### 2. **JWT SERVICE_ROLE (ANCIEN PROJET) - Moyen**
```
Projet: dcezggqkjptsmbnhzhjt (ANCIEN/ABANDONNÉ)
Fichiers:
  - check-image-path.js:5
  - fix-image-path.js:5
  - send-proposition-approval-email.js:5
```

**Impact:** Faible (ancien projet, probablement supprimé/inactif)  
**Action requise:** Vérifier que le projet est bien supprimé

---

#### 3. **JWT ANON_KEY - Moyen**
```
Clé: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Mzc5MDcsImV4cCI6MjA3NDMxMzkwN30.PWbq0NaB8ZyBIR5XgSn2pD_VoiH9eMjyjUYvvLmA3ng
Fichier: diagnostic-auth.js:5
```

**Impact:** Risque de lecture de données (mais anom_key est publique par design)  
**Action requise:** Optional - cette clé est techniquement publique, mais elle ne doit pas être en hardcode

---

## ✅ Actions Prises (AUTOMATIQUEMENT)

- ✅ Scripts identifiés et marqués pour nettoyage
- ✅ Secrets remplacés par `process.env.SUPABASE_SERVICE_ROLE_KEY`
- ✅ Secrets remplacés par placeholders dans les SQL files
- Lecture-only scripts: Aucun changement (utilisation sécurisée via env vars)

---

## 🔴 ACTIONS REQUISES (IMMÉDIAT)

### 1. **Rotationner la SERVICE_ROLE_KEY (CRITIQUE)**

Accédez à Supabase Dashboard:
```
1. Compte → Settings → API
2. Project API Keys section
3. Service Role key (secret)
4. Cliquer "Rotate" (ou "Reset")
5. Copier la NOUVELLE clé
6. Mettre à jour .env.local: SUPABASE_SERVICE_ROLE_KEY=<NOUVELLE_CLÉ>
7. Redéployer les Edge Functions:
   - supabase functions deploy send-verification-email
   - supabase functions deploy confirm-email
8. Commit après .env.local update (si possible, sinon passer)
```

### 2. **Scanné le Git History (IMPORTANT)**

```bash
# Vérifier si GitGuardian a détecté tous les secrets
# Révoquer les anciens tokens ne suffit pas - examiner tout l'historique

# Pour nettoyer complètement le history (DESTRUCTIF):
# git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch <FILE>' HEAD
# (À faire UNIQUEMENT si vraiment nécessaire et avec backup)
```

### 3. **Vérifier les Logs d'Accès Supabase**

```bash
# Supabase Dashboard → Logs
# Chercher les accès anormaux aux tables critiques depuis le 9 février
# Surtout: etablissements, propositions, profiles, email_verification_tokens
```

---

## 📋 Fichiers Nettoyés

| Fichier | Secret | Status |
|---------|--------|--------|
| check-image-path.js | old dcezggqkjptsmbnhzhjt service_role | ✅ À supprimer |
| fix-image-path.js | old dcezggqkjptsmbnhzhjt service_role | ✅ À supprimer |
| send-proposition-approval-email.js | old dcezggqkjptsmbnhzhjt service_role | ✅ À supprimer |
| send-approval-email-maison-mochez.sql | **ACTIVE** minwoumfgutampcgrcbr service_role | ✅ Remplacé par placeholder |
| fix-proposition-emails.sql | **ACTIVE** minwoumfgutampcgrcbr service_role | ✅ Remplacé par placeholder |
| diagnostic-auth.js | anon_key (non-critique) | ✅ À supprimer |

---

## 🛡️ Sécurité Future

Pour éviter cela:

1. **Pre-commit hooks:** Ajouter `git-secrets` ou `detect-secrets`
   ```bash
   npm install --save-dev husky
   husky install
   ```

2. **.env.local dans .gitignore** (vérifier que c'est fait)
   ```
   # .gitignore
   .env.local
   .env
   .env.*.local
   ```

3. **Utiliser environment variables PARTOUT:**
   - Jamais hardcoder de secrets dans le code
   - Même pour les scripts temporaires

4. **Supabase Edge Functions** gèrent automatiquement les env vars:
   ```typescript
   const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
   ```

5. **GitHub/Supabase Secrets Scanning:**
   - Activer dans Settings → Security → Secret Scanning
   - Autoriser Supabase à scanner automatiquement

---

## 📞 Escalade

Si vous n'êtes pas propriétaire du projet Supabase:
- Contactez l'admin Supabase pour rotationner immédiatement
- Décrire: "Service role JWT exposé publiquement sur GitHub"

---

**Prochaine étape:** Rotationner SERVICE_ROLE_KEY dans Supabase Dashboard ⬇️
