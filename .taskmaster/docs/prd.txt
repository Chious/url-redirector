# 📌 縮網址產生器 PRD

## 1. 專案概述

縮網址產生器是一個提供 **長網址 → 短網址** 轉換服務的系統。
使用者輸入一個原始網址，系統會產生一個唯一的短網址，並將其與原始網址對應儲存。

此外，專案將提供 **RESTful API**，方便第三方應用程式或前端頁面透過 API 產生短網址。

此專案將以 **Express.js** 搭配 **MongoDB** 開發，並使用 **Docker Compose** 管理開發環境。
Swagger UI 將提供 API 文件，方便使用者查閱。

---

## 2. 核心功能

1. **縮網址功能**

   - 輸入長網址 → 回傳對應的短網址
   - 短網址需唯一，且具備隨機性

2. **短網址跳轉**

   - 使用者訪問短網址 → 自動導向至原始網址

3. **API 服務**

   - 提供 RESTful API，包含：

     - 建立短網址
     - 取得原始網址
     - 健康檢查

4. **資料儲存**

   - 使用 MongoDB 儲存「短網址與原始網址的對應關係」

5. **Swagger 文件**

   - 提供 API 文件，方便使用者測試

---

## 3. 使用者流程

### 3.1 建立短網址

1. 使用者輸入一個長網址 (e.g., `https://example.com/article/12345`)
2. 系統檢查該長網址是否已有縮網址

   - 若存在 → 回傳已存在的短網址
   - 若不存在 → 產生新的短網址並儲存

3. 回傳短網址給使用者 (e.g., `http://short.ly/AbCdE1`)

### 3.2 使用短網址

1. 使用者在瀏覽器輸入短網址 (e.g., `http://short.ly/AbCdE1`)
2. 系統查詢 MongoDB
3. 找到對應的原始網址 → 導向該網址

---

## 4. API 規格

### 4.1 建立短網址

- **Endpoint**: `POST /api/shorten`
- **Request**:

```json
{
  "url": "https://example.com/article/12345"
}
```

- **Response**:

```json
{
  "shortUrl": "http://short.ly/AbCdE1",
  "originalUrl": "https://example.com/article/12345"
}
```

### 4.2 取得原始網址

- **Endpoint**: `GET /:shortCode`
- **Response**: **302 Redirect → 原始網址**

### 4.3 健康檢查

- **Endpoint**: `GET /api/health`
- **Response**:

```json
{
  "status": "ok",
  "timestamp": "2025-08-18T14:32:00Z"
}
```

---

## 5. 資料結構

### MongoDB Collection: `urls`

```json
{
  "_id": "ObjectId",
  "originalUrl": "https://example.com/article/12345",
  "shortCode": "AbCdE1",
  "createdAt": "2025-08-18T14:32:00Z",
  "updatedAt": "2025-08-18T14:32:00Z"
}
```

---

## 6. 系統架構

### 6.1 技術選型

- **Backend Framework**: Express.js
- **Database**: MongoDB
- **Containerization**: Docker Compose
- **Documentation**: Swagger UI

### 6.2 架構設計

- API Server (Express.js)
- MongoDB (資料儲存)
- Docker Compose 管理服務
- Swagger UI 提供 API 測試介面

---

## 7. 非功能需求

- **效能**

  - 每秒至少可處理 **100 requests**
  - 短網址查詢延遲 < 100ms

- **安全性**

  - 過濾惡意輸入網址（避免 XSS, SQL injection）
  - 可考慮加入 reCAPTCHA 防止濫用

- **可用性**

  - API uptime ≥ 99.9%
  - Docker 環境可快速部署

- **可擴充性**

  - 短網址產生器可支援自訂 domain
  - 可加入統計功能（點擊數、來源追蹤）

---

## 8. 未來擴充方向

- **統計功能**

  - 每個短網址的點擊次數
  - 來源 IP 與裝置資訊

- **自訂短網址**

  - 使用者可自訂短碼 (e.g., `http://short.ly/my-link`)

- **有效期限設定**

  - 短網址可設定自動過期時間

- **使用者系統**

  - 提供會員登入，管理自己的短網址

---

## 9. 里程碑

- **MVP 版本**

  - 短網址產生 & 跳轉
  - MongoDB 儲存
  - RESTful API + Swagger 文件

- **v1.1**

  - 增加 API 錯誤處理
  - 健康檢查端點

- **v2.0 (未來規劃)**

  - 使用者登入 / 權限控管
  - 點擊次數統計
  - 自訂短網址
