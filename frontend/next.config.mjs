/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Enable WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Configure source maps
    config.devtool = 'source-map';

    return config;
  },
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  // Suppress WebAssembly source map warnings
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  serverRuntimeConfig: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  publicRuntimeConfig: {
    // Add any public runtime configs here if needed
  },
};

export default nextConfig; 