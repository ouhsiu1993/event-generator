# Event Generator

Event Generator 是一個專業的網頁追蹤事件代碼生成工具，協助行銷人員和開發者快速創建、管理和部署標準化的追蹤代碼。透過直覺的使用者介面，使用者能夠輕鬆配置各種事件追蹤參數，並匯出至多種格式以便實施。

![Event Generator 預覽圖](event-generator.gif)

## 🌟 主要功能

- **基礎代碼生成**：根據網站序號自動生成基礎追蹤代碼
- **多種事件類型**：支援通用、活動、內容、電商和自訂事件等多種類型
- **參數自定義**：針對不同事件提供彈性的參數設定，包含必填與選填欄位
- **多標籤頁管理**：便於在不同事件代碼間切換的標籤式介面
- **響應式設計**：完美適配桌面與行動裝置的各種螢幕尺寸
- **PPT 匯出**：一鍵將所有追蹤代碼匯出為 PowerPoint 簡報
- **雲端整合**：支援將配置儲存至 Google Sheets 以便團隊協作

## 📊 支援的事件類型

### 通用事件
- 頁面瀏覽 (page_view)
- 表單互動 (form_start)
- 表單提交 (form_submit)
- 使用者登入 (login)
- 內容分享 (share)

### 活動事件
- 活動網站首頁瀏覽 (view_site)
- 開始關卡 (level_start)
- 結束關卡 (level_end)
- 發佈分數 (post_score)

### 內容事件
- 文章頁瀏覽 (view_article)
- 滾動深度 (scroll_depth)

### 電商事件
- 加入購物車 (add_to_cart)
- 從購物車移除 (remove_from_cart)
- 查看購物車 (view_cart)
- 開始結帳 (begin_checkout)
- 提交運送資訊 (add_shipping_info)
- 提交付款資訊 (add_payment_info)
- 購買商品 (purchase)
- 退款 (refund)
- 瀏覽商品 (view_item)
- 瀏覽商品清單 (view_item_list)

### 自訂事件
- 支援使用者自定義的追蹤事件名稱和參數

## 🔧 技術架構

本專案採用了現代化的三層架構設計：

1. **前端**：純 HTML/CSS/JavaScript 實現，無框架依賴
   - 使用 Tailwind CSS 進行樣式設計
   - 整合 PptxGenJS 用於生成 PowerPoint 簡報
   - 響應式設計適配各種裝置

2. **中間層**：
   - 使用 Cloudflare Worker 作為 API 轉發代理
   - 處理跨域請求並提供額外的安全層

3. **後端**：
   - 使用 Google Apps Script 實現資料持久化
   - 將追蹤代碼設定儲存至結構化的 Google Sheets
   - 支援多工作表分類管理

## 📝 系統架構圖

```
+------------------+     +--------------------+     +-------------------+
|                  |     |                    |     |                   |
|  Web Frontend    |---->| Cloudflare Worker  |---->| Google Apps Script|
|  (HTML/JS/CSS)   |     | (API Gateway)      |     | (Data Storage)    |
|                  |     |                    |     |                   |
+------------------+     +--------------------+     +-------------------+
                                                            |
                                                            v
                                                    +-------------------+
                                                    |                   |
                                                    |   Google Sheets   |
                                                    |   (Database)      |
                                                    |                   |
                                                    +-------------------+
```

## 🚀 快速開始

### 本地部署

1. 克隆本專案
   ```bash
   git clone https://github.com/ouhsiu1993/event-generator.git
   cd event-generator
   ```

2. 建立本地環境設定
   - 複製 `.env.example` 為 `.env`
   - 編輯 `.env` 檔案，填入您的實際 API URL
   ```
   CLOUDFLARE_WORKER_URL=https://your-worker-url.workers.dev/
   GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/your-script-id/exec
   ```

3. 配置 Cloudflare Worker
   - 創建一個 Cloudflare Worker 專案
   - 使用 `worker.ts` 內的代碼部署 Worker
   - 將 worker.ts 中的 `YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_URL` 替換為您的 Google Apps Script URL
   - 記下 Worker 的 URL 並更新到 `.env` 檔案

4. 設置 Google Apps Script
   - 創建一個新的 Google Apps Script 專案
   - 複製 `appscript` 內的代碼到 Apps Script 編輯器
   - 部署為網頁應用程式，確保權限設定為「所有人，甚至匿名使用者」
   - 記下部署後的 URL

5. 更新配置
   - 確認 `config.js` 中的 apiUrl 設定：
   ```javascript
   const config = {
     apiUrl: 'http://localhost:8787/' // 本地開發時改為您的 Cloudflare Worker URL
   };
   ```

6. 啟動應用
   - 使用本地伺服器或直接開啟 `index.html`
   ```bash
   # 如果有 Node.js 環境，可以使用 http-server
   npx http-server
   ```

## 🖥️ 使用方法

1. 輸入代碼名稱和網站序號
2. 點擊「+」按鈕添加需要的事件
3. 選擇事件類型並設定參數
4. 查看並複製生成的追蹤代碼
5. 使用「下載 PPT」或「儲存至 Google 表單」功能保存結果

## 🛠️ 開發者說明

如需擴展系統功能：

1. 添加新的事件類型
   - 在 `eventData` 物件中添加新的事件類型
   - 在 `eventParamsTemplate` 中定義新事件的預設參數
   - 在 `getEventParamsDef` 中設定參數的詳細定義

2. 修改 Google Apps Script
   - 調整 `doPost` 函數以支援新的數據結構
   - 更新工作表格式以適應新的字段

3. 自定義 UI
   - 修改 CSS 樣式以符合品牌需求
   - 調整響應式斷點以支援更多設備

## 本地儲存至 Excel 的設定

如需正確在本地環境儲存數據至 Google Sheets：

1. 確保 `.env` 檔案中有正確的 API URL 設定：
   ```
   CLOUDFLARE_WORKER_URL=您的實際 Cloudflare Worker URL
   ```

2. 確認 Cloudflare Worker 的跨域設定正確，包含必要的 CORS 標頭

3. 如遇到儲存問題，請檢查瀏覽器控制台錯誤訊息，常見問題包括：
   - CORS 錯誤：確認 Cloudflare Worker 返回正確的 CORS 標頭
   - URL 錯誤：確認環境設定中的 URL 格式正確且末尾包含斜線 (/)

4. 本地測試時，可能需要禁用瀏覽器的某些安全設定，或使用支援跨域請求的本地伺服器

## 📄 授權條款

本專案採用 MIT 授權條款。

## 聯絡方式

如有任何問題或建議，請通過以下方式聯繫：

- GitHub Issues: [https://github.com/ouhsiu1993/event-generator/issues](https://github.com/ouhsiu1993/event-generator/issues)
- Email: ouhsiu1993@gmail.com

## 🙏 鳴謝

- [PptxGenJS](https://github.com/gitbrent/PptxGenJS) - PowerPoint 生成庫
- [Tailwind CSS](https://tailwindcss.com/) - 實用優先的 CSS 框架
- [Cloudflare Workers](https://workers.cloudflare.com/) - 邊緣運算服務
- [Google Apps Script](https://developers.google.com/apps-script) - 雲端自動化平台