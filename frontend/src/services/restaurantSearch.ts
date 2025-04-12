import type { MapRestaurant } from '@/types/map';

const DEBUG = false;

const debug = (...args: any[]) => {
  if (DEBUG) {
    console.debug('[RestaurantSearch]', ...args);
  }
};

class HourlyRateLimiter {
  private static instance: HourlyRateLimiter;
  private requestTimes: number[] = [];
  private readonly maxRequestsPerHour: number = 5;
  private readonly hourInMs: number = 60 * 60 * 1000;

  private constructor() {}

  static getInstance(): HourlyRateLimiter {
    if (!HourlyRateLimiter.instance) {
      HourlyRateLimiter.instance = new HourlyRateLimiter();
    }
    return HourlyRateLimiter.instance;
  }

  async checkRateLimit(): Promise<void> {
    const now = Date.now();
    // Remove requests older than 1 hour
    this.requestTimes = this.requestTimes.filter(time => now - time < this.hourInMs);
    
    if (this.requestTimes.length >= this.maxRequestsPerHour) {
      const oldestRequest = this.requestTimes[0];
      const timeUntilNextSlot = (oldestRequest + this.hourInMs) - now;
      throw new Error(`Rate limit exceeded. Please try again in ${Math.ceil(timeUntilNextSlot / (60 * 1000))} minutes.`);
    }

    this.requestTimes.push(now);
  }

  getRemainingRequests(): number {
    const now = Date.now();
    this.requestTimes = this.requestTimes.filter(time => now - time < this.hourInMs);
    return Math.max(0, this.maxRequestsPerHour - this.requestTimes.length);
  }

  getTimeUntilNextRequest(): number {
    if (this.requestTimes.length < this.maxRequestsPerHour) return 0;
    const now = Date.now();
    const oldestRequest = this.requestTimes[0];
    return Math.max(0, (oldestRequest + this.hourInMs) - now);
  }
}

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
  private hourlyRateLimiter: HourlyRateLimiter;

  constructor(map: google.maps.Map) {
    this.placesService = new google.maps.places.PlacesService(map);
    this.hourlyRateLimiter = HourlyRateLimiter.getInstance();
  }

  async searchNearbyRestaurants(
    location: google.maps.LatLngLiteral,
    onRestaurantFound: (restaurant: MapRestaurant) => void
  ): Promise<void> {
    if (this.searchInProgress) {
      debug('Search already in progress');
      return;
    }

    // Check hourly rate limit
    await this.hourlyRateLimiter.checkRateLimit();

    const remainingRequests = this.hourlyRateLimiter.getRemainingRequests();
    debug(`Remaining requests this hour: ${remainingRequests}`);

    debug('Starting restaurant search at location:', location);
    this.searchInProgress = true;

    try {
      const request: google.maps.places.PlaceSearchRequest = {
        location,
        type: 'restaurant',
        rankBy: google.maps.places.RankBy.DISTANCE,
      };

      await new Promise<void>((resolve) => {
        this.placesService.nearbySearch(request, async (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            debug(`Found ${results.length} restaurants`);
            // Limit to top 20 results, sorted by rating
            const limitedResults = results
              .sort((a, b) => (b.rating || 0) - (a.rating || 0))
              .slice(0, 20);
            debug(`Limited to top ${limitedResults.length} restaurants`);

            // Process results directly from nearbySearch to avoid additional API calls
            limitedResults.forEach((place) => {
              if (!place.place_id) return;

              // Determine cuisine type from place types
              let primaryCuisine = '';
              if (place.types) {
                for (const type of place.types) {
                  const mappedType = CUISINE_TYPE_MAPPING[type.toLowerCase()];
                  if (mappedType) {
                    primaryCuisine = mappedType;
                    break;
                  }
                }
              }

              // If no cuisine found from types, try name matching
              if (!primaryCuisine && place.name) {
                const name = place.name.toLowerCase();
                const nameWords = name.split(/[\s-.,&()]+/);
                for (const [key, value] of Object.entries(CUISINE_TYPE_MAPPING)) {
                  if (value && nameWords.includes(key)) {
                    primaryCuisine = value;
                    break;
                  }
                }
              }

              const restaurant: MapRestaurant = {
                id: place.place_id,
                name: place.name || 'Unknown Restaurant',
                location: {
                  lat: place.geometry?.location?.lat() || 0,
                  lng: place.geometry?.location?.lng() || 0,
                },
                address: place.vicinity || '',
                rating: place.rating || 0,
                priceLevel: place.price_level || 1,
                cuisine: primaryCuisine ? [primaryCuisine] : [],
                isOpen: place.business_status === 'OPERATIONAL',
              };

              onRestaurantFound(restaurant);
              debug(`Added restaurant: ${restaurant.name} (${restaurant.cuisine.join(', ')})`);
            });
          }
          resolve();
        });
      });
    } catch (error) {
      console.error('Error searching for restaurants:', error);
      throw error;
    } finally {
      this.searchInProgress = false;
      debug('Restaurant search completed');
    }
  }
} 