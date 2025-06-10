// 檢測Twitch播放器錯誤按鈕並自動按下

// 檢查間隔 (毫秒)
const CHECK_INTERVAL = 5000;
let intervalId = null;

function clickPlayerErrorButton() {
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
                    console.log('clicked player error button!, Time: ' + new Date());
                    break;
                }
                if (!currentElement) break; // 防止無限迴圈，到最上層時跳出
            }
        }
    } catch (err) {
        console.error('Error clicking player error button:', err);
    }
}

// 初始化播放器錯誤檢測
function initializePlayerErrorDetection() {
    // 清除之前的定時器
    if (intervalId) {
        clearInterval(intervalId);
    }
    // 定期檢查
    intervalId = setInterval(clickPlayerErrorButton, CHECK_INTERVAL);
    console.log('Player error detection initialized!');
}

initializePlayerErrorDetection();
