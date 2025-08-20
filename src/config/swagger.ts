import swaggerJsdoc from "swagger-jsdoc";
import { serve, setup } from "swagger-ui-express";
import { Express } from "express";

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

export const initSwagger = (app: Express): void => {
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
          url: "https://your-domain.com",
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

  app.use("/api-docs", serve, setup(specs));
};

export default initSwagger;
