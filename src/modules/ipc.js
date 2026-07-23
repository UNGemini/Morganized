// ═══════════════════════════════════════════════════════════════
// IPC — Tauri bridge + status helpers
// ═══════════════════════════════════════════════════════════════

function getTauri() {
  if (!window.__TAURI__) {
    if (typeof statusText !== 'undefined') {
      statusText.innerText = 'Error: Tauri runtime not loaded. Please restart the app.';
    }
    throw new Error('Tauri runtime not loaded');
  }
  return window.__TAURI__;
}

async function tauriInvoke(cmd, args) {
  try {
    return await getTauri().core.invoke(cmd, args);
  } catch (err) {
    var msg = typeof err === 'string' ? err : (err.message || String(err));
    if (typeof statusText !== 'undefined') {
      statusText.innerText = 'Error: ' + msg;
    }
    console.error('tauriInvoke error:', cmd, err);
    throw err;
  }
}

function getBaseName(filePath) {
  if (!filePath) return '';
  return filePath.split(/[\\/]/).pop();
}

// ── Status helpers ──────────────────────────────────────────────────

function setStatus(msg, progress) {
  if (typeof statusText !== 'undefined') statusText.innerText = msg;
  if (typeof progressBar !== 'undefined' && progress !== undefined) progressBar.value = progress;
}

function setError(msg) {
  if (typeof statusText !== 'undefined') statusText.innerText = 'Error: ' + msg;
  console.error(msg);
}

function setBusy(btn, busy) {
  if (!btn) return;
  btn.disabled = busy;
  btn.style.opacity = busy ? '0.6' : '';
}
