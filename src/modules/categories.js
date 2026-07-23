// ═══════════════════════════════════════════════════════════════
// CATEGORIES — Custom file categories, extensions, overlap
// ═══════════════════════════════════════════════════════════════

// ── Deterministic slug-based ID generator ──────────────
function generateCategoryId(name) {
  // Converts "My Photos 2026!" to "dynamic-my-photos-2026"
  // Pure function: same name always yields the same ID (no DOM checks).
  var slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!slug) slug = 'category';
  return 'dynamic-' + slug;
}

// Track which default extension tags the user has removed
var removedDefaultTags = { documents: [], media: [], archives: [] };

function addCustomCategory(name, extensions) {
  if (!name || !name.trim()) {
    statusText.innerText = t('pleaseEnterName');
    return;
  }

  name = name.trim();

  // Deterministic slug ID based on name (no counters)
  var categoryValue = generateCategoryId(name);

  var container = document.getElementById('custom-categories-container');
  if (container) container.classList.remove('hidden');

  var presetList = document.getElementById('preset-file-types');
  if (!presetList) return;

  // Parse optional initial extensions
  var extList = [];
  if (extensions && extensions.trim()) {
    extList = extensions.split(',').map(function(e) {
      e = e.trim().toLowerCase();
      return e.startsWith('.') ? e : '.' + e;
    }).filter(Boolean);
  }

  // Create preset category row
  var presetRow = document.createElement('div');
  presetRow.className = 'preset-category';
  presetRow.setAttribute('data-category', categoryValue);
  presetRow.id = 'category-row-' + categoryValue;
  presetRow.innerHTML =
    '<label class="check-label">' +
      '<input type="checkbox" name="file-type" value="' + categoryValue + '" checked>' +
      '<span class="check-mark material-symbols-outlined">done</span>' +
      '<span class="check-text">' + name + '</span>' +
    '</label>' +
    '<button type="button" class="icon-btn rename-preset-category" title="Rename">' +
      '<span class="material-symbols-outlined">edit</span>' +
    '</button>' +
    '<button type="button" class="icon-btn remove-preset-category" title="Remove">' +
      '<span class="material-symbols-outlined">delete</span>' +
    '</button>';

  presetList.appendChild(presetRow);

  // Create custom options container (match static HTML pattern)
  var optionsContainer = document.createElement('div');
  optionsContainer.className = 'custom-options-container custom-options-container-' + categoryValue;
  optionsContainer.style.display = 'block';
  optionsContainer.innerHTML =
    '<div class="custom-option-input">' +
      '<input type="text" class="custom-option-field" data-filetype="' + categoryValue + '" placeholder="Add extension (e.g. .xyz)">' +
      '<button type="button" class="btn btn-tiny add-custom-option" data-filetype="' + categoryValue + '">Add</button>' +
    '</div>' +
    '<div class="custom-options-list" id="custom-options-list-' + categoryValue + '"></div>';

  presetRow.after(optionsContainer);

  // Attach direct change listener to the dynamically created checkbox
  var dynCheckbox = presetRow.querySelector('input[type="checkbox"]');
  if (dynCheckbox) {
    dynCheckbox.addEventListener('change', function() {
      var container = document.querySelector('.custom-options-container-' + this.value);
      if (container) {
        container.style.display = this.checked ? 'block' : 'none';
      }
      console.log('[Categories] checkbox change:', this.value, 'checked:', this.checked);
      if (typeof saveRulesAndPreview === 'function') saveRulesAndPreview(true);
    });
  }

  // Add default tags
  var listEl = document.getElementById('custom-options-list-' + categoryValue);
  extList.forEach(function(ext) {
    var tag = document.createElement('span');
    tag.className = 'custom-option-tag';
    tag.setAttribute('data-value', ext);
    tag.innerHTML = ext + '<button type="button" class="remove-custom-option-tag" data-value="' + ext + '" title="Remove">&times;</button>';
    listEl.appendChild(tag);
  });

  // Wire Enter key on the new input field
  var inputField = optionsContainer.querySelector('.custom-option-field');
  if (inputField) {
    inputField.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addCustomOption(categoryValue, this.value);
        this.value = '';
      }
    });
  }

  saveRulesAndPreview(true);
}
function addCustomCategorySilent(name, extensions, categoryValue) {
  if (!name || !name.trim()) return;
  name = name.trim();

  // Deterministic slug ID — always derived from the name.
  // The categoryValue parameter is kept for backward compat but the slug
  // from the name is authoritative (guarantees same ID across all tasks).
  var finalCategoryValue = generateCategoryId(name);

  var container = document.getElementById('custom-categories-container');
  if (container) container.classList.remove('hidden');

  var presetList = document.getElementById('preset-file-types');
  if (!presetList) return;

  var extList = [];
  if (extensions && extensions.trim()) {
    extList = extensions.split(',').map(function(e) {
      e = e.trim().toLowerCase();
      return e.startsWith('.') ? e : '.' + e;
    }).filter(Boolean);
  }

  var presetRow = document.createElement('div');
  presetRow.className = 'preset-category';
  presetRow.setAttribute('data-category', finalCategoryValue);
  presetRow.id = 'category-row-' + categoryValue;
  presetRow.innerHTML =
    '<label class="check-label">' +
      '<input type="checkbox" name="file-type" value="' + finalCategoryValue + '" checked>' +
      '<span class="check-mark material-symbols-outlined">done</span>' +
      '<span class="check-text">' + name + '</span>' +
    '</label>' +
    '<button type="button" class="icon-btn rename-preset-category" title="Rename">' +
      '<span class="material-symbols-outlined">edit</span>' +
    '</button>' +
    '<button type="button" class="icon-btn remove-preset-category" title="Remove">' +
      '<span class="material-symbols-outlined">delete</span>' +
    '</button>';

  presetList.appendChild(presetRow);

  var optionsContainer = document.createElement('div');
  optionsContainer.className = 'custom-options-container custom-options-container-' + finalCategoryValue;
  optionsContainer.style.display = 'block';
  optionsContainer.innerHTML =
    '<div class="custom-option-input">' +
      '<input type="text" class="custom-option-field" data-filetype="' + finalCategoryValue + '" placeholder="Add extension (e.g. .xyz)">' +
      '<button type="button" class="btn btn-tiny add-custom-option" data-filetype="' + finalCategoryValue + '">Add</button>' +
    '</div>' +
    '<div class="custom-options-list" id="custom-options-list-' + finalCategoryValue + '"></div>';

  presetRow.after(optionsContainer);

  var listEl = document.getElementById('custom-options-list-' + finalCategoryValue);
  extList.forEach(function(ext) {
    var tag = document.createElement('span');
    tag.className = 'custom-option-tag';
    tag.setAttribute('data-value', ext);
    tag.innerHTML = ext + '<button type="button" class="remove-custom-option-tag" data-value="' + ext + '" title="Remove">&times;</button>';
    listEl.appendChild(tag);
  });

  var inputField = optionsContainer.querySelector('.custom-option-field');
  if (inputField) {
    inputField.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addCustomOption(finalCategoryValue, this.value);
        this.value = '';
      }
    });
  }
}

