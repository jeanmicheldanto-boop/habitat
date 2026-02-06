# 🔧 Correction des Policies RLS pour les Propositions Publiques

## Problème
Les propositions de modification créées par le public (formulaire "Suggérer une modification") ne sont pas visibles dans le dashboard admin à cause des Row Level Security (RLS) policies.

## Cause
Les policies RLS actuelles:
1. N'autorisent que les utilisateurs **authentifiés** à créer des propositions
2. La policy SELECT vérifie `created_by = auth.uid() OR is_admin()`, mais ne gère pas les propositions avec `created_by = NULL`
3. Résultat: les propositions publiques sont invisibles même pour les admins

## Solution

### Étape 1: Ouvrir le SQL Editor
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet "Habitat Intermédiaire"
3. Cliquez sur "SQL Editor" dans le menu de gauche

### Étape 2: Exécuter le SQL de correction
Copiez-collez et exécutez le contenu du fichier:
```
supabase/fix-rls-propositions-public.sql
```

Ou copiez directement ce SQL:

```sql
-- 1. Supprimer l'ancienne policy SELECT
DROP POLICY IF EXISTS "prop select owner or admin" ON public.propositions;

-- 2. Créer une nouvelle policy SELECT qui inclut les propositions publiques
CREATE POLICY "prop select owner or admin or public" 
ON public.propositions 
FOR SELECT 
TO authenticated 
USING (
  public.is_admin() 
  OR created_by = auth.uid() 
  OR created_by IS NULL
);

-- 3. Supprimer l'ancienne policy INSERT
DROP POLICY IF EXISTS "prop insert any authenticated" ON public.propositions;

-- 4. Policy INSERT pour les utilisateurs authentifiés
CREATE POLICY "prop insert authenticated" 
ON public.propositions 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 5. Policy INSERT pour le public (anon role)
CREATE POLICY "prop insert public" 
ON public.propositions 
FOR INSERT 
TO anon 
WITH CHECK (
  type_cible = 'etablissement' 
  AND action = 'update' 
  AND source = 'public'
  AND created_by IS NULL
);
```

### Étape 3: Vérifier
Après exécution, vérifiez que les policies sont correctes:

```sql
SELECT 
  policyname,
  roles::text,
  cmd::text
FROM pg_policies
WHERE tablename = 'propositions'
ORDER BY cmd, policyname;
```

Vous devriez voir:
- `prop delete admin only` (DELETE, authenticated)
- `prop insert authenticated` (INSERT, authenticated)
- `prop insert public` (INSERT, anon)
- `prop select owner or admin or public` (SELECT, authenticated)
- `prop update admin only` (UPDATE, authenticated)

### Étape 4: Tester
Rechargez votre dashboard admin. La proposition créée devrait maintenant être visible!

## Vérification de la proposition
Pour vérifier que la proposition existe bien:
```bash
node check-latest-propositions-modifier.js
```

Proposition existante:
- ID: `dcd5c0f7-a86a-4deb-a226-600e29e51ce1`
- Établissement: Résidence autonomie de Tarbes
- Proposeur: Danto (patrick.danto@outlook.fr)
- Créée le: 06/02/2026 20:21:45
