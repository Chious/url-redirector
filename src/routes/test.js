const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /api/test:
 *   get:
 *     summary: Simple test endpoint
 *     description: A basic test endpoint to verify Swagger is working
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Test successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Swagger UI is working!"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get("/api/test", (req, res) => {
  res.json({
    message: "Swagger UI is working!",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
