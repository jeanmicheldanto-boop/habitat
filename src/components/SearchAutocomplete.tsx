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

export default function SearchAutocomplete() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ✅ OPTIMISATION : 1 seule requête RPC au lieu de 3
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        // ✅ Appel de la fonction SQL optimisée
        const { data, error } = await supabase.rpc('search_autocomplete_hybrid', {
          search_query: query,
          max_results: 8
        });

        if (error) {
          console.error('❌ Erreur RPC search_autocomplete_hybrid:', error);
          console.error('Message:', error.message);
          console.error('Details:', error.details);
          console.error('Hint:', error.hint);
          console.error('Code:', error.code);
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
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Gérer les clics en dehors
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
      // Aller directement à la fiche établissement
      router.push(`/plateforme/fiche?id=${encodeURIComponent(suggestion.value)}`);
    } else {
      // Rechercher par département ou commune
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

  return (
    <form
      className="search-bar-custom"
      onSubmit={handleSearch}
      style={{ margin: "2rem auto", maxWidth: 480, position: 'relative' }}
    >
      <label htmlFor="search-location" style={{ fontWeight: "bold", fontSize: "1.2rem", marginBottom: 8, display: "block", color: "#ffb366" }}>
        Où cherchez-vous un habitat intermédiaire&nbsp;?
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 12, position: 'relative' }}>
        <input
          ref={inputRef}
          id="search-location"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Ville, département, nom d'établissement..."
          autoComplete="off"
          style={{
            flex: 1,
            padding: "0.75rem 1.2rem",
            borderRadius: "32px",
            border: "1px solid #eee",
            fontSize: "1rem",
            background: "#fff",
            color: "#444",
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
            outline: "none",
            transition: "box-shadow 0.2s, border-color 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 12px 0 rgba(0,0,0,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 2px 8px 0 rgba(0,0,0,0.04)";
          }}
        />
        <button
          type="submit"
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(52, 152, 219, 0.3)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            transform: "scale(1)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(52, 152, 219, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(52, 152, 219, 0.3)";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.95)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="#fff" strokeWidth="2.5" fill="none" />
            <path d="M21 21l-4.35-4.35" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>

        {/* Dropdown des suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 60,
              marginTop: 8,
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              maxHeight: 400,
              overflowY: 'auto',
              zIndex: 1000,
              border: '1px solid #e0e0e0'
            }}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.type}-${suggestion.value}-${index}`}
                onClick={() => handleSelectSuggestion(suggestion)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  background: selectedIndex === index ? '#f0f8ff' : '#fff',
                  borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                  borderRadius: index === 0 ? '16px 16px 0 0' : index === suggestions.length - 1 ? '0 0 16px 16px' : 0,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => {
                  if (selectedIndex !== index) {
                    e.currentTarget.style.background = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedIndex !== index) {
                    e.currentTarget.style.background = '#fff';
                  }
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: '#333', fontSize: '0.95rem' }}>
                    {suggestion.label}
                  </div>
                  {suggestion.metadata && (
                    <div style={{ fontSize: '0.8rem', color: '#999', marginTop: 2 }}>
                      {suggestion.metadata}
                    </div>
                  )}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
