// 自動回家功能 - 當被糾團到其他台時自動返回

// 預設就關閉自動回家功能
let autoReturnDefaultSettings = {
    autoReturnEnabled: false,
    autoReturnMode: null,
};

// 在頁面載入時先取得設定值，防止有時候揪團會出現chrome.storage undefined的錯誤
function initSettings() {
    try {
        chrome.storage.sync.get(autoReturnDefaultSettings, function (items) {
            // 儲存設定到全域變數
            autoReturnDefaultSettings = items;
            console.log('已載入自動回家設定:', autoReturnDefaultSettings);
        });
    } catch (error) {
        // 出錯就不管了，直接用全域變數的預設值
        console.log('初始化設定時出錯:', error);
    }
}

// 監聽 URL 變化
function setupUrlChangeListener() {
    sessionStorage.setItem('prevUrl', location.href);
    let currentUrl = location.href;
    // 當document變化時檢查 URL
    const observer = new MutationObserver(() => {
        if (currentUrl !== location.href) {
            currentUrl = location.href; // 更新當前的 URL，防止重複觸發
            checkAndReturnIfNeeded();
        }
    });
    observer.observe(document, { subtree: true, childList: true });
}

// 檢查是否需要自動返回
function checkAndReturnIfNeeded() {
    // 網址參數有包含 'referrer=raid'，才代表被糾團
    const urlParams = new URLSearchParams(window.location.search);
    const isRaidedPage = urlParams.has('referrer') && urlParams.get('referrer').includes('raid');
    if (!isRaidedPage) return;
    console.log('被糾團到其他台:', location.href);

    try {
        chrome.storage.sync.get(autoReturnDefaultSettings, function (items) {
            processAutoReturn(items.autoReturnEnabled, items.autoReturnMode);
        });
    } catch (error) {
        console.log('獲取設定時出錯:', error);
        // 使用全域變數的預設值
        processAutoReturn(autoReturnDefaultSettings.autoReturnEnabled, autoReturnDefaultSettings.autoReturnMode);
    }
}

function processAutoReturn(enabled, mode) {
    const prevUrl = sessionStorage.getItem('prevUrl');
    if (!prevUrl) {
        console.log('找不到先前的URL，無法返回');
        return;
    }

    const prevChannel = prevUrl.split('/').pop().split('?')[0];
    console.log('原台:', prevChannel);

    // 如果沒有啟用自動返回，或是模式為 'jjOnly' 但原台不是 godjj 頻道，則不執行自動返回
    if (!enabled || (mode === 'jjOnly' && !prevChannel.includes('godjj'))) {
        return;
    }

    // 3秒後自動返回
    setTimeout(() => {
        window.location.href = prevUrl;
    }, 3000);
}

initSettings();
setupUrlChangeListener();
