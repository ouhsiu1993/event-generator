// 輔助函數：獲取環境變量
function getEnv(key, defaultValue = '') {
    if (window.config && window.config[key]) {
      return window.config[key];
    }
    return window.env && window.env[key] ? window.env[key] : defaultValue;
  }

// 事件數據
const eventData = {
    general: [
        { id: 'page_view', name: 'page_view - 頁面瀏覽' },
        { id: 'form_start', name: 'form_start - 表單互動' },
        { id: 'form_submit', name: 'form_submit - 表單提交' },
        { id: 'login', name: 'login - 使用者登入' },
        { id: 'share', name: 'share - 內容分享' }
    ],
    activity: [
        { id: 'view_site', name: 'view_site - 活動網站首頁瀏覽' },
        { id: 'level_start', name: 'level_start - 開始關卡' },
        { id: 'level_end', name: 'level_end - 結束關卡' },
        { id: 'post_score', name: 'post_score - 發佈分數' }
    ],
    content: [
        { id: 'view_article', name: 'view_article - 文章頁瀏覽' },
        { id: 'scroll_depth', name: 'scroll_depth - 滾動深度' }
    ],
    ecommerce: [
        { id: 'add_to_cart', name: 'add_to_cart - 加入購物車' },
        { id: 'remove_from_cart', name: 'remove_from_cart - 從購物車移除' },
        { id: 'view_cart', name: 'view_cart - 查看購物車' },
        { id: 'begin_checkout', name: 'begin_checkout - 開始結帳' },
        { id: 'add_shipping_info', name: 'add_shipping_info - 提交運送資訊' },
        { id: 'add_payment_info', name: 'add_payment_info - 提交付款資訊' },
        { id: 'purchase', name: 'purchase - 購買商品' },
        { id: 'refund', name: 'refund - 退款' },
        { id: 'view_item', name: 'view_item - 瀏覽商品' },
        { id: 'view_item_list', name: 'view_item_list - 瀏覽商品清單' }
    ],
    custom: []
};

// 事件參數模板
const eventParamsTemplate = {
    page_view: `{
  page_title: '頁面標題',
  page_location: 'https://example.com'
}`,
    form_start: `{
  form_id: 'form_id',
  form_name: '表單名稱'
}`,
    form_submit: `{
  form_id: 'form_id',
  form_name: '表單名稱',
  email: 'user@example.com'
}`,
    login: `{
  method: 'Facebook',
  email: 'user@example.com'
}`,
    share: `{
  method: 'Facebook'
}`,
    view_site: `{}`,
    level_start: `{
  level_name: '第一關'
}`,
    level_end: `{
  level_name: '第一關',
  result: '成功'
}`,
    post_score: `{
  score: 100,
  level_name: '第一關'
}`,
    view_article: `{
  article_id: 'article_123'
}`,
    scroll_depth: `{
  scroll_ratio: 0.5
}`,
    add_to_cart: `{
  currency: 'TWD',
  value: 100,
  items: [{
    item_id: 'SKU_123',
    item_name: '商品名稱',
    price: 100,
    quantity: 1
  }]
}`,
    view_cart: `{
  currency: 'TWD',
  value: 100,
  items: [{
    item_id: 'SKU_123',
    item_name: '商品名稱',
    price: 100,
    quantity: 1
  }]
}`,
    custom_event: `{
  event_category: '活動名稱',
  event_label: '按鈕點擊',
  value: 1
}`
};

// 應用狀態
const state = {
    serialNumber: '',
    tabs: [
        { id: 1, title: '基礎代碼', type: 'basic', closable: false }
    ],
    activeTabId: 1,
    nextTabId: 2,
    eventParams: {},
    selectedEventId: '',
    selectedEventCategory: 'general',
    // 使用環境變量
    apiUrl: getEnv('CLOUDFLARE_WORKER_URL', 'YOUR_CLOUDFLARE_WORKER_URL')
};

// DOM元素引用
let dom = {};

// 初始化 DOM 引用
function initDomReferences() {
    dom = {
        downloadPptBtn: document.getElementById('download-ppt-btn'),
        projectName: document.getElementById('projectName'),
        tabContainer: document.getElementById('tab-container'),
        tabContent: document.getElementById('tab-content'),
        addTabBtn: document.getElementById('add-tab-btn'),
        eventSelector: document.getElementById('event-selector'),
        eventCategory: document.getElementById('event-category'),
        standardEventsContainer: document.getElementById('standard-events-container'),
        customEventContainer: document.getElementById('custom-event-container'),
        customEventName: document.getElementById('custom-event-name'),
        eventsList: document.getElementById('events-list'),
        cancelEventBtn: document.getElementById('cancel-event-btn'),
        createEventBtn: document.getElementById('create-event-btn'),
        // 新增的DOM引用
        saveToSheetBtn: document.getElementById('save-to-sheet-btn'),
        saveToSheetModal: document.getElementById('save-to-sheet-modal'),
        displayProjectName: document.getElementById('display-project-name'),
        cancelSaveBtn: document.getElementById('cancel-save-btn'),
        confirmSaveBtn: document.getElementById('confirm-save-btn'),
        saveStatus: document.getElementById('save-status'),
        saveSuccess: document.querySelector('.save-success'),
        saveError: document.querySelector('.save-error'),
        saveLoading: document.querySelector('.save-loading'),
        // 新增的參考
        tabsDropdown: null,
        tabsDropdownContent: null
    };
}

// 添加事件監聽器
function setupEventListeners() {
    dom.downloadPptBtn.addEventListener('click', downloadEventsAsPPT);
    
    // 添加標籤按鈕點擊
    dom.addTabBtn.addEventListener('click', openEventSelector);
    
    // 事件選擇器相關事件
    dom.eventCategory.addEventListener('change', handleEventCategoryChange);
    dom.cancelEventBtn.addEventListener('click', closeEventSelector);
    dom.createEventBtn.addEventListener('click', handleCreateEvent);
    dom.customEventName.addEventListener('input', validateCreateButton);

    // 項目名稱變更
    dom.projectName.addEventListener('input', (e) => {
    state.projectName = e.target.value;
    });

    // 新增：儲存至Google Sheets相關事件
    dom.saveToSheetBtn.addEventListener('click', openSaveToSheetModal);
    dom.cancelSaveBtn.addEventListener('click', closeSaveToSheetModal);
    dom.confirmSaveBtn.addEventListener('click', saveDataToSheet);

    // 保存上次使用的Google Sheets API配置
    

    
}