// ── Global custom category persistence ──────────────────────
function saveGlobalCategories() {
  // Never save when not in an active task (home page has cleared DOM)
  if (typeof currentTaskId === 'undefined' || !currentTaskId) return;
  if (typeof isRestoringUI !== 'undefined' && isRestoringUI) return;
  var cats = [];
  document.querySelectorAll('.preset-category[data-category^="dynamic-"]').forEach(function(row) {
    var cat = row.getAttribute('data-category');
    var name = row.querySelector('.check-text');
    var cb = row.querySelector('input[type="checkbox"]');
    var container = document.querySelector('.custom-options-container-' + cat);
    var exts = [];
    if (container) {
      container.querySelectorAll('.custom-option-tag').forEach(function(tag) {
        exts.push(tag.getAttribute('data-value'));
      });
    }
    cats.push({
      id: cat,
      name: name ? name.textContent.trim() : cat,
      isChecked: cb ? cb.checked : false,
      extensions: exts
    });
  });
  localStorage.setItem('morganized-global-categories', JSON.stringify(cats));
  console.log('[Categories] saveGlobal:', JSON.stringify(cats.map(function(c){ return c.id + ':' + c.isChecked; })));
}

function loadGlobalCategories() {
  try {
    var raw = JSON.parse(localStorage.getItem('morganized-global-categories') || '[]');
  } catch(e) { raw = []; }
  // Support old format (object) and new format (array)
  var cats = Array.isArray(raw) ? raw : [];
  if (!Array.isArray(raw) && typeof raw === 'object') {
    for (var k in raw) {
      cats.push({ id: k, name: raw[k].name || k, isChecked: true, extensions: raw[k].extensions || [] });
    }
  }
  var created = [];
  var skipped = [];
  cats.forEach(function(cat) {
    // Deterministic slug ID from the stored name (backward compat: also try legacy cat.id)
    var slugId = generateCategoryId(cat.name);
    // If a row with this slug already exists in the DOM, skip
    if (document.querySelector('.preset-category[data-category="' + slugId + '"]')) {
      skipped.push(slugId);
      return;
    }
    // Also check legacy ID (in case the stored id differs from the slug)
    if (cat.id && cat.id !== slugId && document.querySelector('.preset-category[data-category="' + cat.id + '"]')) {
      skipped.push(cat.id);
      return;
    }
    // Pass the legacy id so addCustomCategorySilent can reuse an existing row
    addCustomCategorySilent(cat.name, (cat.extensions || []).join(','), cat.id || slugId);
    created.push(slugId + ':' + (cat.isChecked !== false));
    // Find the created row (by slug first, then by legacy id)
    var row = document.querySelector('.preset-category[data-category="' + slugId + '"]');
    if (!row && cat.id) {
      row = document.querySelector('.preset-category[data-category="' + cat.id + '"]');
    }
    if (row) {
      var cb = row.querySelector('input[type="checkbox"]');
      if (cb) cb.checked = cat.isChecked !== false;
      var container = document.querySelector('.custom-options-container-' + row.getAttribute('data-category'));
      if (container) container.style.display = cat.isChecked !== false ? 'block' : 'none';
    }
  });
  if (created.length || skipped.length) {
    console.log("[Categories] loadGlobal: created=" + JSON.stringify(created) + " skipped=" + JSON.stringify(skipped));
  }
}

