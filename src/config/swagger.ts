import swaggerJsdoc from "swagger-jsdoc";
import { serve, setup } from "swagger-ui-express";
import { Express, Request, Response, NextFunction } from "express";
import EnvironmentConfig from "./environment";

interface SwaggerOptions {
  definition: {
    openapi: string;
    info: {
      title: string;
      version: string;
      description: string;
      contact: {
        name: string;
        email: string;
      };
      license: {
        name: string;
        url: string;
      };
    };
    servers: Array<{
      url: string;
      description: string;
    }>;
    tags: Array<{
      name: string;
      description: string;
    }>;
    components: {
      schemas: Record<string, any>;
      responses: Record<string, any>;
    };
  };
  apis: string[];
}

/**
 * 基本認證中介軟體 (用於 Swagger 生產環境)
 */
const basicAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isProduction = EnvironmentConfig.get("NODE_ENV") === "production";
  const swaggerEnabled = EnvironmentConfig.getBoolean("SWAGGER_ENABLED", true);

  // 開發環境或未啟用 Swagger 時跳過認證
  if (!isProduction || !swaggerEnabled) {
    return next();
  }

  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Basic ")) {
    res.setHeader(
      "WWW-Authenticate",
      'Basic realm="Swagger API Documentation"'
    );
    res.status(401).json({
      error: "Unauthorized",
      message: "請提供有效的認證資訊以存取 API 文件",
    });
    return;
  }

  try {
    // 解碼 Basic Auth
    const base64Credentials = auth.split(" ")[1];
    if (!base64Credentials) {
      throw new Error("Invalid authorization header format");
    }

    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "utf-8"
    );
    const [username, password] = credentials.split(":");

    // 從環境變數獲取認證資訊
    const validUsername = EnvironmentConfig.get(
      "ME_CONFIG_BASICAUTH_USERNAME",
      "admin"
    );
    const validPassword = EnvironmentConfig.get(
      "ME_CONFIG_BASICAUTH_PASSWORD",
      "admin"
    );

    if (username === validUsername && password === validPassword) {
      next();
    } else {
      res.setHeader(
        "WWW-Authenticate",
        'Basic realm="Swagger API Documentation"'
      );
      res.status(401).json({
        error: "Unauthorized",
        message: "帳號或密碼錯誤",
      });
    }
  } catch (error) {
    res.setHeader(
      "WWW-Authenticate",
      'Basic realm="Swagger API Documentation"'
    );
    res.status(401).json({
      error: "Unauthorized",
      message: "認證格式錯誤",
    });
  }
};

export const initSwagger = (app: Express): void => {
  // 檢查是否啟用 Swagger
  const swaggerEnabled = EnvironmentConfig.getBoolean("SWAGGER_ENABLED", true);
  const isProduction = EnvironmentConfig.get("NODE_ENV") === "production";

  if (!swaggerEnabled) {
    console.log("🚫 Swagger UI is disabled");
    return;
  }

  const options: SwaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "URL Redirector API",
        version: "1.0.0",
        description: `
        一個簡單而強大的縮網址服務 API

        ## 功能特色
        - 🔗 將長網址轉換為短網址
        - 📊 追蹤點擊次數統計
        - 🔄 自動重定向到原始網址
        - 📝 完整的 CRUD 操作
        - ✅ 輸入驗證和錯誤處理

        ## 使用方式
        1. **建立短網址**: POST /api/shorten
        2. **使用短網址**: GET /:shortCode (自動重定向)
        3. **查看統計**: GET /api/urls/:shortCode
        4. **管理網址**: 查看、刪除短網址

        ## 技術棧
        - Express.js + MongoDB + TypeScript
        - Docker 容器化部署
        - 輸入驗證與安全防護
      `,
        contact: {
          name: "API 支援",
          email: "support@url-redirector.com",
        },
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "開發環境",
        },
        {
          url: EnvironmentConfig.get("BASE_URL", "https://your-domain.com"),
          description: "生產環境",
        },
      ],
      tags: [
        {
          name: "URLs",
          description: "短網址管理相關 API",
        },
        {
          name: "Health",
          description: "系統健康檢查",
        },
      ],
      components: {
        schemas: {
          ApiInfo: {
            type: "object",
            properties: {
              name: {
                type: "string",
                example: "URL Redirector API",
              },
              version: {
                type: "string",
                example: "1.0.0",
              },
              description: {
                type: "string",
                example: "A simple URL shortener service",
              },
              endpoints: {
                type: "object",
                description: "Available API endpoints",
              },
              docs: {
                type: "string",
                example: "/api-docs",
              },
            },
          },
          HealthStatus: {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ["ok", "error"],
                example: "ok",
              },
              timestamp: {
                type: "string",
                format: "date-time",
                example: "2024-01-20T10:30:00.000Z",
              },
              uptime: {
                type: "number",
                description: "Server uptime in seconds",
                example: 3600.5,
              },
            },
          },
        },
        responses: {
          BadRequest: {
            description: "請求參數錯誤",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Validation failed",
                    },
                    details: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          field: { type: "string" },
                          message: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          NotFound: {
            description: "資源不存在",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Resource not found",
                    },
                    message: {
                      type: "string",
                      example: "The requested resource does not exist",
                    },
                  },
                },
              },
            },
          },
          InternalServerError: {
            description: "伺服器內部錯誤",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Internal server error",
                    },
                    message: {
                      type: "string",
                      example: "Something went wrong",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    apis: ["src/routes/*.ts", "src/server.ts"],
  };

  const specs = swaggerJsdoc(options);

  // 應用基本認證中介軟體到 Swagger 路由
  app.use(
    "/api-docs",
    basicAuthMiddleware,
    serve,
    setup(specs, {
      customCss: `
      .swagger-ui .topbar { 
        background-color: #2c3e50; 
      }
      .swagger-ui .topbar .download-url-wrapper { 
        display: none; 
      }
    `,
      customSiteTitle: "URL Redirector API Documentation",
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );

  if (isProduction) {
    console.log("🔒 Swagger UI enabled with Basic Authentication");
    console.log(
      `📚 API Documentation: ${EnvironmentConfig.get(
        "BASE_URL",
        "https://your-domain.com"
      )}/api-docs`
    );
  } else {
    console.log(
      "📚 Swagger UI enabled (development mode - no authentication required)"
    );
    console.log("🔗 API Documentation: http://localhost:3000/api-docs");
  }
};

export default initSwagger;
