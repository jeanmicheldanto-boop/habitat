# 📧 Système de Campagne Email & Opt-Out RGPD

## 🎯 Vue d'ensemble

Système complet pour informer les **2,016 établissements** de leur référencement sur habitat-intermediaire.fr et gérer les demandes RGPD via un formulaire d'opt-out.

## 🚀 Démarrage rapide (5 min)

### 1. Configuration Mailgun

```bash
# 1. Créer un compte sur https://app.mailgun.com/ (gratuit)
# 2. Récupérer votre clé API
# 3. Ajouter dans .env.local :

MAILGUN_API_KEY=votre-clé-ici
MAILGUN_DOMAIN=mg.habitat-intermediaire.fr  # ou sandbox pour test
```

### 2. Vérification du système

```bash
node dry-run-campaign.js
```

### 3. Test avec Ossun (2 établissements fictifs)

```bash
node send-referencing-campaign.js
```

✅ Vérifier les emails reçus sur :
- lgenevaux@yahoo.fr
- patrick.danto@outlook.fr

### 4. Production (2,016 emails)

```bash
# 1. Modifier testMode à false dans send-referencing-campaign.js
# 2. Lancer :
node send-referencing-campaign.js
```

## 📁 Scripts disponibles

| Script | Description | Commande |
|--------|-------------|----------|
| `count-emails.js` | Comptage des emails en base | `node count-emails.js` |
| `dry-run-campaign.js` | Vérification avant envoi | `node dry-run-campaign.js` |
| `send-referencing-campaign.js` | Envoi de la campagne | `node send-referencing-campaign.js` |
| `test-opt-out-form.js` | Test du formulaire | `node test-opt-out-form.js` |

## 🌐 Formulaire opt-out

**URL :** https://habitat-intermediaire.fr/opt-out

Le formulaire permet aux établissements de :
- ❌ Demander le retrait de la plateforme
- 📋 Accéder à leurs données
- ✏️ Rectifier leurs données
- ➕ Compléter leur fiche

**Traitement :** Email envoyé à patrick.danto@confidensia.fr

## 📊 Statistiques

- **Total établissements :** 3,386
- **Avec email :** 2,016 (59.5%)
- **Sans email :** 1,370
- **Test Ossun :** 2
- **Coût :** GRATUIT (sous 5,000 emails/mois)
- **Durée envoi :** ~3-4 minutes

## 📚 Documentation complète

- **[PRET-POUR-TEST.md](PRET-POUR-TEST.md)** - Guide de démarrage complet
- **[GUIDE-EMAIL-CAMPAIGN.md](GUIDE-EMAIL-CAMPAIGN.md)** - Configuration détaillée Mailgun
- **[RECAP-EMAIL-SYSTEM.md](RECAP-EMAIL-SYSTEM.md)** - Récapitulatif technique

## ✅ Checklist

- [ ] Compte Mailgun créé
- [ ] Clés API dans .env.local
- [ ] `node dry-run-campaign.js` → Tout ✅
- [ ] `node send-referencing-campaign.js` → Test Ossun OK
- [ ] Emails Ossun reçus et validés
- [ ] Formulaire opt-out testé
- [ ] Prêt pour production

## 📞 Support

**Contact :** patrick.danto@confidensia.fr

---

**Tout est prêt ! Suivez [PRET-POUR-TEST.md](PRET-POUR-TEST.md) pour commencer.** 🚀
