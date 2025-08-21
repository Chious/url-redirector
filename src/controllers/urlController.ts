import { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import UrlService from "../services/urlService";

// Initialize URL service
const urlService = new UrlService();

/**
 * Validation rules for URL shortening
 */
export const shortenUrlValidation = [
  body("url")
    .isURL({
      require_protocol: true,
      protocols: ["http", "https"],
    })
    .withMessage("Please provide a valid URL with http or https protocol")
    .isLength({ max: 2048 })
    .withMessage("URL must not exceed 2048 characters"),
];

/**
 * Validation rules for short code parameter
 */
export const shortCodeValidation = [
  param("shortCode")
    .isLength({ min: 4, max: 20 })
    .withMessage("Short code must be between 4-20 characters")
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage(
      "Short code can only contain letters, numbers, hyphens, and underscores"
    ),
];

/**
 * Controller for shortening URLs
 */
export const shortenUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { url } = req.body;

    // Shorten the URL
    const result = await urlService.shortenUrl(url);

    res.status(200).json({
      success: true,
      message: result.isNew
        ? "URL shortened successfully"
        : "URL already exists",
      data: {
        shortUrl: result.shortUrl,
        originalUrl: result.originalUrl,
        shortCode: result.shortCode,
        qrCodeUrl: result.qrCodeUrl,
        isNew: result.isNew,
      },
    });
  } catch (error) {
    console.error("Error in shortenUrl controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env["NODE_ENV"] === "development" ? error : undefined,
    });
  }
};

/**
 * Controller for redirecting short URLs
 */
export const redirectUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Invalid short code",
        errors: errors.array(),
      });
      return;
    }

    const { shortCode } = req.params;

    if (!shortCode) {
      res.status(400).json({
        success: false,
        message: "Short code is required",
      });
      return;
    }

    // Get the original URL (this will also increment click count)
    const originalUrl = await urlService.getOriginalUrl(shortCode);

    if (!originalUrl) {
      res.status(404).json({
        success: false,
        message: "Short URL not found",
      });
      return;
    }

    // Redirect to the original URL
    res.redirect(302, originalUrl);
  } catch (error) {
    console.error("Error in redirectUrl controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env["NODE_ENV"] === "development" ? error : undefined,
    });
  }
};

/**
 * Controller for getting URL statistics
 */
export const getUrlStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Invalid short code",
        errors: errors.array(),
      });
      return;
    }

    const { shortCode } = req.params;

    if (!shortCode) {
      res.status(400).json({
        success: false,
        message: "Short code is required",
      });
      return;
    }

    // Get URL statistics
    const stats = await urlService.getUrlStats(shortCode);

    if (!stats) {
      res.status(404).json({
        success: false,
        message: "Short URL not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "URL statistics retrieved successfully",
      data: {
        originalUrl: stats.originalUrl,
        shortCode: stats.shortCode,
        clickCount: stats.clickCount,
        createdAt: stats.createdAt,
        updatedAt: stats.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error in getUrlStats controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env["NODE_ENV"] === "development" ? error : undefined,
    });
  }
};

/**
 * Controller for getting overall statistics
 */
export const getOverallStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stats = await urlService.getStats();

    res.status(200).json({
      success: true,
      message: "Overall statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error in getOverallStats controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env["NODE_ENV"] === "development" ? error : undefined,
    });
  }
};

export default {
  shortenUrl,
  redirectUrl,
  getUrlStats,
  getOverallStats,
  shortenUrlValidation,
  shortCodeValidation,
};
