import prisma from "../utils/prisma";

export interface HealthCheckResult {
  status: "ok" | "error";
  timestamp: string;
  uptime: number;
  database: {
    status: "connected" | "disconnected" | "error";
    responseTime?: number;
    lastChecked: string;
    error?: string;
  };
  details?: {
    totalUrls?: number;
    version?: string;
  };
}

/**
 * Comprehensive health check that tests database connectivity and basic operations
 */
export class HealthService {
  /**
   * Perform a complete health check including database connectivity test
   */
  static async performHealthCheck(): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();
    const uptime = process.uptime();

    const result: HealthCheckResult = {
      status: "ok",
      timestamp,
      uptime,
      database: {
        status: "disconnected",
        lastChecked: timestamp,
      },
    };

    try {
      // Test database connectivity and perform basic operations
      const dbResult = await this.testDatabaseConnection();
      result.database = dbResult;

      // If database is healthy, get additional details
      if (dbResult.status === "connected") {
        const details = await this.getDatabaseDetails();
        if (details) {
          result.details = details;
        }
      }

      // Overall status is OK only if database is connected
      result.status = dbResult.status === "connected" ? "ok" : "error";
    } catch (error) {
      console.error("Health check failed:", error);
      result.status = "error";
      result.database.status = "error";
      result.database.error =
        error instanceof Error ? error.message : "Unknown error";
    }

    return result;
  }

  /**
   * Test database connection using MongoDB ping command
   */
  private static async testDatabaseConnection(): Promise<
    HealthCheckResult["database"]
  > {
    const startTime = Date.now();

    try {
      // Use MongoDB ping command for simple connectivity check
      await prisma.$runCommandRaw({ ping: 1 });

      const responseTime = Date.now() - startTime;

      return {
        status: "connected",
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error("Database health check failed:", error);

      return {
        status: "error",
        responseTime,
        lastChecked: new Date().toISOString(),
        error:
          error instanceof Error ? error.message : "Database connection failed",
      };
    }
  }

  /**
   * Get additional database details for the health check
   */
  private static async getDatabaseDetails(): Promise<
    HealthCheckResult["details"] | undefined
  > {
    try {
      const totalUrls = await prisma.url.count();

      return {
        totalUrls,
        version: "1.0.0",
      };
    } catch (error) {
      console.error("Failed to get database details:", error);
      return {
        version: "1.0.0",
      };
    }
  }

  /**
   * Simple database ping for lightweight health checks
   */
  static async pingDatabase(): Promise<boolean> {
    try {
      // Use MongoDB ping command for simple connectivity check
      await prisma.$runCommandRaw({ ping: 1 });
      return true;
    } catch (error) {
      console.error("Database ping failed:", error);
      return false;
    }
  }
}

export default HealthService;
