// config.js
const config = {
    apiUrl: 'http://localhost:8787/' // 預設為本地開發環境，避免推送實際的生產 URL
};

// 若有環境變數，優先使用環境變數
if (window.env && window.env.CLOUDFLARE_WORKER_URL) {
    config.apiUrl = window.env.CLOUDFLARE_WORKER_URL;
}