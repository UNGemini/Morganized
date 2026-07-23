// ═══════════════════════════════════════════════════════════════
// SETTINGS — Light mode, theme color, language, profile
// ═══════════════════════════════════════════════════════════════

function updateWelcomeTitle() {
  var title = document.getElementById('welcomeTitle');
  if (!title) return;
  var name = localStorage.getItem('morganized-username') || 'User';
  title.textContent = t('welcomeUser').replace('User', name);
}

// Parse hex color to {r,g,b}
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  var num = parseInt(hex, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function applyAccentColor(color) {
  document.documentElement.style.setProperty('--accent', color);
  // Derive dim and glow variants from the chosen colour
  var rgb = hexToRgb(color);
  document.documentElement.style.setProperty('--accent-dim', 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.10)');
  document.documentElement.style.setProperty('--accent-glow', 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.30)');
  localStorage.setItem('morganized-accent', color);
}

function updateTitlebarLogo() {
  var logo = document.getElementById('titlebarLogo');
  if (!logo) return;
  var isLight = document.body.getAttribute('data-theme') === 'light';
  logo.src = isLight ? 'assets/TopbarName_WhiteMode.svg' : 'assets/TopbarName.svg';
}

function initSettings() {
  // Light mode toggle
  var lightModeToggle = document.getElementById('lightModeToggle');
  if (lightModeToggle) {
    // Restore saved state before attaching listener
    if (localStorage.getItem('morganized-light-mode') === '1') {
      lightModeToggle.checked = true;
      document.body.setAttribute('data-theme', 'light');
    } else {
      lightModeToggle.checked = false;
      document.body.removeAttribute('data-theme');
    }
    updateTitlebarLogo();
    lightModeToggle.addEventListener('change', function() {
      if (this.checked) {
        document.body.setAttribute('data-theme', 'light');
        localStorage.setItem('morganized-light-mode', '1');
      } else {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('morganized-light-mode', '0');
      }
      updateTitlebarLogo();
    });
  }

  // Theme color swatches
  var swatches = document.querySelectorAll('.color-swatch');
  swatches.forEach(function(swatch) {
    swatch.addEventListener('click', function() {
      var color = this.getAttribute('data-color');
      applyAccentColor(color);
      swatches.forEach(function(s) { s.classList.remove('active'); });
      this.classList.add('active');
    });
  });
  // Restore saved accent
  var savedAccent = localStorage.getItem('morganized-accent');
  if (savedAccent) {
    applyAccentColor(savedAccent);
    swatches.forEach(function(s) {
      if (s.getAttribute('data-color') === savedAccent) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
  }

  // Language select
  var langSelect = document.getElementById('languageSelect');
  if (langSelect) {
    var savedLang = localStorage.getItem('morganized-language');
    if (savedLang) langSelect.value = savedLang;
    langSelect.addEventListener('change', function() {
      localStorage.setItem('morganized-language', this.value);
      applyI18n();
    });
  }

  // Translated folder names toggle
  var saveCatsCheckbox = document.getElementById('saveDefaultCatsEnglish');
  if (saveCatsCheckbox) {
    saveCatsCheckbox.checked = localStorage.getItem('morganized-save-default-cats-english') === '1';
    saveCatsCheckbox.addEventListener('change', function() {
      localStorage.setItem('morganized-save-default-cats-english', this.checked ? '1' : '0');
    });

  // Solid background toggle
  var solidBgToggle = document.getElementById('solidBgToggle');
  if (solidBgToggle) {
    solidBgToggle.checked = localStorage.getItem('morganized-solid-bg') === '1';
    if (solidBgToggle.checked) document.documentElement.classList.add('solid-bg');
    solidBgToggle.addEventListener('change', function() {
      localStorage.setItem('morganized-solid-bg', this.checked ? '1' : '0');
      if (this.checked) {
        document.documentElement.classList.add('solid-bg');
      } else {
        document.documentElement.classList.remove('solid-bg');
      }
    });
  }
  }

  // Username input — save on Enter or blur
  var usernameInput = document.getElementById('usernameInput');
  if (usernameInput) {
    var savedName = localStorage.getItem('morganized-username') || '';
    usernameInput.value = savedName;
    function commitUsername() {
      var name = usernameInput.value.trim();
      localStorage.setItem('morganized-username', name);
      updateWelcomeTitle();
    }
    usernameInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); this.blur(); }
    });
    usernameInput.addEventListener('blur', function() { commitUsername(); });
  }

  updateWelcomeTitle();

  // Load app version from Tauri
  loadAppInfo();
}

async function loadAppInfo() {
  var verEl = document.getElementById('aboutVersion');
  if (!verEl) return;
  try {
    var tauri = getTauri();
    var version = await tauri.app.getVersion();
    verEl.textContent = 'v' + version;
  } catch(e) {
    verEl.textContent = 'v0.1.0';
  }
}
