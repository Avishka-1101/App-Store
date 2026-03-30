/* ════════════════════════════════
   A1101 Store — app.js (v2 - Super Safe)
   ════════════════════════════════ */

const CONFIG = {
  apkFile:    'Dora.apk',       
  appName:    'Dora',
  appVersion: '1.0.0',
  appSize:    '~5.6 MB',
  goalStep:   100,                      
};

let totalDownloads = 0;   
let currentGoal    = 100; 

// Using a unique namespace for your app
const API_URL = 'https://api.counterapi.dev/v1/a1101_store_v2/dora_downloads';

document.addEventListener('DOMContentLoaded', () => {
  loadGlobalState();
  initNavbar();
  initHamburger();
  initScrollAnimations();

  // Sync every 10 seconds
  setInterval(syncDownloadsOnly, 10000); 
});

async function loadGlobalState() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("API Offline");
    const data = await res.json();
    
    // Safety check to avoid NaN
    totalDownloads = Number(data.count) || 0;
    if (isNaN(totalDownloads)) totalDownloads = 0;
  } catch (err) {
    console.warn("Global counter fallback to 0");
    totalDownloads = 0; 
  }

  // Calculate Goal safely
  currentGoal = Math.max(100, Math.ceil((totalDownloads + 1) / CONFIG.goalStep) * CONFIG.goalStep);
  if (isNaN(currentGoal)) currentGoal = 100;

  renderAllCounters(totalDownloads);
  updateBar(totalDownloads);
  updateGoalText(totalDownloads);
  animateHeroCount();
}

async function syncDownloadsOnly() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) return;
    const data = await res.json();
    const newCount = Number(data.count) || 0;

    if (!isNaN(newCount) && newCount > totalDownloads) {
      totalDownloads = newCount;
      renderAllCounters(totalDownloads);
      updateBar(totalDownloads);
      updateGoalText(totalDownloads);
    }
  } catch (err) { }
}

async function incrementDownload() {
  try {
    const res = await fetch(`${API_URL}/increment`);
    if (!res.ok) throw new Error("API Error");
    const data = await res.json();
    
    const newCount = Number(data.count) || 0;
    if (isNaN(newCount)) return;

    totalDownloads = newCount;
    renderAllCounters(totalDownloads);

    if (totalDownloads >= currentGoal) {
      celebrateGoal();
      currentGoal += CONFIG.goalStep;
    }

    updateBar(totalDownloads);
    updateGoalText(totalDownloads);
    showToast();
  } catch (err) {
    console.error("Increment Fail:", err);
    // Silent fail – user still gets the file
  }
}

function renderAllCounters(n) {
  const num = isNaN(n) ? 0 : n;
  setCounterText('dlCount',       num);
  setCounterText('statDownloads', num);
  setCounterText('heroCount',     num);
}

function setCounterText(id, n) {
  const el = document.getElementById(id);
  if (el) el.textContent = fmt(n);
}

function animateHeroCount() {
  const el = document.getElementById('heroCount');
  if (!el || totalDownloads <= 0) return;
  countUp(el, 0, totalDownloads, 1600);
}

function countUp(el, from, to, duration) {
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = fmt(Math.round(from + (to - from) * easeOut(p)));
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function updateBar(n) {
  const bar = document.getElementById('dlBar');
  if (!bar) return;
  const pct = Math.min((n / (currentGoal || 100)) * 100, 100);
  setTimeout(() => { bar.style.width = pct.toFixed(1) + '%'; }, 350);

  const pctEl = document.getElementById('dlPct');
  if (pctEl) pctEl.textContent = Math.floor(pct) + '% of current goal';
}

function updateGoalText(n) {
  const el = document.getElementById('dlGoal');
  if (!el) return;
  const left = Math.max(0, currentGoal - n);
  if (left <= 0) {
    el.textContent = `🏆 Goal reached!`;
  } else {
    el.textContent = `Goal: ${fmt(currentGoal)} · ${fmt(left)} more to go`;
  }
}

function celebrateGoal() {
  const box = document.querySelector('.dl-counter-wrap');
  if (box) {
    box.animate([
      { boxShadow: '0 0 0 0 rgba(245,197,24,0)' },
      { boxShadow: '0 0 0 12px rgba(245,197,24,0.4)' },
      { boxShadow: '0 0 0 0 rgba(245,197,24,0)' }
    ], { duration: 900 });
  }
  showCustomToast(`🏆 New goal: ${fmt(currentGoal + CONFIG.goalStep)}!`);
}

function handleDownload() {
  const btn = document.getElementById('mainDlBtn');
  const progWrap = document.getElementById('dlProgress');
  const fill = document.getElementById('dlpFill');

  if (btn.disabled) return;
  btn.disabled = true;
  progWrap.style.display = 'block';

  let w = 0;
  const tick = setInterval(() => {
    w += 10;
    fill.style.width = w + '%';
    if (w >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        triggerApkDownload();
        incrementDownload(); // Call increment here
        btn.disabled = false;
        progWrap.style.display = 'none';
        fill.style.width = '0%';
      }, 400);
    }
  }, 150);
}

function triggerApkDownload() {
  const a = document.createElement('a');
  a.href = CONFIG.apkFile;
  a.download = CONFIG.apkFile;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function showToast() {
  showCustomToast('✅ Download started!');
}

function showCustomToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  const s = t.querySelector('span');
  if (s) s.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 5000);
}

function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => nav?.classList.toggle('scrolled', window.scrollY > 50));
}

function initHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('mobileNav');
  btn?.addEventListener('click', () => {
    nav?.classList.toggle('open');
    btn.classList.toggle('open');
  });
}

function closeMobile() {
  document.getElementById('mobileNav')?.classList.remove('open');
  document.getElementById('hamburger')?.classList.remove('open');
}

function setTab(idx) {
  document.querySelectorAll('.ss-tab').forEach((b, i) => b.classList.toggle('active', i === idx));
  document.querySelectorAll('.ss-panel').forEach((p, i) => p.style.display = i === idx ? 'grid' : 'none');
}

function initScrollAnimations() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.feat-card').forEach(c => obs.observe(c));
}

function fmt(n) {
  const num = Number(n);
  if (isNaN(num)) return "0";
  if (num >= 1000000) return (num/1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num/1000).toFixed(1) + 'K';
  return num.toString();
}

function easeOut(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
