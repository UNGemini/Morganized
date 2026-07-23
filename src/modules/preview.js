// ═══════════════════════════════════════════════════════════════
// PREVIEW — Folder pickers, organize, preview rendering
// ═══════════════════════════════════════════════════════════════

// ── File filter tag helpers ─────────────────────────────────────

function getFileFilterTags() {
  var tags = document.querySelectorAll('#fileFilterTags .custom-option-tag');
  var result = [];
  tags.forEach(function(t) {
    var val = t.getAttribute('data-value');
    if (val) result.push(val.toLowerCase());
  });
  return result;
}

function addFileFilterTag(value) {
  if (!value || !value.trim()) return;
  value = value.trim();
  if (!value.startsWith('.')) value = '.' + value;
  value = value.toLowerCase();

  // Check duplicates
  var existing = document.querySelectorAll('#fileFilterTags .custom-option-tag');
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].getAttribute('data-value') === value) return;
  }

  var tag = document.createElement('span');
  tag.className = 'custom-option-tag';
  tag.setAttribute('data-value', value);
  tag.innerHTML = value + '<button type="button" class="remove-custom-option-tag" data-value="' + value + '" title="Remove">&times;</button>';
  document.getElementById('fileFilterTags').appendChild(tag);
}

// ── Timestamp formatting ─────────────────────────────────────────

function formatTimestamp(raw) {
  if (!raw) return '';
  // raw is epoch milliseconds as a string (e.g. "1765685885520")
  var ms = parseInt(raw, 10);
  if (isNaN(ms)) return raw;
  var d = new Date(ms);
  if (isNaN(d.getTime())) return raw;
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var mon = months[d.getMonth()];
  var day = d.getDate();
  var year = d.getFullYear();
  var now = new Date();
  // If same year as current, omit year
  if (year === now.getFullYear()) {
    return mon + ' ' + day;
  }
  return mon + ' ' + day + ', ' + year;
}

// ── Init — event wiring ───────────────────────────────────────────

