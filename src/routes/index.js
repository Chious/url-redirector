const express = require("express");
const urlRoutes = require("./urls");
const testRoutes = require("./test");

const router = express.Router();

// Mount routes
router.use("/", urlRoutes);
router.use("/", testRoutes);

// API info endpoint
router.get("/api", (req, res) => {
  res.json({
    name: "URL Redirector API",
    version: "1.0.0",
    description: "A simple URL shortener service",
    endpoints: {
      "POST /api/shorten": "Create a short URL",
      "GET /:shortCode": "Redirect to original URL",
      "GET /api/health": "Health check",
      "GET /api/urls": "List all URLs (development only)",
      "GET /api/urls/:shortCode": "Get URL details",
      "DELETE /api/urls/:shortCode": "Delete a URL",
    },
    docs: "/api-docs",
  });
});

module.exports = router;
