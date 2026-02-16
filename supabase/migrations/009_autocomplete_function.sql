-- Migration 009: Fonction d'autocomplétion optimisée
-- Objectif: Remplacer 3 requêtes par 1 seule requête optimisée
-- Date: 2026-02-15

-- =====================================================
-- FONCTION D'AUTOCOMPLÉTION UNIFIÉE
-- =====================================================

CREATE OR REPLACE FUNCTION search_autocomplete(
  search_query TEXT,
  max_results INT DEFAULT 8
)
RETURNS TABLE (
  type TEXT,
  value TEXT,
  label TEXT,
  metadata TEXT
) AS $$
BEGIN
  RETURN QUERY
  
  -- 1. Départements (priorité 1) - max 3 résultats
  (SELECT 
    'departement'::TEXT AS type, 
    departement AS value, 
    departement AS label, 
    '📍 Département'::TEXT AS metadata
  FROM etablissements
  WHERE statut_editorial = 'publie' 
    AND departement IS NOT NULL
    AND departement ILIKE '%' || search_query || '%'
  GROUP BY departement
  ORDER BY departement
  LIMIT 3)
  
  UNION ALL
  
  -- 2. Communes (priorité 2) - max 5 résultats
  (SELECT 
    'commune'::TEXT AS type, 
    commune AS value, 
    commune || ' (' || departement || ')' AS label, 
    '🏘️ Commune'::TEXT AS metadata
  FROM etablissements
  WHERE statut_editorial = 'publie' 
    AND commune IS NOT NULL
    AND commune ILIKE '%' || search_query || '%'
  GROUP BY commune, departement
  ORDER BY commune
  LIMIT 5)
  
  UNION ALL
  
  -- 3. Établissements (priorité 3) - max 5 résultats
  (SELECT 
    'etablissement'::TEXT AS type, 
    id::TEXT AS value, 
    nom AS label, 
    '🏠 ' || COALESCE(commune, 'Commune inconnue') AS metadata
  FROM etablissements
  WHERE statut_editorial = 'publie' 
    AND nom IS NOT NULL
    AND nom ILIKE '%' || search_query || '%'
  ORDER BY nom
  LIMIT 5)
  
  -- Limiter le nombre total de résultats
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- VERSION OPTIMISÉE AVEC SIMILARITÉ (Meilleurs résultats)
-- =====================================================

-- Cette version utilise pg_trgm pour un scoring de similarité
-- Nécessite l'extension pg_trgm (normalement déjà activée)

CREATE OR REPLACE FUNCTION search_autocomplete_ranked(
  search_query TEXT,
  max_results INT DEFAULT 8
)
RETURNS TABLE (
  type TEXT,
  value TEXT,
  label TEXT,
  metadata TEXT,
  similarity REAL
) AS $$
DECLARE
  dept_limit INT := 3;
  commune_limit INT := 5;
  etab_limit INT := 5;
BEGIN
  RETURN QUERY
  SELECT * FROM (
    -- 1. Départements avec score de similarité
    (SELECT 
      'departement'::TEXT AS type, 
      departement AS value, 
      departement AS label, 
      '📍 Département'::TEXT AS metadata,
      similarity(departement, search_query) AS similarity
    FROM etablissements
    WHERE statut_editorial = 'publie' 
      AND departement IS NOT NULL
      AND departement % search_query -- Opérateur de similarité pg_trgm
    GROUP BY departement
    ORDER BY similarity(departement, search_query) DESC
    LIMIT dept_limit)
    
    UNION ALL
    
    -- 2. Communes avec score de similarité
    (SELECT 
      'commune'::TEXT AS type, 
      commune AS value, 
      commune || ' (' || departement || ')' AS label, 
      '🏘️ Commune'::TEXT AS metadata,
      similarity(commune, search_query) AS similarity
    FROM etablissements
    WHERE statut_editorial = 'publie' 
      AND commune IS NOT NULL
      AND commune % search_query
    GROUP BY commune, departement
    ORDER BY similarity(commune, search_query) DESC
    LIMIT commune_limit)
    
    UNION ALL
    
    -- 3. Établissements avec score de similarité
    (SELECT 
      'etablissement'::TEXT AS type, 
      id::TEXT AS value, 
      nom AS label, 
      '🏠 ' || COALESCE(commune, 'Commune inconnue') AS metadata,
      similarity(nom, search_query) AS similarity
    FROM etablissements
    WHERE statut_editorial = 'publie' 
      AND nom IS NOT NULL
      AND nom % search_query
    ORDER BY similarity(nom, search_query) DESC
    LIMIT etab_limit)
  ) AS combined_results
  -- Trier tous les résultats par similarité et limiter
  ORDER BY similarity DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- VERSION HYBRIDE (ILIKE + Similarité)
-- =====================================================

-- Combine ILIKE pour les correspondances exactes et similarité pour le fuzzy matching

