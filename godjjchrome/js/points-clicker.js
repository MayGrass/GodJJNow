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

function initializePointsClicker(retry) {
    // Initialized check
    function check() {
        var promise = new Promise(function (resolve, reject) {
            console.log('Checking channel page...');
            setTimeout(function () {
                Arrive.unbindAllArrive();
                if (document.body.contains(document.getElementsByClassName('community-points-summary')[0])) {
                    console.log('In channel page');
                    // Register button arrive
                    document.getElementsByClassName('community-points-summary').arrive('button', { existing: true }, clickPointsButton);
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
            initializePointsClicker(retry_message)
        }
    });
}

// Message from background.js
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if ('onHistoryStateUpdated' in msg) {
        initializePointsClicker(0)
        sendResponse({ pointsClicker: 'ok' });
    }
    return true;
});

// Pre-initialize
initializePointsClicker(0)