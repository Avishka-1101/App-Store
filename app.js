/* ════════════════════════════════
   A1101 Store — app.js (Final Reliable Version)
   ════════════════════════════════ */

const CONFIG = {
  apkFile:    'Dora.apk',       
  appName:    'Dora',
  appVersion: '1.0.0',
  appSize:    '~5.6 MB',
};

let totalDownloads = 0;   

// Global Counter API (Across all users)
const API_URL = 'https://api.counterapi.dev/v1/a1101_store_v3/dora_downloads';

document.addEventListener('DOMContentLoaded', () => {
  loadGlobalState();
  initNavbar();
  initHamburger();
  initScrollAnimations();

  // Sync with server every 10 seconds to show others' downloads
  setInterval(syncOnly, 10000); 
});

async function loadGlobalState() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    totalDownloads = Number(data.count) || 0;
    if (isNaN(totalDownloads)) totalDownloads = 0;
  } catch (err) {
    totalDownloads = 0; 
  }
  renderAll(totalDownloads);
}

async function syncOnly() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const newCount = Number(data.count) || 0;

    if (!isNaN(newCount) && newCount > totalDownloads) {
      totalDownloads = newCount;
      renderAll(totalDownloads);
    }
  } catch (err) { }
}

async function incrementCount() {
  try {
    const res = await fetch(`${API_URL}/increment`);
    const data = await res.json();
    const val = Number(data.count);
    if (!isNaN(val)) {
      totalDownloads = val;
      renderAll(totalDownloads);
    }
  } catch (err) { }
}

function renderAll(n) {
  const elements = ['dlCount', 'statDownloads', 'heroCount'];
  elements.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = fmt(n);
  });
}

function handleDownload() {
  const btn = document.getElementById('mainDlBtn');
  if (!btn || btn.disabled) return;

  btn.disabled = true;
  btn.style.opacity = '0.7';

  // 1. Direct Download
  triggerDownload();

  // 2. Increment Global Counter
  incrementCount();

  // 3. Feedback
  showToast('✅ Download started!');

  setTimeout(() => {
    btn.disabled = false;
    btn.style.opacity = '1';
  }, 1500);
}

function triggerDownload() {
  const a = document.createElement('a');
  a.href = CONFIG.apkFile;
  a.download = CONFIG.apkFile;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (t) {
    const s = t.querySelector('span');
    if (s) s.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 4000);
  }
}

function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => nav?.classList.toggle('scrolled', window.scrollY > 50));
}

function initHamburger() {
  const btn = document.getElementById('hamburger');
  const m = document.getElementById('mobileNav');
  btn?.addEventListener('click', () => {
    m?.classList.toggle('open');
    btn.classList.toggle('open');
  });
}

function initScrollAnimations() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = 1;
        e.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.feat-card, .dl-card').forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    obs.observe(el);
  });
}

function fmt(n) {
  const num = Number(n);
  if (isNaN(num)) return "0";
  if (num >= 1000000) return (num/1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num/1000).toFixed(1) + 'K';
  return num.toString();
}
