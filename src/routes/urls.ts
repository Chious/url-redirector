import express from "express";
import urlController from "../controllers/urlController";
import qrController from "../controllers/qrController";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ShortenUrlRequest:
 *       type: object
 *       required:
 *         - url
 *       properties:
 *         url:
 *           type: string
 *           format: uri
 *           description: The original URL to be shortened
 *           example: "https://www.example.com/very/long/url/that/needs/shortening"
 *     ShortenUrlResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "URL shortened successfully"
 *         data:
 *           type: object
 *           properties:
 *             shortUrl:
 *               type: string
 *               example: "http://localhost:3000/AbCdE1"
 *             originalUrl:
 *               type: string
 *               example: "https://www.example.com/very/long/url/that/needs/shortening"
 *             shortCode:
 *               type: string
 *               example: "AbCdE1"
 *             qrCodeUrl:
 *               type: string
 *               example: "http://localhost:3000/api/qr/AbCdE1"
 *             isNew:
 *               type: boolean
 *               example: true
 *     UrlStats:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "URL statistics retrieved successfully"
 *         data:
 *           type: object
 *           properties:
 *             originalUrl:
 *               type: string
 *               example: "https://www.example.com/very/long/url"
 *             shortCode:
 *               type: string
 *               example: "AbCdE1"
 *             clickCount:
 *               type: integer
 *               example: 42
 *             createdAt:
 *               type: string
 *               format: date-time
 *               example: "2024-01-15T10:30:00Z"
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               example: "2024-01-15T10:30:00Z"
 */

/**
 * @swagger
 * /api/shorten:
 *   post:
 *     summary: Shorten a long URL
 *     description: Convert a long URL into a short URL with click tracking and QR code support
 *     tags:
 *       - URLs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShortenUrlRequest'
 *     responses:
 *       200:
 *         description: URL shortened successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShortenUrlResponse'
 *       400:
 *         description: Invalid URL or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */
router.post(
  "/shorten",
  urlController.shortenUrlValidation,
  urlController.shortenUrl
);

/**
 * @swagger
 * /api/info/{shortCode}:
 *   get:
 *     summary: Get URL statistics
 *     description: Retrieve statistics for a short URL including click count and timestamps
 *     tags:
 *       - URLs
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 4
 *           maxLength: 20
 *           pattern: "^[A-Za-z0-9_-]+$"
 *         description: The short code to get statistics for
 *         example: "AbCdE1"
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UrlStats'
 *       404:
 *         description: Short URL not found
 *       400:
 *         description: Invalid short code format
 *       500:
 *         description: Internal server error
 */
router.get(
  "/info/:shortCode",
  urlController.shortCodeValidation,
  urlController.getUrlStats
);

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get overall statistics
 *     description: Retrieve overall system statistics including total URLs and recent URLs
 *     tags:
 *       - URLs
 *     responses:
 *       200:
 *         description: Overall statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Overall statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUrls:
 *                       type: integer
 *                       example: 1234
 *                     recentUrls:
 *                       type: array
 *                       items:
 *                         type: object
 *       500:
 *         description: Internal server error
 */
router.get("/stats", urlController.getOverallStats);

/**
 * @swagger
 * /api/qr/{shortCode}:
 *   get:
 *     summary: Generate QR Code for short URL
 *     description: Generate a QR code for a short URL in PNG or Base64 format
 *     tags:
 *       - QR Code
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 4
 *           maxLength: 20
 *           pattern: "^[A-Za-z0-9_-]+$"
 *         description: The short code to generate QR code for
 *         example: "AbCdE1"
 *       - in: query
 *         name: format
 *         required: false
 *         schema:
 *           type: string
 *           enum: [png, base64]
 *           default: png
 *         description: Output format for the QR code
 *       - in: query
 *         name: size
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 100
 *           maximum: 1000
 *           default: 200
 *         description: Size of the QR code in pixels
 *     responses:
 *       200:
 *         description: QR code generated successfully
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "QR code generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     shortCode:
 *                       type: string
 *                       example: "AbCdE1"
 *                     format:
 *                       type: string
 *                       example: "base64"
 *                     qrCode:
 *                       type: string
 *                       example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *                     size:
 *                       type: integer
 *                       example: 200
 *       404:
 *         description: Short code not found
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get(
  "/qr/:shortCode",
  qrController.qrCodeValidation,
  qrController.generateQRCode
);

export default router;
