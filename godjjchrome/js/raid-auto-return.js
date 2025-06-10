// 自動回家功能 - 當被糾團到其他台時自動返回

// 預設就關閉自動回家功能
let autoReturnDefaultSettings = {
    autoReturnEnabled: false,
    autoReturnMode: null,
};

// 輪詢相關變數
let pollInterval = null;
let autoReturnTimer = null;

// 只在非被揪團頁面初始化 prevUrl
const initialIsRaided = isRaidedPage();
if (!initialIsRaided) {
    sessionStorage.setItem('prevUrl', location.href);
    console.log('紀錄當前URL:', location.href);
}

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
        console.log('自動回家設定載入失敗:', error);
    }
}

// 揪團判斷
function isRaidedPage(searchString = window.location.search) {
    const params = new URLSearchParams(searchString);
    return params.has('referrer') && params.get('referrer').includes('raid');
}

// 檢查是否需要自動返回
function checkAndReturnIfNeeded() {
    if (!isRaidedPage()) {
        stopPolling();
        return;
    }

    console.log('被糾團到其他台:', location.href);

    // 如果是被揪團頁面，啟動輪詢作為備用機制
    if (!pollInterval) {
        startPolling();
    }

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
        stopPolling(); // 出錯就停止輪詢
        return;
    }

    const prevChannel = prevUrl.split('/').pop().split('?')[0];
    console.log('原台:', prevChannel);

    // 如果沒有啟用自動返回，或是模式為 'jjOnly' 但原台不是 godjj 頻道，則不執行自動返回
    if (!enabled || (mode === 'jjOnly' && !prevChannel.includes('godjj'))) {
        return;
    }

    // 清除之前的計時器
    if (autoReturnTimer) {
        clearTimeout(autoReturnTimer);
    }

    // 3秒後自動返回
    autoReturnTimer = setTimeout(() => {
        console.log('執行自動返回到:', prevUrl);
        window.location.href = prevUrl;
    }, 3000);
}

// 開始定時檢查（用於處理頁面非前台時的情況）
function startPolling() {
    if (pollInterval) return; // 避免重複啟動

    console.log('開始定時檢查被揪團狀態');
    pollInterval = setInterval(() => {
        if (isRaidedPage()) {
            console.log('定時檢查發現被揪團，嘗試自動返回');
            checkAndReturnIfNeeded();
        } else {
            // 如果不是被揪團頁面，停止輪詢
            stopPolling();
        }
    }, 2000); // 每2秒檢查一次
}

// 停止定時檢查
function stopPolling() {
    if (pollInterval) {
        console.log('停止定時檢查');
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if ('onHistoryStateUpdated' in msg) {
        sendResponse({ autoReturn: 'ok' });
        // 只在非被揪團頁面更新 prevUrl
        if (!isRaidedPage()) {
            console.log('紀錄當前URL:', location.href);
            sessionStorage.setItem('prevUrl', location.href);
            stopPolling(); // 確保在正常頁面時停止輪詢
        }
        checkAndReturnIfNeeded();
    }
    return true;
});

// 初始檢查
checkAndReturnIfNeeded();
initSettings();
