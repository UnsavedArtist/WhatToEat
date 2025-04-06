const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to load environment variables from a file
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const envConfig = require('dotenv').parse(fs.readFileSync(filePath));
    for (const k in envConfig) {
      process.env[k] = envConfig[k];
    }
  }
}

// Determine the environment
const env = process.env.NODE_ENV || 'development';
console.log(`Generating Prisma schema for ${env} environment...`);

// Load the appropriate .env file
if (env === 'production') {
  loadEnvFile(path.resolve(__dirname, '../.env.production'));
} else {
  loadEnvFile(path.resolve(__dirname, '../.env.local'));
}

try {
  // Generate the Prisma client
  execSync('prisma generate', { stdio: 'inherit' });
  console.log('Schema generation completed successfully!');
} catch (error) {
  console.error('Error generating schema:', error);
  process.exit(1);
} 