function addCustomOptionForField(inputField, fileTypeValue) {
  var val = inputField.value.trim();
  if (!val) return;
  if (!val.startsWith('.')) val = '.' + val;
  val = val.toLowerCase();

  var listContainer = document.getElementById('custom-options-list-' + fileTypeValue);
  if (!listContainer) return;

  // Check duplicates
  var existingTags = listContainer.querySelectorAll('.custom-option-tag');
  for (var ei = 0; ei < existingTags.length; ei++) {
    if (existingTags[ei].getAttribute('data-value') === val) return;
  }

  var tag = document.createElement('span');
  tag.className = 'custom-option-tag';
  tag.setAttribute('data-value', val);
  tag.innerHTML = val + '<button type="button" class="remove-custom-option-tag" data-value="' + val + '" title="Remove">&times;</button>';
  listContainer.appendChild(tag);
  inputField.value = '';
  saveRulesAndPreview(true);
}

function showDefaultTags(fileType) {
  var defaults = {
    documents: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'],
    media: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.mp4', '.avi', '.mov', '.mp3', '.wav'],
    archives: ['.zip', '.rar', '.tar', '.gz', '.7z']
  };
  var exts = defaults[fileType];
  if (!exts) return;
  var listContainer = document.getElementById('custom-options-list-' + fileType);
  if (!listContainer) return;
  // Remove existing defaults before re-rendering
  var existingDefaults = listContainer.querySelectorAll('.custom-option-tag[data-default]');
  existingDefaults.forEach(function(el) { el.remove(); });
  // Ensure tracking array exists
  if (!removedDefaultTags[fileType]) removedDefaultTags[fileType] = [];
  var disabled = removedDefaultTags[fileType];
  exts.forEach(function(ext) {
    var isDisabled = disabled.indexOf(ext) !== -1;
    var tag = document.createElement('span');
    tag.className = 'custom-option-tag';
    tag.setAttribute('data-value', ext);
    // data-default="true" = disabled (dotted), data-default="false" = enabled (solid)
    tag.setAttribute('data-default', isDisabled ? 'true' : 'false');
    tag.innerHTML = ext + '<button type="button" class="remove-custom-option-tag" data-value="' + ext + '" title="' + (isDisabled ? 'Enable' : 'Disable') + '">&times;</button>';
    listContainer.appendChild(tag);
  });
}

function addCustomOption(fileType, optionValue) {
  if (!optionValue.trim()) return;
  if (!optionValue.startsWith('.')) optionValue = '.' + optionValue;
  var val = optionValue.toLowerCase();
  var listContainer = document.getElementById('custom-options-list-' + fileType);
  if (!listContainer) return;
  var existingTags = listContainer.querySelectorAll('.custom-option-tag');
  for (var ei = 0; ei < existingTags.length; ei++) {
    if (existingTags[ei].getAttribute('data-value') === val) return;
  }
  var tag = document.createElement('span');
  tag.className = 'custom-option-tag';
  tag.setAttribute('data-value', val);
  tag.innerHTML = val + '<button type="button" class="remove-custom-option-tag" data-value="' + val + '" title="Remove">&times;</button>';
  listContainer.appendChild(tag);
  saveRulesAndPreview(true);
}

