let currentShortCode = "";

// 監聽 Enter 鍵
document.getElementById("urlInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    shortenUrl();
  }
});

async function shortenUrl() {
  const urlInput = document.getElementById("urlInput");
  const url = urlInput.value.trim();

  if (!url) {
    showError("請輸入一個有效的網址");
    return;
  }

  if (!isValidUrl(url)) {
    showError("請輸入一個有效的 HTTP 或 HTTPS 網址");
    return;
  }

  showLoading(true);
  hideError();

  try {
    const response = await fetch("/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: url }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "縮短網址失敗");
    }

    if (data.success) {
      displayResult(data.data);
      if (data.data.shortCode) {
        currentShortCode = data.data.shortCode;
        await loadStats(data.data.shortCode);
      }
    } else {
      throw new Error(data.message || "縮短網址失敗");
    }
  } catch (error) {
    console.error("Error:", error);
    showError(error.message || "網路錯誤，請稍後再試");
  } finally {
    showLoading(false);
  }
}

function displayResult(data) {
  document.getElementById("originalUrl").textContent = data.originalUrl;

  // 將短網址設為可點擊的連結
  const shortUrlElement = document.getElementById("shortUrl");
  shortUrlElement.textContent = data.shortUrl;
  shortUrlElement.href = data.shortUrl;

  document.getElementById("isNewFlag").textContent = data.isNew
    ? "新建立"
    : "已存在";

  // 載入 QR Code
  const qrImg = document.getElementById("qrCodeImage");
  if (data.qrCodeUrl) {
    qrImg.src = data.qrCodeUrl;
    qrImg.style.display = "block";

    // 確保 QR Code 載入錯誤時顯示提示
    qrImg.onerror = function () {
      console.warn("QR Code 載入失敗");
      this.style.display = "none";
    };
  }

  document.getElementById("resultSection").style.display = "block";
}

async function loadStats(shortCode) {
  try {
    const response = await fetch(`/api/info/${shortCode}`);
    const data = await response.json();

    if (data.success) {
      document.getElementById("clickCount").textContent = data.data.clickCount;
      document.getElementById("createdDate").textContent = new Date(
        data.data.createdAt
      ).toLocaleDateString("zh-TW");
    }
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  const text = element.textContent || element.href;

  navigator.clipboard
    .writeText(text)
    .then(function () {
      // 改變按鈕文字給予回饋
      const copyBtn = element.parentElement.querySelector(".copy-btn");
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "已複製!";
      copyBtn.style.background = "#218838";

      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = "#28a745";
      }, 2000);
    })
    .catch(function (error) {
      console.error("無法複製到剪貼板:", error);
      showError("複製失敗，請手動選取並複製");
    });
}

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

function showError(message) {
  const errorDiv = document.getElementById("error");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}

function hideError() {
  document.getElementById("error").style.display = "none";
}

function showLoading(show) {
  document.getElementById("loading").style.display = show ? "block" : "none";
  document.getElementById("shortenBtn").disabled = show;
}

// 每30秒自動更新統計資料 (如果有當前的短碼)
setInterval(() => {
  if (currentShortCode) {
    loadStats(currentShortCode);
  }
}, 30000);