function init() {
    initDomReferences();
    renderTabs();
    renderTabContent();
    populateEventsList();
    setupEventListeners();
    // 在 init 函數的最後
    setTimeout(() => {
    document.querySelectorAll('.code-display').forEach(element => {
        adjustCodeHeight(element);
        });
    }, 100);
}

// 生成基礎安裝代碼
function generateEventScript(serialNumber) {
    // 如果序號為空，使用提示文字
    const displaySerialNumber = serialNumber ? serialNumber : 'YOUR_SERIAL_NUMBER';
    
    return `<script>
  !(function (t, a, e, n) {
    if (!t.Tag) {
      (t.Tag = function () {
        t.Tag.dataList.push(Array.prototype.slice.call(arguments));
      }),
        (t.Tag.dataList = t.Tag.dataList || []);
      var i = a.getElementsByTagName('script')[0],
        s = a.createElement('script');
      (s.async = !0),
        (s.src = 'https://tag.com/sdk/-tag.min.js'),
        i.parentNode.insertBefore(s, i);
    }
  })(window, document);
<\/script>
<script>
  // 設定網站序號
  Tag('config', '${displaySerialNumber}');
  // 全域設定：設定是否允許自動追蹤 engaged 相關事件。
  Tag('set', 'allow_engaged_events', true);
  // 觸發 page_view 事件
  Tag('track', 'page_view');
<\/script>`;
}

function generateCustomCode(event, params) {
    if (!event) return '';

    let formattedParams = '';
    if (params) {
        try {
            const parsed = JSON.parse(params);
            const keys = Object.keys(parsed);
            if (keys.length > 0) {
                formattedParams = ', ' + JSON.stringify(parsed, null, 2)
                    .replace(/"/g, "'");
            }
        } catch (e) {
            console.error('generateCustomCode JSON parse error:', e);
        }
    }

    return `<script>
  // 觸發 ${event} 事件
  Tag('track', '${event}'${formattedParams});
<\/script>`;
}

// 調整代碼區域高度
function adjustCodeHeight(codeElement) {
    if (!codeElement) {
        console.error('找不到代碼元素');
        return;
    }
    
    // 確保代碼內容是可見的
    codeElement.style.display = 'block';
    
    // 重置高度
    codeElement.style.height = 'auto';
    
    // 設置最小高度為120px
    const minHeight = 120;
    // 計算實際內容高度（根據內容多少自動調整）
    const scrollHeight = codeElement.scrollHeight;
    
    // 確保代碼顯示完整，不設置最大高度限制
    const newHeight = Math.max(scrollHeight, minHeight);
    codeElement.style.height = `${newHeight}px`;
    
    // 移除滾動條，因為我們想要顯示全部內容
    codeElement.style.overflowY = 'visible';
    
    console.log(`調整代碼區域高度: ID=${codeElement.id}, 高度=${newHeight}px, 內容高度=${scrollHeight}px`);
}

// 改進的標籤頁渲染功能
function renderTabs() {
    // 清除所有現有標籤 (除了添加按鈕)
    while (dom.tabContainer.firstChild) {
        dom.tabContainer.removeChild(dom.tabContainer.firstChild);
    }
    
    // 創建一個新的標籤容器，包含可見標籤和下拉菜單
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs-container flex items-center border-b border-gray-200 mb-4 overflow-x-auto tab-scroll';
    dom.tabContainer.appendChild(tabsContainer);
    
    // 決定哪些標籤直接顯示，哪些放在下拉菜單中
    const maxVisibleTabs = calculateVisibleTabs();
    
    // 顯示基礎代碼標籤和一些活動標籤
    const visibleTabs = state.tabs.slice(0, maxVisibleTabs);
    const hiddenTabs = state.tabs.slice(maxVisibleTabs);
    
    // 添加可見的標籤
    visibleTabs.forEach(tab => {
        const tabElement = createTabElement(tab);
        tabsContainer.appendChild(tabElement);
    });
    
    // 創建更多標籤的下拉菜單 (如果有隱藏的標籤)
    if (hiddenTabs.length > 0) {
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'tabs-dropdown ml-2';
        
        const dropdownBtn = document.createElement('button');
        dropdownBtn.className = 'tabs-dropdown-btn';
        dropdownBtn.innerHTML = `
            更多標籤 (${hiddenTabs.length})
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        `;
        
        const dropdownContent = document.createElement('div');
        dropdownContent.className = 'tabs-dropdown-content';
        
        // 按類別分組隱藏的標籤
        const tabsByCategory = groupTabsByCategory(hiddenTabs);
        
        // 按類別添加標籤到下拉菜單
        Object.keys(tabsByCategory).forEach(category => {
            // 添加類別標題
            const categoryTitle = document.createElement('div');
            categoryTitle.className = 'tab-category-title';
            categoryTitle.textContent = getCategoryDisplayName(category);
            dropdownContent.appendChild(categoryTitle);
            
            // 添加該類別下的標籤
            tabsByCategory[category].forEach(tab => {
                const tabItem = document.createElement('div');
                tabItem.className = `tab-dropdown-item ${state.activeTabId === tab.id ? 'active' : ''}`;
                tabItem.textContent = tab.title;
                tabItem.addEventListener('click', () => {
                    switchTab(tab.id);
                    dropdownContainer.classList.remove('open');
                });
                
                dropdownContent.appendChild(tabItem);
            });
        });
        
        // 添加下拉菜單點擊事件
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownContainer.classList.toggle('open');
        });
        
        // 點擊頁面其他地方關閉下拉菜單
        document.addEventListener('click', () => {
            dropdownContainer.classList.remove('open');
        });
        
        dropdownContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        dropdownContainer.appendChild(dropdownBtn);
        dropdownContainer.appendChild(dropdownContent);
        tabsContainer.appendChild(dropdownContainer);
        
        // 保存引用以便其他函數使用
        dom.tabsDropdown = dropdownContainer;
        dom.tabsDropdownContent = dropdownContent;
    }
    
    // 添加新增標籤按鈕
    tabsContainer.appendChild(dom.addTabBtn);
}