function initPreview() {
  var organizeBtn = document.getElementById('organizeBtn');

  // Source folder picker
  document.getElementById('sourceBtn').addEventListener('click', async function() {
    try {
      var folder = await tauriInvoke('pick_folder');
      document.getElementById('sourcePath').innerText = folder || t('noFolder');
      if (typeof taskDirty !== 'undefined') taskDirty = true;
      var destPath = document.getElementById('destPath').innerText;
      if (folder && destPath && destPath !== t('noFolder')) {
        generatePreview(folder, destPath);
      }
    } catch (err) {
      // error already handled by tauriInvoke
    }
  });

  // Destination folder picker
  document.getElementById('destBtn').addEventListener('click', async function() {
    try {
      var folder = await tauriInvoke('pick_folder');
      document.getElementById('destPath').innerText = folder || t('noFolder');
      if (typeof taskDirty !== 'undefined') taskDirty = true;
      var sourcePath = document.getElementById('sourcePath').innerText;
      if (folder && sourcePath && sourcePath !== t('noFolder')) {
        generatePreview(sourcePath, folder);
      }
    } catch (err) {
      // error already handled by tauriInvoke
    }
  });

  // Organize button (REAL processing)
  organizeBtn.addEventListener('click', async function() {
    var sourcePath = document.getElementById('sourcePath').innerText;
    var destPath = document.getElementById('destPath').innerText;

    if (!sourcePath || sourcePath === t('noFolder') ||
        !destPath || destPath === t('noFolder')) {
      setStatus(t('selectFolders'));
      return;
    }

    var deleteOriginals = document.getElementById('deleteOriginals').checked;
    var skipHidden = document.getElementById('skipHidden').checked;
    var skipDSStore = document.getElementById('skipDSStore').checked;
    var fileFilter = getFileFilterTags();

    var organizeRules = localStorage.getItem('organizeRules') ?
      JSON.parse(localStorage.getItem('organizeRules')) : null;

    setStatus(t('organizing'), 0);
    setBusy(organizeBtn, true);

    var unlisten;
    try {
      unlisten = await getTauri().event.listen('organize-progress', function(event) {
        var payload = event.payload;
        progressBar.value = payload.percent;
        statusText.innerText = t('processing') + ' ' + payload.processed + '/' + payload.total + '…';
      });
    } catch (err) {
      setBusy(organizeBtn, false);
      setError('Failed to listen for progress events: ' + (err.message || err));
      return;
    }

    try {
      var plan = await tauriInvoke('organize_files', { options: {
        sourcePath: sourcePath,
        destPath: destPath,
        deleteOriginals: deleteOriginals,
        skipHidden: skipHidden,
        skipDSStore: skipDSStore,
        fileFilter: fileFilter,
        organizeRules: organizeRules,
        useNumericMonths: document.getElementById('useNumericMonths').checked,
        createOtherFolder: document.getElementById('createOtherFolder').checked,
        dryRun: false
      } });

      unlisten();
      setStatus(t('completed') + ': ' + plan.length + ' ' + t('filesProcessed'), 100);
      setBusy(organizeBtn, false);

      var previewList = document.getElementById('previewList');
      if (previewList) {
        renderPreview(plan, destPath);
      }
    } catch (err) {
      unlisten();
      setBusy(organizeBtn, false);
      // error already shown by tauriInvoke
    }
  });

  // Preview sort dropdown
  var sortBy = document.getElementById('preview-sort');
  if (sortBy) {
    sortBy.addEventListener('change', function() {
      var sourcePath = document.getElementById('sourcePath').innerText;
      var destPath = document.getElementById('destPath').innerText;
      if (sourcePath && sourcePath !== t('noFolder') &&
          destPath && destPath !== t('noFolder')) {
        generatePreview(sourcePath, destPath);
      }
    });
  }

  // Collapsible folders — event delegation on the tree container
  var previewList = document.getElementById('previewList');
  if (previewList) {
    previewList.addEventListener('click', function(e) {
      var expander = e.target.closest('.expander');
      if (!expander) return;
      var folderRow = expander.closest('.tree-row');
      var li = folderRow.closest('li');
      var childUl = li.querySelector(':scope > ul');
      if (!childUl) return;
      var collapsed = childUl.classList.toggle('collapsed');
      expander.classList.toggle('collapsed', collapsed);
    });
  }
}

// ── Preview generation ────────────────────────────────────────────

async function generatePreview(sourcePath, destPath) {
  setStatus(t('generatingPreview'));
  var previewList = document.getElementById('previewList');
  if (previewList) {
    previewList.innerHTML = '';
  }

  var deleteOriginals = document.getElementById('deleteOriginals').checked;
  var skipHidden = document.getElementById('skipHidden').checked;
  var skipDSStore = document.getElementById('skipDSStore').checked;
  var fileFilter = getFileFilterTags();

  var organizeRules = localStorage.getItem('organizeRules') ?
    JSON.parse(localStorage.getItem('organizeRules')) : null;

  try {
    var plan = await tauriInvoke('organize_files', { options: {
      sourcePath: sourcePath,
      destPath: destPath,
      deleteOriginals: deleteOriginals,
      skipHidden: skipHidden,
      skipDSStore: skipDSStore,
      fileFilter: fileFilter,
      organizeRules: organizeRules,
      useNumericMonths: document.getElementById('useNumericMonths').checked,
      createOtherFolder: document.getElementById('createOtherFolder').checked,
      dryRun: true
    } });

    renderPreview(plan, destPath);
    setStatus(t('previewReady'));
  } catch (err) {
    console.error('Preview error:', err);
    setError('Preview failed: ' + (err.message || err));
  }
}

// ── Tree rendering ─────────────────────────────────────────────────

