'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useLoadScript, Libraries } from '@react-google-maps/api';
import useStore from '@/store/useStore';
import type { MapRestaurant } from '@/types/map';
import RestaurantFilters from '@/components/RestaurantFilters';
import RestaurantList from '@/components/RestaurantList';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { createRoot } from 'react-dom/client';
import React from 'react';
import { RestaurantSearchService } from '@/services/restaurantSearch';
import LocationSearch from '@/components/LocationSearch';

const libraries: Libraries = ['places', 'marker'] as Libraries;
const DEBUG = false;

const debug = (...args: any[]) => {
  if (DEBUG) {
    console.debug('[MapClient]', ...args);
  }
};

// Mapping from Google Places types to our cuisine types
const CUISINE_TYPE_MAPPING: Record<string, string> = {
  // Basic types
  'restaurant': '',  // Ignore generic types
  'food': '',
  'point_of_interest': '',
  'establishment': '',
  'meal_takeaway': '',
  'meal_delivery': '',
  'store': '',
  'bar': '',
  'cafe': '',
  'bakery': '',
  // Specific cuisines
  'american': 'American',
  'steakhouse': 'American',
  'burger': 'American',
  'bbq': 'American',
  'italian': 'Italian',
  'pizza': 'Italian',
  'chinese': 'Chinese',
  'asian': 'Chinese',
  'japanese': 'Japanese',
  'sushi': 'Japanese',
  'ramen': 'Japanese',
  'mexican': 'Mexican',
  'taco': 'Mexican',
  'indian': 'Indian',
  'curry': 'Indian',
  'thai': 'Thai',
  'mediterranean': 'Mediterranean',
  'greek': 'Mediterranean',
  'middle_eastern': 'Mediterranean'
};

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

export default function MapClient() {
  debug('MapClient rendering');
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    libraries,
    version: "weekly",
    language: "en",
    region: "US",
  });

  const {
    currentLocation,
    nearbyRestaurants,
    setNearbyRestaurants,
    selectedRestaurant,
    setSelectedRestaurant,
    filters,
  } = useStore();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const searchServiceRef = useRef<RestaurantSearchService | null>(null);

  // Update map center when location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !currentLocation) return;

    debug('Updating map center to new location');
    mapInstanceRef.current.panTo(currentLocation);
    mapInstanceRef.current.setZoom(14);
  }, [currentLocation]);

  // Initialize map when location is available
  useEffect(() => {
    if (!currentLocation || !mapRef.current || mapInstanceRef.current) return;

    const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID;
    if (!mapId) {
      debug('Map ID not configured');
      console.error('Map ID is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_ID to your .env.local file.');
      return;
    }

    try {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: currentLocation,
        zoom: 14,
        mapId: mapId,
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: true,
        tilt: 0,
      });

      // Initialize search service
      searchServiceRef.current = new RestaurantSearchService(mapInstanceRef.current);
      debug('Map initialized successfully');
    } catch (error) {
      debug('Error initializing map:', error);
      console.error('Error initializing map:', error);
    }
  }, [currentLocation]);

  // Filter restaurants
  const filteredRestaurants = useMemo(() => {
    return nearbyRestaurants.filter(restaurant => {
      if (filters.cuisine.length > 0 && restaurant.cuisine.length > 0 && 
          !filters.cuisine.some(fc => restaurant.cuisine.includes(fc))) return false;
      if (filters.openNow && !restaurant.isOpen) return false;
      if (typeof filters.rating === 'number' && restaurant.rating < filters.rating) return false;
      if (typeof filters.priceLevel === 'number' && restaurant.priceLevel > filters.priceLevel) return false;
      return true;
    });
  }, [nearbyRestaurants, filters]);

  // Update markers when filtered restaurants change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    debug('Updating markers for filtered restaurants');
    // Clear existing markers
    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];

    // Create new markers
    markersRef.current = filteredRestaurants.map(restaurant => {
      const markerElement = document.createElement('div');
      markerElement.className = 'marker-content';
      const icon = React.createElement(FaMapMarkerAlt, {
        style: {
          color: selectedRestaurant?.id === restaurant.id ? '#2563eb' : '#ef4444',
          transform: 'scale(1.5)'
        }
      });
      const root = createRoot(markerElement);
      root.render(icon);

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current!,
        position: restaurant.location,
        title: restaurant.name,
        content: markerElement
      });

      marker.addListener('click', () => {
        setSelectedRestaurant(restaurant);
        mapInstanceRef.current?.panTo(restaurant.location);
      });

      return marker;
    });

    // If we have restaurants but no selected one, fit bounds to show all markers
    if (markersRef.current.length > 0 && !selectedRestaurant) {
      const bounds = new google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.position as google.maps.LatLng);
      });
      mapInstanceRef.current.fitBounds(bounds, 50); // 50px padding
    }

    return () => {
      markersRef.current.forEach(marker => marker.map = null);
      markersRef.current = [];
    };
  }, [filteredRestaurants, selectedRestaurant]);

  // Search for restaurants when location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !currentLocation || !searchServiceRef.current) return;
    
    debug('Starting restaurant search for new location');
    setSelectedRestaurant(null); // Clear selected restaurant when location changes
    setNearbyRestaurants([]); // Clear existing restaurants
    searchServiceRef.current.searchNearbyRestaurants(
      currentLocation,
      (restaurant) => {
        setNearbyRestaurants(prev => {
          const existing = prev.find(r => r.id === restaurant.id);
          if (existing) {
            return prev.map(r => r.id === restaurant.id ? {
              ...restaurant,
              cuisine: existing.cuisine.length > 0 ? existing.cuisine : restaurant.cuisine
            } : r);
          }
          return [...prev, restaurant];
        });
      }
    );
  }, [currentLocation]);

  if (loadError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-4">
          <p className="text-red-500 mb-2">Error loading Google Maps. Please check your internet connection and try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto mb-8">
        <LocationSearch />
      </div>
      {!currentLocation ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Choose a Location</h2>
          <p className="text-gray-600">
            Please enter an address or allow location access to find restaurants near you.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[600px] relative bg-gray-100 rounded-lg overflow-hidden">
            <div id="map" className="h-full w-full" ref={mapRef} style={mapContainerStyle} />
          </div>
          <div className="lg:col-span-1">
            <RestaurantFilters />
            <div className="mt-8">
              <RestaurantList restaurants={filteredRestaurants} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to create marker content
function createMarkerContent(icon: JSX.Element): HTMLElement {
  const div = document.createElement('div');
  div.className = 'marker-content';
  div.style.display = 'flex';
  div.style.alignItems = 'center';
  div.style.justifyContent = 'center';
  div.style.width = '30px';
  div.style.height = '30px';
  div.style.cursor = 'pointer';
  
  // Create a temporary div to render the React component
  const tempDiv = document.createElement('div');
  const reactRoot = createRoot(tempDiv);
  reactRoot.render(icon);
  
  // Copy the rendered content immediately
  div.innerHTML = tempDiv.innerHTML;
  
  return div;
} 