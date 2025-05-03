// load-env.js
(function() {
  fetch('.env')
    .then(response => {
      if (!response.ok) {
        throw new Error('無法加載 .env 文件，狀態碼: ' + response.status);
      }
      return response.text();
    })
    .then(data => {
      window.env = {};
      
      // 解析 .env 文件內容
      data.split('\n').forEach(line => {
        // 忽略註釋和空行
        if (line.trim() && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          // 處理值中可能包含 = 號的情況
          const value = valueParts.join('=');
          
          if (key && value) {
            window.env[key.trim()] = value.trim();
            console.log(`已載入環境變量: ${key.trim()}`);
          }
        }
      });
      
      console.log('環境變量已成功載入');
      
      // 觸發自定義事件，通知其他腳本環境變量已加載
      const event = new Event('envLoaded');
      document.dispatchEvent(event);
    })
    .catch(error => {
      console.error('載入環境變量失敗:', error);
      console.warn('將使用默認值初始化應用');
      
      // 創建空的環境變量對象，應用將使用默認值
      window.env = {};
      
      // 即使加載失敗，也觸發事件以初始化應用
      const event = new Event('envLoaded');
      document.dispatchEvent(event);
    });
})();