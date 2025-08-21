# MongoDB Replica Set 設定指南

## 問題描述

當使用 Prisma 與 MongoDB 時，會遇到以下錯誤：

```
Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set.
```

同時，如果在 replica set 中啟用授權，會遇到：

```
BadValue: security.keyFile is required when authorization is enabled with replica sets
```

## 解決方案

### 開發環境（推薦）

對於開發環境，我們使用 `--noauth` 參數來簡化設定，避免 keyFile 的複雜性：

**關鍵設定**：

- `--replSet rs0`：啟用名為 "rs0" 的 replica set
- `--bind_ip_all`：允許所有 IP 連接
- `--noauth`：停用授權，避免 keyFile 需求

### 環境變數設定

您的 `.env` 檔案需要包含正確的 MongoDB URI：

```bash
# 開發環境 - 無授權的 replica set
MONGODB_URI=mongodb://mongo:27017/url-shortener?replicaSet=rs0

# 其他設定
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
SWAGGER_ENABLED=true

# Mongo Express 設定（可選）
ME_CONFIG_BASICAUTH_USERNAME=admin
ME_CONFIG_BASICAUTH_PASSWORD=admin
```

### 重要事項

1. **URI 格式**：必須包含 `?replicaSet=rs0` 參數
2. **無需授權**：開發環境中移除了用戶名密碼需求
3. **自動初始化**：容器啟動時會自動初始化 replica set

## 使用步驟

1. **停止現有容器**：

   ```bash
   docker-compose down -v
   ```

2. **更新 .env 檔案**：

   ```bash
   MONGODB_URI=mongodb://mongo:27017/url-shortener?replicaSet=rs0
   ```

3. **啟動服務**：

   ```bash
   docker-compose up -d
   ```

4. **檢查日誌**：
   ```bash
   docker-compose logs -f mongo
   ```

## 驗證設定

連接到 MongoDB 並檢查 replica set 狀態：

```bash
# 進入 MongoDB 容器
docker-compose exec mongo mongosh

# 檢查 replica set 狀態
rs.status()
```

## 生產環境注意事項

**⚠️ 警告**：此設定僅適用於開發環境！

生產環境應該：

- 啟用授權 (`--auth`)
- 使用 keyFile 進行內部驗證
- 設定適當的用戶權限
- 使用 TLS/SSL 加密

## 疑難排解

### 問題：App 無法連接到 MongoDB

**解決**：檢查 MongoDB URI 是否包含 `replicaSet=rs0` 參數

### 問題：Replica set 初始化失敗

**解決**：

```bash
docker-compose logs mongo
docker-compose restart mongo
```

### 問題：Prisma 仍然報告需要 replica set

**解決**：確認 MongoDB URI 格式正確且 replica set 已成功初始化