// 創建單個標籤元素
function createTabElement(tab) {
    const tabElement = document.createElement('div');
    tabElement.className = `tab ${state.activeTabId === tab.id ? 'active' : ''}`;
    tabElement.addEventListener('click', () => switchTab(tab.id));
    
    const titleSpan = document.createElement('span');
    titleSpan.textContent = tab.title;
    tabElement.appendChild(titleSpan);
    
    if (tab.closable) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>`;
        closeBtn.addEventListener('click', event => {
            event.stopPropagation();
            closeTab(tab.id);
        });
        tabElement.appendChild(closeBtn);
    }
    
    return tabElement;
}

// 計算應該直接顯示的標籤數量
function calculateVisibleTabs() {
    // 根據窗口寬度動態計算
    // 這裡的邏輯可以根據實際情況調整
    const windowWidth = window.innerWidth;
    if (windowWidth < 640) { // 小屏幕
        return Math.min(2, state.tabs.length);
    } else if (windowWidth < 768) { // 中等屏幕
        return Math.min(3, state.tabs.length);
    } else if (windowWidth < 1024) { // 大屏幕
        return Math.min(5, state.tabs.length);
    } else { // 超大屏幕
        return Math.min(7, state.tabs.length);
    }
}

// 按類別分組標籤
function groupTabsByCategory(tabs) {
    const categories = {};
    
    tabs.forEach(tab => {
        const category = tab.eventCategory || 'other';
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(tab);
    });
    
    return categories;
}

// 獲取類別的顯示名稱
function getCategoryDisplayName(category) {
    const categoryNames = {
        'general': '通用事件',
        'activity': '活動事件',
        'content': '內容事件',
        'ecommerce': '電商事件',
        'custom': '自訂事件',
        'other': '其他'
    };
    
    return categoryNames[category] || category;
}

// 渲染標籤頁內容
function renderTabContent() {
    // 清除所有內容
    dom.tabContent.innerHTML = '';
    
    // 獲取當前活動標籤頁
    const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
    if (!activeTab) return;
    
    // 創建內容容器
    const contentContainer = document.createElement('div');
    contentContainer.className = 'p-4';
    
    // 根據標籤頁類型渲染不同內容
    if (activeTab.type === 'basic') {
        // 這裡使用 htmlContent 變數來儲存 HTML 內容，以便於顯示代碼區域
        const htmlContent = `
            <div>
                <div class="mb-6">
                    <label class="form-label">網站序號</label>
                    <input
                        type="text"
                        id="serial-number"
                        value="${state.serialNumber}"
                        placeholder="YOUR_SERIAL_NUMBER"
                        class="w-full p-3 border rounded-lg"
                    />
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                    <div class="flex justify-between items-center mb-2">
                        <h2 class="text-lg font-medium">基礎安裝代碼</h2>
                        <button 
                            class="btn copy-btn"
                            data-code-id="basic-code"
                        >
                            複製代碼
                        </button>
                    </div>
                    <pre id="basic-code" class="code-display"></pre>
                </div>
                
                <div class="tip-box">
                    <p class="tip-text">
                        <strong>提示：</strong> 將上面的代碼放在網頁 &lt;head&gt;&lt;/head&gt; 裡最上方的位置，盡可能越早載入越好。
                    </p>
                </div>
            </div>
        `;
        
        // 設置 HTML 內容
        contentContainer.innerHTML = htmlContent;

// 更新代碼顯示區域內容
const codeElement = contentContainer.querySelector('#basic-code');
// 使用 textContent 來確保代碼正確顯示
codeElement.textContent = generateEventScript(state.serialNumber);

        // 添加序號輸入變化事件
        const serialInput = contentContainer.querySelector('#serial-number');
        serialInput.addEventListener('input', e => {
        state.serialNumber = e.target.value;
        // 更新代碼
        codeElement.textContent = generateEventScript(state.serialNumber);
        // 更新代碼區域高度
        adjustCodeHeight(codeElement);
        });
        
        // 添加複製按鈕事件
        const copyBtn = contentContainer.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => {
            copyToClipboard(codeElement.textContent);
        });
        
        // 將容器添加到 DOM
        dom.tabContent.appendChild(contentContainer);
        
        // 調整代碼區域高度（確保在 DOM 加載後執行）
        setTimeout(() => {
            console.log('準備調整基礎代碼區域高度...');
            adjustCodeHeight(codeElement);
        }, 10);
    } else {
        // 獲取事件名稱和參數
        const eventName = activeTab.eventName;
        const eventCategory = activeTab.eventCategory || getEventCategoryByEventName(eventName);
        
        // 創建事件參數選擇區域
        const paramsContainer = document.createElement('div');
        paramsContainer.className = 'mb-6';
        
        // 事件名稱顯示
        const eventNameDiv = document.createElement('div');
        eventNameDiv.className = 'mb-4';
        eventNameDiv.innerHTML = `
            <label class="form-label">事件名稱</label>
            <div class="p-2 bg-gray-100 rounded border">${eventName}</div>
        `;
        paramsContainer.appendChild(eventNameDiv);
        
        // 參數設置區域標題
        const paramsTitleDiv = document.createElement('div');
        paramsTitleDiv.className = 'mb-2';
        paramsTitleDiv.innerHTML = `
            <label class="form-label">事件參數</label>
            <p class="text-sm text-gray-500 mb-2">選擇要包含的參數，並設定相應的值</p>
        `;
        paramsContainer.appendChild(paramsTitleDiv);
        
        // 獲取該事件類型的參數定義
        const paramsDef = getEventParamsDef(eventName, eventCategory);
        
        // 目前事件的參數值 (從 state 中獲取或使用預設值)
        const currentParams = state.eventParams[activeTab.id] ? 
            parseParamsString(state.eventParams[activeTab.id]) : {};
        
        // 創建參數選擇和輸入區域
        const paramsFormDiv = document.createElement('div');
        paramsFormDiv.className = 'params-form space-y-3 border rounded-lg p-3 bg-gray-50';
        
        // 為每個參數創建輸入元素
        paramsDef.forEach(param => {
            const paramInputGroup = document.createElement('div');
            paramInputGroup.className = 'param-group flex items-start';
            
            // 添加勾選框用於選擇是否包含該參數
            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'mr-2 mt-2';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `param-check-${activeTab.id}-${param.name}`;
            checkbox.className = 'param-checkbox';
            checkbox.checked = param.required || (currentParams[param.name] !== undefined);
            checkbox.disabled = param.required; // 必填參數不能取消選擇
            
            checkboxContainer.appendChild(checkbox);
            paramInputGroup.appendChild(checkboxContainer);
            
            // 添加參數輸入區域
            const inputContainer = document.createElement('div');
            inputContainer.className = 'flex-1';
            
            // 參數標籤 (名稱和必填標記)
            const paramLabel = document.createElement('label');
            paramLabel.htmlFor = `param-input-${activeTab.id}-${param.name}`;
            paramLabel.className = 'block text-sm font-medium text-gray-700 mb-1';
            paramLabel.innerHTML = `${param.name} ${param.required ? '<span class="text-red-500">*</span>' : ''}`;
            if (param.description) {
                paramLabel.innerHTML += ` <span class="text-xs text-gray-500">(${param.description})</span>`;
            }
            inputContainer.appendChild(paramLabel);
            
            // 根據參數類型創建不同的輸入元素
            let inputElement;
            
            if (param.name === 'items' && param.type === 'array') {
                // 商品項目陣列需要特殊處理
                inputElement = document.createElement('textarea');
                inputElement.rows = 6;
                inputElement.placeholder = '請輸入商品項目陣列 (JSON 格式)';
                inputElement.value = currentParams[param.name] ? 
                    JSON.stringify(currentParams[param.name], null, 2) : 
                    '[{\n  "item_id": "SKU_123",\n  "item_name": "商品名稱",\n  "price": 100,\n  "quantity": 1\n}]';
            } else if (param.type === 'number') {
                inputElement = document.createElement('input');
                inputElement.type = 'number';
                inputElement.step = 'any';
                inputElement.placeholder = param.example || '';
                inputElement.value = currentParams[param.name] !== undefined ? 
                    currentParams[param.name] : '';
            } else {
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.placeholder = param.example || '';
                inputElement.value = currentParams[param.name] !== undefined ? 
                    currentParams[param.name] : '';
            }
            
            inputElement.id = `param-input-${activeTab.id}-${param.name}`;
            inputElement.className = 'w-full p-2 border rounded text-sm';
            
            // 如果參數未選中或是必填，設定相應狀態
            if (!checkbox.checked) {
                inputElement.disabled = true;
                inputElement.className += ' bg-gray-100';
            }
            
            // 勾選框和輸入框的聯動
            checkbox.addEventListener('change', () => {
                inputElement.disabled = !checkbox.checked;
                if (checkbox.checked) {
                    inputElement.className = inputElement.className.replace(' bg-gray-100', '');
                    inputElement.focus();
                } else {
                    inputElement.className += ' bg-gray-100';
                }
                updateEventParams();
            });
            
            // 輸入值變更時更新參數
            inputElement.addEventListener('input', updateEventParams);
            
            inputContainer.appendChild(inputElement);
            
            // 如果有範例值，顯示在輸入框下方
            if (param.example && param.name !== 'items') {
                const exampleText = document.createElement('p');
                exampleText.className = 'text-xs text-gray-500 mt-1';
                exampleText.textContent = `範例: ${param.example}`;
                inputContainer.appendChild(exampleText);
            }
            
            paramInputGroup.appendChild(inputContainer);
            paramsFormDiv.appendChild(paramInputGroup);
        });
        
        paramsContainer.appendChild(paramsFormDiv);
        
        // 生成的代碼區域
        const codeContainer = document.createElement('div');
        codeContainer.className = 'bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4';
        codeContainer.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-lg font-medium">生成的代碼</h2>
                <button 
                    class="btn copy-btn"
                    data-code-id="event-code-${activeTab.id}"
                >
                    複製代碼
                </button>
            </div>
            <pre id="event-code-${activeTab.id}" class="code-display"></pre>
        `;
        
        // 構建完整的內容
        contentContainer.appendChild(paramsContainer);
        contentContainer.appendChild(codeContainer);
        
        // 將內容添加到DOM
        dom.tabContent.appendChild(contentContainer);
        
        // 更新代碼顯示
        updateEventCode();
        
        // 添加複製按鈕事件
        const copyBtn = contentContainer.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => {
            const codeElement = document.getElementById(`event-code-${activeTab.id}`);
            copyToClipboard(codeElement.textContent);
        });
        
        // 調整代碼區域高度
        setTimeout(() => {
            const codeElement = document.getElementById(`event-code-${activeTab.id}`);
            adjustCodeHeight(codeElement);
        }, 10);
        
        // 更新事件參數函數
        function updateEventParams() {
            const newParams = {};
            
            // 獲取所有選中的參數值
            paramsDef.forEach(param => {
                const checkbox = document.getElementById(`param-check-${activeTab.id}-${param.name}`);
                if (checkbox.checked) {
                    const inputElement = document.getElementById(`param-input-${activeTab.id}-${param.name}`);
                    let value = inputElement.value;
                    
                    // 根據參數類型轉換值
                    if (param.type === 'number' && value !== '') {
                        value = parseFloat(value);
                    } else if (param.name === 'items' && param.type === 'array') {
                        try {
                            value = JSON.parse(value);
                        } catch (e) {
                            console.error('JSON解析錯誤:', e);
                            // 保持原始字符串
                        }
                    }
                    
                    newParams[param.name] = value;
                }
            });
            
            // 將參數對象轉換為格式化的字符串
            state.eventParams[activeTab.id] = JSON.stringify(newParams, null, 2);
            
            // 更新代碼顯示
            updateEventCode();
        }
        
        // 更新生成的代碼
        function updateEventCode() {
            const codeElement = document.getElementById(`event-code-${activeTab.id}`);
            codeElement.textContent = generateCustomCode(eventName, state.eventParams[activeTab.id]);
            adjustCodeHeight(codeElement);
        }
    }
}

