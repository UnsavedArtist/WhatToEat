'use client';

import { useEffect } from 'react';
import { GoogleMap, useLoadScript, MarkerF, Libraries } from '@react-google-maps/api';
import useStore from '@/store/useStore';
import RestaurantFilters from '@/components/RestaurantFilters';
import RestaurantList from '@/components/RestaurantList';
import LoadingSpinner from '@/components/LoadingSpinner';

const libraries: Libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

export default function MapClient() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    libraries,
  });

  const {
    currentLocation,
    setCurrentLocation,
    nearbyRestaurants,
    setNearbyRestaurants,
    selectedRestaurant,
    setSelectedRestaurant,
  } = useStore();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a central location if geolocation fails
          setCurrentLocation({ lat: 40.7128, lng: -74.0060 });
        }
      );
    }
  }, [setCurrentLocation]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={14}
            center={currentLocation || { lat: 40.7128, lng: -74.0060 }}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              streetViewControl: true,
            }}
          >
            {currentLocation && (
              <MarkerF
                position={currentLocation}
                icon={{
                  url: '/user-location.png',
                  scaledSize: new window.google.maps.Size(30, 30),
                }}
              />
            )}
            {nearbyRestaurants.map((restaurant) => (
              <MarkerF
                key={restaurant.id}
                position={restaurant.location}
                onClick={() => setSelectedRestaurant(restaurant)}
                animation={
                  selectedRestaurant?.id === restaurant.id
                    ? window.google.maps.Animation.BOUNCE
                    : undefined
                }
              />
            ))}
          </GoogleMap>
        </div>
        <div>
          <RestaurantFilters />
          <RestaurantList />
        </div>
      </div>
    </div>
  );
} 