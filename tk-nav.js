/*
 * tk-nav.js – TOTALKontroll PoC felles navigasjon
 * 
 * Bruk: Legg til <script src="tk-nav.js"></script> i <head> eller før </body>.
 *       Scriptet injiserer sidebar, auth og styling automatisk.
 *
 * Oppdatering: Kun dette scriptet oppdateres når nye moduler legges til.
 *              PoC-filene trenger ikke endres.
 *
 * Versjon: 0.1
 */
(function() {
  'use strict';

  // ══════════════════════════════════════════════════════
  //  MENYKONFIGURASJON – Oppdater kun denne ved nye PoC-er
  // ══════════════════════════════════════════════════════
  const MENU = [
    { section: 'Salg' },
    { icon: '📊', label: 'Pipeline',       file: 'salg_work17.html' },
    { icon: '💡', label: 'Muligheter',     file: 'mul_work3.html' },
    { icon: '📈', label: 'Markedsanalyse', file: 'markedsanalyse.html' },

    { section: 'Prosjekt' },
    { icon: '🎯', label: 'KPI Dashboard',   file: 'prosjekt_poc_light.html' },
    { icon: '📅', label: 'Fremdriftsplan',  file: 'TOTALKontroll_Fremdriftsplan.html' },

    // ── Legg til nye moduler her ──
    // { icon: '🔍', label: 'Prosjektgjennomgang', file: 'prosjektgjennomgang_v1.html' },
  ];

  // ══════════════════════════════════════════════════════
  //  AUTH
  // ══════════════════════════════════════════════════════
  const HASH = 2562494657; // DF2026
  const AUTH_KEY = 'tk_auth';

  function djb2(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    }
    return hash >>> 0;
  }

  function isAuthed() {
    return sessionStorage.getItem(AUTH_KEY) === '1';
  }

  // ══════════════════════════════════════════════════════
  //  STYLING
  // ══════════════════════════════════════════════════════
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

    :root {
      --tk-navy: #1a2744;
      --tk-navy-light: #243352;
      --tk-navy-hover: #2d3f63;
      --tk-orange: #e67e22;
      --tk-orange-hover: #d35400;
      --tk-sidebar-w: 220px;
    }

    /* Auth overlay */
    .tk-auth-overlay {
      position: fixed; inset: 0; z-index: 10000;
      background: var(--tk-navy);
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; gap: 24px;
      font-family: 'DM Sans', sans-serif;
    }
    .tk-auth-overlay.tk-hidden { display: none; }

    .tk-auth-logo {
      display: flex; align-items: center; gap: 12px;
      color: #fff; font-size: 22px; font-weight: 700;
    }
    .tk-auth-logo-icon {
      width: 40px; height: 40px; background: var(--tk-orange);
      border-radius: 6px; display: flex; align-items: center;
      justify-content: center; font-weight: 700; font-size: 18px; color: #fff;
    }
    .tk-auth-box {
      display: flex; border-radius: 8px; overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.3);
    }
    .tk-auth-box input {
      padding: 12px 16px; font-size: 15px; font-family: 'DM Sans', sans-serif;
      border: none; outline: none; width: 220px;
      background: #fff; color: var(--tk-navy);
    }
    .tk-auth-box input::placeholder { color: #8a92a0; }
    .tk-auth-box button {
      padding: 12px 20px; font-size: 14px; font-weight: 600;
      font-family: 'DM Sans', sans-serif; border: none; cursor: pointer;
      background: var(--tk-orange); color: #fff; transition: background 0.15s;
    }
    .tk-auth-box button:hover { background: var(--tk-orange-hover); }
    .tk-auth-error { color: #e74c3c; font-size: 13px; min-height: 18px; }

    /* Sidebar */
    .tk-sidebar {
      position: fixed; left: 0; top: 0; bottom: 0;
      width: var(--tk-sidebar-w); background: var(--tk-navy);
      color: #fff; font-family: 'DM Sans', sans-serif;
      display: flex; flex-direction: column;
      z-index: 9000; user-select: none;
      box-shadow: 2px 0 8px rgba(0,0,0,0.15);
    }
    .tk-sidebar.tk-hidden { display: none; }

    .tk-sidebar-header {
      padding: 20px 16px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .tk-sidebar-brand {
      display: flex; align-items: center; gap: 10px;
      font-size: 16px; font-weight: 700;
    }
    .tk-sidebar-brand-icon {
      width: 32px; height: 32px; background: var(--tk-orange);
      border-radius: 5px; display: flex; align-items: center;
      justify-content: center; font-weight: 700; font-size: 14px;
    }
    .tk-sidebar-sub {
      font-size: 11px; color: #8a92a0; margin-top: 4px;
      padding-left: 42px; text-transform: uppercase; letter-spacing: 0.5px;
    }

    .tk-sidebar-nav {
      flex: 1; padding: 12px 8px; overflow-y: auto;
      display: flex; flex-direction: column; gap: 2px;
    }

    .tk-nav-section {
      font-size: 10px; font-weight: 600; color: #8a92a0;
      text-transform: uppercase; letter-spacing: 0.8px;
      padding: 14px 12px 6px;
    }

    .tk-nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 12px; border-radius: 6px;
      font-size: 13.5px; font-weight: 500;
      color: rgba(255,255,255,0.7); cursor: pointer;
      transition: all 0.12s; text-decoration: none;
    }
    .tk-nav-item:hover {
      background: var(--tk-navy-hover); color: #fff;
    }
    .tk-nav-item.tk-active {
      background: var(--tk-navy-light); color: #fff; font-weight: 600;
    }
    .tk-nav-item.tk-active::before {
      content: ''; width: 3px; height: 18px;
      background: var(--tk-orange); border-radius: 2px;
      margin-left: -4px; margin-right: 2px; flex-shrink: 0;
    }
    .tk-nav-icon {
      width: 18px; text-align: center; font-size: 14px;
      flex-shrink: 0; opacity: 0.85;
    }

    .tk-sidebar-footer {
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,0.08);
      font-size: 11px; color: #8a92a0;
    }

    /* Push page content right */
    body.tk-has-sidebar {
      margin-left: var(--tk-sidebar-w) !important;
    }

    /* Mobile */
    @media (max-width: 768px) {
      :root { --tk-sidebar-w: 52px; }
      .tk-sidebar-brand span,
      .tk-sidebar-sub,
      .tk-nav-section,
      .tk-nav-item span:not(.tk-nav-icon) { display: none; }
      .tk-sidebar-header { padding: 14px 10px; }
      .tk-nav-item { justify-content: center; padding: 10px; }
      .tk-nav-item.tk-active::before { display: none; }
      .tk-nav-icon { margin: 0; font-size: 16px; }
    }
  `;

  // ══════════════════════════════════════════════════════
  //  BUILD DOM
  // ══════════════════════════════════════════════════════

  function injectStyle() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function buildAuthOverlay() {
    const div = document.createElement('div');
    div.className = 'tk-auth-overlay';
    div.id = 'tkAuth';
    div.innerHTML = `
      <div class="tk-auth-logo">
        <div class="tk-auth-logo-icon">TK</div>
        TOTALKontroll
      </div>
      <div class="tk-auth-box">
        <input type="password" id="tkAuthInput" placeholder="Passord" autofocus>
        <button id="tkAuthBtn">Logg inn</button>
      </div>
      <div class="tk-auth-error" id="tkAuthError"></div>
    `;
    document.body.appendChild(div);

    const input = document.getElementById('tkAuthInput');
    const error = document.getElementById('tkAuthError');

    function doAuth() {
      if (djb2(input.value) === HASH) {
        sessionStorage.setItem(AUTH_KEY, '1');
        div.classList.add('tk-hidden');
        showSidebar();
      } else {
        error.textContent = 'Feil passord';
        input.value = '';
        input.focus();
      }
    }

    document.getElementById('tkAuthBtn').addEventListener('click', doAuth);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') doAuth(); });
  }

  function buildSidebar() {
    const currentFile = location.pathname.split('/').pop() || 'index.html';

    let navHTML = '';
    for (const item of MENU) {
      if (item.section) {
        navHTML += `<div class="tk-nav-section">${item.section}</div>`;
      } else {
        const active = (item.file === currentFile) ? ' tk-active' : '';
        navHTML += `
          <a class="tk-nav-item${active}" href="${item.file}">
            <span class="tk-nav-icon">${item.icon}</span>
            <span>${item.label}</span>
          </a>`;
      }
    }

    const sidebar = document.createElement('nav');
    sidebar.className = 'tk-sidebar tk-hidden';
    sidebar.id = 'tkSidebar';
    sidebar.innerHTML = `
      <div class="tk-sidebar-header">
        <div class="tk-sidebar-brand">
          <div class="tk-sidebar-brand-icon">TK</div>
          <span>TOTALKontroll</span>
        </div>
        <div class="tk-sidebar-sub">PoC – Prototyper</div>
      </div>
      <div class="tk-sidebar-nav">${navHTML}</div>
      <div class="tk-sidebar-footer">PoC v0.1 – Kun demo</div>
    `;
    document.body.appendChild(sidebar);
  }

  function showSidebar() {
    const sidebar = document.getElementById('tkSidebar');
    if (sidebar) {
      sidebar.classList.remove('tk-hidden');
      document.body.classList.add('tk-has-sidebar');
    }
  }

  // ══════════════════════════════════════════════════════
  //  INIT
  // ══════════════════════════════════════════════════════
  function init() {
    injectStyle();
    buildSidebar();

    if (isAuthed()) {
      showSidebar();
    } else {
      buildAuthOverlay();
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