// 切換標籤頁
function switchTab(tabId) {
    state.activeTabId = tabId;
    renderTabs();
    renderTabContent();
    
    // 添加延遲以確保 DOM 更新後再調整高度
    setTimeout(() => {
        document.querySelectorAll('.code-display').forEach(element => {
            adjustCodeHeight(element);
        });
    }, 50);
}

// 關閉標籤頁
function closeTab(tabId) {
    // 過濾掉要關閉的標籤頁
    const updatedTabs = state.tabs.filter(tab => tab.id !== tabId);
    
    // 如果關閉的是當前活動標籤頁，則切換到第一個標籤頁
    if (tabId === state.activeTabId) {
        state.activeTabId = updatedTabs[0].id;
    }
    
    // 更新事件參數
    delete state.eventParams[tabId];
    
    state.tabs = updatedTabs;
    renderTabs();
    renderTabContent();
}

// 打開事件選擇器
function openEventSelector() {
    dom.eventSelector.classList.remove('hidden');
    state.selectedEventId = '';
    state.selectedEventCategory = 'general';
    dom.eventCategory.value = 'general';
    dom.customEventName.value = '';
    dom.standardEventsContainer.classList.remove('hidden');
    dom.customEventContainer.classList.add('hidden');
    validateCreateButton();
    populateEventsList();
}

