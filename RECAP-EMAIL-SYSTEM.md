# 📋 Récapitulatif - Système d'Email et Opt-Out

## ✅ Ce qui a été créé

### 1. Scripts de gestion d'email

#### 📊 [count-emails.js](count-emails.js)
Compte les emails disponibles dans la base de données.

**Utilisation :**
```bash
node count-emails.js
```

**Résultats :**
- Total : 3,386 établissements
- Avec email : 2,016 (59.5%)
- Ossun (test) : 2 établissements

---

#### 📧 [send-referencing-campaign.js](send-referencing-campaign.js)
Script d'envoi de la campagne d'information de référencement.

**Caractéristiques :**
- ✅ Mode TEST par défaut (envoie uniquement à Ossun)
- ✅ Template HTML responsive
- ✅ Personnalisation par établissement
- ✅ Tracking Mailgun (ouvertures, clics)
- ✅ Rate limiting automatique
- ✅ Gestion d'erreurs

**Mode TEST (par défaut) :**
```bash
node send-referencing-campaign.js
```
→ Envoie uniquement aux 2 établissements d'Ossun

**Mode PRODUCTION :**
1. Modifier `testMode: false` dans le fichier
2. Lancer : `node send-referencing-campaign.js`
3. Confirmer après 5 secondes

---

### 2. Formulaire d'opt-out

#### 🌐 Page web : `/opt-out`
URL : `https://habitat-intermediaire.fr/opt-out`

**Fonctionnalités :**
- ✅ Formulaire complet avec validation
- ✅ 5 types de demandes :
  - Retrait de la plateforme
  - Accès aux données
  - Rectification
  - Complétion de fiche
  - Autre
- ✅ Design responsive et accessible
- ✅ Messages de succès/erreur

**Fichiers créés :**
- [src/app/opt-out/page.tsx](src/app/opt-out/page.tsx) - Interface utilisateur
- [src/app/api/opt-out/route.ts](src/app/api/opt-out/route.ts) - API backend

**Fonctionnement :**
1. Utilisateur remplit le formulaire
2. Validation côté client et serveur
3. Email envoyé automatiquement à patrick.danto@confidensia.fr
4. Email formaté avec toutes les informations
5. Confirmation affichée à l'utilisateur

---

### 3. Scripts de test

#### 🧪 [test-opt-out-form.js](test-opt-out-form.js)
Teste le formulaire opt-out via l'API.

**Utilisation :**
```bash
# 1. Lancer le serveur Next.js
npm run dev

# 2. Dans un autre terminal
node test-opt-out-form.js
```

---

### 4. Documentation

#### 📖 [GUIDE-EMAIL-CAMPAIGN.md](GUIDE-EMAIL-CAMPAIGN.md)
Guide complet avec :
- Configuration Mailgun étape par étape
- Configuration DNS
- Utilisation des scripts
- Troubleshooting
- Checklist avant envoi

---

## 🔧 Configuration requise

### 1. Variables d'environnement (.env.local)

```bash
# Mailgun (à configurer)
MAILGUN_API_KEY=your-mailgun-api-key-here
MAILGUN_DOMAIN=mg.habitat-intermediaire.fr
```

### 2. Dépendances npm

```bash
npm install dotenv @supabase/supabase-js form-data mailgun.js
```
✅ Déjà installé

---

## 📝 Template de l'email

### Contenu principal

L'email envoyé contient :

1. **Introduction**
   - Nom de l'établissement personnalisé
   - Explication du référencement

2. **Pourquoi ce message ?**
   - Sources publiques utilisées
   - Processus documenté
   - 3,400 habitats référencés

3. **Droits RGPD**
   - Accès aux données
   - Rectification
   - Complétion
   - Opposition (opt-out)

4. **Formulaire opt-out**
   - Lien : https://habitat-intermediaire.fr/opt-out
   - Mis en évidence dans un encadré bleu

5. **À propos**
   - Service gratuit
   - API en marque blanche
   - Objectif d'intérêt général

6. **Contact**
   - Patrick Danto
   - patrick.danto@confidensia.fr
   - confidensia.fr

---

## 🎯 Procédure de test (Ossun)

### Étape 1 : Vérifier la configuration

```bash
# Vérifier les emails en base
node count-emails.js
```

Doit afficher les 2 établissements d'Ossun :
- maison patgen (lgenevaux@yahoo.fr)
- etablissement 9 (patrick.danto@outlook.fr)

### Étape 2 : Configurer Mailgun (si pas déjà fait)

Voir [GUIDE-EMAIL-CAMPAIGN.md](GUIDE-EMAIL-CAMPAIGN.md) section "Configuration Mailgun"

Options :
- **Production** : Domaine personnalisé `mg.habitat-intermediaire.fr` (recommandé)
- **Test** : Sandbox Mailgun (limité à 5 destinataires)

### Étape 3 : Tester l'envoi email

```bash
# Le script est déjà en mode TEST
node send-referencing-campaign.js
```

