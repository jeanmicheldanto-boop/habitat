# 🔍 AUDIT COMPLET: Processus de Mise à Jour des Réclamations de Propriété

## Problèmes Identifiés

### 1. **Problème Principal: Fonction de Notification Incorrecte**
- **Fichier**: `supabase/schema.sql` ligne 258
- **Fonction**: `create_notification_on_status_change()`
- **Erreurs**:
  - Référence à `NEW.created_by` (n'existe pas dans `reclamations_propriete`) → doit être `NEW.user_id`
  - Référence à `NEW.review_note` (n'existe pas) → doit être `NEW.note_moderation`
  - Mauvais statuts enum: utilise `'approuve'`, `'rejete'` → doit être `'verifiee'`, `'rejetee'`

### 2. **Problème: Énumération Enum Incorrecte**
- **Table**: `reclamations_propriete`
- **Enum**: `reclamation_statut`
- **Valeurs acceptées**: `'en_attente'`, `'verifiee'`, `'rejetee'`
- **Code Frontend Avant**: envoyait `'approuvee'` ❌
- **Code Frontend Après**: mappe `'approuvee'` → `'verifiee'` ✅

### 3. **Problème: Noms de Colonnes**
| Colonne | Valeur | Frontend (avant) | Frontend (après) |
|---------|--------|-----------------|-----------------|
| Description | `presentation` | `description` ❌ | `presentation` ✅ |
| Adresse | `adresse_l1` | `adresse` ❌ | `adresse_l1` ✅ |
| Ville | `commune` | `ville` ❌ | `commune` ✅ |
| Note modération | `note_moderation` | `review_note` ❌ | `note_moderation` ✅ |
| ID Utilisateur | `user_id` | (impliqué) | `user_id` ✅ |

## Corrections Appliquées

### ✅ Frontend (src/app/admin/moderation/page.tsx)
1. **handleAction()**: Mappé `'approuvee'` → `'verifiee'` pour reclamations
2. **ReclamationPropriete Interface**: Mis à jour les statuts enum à `'en_attente' | 'verifiee' | 'rejetee'`
3. **Affichage**: Changé `review_note` → `note_moderation`

### ⏳ Backend (À Appliquer Manuellement)
Exécutez le script: `supabase/audit-fix-reclamations-complete.sql`

**Fichier**: [audit-fix-reclamations-complete.sql](../audit-fix-reclamations-complete.sql)

**Contenu**: Corrige la fonction `create_notification_on_status_change()` pour:
- Utiliser `NEW.user_id` au lieu de `NEW.created_by`
- Utiliser `NEW.note_moderation` au lieu de `NEW.review_note`
- Vérifier les statuts corrects: `'verifiee'` et `'rejetee'`
- Ajouter des vérifications NULL pour éviter les erreurs

## Flux Complet Corrigé

```
1. Admin approuve une réclamation
   ↓
2. Frontend: handleAction('approuvee', 'reclamation')
   ↓
3. Frontend mappe: 'approuvee' → 'verifiee'
   ↓
4. Supabase UPDATE reclamations_propriete SET statut = 'verifiee', note_moderation = ...
   ↓
5. Trigger: create_notification_on_status_change() s'active
   ↓
6. Trigger utilise NEW.user_id et NEW.note_moderation (CORRECT! ✅)
   ↓
7. Notification créée et envoyée à l'utilisateur
```

## Schéma de reclamations_propriete

| Colonne | Type | Nullable |
|---------|------|----------|
| id | uuid | NO |
| etablissement_id | uuid | NO |
| user_id | uuid | NO |
| organisation | text | YES |
| email_declaire | text | YES |
| domaine | text | YES |
| preuve_path | text | YES |
| **statut** | `reclamation_statut` enum | NO |
| **note_moderation** | text | YES |
| created_at | timestamp | NO |
| updated_at | timestamp | NO |

## RLS Policies Correctes

✅ Admin peut VOIR toutes les réclamations (via table admins)
✅ Utilisateur peut voir seulement ses propres réclamations
✅ Seulement admin peut UPDATE

## À Faire

### Immédiat
1. ✅ Commit frontend: `acd84ee` - Statuts enum corrects
2. ⏳ Exécuter script SQL: `audit-fix-reclamations-complete.sql` dans Supabase
3. 🔄 Actualiser l'admin et tester

### Vérification Post-Fix
- [ ] Admin peut approuver une réclamation
- [ ] Réclamation change à statut `'verifiee'`
- [ ] Notification est créée
- [ ] Pas d'erreur 42703 "has no field"
- [ ] User_id correct dans notification

## Notes

- **Propositions**: Utilisent `reclamation_statut` = propriétés correctes ✅
- **Réclamations**: Utilisent `reclamation_statut` = nécessite statut `'verifiee'` (pas `'approuvee'`)
- **Fonctions**: Créées en PL/pgSQL qui vérifient les colonnes à l'exécution

---

**Résumé**: Le processus avait des incohérences entre:
1. Les noms réels des colonnes en base
2. Les valeurs d'énumération acceptées
3. Ce que le frontend envoyait
4. Ce que les fonctions en base attendaient

Tout est maintenant aligné! 🎯
