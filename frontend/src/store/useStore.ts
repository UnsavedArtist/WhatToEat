import { create } from 'zustand';

interface Location {
  lat: number;
  lng: number;
}

interface Restaurant {
  id: string;
  name: string;
  location: Location;
  address: string;
  rating: number;
  priceLevel: number;
  cuisine: string[];
  isOpen: boolean;
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
  nearbyRestaurants: Restaurant[];
  setNearbyRestaurants: (restaurants: Restaurant[]) => void;
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

const useStore = create<Store>((set) => ({
  currentLocation: null,
  setCurrentLocation: (location) => set({ currentLocation: location }),
  nearbyRestaurants: [],
  setNearbyRestaurants: (restaurants) => set({ nearbyRestaurants: restaurants }),
  selectedRestaurant: null,
  setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
  filters: {
    priceLevel: [],
    cuisine: [],
    rating: 0,
    openNow: false,
  },
  setFilters: (filters) => set({ filters }),
}));

export default useStore; 