// 關閉事件選擇器
function closeEventSelector() {
    dom.eventSelector.classList.add('hidden');
}

// 處理事件類別變更
function handleEventCategoryChange() {
    const category = dom.eventCategory.value;
    state.selectedEventCategory = category;
    state.selectedEventId = '';
    
    if (category === 'custom') {
        dom.standardEventsContainer.classList.add('hidden');
        dom.customEventContainer.classList.remove('hidden');
    } else {
        dom.standardEventsContainer.classList.remove('hidden');
        dom.customEventContainer.classList.add('hidden');
        populateEventsList();
    }
    
    validateCreateButton();
}

// 填充事件列表
function populateEventsList() {
    const category = state.selectedEventCategory;
    dom.eventsList.innerHTML = '';
    
    if (category !== 'custom') {
        eventData[category].forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = `event-item ${state.selectedEventId === event.id ? 'selected' : ''}`;
            eventItem.innerHTML = `
                <input
                    type="radio"
                    name="event-selection"
                    ${state.selectedEventId === event.id ? 'checked' : ''}
                    class="mr-2"
                />
                <span>${event.name}</span>
            `;
            
            eventItem.addEventListener('click', () => {
                state.selectedEventId = event.id;
                populateEventsList(); // 重新渲染列表以更新選中狀態
                validateCreateButton();
            });
            
            dom.eventsList.appendChild(eventItem);
        });
    }
}

// 驗證創建按鈕狀態
function validateCreateButton() {
    let isValid = false;
    
    if (state.selectedEventCategory === 'custom') {
        isValid = dom.customEventName.value.trim() !== '';
    } else {
        isValid = state.selectedEventId !== '';
    }
    
    if (isValid) {
        dom.createEventBtn.classList.remove('bg-blue-200', 'text-gray-400', 'cursor-not-allowed');
        dom.createEventBtn.classList.add('bg-blue-500', 'hover:bg-blue-600', 'text-white');
        dom.createEventBtn.disabled = false;
    } else {
        dom.createEventBtn.classList.add('bg-blue-200', 'text-gray-400', 'cursor-not-allowed');
        dom.createEventBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600', 'text-white');
        dom.createEventBtn.disabled = true;
    }
}

// 處理創建事件
function handleCreateEvent() {
    let eventId, eventName, eventCategory, params;
    
    if (state.selectedEventCategory === 'custom') {
        eventId = dom.customEventName.value.trim();
        eventName = eventId;
        eventCategory = 'custom';
        params = eventParamsTemplate.custom_event || '{}';
    } else {
        eventId = state.selectedEventId;
        eventCategory = state.selectedEventCategory;
        const selectedEvent = eventData[state.selectedEventCategory].find(e => e.id === eventId);
        eventName = selectedEvent ? selectedEvent.name : eventId;
        params = eventParamsTemplate[eventId] || '{}';
    }
    
    // 創建新標籤頁
    const newTab = {
        id: state.nextTabId,
        title: getShortEventName(eventName),
        type: 'event',
        eventName: eventId,
        eventCategory: eventCategory, // 添加事件類別
        closable: true
    };
    
    // 更新狀態
    state.tabs.push(newTab);
    state.eventParams[state.nextTabId] = params;
    state.activeTabId = state.nextTabId;
    state.nextTabId++;
    
    // 更新UI
    renderTabs();
    renderTabContent();
    closeEventSelector();
}

// 獲取事件的簡短名稱（用於標籤頁顯示）
function getShortEventName(fullName) {
    // 如果名稱包含 " - "，取前半部分作為簡短名稱
    if (fullName.includes(' - ')) {
        return fullName.split(' - ')[0];
    }
    return fullName;
}

// 獲取事件的完整名稱
function getEventFullName(eventId, category) {
    if (category === 'custom') {
        return eventId; // 自定義事件直接返回ID
    }
    
    // 從事件數據中查找事件
    const events = eventData[category] || [];
    const event = events.find(e => e.id === eventId);
    
    return event ? event.name : eventId;
}

// 複製到剪貼簿
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            alert('代碼已複製到剪貼簿！');
        })
        .catch(err => {
            console.error('複製失敗:', err);
            alert('複製失敗，請手動複製。');
        });
}

