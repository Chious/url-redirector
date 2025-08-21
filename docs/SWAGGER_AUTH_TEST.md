# Swagger 認證功能測試指南

## 測試步驟

### 1. 開發環境測試 (無認證)

```bash
# 啟動開發環境
npm run dev

# 測試存取 (應該無需認證)
curl http://localhost:3000/api-docs
```

**期望結果**: 直接返回 Swagger HTML 頁面，無需認證

### 2. 生產環境測試 (需要認證)

```bash
# 設定生產環境變數
export NODE_ENV=production
export ME_CONFIG_BASICAUTH_USERNAME=testuser
export ME_CONFIG_BASICAUTH_PASSWORD=testpass

# 啟動生產模式
npm run build
npm start
```

#### 測試無認證存取 (應該被拒絕)

```bash
curl http://localhost:3000/api-docs
```

**期望結果**:

```json
{
  "error": "Unauthorized",
  "message": "請提供有效的認證資訊以存取 API 文件"
}
```

#### 測試錯誤認證 (應該被拒絕)

```bash
curl -u wronguser:wrongpass http://localhost:3000/api-docs
```

**期望結果**:

```json
{
  "error": "Unauthorized",
  "message": "帳號或密碼錯誤"
}
```

#### 測試正確認證 (應該成功)

```bash
curl -u testuser:testpass http://localhost:3000/api-docs
```

**期望結果**: 返回 Swagger HTML 頁面

### 3. 瀏覽器測試

1. 開啟瀏覽器，訪問 `http://localhost:3000/api-docs`
2. 生產環境應彈出認證對話框
3. 輸入正確的帳號密碼
4. 應該能正常存取 Swagger 介面

### 4. Docker 環境測試

```bash
# 生產環境 Docker 測試
npm run docker:build

# 測試認證
curl -u admin:admin http://localhost:3000/api-docs
```

## 驗證要點

- ✅ 開發環境無需認證即可存取
- ✅ 生產環境需要正確的 Basic Auth 才能存取
- ✅ 錯誤認證會返回適當的錯誤訊息
- ✅ 正確認證後能正常使用 Swagger 功能
- ✅ 環境變數正確控制認證行為

## 故障排除

### 認證一直失效

- 檢查 `NODE_ENV` 是否設定為 `production`
- 確認環境變數 `ME_CONFIG_BASICAUTH_USERNAME` 和 `ME_CONFIG_BASICAUTH_PASSWORD` 設定正確

### 瀏覽器快取問題

- 清除瀏覽器快取
- 使用無痕模式測試

### Docker 環境認證問題

- 確認 docker-compose.yml 中的環境變數設定
- 檢查容器內的環境變數是否正確載入
