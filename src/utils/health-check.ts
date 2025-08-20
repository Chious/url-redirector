import * as http from "http";

interface HealthCheckOptions {
  hostname: string;
  port: number;
  path: string;
  method: string;
  timeout: number;
}

interface HealthCheckResponse {
  status: "ok" | "error";
  timestamp: string;
  database?: {
    status: "connected" | "disconnected" | "error";
  };
}

const options: HealthCheckOptions = {
  hostname: "localhost",
  port: parseInt(process.env["PORT"] || "3000"),
  path: "/health",
  method: "GET",
  timeout: 5000, // Increased timeout for database operations
};

const healthCheck = http.request(options, (res: http.IncomingMessage) => {
  console.log(`Health check status: ${res.statusCode}`);

  let data = "";

  res.on("data", (chunk: string) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      if (res.statusCode === 200) {
        const healthData: HealthCheckResponse = JSON.parse(data);
        console.log("✅ Health check passed");
        console.log(`   Status: ${healthData.status}`);
        console.log(`   Timestamp: ${healthData.timestamp}`);

        if (healthData.database) {
          console.log(`   Database: ${healthData.database.status}`);
        }

        process.exit(0);
      } else {
        console.error(`❌ Health check failed with status ${res.statusCode}`);

        try {
          const errorData: HealthCheckResponse = JSON.parse(data);
          console.error(`   Error: ${errorData.status}`);

          if (errorData.database) {
            console.error(`   Database: ${errorData.database.status}`);
          }
        } catch (parseError) {
          console.error("   Could not parse error response");
        }

        process.exit(1);
      }
    } catch (error) {
      console.error("❌ Failed to parse health check response:", error);
      process.exit(1);
    }
  });
});

healthCheck.on("error", (err: Error) => {
  console.error("❌ Health check request failed:", err.message);
  process.exit(1);
});

healthCheck.on("timeout", () => {
  console.error("❌ Health check timeout");
  healthCheck.destroy();
  process.exit(1);
});

healthCheck.setTimeout(options.timeout);
healthCheck.end();
