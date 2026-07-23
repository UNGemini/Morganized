// ═══════════════════════════════════════════════════════════════
// STATE — Task CRUD, view management, dock navigation
// ═══════════════════════════════════════════════════════════════

var currentTaskId = null;
var savedTaskName = 'New Task';
var taskDirty = false;
var currentActiveView = null;

// DOM refs (initialized by initState)
var leftFrame, rightPane, resizeGutter, mainDock;
var titlebarLogo, titlebarSettingsBtn;
var paneHeader, backBtn, saveTaskBtn, taskViewTitle;
var homeView, tasksView, previewView, settingsView;

function loadSavedTasks() {
  try { return JSON.parse(localStorage.getItem('morganized-tasks') || '[]'); }
  catch(e) { return []; }
}

function saveTasksToStorage(tasks) {
  localStorage.setItem('morganized-tasks', JSON.stringify(tasks));
}

// ── Unsaved changes guard ──────────────────────────
function confirmLeaveTask(onLeave) {
  if (taskDirty && currentTaskId) {
    showUnsavedModal(onLeave);
  } else {
    onLeave();
  }
}

function showUnsavedModal(onLeave) {
  // Remove any existing modal
  var existing = document.getElementById('unsaved-modal-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'unsaved-modal-overlay';
  overlay.innerHTML =
    '<div class="unsaved-modal">' +
      '<p class="unsaved-modal-text">' + t('unsavedTitle') + '</p>' +
      '<p class="unsaved-modal-sub">' + t('unsavedSub') + '</p>' +
      '<div class="unsaved-modal-btns">' +
        '<button class="btn btn-secondary unsaved-btn-cancel">' + t('cancel') + '</button>' +
        '<button class="btn btn-primary unsaved-btn-leave">' + t('leave') + '</button>' +
        '<button class="btn btn-accent unsaved-btn-save">' + t('saveLeave') + '</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  overlay.querySelector('.unsaved-btn-save').addEventListener('click', function() {
    // Force-collect latest rules before saving
    if (typeof saveRulesAndPreview === 'function') saveRulesAndPreview(false);
    saveCurrentTask();
    overlay.remove();
    onLeave();
  });
  overlay.querySelector('.unsaved-btn-leave').addEventListener('click', function() {
    overlay.remove();
    onLeave();
  });
  overlay.querySelector('.unsaved-btn-cancel').addEventListener('click', function() {
    overlay.remove();
  });
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) { overlay.remove(); }
  });
}

function renderSavedTasks() {
  var grid = document.getElementById('savedTasksGrid');
  var tasks = loadSavedTasks();
  if (!tasks.length) {
    grid.innerHTML = '<p class="empty-state">' + t('noSavedTasks') + '</p>';
    return;
  }
  grid.innerHTML = tasks.map(function(task) {
    var rulesSummary = '';
    if (task.rules) {
      var r = task.rules;
      var count = 0;
      if (r.fileTypeToggle) count++;
      if (r.timeToggle) count++;
      if (r.startDate || r.endDate) count++;
      if (r.startTime || r.endTime) count++;
      if (r.excludedDays && r.excludedDays.length) count += r.excludedDays.length;
      if (r.excludedSpecificDates && r.excludedSpecificDates.length) count++;
      if (r.useNumericMonths) count++;
      if (r.fileFilter && r.fileFilter.length) count++;
      if (r.deleteOriginals) count++;
      if (r.skipHidden) count++;
      if (r.skipDSStore) count++;
      if (r.createOtherFolder) count++;
      rulesSummary = count ? t('nRules', [count]) : t('noRules');
    }
    return '<div class="task-card" data-task-id="' + task.id + '">' +
      '<div class="task-card-icon"><span class="material-symbols-outlined">assignment</span></div>' +
      '<div class="task-card-info">' +
        '<div class="task-card-name">' + (task.taskName || task.name || 'Untitled') + '</div>' +
        '<div class="task-card-meta">' + rulesSummary + ' · ' + (task.sourcePath || task.source || '—') + ' → ' + (task.destinationPath || task.dest || '—') + '</div>' +
      '</div>' +
      '<button class="task-card-delete" data-delete-id="' + task.id + '" title="Delete">' +
        '<span class="material-symbols-outlined">delete</span>' +
      '</button>' +
    '</div>';
  }).join('');

  grid.querySelectorAll('.task-card').forEach(function(card) {
    card.addEventListener('click', function(e) {
      if (e.target.closest('.task-card-delete')) return;
      confirmLeaveTask(function() { loadTask(card.getAttribute('data-task-id')); });
    });
  });

  grid.querySelectorAll('.task-card-delete').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      deleteTask(this.getAttribute('data-delete-id'));
    });
  });
}

