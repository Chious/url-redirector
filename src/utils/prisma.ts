import { PrismaClient } from "../../generated/prisma_client";

declare global {
  // Allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env["NODE_ENV"] === "production") {
  prisma = new PrismaClient();
} else {
  // In development, use a global variable to avoid creating multiple instances
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["query", "info", "warn", "error"],
    });
  }
  prisma = global.prisma;
}

export default prisma;

/**
 * Gracefully disconnect from the database
 */
export const disconnect = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error disconnecting from database:", error);
  }
};

/**
 * Test the database connection
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    console.log("✅ Successfully connected to MongoDB");
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    return false;
  }
};
