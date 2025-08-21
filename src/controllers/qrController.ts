import { Request, Response } from "express";
import { param, query, validationResult } from "express-validator";
import QRService from "../services/qrService";

// Initialize QR service
const qrService = new QRService();

/**
 * Validation rules for QR code generation
 */
export const qrCodeValidation = [
  param("shortCode")
    .isLength({ min: 4, max: 20 })
    .withMessage("Short code must be between 4-20 characters")
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage(
      "Short code can only contain letters, numbers, hyphens, and underscores"
    ),
  query("format")
    .optional()
    .isIn(["png", "base64"])
    .withMessage("Format must be either 'png' or 'base64'"),
  query("size")
    .optional()
    .isInt({ min: 100, max: 1000 })
    .withMessage("Size must be between 100-1000 pixels"),
];

/**
 * Controller for generating QR codes
 */
export const generateQRCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Invalid parameters",
        errors: errors.array(),
      });
      return;
    }

    const { shortCode } = req.params;
    const format = (req.query["format"] as string) || "png";
    const size = parseInt(req.query["size"] as string) || 200;

    // Check if short code exists
    if (!shortCode) {
      res.status(400).json({
        success: false,
        message: "Short code is required",
      });
      return;
    }

    const canGenerate = await qrService.canGenerateQRCode(shortCode);
    if (!canGenerate) {
      res.status(404).json({
        success: false,
        message: "Short code not found",
      });
      return;
    }

    if (format === "base64") {
      // Return Base64 data URL
      const base64QR = await qrService.generateQRCodeBase64(shortCode, size);

      res.status(200).json({
        success: true,
        message: "QR code generated successfully",
        data: {
          shortCode,
          format: "base64",
          qrCode: base64QR,
          size,
        },
      });
    } else {
      // Return PNG image
      const pngBuffer = await qrService.generateQRCodePNG(shortCode, size);

      res.set({
        "Content-Type": "image/png",
        "Content-Length": pngBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      });

      res.status(200).send(pngBuffer);
    }
  } catch (error) {
    console.error("Error in generateQRCode controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env["NODE_ENV"] === "development" ? error : undefined,
    });
  }
};

export default {
  generateQRCode,
  qrCodeValidation,
};