function enterHomeState() {
  currentTaskId = null;
  currentActiveView = null;
  savedTaskName = 'New Task';
  if (rightPane) { rightPane.style.display = 'none'; rightPane.classList.add('hidden-right'); }
  if (resizeGutter) resizeGutter.style.display = 'none';
  if (mainDock) mainDock.style.display = 'none';
  if (leftFrame) {
    leftFrame.classList.add('expanded');
    leftFrame.style.flex = '1';
    leftFrame.style.maxWidth = 'none';
  }
  var allViews = document.querySelectorAll('.pane-left-inner .pane-view');
  allViews.forEach(function(v) { v.classList.remove('active'); });
  if (homeView) homeView.classList.add('active');
  if (titlebarLogo) titlebarLogo.style.display = '';
  if (titlebarSettingsBtn) titlebarSettingsBtn.style.display = '';
  if (taskViewTitle) taskViewTitle.style.display = '';
  if (paneHeader) paneHeader.style.display = 'none';
  if (saveTaskBtn) saveTaskBtn.style.display = 'none';
  document.body.classList.remove('has-task');
  renderSavedTasks();
  resetOrganizeRules();
}

function enterTaskState(taskName) {
  isRestoringUI = true;
  if (!taskName && !currentTaskId) {
    currentTaskId = 'task_' + Date.now();
  }
  if (rightPane) { rightPane.style.display = 'flex'; rightPane.classList.remove('hidden-right'); }
  if (resizeGutter) resizeGutter.style.display = '';
  if (mainDock) mainDock.style.display = '';
  if (leftFrame) {
    leftFrame.classList.remove('expanded');
    var savedWidth = localStorage.getItem('morganized-left-width');
    if (savedWidth) {
      leftFrame.style.flex = '0 0 ' + savedWidth + 'px';
      leftFrame.style.maxWidth = '75%';
    } else {
      leftFrame.style.flex = '0 0 45%';
      leftFrame.style.maxWidth = '75%';
    }
  }
  var allViews = document.querySelectorAll('.pane-left-inner .pane-view');
  allViews.forEach(function(v) { v.classList.remove('active'); });
  if (tasksView) tasksView.classList.add('active');
  var dockBtns = document.querySelectorAll('#mainDock .dock-btn');
  dockBtns.forEach(function(b) { b.classList.remove('active'); });
  var tasksDockBtn = document.querySelector('#mainDock .dock-btn[data-view="tasksView"]');
  if (tasksDockBtn) tasksDockBtn.classList.add('active');
  savedTaskName = taskName || t('newTask');
  if (taskViewTitle) { taskViewTitle.textContent = savedTaskName; taskViewTitle.style.display = ''; }
  if (paneHeader) paneHeader.style.display = '';
  if (titlebarSettingsBtn) titlebarSettingsBtn.style.display = 'none';
  document.body.classList.add('has-task');
  if (saveTaskBtn) saveTaskBtn.style.display = '';
  // Load global custom categories into this task
  if (typeof loadGlobalCategories === 'function') loadGlobalCategories();
  // Clear organize rules for brand-new tasks (not when loading saved)
  if (!taskName) {
    if (typeof resetOrganizeRules === 'function') resetOrganizeRules();
    if (typeof loadGlobalCategories === 'function') loadGlobalCategories();
    // New tasks: uncheck global custom categories, hide their option panels
    document.querySelectorAll('.preset-category[data-category^="dynamic-"] input[type="checkbox"]').forEach(function(cb) {
      cb.checked = false;
      var container = document.querySelector('.custom-options-container-' + cb.value);
      if (container) container.style.display = 'none';
    });
    localStorage.removeItem('organizeRules');
  }
  // Clear folder paths only for brand-new tasks (not when loading saved)
  if (!taskName) {
    var sp = document.getElementById('sourcePath');
    var dp = document.getElementById('destPath');
    if (sp) sp.innerText = t('noFolder');
    if (dp) dp.innerText = t('noFolder');
  }
  taskDirty = false;
  var previewList = document.getElementById('previewList'); if (previewList) previewList.innerHTML = '';
  if (typeof setStatus === 'function') setStatus(t('ready'));
  setTimeout(function() { isRestoringUI = false; }, 100);
}

