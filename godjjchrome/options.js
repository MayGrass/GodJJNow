import { DEFAULT_CHANNELS, PROTECTED_CHANNEL } from './js/config.js';

document.getElementById("updateButton").addEventListener("click", function () {
    chrome.tabs.create({ "url": "updates.html" });
});
document.getElementById("githubButton").addEventListener("click", function () {
    chrome.tabs.create({ "url": "https://github.com/MayGrass/JJner" });
});

// 實況台相關函數
function renderChannelList(channels) {
    const channelList = document.getElementById("channelList");
    channelList.innerHTML = "";

    channels.forEach(channel => {
        const channelItem = document.createElement("div");
        channelItem.className = "channel-item";

        const channelName = document.createElement("span");
        channelName.textContent = channel;

        const deleteBtn = document.createElement("span");
        deleteBtn.textContent = "✕";
        deleteBtn.className = "delete-btn";

        // 如果是受保護實況台，設置刪除按鈕為禁用狀態
        if (channel === PROTECTED_CHANNEL) {
            deleteBtn.style.opacity = "0.3";
            deleteBtn.style.cursor = "not-allowed";
        } else {
            deleteBtn.addEventListener("click", () => {
                removeChannel(channel);
            });
        }

        channelItem.appendChild(channelName);
        channelItem.appendChild(deleteBtn);
        channelList.appendChild(channelItem);
    });
}

function addNewChannel() {
    const newChannelInput = document.getElementById("newChannel");
    const channelName = newChannelInput.value.trim();

    if (!channelName) {
        return;
    }

    chrome.storage.sync.get({
        monitoredChannels: DEFAULT_CHANNELS
    }, function (items) {
        if (!items.monitoredChannels.includes(channelName)) {
            const updatedChannels = [...items.monitoredChannels, channelName];
            chrome.storage.sync.set({
                monitoredChannels: updatedChannels
            }, function () {
                renderChannelList(updatedChannels);
                notifyChannelsUpdate(updatedChannels);
            });
        } else {
            const status = document.getElementById("status");
            status.textContent = "此實況台已在監控列表中";
            status.style.color = "red";
        }
        newChannelInput.value = '';
    });
}

function removeChannel(channelName) {
    // 不允許刪除受保護實況台
    if (channelName === PROTECTED_CHANNEL) {
        return;
    }

    chrome.storage.sync.get({
        monitoredChannels: DEFAULT_CHANNELS
    }, function (items) {
        const updatedChannels = items.monitoredChannels.filter(ch => ch !== channelName);

        chrome.storage.sync.set({
            monitoredChannels: updatedChannels
        }, function () {
            renderChannelList(updatedChannels);
            notifyChannelsUpdate(updatedChannels);
        });
    });
}

// 回復預設實況台列表函數
function resetToDefaultChannels() {
    chrome.storage.sync.set({
        monitoredChannels: DEFAULT_CHANNELS
    }, function () {
        renderChannelList(DEFAULT_CHANNELS);
        notifyChannelsUpdate(DEFAULT_CHANNELS);

        // 顯示成功提示
        var status = document.getElementById("status");
        status.textContent = "已回復預設實況台列表";
        setTimeout(function () {
            status.textContent = "";
        }, 1500);
    });
}

function notifyChannelsUpdate(channels) {
    chrome.runtime.sendMessage({
        type: "UPDATE_MONITORED_CHANNELS",
        channels: channels
    });
}

// 自動回家選項相關
function toggleAutoReturnOptions() {
    const enabled = document.getElementById("autoReturnEnabled").checked;
    // 子選項要根據主選項的狀態來啟用或禁用
    document.getElementById("autoReturnModeJJOnly").disabled = !enabled;
    document.getElementById("autoReturnModeAll").disabled = !enabled;
}

//將設置用chrome.storage.sync儲存
function save_options() {
    var getChatNotification = document.getElementById("getChatNotification").checked;
    var autoReturnEnabled = document.getElementById("autoReturnEnabled").checked;
    var autoReturnMode = document.querySelector('input[name="autoReturnMode"]:checked').value;

    chrome.storage.sync.set({
        getChatNotification: getChatNotification,
        autoReturnEnabled: autoReturnEnabled,
        autoReturnMode: autoReturnMode
    }, function () {
        //提供儲存成功的提示
        var status = document.getElementById("status");
        status.textContent = "Options saved.";
        setTimeout(function () {
            status.textContent = "";
        }, 1500);

        // 通知背景腳本更新通知設定
        chrome.runtime.sendMessage({
            type: "UPDATE_NOTIFICATION_SETTING",
            getChatNotification: getChatNotification
        });
    });
}

// 將設定調整為預設值的功能
function restore_options() {
    //利用get設定預設值並，無值即取得預設置，有值則使用之前儲存的值
    chrome.storage.sync.get({
        getChatNotification: true,
        monitoredChannels: DEFAULT_CHANNELS,
        autoReturnEnabled: false,
        autoReturnMode: 'jjOnly'
    }, function (items) {
        document.getElementById("getChatNotification").checked = items.getChatNotification; // 通知
        document.getElementById("autoReturnEnabled").checked = items.autoReturnEnabled; // 自動回家

        // 設定自動回家模式
        if (items.autoReturnMode === 'jjOnly') {
            document.getElementById("autoReturnModeJJOnly").checked = true;
        } else {
            document.getElementById("autoReturnModeAll").checked = true;
        }

        toggleAutoReturnOptions();
        renderChannelList(items.monitoredChannels);
    });
}

document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
document.getElementById("addChannel").addEventListener("click", addNewChannel);
document.getElementById("resetChannels").addEventListener("click", resetToDefaultChannels);
document.getElementById("newChannel").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        addNewChannel();
    }
});
document.getElementById("autoReturnEnabled").addEventListener("change", toggleAutoReturnOptions);