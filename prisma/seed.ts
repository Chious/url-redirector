import { PrismaClient } from "../generated/prisma_client";

const prisma = new PrismaClient();

/**
 * Seed data for the URL shortener database
 */
const seedData = [
  {
    originalUrl: "https://www.google.com",
    shortCode: "google",
  },
  {
    originalUrl: "https://github.com",
    shortCode: "github",
  },
  {
    originalUrl: "https://stackoverflow.com",
    shortCode: "stack",
  },
  {
    originalUrl: "https://developer.mozilla.org/en-US/docs/Web",
    shortCode: "mdn",
  },
  {
    originalUrl: "https://www.npmjs.com",
    shortCode: "npm",
  },
  {
    originalUrl: "https://www.typescriptlang.org",
    shortCode: "ts",
  },
  {
    originalUrl: "https://reactjs.org",
    shortCode: "react",
  },
  {
    originalUrl: "https://nodejs.org",
    shortCode: "node",
  },
  {
    originalUrl: "https://www.mongodb.com",
    shortCode: "mongo",
  },
  {
    originalUrl: "https://expressjs.com",
    shortCode: "express",
  },
  {
    originalUrl: "https://www.prisma.io",
    shortCode: "prisma",
  },
  {
    originalUrl: "https://www.docker.com",
    shortCode: "docker",
  },
  {
    originalUrl: "https://swagger.io",
    shortCode: "swagger",
  },
  {
    originalUrl: "https://jwt.io",
    shortCode: "jwt",
  },
  {
    originalUrl: "https://www.postman.com",
    shortCode: "postman",
  },
  // Examples with longer URLs to demonstrate the shortening benefit
  {
    originalUrl:
      "https://www.example.com/very/long/path/to/some/resource/with/many/parameters?param1=value1&param2=value2&param3=value3",
    shortCode: "ex1",
  },
  {
    originalUrl:
      "https://documentation.site.com/guides/getting-started/installation/prerequisites/system-requirements",
    shortCode: "docs",
  },
  {
    originalUrl:
      "https://blog.example.com/articles/2024/how-to-build-a-url-shortener-with-nodejs-express-mongodb-and-typescript",
    shortCode: "blog1",
  },
  {
    originalUrl:
      "https://api.service.com/v1/users/profile/settings/notifications/email/preferences/manage",
    shortCode: "api1",
  },
  {
    originalUrl:
      "https://ecommerce.example.com/products/electronics/computers/laptops/gaming/high-performance/brand-xyz/model-abc-123?color=black&size=15inch&memory=32gb",
    shortCode: "shop1",
  },
];

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Check if data already exists
    const existingCount = await prisma.url.count();

    if (existingCount > 0) {
      console.log(
        `📊 Database already contains ${existingCount} URLs. Skipping seed as data exists.`
      );
      console.log("💡 To reseed, manually clear the database first.");

      // Display existing data info instead of clearing
      const existingUrls = await prisma.url.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      });

      console.log(`📋 Sample existing URLs:`);
      existingUrls.forEach((url) => {
        console.log(`   ${url.shortCode} -> ${url.originalUrl}`);
      });

      return;
    }

    // Insert seed data
    console.log(`📝 Inserting ${seedData.length} URL mappings...`);

    for (const data of seedData) {
      await prisma.url.create({
        data: {
          originalUrl: data.originalUrl,
          shortCode: data.shortCode,
        },
      });

      console.log(`✅ Created: ${data.shortCode} -> ${data.originalUrl}`);
    }

    // Verify the seeding
    const finalCount = await prisma.url.count();
    console.log(`\n🎉 Seeding completed successfully!`);
    console.log(`📊 Total URLs in database: ${finalCount}`);

    // Display some sample URLs for testing
    console.log("\n🔗 Sample short URLs you can test:");
    console.log("   http://localhost:3000/google (Google)");
    console.log("   http://localhost:3000/github (GitHub)");
    console.log("   http://localhost:3000/stack (Stack Overflow)");
    console.log("   http://localhost:3000/prisma (Prisma)");
    console.log("   http://localhost:3000/docs (Long documentation URL)");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("💥 Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("👋 Disconnected from database");
  });
