'use client';

import { useState } from 'react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (field: string, value: string | number) => void;
  codePostal: string;
  ville: string;
  latitude?: number;
  longitude?: number;
  required?: boolean;
  placeholder?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  codePostal,
  ville,
  latitude,
  longitude,
  required = false,
  placeholder = "Commencez à taper votre adresse..."
}: AddressAutocompleteProps) {
  interface AddressSuggestion {
    geometry: { coordinates: [number, number] };
    properties: {
      name: string;
      postcode?: string;
      city?: string;
    };
  }
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchAddresses = async (query: string) => {
    if (query.length <= 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      
      if (data.features) {
        setSuggestions(data.features);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Erreur recherche d\'adresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectAddress = (address: AddressSuggestion) => {
    const [longitude, latitude] = address.geometry.coordinates;
    const properties = address.properties;

    // Adapter selon la structure de formulaire
    onChange('adresse', properties.name);
    onChange('adresse_l1', properties.name);
    onChange('code_postal', properties.postcode || '');
    onChange('ville', properties.city || '');
    onChange('commune', properties.city || '');
    onChange('latitude', latitude);
    onChange('longitude', longitude);

    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange('adresse', newValue);
    onChange('adresse_l1', newValue);
    searchAddresses(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">
          Adresse {required && '*'}
        </label>
        <div className="mt-1 relative">
          <input
            type="text"
            name="adresse"
            id="adresse"
            required={required}
            value={value}
            onChange={handleInputChange}
            onFocus={() => value.length > 2 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder={placeholder}
            autoComplete="off"
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-3 top-3">
              <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {suggestions.map((address, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-900 cursor-pointer flex flex-col"
                  onClick={() => selectAddress(address)}
                >
                  <span className="font-medium">{address.properties.name}</span>
                  <span className="text-sm text-gray-500">
                    {address.properties.postcode} {address.properties.city}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {showSuggestions && !isLoading && suggestions.length === 0 && value.length > 2 && (
            <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md py-2 px-4 text-sm text-gray-500">
              Aucune adresse trouvée
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="code_postal" className="block text-sm font-medium text-gray-700">
            Code postal {required && '*'}
          </label>
          <input
            type="text"
            name="code_postal"
            id="code_postal"
            required={required}
            value={codePostal}
            onChange={(e) => onChange('code_postal', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Rempli automatiquement"
          />
        </div>

        <div>
          <label htmlFor="ville" className="block text-sm font-medium text-gray-700">
            Ville {required && '*'}
          </label>
          <input
            type="text"
            name="ville"
            id="ville"
            required={required}
            value={ville}
            onChange={(e) => onChange('ville', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Remplie automatiquement"
          />
        </div>
      </div>

      {/* Coordonnées (cachées mais utiles pour debug) */}
      {latitude && longitude && (
        <div className="text-sm text-gray-500">
          📍 Coordonnées : {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </div>
      )}
    </div>
  );
}