//下載PPT
function downloadEventsAsPPT() {
    const pptx = new PptxGenJS();
    const missingFields = validateRequiredParams();
    if (missingFields.length > 0) {
        const messages = missingFields.map(e => `「${e.tabTitle}」的參數「${e.paramName}」是必填欄位`).join('\n');
        alert(`請補齊以下必填欄位後再下載PPT：\n\n${messages}`);
        return;
    }
    const projectName = state.projectName?.trim() || '未命名專案';

    // 👉 第 1 頁：基礎代碼
    const baseSlide = pptx.addSlide();
    baseSlide.addText('基礎代碼', {
        x: 0,
        y: 0.25,
        fontSize: 16,
        bold: true,
        color: '333333',
        wrap: true,
        w: 7.5,
        h: 0.25,
        align: 'top'
    });

    const baseCode = generateEventScript(state.serialNumber || 'YOUR_SERIAL_NUMBER');
    baseSlide.addText(baseCode, {
        x: 0.25,
        y: 1,
        fontSize: 10,
        fontFace: 'Courier New',
        color: '444444',
        wrap: true,
        w: 7.5,
        h: 3.5,
        align: 'top'
    });

    // 👉 其餘事件代碼
    state.tabs.forEach(tab => {
        if (tab.type === 'event') {
            const slide = pptx.addSlide();

            const eventTitle = getEventFullName(tab.eventName, tab.eventCategory);
            const generatedCode = generateCustomCode(tab.eventName, state.eventParams[tab.id]);

            slide.addText(`事件名稱：${eventTitle}`, {
                x: 0,
                y: 0.25,
                fontSize: 16,
                bold: true,
                color: '333333',
                wrap: true,
                w: 7.5,
                h: 0.25,
                align: 'top'
            });

            slide.addText(generatedCode, {
                x: 0.25,
                y: 1,
                fontSize: 10,
                fontFace: 'Courier New',
                color: '444444',
                wrap: true,
                w: 7.5,
                h: 1,
                align: 'top'
            });
        }
    });

    pptx.writeFile(`${projectName}_事件.pptx`);
}

// 解析參數字符串為對象
function parseParamsString(paramsString) {
    if (!paramsString) return {};
    
    try {
        return JSON.parse(paramsString);
    } catch (e) {
        console.error('解析參數字符串錯誤:', e);
        return {};
    }
}

//欄位檢驗
function validateRequiredParams() {
    const errors = [];

    // 檢查代碼名稱
    if (!state.projectName || state.projectName.trim() === '') {
        errors.push({
            tabTitle: '專案設定',
            paramName: '代碼名稱'
        });
    }

    // 檢查網站序號
    if (!state.serialNumber || state.serialNumber.trim() === '') {
        errors.push({
            tabTitle: '基礎代碼',
            paramName: '網站序號'
        });
    }

    // 檢查每個事件的必填參數
    state.tabs.forEach(tab => {
        if (tab.type === 'event') {
            const paramsDef = getEventParamsDef(tab.eventName, tab.eventCategory);
            const filledParams = parseParamsString(state.eventParams[tab.id]);

            paramsDef.forEach(param => {
                if (param.required && (filledParams[param.name] === undefined || filledParams[param.name] === '')) {
                    errors.push({
                        tabTitle: tab.title,
                        paramName: param.name
                    });
                }
            });
        }
    });

    return errors;
}


// 根據事件名稱獲取事件類別
function getEventCategoryByEventName(eventName) {
    for (const category in eventData) {
        if (eventData[category].some(event => event.id === eventName)) {
            return category;
        }
    }
    return 'custom';
}

