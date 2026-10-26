# SnowShow 兩個版本

## 公開精簡版

本存放庫根目錄為 GitHub Pages 的發布來源。首頁、雪場地圖與影片頁維持現有設計，只收錄已決定公開的內容。

發布網址：https://samyirong.github.io/SnowShow/

## 本機豐富相簿版

本機版獨立放在 Mac「圖片 / SnowShow / LocalWeb」，不在這個 Git 存放庫裡。

雙擊 LocalWeb 裡的 index.html 即可離線瀏覽，不需要啟動網站伺服器。

本機版直接讀取同層的原始相簿，提供所有照片、精選收藏、日期篩選、搜尋、照片放大、自動播放與原始影片播放。收藏只存在使用者的瀏覽器中，不會同步到公開網站。

原始相簿使用 YYYYMM_旅行名稱 命名。新增照片後，雙擊 LocalWeb 裡的「更新相簿.command」重建索引；首次更新需要連線下載 Pillow。請維持 LocalWeb 與原始相簿的相對位置。

## 發布界線

- 私人原始照片、影片、縮圖、相簿索引和收藏不會自動同步到本存放庫。
- .gitignore 排除 LocalWeb、local-web、private-media 與 YYYYMM_旅行名稱 形式的資料夾，以降低誤加入的機會。
- .gitignore 不會保護已追蹤的檔案，也無法阻止強制加入或其他名稱的私人資料。發布前仍應檢查 git diff --cached --stat。
- 本機版不是加密相簿；它的保護範圍是不上傳，電腦檔案存取權仍由作業系統管理。
