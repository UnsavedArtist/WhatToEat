import type { MapRestaurant } from '@/types/map';
import { RateLimiter } from './rateLimiter';

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
  private rateLimiter: RateLimiter;

  constructor(map: google.maps.Map) {
    this.placesService = new google.maps.places.PlacesService(map);
    // Set a conservative limit of 500 requests per day to stay well under the free tier
    this.rateLimiter = new RateLimiter(500);
  }

  private async searchCuisine(
    location: google.maps.LatLngLiteral, 
    cuisine: string,
    onRestaurantFound: (restaurant: MapRestaurant) => void
  ): Promise<void> {
    return new Promise<void>(async (resolve) => {
      try {
        // Rate limit check for nearbySearch
        await this.rateLimiter.waitForAvailability();
        
        const request: google.maps.places.PlaceSearchRequest = {
          location,
          type: 'restaurant',
          keyword: cuisine,
          rankBy: google.maps.places.RankBy.DISTANCE, // Use DISTANCE as it's a valid enum value
        };

        this.placesService.nearbySearch(request, async (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            debug(`Found ${results.length} restaurants for cuisine ${cuisine}`);
            // Limit to top 5 results per cuisine type, sorted by rating
            const limitedResults = results
              .sort((a, b) => (b.rating || 0) - (a.rating || 0))
              .slice(0, 5);
            debug(`Limited to top ${limitedResults.length} restaurants for cuisine ${cuisine}`);
            // Process results in smaller batches to avoid rate limiting issues
            const batchSize = 3;
            for (let i = 0; i < limitedResults.length; i += batchSize) {
              const batch = limitedResults.slice(i, i + batchSize);
              await Promise.all(batch.map(async (place) => {
                const placeId = place.place_id;
                if (placeId) {
                  try {
                    // Rate limit check for getDetails
                    await this.rateLimiter.waitForAvailability();

                    return new Promise<void>((detailsResolve) => {
                      this.placesService.getDetails(
                        {
                          placeId: placeId,
                          fields: [
                            'name',
                            'geometry',
                            'formatted_address',
                            'rating',
                            'price_level',
                            'types',
                            'business_status'
                          ],
                        },
                        (detailedPlace, detailedStatus) => {
                          if (detailedStatus === google.maps.places.PlacesServiceStatus.OK && detailedPlace) {
                            const isOperational = detailedPlace.business_status === 'OPERATIONAL';
                            // Assume open if operational since we're not fetching detailed hours to save on API costs
                            const isCurrentlyOpen = isOperational;

                            let primaryCuisine = '';
                            const name = detailedPlace.name?.toLowerCase() || '';
                            const nameWords = name.split(/[\s-.,&()]+/);
                            
                            for (const [key, value] of Object.entries(CUISINE_TYPE_MAPPING)) {
                              if (value && nameWords.includes(key)) {
                                primaryCuisine = value;
                                break;
                              }
                            }

                            if (!primaryCuisine && CUISINE_TYPE_MAPPING[cuisine.toLowerCase()]) {
                              primaryCuisine = CUISINE_TYPE_MAPPING[cuisine.toLowerCase()];
                            }

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
                              id: placeId!,
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
                            debug(`Added restaurant: ${restaurant.name} (${restaurant.cuisine.join(', ')})`);
                          }
                          detailsResolve();
                        }
                      );
                    });
                  } catch (error) {
                    debug('Rate limit reached during details fetch:', error);
                  }
                }
              }));
              
              // Add a small delay between batches to avoid overwhelming the API
              await new Promise(r => setTimeout(r, 200));
            }
          }
          resolve();
        });
      } catch (error) {
        debug('Rate limit reached during nearby search:', error);
        resolve();
      }
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

    const remainingRequests = this.rateLimiter.getRemainingRequests();
    if (remainingRequests < 10) {
      throw new Error(`API rate limit nearly reached. Only ${remainingRequests} requests remaining. Please try again later.`);
    }

    debug('Starting restaurant search at location:', location);
    this.searchInProgress = true;

    try {
      // Search for each cuisine type in smaller batches
      const cuisineTypes = ['American', 'Italian', 'Chinese', 'Japanese', 'Mexican', 'Indian', 'Thai', 'Mediterranean'];
      for (let i = 0; i < cuisineTypes.length; i += 2) { // Reduced batch size from 3 to 2
        const batch = cuisineTypes.slice(i, i + 2);
        await Promise.all(batch.map(cuisine => this.searchCuisine(location, cuisine, onRestaurantFound)));
        // Add delay between cuisine type batches
        if (i + 2 < cuisineTypes.length) {
          await new Promise(r => setTimeout(r, 500));
        }
      }
    } catch (error) {
      console.error('Error searching for restaurants:', error);
      throw error;
    } finally {
      this.searchInProgress = false;
      debug('Restaurant search completed');
    }
  }
} 