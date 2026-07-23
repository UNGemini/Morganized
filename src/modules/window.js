// ═══════════════════════════════════════════════════════════════
// WINDOW — Window controls, focus tracking, blur keep-alive
// ═══════════════════════════════════════════════════════════════

function keepBlurAlive() {
  function loop() {
    void document.documentElement.offsetHeight;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

async function initFocusTracking() {
  try {
    var tauri = getTauri();
    await tauri.event.listen('tauri://focus', function() {
      document.documentElement.classList.remove('window-blurred');
    });
    await tauri.event.listen('tauri://blur', function() {
      document.documentElement.classList.add('window-blurred');
    });
  } catch(e) {
    // Fallback for browser dev: use DOM events
    window.addEventListener('focus', function() {
      document.documentElement.classList.remove('window-blurred');
    });
    window.addEventListener('blur', function() {
      document.documentElement.classList.add('window-blurred');
    });
  }
}

function initWindowControls() {
  var closeBtn = document.getElementById('closeBtn');
  var minimizeBtn = document.getElementById('minimizeBtn');
  var fullscreenBtn = document.getElementById('fullscreenBtn');

  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      tauriInvoke('close_window').catch(function() {});
    });
  }
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', function() {
      tauriInvoke('minimize_window').catch(function() {});
    });
  }
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', function() {
      tauriInvoke('toggle_fullscreen').catch(function() {});
    });
  }
}
