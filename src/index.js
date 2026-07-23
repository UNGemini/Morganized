// ═══════════════════════════════════════════════════════════════
// INDEX — Entry point, resize gutter, acrylic lighting
// ═══════════════════════════════════════════════════════════════
// Copyright 2026 UNLOOP MORGAN
// SPDX-License-Identifier: Apache-2.0
// ═══════════════════════════════════════════════════════════════

const statusText = document.getElementById('statusText');
const progressBar = document.getElementById('progressBar');

function closeSettings() {
  switchView('tasksView');
}

// ── Programmatic window drag (Tauri API) ──────────────────────
function setupDrag() {
  var dragTargets = document.querySelectorAll('.titlebar, .pane-header');
  dragTargets.forEach(function(el) {
    el.style.userSelect = 'none';
    el.addEventListener('pointerdown', function(e) {
      if (e.target.closest('button, input, .material-symbols-outlined')) return;
      try {
        var T = window.__TAURI__;
        if (T && T.window) {
          T.window.getCurrentWindow().startDragging();
        }
      } catch(err) {}
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  setupDrag();

  // Initialize all modules
  initState();
  initRules();
  initCategories();
  initPreview();
  initSettings();
  initWindowControls();
  initFocusTracking();
  keepBlurAlive();

  // ═══════════════════════════════════════════════════════════════
  // Resize gutter — split pane drag
  // ═══════════════════════════════════════════════════════════════
  var resizeGutter = document.getElementById('resizeGutter');
  var leftFrame = document.getElementById('leftFrame');
  var rightPane = document.getElementById('rightPane');
  var appContainer = document.getElementById('appContainer');

  if (resizeGutter && leftFrame && rightPane && appContainer) {
    var isDragging = false;
    var startX = 0;
    var startLeftWidth = 0;

    resizeGutter.addEventListener('mousedown', function(e) {
      if (rightPane.classList.contains('hidden-right')) return;
      isDragging = true;
      startX = e.clientX;
      startLeftWidth = leftFrame.getBoundingClientRect().width;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var containerRect = appContainer.getBoundingClientRect();
      var gutterWidth = resizeGutter.getBoundingClientRect().width;
      var dx = e.clientX - startX;
      var newLeftWidth = startLeftWidth + dx;
      var minLeft = 400;
      var maxLeft = containerRect.width - gutterWidth - 380;
      newLeftWidth = Math.max(minLeft, Math.min(maxLeft, newLeftWidth));
      leftFrame.style.flex = '0 0 ' + newLeftWidth + 'px';
    });

    document.addEventListener('mouseup', function() {
      if (!isDragging) return;
      isDragging = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      // Persist the width
      var w = leftFrame.getBoundingClientRect().width;
      localStorage.setItem('morganized-left-width', w);
    });
  }

  // Start in home state (expanded left panel)
  enterHomeState();


  // ═══════════════════════════════════════════════════════════════
  // Acrylic lighting — per-element cursor-tracking spotlight
  // ═══════════════════════════════════════════════════════════════
  var acrylicEls = document.querySelectorAll('[data-acrylic]');
  document.addEventListener('mousemove', function(e) {
    acrylicEls.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      var x = e.clientX - rect.left;  // px from element's left edge
      var y = e.clientY - rect.top;   // px from element's top edge
      el.style.setProperty('--mouse-x', x + 'px');
      el.style.setProperty('--mouse-y', y + 'px');
    });
  });
});