function saveCurrentTask() {
  var name = savedTaskName;
  if (!name || name === t('newTask')) {
    name = 'Untitled';
  }
  var source = document.getElementById('sourcePath');
  var dest = document.getElementById('destPath');
  var srcPath = source ? source.innerText : '';
  var dstPath = dest ? dest.innerText : '';
  if (srcPath === t('noFolder')) srcPath = '';
  if (dstPath === t('noFolder')) dstPath = '';

  try {
    var rules = JSON.parse(localStorage.getItem('organizeRules') || '{}');
  } catch(e) { rules = {}; }

  var taskData = {
    id: currentTaskId,
    taskName: name,
    sourcePath: srcPath,
    destinationPath: dstPath,
    rules: rules,
    lastModified: new Date().toISOString()
  };

  var tasks = loadSavedTasks();
  var existingIdx = -1;
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === currentTaskId) { existingIdx = i; break; }
  }
  if (existingIdx >= 0) {
    tasks[existingIdx] = taskData;
  } else {
    tasks.push(taskData);
  }
  saveTasksToStorage(tasks);
  taskDirty = false;
  console.log('[Categories] saveCurrentTask:', taskData.id, 'cats:', (taskData.rules.customCategories || []).length, 'fileTypes:', (taskData.rules.fileTypes || []).length);
  setStatus('✓ Task saved.', 100);
  renderSavedTasks();
}

function loadTask(id) {
  isRestoringUI = true;
  var tasks = loadSavedTasks();
  var task = null;
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) { task = tasks[i]; break; }
  }
  if (!task) return;

  currentTaskId = task.id;
  enterTaskState(task.taskName || task.name || 'Untitled');

  // Restore source/dest
  var sourcePath = document.getElementById('sourcePath');
  var destPath = document.getElementById('destPath');
  if (sourcePath) sourcePath.innerText = task.sourcePath || task.source || '';
  if (destPath) destPath.innerText = task.destinationPath || task.dest || '';
  taskDirty = false;

  // Restore rules to localStorage and restore UI checkbox states
  if (task.rules) {
    localStorage.setItem('organizeRules', JSON.stringify(task.rules));
    restoreRulesUI();
    // Final pass: ensure saved categories match — skip categories not in save
    setTimeout(function() {
      var rules = task.rules;
      var catsById = {};
      if (rules.customCategories) {
        rules.customCategories.forEach(function(c) {
          var slugId = typeof generateCategoryId === 'function' ? generateCategoryId(c.name) : c.id;
          catsById[slugId] = c.isChecked !== false;
        });
      }
      document.querySelectorAll('input[name="file-type"]').forEach(function(cb) {
        if (cb.value.indexOf('dynamic-') === 0) {
          // Only correct categories that are in the saved data
          var inSave = catsById.hasOwnProperty(cb.value) || ((rules.fileTypes || []).indexOf(cb.value) !== -1);
          if (!inSave) return; // skip — category added after save, keep current state
          var want = catsById.hasOwnProperty(cb.value) ? catsById[cb.value] : true;
          if (cb.checked !== want) {
            cb.checked = want;
            console.log('[Categories] late-fix:', cb.value, 'corrected to', want);
          }
        }
      });
    }, 50);
  }
  setTimeout(function() { isRestoringUI = false; }, 100);
}

