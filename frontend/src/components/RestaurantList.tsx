'use client';

import useStore from '@/store/useStore';

export default function RestaurantList() {
  const { nearbyRestaurants, selectedRestaurant, setSelectedRestaurant } = useStore();

  if (nearbyRestaurants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <p className="text-gray-500 text-center">No restaurants found nearby.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="max-h-[600px] overflow-y-auto">
        {nearbyRestaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            onClick={() => setSelectedRestaurant(restaurant)}
            className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedRestaurant?.id === restaurant.id ? 'bg-blue-50' : ''
            }`}
          >
            <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span>{restaurant.rating} ★</span>
              <span>•</span>
              <span>{restaurant.priceLevel}</span>
              <span>•</span>
              <span>{restaurant.cuisine.join(', ')}</span>
            </div>
            <p className="text-sm text-gray-500">{restaurant.address}</p>
            {restaurant.isOpen && (
              <span className="inline-block mt-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Open Now
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}