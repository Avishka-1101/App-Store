/* ════════════════════════════════
   A1101 Store — app.js (Final Global Version)
   ════════════════════════════════ */

const CONFIG = {
  apkFile: 'Dora.apk', // ඔබේ APK එක මේ නමින් folder එකේ තියෙන්න ඕනේ
};

// Global Counter API (ලෝකය පුරා සිටින සැමට එකම අගයක් පෙන්වයි)
const API_URL = 'https://api.counterapi.dev/v1/a1101_store_final/dora_downloads';

let totalDownloads = 0;

document.addEventListener('DOMContentLoaded', () => {
  // මුලින්ම පවතින අගය ලබාගැනීම
  loadCount();
  
  // තත්පර 10කට වරක් අලුත්ම දත්ත පරීක්ෂා කිරීම (Auto Sync)
  setInterval(loadCount, 10000);
});

async function loadCount() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    totalDownloads = Number(data.count) || 0;
    updateUI();
  } catch (err) {
    console.error("Connection error");
  }
}

function updateUI() {
  const el = document.getElementById('heroCount');
  if (el) el.textContent = totalDownloads.toLocaleString();
}

async function handleDownload() {
  const btn = document.getElementById('mainDlBtn');
  if (btn.disabled) return;

  btn.disabled = true;
  btn.style.opacity = '0.6';

  // 1. සැබෑ APK එක Download කිරීම ආරම්භය
  const a = document.createElement('a');
  a.href = CONFIG.apkFile;
  a.download = CONFIG.apkFile;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // 2. Global Counter එක 1 කින් වැඩි කිරීම (Server update)
  try {
    const res = await fetch(`${API_URL}/increment`);
    const data = await res.json();
    totalDownloads = data.count;
    updateUI();
  } catch (err) {}

  // 3. දැනුම්දීමක් පෙන්වීම
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);

  setTimeout(() => {
    btn.disabled = false;
    btn.style.opacity = '1';
  }, 2000);
}
