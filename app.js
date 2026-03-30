/* ════════════════════════════════
   A1101 Store — app.js (Minimal)
   ════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
});

function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

function setTab(index) {
  document.querySelectorAll('.ss-tab').forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });
  
  const display = document.getElementById('ssDisplay');
  display.style.opacity = '0';
  
  setTimeout(() => {
    display.innerHTML = `<div class="ss-mock">Previewing View ${index + 1}</div>`;
    display.style.opacity = '1';
  }, 200);
}
