'use client';

import { useState } from 'react';
import useStore from '@/store/useStore';
import { Switch } from '@headlessui/react';
import { FaDollarSign, FaStar } from 'react-icons/fa';

const CUISINE_TYPES = [
  'American',
  'Italian',
  'Chinese',
  'Japanese',
  'Mexican',
  'Indian',
  'Thai',
  'Mediterranean',
] as const;

const PRICE_LEVELS = [1, 2, 3, 4] as const;
const RATING_LEVELS = [1, 2, 3, 4, 5] as const;

export default function RestaurantFilters() {
  const { filters, setFilters } = useStore();
  const [isOpen, setIsOpen] = useState(false);

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
        aria-expanded={isOpen}
        aria-controls="filter-panel"
      >
        <span>Filters</span>
        <svg
          className={`w-5 h-5 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
        <div id="filter-panel" className="space-y-4">
          <div className="mb-6" role="group" aria-labelledby="price-range-label">
            <h4 id="price-range-label" className="font-medium mb-2">Price Range</h4>
            <div className="flex space-x-2">
              {PRICE_LEVELS.map((price) => (
                <button
                  key={price}
                  onClick={() => handlePriceChange(price)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    filters.priceLevel.includes(price)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                  aria-pressed={filters.priceLevel.includes(price)}
                  aria-label={`Price level ${price}`}
                >
                  {Array(price)
                    .fill('$')
                    .map((_, i) => (
                      <FaDollarSign key={i} className="text-sm" aria-hidden="true" />
                    ))}
                </button>
              ))}
            </div>
          </div>

          <div role="group" aria-labelledby="cuisine-type-label">
            <h3 id="cuisine-type-label" className="font-medium mb-2">Cuisine Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {CUISINE_TYPES.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => handleCuisineChange(cuisine)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.cuisine.includes(cuisine)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  aria-pressed={filters.cuisine.includes(cuisine)}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6" role="group" aria-labelledby="rating-label">
            <h4 id="rating-label" className="font-medium mb-2">Minimum Rating</h4>
            <div className="flex space-x-2">
              {RATING_LEVELS.map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilters({ ...filters, rating })}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    filters.rating === rating
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                  aria-pressed={filters.rating === rating}
                  aria-label={`${rating} stars`}
                >
                  <FaStar aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <div role="group" aria-labelledby="additional-filters-label">
            <h4 id="additional-filters-label" className="font-medium mb-2">Additional Filters</h4>
            <div className="flex items-center justify-between">
              <span id="open-now-label">Open Now</span>
              <Switch
                checked={filters.openNow}
                onChange={(checked) =>
                  setFilters({ ...filters, openNow: checked })
                }
                className={`${
                  filters.openNow ? 'bg-blue-500' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                aria-labelledby="open-now-label"
              >
                <span className="sr-only">Toggle open now filter</span>
                <span
                  className={`${
                    filters.openNow ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  aria-hidden="true"
                />
              </Switch>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 