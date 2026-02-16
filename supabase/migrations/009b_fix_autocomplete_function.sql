-- Migration 009b: Version corrigée de la fonction d'autocomplétion
-- Objectif: Version simple sans dépendance à pg_trgm pour compatibilité maximale
-- Date: 2026-02-15

-- =====================================================
-- VERSION HYBRIDE SIMPLIFIÉE (Sans pg_trgm)
-- =====================================================

-- Remplace la version précédente avec une version qui n'utilise que ILIKE
-- Plus compatible et fonctionne sur tous les environnements Supabase

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
      'departement'::TEXT AS result_type, 
      departement AS result_value, 
      departement AS result_label, 
      '📍 Département'::TEXT AS result_metadata,
      1 AS priority, -- Type priority
      CASE 
        WHEN departement ILIKE search_query || '%' THEN 100 -- Commence par
        WHEN departement ILIKE '%' || search_query || '%' THEN 50 -- Contient
        ELSE 0
      END AS score
    FROM etablissements
    WHERE statut_editorial = 'publie' 
      AND departement IS NOT NULL
      AND departement ILIKE '%' || search_query || '%'
    GROUP BY departement
    
    UNION ALL
    
    -- Communes
    SELECT 
      'commune'::TEXT AS result_type, 
      commune AS result_value, 
      commune || ' (' || departement || ')' AS result_label, 
      '🏘️ Commune'::TEXT AS result_metadata,
      2 AS priority,
      CASE 
        WHEN commune ILIKE search_query || '%' THEN 100
        WHEN commune ILIKE '%' || search_query || '%' THEN 50
        ELSE 0
      END AS score
    FROM etablissements
    WHERE statut_editorial = 'publie' 
      AND commune IS NOT NULL
      AND commune ILIKE '%' || search_query || '%'
    GROUP BY commune, departement
    
    UNION ALL
    
    -- Établissements
    SELECT 
      'etablissement'::TEXT AS result_type, 
      id::TEXT AS result_value, 
      nom AS result_label, 
      '🏠 ' || COALESCE(commune, 'Commune inconnue') AS result_metadata,
      3 AS priority,
      CASE 
        WHEN nom ILIKE search_query || '%' THEN 100
        WHEN nom ILIKE '%' || search_query || '%' THEN 50
        ELSE 0
      END AS score
    FROM etablissements
    WHERE statut_editorial = 'publie' 
      AND nom IS NOT NULL
      AND nom ILIKE '%' || search_query || '%'
  )
  SELECT 
    r.result_type AS type, 
    r.result_value AS value, 
    r.result_label AS label, 
    r.result_metadata AS metadata
  FROM ranked_results r
  WHERE r.score > 0
  ORDER BY r.priority ASC, r.score DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- VERSION SIMPLE (Backup)
-- =====================================================

-- Recréer aussi la version simple pour avoir une alternative
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
  SELECT 
    combined.result_type AS type,
    combined.result_value AS value,
    combined.result_label AS label,
    combined.result_metadata AS metadata
  FROM (
    -- 1. Départements (priorité 1) - max 3 résultats
    (SELECT 
      'departement'::TEXT AS result_type, 
      departement AS result_value, 
      departement AS result_label, 
      '📍 Département'::TEXT AS result_metadata
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
      'commune'::TEXT AS result_type, 
      commune AS result_value, 
      commune || ' (' || departement || ')' AS result_label, 
      '🏘️ Commune'::TEXT AS result_metadata
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
      'etablissement'::TEXT AS result_type, 
      id::TEXT AS result_value, 
      nom AS result_label, 
      '🏠 ' || COALESCE(commune, 'Commune inconnue') AS result_metadata
    FROM etablissements
    WHERE statut_editorial = 'publie' 
      AND nom IS NOT NULL
      AND nom ILIKE '%' || search_query || '%'
    ORDER BY nom
    LIMIT 5)
  ) AS combined
  -- Limiter le nombre total de résultats
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION search_autocomplete(TEXT, INT) TO anon;
GRANT EXECUTE ON FUNCTION search_autocomplete(TEXT, INT) TO authenticated;

GRANT EXECUTE ON FUNCTION search_autocomplete_hybrid(TEXT, INT) TO anon;
GRANT EXECUTE ON FUNCTION search_autocomplete_hybrid(TEXT, INT) TO authenticated;

-- =====================================================
-- TESTS
-- =====================================================

-- Test simple
-- SELECT * FROM search_autocomplete('paris');

-- Test hybride
-- SELECT * FROM search_autocomplete_hybrid('royan');

COMMENT ON FUNCTION search_autocomplete IS 
  'Recherche d''autocomplétion unifiée sans pg_trgm (compatible avec tous les environnements)';

COMMENT ON FUNCTION search_autocomplete_hybrid IS 
  'Recherche d''autocomplétion avec scoring de priorité basé sur la position de la correspondance (début vs milieu)';
