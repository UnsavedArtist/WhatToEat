'use client';

import { useEffect, useRef, useState } from 'react';
import useStore from '@/store/useStore';
import { FaSearch, FaLocationArrow } from 'react-icons/fa';

const DEBUG = false;

const debug = (...args: any[]) => {
  if (DEBUG) {
    console.debug('[LocationSearch]', ...args);
  }
};

export default function LocationSearch() {
  const { setCurrentLocation } = useStore();
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (window.google) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      geocoder.current = new google.maps.Geocoder();
    }
  }, []);

  const handleSearch = async (input: string) => {
    setSearchInput(input);
    if (!input || !autocompleteService.current) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await autocompleteService.current.getPlacePredictions({
        input,
        types: ['geocode'],
        componentRestrictions: { country: 'us' }
      });
      setSuggestions(response.predictions);
      setShowSuggestions(true);
      debug('Got suggestions:', response.predictions);
    } catch (error) {
      debug('Error getting suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = async (suggestion: google.maps.places.AutocompletePrediction) => {
    if (!geocoder.current) return;

    setIsLoading(true);
    setError(null);
    setShowSuggestions(false);
    setSearchInput(suggestion.description);

    try {
      const response = await geocoder.current.geocode({ placeId: suggestion.place_id });
      if (response.results[0]?.geometry?.location) {
        const location = response.results[0].geometry.location;
        setCurrentLocation({
          lat: location.lat(),
          lng: location.lng()
        });
        debug('Location set from search:', location.lat(), location.lng());
      }
    } catch (error) {
      debug('Error geocoding location:', error);
      setError('Failed to get location coordinates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      setError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoading(false);
          debug('Got current location:', position.coords);
        },
        (error) => {
          debug('Error getting current location:', error);
          setError('Unable to get your current location. Please enter an address.');
          setIsLoading(false);
        }
      );
    } else {
      setError('Location services not supported by your browser.');
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Enter address or zip code"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
            onFocus={() => setShowSuggestions(true)}
          />
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => handleSearch(searchInput)}
            aria-label="Search"
          >
            <FaSearch />
          </button>
        </div>
        <button
          onClick={handleGetCurrentLocation}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <FaLocationArrow />
          {isLoading ? 'Loading...' : 'Current Location'}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 text-gray-900 border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <span className="block text-sm font-medium">{suggestion.structured_formatting?.main_text}</span>
              {suggestion.structured_formatting?.secondary_text && (
                <span className="block text-xs text-gray-600 mt-0.5">{suggestion.structured_formatting.secondary_text}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 