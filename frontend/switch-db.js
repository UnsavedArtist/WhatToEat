const fs = require('fs');
const path = require('path');

const devSchema = `datasource db {
  provider = "sqlite"
  url      = "file:./prisma/dev.db"
}`;

const prodSchema = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`;

const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');

function switchDatabase(mode) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const newContent = schemaContent.replace(
    /datasource db {[\s\S]*?}/,
    mode === 'dev' ? devSchema : prodSchema
  );
  fs.writeFileSync(schemaPath, newContent);
  console.log(`Switched to ${mode} database configuration`);
}

const mode = process.argv[2];
if (mode !== 'dev' && mode !== 'prod') {
  console.error('Please specify either "dev" or "prod"');
  process.exit(1);
}

switchDatabase(mode); 