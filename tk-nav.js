/*
 * tk-nav.js – TOTALKontroll PoC felles navigasjon
 *
 * Bruk:  <script src="tk-nav.js"></script> i <head> eller før </body>
 * 
 * Scriptet injiserer sidebar, auth-gate og nødvendig styling.
 * Oppdater kun MENU-arrayet når nye moduler legges til.
 *
 * Versjon: 0.2
 */
(function () {
  'use strict';

  // ══════════════════════════════════════════════════════
  //  MENYKONFIGURASJON – Oppdater kun denne ved nye PoC-er
  //
  //  Typer:
  //    { label, file, icon }     – vanlig menypunkt
  //    { label, icon, sub: [] }  – gruppe med undermenyer
  //
  //  icon: SVG path(s) inni 24x24 viewBox, stroke-basert
  // ══════════════════════════════════════════════════════
  const MENU = [
    {
      label: 'Min side',
      file: 'minside.html',
      icon: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'
    },
    {
      label: 'Salg',
      file: 'TOTALKontroll_Salg_PoC.html',
      icon: '<path d="M18 20V10M12 20V4M6 20v-6"/>',
      sub: [
        {
          label: 'Muligheter',
          file: 'TOTALKontroll_Muligheter.html',
          icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>'
        },
        {
          label: 'Markedsanalyse',
          file: 'TOTALKontroll_Markedsanalyse.html',
          icon: '<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>'
        }
      ]
    },
    {
      label: 'Prosjekt',
      file: 'prosjekt_poc_light.html',
      icon: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
      sub: [
        {
          label: 'Fremdriftsplan',
          file: 'TOTALKontroll_Fremdriftsplan.html',
          icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'
        },
        {
          label: 'Bærekraft',
          file: 'TOTALKontroll_Baerekraft_PoC.html',
          icon: '<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/>'
        }
      ]
    },
    {
      label: 'Håndbok',
      file: 'handbok.html',
      icon: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>'
    },
    {
      label: 'Arrangement',
      file: 'TOTALKontroll_Arrangement.html',
      icon: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>'
    },
    // ── Legg til nye moduler her ──
  ];

  // ══════════════════════════════════════════════════════
  //  AUTH
  // ══════════════════════════════════════════════════════
  const HASH = 2562494657;
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
  //  SVG
  // ══════════════════════════════════════════════════════
  const TB_LOGO = '<svg viewBox="0 0 100 90"><rect x="8" y="0" width="84" height="24" rx="2" fill="#E87722"/><rect x="8" y="30" width="36" height="56" rx="2" fill="#E87722"/><rect x="56" y="30" width="36" height="56" rx="2" fill="#E87722"/></svg>';

  function navSvg(paths) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
  }

  // ══════════════════════════════════════════════════════
  //  STYLING – pikselkopi av eksisterende PoC-sidebar
  // ══════════════════════════════════════════════════════
  const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

.tk-gate{position:fixed;inset:0;background:#1B2A4A;display:flex;align-items:center;justify-content:center;z-index:9999;font-family:'DM Sans',sans-serif}
.tk-gate.tk-hidden{display:none}
.tk-gate-box{text-align:center;color:#fff}
.tk-gate-logo{width:60px;height:54px;margin:0 auto}
.tk-gate-logo svg{width:100%;height:100%}
.tk-gate-box h2{font-size:22px;margin:16px 0 4px}
.tk-gate-box h2 em{font-style:normal;color:#E87722}
.tk-gate-box p{font-size:13px;color:#9BA5B5;margin-bottom:24px}
.tk-gate-box input{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:12px 20px;color:#fff;font-size:14px;width:240px;text-align:center;outline:none;font-family:inherit}
.tk-gate-box input:focus{border-color:#E87722}
.tk-gate-error{color:#DC2626;font-size:12px;margin-top:8px;min-height:18px}

.tk-sidebar{position:fixed;left:0;top:0;bottom:0;width:228px;background:#1B2A4A;display:flex;flex-direction:column;z-index:100;font-family:'DM Sans',sans-serif}
.tk-sidebar.tk-hidden{display:none}

.tk-sidebar-logo{padding:20px 18px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:10px}
.tk-sidebar-logo svg{width:30px;height:30px;flex-shrink:0}
.tk-sidebar-logo .tk-logo-text{display:flex;flex-direction:column;line-height:1.15}
.tk-sidebar-logo .tk-brand{font-weight:700;font-size:13px;color:#fff}
.tk-sidebar-logo .tk-brand em{font-style:normal;color:#E87722}
.tk-sidebar-logo .tk-sub{font-size:9.5px;color:#5A6A82;font-weight:500;letter-spacing:0.8px;text-transform:uppercase;margin-top:1px}

.tk-sidebar-nav{padding:14px 0;flex:1;overflow-y:auto}

.tk-nav-item{display:flex;align-items:center;gap:11px;padding:9px 18px;color:#8B99B0;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.15s;border-left:3px solid transparent;text-decoration:none}
.tk-nav-item:hover{color:#E8ECF2;background:rgba(255,255,255,0.04)}
.tk-nav-item.tk-active{color:#E87722;border-left-color:#E87722;background:rgba(232,119,34,0.08)}
.tk-nav-item svg{width:17px;height:17px;flex-shrink:0}

.tk-nav-sub{padding-left:18px}
.tk-nav-sub .tk-nav-item{padding:6px 18px 6px 32px;font-size:12px}
.tk-nav-sub .tk-nav-item svg{width:14px;height:14px}

.tk-sidebar-footer{padding:14px 18px;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;color:#8B99B0;font-weight:500}

body.tk-has-sidebar{margin-left:228px !important}

@media(max-width:768px){
  .tk-sidebar{display:none}
  body.tk-has-sidebar{margin-left:0 !important}
}
`;

  // ══════════════════════════════════════════════════════
  //  BUILD
  // ══════════════════════════════════════════════════════
  function injectStyle() {
    const s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function currentFile() {
    return location.pathname.split('/').pop() || '';
  }

  function buildNavItems(items) {
    const cur = currentFile();
    let html = '';
    for (const item of items) {
      const active = (item.file === cur) ? ' tk-active' : '';
      html += '<a class="tk-nav-item' + active + '" href="' + item.file + '">' + navSvg(item.icon) + ' ' + item.label + '</a>';
      if (item.sub && item.sub.length) {
        html += '<div class="tk-nav-sub">';
        html += buildNavItems(item.sub);
        html += '</div>';
      }
    }
    return html;
  }

  function buildSidebar() {
    const nav = document.createElement('nav');
    nav.className = 'tk-sidebar tk-hidden';
    nav.id = 'tkSidebar';
    nav.innerHTML =
      '<div class="tk-sidebar-logo">' + TB_LOGO +
        '<div class="tk-logo-text">' +
          '<span class="tk-brand"><em>TOTAL</em>Kontroll</span>' +
          '<span class="tk-sub">Ledelsessystem</span>' +
        '</div>' +
      '</div>' +
      '<div class="tk-sidebar-nav">' + buildNavItems(MENU) + '</div>' +
      '<div class="tk-sidebar-footer">Konseptvisning, kun demo data</div>';
    document.body.appendChild(nav);
  }

  function buildGate() {
    const div = document.createElement('div');
    div.className = 'tk-gate';
    div.id = 'tkGate';
    div.innerHTML =
      '<div class="tk-gate-box">' +
        '<div class="tk-gate-logo">' + TB_LOGO + '</div>' +
        '<h2><em>TOTAL</em>Kontroll</h2>' +
        '<p>PoC \u2013 Prototyper</p>' +
        '<input type="password" id="tkPw" placeholder="Passord" autocomplete="off">' +
        '<div class="tk-gate-error" id="tkPwErr"></div>' +
      '</div>';
    document.body.appendChild(div);

    var input = document.getElementById('tkPw');
    var err = document.getElementById('tkPwErr');

    function doAuth() {
      if (djb2(input.value) === HASH) {
        sessionStorage.setItem(AUTH_KEY, '1');
        div.classList.add('tk-hidden');
        showSidebar();
      } else {
        err.textContent = 'Feil passord';
        input.value = '';
        input.focus();
      }
    }

    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') doAuth(); });
    setTimeout(function () { input.focus(); }, 50);
  }

  function showSidebar() {
    var sb = document.getElementById('tkSidebar');
    if (sb) {
      sb.classList.remove('tk-hidden');
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
      buildGate();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
