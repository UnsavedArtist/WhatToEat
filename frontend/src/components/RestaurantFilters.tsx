'use client';

import { useState } from 'react';
import useStore from '@/store/useStore';
import { Switch } from '@headlessui/react';
import { FaDollarSign, FaStar } from 'react-icons/fa';

export default function RestaurantFilters() {
  const { filters, setFilters } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const priceRanges = ['$', '$$', '$$$', '$$$$'];
  const cuisineTypes = [
    'American',
    'Italian',
    'Chinese',
    'Japanese',
    'Mexican',
    'Indian',
    'Thai',
    'Mediterranean',
  ];

  const handleCuisineChange = (cuisine: string) => {
    const newCuisines = filters.cuisine.includes(cuisine)
      ? filters.cuisine.filter((c) => c !== cuisine)
      : [...filters.cuisine, cuisine];
    setFilters({ ...filters, cuisine: newCuisines });
  };

  const handlePriceChange = (price: number) => {
    const newPrices = filters.priceLevel.includes(price)
      ? filters.priceLevel.filter((p) => p !== price)
      : [...filters.priceLevel, price];
    setFilters({ ...filters, priceLevel: newPrices });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-lg font-semibold mb-2"
      >
        Filters
        <svg
          className={`w-5 h-5 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Price Range</h3>
            <div className="flex gap-2">
              {priceRanges.map((price) => (
                <button
                  key={price}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      priceLevel: filters.priceLevel === price ? null : price,
                    })
                  }
                  className={`px-3 py-1 rounded-full ${
                    filters.priceLevel === price
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {price}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Cuisine Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {cuisineTypes.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      cuisineType: filters.cuisineType === cuisine ? null : cuisine,
                    })
                  }
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.cuisineType === cuisine
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium mb-2">Price Range</h4>
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((price) => (
                <button
                  key={price}
                  onClick={() => handlePriceChange(price)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    filters.priceLevel.includes(price)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {Array(price)
                    .fill('$')
                    .map((_, i) => (
                      <FaDollarSign key={i} className="text-sm" />
                    ))}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium mb-2">Minimum Rating</h4>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilters({ ...filters, rating })}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    filters.rating === rating
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <FaStar />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Additional Filters</h4>
            <div className="flex items-center justify-between">
              <span>Open Now</span>
              <Switch
                checked={filters.openNow}
                onChange={(checked) =>
                  setFilters({ ...filters, openNow: checked })
                }
                className={`${
                  filters.openNow ? 'bg-blue-500' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    filters.openNow ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 