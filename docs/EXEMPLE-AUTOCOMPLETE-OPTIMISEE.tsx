/**
 * EXEMPLE: Autocomplétion Optimisée
 * 
 * Fichier: src/components/SearchAutocompleteOptimized.tsx
 * 
 * OBJECTIF: Remplacer les 3 requêtes séparées par 1 seule fonction RPC
 * 
 * AVANT: 3 requêtes × 300ms = ~900ms
 * APRÈS: 1 requête × 100ms = ~100ms (89% plus rapide)
 */

"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface Suggestion {
  type: 'departement' | 'commune' | 'etablissement';
  value: string;
  label: string;
  metadata?: string;
}

export default function SearchAutocompleteOptimized() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // =====================================================
  // VERSION OPTIMISÉE: 1 seule requête RPC
  // =====================================================

  useEffect(() => {
    const fetchSuggestions = async () => {
      // Ne pas chercher si moins de 2 caractères
      if (query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);

      try {
        // ✅ NOUVELLE VERSION: 1 seule requête RPC
        const { data, error } = await supabase.rpc('search_autocomplete_hybrid', {
          search_query: query,
          max_results: 8
        });

        if (error) {
          console.error('Erreur recherche autocomplétion:', error);
          setSuggestions([]);
          return;
        }

        if (data && data.length > 0) {
          setSuggestions(data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Erreur recherche suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce de 200ms
    const timeoutId = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // =====================================================
  // VERSION ORIGINALE (À REMPLACER)
  // =====================================================

  /**
   * ❌ ANCIENNE VERSION: 3 requêtes séparées
   * 
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      const allSuggestions: Suggestion[] = [];

      try {
        // 1. Départements
        const { data: depts } = await supabase
          .from('v_liste_publication_geoloc')
          .select('departement')
          .ilike('departement', `%${query}%`)
          .limit(3);

        if (depts) {
          const uniqueDepts = Array.from(new Set(depts.map(d => d.departement)));
          uniqueDepts.forEach(dept => {
            if (dept) {
              allSuggestions.push({
                type: 'departement',
                value: dept,
                label: dept,
                metadata: '📍 Département'
              });
            }
          });
        }

        // 2. Communes
        const { data: communes } = await supabase
          .from('v_liste_publication_geoloc')
          .select('commune, departement')
          .ilike('commune', `%${query}%`)
          .limit(5);

        if (communes) {
          const uniqueCommunes = Array.from(
            new Map(communes.map(c => [c.commune, c])).values()
          );
          uniqueCommunes.forEach(item => {
            if (item.commune) {
              allSuggestions.push({
                type: 'commune',
                value: item.commune,
                label: `${item.commune} (${item.departement})`,
                metadata: '🏘️ Commune'
              });
            }
          });
        }

        // 3. Établissements
        const { data: etabs } = await supabase
          .from('v_liste_publication_geoloc')
          .select('etab_id, nom, commune')
          .ilike('nom', `%${query}%`)
          .limit(5);

        if (etabs) {
          etabs.forEach(etab => {
            allSuggestions.push({
              type: 'etablissement',
              value: etab.etab_id,
              label: etab.nom,
              metadata: `🏠 ${etab.commune}`
            });
          });
        }

        setSuggestions(allSuggestions.slice(0, 8));
        setShowSuggestions(allSuggestions.length > 0);
      } catch (error) {
        console.error('Erreur recherche suggestions:', error);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timeoutId);
  }, [query]);
  */

  // =====================================================
  // GESTION DES ÉVÉNEMENTS (inchangé)
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    if (suggestion.type === 'etablissement') {
      router.push(`/plateforme/fiche?id=${encodeURIComponent(suggestion.value)}`);
    } else {
      router.push(`/plateforme?search=${encodeURIComponent(suggestion.value)}`);
    }
    setShowSuggestions(false);
    setQuery('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/plateforme?search=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  // =====================================================
  // RENDU (inchangé)
  // =====================================================

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          placeholder="Rechercher un établissement, une ville, un département..."
          className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
        />
        
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.value}`}
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-100 ${
                selectedIndex === index ? 'bg-gray-100' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{suggestion.label}</span>
                {suggestion.metadata && (
                  <span className="text-sm text-gray-500">{suggestion.metadata}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}

// =====================================================
// NOTES D'IMPLÉMENTATION
// =====================================================

/**
 * 1. Appliquer cette migration SQL d'abord:
 *    supabase\migrations\009_autocomplete_function.sql
 * 
 * 2. Vérifier que la fonction RPC fonctionne:
 *    SELECT * FROM search_autocomplete_hybrid('paris', 8);
 * 
 * 3. Remplacer dans ces fichiers:
 *    - src/components/SearchAutocomplete.tsx
 *    - src/components/IntegratedSearchBar.tsx
 *    - src/app/plateforme/page.tsx (section autocomplétion)
 * 
 * 4. Tester les performances dans Chrome DevTools Network:
 *    - Avant: 3 requêtes × ~300ms = ~900ms
 *    - Après: 1 requête × ~100ms = ~100ms
 * 
 * 5. Optionnel: Ajouter un cache React Query:
 *    
 *    const { data: suggestions } = useQuery({
 *      queryKey: ['autocomplete', query],
 *      queryFn: () => supabase.rpc('search_autocomplete_hybrid', {...}),
 *      enabled: query.length >= 2,
 *      staleTime: 5 * 60 * 1000, // 5 minutes
 *    });
 * 
 * 6. Monitoring: Vérifier dans Supabase Dashboard > Database > Query Performance
 *    que les requêtes utilisent bien les index GIN trgm
 */