Vérifications :
- ✅ 2 emails envoyés
- ✅ Pas d'erreurs
- ✅ Réception dans les boîtes mail

### Étape 4 : Tester le formulaire opt-out

```bash
# Terminal 1
npm run dev

# Terminal 2
node test-opt-out-form.js
```

Vérifications :
- ✅ Status 200
- ✅ Email reçu sur patrick.danto@confidensia.fr
- ✅ Toutes les infos présentes

### Étape 5 : Test manuel du formulaire

1. Ouvrir : http://localhost:3000/opt-out
2. Remplir le formulaire avec :
   - Établissement : "Maison Patgen TEST"
   - Email : patrick.danto@outlook.fr
   - Type : Retrait
3. Envoyer
4. Vérifier l'email reçu

---

## 🚀 Passage en production

### Checklist

- [ ] Configuration Mailgun terminée
- [ ] DNS vérifié (domaine personnalisé)
- [ ] Test Ossun réussi (emails reçus)
- [ ] Formulaire opt-out testé
- [ ] Template relu et validé
- [ ] Équipe prête à traiter les opt-out sous 48h

### Commandes

```bash
# 1. Modifier send-referencing-campaign.js
# Ligne 30 : testMode: false,

# 2. Lancer l'envoi
node send-referencing-campaign.js

# 3. Confirmer après 5 secondes
# (ou Ctrl+C pour annuler)
```

**Durée estimée :**
- 2,016 emails
- ~100ms entre chaque
- Total : ~3-4 minutes

---

## 💰 Coûts

**Mailgun Flex Plan :**
- 0 à 5,000 emails/mois : **GRATUIT**
- Au-delà : ~0.80$/1000 emails

**Cette campagne :**
- 2,016 emails = **0€** (sous la limite gratuite)

---

## 📊 Suivi post-envoi

### 1. Dashboard Mailgun
https://app.mailgun.com/

**Métriques :**
- Emails envoyés
- Taux de délivrance
- Taux d'ouverture
- Taux de clics
- Bounces/rejets

**Filtrer par tag :**
- `referencing-notification`
- `2026-02`

### 2. Demandes opt-out

Les demandes arrivent par email à :
**patrick.danto@confidensia.fr**

**Traitement :**
1. Accuser réception sous 24h
2. Traiter la demande sous 48h
3. Pour un retrait :
   - Supprimer de la base
   - OU marquer comme "opt-out"
   - Confirmer par email

---

## 🔒 Conformité RGPD

### Points de conformité

✅ **Transparence**
- Email explique la source des données
- Processus documenté

✅ **Droit d'accès**
- Formulaire accessible
- Lien visible dans l'email

✅ **Droit de rectification**
- Option dans le formulaire

✅ **Droit d'opposition**
- Option de retrait claire
- Formulaire dédié

✅ **Délai de traitement**
- 48h ouvrées (RGPD : 1 mois max)

---

## 📞 Support

**Questions techniques :**
- Voir [GUIDE-EMAIL-CAMPAIGN.md](GUIDE-EMAIL-CAMPAIGN.md)
- Documentation Mailgun : https://documentation.mailgun.com/

**Contact :**
- patrick.danto@confidensia.fr

---

## 📁 Fichiers créés

### Scripts
- ✅ `count-emails.js` - Comptage des emails
- ✅ `send-referencing-campaign.js` - Envoi de la campagne
- ✅ `test-opt-out-form.js` - Test du formulaire

### Application Next.js
- ✅ `src/app/opt-out/page.tsx` - Page formulaire
- ✅ `src/app/api/opt-out/route.ts` - API backend

### Documentation
- ✅ `GUIDE-EMAIL-CAMPAIGN.md` - Guide complet
- ✅ `RECAP-EMAIL-SYSTEM.md` - Ce fichier

### Configuration
- ✅ `.env.local` - Variables d'environnement (à compléter)

---

## 🎯 Prochaines étapes

1. **Configuration Mailgun** (15 min)
   - Créer le compte
   - Configurer le domaine
   - Ajouter les clés dans .env.local

2. **Test Ossun** (5 min)
   ```bash
   node send-referencing-campaign.js
   ```

3. **Validation** (10 min)
   - Vérifier les emails reçus
   - Tester le formulaire opt-out
   - Relire le template

4. **Production** (5 min)
   - Modifier testMode à false
   - Lancer l'envoi
   - Surveiller le dashboard

5. **Suivi** (continu)
   - Traiter les opt-out sous 48h
   - Surveiller les métriques
   - Ajuster si nécessaire

---

## ✨ Résumé

Vous disposez maintenant d'un **système complet et conforme RGPD** pour :

1. ✅ Envoyer 2,016 emails personnalisés aux établissements
2. ✅ Gérer les demandes d'opt-out via un formulaire dédié
3. ✅ Tester d'abord sur 2 établissements fictifs (Ossun)
4. ✅ Suivre les statistiques d'envoi et d'engagement

**Tout est prêt pour le test !** 🚀
