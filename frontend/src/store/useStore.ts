import { create } from 'zustand';
import type { MapRestaurant } from '@/types/map';

interface Location {
  lat: number;
  lng: number;
}

interface Filters {
  priceLevel: number[];
  cuisine: string[];
  rating: number;
  openNow: boolean;
}

interface Store {
  currentLocation: Location | null;
  setCurrentLocation: (location: Location) => void;
  nearbyRestaurants: MapRestaurant[];
  setNearbyRestaurants: (restaurants: MapRestaurant[] | ((prev: MapRestaurant[]) => MapRestaurant[])) => void;
  selectedRestaurant: MapRestaurant | null;
  setSelectedRestaurant: (restaurant: MapRestaurant | null) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  userId: string;
  setUserId: (id: string) => void;
}

const useStore = create<Store>((set) => ({
  currentLocation: null,
  setCurrentLocation: (location) => set({ currentLocation: location }),
  nearbyRestaurants: [],
  setNearbyRestaurants: (restaurantsOrUpdater) => 
    set((state) => ({ 
      nearbyRestaurants: typeof restaurantsOrUpdater === 'function' 
        ? restaurantsOrUpdater(state.nearbyRestaurants)
        : restaurantsOrUpdater 
    })),
  selectedRestaurant: null,
  setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
  filters: {
    priceLevel: [],
    cuisine: [],
    rating: 0,
    openNow: true,
  },
  setFilters: (filters) => set({ filters }),
  userId: 'anonymous',
  setUserId: (id) => set({ userId: id }),
}));

export default useStore; 