CREATE OR REPLACE FUNCTION search_autocomplete_hybrid(
  search_query TEXT,
  max_results INT DEFAULT 8
)
RETURNS TABLE (
  type TEXT,
  value TEXT,
  label TEXT,
  metadata TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_results AS (
    -- Départements
    SELECT 
      'departement'::TEXT AS type, 
      departement AS value, 
      departement AS label, 
      '📍 Département'::TEXT AS metadata,
      1 AS priority, -- Type priority
      CASE 
        WHEN departement ILIKE search_query || '%' THEN 100 -- Commence par
        WHEN departement ILIKE '%' || search_query || '%' THEN 50 -- Contient
        ELSE similarity(departement, search_query) * 10 -- Similarité
      END AS score
    FROM etablissements
    WHERE statut_editorial = 'publie' 
      AND departement IS NOT NULL
      AND (departement ILIKE '%' || search_query || '%' OR departement % search_query)
    GROUP BY departement
    
    UNION ALL
    
    -- Communes
    SELECT 
      'commune'::TEXT AS type, 
      commune AS value, 
      commune || ' (' || departement || ')' AS label, 
      '🏘️ Commune'::TEXT AS metadata,
      2 AS priority,
      CASE 
        WHEN commune ILIKE search_query || '%' THEN 100
        WHEN commune ILIKE '%' || search_query || '%' THEN 50
        ELSE similarity(commune, search_query) * 10
      END AS score
    FROM etablissements
    WHERE statut_editorial = 'publie' 
      AND commune IS NOT NULL
      AND (commune ILIKE '%' || search_query || '%' OR commune % search_query)
    GROUP BY commune, departement
    
    UNION ALL
    
    -- Établissements
    SELECT 
      'etablissement'::TEXT AS type, 
      id::TEXT AS value, 
      nom AS label, 
      '🏠 ' || COALESCE(commune, 'Commune inconnue') AS metadata,
      3 AS priority,
      CASE 
        WHEN nom ILIKE search_query || '%' THEN 100
        WHEN nom ILIKE '%' || search_query || '%' THEN 50
        ELSE similarity(nom, search_query) * 10
      END AS score
    FROM etablissements
    WHERE statut_editorial = 'publie' 
      AND nom IS NOT NULL
      AND (nom ILIKE '%' || search_query || '%' OR nom % search_query)
  )
  SELECT 
    type, 
    value, 
    label, 
    metadata
  FROM ranked_results
  ORDER BY priority ASC, score DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- CONFIGURATION DE LA SIMILARITÉ (optionnel)
-- =====================================================

-- Ajuster le seuil de similarité pour pg_trgm
-- Par défaut: 0.3 (30%)
-- Plus bas = plus de résultats (mais moins pertinents)
-- Plus haut = moins de résultats (mais plus pertinents)

-- SET pg_trgm.similarity_threshold = 0.2;

-- =====================================================
-- PERMISSIONS
-- =====================================================

-- Autoriser l'accès public aux fonctions
GRANT EXECUTE ON FUNCTION search_autocomplete(TEXT, INT) TO anon;
GRANT EXECUTE ON FUNCTION search_autocomplete(TEXT, INT) TO authenticated;

GRANT EXECUTE ON FUNCTION search_autocomplete_ranked(TEXT, INT) TO anon;
GRANT EXECUTE ON FUNCTION search_autocomplete_ranked(TEXT, INT) TO authenticated;

GRANT EXECUTE ON FUNCTION search_autocomplete_hybrid(TEXT, INT) TO anon;
GRANT EXECUTE ON FUNCTION search_autocomplete_hybrid(TEXT, INT) TO authenticated;

-- =====================================================
-- TESTS
-- =====================================================

-- Test de base
-- SELECT * FROM search_autocomplete('paris');

-- Test avec limite personnalisée
-- SELECT * FROM search_autocomplete('lyon', 5);

-- Test avec scoring
-- SELECT * FROM search_autocomplete_ranked('nice');

-- Test hybride
-- SELECT * FROM search_autocomplete_hybrid('royan');

-- =====================================================
-- UTILISATION DANS L'APPLICATION
-- =====================================================

-- Remplacer dans le code frontend (IntegratedSearchBar.tsx, SearchAutocomplete.tsx):
-- 
-- FROM (3 requêtes séparées):
--   const { data: depts } = await supabase.from('v_liste_publication_geoloc')...
--   const { data: communes } = await supabase.from('v_liste_publication_geoloc')...
--   const { data: etabs } = await supabase.from('v_liste_publication_geoloc')...
--
-- TO (1 seule requête):
--   const { data, error } = await supabase
--     .rpc('search_autocomplete_hybrid', { 
--       search_query: query,
--       max_results: 8 
--     });
--
--   if (data) {
--     setSuggestions(data);
--   }

-- =====================================================
-- PERFORMANCES ATTENDUES
-- =====================================================

-- Avant optimisation:
--   - 3 requêtes séparées
--   - 3x scan de la vue complexe
--   - ~300-500ms par recherche
--
-- Après optimisation:
--   - 1 seule requête
--   - Utilisation des index GIN trgm
--   - ~50-100ms par recherche (75-85% plus rapide)

-- =====================================================
-- MONITORING
-- =====================================================

-- Vérifier les plans d'exécution
-- EXPLAIN ANALYZE SELECT * FROM search_autocomplete_hybrid('test');

-- Statistiques d'utilisation (si pg_stat_statements activé)
-- SELECT calls, mean_exec_time, query 
-- FROM pg_stat_statements 
-- WHERE query LIKE '%search_autocomplete%'
-- ORDER BY calls DESC;

COMMENT ON FUNCTION search_autocomplete IS 
  'Recherche d''autocomplétion unifiée pour départements, communes et établissements. Version simple avec ILIKE.';

COMMENT ON FUNCTION search_autocomplete_ranked IS 
  'Recherche d''autocomplétion avec scoring de similarité pg_trgm. Meilleurs résultats pour le fuzzy matching.';

COMMENT ON FUNCTION search_autocomplete_hybrid IS 
  'Recherche d''autocomplétion hybride combinant correspondance exacte (ILIKE) et similarité (pg_trgm) avec scoring intelligent.';
