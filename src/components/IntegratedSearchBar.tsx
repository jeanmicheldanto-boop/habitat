"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Suggestion {
  type: 'departement' | 'commune' | 'etablissement';
  value: string;
  label: string;
  metadata?: string;
}

export default function IntegratedSearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      const allSuggestions: Suggestion[] = [];

      try {
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

  const openChatbot = () => {
    const event = new CustomEvent('openChatbot');
    window.dispatchEvent(event);
  };

  return (
    <form
      className="integrated-search-bar"
      onSubmit={handleSearch}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '700px',
        margin: '2rem auto 0',
        padding: '0 1rem',
        boxSizing: 'border-box'
      }}
    >
      {/* Boîte oblongue intégrée */}
      <div
        className="search-box-container"
        style={{
          display: 'flex',
          alignItems: 'stretch',
          borderRadius: '50px',
          background: '#ffffff',
          boxShadow: '0 6px 32px rgba(0, 0, 0, 0.1)',
          padding: '0',
          gap: '0',
          transition: 'all 0.3s ease',
          border: '1px solid rgba(217, 135, 106, 0.2)',
          height: 'auto',
          minHeight: '68px',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 40px rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(217, 135, 106, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 6px 32px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(217, 135, 106, 0.2)';
        }}
      >
        {/* Bouton Carte - Gauche */}
        <Link
          href="/plateforme?view=map"
          className="integrated-map-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '76px',
            height: '68px',
            borderRadius: '50px 0 0 50px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
            textDecoration: 'none',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: 'inset -1px 0 0 rgba(217, 135, 106, 0.1)'
          }}
          aria-label="Accéder à la carte"
          title="Accéder à la carte"
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = 'scale(1.05)';
            el.style.boxShadow = '0 4px 20px rgba(217, 135, 106, 0.4), inset -1px 0 0 rgba(217, 135, 106, 0.1)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = 'scale(1)';
            el.style.boxShadow = 'inset -1px 0 0 rgba(217, 135, 106, 0.1)';
          }}
        >
          <img
            className="carte-img"
            src="/carte.png"
            alt="Carte"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />
        </Link>

        {/* Input de recherche - Centre */}
        <input
          ref={inputRef}
          id="search-location-integrated"
          type="text"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Ville, département, établissement..."
          autoComplete="off"
          style={{
            flex: 1,
            padding: '0 16px',
            border: 'none',
            fontSize: '1.1rem',
            background: 'transparent',
            color: '#444',
            outline: 'none',
            transition: 'all 0.2s ease',
            minWidth: '150px',
            height: '100%',
            lineHeight: '68px'
          }}
        />

        {/* Bouton Recherche - Droite */}
        <button
          type="submit"
          className="search-btn-integrated"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '68px',
            height: '68px',
            borderRadius: '50px 0 0 50px',
            background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: 'inset -1px 0 0 rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(52, 152, 219, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(52, 152, 219, 0.3)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          aria-label="Lancer la recherche"
          title="Lancer la recherche"
        >
          <svg
            className="search-icon"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="11" cy="11" r="8" stroke="#fff" strokeWidth="2.5" fill="none" />
            <path
              d="M21 21l-4.35-4.35"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </button>

        {/* Bouton Assistant IA - Droite */}
        <button
          onClick={openChatbot}
          className="integrated-chatbot-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '68px',
            height: '68px',
            borderRadius: '0 50px 50px 0',
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #3d5568 100%)',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: 'inset 1px 0 0 rgba(217, 135, 106, 0.1)',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(217, 135, 106, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(44, 62, 80, 0.3)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          aria-label="Assistant IA"
          title="Assistant IA - Posez-moi vos questions !"
        >
          {/* Bulle avec trois points */}
          <svg
            className="chatbot-icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Cercle/bulle */}
            <circle cx="12" cy="12" r="10" stroke="#ffffff" strokeWidth="1.5" fill="none" />
            
            {/* Trois points */}
            <circle cx="9" cy="12" r="1.5" fill="#ffffff" />
            <circle cx="12" cy="12" r="1.5" fill="#ffffff" />
            <circle cx="15" cy="12" r="1.5" fill="#ffffff" />

            {/* Petite queue en bas */}
            <path
              d="M 12 22 L 14 18 L 10 18 Z"
              fill="#ffffff"
              opacity="0.7"
            />
          </svg>
        </button>
      </div>

      {/* Dropdown des suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="suggestions-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: '1rem',
            right: '1rem',
            marginTop: 12,
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
                borderRadius:
                  index === 0
                    ? '16px 16px 0 0'
                    : index === suggestions.length - 1
                    ? '0 0 16px 16px'
                    : 0,
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
                <div
                  style={{
                    fontWeight: 500,
                    color: '#333',
                    fontSize: '0.95rem'
                  }}
                >
                  {suggestion.label}
                </div>
                {suggestion.metadata && (
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: '#999',
                      marginTop: 2
                    }}
                  >
                    {suggestion.metadata}
                  </div>
                )}
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke="#bbb"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .integrated-search-bar {
            max-width: 100% !important;
            padding: 0 0.5rem !important;
            margin: 2rem auto 0 !important;
          }

          .search-box-container {
            min-height: 58px !important;
            height: 58px !important;
          }

          .search-input {
            font-size: 0.9rem !important;
            padding: 0 12px !important;
            min-width: 80px !important;
          }

          .search-icon {
            width: 18px !important;
            height: 18px !important;
          }

          .chatbot-icon {
            width: 20px !important;
            height: 20px !important;
          }

          .suggestions-dropdown {
            left: 0.5rem !important;
            right: 0.5rem !important;
            min-width: calc(100vw - 1rem) !important;
            max-width: calc(100vw - 1rem) !important;
          }

          .search-btn-integrated {
            width: 52px !important;
            height: 58px !important;
            min-width: 52px !important;
            flex-shrink: 0 !important;
          }

          .integrated-map-btn {
            width: 52px !important;
            height: 58px !important;
            min-width: 52px !important;
            flex-shrink: 0 !important;
          }

          .integrated-chatbot-btn {
            width: 52px !important;
            height: 58px !important;
            min-width: 52px !important;
            flex-shrink: 0 !important;
          }
        }

        @media (max-width: 480px) {
          .integrated-search-bar {
            max-width: 100% !important;
            padding: 0 0.25rem !important;
            margin: 2rem auto 0 !important;
            width: 100% !important;
          }

          .search-box-container {
            min-height: 60px !important;
            height: 60px !important;
            border-radius: 40px !important;
          }

          .search-input {
            font-size: 0.85rem !important;
            padding: 0 10px !important;
            min-width: 60px !important;
          }

          .search-icon {
            width: 16px !important;
            height: 16px !important;
          }

          .chatbot-icon {
            width: 18px !important;
            height: 18px !important;
          }

          .suggestions-dropdown {
            left: 0.25rem !important;
            right: 0.25rem !important;
            min-width: calc(100vw - 0.5rem) !important;
            max-width: calc(100vw - 0.5rem) !important;
            max-height: 300px !important;
          }

          .search-btn-integrated {
            width: 50px !important;
            height: 60px !important;
            min-width: 50px !important;
            flex-shrink: 0 !important;
          }

          .integrated-map-btn {
            width: 45px !important;
            height: 60px !important;
            min-width: 45px !important;
            flex-shrink: 0 !important;
          }

          .integrated-chatbot-btn {
            width: 50px !important;
            height: 60px !important;
            min-width: 50px !important;
            flex-shrink: 0 !important;
          }
        }
      `}</style>
    </form>
  );
}
