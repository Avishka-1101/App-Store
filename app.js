/* ════════════════════════════════
   A1101 Store — app.js
   App: Dora Task Manager
   ════════════════════════════════ */

// ── CONFIG ──────────────────────────────────────────
const CONFIG = {
  apkFile:        'Dora.apk',       // ← Put your APK file here with this name
  appName:        'Dora',
  appVersion:     '1.0.0',
  appSize:        '~5.6 MB',
  storageKey:     'a1101_dora_real_count',  // ← NEW key = wipes old fake data
  goalKey:        'a1101_dora_real_goal',   // ← NEW key
  dataVersion:    'v2',                     // bump this to reset all data
  goalStep:       100,                      // goal grows by 100 each time
};

// ── STATE ──────────────────────────────────────────
let totalDownloads = 0;   // always starts fresh from 0 if never downloaded
let currentGoal    = 100; // first goal is 100

// ── BOOT ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initNavbar();
  initHamburger();
  initScrollAnimations();
  animateHeroCount();
});

// ══════════════════════════════════
//  STATE MANAGEMENT (localStorage)
//  - Count = 0 on first ever visit
//  - Only increases on real download clicks
//  - Goal auto-advances when reached
// ══════════════════════════════════

function loadState() {
  // ── Version guard: wipe any data from older versions ──
  const storedVersion = localStorage.getItem('a1101_data_version');
  if (storedVersion !== CONFIG.dataVersion) {
    // Clear ALL old keys so no fake/seeded numbers survive
    localStorage.removeItem('a1101_dora_downloads');   // old key v1
    localStorage.removeItem('a1101_dora_goal');        // old key v1
    localStorage.removeItem(CONFIG.storageKey);
    localStorage.removeItem(CONFIG.goalKey);
    localStorage.setItem('a1101_data_version', CONFIG.dataVersion);
  }

  // Load real download count — 0 if nobody has ever downloaded
  const savedCount = localStorage.getItem(CONFIG.storageKey);
  totalDownloads = savedCount !== null ? parseInt(savedCount, 10) : 0;

  // Load current goal — starts at 100
  const savedGoal = localStorage.getItem(CONFIG.goalKey);
  currentGoal = savedGoal !== null ? parseInt(savedGoal, 10) : CONFIG.goalStep;

  // Safety: goal must always be strictly above the count
  while (totalDownloads >= currentGoal) {
    currentGoal += CONFIG.goalStep;
  }
  saveGoal();

  renderAllCounters(totalDownloads);
  updateBar(totalDownloads);
  updateGoalText(totalDownloads);
}

function saveGoal() {
  localStorage.setItem(CONFIG.goalKey, currentGoal);
}

// Called ONLY after a real download button click
function incrementDownload() {
  totalDownloads += 1;
  localStorage.setItem(CONFIG.storageKey, totalDownloads);

  // Animate all counters
  animateCounterTo('dlCount',       totalDownloads);
  animateCounterTo('statDownloads', totalDownloads);
  animateCounterTo('heroCount',     totalDownloads);

  // Check if goal was just reached → advance goal
  if (totalDownloads >= currentGoal) {
    celebrateGoal(); // flash animation
    currentGoal += CONFIG.goalStep;
    saveGoal();
  }

  updateBar(totalDownloads);
  updateGoalText(totalDownloads);
}

// ── RENDER COUNTERS ─────────────────────────────────

function renderAllCounters(n) {
  setCounterText('dlCount',       n);
  setCounterText('statDownloads', n);
  setCounterText('heroCount',     n);
}

function setCounterText(id, n) {
  const el = document.getElementById(id);
  if (el) el.textContent = fmt(n);
}

// Animated count-up on page load (hero counter)
function animateHeroCount() {
  const el = document.getElementById('heroCount');
  if (!el) return;
  if (totalDownloads === 0) { el.textContent = '0'; return; }
  countUp(el, 0, totalDownloads, 1600);
}

