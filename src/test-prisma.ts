/**
 * Test script to verify Prisma setup
 * Run with: npx ts-node src/test-prisma.ts
 */
import dotenv from "dotenv";
import prisma, { testConnection, disconnect } from "./utils/prisma";
import { UrlModel } from "./models/url";
import { generateShortCode } from "./utils/codeGenerator";

// Load environment variables
dotenv.config();

async function testPrismaSetup() {
  console.log("🧪 Testing Prisma setup...\n");

  try {
    // Test 1: Database connection
    console.log("1️⃣ Testing database connection...");
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error("Failed to connect to database");
    }
    console.log("✅ Database connection successful\n");

    // Test 2: Create a test URL
    console.log("2️⃣ Testing URL creation...");
    const testData = {
      originalUrl: "https://test.example.com",
      shortCode: generateShortCode(),
    };

    const createdUrl = await UrlModel.create(testData);
    console.log(
      `✅ Created URL: ${createdUrl.shortCode} -> ${createdUrl.originalUrl}`
    );
    console.log(`   ID: ${createdUrl.id}`);
    console.log(`   Created: ${createdUrl.createdAt}\n`);

    // Test 3: Find URL by short code
    console.log("3️⃣ Testing URL retrieval by short code...");
    const foundUrl = await UrlModel.findByShortCode(testData.shortCode);
    if (foundUrl) {
      console.log(
        `✅ Found URL: ${foundUrl.shortCode} -> ${foundUrl.originalUrl}\n`
      );
    } else {
      throw new Error("Failed to find URL by short code");
    }

    // Test 4: Find URL by original URL
    console.log("4️⃣ Testing URL retrieval by original URL...");
    const foundByOriginal = await UrlModel.findByOriginalUrl(
      testData.originalUrl
    );
    if (foundByOriginal) {
      console.log(
        `✅ Found URL: ${foundByOriginal.originalUrl} -> ${foundByOriginal.shortCode}\n`
      );
    } else {
      throw new Error("Failed to find URL by original URL");
    }

    // Test 5: Check if short code exists
    console.log("5️⃣ Testing short code existence check...");
    const exists = await UrlModel.existsByShortCode(testData.shortCode);
    if (exists) {
      console.log(`✅ Short code existence check passed\n`);
    } else {
      throw new Error("Short code existence check failed");
    }

    // Test 6: Count URLs
    console.log("6️⃣ Testing URL count...");
    const count = await UrlModel.count();
    console.log(`✅ Total URLs in database: ${count}\n`);

    // Test 7: Update timestamp
    console.log("7️⃣ Testing URL touch (update timestamp)...");
    const touchedUrl = await UrlModel.touch(createdUrl.id);
    console.log(`✅ Updated timestamp: ${touchedUrl.updatedAt}\n`);

    // Test 8: List all URLs
    console.log("8️⃣ Testing URL listing...");
    const allUrls = await UrlModel.findAll();
    console.log(`✅ Retrieved ${allUrls.length} URLs from database\n`);

    // Test 9: Clean up - delete test URL
    console.log("9️⃣ Testing URL deletion...");
    await UrlModel.deleteByShortCode(testData.shortCode);
    const deletedCheck = await UrlModel.findByShortCode(testData.shortCode);
    if (!deletedCheck) {
      console.log(`✅ Successfully deleted test URL\n`);
    } else {
      throw new Error("Failed to delete test URL");
    }

    console.log("🎉 All tests passed! Prisma setup is working correctly.");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  } finally {
    await disconnect();
    console.log("\n👋 Test completed");
  }
}

// Run the test
if (require.main === module) {
  testPrismaSetup();
}

export default testPrismaSetup;
