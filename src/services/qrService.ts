import QRCode from "qrcode";
import { UrlModel } from "../models/url";

export interface QRCodeOptions {
  format: "png" | "base64";
  size?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

export class QRService {
  private baseUrl: string;

  constructor(
    baseUrl: string = process.env["BASE_URL"] || "http://localhost:3000"
  ) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate QR Code for a short code
   */
  async generateQRCode(
    shortCode: string,
    options: QRCodeOptions = { format: "png", size: 200 }
  ): Promise<string | Buffer> {
    try {
      // Check if short code exists
      const url = await UrlModel.findByShortCode(shortCode);
      if (!url) {
        throw new Error("Short code not found");
      }

      const shortUrl = `${this.baseUrl}/${shortCode}`;

      const qrOptions = {
        width: options.size || 200,
        errorCorrectionLevel: options.errorCorrectionLevel || ("M" as const),
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      };

      if (options.format === "base64") {
        // Return base64 data URL
        const dataUrl = await QRCode.toDataURL(shortUrl, qrOptions);
        return dataUrl;
      } else {
        // Return PNG buffer
        const buffer = await QRCode.toBuffer(shortUrl, qrOptions);
        return buffer;
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw new Error("Failed to generate QR code");
    }
  }

  /**
   * Generate QR Code as Base64 data URL
   */
  async generateQRCodeBase64(
    shortCode: string,
    size: number = 200
  ): Promise<string> {
    const result = await this.generateQRCode(shortCode, {
      format: "base64",
      size,
    });
    return result as string;
  }

  /**
   * Generate QR Code as PNG buffer
   */
  async generateQRCodePNG(
    shortCode: string,
    size: number = 200
  ): Promise<Buffer> {
    const result = await this.generateQRCode(shortCode, {
      format: "png",
      size,
    });
    return result as Buffer;
  }

  /**
   * Check if QR Code can be generated for a short code
   */
  async canGenerateQRCode(shortCode: string): Promise<boolean> {
    try {
      const url = await UrlModel.findByShortCode(shortCode);
      return !!url;
    } catch (error) {
      return false;
    }
  }
}

export default QRService;
