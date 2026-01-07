# CONFIGURATION DNS POUR ÉVITER LES SPAMS

## 1. Vérifier les enregistrements DNS Resend

Allez sur https://resend.com/domains et vérifiez que **tous** les enregistrements sont configurés pour habitat-intermediaire.fr:

- ✅ **SPF** (TXT): Autorise Resend à envoyer des emails
- ✅ **DKIM** (TXT): Signature cryptographique des emails
- ✅ **DMARC** (TXT): Politique d'authentification

## 2. Ajouter un enregistrement DMARC si manquant

Si vous n'avez pas de DMARC, ajoutez cet enregistrement DNS:

```
Type: TXT
Nom: _dmarc
Valeur: v=DMARC1; p=none; rua=mailto:postmaster@habitat-intermediaire.fr
```

## 3. Warmup du domaine

Les nouveaux domaines sont souvent marqués comme spam. Solutions:
- Envoyer progressivement (commencez petit volume)
- Demander aux utilisateurs de marquer comme "Non spam"
- Attendre quelques jours que la réputation s'améliore

## 4. Améliorer le contenu des emails

Dans l'Edge Function send-notification, ajoutez:
- Un lien de désinscription
- Une adresse physique
- Évitez les mots "spam trigger" (gratuit, urgent, etc.)

## 5. Vérifier le score spam

Testez vos emails sur https://www.mail-tester.com/