function checkOverlappingExtensions() {
  var overlapWarn = document.getElementById('overlapWarning');
  if (!overlapWarn) return;

  var extMap = {};
  var defaults = {
    documents: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'],
    media: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.mp4', '.avi', '.mov', '.mp3', '.wav'],
    archives: ['.zip', '.rar', '.tar', '.gz', '.7z']
  };

  var checkedCbs = document.querySelectorAll('input[name="file-type"]:checked');
  checkedCbs.forEach(function(cb) {
    var row = cb.closest('.preset-category');
    var nameSpan = row ? (row.querySelector('.check-text') || row.querySelector('.category-name')) : null;
    var displayName = nameSpan ? nameSpan.textContent.trim() : cb.value;

    var exts = [];
    if (defaults[cb.value]) {
      var defs = defaults[cb.value].slice();
      // Filter out user-removed defaults
      if (removedDefaultTags[cb.value]) {
        defs = defs.filter(function(e) { return removedDefaultTags[cb.value].indexOf(e) === -1; });
      }
      exts = exts.concat(defs);
    }
    var listEl = document.getElementById('custom-options-list-' + cb.value);
    if (listEl) {
      var tags = listEl.querySelectorAll('.custom-option-tag');
      tags.forEach(function(t) { exts.push(t.getAttribute('data-value')); });
    }

    exts.forEach(function(ext) {
      if (!extMap[ext]) extMap[ext] = [];
      extMap[ext].push({ value: cb.value, name: displayName });
    });
  });

  var overlaps = [];
  for (var ext in extMap) {
    // Deduplicate by category value so self-overlaps (default + custom tag in same category) are ignored
    var entries = extMap[ext];
    var seen = {};
    var unique = [];
    entries.forEach(function(entry) {
      if (!seen[entry.value]) {
        seen[entry.value] = true;
        unique.push(entry);
      }
    });
    if (unique.length > 1) {
      overlaps.push({ ext: ext, categories: unique });
    }
  }

  if (overlaps.length > 0) {
    var lines = [];
    overlaps.forEach(function(o) {
      var catNames = o.categories.map(function(c) { return '"' + c.name + '"'; }).join(' and ');
      lines.push('<b>' + o.ext + '</b> is in both ' + catNames + t('filesGoToFirst'));
    });
    overlapWarn.innerHTML = '&#x26A0; ' + lines.join('<br>');
    overlapWarn.style.display = 'block';
  } else {
    overlapWarn.innerHTML = '';
    overlapWarn.style.display = 'none';
  }
}

