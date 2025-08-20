import { UrlModel, CreateUrlData } from "../models/url";
import { generateShortCode } from "../utils/codeGenerator";

export interface ShortenUrlResult {
  shortUrl: string;
  originalUrl: string;
  shortCode: string;
  isNew: boolean;
}

export class UrlService {
  private baseUrl: string;

  constructor(
    baseUrl: string = process.env["BASE_URL"] || "http://localhost:3000"
  ) {
    this.baseUrl = baseUrl;
  }

  /**
   * Shorten a URL - either return existing mapping or create new one
   */
  async shortenUrl(originalUrl: string): Promise<ShortenUrlResult> {
    try {
      // Check if URL already exists in database
      const existingUrl = await UrlModel.findByOriginalUrl(originalUrl);

      if (existingUrl) {
        return {
          shortUrl: `${this.baseUrl}/${existingUrl.shortCode}`,
          originalUrl: existingUrl.originalUrl,
          shortCode: existingUrl.shortCode,
          isNew: false,
        };
      }

      // Generate a new unique short code
      const shortCode = await this.generateUniqueShortCode();

      // Create new URL mapping
      const newUrl = await UrlModel.create({
        originalUrl,
        shortCode,
      });

      return {
        shortUrl: `${this.baseUrl}/${newUrl.shortCode}`,
        originalUrl: newUrl.originalUrl,
        shortCode: newUrl.shortCode,
        isNew: true,
      };
    } catch (error) {
      console.error("Error shortening URL:", error);
      throw new Error("Failed to shorten URL");
    }
  }

  /**
   * Get the original URL from a short code
   */
  async getOriginalUrl(shortCode: string): Promise<string | null> {
    try {
      const url = await UrlModel.findByShortCode(shortCode);

      if (!url) {
        return null;
      }

      // Optionally update the last accessed time
      await UrlModel.touch(url.id);

      return url.originalUrl;
    } catch (error) {
      console.error("Error retrieving original URL:", error);
      throw new Error("Failed to retrieve original URL");
    }
  }

  /**
   * Get URL statistics
   */
  async getStats() {
    try {
      const totalUrls = await UrlModel.count();
      const recentUrls = await UrlModel.findAll();

      return {
        totalUrls,
        recentUrls: recentUrls.slice(0, 10), // Last 10 URLs
      };
    } catch (error) {
      console.error("Error getting URL stats:", error);
      throw new Error("Failed to get URL statistics");
    }
  }

  /**
   * Delete a URL mapping by short code
   */
  async deleteUrl(shortCode: string): Promise<boolean> {
    try {
      const url = await UrlModel.findByShortCode(shortCode);

      if (!url) {
        return false;
      }

      await UrlModel.deleteByShortCode(shortCode);
      return true;
    } catch (error) {
      console.error("Error deleting URL:", error);
      throw new Error("Failed to delete URL");
    }
  }

  /**
   * Generate a unique short code that doesn't exist in the database
   */
  private async generateUniqueShortCode(length: number = 6): Promise<string> {
    let shortCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      shortCode = generateShortCode(length);
      attempts++;

      // If we've tried too many times with current length, increase it
      if (attempts >= maxAttempts) {
        length++;
        attempts = 0;
      }

      // Safeguard against infinite loops
      if (length > 12) {
        throw new Error("Unable to generate unique short code");
      }
    } while (await UrlModel.existsByShortCode(shortCode));

    return shortCode;
  }
}

export default UrlService;
