import type { MapRestaurant } from '@/types/map';

const DEBUG = false;

const debug = (...args: any[]) => {
  if (DEBUG) {
    console.debug('[RestaurantSearch]', ...args);
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

export class RestaurantSearchService {
  private searchInProgress: boolean = false;
  private placesService: google.maps.places.PlacesService;

  constructor(map: google.maps.Map) {
    this.placesService = new google.maps.places.PlacesService(map);
  }

  private async searchCuisine(
    location: google.maps.LatLngLiteral, 
    cuisine: string,
    onRestaurantFound: (restaurant: MapRestaurant) => void
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const request = {
        location,
        radius: 1500,
        type: 'restaurant',
        keyword: cuisine,
      };

      this.placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          results.forEach((place) => {
            if (place.place_id) {
              this.placesService.getDetails(
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

                    onRestaurantFound(restaurant);
                  }
                }
              );
            }
          });
        }
        resolve();
      });
    });
  }

  async searchNearbyRestaurants(
    location: google.maps.LatLngLiteral,
    onRestaurantFound: (restaurant: MapRestaurant) => void
  ): Promise<void> {
    if (this.searchInProgress) {
      debug('Search already in progress');
      return;
    }

    debug('Starting restaurant search at location:', location);
    this.searchInProgress = true;

    try {
      // Search for each cuisine type
      const cuisineTypes = ['American', 'Italian', 'Chinese', 'Japanese', 'Mexican', 'Indian', 'Thai', 'Mediterranean'];
      for (let i = 0; i < cuisineTypes.length; i += 3) {
        const batch = cuisineTypes.slice(i, i + 3);
        await Promise.all(batch.map(cuisine => this.searchCuisine(location, cuisine, onRestaurantFound)));
      }
    } catch (error) {
      console.error('Error searching for restaurants:', error);
    } finally {
      this.searchInProgress = false;
      debug('Restaurant search completed');
    }
  }
} 