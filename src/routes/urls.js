const express = require("express");
const { body, param, validationResult } = require("express-validator");

const router = express.Router();

// 假資料儲存（在實際專案中會使用 MongoDB）
let urlDatabase = [
  {
    id: "1",
    originalUrl: "https://github.com/nodejs/node",
    shortCode: "node01",
    shortUrl: "http://localhost:3000/node01",
    createdAt: new Date("2024-01-15T10:30:00Z"),
    updatedAt: new Date("2024-01-15T10:30:00Z"),
    clickCount: 156,
  },
  {
    id: "2",
    originalUrl: "https://expressjs.com/en/guide/routing.html",
    shortCode: "expr02",
    shortUrl: "http://localhost:3000/expr02",
    createdAt: new Date("2024-01-16T14:20:00Z"),
    updatedAt: new Date("2024-01-16T14:20:00Z"),
    clickCount: 89,
  },
  {
    id: "3",
    originalUrl:
      "https://www.mongodb.com/docs/manual/tutorial/getting-started/",
    shortCode: "mongo3",
    shortUrl: "http://localhost:3000/mongo3",
    createdAt: new Date("2024-01-17T09:15:00Z"),
    updatedAt: new Date("2024-01-17T09:15:00Z"),
    clickCount: 234,
  },
];

// 生成隨機短碼的輔助函數
const generateShortCode = () => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * @swagger
 * components:
 *   schemas:
 *     URL:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier
 *         originalUrl:
 *           type: string
 *           format: url
 *           description: The original long URL
 *         shortCode:
 *           type: string
 *           description: The short code for the URL
 *         shortUrl:
 *           type: string
 *           format: url
 *           description: The complete short URL
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         clickCount:
 *           type: integer
 *           description: Number of times the short URL was accessed
 *       example:
 *         id: "1"
 *         originalUrl: "https://github.com/nodejs/node"
 *         shortCode: "node01"
 *         shortUrl: "http://localhost:3000/node01"
 *         createdAt: "2024-01-15T10:30:00Z"
 *         updatedAt: "2024-01-15T10:30:00Z"
 *         clickCount: 156
 *
 *     ShortenRequest:
 *       type: object
 *       required:
 *         - url
 *       properties:
 *         url:
 *           type: string
 *           format: url
 *           description: The URL to shorten
 *       example:
 *         url: "https://example.com/very/long/url/that/needs/shortening"
 *
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *         details:
 *           type: array
 *           items:
 *             type: object
 *           description: Detailed error information
 */

/**
 * @swagger
 * /api/shorten:
 *   post:
 *     summary: Create a short URL
 *     description: Takes a long URL and returns a shortened version
 *     tags: [URLs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShortenRequest'
 *     responses:
 *       201:
 *         description: Short URL created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/URL'
 *       400:
 *         description: Invalid URL provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: URL already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/URL'
 */
router.post(
  "/api/shorten",
  [
    body("url")
      .isURL({ protocols: ["http", "https"] })
      .withMessage("Please provide a valid URL with http or https protocol")
      .isLength({ min: 10, max: 2048 })
      .withMessage("URL must be between 10 and 2048 characters"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { url: originalUrl } = req.body;

    // 檢查 URL 是否已存在
    const existingUrl = urlDatabase.find(
      (item) => item.originalUrl === originalUrl
    );
    if (existingUrl) {
      return res.status(409).json({
        message: "URL already exists",
        data: existingUrl,
      });
    }

    // 生成新的短碼（確保唯一性）
    let shortCode;
    do {
      shortCode = generateShortCode();
    } while (urlDatabase.find((item) => item.shortCode === shortCode));

    const newUrl = {
      id: (urlDatabase.length + 1).toString(),
      originalUrl,
      shortCode,
      shortUrl: `${req.protocol}://${req.get("host")}/${shortCode}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      clickCount: 0,
    };

    urlDatabase.push(newUrl);

    res.status(201).json(newUrl);
  }
);

/**
 * @swagger
 * /{shortCode}:
 *   get:
 *     summary: Redirect to original URL
 *     description: Redirects to the original URL associated with the short code
 *     tags: [URLs]
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The short code to redirect
 *     responses:
 *       302:
 *         description: Redirect to original URL
 *       404:
 *         description: Short code not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/:shortCode",
  [
    param("shortCode")
      .isLength({ min: 1, max: 10 })
      .withMessage("Short code must be between 1 and 10 characters")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Short code can only contain letters and numbers"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Invalid short code format",
        details: errors.array(),
      });
    }

    const { shortCode } = req.params;
    const urlItem = urlDatabase.find((item) => item.shortCode === shortCode);

    if (!urlItem) {
      return res.status(404).json({
        error: "Short URL not found",
        message: `The short code '${shortCode}' does not exist or has expired`,
      });
    }

    // 增加點擊計數
    urlItem.clickCount += 1;
    urlItem.updatedAt = new Date();

    // 記錄訪問日誌
    console.log(
      `📊 Redirect: ${shortCode} -> ${urlItem.originalUrl} (${urlItem.clickCount} clicks)`
    );

    // 302 重定向到原始 URL
    res.redirect(302, urlItem.originalUrl);
  }
);

/**
 * @swagger
 * /api/urls:
 *   get:
 *     summary: List all URLs
 *     description: Get a list of all shortened URLs (development endpoint)
 *     tags: [URLs]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of URLs to return (default 10)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of URLs to skip (default 0)
 *     responses:
 *       200:
 *         description: List of URLs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/URL'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 */
router.get("/api/urls", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const offset = parseInt(req.query.offset) || 0;

  const total = urlDatabase.length;
  const data = urlDatabase
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(offset, offset + limit);

  res.json({
    data,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  });
});

/**
 * @swagger
 * /api/urls/{shortCode}:
 *   get:
 *     summary: Get URL details
 *     description: Get detailed information about a specific short URL
 *     tags: [URLs]
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The short code to get details for
 *     responses:
 *       200:
 *         description: URL details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/URL'
 *       404:
 *         description: Short code not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/api/urls/:shortCode", (req, res) => {
  const { shortCode } = req.params;
  const urlItem = urlDatabase.find((item) => item.shortCode === shortCode);

  if (!urlItem) {
    return res.status(404).json({
      error: "Short URL not found",
      message: `The short code '${shortCode}' does not exist`,
    });
  }

  res.json(urlItem);
});

/**
 * @swagger
 * /api/urls/{shortCode}:
 *   delete:
 *     summary: Delete a short URL
 *     description: Permanently delete a short URL by its short code
 *     tags: [URLs]
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The short code to delete
 *     responses:
 *       200:
 *         description: URL deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedUrl:
 *                   $ref: '#/components/schemas/URL'
 *       404:
 *         description: Short code not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/api/urls/:shortCode", (req, res) => {
  const { shortCode } = req.params;
  const urlIndex = urlDatabase.findIndex(
    (item) => item.shortCode === shortCode
  );

  if (urlIndex === -1) {
    return res.status(404).json({
      error: "Short URL not found",
      message: `The short code '${shortCode}' does not exist`,
    });
  }

  const deletedUrl = urlDatabase.splice(urlIndex, 1)[0];

  res.json({
    message: "URL deleted successfully",
    deletedUrl,
  });
});

module.exports = router;
