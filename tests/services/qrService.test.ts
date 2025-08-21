import { describe, it, expect, vi, beforeEach } from "vitest";
import { QRService } from "../../src/services/qrService";
import { UrlModel } from "../../src/models/url";
import QRCode from "qrcode";

// Mock dependencies
vi.mock("../../src/models/url");
vi.mock("qrcode");

const mockUrlModel = vi.mocked(UrlModel);
const mockQRCode = vi.mocked(QRCode);

describe("QRService", () => {
  let qrService: QRService;

  beforeEach(() => {
    vi.clearAllMocks();
    qrService = new QRService("http://test.com");
  });

  describe("generateQRCode", () => {
    const shortCode = "abc123";
    const mockUrl = {
      id: "1",
      originalUrl: "https://example.com",
      shortCode,
      clickCount: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should generate PNG QR code successfully", async () => {
      const mockBuffer = Buffer.from("fake-png-data");

      mockUrlModel.findByShortCode.mockResolvedValue(mockUrl);
      mockQRCode.toBuffer.mockResolvedValue(mockBuffer);

      const result = await qrService.generateQRCode(shortCode, {
        format: "png",
      });

      expect(result).toBe(mockBuffer);
      expect(mockUrlModel.findByShortCode).toHaveBeenCalledWith(shortCode);
      expect(mockQRCode.toBuffer).toHaveBeenCalledWith(
        "http://test.com/abc123",
        expect.objectContaining({
          width: 200,
          errorCorrectionLevel: "M",
          margin: 1,
        })
      );
    });

    it("should generate Base64 QR code successfully", async () => {
      const mockDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...";

      mockUrlModel.findByShortCode.mockResolvedValue(mockUrl);
      mockQRCode.toDataURL.mockResolvedValue(mockDataUrl);

      const result = await qrService.generateQRCode(shortCode, {
        format: "base64",
      });

      expect(result).toBe(mockDataUrl);
      expect(mockQRCode.toDataURL).toHaveBeenCalledWith(
        "http://test.com/abc123",
        expect.objectContaining({
          width: 200,
          errorCorrectionLevel: "M",
          margin: 1,
        })
      );
    });

    it("should use custom size when specified", async () => {
      const mockBuffer = Buffer.from("fake-png-data");

      mockUrlModel.findByShortCode.mockResolvedValue(mockUrl);
      mockQRCode.toBuffer.mockResolvedValue(mockBuffer);

      await qrService.generateQRCode(shortCode, { format: "png", size: 300 });

      expect(mockQRCode.toBuffer).toHaveBeenCalledWith(
        "http://test.com/abc123",
        expect.objectContaining({
          width: 300,
        })
      );
    });

    it("should use custom error correction level", async () => {
      const mockBuffer = Buffer.from("fake-png-data");

      mockUrlModel.findByShortCode.mockResolvedValue(mockUrl);
      mockQRCode.toBuffer.mockResolvedValue(mockBuffer);

      await qrService.generateQRCode(shortCode, {
        format: "png",
        errorCorrectionLevel: "H",
      });

      expect(mockQRCode.toBuffer).toHaveBeenCalledWith(
        "http://test.com/abc123",
        expect.objectContaining({
          errorCorrectionLevel: "H",
        })
      );
    });

    it("should throw error if short code not found", async () => {
      mockUrlModel.findByShortCode.mockResolvedValue(null);

      await expect(
        qrService.generateQRCode(shortCode, { format: "png" })
      ).rejects.toThrow("Failed to generate QR code");

      expect(mockQRCode.toBuffer).not.toHaveBeenCalled();
    });

    it("should throw error if QR code generation fails", async () => {
      mockUrlModel.findByShortCode.mockResolvedValue(mockUrl);
      mockQRCode.toBuffer.mockRejectedValue(new Error("QR generation failed"));

      await expect(
        qrService.generateQRCode(shortCode, { format: "png" })
      ).rejects.toThrow("Failed to generate QR code");
    });
  });

  describe("generateQRCodeBase64", () => {
    it("should call generateQRCode with base64 format", async () => {
      const shortCode = "abc123";
      const mockDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...";

      vi.spyOn(qrService, "generateQRCode").mockResolvedValue(mockDataUrl);

      const result = await qrService.generateQRCodeBase64(shortCode, 150);

      expect(qrService.generateQRCode).toHaveBeenCalledWith(shortCode, {
        format: "base64",
        size: 150,
      });
      expect(result).toBe(mockDataUrl);
    });
  });

  describe("generateQRCodePNG", () => {
    it("should call generateQRCode with png format", async () => {
      const shortCode = "abc123";
      const mockBuffer = Buffer.from("fake-png-data");

      vi.spyOn(qrService, "generateQRCode").mockResolvedValue(mockBuffer);

      const result = await qrService.generateQRCodePNG(shortCode, 250);

      expect(qrService.generateQRCode).toHaveBeenCalledWith(shortCode, {
        format: "png",
        size: 250,
      });
      expect(result).toBe(mockBuffer);
    });
  });

  describe("canGenerateQRCode", () => {
    it("should return true if URL exists", async () => {
      const shortCode = "abc123";
      const mockUrl = {
        id: "1",
        originalUrl: "https://example.com",
        shortCode,
        clickCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUrlModel.findByShortCode.mockResolvedValue(mockUrl);

      const result = await qrService.canGenerateQRCode(shortCode);

      expect(result).toBe(true);
      expect(mockUrlModel.findByShortCode).toHaveBeenCalledWith(shortCode);
    });

    it("should return false if URL does not exist", async () => {
      const shortCode = "nonexistent";

      mockUrlModel.findByShortCode.mockResolvedValue(null);

      const result = await qrService.canGenerateQRCode(shortCode);

      expect(result).toBe(false);
    });

    it("should return false if database error occurs", async () => {
      const shortCode = "abc123";

      mockUrlModel.findByShortCode.mockRejectedValue(
        new Error("Database error")
      );

      const result = await qrService.canGenerateQRCode(shortCode);

      expect(result).toBe(false);
    });
  });
});
