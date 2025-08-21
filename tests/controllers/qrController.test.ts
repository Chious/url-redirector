import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import {
  generateQRCode,
  qrCodeValidation,
} from "../../src/controllers/qrController";
import QRService from "../../src/services/qrService";

// Mock QRService
vi.mock("../../src/services/qrService", () => ({
  default: vi.fn(),
  QRService: vi.fn(),
}));

const mockQRService = vi.mocked(QRService);

describe("QRController", () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.get("/qr/:shortCode", qrCodeValidation, generateQRCode);
  });

  describe("GET /qr/:shortCode", () => {
    it("should generate PNG QR code by default", async () => {
      const mockBuffer = Buffer.from("fake-png-data");

      const mockInstance = {
        canGenerateQRCode: vi.fn().mockResolvedValue(true),
        generateQRCodePNG: vi.fn().mockResolvedValue(mockBuffer),
      };
      vi.mocked(QRService).mockImplementation(() => mockInstance as any);

      const response = await request(app).get("/qr/abc123").expect(200);

      expect(response.headers["content-type"]).toBe("image/png");
      expect(response.body).toEqual(mockBuffer);
      expect(mockInstance.generateQRCodePNG).toHaveBeenCalledWith(
        "abc123",
        200
      );
    });

    it("should generate Base64 QR code when requested", async () => {
      const mockDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...";

      const mockInstance = {
        canGenerateQRCode: vi.fn().mockResolvedValue(true),
        generateQRCodeBase64: vi.fn().mockResolvedValue(mockDataUrl),
      };
      vi.mocked(QRService).mockImplementation(() => mockInstance as any);

      const response = await request(app)
        .get("/qr/abc123?format=base64")
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: "QR code generated successfully",
        data: {
          shortCode: "abc123",
          format: "base64",
          qrCode: mockDataUrl,
          size: 200,
        },
      });
    });

    it("should use custom size when specified", async () => {
      const mockBuffer = Buffer.from("fake-png-data");

      const mockInstance = {
        canGenerateQRCode: vi.fn().mockResolvedValue(true),
        generateQRCodePNG: vi.fn().mockResolvedValue(mockBuffer),
      };
      vi.mocked(QRService).mockImplementation(() => mockInstance as any);

      await request(app).get("/qr/abc123?size=300").expect(200);

      expect(mockInstance.generateQRCodePNG).toHaveBeenCalledWith(
        "abc123",
        300
      );
    });

    it("should return 404 if short code not found", async () => {
      const mockInstance = {
        canGenerateQRCode: vi.fn().mockResolvedValue(false),
      };
      vi.mocked(QRService).mockImplementation(() => mockInstance as any);

      const response = await request(app).get("/qr/nonexistent").expect(404);

      expect(response.body).toEqual({
        success: false,
        message: "Short code not found",
      });
    });

    it("should validate short code format", async () => {
      const response = await request(app)
        .get("/qr/a") // Too short
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid parameters");
    });

    it("should validate format parameter", async () => {
      const response = await request(app)
        .get("/qr/abc123?format=invalid")
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should validate size parameter", async () => {
      const response = await request(app)
        .get("/qr/abc123?size=50") // Too small
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should handle service errors", async () => {
      const mockInstance = {
        canGenerateQRCode: vi.fn().mockResolvedValue(true),
        generateQRCodePNG: vi
          .fn()
          .mockRejectedValue(new Error("QR generation failed")),
      };
      vi.mocked(QRService).mockImplementation(() => mockInstance as any);

      const response = await request(app).get("/qr/abc123").expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Internal server error");
    });
  });
});
