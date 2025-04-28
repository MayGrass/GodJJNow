// 自動回家功能 - 當被糾團到其他台時自動返回

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

    chrome.storage.sync.get({
        autoReturnEnabled: false,
        autoReturnMode: 'jjOnly'
    }, function (items) {
        // 使用 prevUrl 作為返回點
        const prevUrl = sessionStorage.getItem('prevUrl');
        const prevChannel = prevUrl.split('/').pop().split('?')[0]; // 取得頻道名稱
        console.log('原台:', prevChannel);
        // 如果沒有啟用自動返回，或是模式為 'jjOnly' 但原台不是 godjj 頻道，則不執行自動返回
        if (!items.autoReturnEnabled || (items.autoReturnMode === 'jjOnly' && !prevChannel.includes('godjj'))) {
            return;
        }

        // 3秒後自動返回
        setTimeout(() => {
            window.location.href = prevUrl;
        }, 3000);
    });
}

setupUrlChangeListener();