// 獲取事件參數定義
function getEventParamsDef(eventName, category) {
    // 根據事件名稱和類別返回相應的參數定義
    // 這裡需要根據您上傳的參數文檔來定義不同事件的參數
    
    // 通用事件參數定義
    const commonEvents = {
        page_view: [
            { name: 'page_title', type: 'string', required: false, example: '網頁標題', description: '網頁標題' },
            { name: 'page_location', type: 'string', required: false, example: 'https://example.com', description: '網頁 URL' }
        ],
        form_start: [
            { name: 'form_id', type: 'string', required: false, example: 'fidabc123', description: '表單的 ID' },
            { name: 'form_name', type: 'string', required: false, example: '2024活動表單', description: '表單的名稱' }
        ],
        form_submit: [
            { name: 'form_id', type: 'string', required: false, example: 'fidabc123', description: '表單的 ID' },
            { name: 'form_name', type: 'string', required: false, example: '2024活動表單', description: '表單的名稱' },
            { name: 'form_destination', type: 'string', required: false, example: 'https://demo.com/result/', description: '表單的目的地' },
            { name: 'form_submit_text', type: 'string', required: false, example: '送出表單', description: '表單送出按鈕的名稱' },
            { name: 'email', type: 'string', required: false, example: 'user@example.com', description: '表單的 email' },
            { name: 'phone', type: 'string', required: false, example: '0987654321', description: '表單的 phone' }
        ],
        login: [
            { name: 'method', type: 'string', required: false, example: 'Facebook', description: '登入方式' },
            { name: 'email', type: 'string', required: false, example: 'user@example.com', description: '登入的 email' },
            { name: 'phone', type: 'string', required: false, example: '0987654321', description: '登入的 phone' }
        ],
        share: [
            { name: 'method', type: 'string', required: false, example: 'Facebook', description: '分享方式' }
        ]
    };
    
    // 活動事件參數定義
    const activityEvents = {
        view_site: [],
        level_start: [
            { name: 'level_name', type: 'string', required: false, example: '第一題', description: '關卡名稱' }
        ],
        level_end: [
            { name: 'level_name', type: 'string', required: false, example: '第一題', description: '關卡名稱' },
            { name: 'result', type: 'string', required: false, example: '答案B', description: '結果' }
        ],
        post_score: [
            { name: 'score', type: 'number', required: true, example: '99', description: '分數' },
            { name: 'level_name', type: 'string', required: false, example: '接接樂', description: '關卡名稱' },
            { name: 'character', type: 'string', required: false, example: 'Player1', description: '角色名稱' }
        ]
    };
    
    // 內容事件參數定義
    const contentEvents = {
        view_article: [
            { name: 'article_id', type: 'string', required: true, example: 'f76bbc275d394', description: '文章 ID' }
        ],
        scroll_depth: [
            { name: 'scroll_ratio', type: 'number', required: false, example: '0.5', description: '介於 0 ~ 1 的捲動範圍' },
            { name: 'scroll_y', type: 'number', required: false, example: '2000', description: '捲動高度，單位：px' }
        ]
    };
    
    // 電商事件參數定義
    const ecommerceEvents = {
        add_to_cart: [
            { name: 'currency', type: 'string', required: true, example: 'TWD', description: '幣別' },
            { name: 'value', type: 'number', required: true, example: '100', description: '金額' },
            { name: 'items', type: 'array', required: true, example: '商品項目陣列', description: '商品項目陣列' }
        ],
        view_cart: [
            { name: 'currency', type: 'string', required: true, example: 'TWD', description: '幣別' },
            { name: 'value', type: 'number', required: true, example: '100', description: '金額' },
            { name: 'items', type: 'array', required: true, example: '商品項目陣列', description: '商品項目陣列' }
        ],
        add_payment_info: [
            { name: 'currency', type: 'string', required: true, example: 'TWD', description: '幣別' },
            { name: 'value', type: 'number', required: true, example: '100', description: '金額' },
            { name: 'coupon', type: 'string', required: false, example: 'SUMMER_FUN', description: '優惠券' },
            { name: 'payment_type', type: 'string', required: false, example: 'Credit Card', description: '付款方式' },
            { name: 'items', type: 'array', required: true, example: '商品項目陣列', description: '商品項目陣列' }
        ],
        add_shipping_info: [
            { name: 'currency', type: 'string', required: true, example: 'TWD', description: '幣別' },
            { name: 'value', type: 'number', required: true, example: '100', description: '金額' },
            { name: 'coupon', type: 'string', required: false, example: 'SUMMER_FUN', description: '優惠券' },
            { name: 'shipping_tier', type: 'string', required: false, example: 'Ground', description: '運送層級' },
            { name: 'items', type: 'array', required: true, example: '商品項目陣列', description: '商品項目陣列' }
        ],
        purchase: [
            { name: 'currency', type: 'string', required: true, example: 'TWD', description: '幣別' },
            { name: 'value', type: 'number', required: true, example: '100', description: '金額' },
            { name: 'transaction_id', type: 'string', required: true, example: 'T_12345', description: '交易ID' },
            { name: 'coupon', type: 'string', required: false, example: 'SUMMER_FUN', description: '優惠券' },
            { name: 'shipping', type: 'number', required: false, example: '3.39', description: '運費' },
            { name: 'tax', type: 'number', required: false, example: '1.11', description: '稅金' },
            { name: 'items', type: 'array', required: true, example: '商品項目陣列', description: '商品項目陣列' }
        ],
        refund: [
            { name: 'currency', type: 'string', required: true, example: 'TWD', description: '幣別' },
            { name: 'value', type: 'number', required: true, example: '100', description: '金額' },
            { name: 'transaction_id', type: 'string', required: true, example: 'T_12345', description: '交易ID' },
            { name: 'coupon', type: 'string', required: false, example: 'SUMMER_FUN', description: '優惠券' },
            { name: 'shipping', type: 'number', required: false, example: '3.39', description: '運費' },
            { name: 'tax', type: 'number', required: false, example: '1.11', description: '稅金' },
            { name: 'items', type: 'array', required: false, example: '商品項目陣列', description: '商品項目陣列' }
        ],
        remove_from_cart: [
            { name: 'currency', type: 'string', required: true, example: 'TWD', description: '幣別' },
            { name: 'value', type: 'number', required: true, example: '100', description: '金額' },
            { name: 'items', type: 'array', required: true, example: '商品項目陣列', description: '商品項目陣列' }
        ],
        view_item: [
            { name: 'currency', type: 'string', required: true, example: 'TWD', description: '幣別' },
            { name: 'value', type: 'number', required: true, example: '100', description: '金額' },
            { name: 'items', type: 'array', required: true, example: '商品項目陣列', description: '商品項目陣列' }
        ],
        view_item_list: [
            { name: 'item_list_id', type: 'string', required: false, example: 'related_products', description: '清單ID' },
            { name: 'item_list_name', type: 'string', required: false, example: '相關產品', description: '清單名稱' },
            { name: 'items', type: 'array', required: true, example: '商品項目陣列', description: '商品項目陣列' }
        ],
        begin_checkout: [
            { name: 'currency', type: 'string', required: true, example: 'TWD', description: '幣別' },
            { name: 'value', type: 'number', required: true, example: '100', description: '金額' },
            { name: 'items', type: 'array', required: true, example: '商品項目陣列', description: '商品項目陣列' }
        ]
    };
    
    // 自定義事件參數
    const customEventParams = [
        { name: 'event_category', type: 'string', required: true, example: '20240205週年慶', description: '事件類別' },
        { name: 'event_label', type: 'string', required: false, example: '產品xxx', description: '事件標籤' },
        { name: 'value', type: 'number', required: false, example: '100', description: '事件相關數值' }
    ];
    
    // 根據類別和事件名稱返回對應的參數定義
    if (category === 'general' && commonEvents[eventName]) {
        return commonEvents[eventName];
    } else if (category === 'activity' && activityEvents[eventName]) {
        return activityEvents[eventName];
    } else if (category === 'content' && contentEvents[eventName]) {
        return contentEvents[eventName];
    } else if (category === 'ecommerce' && ecommerceEvents[eventName]) {
        return ecommerceEvents[eventName];
    } else if (category === 'custom') {
        return customEventParams;
    }
    
    // 默認返回空數組
    return [];
}

