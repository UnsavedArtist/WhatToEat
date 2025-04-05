'use client';

import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('./MapClient'), {
  loading: () => (
    <div className="flex justify-center items-center min-h-[600px]">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  ),
});

export default function MapPage() {
  return <MapClient />;
}