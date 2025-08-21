import express, { Request, Response } from "express";
import urlRoutes from "./urls";
import testRoutes from "./test";
import urlController from "../controllers/urlController";
import { ApiInfoResponse } from "../types";

const router = express.Router();

// API info endpoint (must be before /api mount)
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

// Mount API routes
router.use("/api", urlRoutes);
router.use("/", testRoutes);

// Short code redirect route (this should be last to catch all remaining routes)
router.get(
  "/:shortCode",
  urlController.shortCodeValidation,
  urlController.redirectUrl
);

export default router;
