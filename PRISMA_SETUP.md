# Prisma Setup for URL Shortener

This document outlines the Prisma setup for the URL shortener service.

## Overview

This project uses Prisma as the ORM (Object-Relational Mapping) tool to interact with MongoDB. Prisma provides type-safe database access, automatic migrations, and a powerful query API.

## Database Schema

### URL Model

```prisma
model Url {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  originalUrl String   @unique
  shortCode   String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("urls")
}
```

**Fields:**

- `id`: MongoDB ObjectId (primary key)
- `originalUrl`: The full URL to be shortened (unique)
- `shortCode`: The shortened code (unique)
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update (auto-updated)

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# MongoDB Connection
DATABASE_URL="mongodb://admin:password@localhost:27017/url-shortener?authSource=admin"

# Application Settings
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
SWAGGER_ENABLED=true

# MongoDB Docker Settings
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password
MONGO_INITDB_DATABASE=url-shortener

# Mongo Express Settings (for database administration)
ME_CONFIG_BASICAUTH_USERNAME=admin
ME_CONFIG_BASICAUTH_PASSWORD=admin123
```

### 2. Database Setup

Start the MongoDB container:

```bash
npm run docker:up
```

### 3. Generate Prisma Client

Generate the Prisma client based on the schema:

```bash
npm run db:generate
```

### 4. Push Schema to Database

Push the schema to MongoDB (for development):

```bash
npm run db:push
```

### 5. Seed Database

Populate the database with initial data:

```bash
npm run db:seed
```

## Available Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio (database browser)

## Usage Examples

### Creating URLs

```typescript
import { UrlModel } from "./src/models/url";

// Create a new URL mapping
const url = await UrlModel.create({
  originalUrl: "https://example.com",
  shortCode: "example",
});
```

### Finding URLs

```typescript
// Find by short code
const url = await UrlModel.findByShortCode("example");

// Find by original URL
const url = await UrlModel.findByOriginalUrl("https://example.com");

// Check if short code exists
const exists = await UrlModel.existsByShortCode("example");
```

### Using the URL Service

```typescript
import { UrlService } from "./src/services/urlService";

const urlService = new UrlService("http://localhost:3000");

// Shorten a URL
const result = await urlService.shortenUrl("https://very-long-url.com");
console.log(result.shortUrl); // http://localhost:3000/abc123

// Get original URL
const originalUrl = await urlService.getOriginalUrl("abc123");
console.log(originalUrl); // https://very-long-url.com
```

## Testing the Setup

Run the test script to verify everything is working:

```bash
npx ts-node src/test-prisma.ts
```

This script will:

1. Test database connection
2. Create a test URL
3. Retrieve URLs by short code and original URL
4. Test all CRUD operations
5. Clean up test data

## Seed Data

The seed file (`prisma/seed.ts`) contains initial data with popular websites and their short codes:

- `google` → https://www.google.com
- `github` → https://github.com
- `stack` → https://stackoverflow.com
- `mdn` → https://developer.mozilla.org/en-US/docs/Web
- `npm` → https://www.npmjs.com
- `prisma` → https://www.prisma.io
- And more...

## Database Administration

### Prisma Studio

Launch Prisma Studio to browse and edit your data:

```bash
npm run db:studio
```

### Mongo Express

Access the Mongo Express web interface at `http://localhost:8081` using:

- Username: admin
- Password: admin123

## Production Considerations

1. **Connection Pooling**: Prisma handles connection pooling automatically
2. **Error Handling**: All database operations should be wrapped in try-catch blocks
3. **Indexes**: The schema includes unique constraints which automatically create indexes
4. **Monitoring**: Consider adding database monitoring and logging

## File Structure

```
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── seed.ts               # Database seeding script
├── src/
│   ├── generated/
│   │   └── prisma/           # Generated Prisma client (auto-generated)
│   ├── models/
│   │   └── url.ts            # URL model with CRUD operations
│   ├── services/
│   │   └── urlService.ts     # Business logic for URL operations
│   ├── utils/
│   │   ├── prisma.ts         # Prisma client configuration
│   │   └── codeGenerator.ts  # Short code generation utilities
│   └── test-prisma.ts        # Test script for Prisma setup
```

## Troubleshooting

### Common Issues

1. **Connection Issues**: Ensure MongoDB is running and the DATABASE_URL is correct
2. **Schema Changes**: Run `npm run db:generate` after modifying the schema
3. **Type Errors**: Make sure Prisma client is generated before building TypeScript

### Logs

Enable Prisma query logging by updating the client configuration in `src/utils/prisma.ts`:

```typescript
global.prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
```

## Migration to Production

For production deployments:

1. Use a proper MongoDB connection string with credentials
2. Set `NODE_ENV=production`
3. Consider using Prisma migrations instead of `db push`
4. Implement proper error handling and logging
5. Use connection pooling and monitoring

## Task 2 Completion

✅ **Task 2: Design MongoDB Schema and Database Connection** is now complete with Prisma setup including:

- Prisma schema for URL mapping
- Type-safe database models
- Connection utilities
- Comprehensive seed data
- Testing utilities
- Docker integration
- Full documentation
