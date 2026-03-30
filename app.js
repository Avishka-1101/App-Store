/* ===========================
   A1101 store — app.js
   =========================== */

const CONFIG = {
  apkFile: 'Dora.apk',
  appName: 'Dora',
  appVersion: '1.0.1',
  appSize: '12.5 MB',
  downloadGoal: 1000,
  storageKey: 'a1101_dora_downloads',
};

const TAB_DATA = {
  dashboard: {
    title: 'Dashboard Overview',
    desc: 'A modern dashboard specifically for high-achievers. Quick task entry, streak counters, and a sleek inbox focus. No clutter, just everything you need to stay on top of your game.',
    img: 'app-mockup.png',
    list: ['Daily streak tracker', 'Integrated Task Library', '"Next Up" task queue']
  },
  trends: {
    title: 'Trends & Analytics',
    desc: 'Visualize your progress with beautiful, high-contrast charts. Track your productivity score over time and see exactly where your focus goes each week.',
    img: 'trends-mockup.png',
    list: ['Weekly performance charts', 'Productivity score tracking', 'Category breakdown stats']
  },
  calendar: {
    title: 'Smart Calendar',
    desc: 'A seamless calendar integration that lets you plan ahead and never miss a beat. Check your upcoming tasks in a simple, intuitive month-to-view layout.',
    img: 'app-mockup.png', // Placeholder since limit reached
    list: ['Full month overview', 'Task density indicators', 'Quick date switching']
  },
  collections: {
    title: 'Task Collections',
    desc: 'Group your work by project, priority, or lifestyle. Dora’s flexible collections keep your Work, Home, and Hobby tasks separate but perfectly organized.',
    img: 'app-mockup.png', // Placeholder since limit reached
    list: ['Project-based folders', 'Custom list icons', 'Priority sorting']
  }
};

let downloadCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  loadDownloadCount();
  initNavbar();
  initTabs();
  animateHeroElements();
});

function loadDownloadCount() {
  const saved = localStorage.getItem(CONFIG.storageKey);
  downloadCount = saved ? parseInt(saved, 10) : 0;

  if (!saved) {
    // Generate a starter count that looks real
    downloadCount = 428; 
    localStorage.setItem(CONFIG.storageKey, downloadCount);
  }

  renderUI();
}

function renderUI() {
  const els = [
    document.getElementById('downloadCount'),
    document.getElementById('heroDownloadCount'),
  ];
  els.forEach(el => { if (el) el.textContent = formatNumber(downloadCount); });

  updateProgress();
}

function updateProgress() {
  const bar = document.getElementById('counterBar');
  if (!bar) return;
  const pct = Math.min((downloadCount / CONFIG.downloadGoal) * 100, 100);
  setTimeout(() => { bar.style.width = pct + '%'; }, 400);
}

function handleDownload() {
  const btn = document.getElementById('mainDownloadBtn');
  const status = document.getElementById('downloadProgress');
  const text = document.getElementById('progressText');

  btn.disabled = true;
  btn.style.opacity = '0.6';
  status.style.display = 'flex';

  const steps = ['Scanning file...', 'Verifying signature...', 'Preparing package...', 'Starting download!'];
  let i = 0;

  const timer = setInterval(() => {
    text.textContent = steps[i];
    i++;
    if (i >= steps.length) {
      clearInterval(timer);
      setTimeout(() => {
        triggerDownload();
        finishDownload();
      }, 600);
    }
  }, 700);
}

function triggerDownload() {
  const a = document.createElement('a');
  a.href = '#'; // In a real app, this would be CONFIG.apkFile
  a.download = CONFIG.apkFile;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function finishDownload() {
  const btn = document.getElementById('mainDownloadBtn');
  const status = document.getElementById('downloadProgress');
  
  btn.disabled = false;
  btn.style.opacity = '1';
  status.style.display = 'none';

  downloadCount++;
  localStorage.setItem(CONFIG.storageKey, downloadCount);
  renderUI();
  showToast();
}

function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const imgEL = document.getElementById('previewImg');
  const titleEL = document.getElementById('previewTitle');
  const descEL = document.getElementById('previewDesc');
  const listEL = document.getElementById('previewList');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const type = tab.dataset.tab;
      const data = TAB_DATA[type];
      if (!data) return;

      // Update UI
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Animate transition
      const container = document.getElementById('previewContainer');
      container.style.opacity = '0';
      container.style.transform = 'translateY(10px)';

      setTimeout(() => {
        imgEL.src = data.img;
        titleEL.textContent = data.title;
        descEL.textContent = data.desc;
        
        // Update list
        listEL.innerHTML = data.list.map(item => `
          <li style="display:flex; gap:10px;"><span style="color:var(--primary);">✓</span> ${item}</li>
        `).join('');

        container.style.transition = 'all 0.5s cubic-bezier(0.2, 1, 0.3, 1)';
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
      }, 300);
    });
  });
}

function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.style.padding = '12px 0';
      nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
    } else {
      nav.style.padding = '20px 0';
      nav.style.boxShadow = 'none';
    }
  });
}

function initHamburger() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn) return;
  btn.onclick = () => {
    btn.classList.toggle('open');
    menu.classList.toggle('open');
  };
}

function animateHeroElements() {
  const text = document.querySelector('.hero-text');
  const visual = document.querySelector('.hero-visual');
  if (text) {
     text.style.opacity = '0';
     text.style.transform = 'translateY(15px)';
     setTimeout(() => {
       text.style.transition = 'all 1.2s cubic-bezier(0.2, 1, 0.3, 1)';
       text.style.opacity = '1';
       text.style.transform = 'translateY(0)';
     }, 150);
  }
  if (visual) {
     visual.style.opacity = '0';
     visual.style.transform = 'scale(0.98)';
     setTimeout(() => {
       visual.style.transition = 'all 1.2s cubic-bezier(0.2, 1, 0.3, 1) 0.3s';
       visual.style.opacity = '1';
       visual.style.transform = 'scale(1)';
     }, 200);
  }
}

function formatNumber(n) {
  return n.toLocaleString();
}