// Generic count-up animation
function countUp(el, from, to, duration) {
  if (to === 0) { el.textContent = '0'; return; }
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = fmt(Math.round(from + (to - from) * easeOut(p)));
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Animate a single counter element to the new value
function animateCounterTo(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  countUp(el, target - 1, target, 700);
}

// ── PROGRESS BAR ────────────────────────────────────

function updateBar(n) {
  const bar = document.getElementById('dlBar');
  if (!bar) return;
  const pct = Math.min((n / currentGoal) * 100, 100);
  // Slight delay so the bar animates after page render
  setTimeout(() => { bar.style.width = pct.toFixed(1) + '%'; }, 350);

  const pctEl = document.getElementById('dlPct');
  if (pctEl) pctEl.textContent = Math.floor(pct) + '% of current goal';
}

// ── GOAL TEXT ────────────────────────────────────────

function updateGoalText(n) {
  const el = document.getElementById('dlGoal');
  if (!el) return;
  const left = currentGoal - n;
  if (left <= 0) {
    el.textContent = `🏆 Goal ${fmt(currentGoal)} reached!`;
  } else {
    el.textContent = `Goal: ${fmt(currentGoal)} · ${left} more to go`;
  }
}

// ── GOAL CELEBRATION ────────────────────────────────

function celebrateGoal() {
  // Flash the counter box to celebrate
  const box = document.querySelector('.dl-counter-wrap');
  if (!box) return;
  box.animate(
    [
      { boxShadow: '0 0 0 0 rgba(245,197,24,0)' },
      { boxShadow: '0 0 0 12px rgba(245,197,24,0.4)' },
      { boxShadow: '0 0 0 0 rgba(245,197,24,0)' },
    ],
    { duration: 900, easing: 'ease-out' }
  );

  // Show a special goal toast
  showCustomToast(`🏆 Goal reached! New goal: ${fmt(currentGoal + CONFIG.goalStep)} downloads!`);
}

// ══════════════════════════════════
//  DOWNLOAD HANDLER
//  Only triggered by the real button
// ══════════════════════════════════

function handleDownload() {
  const btn      = document.getElementById('mainDlBtn');
  const progWrap = document.getElementById('dlProgress');
  const fill     = document.getElementById('dlpFill');
  const text     = document.getElementById('dlpText');

  if (btn.disabled) return;

  // Lock button during progress
  btn.disabled = true;
  btn.style.opacity   = '0.75';
  btn.style.transform = 'scale(0.98)';

  // Show progress bar
  progWrap.style.display = 'block';
  progWrap.animate(
    [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'translateY(0)' }],
    { duration: 280, fill: 'forwards' }
  );

  const steps = [
    { w: 10,  msg: '🔍 Verifying file integrity…'   },
    { w: 30,  msg: '📦 Packaging APK…'              },
    { w: 55,  msg: '🔒 Running security scan…'      },
    { w: 78,  msg: '⚡ Optimising for your device…' },
    { w: 94,  msg: '✅ Almost ready…'              },
    { w: 100, msg: '🚀 Starting download!'           },
  ];

  let i = 0;
  const tick = setInterval(() => {
    if (i >= steps.length) {
      clearInterval(tick);

      setTimeout(() => {
        // 1. Trigger the real APK file download
        triggerApkDownload();

        // 2. Count only after the APK download is initiated
        incrementDownload();

        // 3. Show toast
        showToast();

        // 4. Reset UI
        btn.disabled        = false;
        btn.style.opacity   = '1';
        btn.style.transform = '';
        progWrap.style.display = 'none';
        fill.style.width    = '0%';
      }, 500);

      return;
    }

    fill.style.width = steps[i].w + '%';
    text.textContent = steps[i].msg;
    i++;
  }, 520);
}

// Trigger browser file download
function triggerApkDownload() {
  const a    = document.createElement('a');
  a.href     = CONFIG.apkFile;
  a.download = CONFIG.apkFile;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ══════════════════════════════════
//  TOAST NOTIFICATIONS
// ══════════════════════════════════

function showToast() {
  showCustomToast('✅ Download started! Check your Downloads folder.');
}

function showCustomToast(message) {
  const t = document.getElementById('toast');
  if (!t) return;
  // Update message (keep the checkmark icon, just change text span)
  const span = t.querySelector('span');
  if (span) span.textContent = message;
  t.classList.add('show');
  clearTimeout(t._hideTimer);
  t._hideTimer = setTimeout(() => t.classList.remove('show'), 5000);
}

// ══════════════════════════════════
//  NAVBAR — frosted glass on scroll
// ══════════════════════════════════

function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ══════════════════════════════════
//  HAMBURGER MENU (mobile)
// ══════════════════════════════════

function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileNav');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  });
}

function closeMobile() {
  document.getElementById('hamburger')?.classList.remove('open');
  document.getElementById('mobileNav')?.classList.remove('open');
}

// ══════════════════════════════════
//  SCREENSHOT TABS
// ══════════════════════════════════

function setTab(index) {
  document.querySelectorAll('.ss-tab').forEach((b, i) =>
    b.classList.toggle('active', i === index)
  );
  document.querySelectorAll('.ss-panel').forEach((p, i) => {
    if (i === index) {
      p.style.display = 'grid';
      p.animate(
        [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 320, easing: 'ease', fill: 'forwards' }
      );
      p.classList.add('active');
    } else {
      p.classList.remove('active');
      p.style.display = 'none';
    }
  });
}

// ══════════════════════════════════
//  SCROLL REVEAL ANIMATIONS
// ══════════════════════════════════

function initScrollAnimations() {
  // Staggered feature cards
  const cards = document.querySelectorAll('.feat-card');
  const cardObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = parseInt(entry.target.dataset.delay || 0);
      setTimeout(() => {
        entry.target.style.transition =
          `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`;
        entry.target.classList.add('visible');
      }, delay);
      cardObs.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  cards.forEach((c, i) => { c.dataset.delay = i * 80; cardObs.observe(c); });

  // Section fade-up
  const secObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.animate(
        [{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 580, easing: 'cubic-bezier(0.4,0,0.2,1)', fill: 'forwards' }
      );
      secObs.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.stats-bar, .dl-card, .ss-phone-wrap, .ss-info')
    .forEach(s => secObs.observe(s));

  // Hero text stagger
  const heroEls = document.querySelectorAll(
    '.store-chip, .hero-title, .hero-desc, .hero-badges, .hero-btns, .hero-counter'
  );
  heroEls.forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(18px)';
    setTimeout(() => {
      el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
      el.style.opacity    = '1';
      el.style.transform  = 'translateY(0)';
    }, 120 + i * 90);
  });
}

// ══════════════════════════════════
//  UTILITIES
// ══════════════════════════════════

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

function easeOut(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