function deleteTask(id) {
  var tasks = loadSavedTasks();
  tasks = tasks.filter(function(t) { return t.id !== id; });
  saveTasksToStorage(tasks);
  // Clear stale organize rules so they don't bleed into next task
  localStorage.removeItem('organizeRules');
  // Also reset the form if we're on home page
  if (typeof resetOrganizeRules === 'function') resetOrganizeRules();
  if (typeof loadGlobalCategories === 'function') loadGlobalCategories();
  // Uncheck global categories after reset
  document.querySelectorAll('.preset-category[data-category^="dynamic-"] input[type="checkbox"]').forEach(function(cb) {
    cb.checked = false;
    var container = document.querySelector('.custom-options-container-' + cb.value);
    if (container) container.style.display = 'none';
  });
  renderSavedTasks();
  if (currentTaskId === id) enterHomeState();
}

function updateTaskViewTitle() {
  if (!currentTaskId || !taskViewTitle) return;
  if (currentActiveView === 'previewView') {
    taskViewTitle.textContent = savedTaskName + ' — ' + t('preview');
  } else if (currentActiveView === 'settingsView') {
    taskViewTitle.textContent = savedTaskName + ' — ' + t('settings');
  } else {
    taskViewTitle.textContent = savedTaskName;
  }
}

function switchView(viewName) {
  if (!currentTaskId && viewName !== 'tasksView') {
    // No active task — do nothing for preview/settings if they try to navigate via dock
    return;
  }
  var allViews = document.querySelectorAll('.pane-left-inner .pane-view');
  allViews.forEach(function(v) { v.classList.remove('active'); });
  var targetView = document.getElementById(viewName);
  if (targetView) targetView.classList.add('active');

  // Update dock buttons
  var dockBtns = document.querySelectorAll('#mainDock .dock-btn');
  dockBtns.forEach(function(b) { b.classList.remove('active'); });
  var activeDockBtn = document.querySelector('#mainDock .dock-btn[data-view="' + viewName + '"]');
  if (activeDockBtn) activeDockBtn.classList.add('active');

  // Update header title
  currentActiveView = viewName;
  if (viewName === 'previewView') {
    if (typeof generatePreview === 'function') { var sp = document.getElementById('sourcePath'); var dp = document.getElementById('destPath'); if (sp && dp && sp.innerText && sp.innerText !== t('noFolder') && dp.innerText && dp.innerText !== t('noFolder')) { saveRulesAndPreview(true); } }
    if (taskViewTitle) { taskViewTitle.textContent = savedTaskName + ' — ' + t('preview'); taskViewTitle.style.display = ''; }
  } else if (viewName === 'settingsView') {
    if (taskViewTitle) { taskViewTitle.textContent = savedTaskName + ' — ' + t('settings'); taskViewTitle.style.display = ''; }
    // In task mode, hide the inline close row (use paneHeader back button instead)
    var closeRow = document.getElementById('settingsCloseRow');
    if (closeRow) closeRow.style.display = 'none';
  } else {
    if (taskViewTitle) { taskViewTitle.textContent = savedTaskName; taskViewTitle.style.display = ''; }
  }
}