function renderPreview(plan, destPath) {
  var previewList = document.getElementById('previewList');
  if (!previewList) {
    console.error('Preview list element not found');
    return;
  }

  previewList.innerHTML = '';

  if (!Array.isArray(plan) || plan.length === 0) {
    previewList.innerHTML = '<div class="tree-row file-row"><span class="material-symbols-outlined tree-icon">info</span><span class="tree-label">' + t('noFiles') + '</span></div>';
    return;
  }

  var allSkipped = plan.every(function(item) { return item.skipped; });
  if (allSkipped) {
    previewList.innerHTML = '<div class="tree-row file-row"><span class="material-symbols-outlined tree-icon">visibility_off</span><span class="tree-label">' + t('allFiltered') + '</span></div>';
    return;
  }

  var normDest = destPath;
  while (normDest.endsWith('/') || normDest.endsWith('\\')) {
    normDest = normDest.slice(0, -1);
  }
  var rootChildren = [];
  var folderMap = {};

  for (var i = 0; i < plan.length; i++) {
    var item = plan[i];
    var dest = (item.destination || item.source).replace(/\\/g, '/');
    var relPath = dest;
    if (dest.indexOf(normDest + '/') === 0) {
      relPath = dest.substring(normDest.length + 1);
    } else if (dest.indexOf(normDest) === 0) {
      relPath = dest.substring(normDest.length);
      if (relPath.charAt(0) === '/') relPath = relPath.substring(1);
    }

    var segments = relPath.split('/').filter(function(s) { return s; });
    if (segments.length === 0) continue;

    var fileName = segments.pop();
    var currentPath = '';
    var parentChildren = rootChildren;

    for (var j = 0; j < segments.length; j++) {
      var seg = segments[j];
      currentPath = currentPath ? currentPath + '/' + seg : seg;
      if (!folderMap[currentPath]) {
        var folder = { type: 'folder', name: seg, children: [] };
        folderMap[currentPath] = folder;
        parentChildren.push(folder);
      }
      parentChildren = folderMap[currentPath].children;
    }

    parentChildren.push({
      type: 'file',
      name: fileName,
      skipped: item.skipped || false,
      reason: item.reason || '',
      created: item.created || null,
      children: []
    });
  }

  // Prune folders where ALL children are skipped
  function pruneSkippedFolders(children) {
    var kept = [];
    for (var k = 0; k < children.length; k++) {
      var child = children[k];
      if (child.type === 'folder') {
        child.children = pruneSkippedFolders(child.children);
        var hasVisible = child.children.some(function(c) {
          return !c.skipped || (c.type === 'folder' && c.children.length > 0);
        });
        if (hasVisible) {
          kept.push(child);
        }
      } else {
        kept.push(child);
      }
    }
    return kept;
  }
  var prunedChildren = pruneSkippedFolders(rootChildren);

  function markAllSkippedFolders(children) {
    for (var m = 0; m < children.length; m++) {
      var c = children[m];
      if (c.type === 'folder') {
        markAllSkippedFolders(c.children);
        if (c.children.length > 0) {
          c.allSkipped = c.children.every(function(ch) {
            return ch.skipped || ch.allSkipped;
          });
        }
      }
    }
  }
  markAllSkippedFolders(prunedChildren);

  function computeFolderTimes(children) {
    for (var t = 0; t < children.length; t++) {
      var child = children[t];
      if (child.type === 'folder') {
        computeFolderTimes(child.children);
        var inner = [];
        for (var ci = 0; ci < child.children.length; ci++) {
          var c = child.children[ci];
          var ct = c.folderCreatedMax || c.folderCreatedMin || c.created;
          if (ct) inner.push(ct);
        }
        if (inner.length > 0) {
          inner.sort();
          child.folderCreatedMin = inner[0];
          child.folderCreatedMax = inner[inner.length - 1];
        }
      }
    }
  }
  computeFolderTimes(prunedChildren);

  var sortBy = document.getElementById('preview-sort');
  var sortMode = sortBy ? sortBy.value : 'name-asc';

  function naturalCompare(a, b) {
    var re = /(\d+)|(\D+)/g;
    var aParts = (a || '').match(re) || [];
    var bParts = (b || '').match(re) || [];
    for (var p = 0; p < Math.min(aParts.length, bParts.length); p++) {
      var aIsNum = /^\d+$/.test(aParts[p]);
      var bIsNum = /^\d+$/.test(bParts[p]);
      if (aIsNum && bIsNum) {
        var diff = parseInt(aParts[p], 10) - parseInt(bParts[p], 10);
        if (diff !== 0) return diff;
      } else if (aIsNum) return -1;
      else if (bIsNum) return 1;
      else {
        var cmp = aParts[p].localeCompare(bParts[p]);
        if (cmp !== 0) return cmp;
      }
    }
    return aParts.length - bParts.length;
  }

  function sortChildren(children) {
    children.sort(function(a, b) {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;

      if (sortMode === 'name-asc') {
        return naturalCompare(a.name.toLowerCase(), b.name.toLowerCase());
      } else if (sortMode === 'name-desc') {
        return naturalCompare(b.name.toLowerCase(), a.name.toLowerCase());
      } else if (sortMode === 'time-desc') {
        var aTime = a.folderCreatedMax || a.created || '';
        var bTime = b.folderCreatedMax || b.created || '';
        if (!aTime && !bTime) return 0;
        if (!aTime) return 1;
        if (!bTime) return -1;
        return bTime.localeCompare(aTime);
      } else if (sortMode === 'time-asc') {
        var aTimeAsc = a.folderCreatedMin || a.created || '';
        var bTimeAsc = b.folderCreatedMin || b.created || '';
        if (!aTimeAsc && !bTimeAsc) return 0;
        if (!aTimeAsc) return 1;
        if (!bTimeAsc) return -1;
        return aTimeAsc.localeCompare(bTimeAsc);
      }
      return 0;
    });

    children.forEach(function(child) {
      if (child.children && child.children.length > 0) {
        sortChildren(child.children);
      }
    });
  }
  sortChildren(prunedChildren);

  // Render tree as nested <ul>/<li> matching CSS pseudo-elements
  function renderTree(children) {
    var html = '<ul>';
    for (var ri = 0; ri < children.length; ri++) {
      var child = children[ri];
      html += '<li>';
      if (child.type === 'folder') {
        var hasKids = child.children && child.children.length > 0;
        var folderClass = 'tree-row folder-row';
        if (child.allSkipped) folderClass += ' all-skipped';
        html += '<div class="' + folderClass + '">';
        // Expander chevron
        if (hasKids) {
          html += '<span class="expander material-symbols-outlined">chevron_right</span>';
        } else {
          html += '<span class="expander" style="visibility:hidden"></span>';
        }
        html += '<span class="material-symbols-outlined tree-icon">folder</span>' +
          '<span class="tree-label">' + child.name + '</span>' +
        '</div>';
        html += renderTree(child.children);
      } else {
        var fileClass = 'tree-row file-row';
        if (child.skipped) fileClass += ' skipped';
        var icon = child.skipped ? 'visibility_off' : 'description';
        var extra = '';
        if (child.skipped && child.reason) {
          extra = ' <span class="tree-meta">' + child.reason + '</span>';
        } else if (child.created) {
          var formatted = formatTimestamp(child.created);
          if (formatted) {
            extra = ' <span class="tree-meta">' + formatted + '</span>';
          }
        }
        html += '<div class="' + fileClass + '">' +
          '<span class="expander" style="visibility:hidden"></span>' +
          '<span class="material-symbols-outlined tree-icon">' + icon + '</span>' +
          '<span class="tree-label">' + child.name + '</span>' + extra +
        '</div>';
      }
      html += '</li>';
    }
    html += '</ul>';
    return html;
  }

  // Wrap in root folder showing the destination name
  var rootName = getBaseName(destPath) || 'Destination';
  var rootFolder = { type: 'folder', name: rootName, children: prunedChildren, allSkipped: false };
  previewList.innerHTML = renderTree([rootFolder]);
}
