﻿document.addEventListener('DOMContentLoaded', function () {
    var buttonMap = new Map();
    buttonMap.set("FBbutton", "https://www.facebook.com/GodJJLOL");
    buttonMap.set("Youtubebutton", "https://www.youtube.com/channel/UCt--8DKolHNzogSofX35fRQ");
    buttonMap.set("Discordbutton", "https://discord.gg/6JnBwBy");
    buttonMap.set("Musicbutton", "https://www.youtube.com/playlist?list=PLicQ4e8xsEiH3AnRUFkkwJVaHHvLi-ylL");
    buttonMap.set("Music2button", "https://www.youtube.com/playlist?list=PLBGxXkqJe9DSoclWSk6idRDyTYtmWxlcw");
    buttonMap.set("JGamersbutton", "https://www.youtube.com/channel/UCNAmbRgIsM8xKDJR47sLYAw");
    buttonMap.set("VODJJbutton", "https://www.youtube.com/channel/UCZa7O3mT8gmKRUg_6ir1-yw");
    buttonMap.set("Godjjmebutton", "https://godjj.me");
    buttonMap.set("Twitchbutton", "https://www.twitch.tv/godjj");
    buttonMap.forEach((buttonUrl, buttonName) => {
        var button = document.getElementById(buttonName);
        button.setAttribute("data-content", buttonUrl);
        button.addEventListener("click", function () {
            chrome.tabs.create({ "url": this.getAttribute("data-content") });
        });
    });
    // 獲取和設置跑馬燈的內容
    fetchLatestYoutubeVideo();
});

// 獲取 YouTube 最新影片資訊
function fetchLatestYoutubeVideo() {
    const channelId = "UCt--8DKolHNzogSofX35fRQ"; // GodJJ 的 YouTube 實況台 ID
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

    // 顯示加載中訊息
    const newsElement = document.getElementById("news");
    newsElement.innerText = "正在載入最新影片...";

    // 由於瀏覽器的跨域限制，使用 CORS 代理
    const corsProxy = "https://corsproxy.io/?url=";

    fetch(corsProxy + feedUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            // 解析 XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");

            // 檢查是否有解析錯誤
            if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                throw new Error("XML parsing error");
            }

            // 獲取最新的影片條目
            const entries = xmlDoc.getElementsByTagName("entry");

            if (entries.length > 0) {
                const latestEntry = entries[0];
                const title = latestEntry.getElementsByTagName("title")[0].textContent;
                const videoId = latestEntry.getElementsByTagName("yt:videoId")[0].textContent;
                const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

                // 設置跑馬燈內容
                newsElement.innerText = title;
                const newsMarquee = document.getElementById("newsMarquee");
                newsMarquee.setAttribute("behavior", "scroll");

                // 啟用按鈕點擊開啟影片
                let Newsbutton = document.getElementById("Newsbutton");
                // 先移除舊的事件監聽器，避免重複綁定，會導致跑馬燈第一次跑到一半就被重置
                const newButton = Newsbutton.cloneNode(true);
                Newsbutton.parentNode.replaceChild(newButton, Newsbutton);
                // 重新獲取新的按鈕元素
                Newsbutton = document.getElementById("Newsbutton");
                Newsbutton.addEventListener("click", function () {
                    chrome.tabs.create({ "url": videoUrl });
                });
            } else {
                throw new Error("No video entries found");
            }
        })
        .catch(error => {
            console.error("Error fetching YouTube RSS feed:", error);
            document.getElementById("news").innerText = "無法載入最新影片";
        });
}

chrome.storage.sync.get({
    JJMessage: '{"Message":[]}'
}, function (items) {
    var messageArr = JSON.parse(items.JJMessage);
    messageArr.Message.reverse();
    var tbody = document.getElementById("messageTableBody");

    for (var i = 0; i < messageArr.Message.length; i++) {
        var key = Object.keys(messageArr.Message[i])[0]; // 時間
        var value = messageArr.Message[i][key]; // 訊息內容或物件

        // 建立一行的元素
        var tr = document.createElement("tr");

        // 建立編號欄
        var tdIndex = document.createElement("td");
        tdIndex.className = "text-center";

        // 添加編號和複製按鈕
        var indexSpan = document.createElement("span");
        indexSpan.innerText = (i + 1);

        var copyIcon = document.createElement("img");
        copyIcon.src = "/img/copy_icon.png";
        copyIcon.className = "copy-btn copy-icon";
        copyIcon.title = "複製此則訊息";

        // 儲存訊息相關資料用於複製
        copyIcon.dataset.channel = value.channel;
        copyIcon.dataset.time = key;
        copyIcon.dataset.streamer = value.streamer;
        copyIcon.dataset.message = value.message;

        tdIndex.appendChild(indexSpan);
        tdIndex.appendChild(copyIcon);

        // 建立時間欄
        var tdTime = document.createElement("td");
        tdTime.className = "text-center";
        tdTime.innerText = key;

        // 使用區域變數替代全域變數
        const localChannelInfo = value.channel;
        const localStreamerInfo = value.streamer;
        const localMessageContent = value.message;

        // 建立實況台欄
        var tdChannel = document.createElement("td");
        tdChannel.className = "text-center";

        // 將實況台欄位為可點擊的超連結
        var channelLink = document.createElement("a");
        channelLink.innerHTML = "<span class='badge channel-badge'>" + localChannelInfo + "</span>";
        // 保存處理後的頻道名稱用於URL
        const channelId = localChannelInfo.replace("#", ""); // 實況台ID要去掉#
        channelLink.title = "前往 " + channelId + " 實況台"; // 提示訊息
        channelLink.addEventListener("click", function (e) {
            e.preventDefault(); // 防止預設行為
            chrome.tabs.create({ "url": "https://www.twitch.tv/" + channelId });
        });
        tdChannel.appendChild(channelLink);

        // 建立實況台主欄
        var tdStreamer = document.createElement("td");
        tdStreamer.className = "text-center";
        tdStreamer.innerText = localStreamerInfo;

        // 建立訊息欄
        var tdMsg = document.createElement("td");
        tdMsg.className = "text-center message-cell";

        // 統一處理訊息顯示邏輯
        processMessageCell(tdMsg, localMessageContent);

        tr.appendChild(tdIndex);
        tr.appendChild(tdTime);
        tr.appendChild(tdMsg);
        tr.appendChild(tdChannel);
        tr.appendChild(tdStreamer);
        tbody.appendChild(tr);
    }

    //Message彈出
    $("[data-toggle='popover']").popover();

    // 添加複製按鈕的點擊事件
    document.querySelectorAll('.copy-btn').forEach(function (btn) {
        btn.addEventListener('click', copyMessage);
    });
});

