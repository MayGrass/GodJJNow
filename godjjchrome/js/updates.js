$(document).ready(function () {
    // 從JSON檔案載入更新資料
    $.getJSON('data/updates.json', function (updates) {
        renderUpdates(updates);
    }).fail(function () {
        console.error('無法載入更新資料');
    });

    // 渲染更新記錄到頁面
    function renderUpdates(updates) {
        const container = $('#updates-container');

        updates.forEach(function (update, index) {
            let updateHtml = `
                <h4><span class="fui-checkbox-${update.checked ? 'checked' : 'unchecked'}"></span> ${update.version}</h4>
            `;

            // 處理更新內容
            update.changes.forEach(function (change) {
                updateHtml += `<p><strong>${change}</strong></p>`;
            });

            // 處理可能的備註
            if (update.notes && update.notes.length > 0) {
                updateHtml += `<div class="update-notes">`;
                updateHtml += `<p class="note-header"><i class="fui-chat"></i> 開發者碎碎念</p>`;
                update.notes.forEach(function (note) {
                    updateHtml += `<p class="note-content">${note}</p>`;
                });
                updateHtml += `</div>`;
            }

            // 如果不是最後一個項目，添加分隔線
            if (index < updates.length - 1) {
                updateHtml += '<hr>';
            }

            container.append(updateHtml);
        });
    }
});