// 確保所有代碼區域在載入後都能正確顯示
function ensureCodeDisplay() {
    console.log('確保所有代碼區域都能正確顯示...');
    
    // 獲取所有代碼顯示區域
    const codeElements = document.querySelectorAll('.code-display');
    
    // 遍歷調整每個區域
    codeElements.forEach(element => {
        console.log(`調整代碼區域: ${element.id}`);
        adjustCodeHeight(element);
    });
}

// 打開儲存至Google Sheets模態框
function openSaveToSheetModal() {
    // 檢查是否已有代碼名稱
    if (!state.projectName || state.projectName.trim() === '') {
        alert('請先輸入代碼名稱');
        // 聚焦到代碼名稱輸入框
        dom.projectName.focus();
        return;
    }
    
    // 顯示當前代碼名稱
    dom.displayProjectName.textContent = state.projectName;
    
    // 顯示模態框
    dom.saveToSheetModal.classList.remove('hidden');
    
    // 隱藏所有狀態消息
    dom.saveStatus.classList.add('hidden');
    dom.saveSuccess.classList.add('hidden');
    dom.saveError.classList.add('hidden');
    dom.saveLoading.classList.add('hidden');
}

// 關閉儲存至Google Sheets模態框
function closeSaveToSheetModal() {
    dom.saveToSheetModal.classList.add('hidden');
}

// 將數據保存到Google Sheets
function saveDataToSheet() {
    // 檢查是否有未填寫的必填欄位
    const missingFields = validateRequiredParams();
    if (missingFields.length > 0) {
      const messages = missingFields.map(e => `「${e.tabTitle}」的參數「${e.paramName}」是必填欄位`).join('\n');
      alert(`請補齊以下必填欄位後再儲存：\n\n${messages}`);
      return;
    }
  
    // 顯示載入中狀態
    dom.saveStatus.classList.remove('hidden');
    dom.saveLoading.classList.remove('hidden');
    dom.saveSuccess.classList.add('hidden');
    dom.saveError.classList.add('hidden');
    
    // 檢查項目名稱
    if (!state.projectName) {
      showSaveError('請先輸入代碼名稱');
      return;
    }
    
    // 使用原始數據格式
    const data = {
      projectName: state.projectName || '事件清單',
      serialNumber: state.serialNumber,
      date: new Date().toISOString(),
      eventConfigs: [],
    };
    
    // 收集所有事件配置
    state.tabs.forEach(tab => {
      if (tab.type === 'event') {
        // 獲取事件類別顯示名稱
        const categoryName = getCategoryDisplayName(tab.eventCategory);
        
        // 獲取事件配置
        const eventConfig = {
          eventId: tab.eventName,
          eventCategory: categoryName,
          params: state.eventParams[tab.id] || '{}'
        };
        
        data.eventConfigs.push(eventConfig);
      }
    });
    
    console.log('正在發送數據到 Google Sheets:', {
      url: state.apiUrl,
      data: data
    });
    
    // 使用 fetch with credentials
    fetch(state.apiUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'append',
        data: data,
        singleSheetMode: true,
        fixedSheetName: '事件清單'
      })
    })
    .then(response => {
      console.log('收到API回應:', response);
      return response.text().then(text => {
        try {
          return text ? JSON.parse(text) : {};
        } catch (e) {
          console.error('解析回應失敗:', e);
          return { success: false, message: `回應解析失敗: ${text}` };
        }
      });
    })
    .then(result => {
      console.log('處理結果:', result);
      if (result.success) {
        showSaveSuccess(`「${state.projectName}」儲存成功`);
      } else {
        showSaveError(result.message || '儲存失敗');
      }
    })
    .catch(error => {
      console.error('保存失敗:', error);
      showSaveError('網路錯誤: ' + error.message);
    });
  }

// 格式化參數摘要
function formatParamsSummary(params) {
    if (!params || Object.keys(params).length === 0) {
        return '';
    }
    
    // 將參數對象轉換為字符串列表
    const paramsList = Object.entries(params).map(([key, value]) => {
        // 對於數組或對象類型的值，進行特殊處理
        if (Array.isArray(value)) {
            return `${key}: [Array]`;
        } else if (typeof value === 'object' && value !== null) {
            return `${key}: {Object}`;
        } else {
            return `${key}: ${value}`;
        }
    });
    
    return paramsList.join(', ');
}

// 顯示保存成功消息
function showSaveSuccess(message = '儲存成功！') {
    dom.saveStatus.classList.remove('hidden');
    dom.saveLoading.classList.add('hidden');
    dom.saveError.classList.add('hidden');
    
    dom.saveSuccess.classList.remove('hidden');
    dom.saveSuccess.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-block mr-1">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        ${message}
    `;
    
    // 3秒後自動關閉模態框
    setTimeout(() => {
        closeSaveToSheetModal();
    }, 3000);
}

// 顯示保存錯誤消息
function showSaveError(message) {
    dom.saveStatus.classList.remove('hidden');
    dom.saveLoading.classList.add('hidden');
    dom.saveSuccess.classList.add('hidden');
    
    dom.saveError.classList.remove('hidden');
    dom.saveError.textContent = message || '儲存失敗';
}

// 當視窗大小改變時重新調整代碼區域高度和標籤顯示
window.addEventListener('resize', () => {
    // 調整代碼區域高度
    const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
    if (!activeTab) return;
    
    // 為所有可見的代碼區域調整高度
    document.querySelectorAll('.code-display').forEach(element => {
        if (element.offsetParent !== null) { // 檢查元素是否可見
            adjustCodeHeight(element);
        }
    });
    
    // 重新渲染標籤頁（當標籤數量較多時）
    if (state.tabs.length > 3) {
        renderTabs();
    }
});

// 初始化應用
document.addEventListener('DOMContentLoaded', function() {
    if (window.env) {
      // 環境變量已加載
      init();
    } else {
      // 等待環境變量加載
      document.addEventListener('envLoaded', init);
      
      // 如果5秒後環境變量還沒加載，使用默認值初始化
      setTimeout(function() {
        if (!window.env) {
          console.warn('未檢測到環境變量，使用默認值初始化應用');
          window.env = {};
          init();
        }
      }, 5000);
    }
  });
