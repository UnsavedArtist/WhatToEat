export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  tasteProfile?: TasteProfile;
  preferredCuisines: string[];
  visitedRestaurants: VisitedRestaurant[];
}

export interface TasteProfile {
  spicyPreference: number; // 1-5
  priceRange: number; // 1-4
  dietaryRestrictions: string[];
  favoriteTypes: string[];
}

export interface VisitedRestaurant {
  id: string;
  restaurantId: string;
  userId: string;
  visitDate: Date;
  rating: number;
  review?: string;
  dishes: {
    name: string;
    rating: number;
    review?: string;
  }[];
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  cuisine: string[];
  priceLevel: number;
  rating: number;
  photos?: string[];
  openingHours: {
    [key: string]: string;
  };
}