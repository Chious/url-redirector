import { vi } from "vitest";

// Mock environment variables
process.env.MONGODB_URI = "mongodb://localhost:27017/test";
process.env.BASE_URL = "http://localhost:3000";
process.env.NODE_ENV = "test";

// Mock Prisma client globally
vi.mock("../src/utils/prisma", () => ({
  default: {
    url: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));
