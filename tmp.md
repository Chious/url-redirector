# 縮網址產生器

### User Story

將原始網址轉成短網址、產生 QR Code

### 需求

- 短網址需唯一，且具備隨機性
- 短網址需具備可讀性，且具備隨機性
- 短網址需具備可讀性，且具備隨機性
  回傳格式：根據需求回傳 Base64 或是圖片

- 需要有前端的樣板 index.html，可以輸入原始網址，並產生短網址及 QR Code，並且可以顯示短網址的點擊次數

### Tech Stack

- express
- mongo
- nanoid

### 資料庫 Schema

- 短碼
- 原始網址
- 短網址
- 建立時間
- 更新時間
- 點擊次數

### API Endpoint

GET /:code 轉址原網址
GET /info/:code 查詢短網址
