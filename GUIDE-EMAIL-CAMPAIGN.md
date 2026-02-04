# 📧 Guide de Configuration et Utilisation - Campagne Email

## Vue d'ensemble

Ce système permet d'envoyer une campagne d'emails à tous les établissements référencés et de gérer les demandes RGPD via un formulaire d'opt-out.

## 📊 Résumé de la base de données

- **Total établissements** : 3,386
- **Avec email** : 2,016 (59.5%)
- **Sans email** : 1,370
- **Établissements de test (Ossun)** : 2

## 🔧 Configuration Mailgun

### 1. Créer un compte Mailgun

1. Allez sur [https://www.mailgun.com/](https://www.mailgun.com/)
2. Créez un compte (gratuit jusqu'à 5,000 emails/mois)
3. Vérifiez votre email

### 2. Configurer votre domaine

#### Option A : Domaine personnalisé (recommandé)
```
Domaine : mg.habitat-intermediaire.fr
```

Ajoutez ces enregistrements DNS chez votre hébergeur :

| Type | Nom | Valeur |
|------|-----|--------|
| TXT | mg.habitat-intermediaire.fr | `v=spf1 include:mailgun.org ~all` |
| TXT | smtp._domainkey.mg | (fourni par Mailgun) |
| CNAME | email.mg | mailgun.org |
| MX | mg | mxa.mailgun.org (priorité 10) |
| MX | mg | mxb.mailgun.org (priorité 10) |

#### Option B : Domaine sandbox (tests uniquement)
- Limité à 5 destinataires autorisés
- Format : `sandboxXXXXX.mailgun.org`

### 3. Obtenir vos clés API

1. Dans le dashboard Mailgun, allez dans **Settings > API Keys**
2. Copiez votre **Private API key**
3. Notez votre **Domain name**

### 4. Configurer .env.local

```bash
# Dans .env.local
MAILGUN_API_KEY=votre-clé-api-privée-ici
MAILGUN_DOMAIN=mg.habitat-intermediaire.fr
```

⚠️ **Important** : Ne commitez jamais ces clés dans Git !

## 📝 Utilisation

### 1. Compter les emails disponibles

```bash
node count-emails.js
```

Affiche :
- Nombre total d'établissements
- Nombre avec/sans email
- Liste des établissements de test (Ossun)
- Estimation des coûts

### 2. Tester l'envoi (établissements Ossun)

```bash
# Le script est en mode TEST par défaut
node send-referencing-campaign.js
```

Cela enverra les emails uniquement aux 2 établissements d'Ossun :
- maison patgen (lgenevaux@yahoo.fr)
- etablissement 9 (patrick.danto@outlook.fr)

### 3. Envoyer en production (tous les établissements)

1. Ouvrez [send-referencing-campaign.js](send-referencing-campaign.js)
2. Modifiez la ligne :
   ```javascript
   testMode: false, // Était à true
   ```
3. Lancez le script :
   ```bash
   node send-referencing-campaign.js
   ```
4. Confirmez après le délai de 5 secondes (ou Ctrl+C pour annuler)

### 4. Formulaire d'opt-out

Le formulaire est accessible à : `https://habitat-intermediaire.fr/opt-out`

Il permet aux établissements de :
- ❌ Demander le retrait de la plateforme
- 📋 Accéder à leurs données
- ✏️ Rectifier leurs données
- ➕ Compléter leur fiche
- ❓ Autre demande

Chaque demande envoie un email à : `patrick.danto@confidensia.fr`

## 📧 Template de l'email

Le template inclut :
- Salutation personnalisée avec le nom de l'établissement
- Explication du référencement
- Droits RGPD
- **Lien vers le formulaire** : `https://habitat-intermediaire.fr/opt-out`
- Coordonnées de contact

## 💰 Coûts estimés

### Mailgun Flex Plan (Pay as you go)
- **Gratuit** : Jusqu'à 5,000 emails/mois
- **Après 5,000** : ~0.80$/1000 emails

### Pour cette campagne
- 2,016 emails = **Gratuit** (sous la limite)

## 🧪 Tests effectués

### Établissements de test à Ossun

| Nom | Email | ID |
|-----|-------|-----|
| maison patgen | lgenevaux@yahoo.fr | 76a5f008-7f5c-44e6-a405-2c54f9cb2fa7 |
| etablissement 9 | patrick.danto@outlook.fr | ce3dadfd-d021-48f5-80a4-73a092c7a81a |

## 📊 Suivi des campagnes

1. Connectez-vous sur [https://app.mailgun.com/](https://app.mailgun.com/)
2. Allez dans **Sending > Logs**
3. Filtrez par tag : `referencing-notification`

Métriques disponibles :
- Emails envoyés
- Emails délivrés
- Taux d'ouverture
- Taux de clics
- Bounces/rejets

## 🔒 Sécurité et RGPD

### Conformité RGPD
✅ Email explique la source des données (sources publiques)
✅ Droit d'accès, rectification, opposition clairement indiqué
✅ Formulaire opt-out accessible et fonctionnel
✅ Traitement des demandes sous 48h

### Bonnes pratiques
- Ne pas envoyer trop rapidement (100ms entre chaque email)
- Surveiller le taux de bounces
- Respecter les demandes d'opt-out immédiatement
- Garder une trace des envois

## 🚨 Troubleshooting

### Erreur : "Module not found"
```bash
npm install dotenv @supabase/supabase-js form-data mailgun.js
```

### Erreur : "Variables Mailgun manquantes"
Vérifiez que `.env.local` contient bien :
```
MAILGUN_API_KEY=...
MAILGUN_DOMAIN=...
```

### Emails non reçus
1. Vérifiez les logs Mailgun
2. Vérifiez le dossier spam
3. Vérifiez la configuration DNS du domaine
4. Testez avec le sandbox domain d'abord

### Rate limiting
Si vous envoyez trop vite, ajoutez un délai :
```javascript
await new Promise(resolve => setTimeout(resolve, 200)); // 200ms entre emails
```

## 📞 Support

- Email : patrick.danto@confidensia.fr
- Documentation Mailgun : https://documentation.mailgun.com/
- Support Mailgun : https://www.mailgun.com/support/

## ✅ Checklist avant envoi en production

- [ ] Configuration Mailgun terminée
- [ ] DNS configuré et vérifié
- [ ] Clés API ajoutées dans .env.local
- [ ] Test réussi avec établissements Ossun
- [ ] Template email relu et validé
- [ ] Formulaire opt-out testé et fonctionnel
- [ ] Email de contact patrick.danto@confidensia.fr vérifié
- [ ] Backup de la base de données effectué
- [ ] Équipe prête à traiter les demandes opt-out

## 📅 Planning suggéré

1. **Jour 1** : Configuration Mailgun + DNS
2. **Jour 2** : Tests avec Ossun
3. **Jour 3** : Validation finale du template
4. **Jour 4** : Envoi production (matin, pour suivi dans la journée)
5. **J+1 à J+7** : Traitement des demandes opt-out
