import { describe, it, expect, vi, beforeEach } from "vitest";
import { UrlService } from "../../src/services/urlService";
import { UrlModel } from "../../src/models/url";

// Mock the dependencies
vi.mock("../../src/models/url");
vi.mock("../../src/utils/codeGenerator", () => ({
  generateShortCode: vi.fn(() => "abc123"),
}));

const mockUrlModel = vi.mocked(UrlModel);

describe("UrlService", () => {
  let urlService: UrlService;

  beforeEach(() => {
    vi.clearAllMocks();
    urlService = new UrlService("http://test.com");
  });

  describe("shortenUrl", () => {
    const originalUrl = "https://example.com/very/long/url";

    it("should return existing URL if found in database", async () => {
      const existingUrl = {
        id: "1",
        originalUrl,
        shortCode: "existing",
        clickCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUrlModel.findByOriginalUrl.mockResolvedValue(existingUrl);

      const result = await urlService.shortenUrl(originalUrl);

      expect(result).toEqual({
        shortUrl: "http://test.com/existing",
        originalUrl,
        shortCode: "existing",
        isNew: false,
        qrCodeUrl: "http://test.com/api/qr/existing",
      });

      expect(mockUrlModel.findByOriginalUrl).toHaveBeenCalledWith(originalUrl);
      expect(mockUrlModel.create).not.toHaveBeenCalled();
    });

    it("should create new URL if not found in database", async () => {
      const newUrl = {
        id: "2",
        originalUrl,
        shortCode: "abc123",
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUrlModel.findByOriginalUrl.mockResolvedValue(null);
      mockUrlModel.existsByShortCode.mockResolvedValue(false);
      mockUrlModel.create.mockResolvedValue(newUrl);

      const result = await urlService.shortenUrl(originalUrl);

      expect(result).toEqual({
        shortUrl: "http://test.com/abc123",
        originalUrl,
        shortCode: "abc123",
        isNew: true,
        qrCodeUrl: "http://test.com/api/qr/abc123",
      });

      expect(mockUrlModel.findByOriginalUrl).toHaveBeenCalledWith(originalUrl);
      expect(mockUrlModel.create).toHaveBeenCalledWith({
        originalUrl,
        shortCode: "abc123",
      });
    });

    it("should generate unique short code if collision occurs", async () => {
      const newUrl = {
        id: "3",
        originalUrl,
        shortCode: "unique123",
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUrlModel.findByOriginalUrl.mockResolvedValue(null);
      mockUrlModel.existsByShortCode
        .mockResolvedValueOnce(true) // First code exists
        .mockResolvedValueOnce(false); // Second code is unique

      // Mock generateShortCode to return different values on subsequent calls
      const { generateShortCode } = await import(
        "../../src/utils/codeGenerator"
      );
      vi.mocked(generateShortCode)
        .mockReturnValueOnce("collision")
        .mockReturnValueOnce("unique123");

      mockUrlModel.create.mockResolvedValue(newUrl);

      const result = await urlService.shortenUrl(originalUrl);

      expect(result.shortCode).toBe("unique123");
      expect(mockUrlModel.existsByShortCode).toHaveBeenCalledTimes(2);
    });

    it("should throw error if URL creation fails", async () => {
      mockUrlModel.findByOriginalUrl.mockResolvedValue(null);
      mockUrlModel.existsByShortCode.mockResolvedValue(false);
      mockUrlModel.create.mockRejectedValue(new Error("Database error"));

      await expect(urlService.shortenUrl(originalUrl)).rejects.toThrow(
        "Failed to shorten URL"
      );
    });
  });

  describe("getOriginalUrl", () => {
    const shortCode = "abc123";

    it("should return original URL and increment click count", async () => {
      const url = {
        id: "1",
        originalUrl: "https://example.com",
        shortCode,
        clickCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUrlModel.findByShortCode.mockResolvedValue(url);
      mockUrlModel.incrementClickCount.mockResolvedValue({
        ...url,
        clickCount: 6,
      });

      const result = await urlService.getOriginalUrl(shortCode);

      expect(result).toBe("https://example.com");
      expect(mockUrlModel.findByShortCode).toHaveBeenCalledWith(shortCode);
      expect(mockUrlModel.incrementClickCount).toHaveBeenCalledWith(shortCode);
    });

    it("should return null if URL not found", async () => {
      mockUrlModel.findByShortCode.mockResolvedValue(null);

      const result = await urlService.getOriginalUrl(shortCode);

      expect(result).toBeNull();
      expect(mockUrlModel.incrementClickCount).not.toHaveBeenCalled();
    });

    it("should throw error if database operation fails", async () => {
      mockUrlModel.findByShortCode.mockRejectedValue(
        new Error("Database error")
      );

      await expect(urlService.getOriginalUrl(shortCode)).rejects.toThrow(
        "Failed to retrieve original URL"
      );
    });
  });

  describe("getUrlStats", () => {
    const shortCode = "abc123";

    it("should return URL statistics", async () => {
      const stats = {
        originalUrl: "https://example.com",
        shortCode,
        clickCount: 10,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      };

      mockUrlModel.getUrlStats.mockResolvedValue(stats);

      const result = await urlService.getUrlStats(shortCode);

      expect(result).toEqual(stats);
      expect(mockUrlModel.getUrlStats).toHaveBeenCalledWith(shortCode);
    });

    it("should return null if URL not found", async () => {
      mockUrlModel.getUrlStats.mockResolvedValue(null);

      const result = await urlService.getUrlStats(shortCode);

      expect(result).toBeNull();
    });

    it("should throw error if operation fails", async () => {
      mockUrlModel.getUrlStats.mockRejectedValue(new Error("Database error"));

      await expect(urlService.getUrlStats(shortCode)).rejects.toThrow(
        "Failed to get URL statistics"
      );
    });
  });

  describe("getStats", () => {
    it("should return overall statistics", async () => {
      const urls = [
        {
          id: "1",
          originalUrl: "https://example1.com",
          shortCode: "abc123",
          clickCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          originalUrl: "https://example2.com",
          shortCode: "def456",
          clickCount: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUrlModel.count.mockResolvedValue(25);
      mockUrlModel.findAll.mockResolvedValue(urls);

      const result = await urlService.getStats();

      expect(result).toEqual({
        totalUrls: 25,
        recentUrls: urls.slice(0, 10),
      });
    });
  });

  describe("deleteUrl", () => {
    const shortCode = "abc123";

    it("should delete URL successfully", async () => {
      const url = {
        id: "1",
        originalUrl: "https://example.com",
        shortCode,
        clickCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUrlModel.findByShortCode.mockResolvedValue(url);
      mockUrlModel.deleteByShortCode.mockResolvedValue(undefined);

      const result = await urlService.deleteUrl(shortCode);

      expect(result).toBe(true);
      expect(mockUrlModel.deleteByShortCode).toHaveBeenCalledWith(shortCode);
    });

    it("should return false if URL not found", async () => {
      mockUrlModel.findByShortCode.mockResolvedValue(null);

      const result = await urlService.deleteUrl(shortCode);

      expect(result).toBe(false);
      expect(mockUrlModel.deleteByShortCode).not.toHaveBeenCalled();
    });
  });
});
