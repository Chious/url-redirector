import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import {
  shortenUrl,
  redirectUrl,
  getUrlStats,
  shortenUrlValidation,
  shortCodeValidation,
} from "../../src/controllers/urlController";
import UrlService from "../../src/services/urlService";

// Mock UrlService
vi.mock("../../src/services/urlService", () => ({
  default: vi.fn(),
  UrlService: vi.fn(),
}));

const mockUrlService = vi.mocked(UrlService);

describe("UrlController", () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
  });

  describe("POST /shorten", () => {
    beforeEach(() => {
      app.post("/shorten", shortenUrlValidation, shortenUrl);
    });

    it("should shorten URL successfully", async () => {
      const mockResult = {
        shortUrl: "http://localhost:3000/abc123",
        originalUrl: "https://example.com",
        shortCode: "abc123",
        isNew: true,
        qrCodeUrl: "http://localhost:3000/api/qr/abc123",
      };

      const mockInstance = {
        shortenUrl: vi.fn().mockResolvedValue(mockResult),
      };
      vi.mocked(UrlService).mockImplementation(() => mockInstance as any);

      const response = await request(app)
        .post("/shorten")
        .send({ url: "https://example.com" })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: "URL shortened successfully",
        data: mockResult,
      });
    });

    it("should return existing URL if not new", async () => {
      const mockResult = {
        shortUrl: "http://localhost:3000/existing",
        originalUrl: "https://example.com",
        shortCode: "existing",
        isNew: false,
        qrCodeUrl: "http://localhost:3000/api/qr/existing",
      };

      const mockInstance = {
        shortenUrl: vi.fn().mockResolvedValue(mockResult),
      };
      vi.mocked(UrlService).mockImplementation(() => mockInstance as any);

      const response = await request(app)
        .post("/shorten")
        .send({ url: "https://example.com" })
        .expect(200);

      expect(response.body.message).toBe("URL already exists");
    });

    it("should validate URL format", async () => {
      const response = await request(app)
        .post("/shorten")
        .send({ url: "invalid-url" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");
    });

    it("should require URL field", async () => {
      const response = await request(app).post("/shorten").send({}).expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should handle service errors", async () => {
      const mockInstance = {
        shortenUrl: vi.fn().mockRejectedValue(new Error("Service error")),
      };
      vi.mocked(UrlService).mockImplementation(() => mockInstance as any);

      const response = await request(app)
        .post("/shorten")
        .send({ url: "https://example.com" })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Internal server error");
    });
  });

  describe("GET /:shortCode", () => {
    beforeEach(() => {
      app.get("/:shortCode", shortCodeValidation, redirectUrl);
    });

    it("should redirect to original URL", async () => {
      const mockInstance = {
        getOriginalUrl: vi.fn().mockResolvedValue("https://example.com"),
      };
      vi.mocked(UrlService).mockImplementation(() => mockInstance as any);

      const response = await request(app).get("/abc123").expect(302);

      expect(response.headers.location).toBe("https://example.com");
    });

    it("should return 404 if URL not found", async () => {
      const mockInstance = {
        getOriginalUrl: vi.fn().mockResolvedValue(null),
      };
      vi.mocked(UrlService).mockImplementation(() => mockInstance as any);

      const response = await request(app).get("/nonexistent").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Short URL not found");
    });

    it("should validate short code format", async () => {
      const response = await request(app)
        .get("/a") // Too short
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should handle service errors", async () => {
      const mockInstance = {
        getOriginalUrl: vi.fn().mockRejectedValue(new Error("Service error")),
      };
      vi.mocked(UrlService).mockImplementation(() => mockInstance as any);

      const response = await request(app).get("/abc123").expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /stats/:shortCode", () => {
    beforeEach(() => {
      app.get("/stats/:shortCode", shortCodeValidation, getUrlStats);
    });

    it("should return URL statistics", async () => {
      const mockStats = {
        originalUrl: "https://example.com",
        shortCode: "abc123",
        clickCount: 42,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      };

      const mockInstance = {
        getUrlStats: vi.fn().mockResolvedValue(mockStats),
      };
      vi.mocked(UrlService).mockImplementation(() => mockInstance as any);

      const response = await request(app).get("/stats/abc123").expect(200);

      expect(response.body).toEqual({
        success: true,
        message: "URL statistics retrieved successfully",
        data: mockStats,
      });
    });

    it("should return 404 if URL not found", async () => {
      const mockInstance = {
        getUrlStats: vi.fn().mockResolvedValue(null),
      };
      vi.mocked(UrlService).mockImplementation(() => mockInstance as any);

      const response = await request(app).get("/stats/nonexistent").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Short URL not found");
    });
  });
});
