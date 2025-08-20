import express, { Request, Response } from "express";
import urlRoutes from "./urls";
import testRoutes from "./test";
import { ApiInfoResponse } from "../types";

const router = express.Router();

// Mount routes
router.use("/", urlRoutes);
router.use("/", testRoutes);

// API info endpoint
router.get("/api", (req: Request, res: Response<ApiInfoResponse>) => {
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

export default router;