function initCategories() {
  // ── Add Category: show/hide form ──────────────────────
  var addCategoryBtn = document.getElementById('add-custom-category-btn');
  var addCategoryForm = document.getElementById('addCategoryForm');
  var addCategoryConfirm = document.getElementById('addCategoryConfirm');
  var addCategoryCancel = document.getElementById('addCategoryCancel');
  var nameInput = document.getElementById('custom-category-name');
  var extInput = document.getElementById('custom-category-extensions');

  if (addCategoryBtn && addCategoryForm) {
    addCategoryBtn.addEventListener('click', function() {
      addCategoryForm.style.display = addCategoryForm.style.display === 'none' ? '' : 'none';
      if (addCategoryForm.style.display !== 'none') {
        if (nameInput) nameInput.focus();
      }
    });
  }
  if (addCategoryConfirm) {
    addCategoryConfirm.addEventListener('click', function() {
      if (nameInput && nameInput.value.trim()) {
        addCustomCategory(nameInput.value);
        nameInput.value = '';
        if (addCategoryForm) addCategoryForm.style.display = 'none';
      }
    });
  }
  if (addCategoryCancel && addCategoryForm) {
    addCategoryCancel.addEventListener('click', function() {
      addCategoryForm.style.display = 'none';
    });
  }
  // Enter in name input triggers confirm
  if (nameInput) {
    nameInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); if (addCategoryConfirm) addCategoryConfirm.click(); }
    });
  }

  // ── Event delegation: rename, remove, add extension, blur ──
  document.addEventListener('click', function(e) {
    // Add custom extension via "Add" button
    var addBtn = e.target.closest('.add-custom-option');
    if (addBtn) {
      e.stopPropagation();
      var filetype = addBtn.getAttribute('data-filetype');
      var input = addBtn.parentElement.querySelector('.custom-option-field');
      if (input && filetype) {
        addCustomOption(filetype, input.value);
        input.value = '';
      }
      return;
    }

    // Rename category — swap text span for an input field
    if (e.target.closest('.rename-preset-category')) {
      e.stopPropagation();
      var presetCategory = e.target.closest('.preset-category');
      var checkboxText = presetCategory.querySelector('.check-text');
      if (!checkboxText || checkboxText.querySelector('input')) return; // already editing
      var currentName = checkboxText.textContent.trim();
      var input = document.createElement('input');
      input.type = 'text';
      input.value = currentName;
      input.className = 'category-rename-input';
      input.style.cssText = 'font:inherit;color:inherit;background:transparent;border:none;border-bottom:1px solid var(--border);outline:none;padding:0;margin:0;width:180px;';
      checkboxText.textContent = '';
      checkboxText.appendChild(input);
      input.focus();
      input.select();

      function commit() {
        var newName = input.value.trim();
        if (newName && newName !== currentName) {
          checkboxText.textContent = newName;
        } else {
          checkboxText.textContent = currentName;
        }
        saveRulesAndPreview(true);
      }
      function cancel() {
        checkboxText.textContent = currentName;
      }

      input.addEventListener('keydown', function(ev) {
        if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
        else if (ev.key === 'Escape') { ev.preventDefault(); cancel(); }
      });
      input.addEventListener('blur', function() { commit(); });
      return;
    }

    // Remove category
    if (e.target.closest('.remove-preset-category')) {
      e.stopPropagation();
      var presetCategory = e.target.closest('.preset-category');
      var categoryValue = presetCategory.getAttribute('data-category');
      // Prevent removing default categories (documents, media, archives)
      if (categoryValue && categoryValue.indexOf('dynamic-') !== 0) return;
      var checkbox = presetCategory.querySelector('input[type="checkbox"]');
      if (checkbox) checkbox.checked = false;

      // Find and remove the options container (try class selector, then next sibling)
      var optionsContainer = document.querySelector('.custom-options-container-' + categoryValue);
      if (!optionsContainer) {
        // Fallback: find next sibling that is a custom-options-container
        var next = presetCategory.nextElementSibling;
        if (next && next.classList.contains('custom-options-container')) {
          optionsContainer = next;
        }
      }
      if (optionsContainer) optionsContainer.remove();
      presetCategory.remove();

      // Slug-based IDs don't need recycling — no-op
      saveRulesAndPreview(true);
      return;
    }

    // Remove custom option tag (or toggle default tag)
    if (e.target.classList.contains('remove-custom-option-tag')) {
      var tagEl = e.target.parentElement;
      // Default tags toggle between enabled/disabled instead of being removed
      if (tagEl.hasAttribute('data-default')) {
        var ext = tagEl.getAttribute('data-value');
        var listContainer = tagEl.parentElement;
        if (listContainer && listContainer.id) {
          var catId = listContainer.id.replace('custom-options-list-', '');
          if (removedDefaultTags[catId]) {
            var idx = removedDefaultTags[catId].indexOf(ext);
            if (idx === -1) {
              // Disable: add to tracking, set dotted
              removedDefaultTags[catId].push(ext);
              tagEl.setAttribute('data-default', 'true');
              tagEl.querySelector('.remove-custom-option-tag').title = 'Enable';
            } else {
              // Enable: remove from tracking, set solid
              removedDefaultTags[catId].splice(idx, 1);
              tagEl.setAttribute('data-default', 'false');
              tagEl.querySelector('.remove-custom-option-tag').title = 'Disable';
            }
          }
        }
        saveRulesAndPreview(true);
        return;
      }
      // Non-default (custom) tags: remove as before
      tagEl.remove();
      saveRulesAndPreview(true);
      return;
    }

    // (Rename now uses <input> — blur handled by input's own blur event)
  });

  // ── Checkbox change — show/hide custom options ────────
  document.addEventListener('change', function(e) {
    if (e.target.matches('input[name="file-type"]')) {
      var presetCategory = e.target.closest('.preset-category');
      if (!presetCategory) return;
      var categoryValue = presetCategory.getAttribute('data-category');
      var optionsContainer = document.querySelector('.custom-options-container-' + categoryValue);
      if (optionsContainer) {
        if (e.target.checked) {
          optionsContainer.style.display = 'block';
          showDefaultTags(categoryValue);
        } else {
          optionsContainer.style.display = 'none';
        }
      }
      saveRulesAndPreview(true);
    }
  });

  // ── Wire Enter key on all custom-option-field inputs ──
  document.querySelectorAll('.custom-option-field').forEach(function(field) {
    var filetype = field.getAttribute('data-filetype');
    if (!filetype) return;
    field.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addCustomOption(filetype, this.value);
        this.value = '';
      }
    });
  });
}
