// Re-export express types
export * from "./express";

// Core URL interface for the database model
export interface IUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  createdAt: Date;
  updatedAt: Date;
  clickCount: number;
}

// Request/Response types
export interface ShortenUrlRequest {
  url: string;
}

export interface ShortenUrlResponse extends IUrl {}

export interface ApiInfoResponse {
  name: string;
  version: string;
  description: string;
  endpoints: Record<string, string>;
  docs: string;
}

export interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
  uptime?: number;
}

export interface ApiResponse {
  message: string;
  version: string;
  description: string;
  features: string[];
  endpoints: {
    health: string;
    api: string;
    docs: string;
  };
  repository: string;
}

export interface PaginationQuery {
  limit?: string;
  offset?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ErrorResponse {
  error: string;
  message?: string;
  details?: any[];
  path?: string;
}

// Express middleware types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Environment variables
export interface EnvConfig {
  PORT: string;
  NODE_ENV: string;
  RATE_LIMIT_WINDOW_MS: string;
  RATE_LIMIT_MAX_REQUESTS: string;
  MONGODB_URI?: string;
}

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: {
    error: string;
  };
}
