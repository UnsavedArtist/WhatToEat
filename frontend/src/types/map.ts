export interface MapRestaurant {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  rating: number;
  priceLevel: number;
  cuisine: string[];
  isOpen: boolean;
}

declare global {
  interface Window {
    google: typeof google;
  }
} 