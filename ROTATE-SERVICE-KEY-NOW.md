# 🔐 ROTATION IMMÉDIATE REQUISE - SERVICE ROLE KEY

**Status:** 🔴 CRITIQUE - Action requise AUJOURD'HUI  
**Raison:** Supabase JWT (service_role) exposé publiquement sur GitHub  
**Découvert par:** GitGuardian (9 février 2026)

---

## ⚠️ RÉCAPITULATIF RAPIDE

| Élément | Situation | Urgence |
|---------|-----------|---------|
| **SERVICE_ROLE_KEY exposée** | Oui, dans Git commits | 🔴 CRITIQUE |
| **Clé actuellement active** | Oui, toujours valide | 🔴 CRITIQUE |
| **Qui peut y accéder** | Git history = publique | 🔴 CRITIQUE |
| **Données à risque** | TOUTES les tables | 🔴 CRITIQUE |
| **Nettoyage du code** | ✅ Terminé (voir git diff) | ✅ Fait |

---

## 🚨 ÉTAPES À FAIRE **MAINTENANT** (10 minutes)

### ÉTAPE 1: Rotationner la clé Supabase (3 minutes)

1. Aller à: **https://app.supabase.com/**
2. Sélectionner le projet **habitat** (minwoumfgutampcgrcbr)
3. Menu gauche → **Settings** → **API**
4. Section **Project API Keys**
5. Trouver la ligne **Service Role key (secret)**
6. Cliquer le bouton **Rotate** (ou **Reset**)
7. ✅ Copier la **NOUVELLE CLÉ** (elle apparaîtra)
8. ⚠️ **N'OUBLIE PAS**: La nouvelle clé s'affichera une seule fois!

**Nouvelle clé obtenue?** → Continuer

---

### ÉTAPE 2: Mettre à jour .env.local (2 minutes)

1. Ouvrir le fichier: `.env.local`
2. Trouver la ligne: `SUPABASE_SERVICE_ROLE_KEY=...`
3. Remplacer la valeur par la **NOUVELLE CLÉ**
4. Sauvegarder (Ctrl+S)

```diff
- SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA
+ SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzAwMDAwMCwiZXhwIjoyMDYyNTc2MDAwfQ.XXXXXXXXXXX
```

---

### ÉTAPE 3: Redéployer les Edge Functions (5 minutes)

Les Edge Functions récupèrent automatiquement la nouvelle clé:

```bash
supabase functions deploy send-verification-email
supabase functions deploy confirm-email
```

Output attendu:
```
✅ Function send-verification-email deployed successfully
✅ Function confirm-email deployed successfully
```

---

### ÉTAPE 4: Vérifier que tout fonctionne (2 minutes)

1. Aller à: `/gestionnaire/register`
2. Créer un compte test avec une vraie adresse email
3. Vérifier que l'email de vérification arrive
4. Cliquer le lien → page de vérification doit afficher ✅
5. Se connecter avec le compte créé

**Tout OK?** → Passer à l'étape 5

---

### ÉTAPE 5: Commit et Push au Git (2 minutes)

```bash
git add -A
git commit -m "security: rotate service role key after exposure

- Replaced hardcoded JWT tokens with environment variables
- Rotated SUPABASE_SERVICE_ROLE_KEY in Supabase dashboard
- Updated .env.local with new service role key
- Redeployed Edge Functions with new key
- Cleaned all scripts to use env variables only

Incident: https://github.com/.../security/advisories/...
Detected by: GitGuardian on 2026-02-09"

git push
```

---

## 🔍 Vérifications Additionnelles

### 1. Vérifier le Git History (IMPORTANT)

```bash
# Voir quels commits contiennent le secret exposé
git log --all --oneline | grep -E "(email|proposition|secret|key)"

# Voir les changements dans ces commits
git show <commit-id>
```

**Note:** Le secret reste dans l'historique Git même après suppression du fichier! Ce n'est pas un problème si la clé a été **ROTATIONNÉE**.

### 2. Vérifier les Logs d'Accès Supabase

```
Supabase Dashboard → Logs → API Requests
```

Chercher activité anormale:
- Entre le 9 février et maintenant
- Table: `etablissements`, `propositions`, `profiles`
- Utilisateur: service_role

---

## 🛡️ Prévention Future

### 1. .gitignore (VÉRIFIER)

```bash
# Ouvrir .gitignore et vérifier:
cat .gitignore | grep -E '(.env|secret)'
```

**Doit contenir:**
```
.env
.env.local
.env.*.local
.env.*.secret
secrets/
*.key
```

### 2. Pre-commit Hooks (RECOMMANDÉ)

Installer `husky` + `lint-staged`:

```bash
npm install --save-dev husky lint-staged
npx husky install

# Ajouter à package.json:
"husky": {
  "hooks": {
    "pre-commit": "npm run lint:secrets"
  }
},
"lint:secrets": "detect-secrets scan --baseline .secrets.baseline"
```

### 3. GitHub Secrets Scanning

```
GitHub → Settings → Security & analysis → Secret scanning
```

✅ Activer pour détecter automatiquement les secrets push

---

## 📋 Checklist Finale

- [ ] Clé rotée dans Supabase Dashboard
- [ ] `.env.local` mis à jour avec nouvelle clé
- [ ] Edge Functions redéployées
- [ ] Test d'inscription réussi
- [ ] Email de vérification reçu et confirmé
- [ ] Login avec nouveau compte OK
- [ ] Git committed et pushé
- [ ] Logs Supabase vérifiés (pas d'accès suspect)
- [ ] `.gitignore` contient `.env.local`
- [ ] GitGuardian alerte fermées

---

## 🆘 Si vous êtes bloqué

**Q: Je n'ai pas accès à Supabase Dashboard?**  
A: Le propriétaire du projet Supabase doit faire la rotation

**Q: Quelle est la nouvelle clé?**  
A: Elle s'affiche dans Supabase Dashboard après clic "Rotate" - la copier tout de suite

**Q: Comment savoir si l'ancien token est utilisé?**  
A: Interroger `Supabase Logs` pour voir les requêtes avec l'ancien token après rotation

**Q: Edge Functions continue à échouer après rotation?**  
A: Redéployer: `supabase functions deploy send-verification-email`

---

## ✅ Fait le 9 février 2026

- ✅ Secrets nettoyés du code source
- ✅ JWT remplacés par `process.env.SUPABASE_SERVICE_ROLE_KEY`
- ✅ SECURITY-INCIDENT.md créé
- ⏳ **ATTENDRE:** Rotation clé (vous êtes ici)
- ⏳ Redéploiement Edge Functions
- ⏳ Test système
- ⏳ Push final

---

**Status:** 🔴 EN ATTENTE DE VOTRE ACTION  
**Durée estimée:** 15-20 minutes  
**Urgence:** IMMÉDIATE
