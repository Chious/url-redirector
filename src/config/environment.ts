import dotenv from "dotenv";
import path from "path";

/**
 * 環境配置管理器
 * 根據 NODE_ENV 自動載入對應的環境變數檔案
 */
class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private isConfigured = false;

  private constructor() {}

  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  /**
   * 初始化環境配置
   * 根據 NODE_ENV 載入對應的 .env 檔案
   */
  public configure(): void {
    if (this.isConfigured) {
      return;
    }

    const nodeEnv = process.env["NODE_ENV"] || "development";

    // 定義不同環境對應的配置檔案
    const envFiles = this.getEnvFiles(nodeEnv);

    // 載入配置檔案（按優先順序）
    envFiles.forEach((envFile) => {
      const result = dotenv.config({ path: envFile });
      if (result.parsed) {
        console.log(`✅ Loaded environment config: ${envFile}`);
      }
    });

    this.isConfigured = true;
    this.logEnvironmentInfo();
  }

  /**
   * 根據環境獲取要載入的配置檔案清單
   * @param nodeEnv 環境名稱
   * @returns 配置檔案路徑陣列（按優先順序排列）
   */
  private getEnvFiles(nodeEnv: string): string[] {
    const rootDir = path.resolve(process.cwd());

    switch (nodeEnv) {
      case "production":
        return [
          path.join(rootDir, ".env"), // 基本配置
          path.join(rootDir, ".env.production"), // 生產環境專用配置
        ];

      case "test":
        return [
          path.join(rootDir, ".env"), // 基本配置
          path.join(rootDir, ".env.test"), // 測試環境專用配置
        ];

      case "development":
      default:
        return [
          path.join(rootDir, ".env"), // 基本配置
          path.join(rootDir, ".env.local"), // 本地開發配置
        ];
    }
  }

  /**
   * 輸出環境資訊到控制台
   */
  private logEnvironmentInfo(): void {
    const nodeEnv = process.env["NODE_ENV"] || "development";
    const port = process.env["PORT"] || "3000";
    const mongoUri = process.env["MONGODB_URI"] || "not configured";
    const swaggerEnabled = process.env["SWAGGER_ENABLED"] || "true";

    console.log("🔧 Environment Configuration:");
    console.log(`   📍 NODE_ENV: ${nodeEnv}`);
    console.log(`   🌐 PORT: ${port}`);
    console.log(
      `   🗄️  MongoDB URI: ${mongoUri.replace(/\/\/.*@/, "//***:***@")}`
    ); // 隱藏認證資訊
    console.log(`   📚 Swagger Enabled: ${swaggerEnabled}`);
    console.log(
      `   🚀 Base URL: ${process.env["BASE_URL"] || "not configured"}`
    );
  }

  /**
   * 獲取環境變數，支援預設值
   * @param key 環境變數名稱
   * @param defaultValue 預設值
   * @returns 環境變數值或預設值
   */
  public static get(key: string, defaultValue?: string): string {
    return process.env[key] || defaultValue || "";
  }

  /**
   * 獲取數字型環境變數
   * @param key 環境變數名稱
   * @param defaultValue 預設值
   * @returns 數字值
   */
  public static getNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (!value) return defaultValue;

    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * 獲取布林型環境變數
   * @param key 環境變數名稱
   * @param defaultValue 預設值
   * @returns 布林值
   */
  public static getBoolean(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (!value) return defaultValue;

    return value.toLowerCase() === "true";
  }

  /**
   * 檢查必要的環境變數是否已設定
   * @param requiredVars 必要環境變數清單
   * @throws Error 如果有必要變數未設定
   */
  public static validateRequired(requiredVars: string[]): void {
    const missing = requiredVars.filter((varName) => !process.env[varName]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}\n` +
          "Please check your .env file configuration."
      );
    }
  }
}

export default EnvironmentConfig;
