'use client';

import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { GoogleMap, useLoadScript, Libraries } from '@react-google-maps/api';
import useStore from '@/store/useStore';
import type { MapRestaurant } from '@/types/map';
import RestaurantFilters from '@/components/RestaurantFilters';
import RestaurantList from '@/components/RestaurantList';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import { createRoot } from 'react-dom/client';
import React from 'react';

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
  console.log('[DEBUG] MapClient rendering at:', new Date().toISOString());
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    libraries,
    version: "weekly",
    language: "en",
    region: "US",
  });

  const {
    currentLocation,
    setCurrentLocation,
    nearbyRestaurants,
    setNearbyRestaurants,
    selectedRestaurant,
    setSelectedRestaurant,
    filters,
  } = useStore();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const searchInProgressRef = useRef(false);

  // Initialize map when location is available
  useEffect(() => {
    if (!currentLocation || !mapRef.current || mapInstanceRef.current) return;

    const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID;
    if (!mapId) {
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

      // Update center when location changes
      mapInstanceRef.current.setCenter(currentLocation);
    } catch (error) {
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
      });

      return marker;
    });

    return () => {
      markersRef.current.forEach(marker => marker.map = null);
      markersRef.current = [];
    };
  }, [filteredRestaurants, selectedRestaurant]);

  const searchNearbyRestaurants = useCallback(async (location: google.maps.LatLngLiteral) => {
    if (searchInProgressRef.current) return;
    searchInProgressRef.current = true;
    setNearbyRestaurants([]);

    const service = new google.maps.places.PlacesService(mapInstanceRef.current!);

    // Function to search for restaurants of a specific cuisine
    const searchCuisine = async (cuisine: string) => {
      return new Promise<void>((resolve) => {
        const request = {
          location,
          radius: 1500,
          type: 'restaurant',
          keyword: cuisine,
        };

        service.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            results.forEach((place) => {
              if (place.place_id) {
                service.getDetails(
                  {
                    placeId: place.place_id,
                    fields: [
                      'name',
                      'geometry',
                      'formatted_address',
                      'rating',
                      'price_level',
                      'types',
                      'opening_hours',
                      'current_opening_hours',
                      'business_status'
                    ],
                  },
                  (detailedPlace, detailedStatus) => {
                    if (detailedStatus === google.maps.places.PlacesServiceStatus.OK && detailedPlace) {
                      const isOperational = detailedPlace.business_status === 'OPERATIONAL';
                      let isCurrentlyOpen = false;

                      try {
                        if ((detailedPlace as any).current_opening_hours?.open_now) {
                          isCurrentlyOpen = true;
                        } else if (detailedPlace.opening_hours?.isOpen()) {
                          isCurrentlyOpen = true;
                        } else if (place.opening_hours?.isOpen()) {
                          isCurrentlyOpen = true;
                        }

                        if (!isCurrentlyOpen && 
                            isOperational && 
                            detailedPlace.opening_hours === undefined && 
                            (detailedPlace as any).current_opening_hours === undefined) {
                          isCurrentlyOpen = true;
                        }
                      } catch (error) {
                        isCurrentlyOpen = true;
                      }

                      // Determine the most relevant cuisine type
                      let primaryCuisine = '';

                      // First priority: exact match in name
                      const name = detailedPlace.name?.toLowerCase() || '';
                      const nameWords = name.split(/[\s-.,&()]+/);
                      for (const [key, value] of Object.entries(CUISINE_TYPE_MAPPING)) {
                        if (value && nameWords.includes(key)) {
                          primaryCuisine = value;
                          break;
                        }
                      }

                      // Second priority: search keyword
                      if (!primaryCuisine && CUISINE_TYPE_MAPPING[cuisine.toLowerCase()]) {
                        primaryCuisine = CUISINE_TYPE_MAPPING[cuisine.toLowerCase()];
                      }

                      // Third priority: place types
                      if (!primaryCuisine) {
                        for (const type of detailedPlace.types || []) {
                          const mappedType = CUISINE_TYPE_MAPPING[type.toLowerCase()];
                          if (mappedType) {
                            primaryCuisine = mappedType;
                            break;
                          }
                        }
                      }

                      const restaurant = {
                        id: place.place_id!,
                        name: detailedPlace.name!,
                        location: {
                          lat: detailedPlace.geometry!.location!.lat(),
                          lng: detailedPlace.geometry!.location!.lng(),
                        },
                        address: detailedPlace.formatted_address!,
                        rating: detailedPlace.rating || 0,
                        priceLevel: detailedPlace.price_level || 1,
                        cuisine: primaryCuisine ? [primaryCuisine] : [],
                        isOpen: isOperational && isCurrentlyOpen,
                      };

                      setNearbyRestaurants((prev: MapRestaurant[]) => {
                        const existing = prev.find(r => r.id === restaurant.id);
                        if (existing) {
                          // Keep the first cuisine we found
                          return prev.map(r => r.id === restaurant.id ? {
                            ...restaurant,
                            cuisine: existing.cuisine.length > 0 ? existing.cuisine : restaurant.cuisine
                          } : r);
                        }
                        return [...prev, restaurant];
                      });
                    }
                  }
                );
              }
            });
          }
          resolve();
        });
      });
    };

    // Search for each cuisine type
    const cuisineTypes = ['American', 'Italian', 'Chinese', 'Japanese', 'Mexican', 'Indian', 'Thai', 'Mediterranean'];
    for (let i = 0; i < cuisineTypes.length; i += 3) {
      const batch = cuisineTypes.slice(i, i + 3);
      await Promise.all(batch.map(cuisine => searchCuisine(cuisine)));
    }

    searchInProgressRef.current = false;
  }, []);

  // Search for restaurants when location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !currentLocation) return;
    searchNearbyRestaurants(currentLocation);
  }, [currentLocation, searchNearbyRestaurants]);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[800px]" ref={mapRef} style={mapContainerStyle} />
        <div className="lg:col-span-1">
          <RestaurantFilters />
          <div className="mt-8">
            <RestaurantList restaurants={filteredRestaurants} />
          </div>
        </div>
      </div>
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