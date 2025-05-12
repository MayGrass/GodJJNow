function clickPointsButton() {
    try {
        // Get all clickable buttons and click button!
        var elems = document.querySelector('.community-points-summary').querySelectorAll('button');
        elems.forEach(function (currentElem, index, arr) {
            if (index != 0) {
                currentElem.click();
                console.log('Clicked points button!, Time: ' + new Date());
            }
        });
    }
    catch (err) { }
}

// Retry 6 times, total try 1 min (6 * 10s(setTimeout))
const RETRY_NUM = 6;

function initialize(retry) {
    // Initialized check
    function check() {
        var promise = new Promise(function (resolve, reject) {
            setTimeout(function () {
                console.log('Initialized!');
                Arrive.unbindAllArrive();

                if (document.body.contains(document.getElementsByClassName('community-points-summary')[0])) {
                    console.log('In channel page');
                    // Pre-click
                    clickPointsButton();
                    // Register button arrive
                    document.getElementsByClassName('community-points-summary').arrive('button', clickPointsButton);
                    // In channel page, no need to retry
                    retry = RETRY_NUM
                    resolve(retry);
                }
                else {
                    retry += 1
                    resolve(retry);
                }
            }, 10000);
        });
        return promise;
    }

    check().then(function (retry_message) {
        if (retry_message < RETRY_NUM) {
            // Retry initialize, because sometimes the page load will be delayed
            console.log('retry ', retry_message);
            initialize(retry_message)
        }
    });
}

// Message from background.js
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if ('onHistoryStateUpdated' in msg) {
        initialize(0)
        sendResponse({ onHistoryStateUpdated: 'ok' })
        console.log("onHistoryStateUpdated");
    }
});

// 檢測Twitch播放器錯誤按鈕並自動按下
function checkPlayerError() {
    try {
        // 直接鎖定重整符號的向量圖
        const targetPath = document.querySelector('path[d="M4 10a6 6 0 0 1 10.472-4H13v2h5V3h-2v1.708A8 8 0 0 0 2 10h2zm3 4H5.528A6 6 0 0 0 16 10h2a8 8 0 0 1-14 5.292V17H2v-5h5v2z"]');

        // 往父元素持續尋找按鈕並點擊
        if (targetPath) {
            let currentElement = targetPath;
            while (currentElement && currentElement.tagName.toLowerCase() !== 'button') {
                currentElement = currentElement.parentElement;
                if (currentElement.tagName.toLowerCase() === 'button') {
                    currentElement.click();
                    break;
                }
                if (!currentElement) break; // 防止無限循環，到最上層時跳出
            }
        }
    } catch (err) {
        console.error('檢查播放器錯誤時發生錯誤:', err);
    }
}

// Pre-initialize
initialize(0)
// 啟動播放器錯誤定時檢測 (每10秒一次)
setInterval(checkPlayerError, 10000);
console.log('已啟動播放器錯誤檢測機制');