function initState() {
  leftFrame = document.getElementById('leftFrame');
  rightPane = document.getElementById('rightPane');
  resizeGutter = document.getElementById('resizeGutter');
  mainDock = document.getElementById('mainDock');
  titlebarLogo = document.getElementById('titlebarLogo');
  titlebarSettingsBtn = document.getElementById('titlebarSettingsBtn');
  paneHeader = document.getElementById('paneHeader');
  taskViewTitle = document.getElementById('taskViewTitle');
  backBtn = document.getElementById('backBtn');
  saveTaskBtn = document.getElementById('saveTaskBtn');
  homeView = document.getElementById('homeView');
  tasksView = document.getElementById('tasksView');
  previewView = document.getElementById('previewView');
  settingsView = document.getElementById('settingsView');

  // Dock buttons
  document.querySelectorAll('#mainDock .dock-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var viewName = this.getAttribute('data-view');
      switchView(viewName);
    });
  });

  // Titlebar back button
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      var activeView = document.querySelector('.pane-left-inner .pane-view.active');
      if (activeView && activeView.id === 'settingsView' && !currentTaskId) {
        // Settings from home — switch back to home view, hide header, restore titlebar
        var allViews = document.querySelectorAll('.pane-left-inner .pane-view');
        allViews.forEach(function(v) { v.classList.remove('active'); });
        if (homeView) homeView.classList.add('active');
        if (paneHeader) paneHeader.style.display = 'none';
        if (titlebarSettingsBtn) titlebarSettingsBtn.style.display = '';
        if (titlebarLogo) titlebarLogo.style.display = '';
      } else if (activeView && (activeView.id === 'previewView' || activeView.id === 'settingsView')) {
        switchView('tasksView');
      } else {
        confirmLeaveTask(enterHomeState);
      }
    });
  }

  // Titlebar save button
  if (saveTaskBtn) {
    saveTaskBtn.addEventListener('click', function() {
      if (typeof saveRulesAndPreview === 'function') saveRulesAndPreview(false);
      saveCurrentTask();
    });
  }

  // Titlebar settings button (home state) — shows settings without creating a task
  if (titlebarSettingsBtn) {
    titlebarSettingsBtn.addEventListener('click', function() {
      if (currentTaskId) return; // only works in home state
      var allViews = document.querySelectorAll('.pane-left-inner .pane-view');
      allViews.forEach(function(v) { v.classList.remove('active'); });
      if (settingsView) settingsView.classList.add('active');
      // Keep titlebar visible (app title stays), do NOT show paneHeader
      if (titlebarLogo) titlebarLogo.style.display = '';
      if (paneHeader) paneHeader.style.display = 'none';
      if (titlebarSettingsBtn) titlebarSettingsBtn.style.display = 'none';
      // Show the inline close button inside settings
      var closeRow = document.getElementById('settingsCloseRow');
      if (closeRow) closeRow.style.display = '';
    });
  }

  // Settings close button (only used when settings is opened from home)
  var settingsCloseBtn = document.getElementById('settingsCloseBtn');
  if (settingsCloseBtn) {
    settingsCloseBtn.addEventListener('click', function() {
      var allViews = document.querySelectorAll('.pane-left-inner .pane-view');
      allViews.forEach(function(v) { v.classList.remove('active'); });
      if (homeView) homeView.classList.add('active');
      if (titlebarSettingsBtn) titlebarSettingsBtn.style.display = '';
      if (titlebarLogo) titlebarLogo.style.display = '';
      var closeRow = document.getElementById('settingsCloseRow');
      if (closeRow) closeRow.style.display = 'none';
    });
  }

  // ── Inline task title editing ──────────────────────────
  if (taskViewTitle) {
    taskViewTitle.addEventListener('click', function() {
      if (taskViewTitle.querySelector('input')) return; // already editing

      // In preview/settings: jump to tasks view first, then edit
      if (tasksView && !tasksView.classList.contains('active')) {
        // Don't jump if settings opened from home (no currentTaskId)
        if (!currentTaskId) return;
        switchView('tasksView');
        // Defer the rename until after the view switch
        setTimeout(function() { if (taskViewTitle) taskViewTitle.click(); }, 50);
        return;
      }

      var currentName = taskViewTitle.textContent.trim();
      var input = document.createElement('input');
      input.type = 'text';
      input.value = currentName;
      input.className = 'task-title-input';
      taskViewTitle.textContent = '';
      taskViewTitle.appendChild(input);
      input.focus();
      input.select();

      function commit() {
        var newName = input.value.trim();
        if (newName && newName !== currentName) {
          savedTaskName = newName;
          taskDirty = true;
        }
        taskViewTitle.textContent = savedTaskName;
      }
      function cancel() {
        taskViewTitle.textContent = currentName;
      }

      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); commit(); }
        else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
      });
      input.addEventListener('blur', function() { commit(); });
    });
  }

  // Edit button — triggers inline edit on the title
  var editNameBtn = document.getElementById('editNameBtn');
  if (editNameBtn) {
    editNameBtn.addEventListener('click', function() {
      if (taskViewTitle) taskViewTitle.click();
    });
  }

  // Create task button
  var createTaskBtn = document.getElementById('createTaskBtn');
  if (createTaskBtn) {
    createTaskBtn.addEventListener('click', function() {
      enterTaskState();
    });
  }

  // Folder path click — open in file manager
  ['sourcePath', 'destPath'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', function() {
        var path = el.innerText.trim();
        if (path && path !== t('noFolder')) {
          tauriInvoke('reveal_in_file_manager', { path: path }).catch(function() {});
        }
      });
    }
  });

  // Render initial saved tasks
  renderSavedTasks();
}