/**
 * 處理訊息單元格的顯示邏輯
 * @param {HTMLElement} cell - 訊息單元格元素
 * @param {string} content - 訊息內容
 */
function processMessageCell(cell, content) {
    // 檢查訊息是否包含URL
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const containsUrl = urlRegex.test(content);
    const maxLength = 16; // 字數大於多少才需要做收合
    const needsExpansion = content.length > maxLength;

    // 如果訊息需要展開機制（長訊息或包含URL）
    if (needsExpansion || containsUrl) {
        // 創建縮略訊息元素
        var shortMsg = document.createElement("span");
        shortMsg.className = "short-message";
        shortMsg.innerText = content.substring(0, maxLength) + " ...";

        // 創建完整訊息元素
        var fullMsg = document.createElement("span");
        fullMsg.className = "full-message";

        // 如果包含URL，將URL轉換為可點擊連結
        if (containsUrl) {
            const formattedMessage = content.replace(urlRegex, function (url) {
                return `<a href="${url}" class="message-link">${url}</a>`;
            });
            fullMsg.innerHTML = formattedMessage;
        } else {
            fullMsg.innerText = content;
        }

        cell.appendChild(shortMsg);
        cell.appendChild(fullMsg);

        // 設置 popover 用於滑鼠 hover 顯示
        cell.setAttribute("data-container", "body");
        cell.setAttribute("data-toggle", "popover");
        cell.setAttribute("data-placement", "top");
        cell.setAttribute("data-trigger", "hover");
        cell.setAttribute("data-content", content);

        // 點擊切換顯示完整/縮略訊息
        cell.addEventListener("click", toggleMessageDisplay);

        // 如果包含URL，添加URL點擊事件
        if (containsUrl) {
            cell.addEventListener("click", handleUrlClick);
        }
    } else {
        // 短訊息直接顯示
        cell.innerText = content;
    }
}

/**
 * 切換訊息展開/縮合顯示狀態
 */
function toggleMessageDisplay(e) {
    // 防止文字被選取後觸發點擊事件導致訊息又被折疊
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
        return;
    }

    var shortMsg = this.querySelector(".short-message");
    var fullMsg = this.querySelector(".full-message");

    if (shortMsg && fullMsg) {
        if (fullMsg.style.display === "none") {
            shortMsg.style.display = "none";
            fullMsg.style.display = "inline";
        } else {
            shortMsg.style.display = "inline";
            fullMsg.style.display = "none";
        }
    }

    // 防止事件冒泡
    e.stopPropagation();
}

/**
 * 處理URL點擊事件
 */
function handleUrlClick(e) {
    if (e.target.classList.contains('message-link')) {
        e.preventDefault();
        chrome.tabs.create({ "url": e.target.href });
        e.stopPropagation();
    }
}

/**
 * 複製訊息到剪貼板
 */
function copyMessage(e) {
    e.stopPropagation(); // 防止事件冒泡

    const channel = this.dataset.channel;
    const time = this.dataset.time;
    const streamer = this.dataset.streamer;
    const message = this.dataset.message;

    // 組合訊息格式
    const copyText = `${channel} ${time} ${streamer}: ${message}`;

    // 複製到剪貼簿
    navigator.clipboard.writeText(copyText).then(function () {
        // 顯示複製成功提示
        const copyAlert = document.getElementById('copyAlert');
        copyAlert.style.display = 'block';

        // 2秒後隱藏提示
        setTimeout(function () {
            copyAlert.style.display = 'none';
        }, 2000);
    }, function (err) {
        console.error('無法複製文本: ', err);
    });
}

// 新增全域點擊事件來關閉已展開的訊息
$(document).on("click", function (e) {
    if (!$(e.target).closest(".message-cell").length) {
        $(".short-message").show();
        $(".full-message").hide();
    }
});

// 新增清除訊息功能
// document.getElementById("ClearMessageButton").addEventListener("click", function () {
//     chrome.storage.sync.set({ JJMessage: '{"Message":[]}' }, function () {
//         // 清除完成後重新載入頁面更新 UI
//         location.reload();
//     });
// });
