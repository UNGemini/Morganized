// ═══════════════════════════════════════════════════════════════
// RULES — Form data collection, persistence, preview trigger
// ═══════════════════════════════════════════════════════════════


var isRestoringUI = false;
function collectFormData() {
  var formData = {};

  formData.timeToggle = document.getElementById('toggle-time-org').checked;
  formData.fileTypeToggle = document.getElementById('toggle-file-types').checked;

  formData.timeOptions = [];
  document.querySelectorAll('input[name="time-option"]:checked').forEach(function(cb) {
    formData.timeOptions.push(cb.value);
  });

  formData.fileTypes = [];
  document.querySelectorAll('input[name="file-type"]:checked').forEach(function(cb) {
    formData.fileTypes.push(cb.value);
  });

  // Custom categories — Map-based dedup (checked wins on collision)
  var catsMap = {};
  document.querySelectorAll('.preset-category[data-category^="dynamic-"]').forEach(function(row) {
    var cat = row.getAttribute('data-category');
    var name = row.querySelector('.check-text');
    var cb = row.querySelector('input[type="checkbox"]');
    var isChecked = cb ? cb.checked : false;
    var container = document.querySelector('.custom-options-container-' + cat);
    var exts = [];
    if (container) {
      container.querySelectorAll('.custom-option-tag').forEach(function(tag) {
        exts.push(tag.getAttribute('data-value'));
      });
    }
    // Dedup: only store if new ID, or if current node is checked (checked wins)
    if (!catsMap[cat] || isChecked) {
      catsMap[cat] = {
        id: cat,
        name: name ? name.textContent.trim() : cat,
        isChecked: isChecked,
        extensions: exts
      };
    }
  });
  formData.customCategories = [];
  for (var k in catsMap) {
    formData.customCategories.push(catsMap[k]);
  }
  console.log('[Categories] collectFormData:', JSON.stringify(formData.customCategories.map(function(c){ return c.id + ':' + c.isChecked; })));

  // Custom file options (legacy format, for backward compat)
  formData.customFileOptions = {};
  document.querySelectorAll('.custom-options-list').forEach(function(list) {
    if (list.id === 'fileFilterTags') return;
    var fileType = list.id.replace('custom-options-list-', '');
    var tags = list.querySelectorAll('.custom-option-tag');
    formData.customFileOptions[fileType] = [];
    tags.forEach(function(tag) {
      formData.customFileOptions[fileType].push(tag.getAttribute('data-value'));
    });
  });

  // File type names — default categories handled by language, custom names saved
  var saveTranslated = localStorage.getItem('morganized-save-default-cats-english') === '1';
  formData.fileTypeNames = {};
  document.querySelectorAll('.preset-category .check-text').forEach(function(el) {
    var preset = el.closest('.preset-category');
    var category = preset.getAttribute('data-category');
    if (category && el.textContent.trim() && !formData.fileTypeNames[category]) {
      var isDefault = category === 'documents' || category === 'media' || category === 'archives';
      var currentName = el.textContent.trim();
      if (isDefault) {
        if (currentName !== t(category)) {
          // User renamed this default category — always save custom name
          formData.fileTypeNames[category] = currentName;
        } else if (saveTranslated) {
          // Setting on: save translated name so folder follows UI language
          formData.fileTypeNames[category] = t(category);
        }
        // Otherwise: don't save — Rust falls back to English
      } else {
        // Dynamic/user-created category — always save
        formData.fileTypeNames[category] = currentName;
      }
    }
  });

  // Time custom names
  var yearName = document.getElementById('time-year-name');
  var monthName = document.getElementById('time-month-name');
  var weekName = document.getElementById('time-week-name');
  var dayName = document.getElementById('time-day-name');
  if (yearName && yearName.value.trim()) formData.yearCustomName = yearName.value.trim();
  if (monthName && monthName.value.trim()) formData.monthCustomName = monthName.value.trim();
  if (weekName && weekName.value.trim()) formData.weekCustomName = weekName.value.trim();
  if (dayName && dayName.value.trim()) formData.dayCustomName = dayName.value.trim();

  // Date range
  var startDate = document.getElementById('start-date');
  var endDate = document.getElementById('end-date');
  if (startDate && startDate.value) formData.startDate = startDate.value;
  if (endDate && endDate.value) formData.endDate = endDate.value;

  // Time range — always collect (clears if empty)
  var startTime = document.getElementById('start-time');
  var endTime = document.getElementById('end-time');
  if (startTime) {
    var raw = startTime.getAttribute("data-time-raw") || clampTimeValue(getRawTime(startTime.value));
    formData.startTime = raw || undefined;
  }
  if (endTime) {
    var raw = endTime.getAttribute("data-time-raw") || clampTimeValue(getRawTime(endTime.value));
    formData.endTime = raw || undefined;
  }

  // Excluded days
  formData.excludedDays = [];
  document.querySelectorAll('input[name="excluded-days"]:checked').forEach(function(cb) {
    formData.excludedDays.push(cb.value);
  });

  // Excluded specific dates
  var dateTags = document.querySelectorAll('#exclude-dates-list .custom-option-tag');
  if (dateTags.length > 0) {
    formData.excludedSpecificDates = [];
    dateTags.forEach(function(tag) {
      formData.excludedSpecificDates.push(tag.getAttribute('data-date'));
    });
  }

  formData.useNumericMonths = document.getElementById('useNumericMonths').checked;

  // Removed default extension tags
  formData.removedDefaultTags = {};
  for (var cat in removedDefaultTags) {
    if (removedDefaultTags[cat] && removedDefaultTags[cat].length > 0) {
      formData.removedDefaultTags[cat] = removedDefaultTags[cat].slice();
    }
  }

  // File filter tags
  formData.fileFilter = [];
  document.querySelectorAll('#fileFilterTags .custom-option-tag').forEach(function(tag) {
    formData.fileFilter.push(tag.getAttribute('data-value'));
  });

  // File operations
  var deleteOriginals = document.getElementById('deleteOriginals');
  var skipHidden = document.getElementById('skipHidden');
  var skipDSStore = document.getElementById('skipDSStore');
  formData.deleteOriginals = deleteOriginals ? deleteOriginals.checked : false;
  formData.skipHidden = skipHidden ? skipHidden.checked : false;
  formData.skipDSStore = skipDSStore ? skipDSStore.checked : false;

  // Create Other folder for unmatched files
  var createOtherFolder = document.getElementById('createOtherFolder');
  formData.createOtherFolder = createOtherFolder ? createOtherFolder.checked : false;

  // Use Date Modified instead of Date Created
  var useDateModified = document.getElementById('useDateModified');
  formData.useDateModified = useDateModified ? useDateModified.checked : false;

  return formData;
}

function saveRulesAndPreview(triggerPreview) {
  if (isRestoringUI) return;
  var formData = collectFormData();
  localStorage.setItem('organizeRules', JSON.stringify(formData));
  if (typeof taskDirty !== 'undefined') taskDirty = true;
  if (typeof saveGlobalCategories === 'function') saveGlobalCategories();
  updateRulesList(formData);
  checkOverlappingExtensions();

  if (triggerPreview !== false) {
    var sourcePath = document.getElementById('sourcePath').innerText;
    var destPath = document.getElementById('destPath').innerText;
    if (sourcePath && sourcePath !== t('noFolder') &&
        destPath && destPath !== t('noFolder')) {
      generatePreview(sourcePath, destPath);
    }
  }
}

function updateRulesList(rules) {
  var rulesList = document.getElementById('rules-list');
  if (!rulesList) return;
  var items = [];

  if (rules.fileTypeToggle) {
    var fileTypes = rules.fileTypes || [];
    if (fileTypes.length > 0) {
      var names = fileTypes.map(function(ft) {
        var el = document.querySelector('.preset-category[data-category="' + ft + '"] .check-text');
        return el ? el.textContent.trim() : ft;
      });
      items.push('File Types: ' + names.join(', '));
    }
  }

  if (rules.timeToggle) {
    var timeOptions = rules.timeOptions || [];
    if (timeOptions.length > 0) {
      var timeNames = timeOptions.map(function(t) { return t.charAt(0).toUpperCase() + t.slice(1); });
      items.push('Time: ' + timeNames.join(' → '));
    }
    var timeDetails = [];
    if (rules.startDate) timeDetails.push('From: ' + rules.startDate);
    if (rules.endDate) timeDetails.push('To: ' + rules.endDate);
    if (timeDetails.length) items.push('Range: ' + timeDetails.join(' '));
    if (rules.excludedDays && rules.excludedDays.length) {
      items.push('Excluding: ' + rules.excludedDays.map(function(d) { return d.charAt(0).toUpperCase() + d.slice(1); }).join(', '));
    }
    if (rules.excludedSpecificDates && rules.excludedSpecificDates.length) {
      items.push('Excluded dates: ' + rules.excludedSpecificDates.join(', '));
    }
  }

  rulesList.innerHTML = items.length
    ? items.map(function(item) { return '<li>' + item + '</li>'; }).join('')
    : '<li>' + t('noRules') + '</li>';
}

function restoreRulesUI() {
  // Restore checkbox/input states from saved rules (called when loading a task)
  try {
    var rules = JSON.parse(localStorage.getItem('organizeRules') || '{}');
  } catch(e) { rules = {}; }

  removedDefaultTags = { documents: [], media: [], archives: [] };
  if (rules.removedDefaultTags) {
    for (var cat in rules.removedDefaultTags) {
      removedDefaultTags[cat] = rules.removedDefaultTags[cat].slice();
    }
  }

  // File type toggle + section
  var ftToggle = document.getElementById('toggle-file-types');
  if (ftToggle) {
    ftToggle.checked = !!rules.fileTypeToggle;
    var section = document.getElementById('file-types-section');
    if (section) section.classList.toggle('hidden', !rules.fileTypeToggle);
  }

  // Time toggle + section
  var timeToggle = document.getElementById('toggle-time-org');
  if (timeToggle) {
    timeToggle.checked = !!rules.timeToggle;
    var section = document.getElementById('time-org-section');
    if (section) section.classList.toggle('hidden', !rules.timeToggle);
  }

  // Time options
  document.querySelectorAll('input[name="time-option"]').forEach(function(cb) {
    cb.checked = (rules.timeOptions || []).indexOf(cb.value) !== -1;
    var nameInput = document.getElementById('time-' + cb.value + '-name');
    if (nameInput) nameInput.style.display = cb.checked ? '' : 'none';
  });

  // ── Clean rebuild: remove all dynamic rows, then recreate from scratch ──
  var presetList = document.getElementById('preset-file-types');
  if (presetList) {
    presetList.querySelectorAll('.preset-category[data-category^="dynamic-"]').forEach(function(r) { r.remove(); });
  }
  document.querySelectorAll('[class*="custom-options-container-dynamic-"]').forEach(function(c) { c.remove(); });
  document.querySelectorAll('.custom-options-container .custom-option-field[data-filetype^="dynamic-"]').forEach(function(f) {
    var cont = f.closest('.custom-options-container');
    if (cont) cont.remove();
  });

  // Recreate from saved task rules
  if (rules.customCategories && rules.customCategories.length > 0) {
    rules.customCategories.forEach(function(cat) {
      addCustomCategorySilent(cat.name, (cat.extensions || []).join(','), cat.id);
    });
  } else if (rules.customFileOptions) {
    for (var cat in rules.customFileOptions) {
      if (cat === 'documents' || cat === 'media' || cat === 'archives') continue;
      var displayName = (rules.fileTypeNames && rules.fileTypeNames[cat]) || cat;
      addCustomCategorySilent(displayName, (rules.customFileOptions[cat] || []).join(','), cat);
    }
  }

  // Load global custom categories (fills gaps not in saved rules)
  if (typeof loadGlobalCategories === 'function') loadGlobalCategories();

  // ── Single-pass toggle: every checkbox from authoritative source ──
  var catsById = {};
  if (rules.customCategories) {
    rules.customCategories.forEach(function(c) {
      // Use deterministic slug ID (from name) to match the DOM rows created above
      var slugId = typeof generateCategoryId === 'function' ? generateCategoryId(c.name) : c.id;
      catsById[slugId] = c.isChecked !== false;
    });
  }
  var toggled = [];
  document.querySelectorAll('input[name="file-type"]').forEach(function(cb) {
    if (cb.value.indexOf('dynamic-') === 0) {
      // Custom category: use customCategories, fallback to fileTypes
      var checked = catsById.hasOwnProperty(cb.value) ? catsById[cb.value] : ((rules.fileTypes || []).indexOf(cb.value) !== -1);
      if (cb.checked !== checked) {
        cb.checked = checked;
      }
      toggled.push(cb.value + ':' + checked);
    } else {
      // Default category: use fileTypes
      var defChecked = (rules.fileTypes || []).indexOf(cb.value) !== -1;
      if (cb.checked !== defChecked) {
        cb.checked = defChecked;
      }
    }
    var container = document.querySelector('.custom-options-container-' + cb.value);
    if (container) {
      container.style.display = cb.checked ? 'block' : 'none';
      if (cb.checked && cb.value.indexOf('dynamic-') !== 0) showDefaultTags(cb.value);
    }
  });
  console.log('[Categories] restoreRulesUI toggled:', JSON.stringify(toggled));
  console.log('[Categories] DOM rows after toggle:', document.querySelectorAll('.preset-category[data-category^="dynamic-"]').length);

  // Restore file type names — only apply truly custom names
  if (rules.fileTypeNames) {
    for (var cat in rules.fileTypeNames) {
      var preset = document.querySelector('.preset-category[data-category="' + cat + '"]');
      if (preset) {
        var isDefault = cat === 'documents' || cat === 'media' || cat === 'archives';
        if (isDefault) {
          // Skip if name matches any locale's default translation (not custom)
          var isTranslation = false;
          for (var lang in LOCALE) {
            if (LOCALE[lang] && LOCALE[lang][cat] === rules.fileTypeNames[cat]) {
              isTranslation = true;
              break;
            }
          }
          if (isTranslation) continue;
        }
        var checkText = preset.querySelector('.check-text');
        if (checkText) checkText.textContent = rules.fileTypeNames[cat];
      }
    }
  }

  // File operations
  var el = document.getElementById('deleteOriginals');
  if (el) el.checked = !!rules.deleteOriginals;
  el = document.getElementById('skipHidden');
  if (el) el.checked = !!rules.skipHidden;
  el = document.getElementById('skipDSStore');
  if (el) el.checked = !!rules.skipDSStore;
  el = document.getElementById('useNumericMonths');
  if (el) el.checked = !!rules.useNumericMonths;
  el = document.getElementById('createOtherFolder');
  if (el) el.checked = rules.createOtherFolder !== false;
  el = document.getElementById('useDateModified');
  if (el) el.checked = !!rules.useDateModified;

  // Time custom names
  if (rules.yearCustomName) { var inp = document.getElementById('time-year-name'); if (inp) inp.value = rules.yearCustomName; }
  if (rules.monthCustomName) { var inp = document.getElementById('time-month-name'); if (inp) inp.value = rules.monthCustomName; }
  if (rules.weekCustomName) { var inp = document.getElementById('time-week-name'); if (inp) inp.value = rules.weekCustomName; }
  if (rules.dayCustomName) { var inp = document.getElementById('time-day-name'); if (inp) inp.value = rules.dayCustomName; }

  // Date range
  if (rules.startDate) { var inp = document.getElementById('start-date'); if (inp) inp.value = rules.startDate; }
  if (rules.endDate) { var inp = document.getElementById('end-date'); if (inp) inp.value = rules.endDate; }

  // Time range
  if (rules.startTime) { var inp = document.getElementById('start-time'); if (inp) { inp.value = rules.startTime; syncTimeDisplay(inp); } }
  if (rules.endTime) { var inp = document.getElementById('end-time'); if (inp) { inp.value = rules.endTime; syncTimeDisplay(inp); } }

  // Reset Dates button
  var resetDatesBtn = document.getElementById('resetDates');
  if (resetDatesBtn) {
    resetDatesBtn.addEventListener('click', function() {
      if (startDate) startDate.value = '';
      if (endDate) endDate.value = '';
      saveRulesAndPreview(true);
    });
  }

  // Reset Times button
  var resetTimesBtn = document.getElementById('resetTimes');
  if (resetTimesBtn) {
    resetTimesBtn.addEventListener('click', function() {
      if (startTime) startTime.value = '';
      if (endTime) endTime.value = '';
      saveRulesAndPreview(true);
    });
  }

  // Excluded days
  document.querySelectorAll('input[name="excluded-days"]').forEach(function(cb) {
    cb.checked = (rules.excludedDays || []).indexOf(cb.value) !== -1;
  });

  // File filter tags
  var filterTags = document.getElementById('fileFilterTags');
  if (filterTags) {
    filterTags.innerHTML = '';
    if (rules.fileFilter && rules.fileFilter.length > 0) {
      rules.fileFilter.forEach(function(ext) {
        var tag = document.createElement('span');
        tag.className = 'custom-option-tag';
        tag.setAttribute('data-value', ext);
        tag.innerHTML = ext + '<button type="button" class="remove-custom-option-tag" data-value="' + ext + '" title="Remove">&times;</button>';
        filterTags.appendChild(tag);
      });
    }
  }

  // ── Rebuild excluded specific dates tags ─────────────
  var dateList = document.getElementById('exclude-dates-list');
  if (dateList) {
    dateList.innerHTML = '';
    if (rules.excludedSpecificDates && rules.excludedSpecificDates.length > 0) {
      rules.excludedSpecificDates.forEach(function(dateVal) {
        var tag = document.createElement('span');
        tag.className = 'custom-option-tag';
        tag.setAttribute('data-date', dateVal);
        tag.innerHTML = dateVal + ' <button type="button" class="remove-custom-option-tag" title="Remove">&times;</button>';
        tag.querySelector('.remove-custom-option-tag').addEventListener('click', function() {
          tag.remove();
          saveRulesAndPreview(true);
        });
        dateList.appendChild(tag);
      });
    }
  }

  // ── Rebuild custom category rows from saved rules ────
  if (rules.customFileOptions) {
    var presetList = document.getElementById('preset-file-types');
    if (presetList) {
      // Remove any existing dynamic category rows (to avoid duplicates)
      presetList.querySelectorAll('.preset-category[data-category^="dynamic-"]').forEach(function(row) {
        row.remove();
      });
      presetList.querySelectorAll('.custom-options-container[class*="dynamic-"]').forEach(function(cont) {
        cont.remove();
      });

      var catNames = rules.fileTypeNames || {};
      Object.keys(rules.customFileOptions).forEach(function(catValue) {
        if (catValue === 'documents' || catValue === 'media' || catValue === 'archives') return; // skip built-ins
        var name = catNames[catValue] || catValue;
        var exts = rules.customFileOptions[catValue].join(',');

        // Create the row using addCustomCategory (slug ID is deterministic from name)
        addCustomCategory(name, exts);

        // Restore checkbox state
        var cb = document.querySelector('input[name="file-type"][value="' + catValue + '"]');
        if (cb) {
          cb.checked = (rules.fileTypes || []).indexOf(catValue) !== -1;
          var container = document.querySelector('.custom-options-container-' + catValue);
          if (container) {
            container.style.display = cb.checked ? 'block' : 'none';
          }
        }
      });
    }
  }

  // Update rules list display
  updateRulesList(rules);
  checkOverlappingExtensions();
}

function resetOrganizeRules() {
  isRestoringUI = true;
  document.querySelectorAll('#organize-rules-form input[name="time-option"]').forEach(function(input) {
    input.checked = false;
  });

  document.querySelectorAll('#organize-rules-form input[type="checkbox"]').forEach(function(input) {
    input.checked = false;
  });

  document.querySelectorAll('#organize-rules-form input[type="text"]').forEach(function(input) {
    input.value = '';
  });

  document.querySelectorAll('#organize-rules-form input[type="date"]').forEach(function(input) {
    input.value = '';
  });

  document.querySelectorAll('#organize-rules-form .time-custom-input').forEach(function(input) {
    input.value = '';
  });

  var comboExample = document.getElementById('combo-example');
  if (comboExample) {
    comboExample.selectedIndex = 0;
  }

  var rulesList = document.getElementById('rules-list');
  if (rulesList) {
    rulesList.innerHTML = '<li>' + t('noRules') + '</li>';
  }

  // Clear removed default tags tracking
  removedDefaultTags = { documents: [], media: [], archives: [] };

  // Clear file filter tags
  var filterTags = document.getElementById('fileFilterTags');
  if (filterTags) filterTags.innerHTML = '';

  // Clear excluded dates list
  var dateList = document.getElementById('exclude-dates-list');
  if (dateList) dateList.innerHTML = '';

  // Remove dynamic category rows
  var presetList = document.getElementById('preset-file-types');
  if (presetList) {
    presetList.querySelectorAll('.preset-category[data-category^="dynamic-"]').forEach(function(row) {
      row.remove();
    });
    // Remove all custom options containers for dynamic categories
    document.querySelectorAll('[class*="custom-options-container-dynamic-"]').forEach(function(cont) {
      cont.remove();
    });
    // Also catch any orphan containers by scanning for the input fields
    document.querySelectorAll('.custom-options-container .custom-option-field[data-filetype^="dynamic-"]').forEach(function(field) {
      var cont = field.closest('.custom-options-container');
      if (cont) cont.remove();
    });
  }

  var customCategoriesContainer = document.getElementById('custom-categories-container');
  if (customCategoriesContainer) {
    customCategoriesContainer.classList.add('hidden');
  }

  // Persist the cleared state
  localStorage.removeItem('organizeRules');

  var fileTypesSection = document.getElementById('file-types-section');
  var timeOrgSection = document.getElementById('time-org-section');
  if (fileTypesSection) fileTypesSection.classList.add('hidden');
  if (timeOrgSection) timeOrgSection.classList.add('hidden');

  var excludedDatesList = document.getElementById('exclude-dates-list');
  if (excludedDatesList) excludedDatesList.innerHTML = '';

  var excludedSpecificDatesInput = document.getElementById('excluded-specific-dates');
  if (excludedSpecificDatesInput) excludedSpecificDatesInput.value = '';

  // Clear custom file type options
  document.querySelectorAll('input[name="file-type"]').forEach(function(checkbox) {
    var fileTypeValue = checkbox.value;
    var optionsContainer;
    if (fileTypeValue.startsWith('dynamic-')) {
      var presetCategory = document.querySelector('.preset-category[data-category="' + fileTypeValue + '"]');
      if (presetCategory) {
        optionsContainer = presetCategory.nextElementSibling;
        if (optionsContainer && !optionsContainer.classList.contains('custom-options-container-' + fileTypeValue)) {
          optionsContainer = document.querySelector('.custom-options-container-' + fileTypeValue);
        }
      }
    } else {
      optionsContainer = document.querySelector('.custom-options-container-' + fileTypeValue);
    }

    if (optionsContainer) {
      optionsContainer.style.display = 'none';
      var listContainer = document.getElementById('custom-options-list-' + fileTypeValue);
      if (listContainer) listContainer.innerHTML = '';
      var optionField = document.querySelector('.custom-option-field[data-filetype="' + fileTypeValue + '"]');
      if (!optionField && fileTypeValue.startsWith('dynamic-')) {
        var categoryId = 'dynamic-category-' + fileTypeValue.replace('dynamic-', '');
        optionField = document.querySelector('.custom-option-field[data-categoryid="' + categoryId + '"]');
      }
      if (optionField) optionField.value = '';
    }
  });

  // Clear dynamic categories
  document.querySelectorAll('.preset-category[id^="dynamic-category-"]').forEach(function(element) {
    element.remove();
  });

  // Slug-based IDs don't need counter reset
  statusText.innerText = 'Organize rules reset to default.';
  setTimeout(function() { isRestoringUI = false; }, 100);
}

function previewOrganizeRules() {
  var formData = collectFormData();

  if (!formData.timeToggle && !formData.fileTypeToggle) {
    statusText.innerText = t('enableOneOption');
    return;
  }

  statusText.innerText = t('previewingRules');

  var sourcePath = document.getElementById('sourcePath').innerText;
  var destPath = document.getElementById('destPath').innerText;

  if (!sourcePath || sourcePath === t('noFolder') ||
      !destPath || destPath === t('noFolder')) {
    statusText.innerText = 'Please select both source and destination folders to preview.';
    return;
  }

  generatePreview(sourcePath, destPath);
}

function initRules() {
  // Toggle: file types
  var ftToggle = document.getElementById('toggle-file-types');
  if (ftToggle) {
    ftToggle.addEventListener('change', function() {
      var section = document.getElementById('file-types-section');
      if (section) {
        section.classList.toggle('hidden', !this.checked);
      }
      saveRulesAndPreview(true);
    });
  }

  // Toggle: time organization
  var timeToggle = document.getElementById('toggle-time-org');
  if (timeToggle) {
    timeToggle.addEventListener('change', function() {
      var section = document.getElementById('time-org-section');
      if (section) {
        section.classList.toggle('hidden', !this.checked);
      }
      saveRulesAndPreview(true);
    });
  }

  // Time option checkboxes — show/hide name input, auto-save
  document.querySelectorAll('input[name="time-option"]').forEach(function(cb) {
    cb.addEventListener('change', function() {
      var nameInput = document.getElementById('time-' + this.value + '-name');
      if (nameInput) nameInput.style.display = this.checked ? '' : 'none';
      saveRulesAndPreview(true);
    });
    // Also auto-save when the name input changes
    var nameInput = document.getElementById('time-' + cb.value + '-name');
    if (nameInput) {
      nameInput.addEventListener('input', function() { saveRulesAndPreview(false); });
    }
  });

  // File type checkboxes — show/hide custom options container
  document.querySelectorAll('input[name="file-type"]').forEach(function(cb) {
    cb.addEventListener('change', function() {
      var fileTypeValue = this.value;
      var optionsContainer = document.querySelector('.custom-options-container-' + fileTypeValue);
      if (optionsContainer) {
        if (this.checked) {
          optionsContainer.style.display = 'block';
        } else {
          optionsContainer.style.display = 'none';
        }
      }
    });
  });

  // Date range inputs
  var startDate = document.getElementById('start-date');
  var endDate = document.getElementById('end-date');
  if (startDate) startDate.addEventListener('change', function() { saveRulesAndPreview(true); });
  if (endDate) endDate.addEventListener('change', function() { saveRulesAndPreview(true); });

  // Time range inputs
  var startTime = document.getElementById('start-time');
  var endTime = document.getElementById('end-time');
  if (startTime) startTime.addEventListener('change', function() { saveRulesAndPreview(true); });
  if (endTime) endTime.addEventListener('change', function() { saveRulesAndPreview(true); });

  // Enter key: move focus between date fields, time fields use native Enter for hour/min/AMPM
  var dateFields = [startDate, endDate].filter(Boolean);
  dateFields.forEach(function(field, idx) {
    field.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (idx < dateFields.length - 1) {
          dateFields[idx + 1].focus();
          dateFields[idx + 1].showPicker && dateFields[idx + 1].showPicker();
        } else {
          // Last date field: focus first time field
          if (startTime) { startTime.focus(); startTime.showPicker && startTime.showPicker(); }
        }
      }
    });
  });

// ── Custom time input helpers (global) ────────────
function is24hMode() { return localStorage.getItem('morganized-24h-time') === '1'; }

function getRawTime(val) {
  if (!val) return '';
  return val.replace(/\s*(AM|PM|am|pm)$/i, '').trim();
}

function clampTimeValue(raw) {
  if (!raw) return '';
  var m = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return '';
  var h = parseInt(m[1], 10);
  var min = m[2];
  if (h < 0) h = 0;
  if (h > 23) h = 23;
  return String(h).padStart(2, '0') + ':' + min;
}

function toDisplayTime(raw) {
  var clamped = clampTimeValue(raw);
  if (!clamped) return '';
  if (is24hMode()) return clamped;
  var parts = clamped.split(':');
  var h = parseInt(parts[0], 10);
  var m = parts[1];
  var ampm = h >= 12 ? 'PM' : 'AM';
  var h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return h12 + ':' + m + ' ' + ampm;
}

function syncTimeDisplay(field) {
  var raw = field.getAttribute('data-time-raw') || getRawTime(field.value);
  raw = clampTimeValue(raw);
  if (!raw) { field.value = ''; field.setAttribute('data-time-raw', ''); return; }
  field.setAttribute('data-time-raw', raw);
  field.value = toDisplayTime(raw);
}

function adjustTimeField(field, deltaMinutes) {
  var raw = field.getAttribute('data-time-raw') || getRawTime(field.value);
  var h = 0, m = 0;
  if (raw && /^\d{1,2}:\d{2}$/.test(raw)) {
    var parts = raw.split(':');
    h = parseInt(parts[0], 10);
    m = parseInt(parts[1], 10);
  }
  var total = h * 60 + m + deltaMinutes;
  if (total < 0) total += 1440;
  if (total >= 1440) total -= 1440;
  var nh = Math.floor(total / 60);
  var nm = total % 60;
  var newRaw = String(nh).padStart(2, '0') + ':' + String(nm).padStart(2, '0');
  field.setAttribute('data-time-raw', newRaw);
  field.value = toDisplayTime(newRaw);
}

  // ── Time fields: custom input handling ──────────────
  var timeFields = [startTime, endTime].filter(Boolean);
  timeFields.forEach(function(field) {
    // On focus: select only the time portion (before AM/PM)
    field.addEventListener('focus', function() {
      var val = field.value;
      var ampmIdx = val.search(/\s[AP]M$/i);
      if (ampmIdx > 0) {
        field.setSelectionRange(0, ampmIdx);
      } else {
        field.select();
      }
    });

    // Input mask: digits+colon, auto-colon, write back to field
    field.addEventListener('input', function(e) {
      var val = field.value;
      var ampmMatch = val.match(/\s[AP]M$/i);
      var suffix = ampmMatch ? ampmMatch[0] : '';
      var suffixLen = suffix.length;
      var rawPart = val.slice(0, val.length - suffixLen);
      var digits = rawPart.replace(/[^0-9:]/g, '');
      if (digits.length >= 2 && digits.indexOf(':') === -1) {
        digits = digits.slice(0, 2) + ':' + digits.slice(2);
      }
      if (digits.length > 5) digits = digits.slice(0, 5);
      var raw = clampTimeValue(digits);
      if (raw) field.setAttribute('data-time-raw', raw);
      // Write back: digits + AM/PM suffix while editing
      var selStart = field.selectionStart;
      // Count digits before cursor to reposition after rewrite
      var digitsBefore = 0;
      for (var i = 0; i < Math.min(selStart, rawPart.length); i++) {
        if (/[0-9]/.test(rawPart[i])) digitsBefore++;
      }
      field.value = digits + suffix;
      // Reposition cursor after the same number of digits
      var newPos = 0, count = 0;
      for (var j = 0; j < digits.length; j++) {
        if (/[0-9]/.test(digits[j])) {
          count++;
          if (count > digitsBefore) break;
        }
        newPos = j + 1;
      }
      field.setSelectionRange(newPos, newPos);
    });

    // On blur: finalize formatting
    field.addEventListener('blur', function() {
      var raw = field.getAttribute('data-time-raw') || getRawTime(field.value);
      if (/^\d{1,2}$/.test(raw)) {
        raw = String(parseInt(raw, 10)).padStart(2, '0') + ':00';
      } else if (/^\d{1,2}:\d{1}$/.test(raw)) {
        var parts = raw.split(':');
        raw = String(parseInt(parts[0], 10)).padStart(2, '0') + ':' + parts[1] + '0';
      }
      raw = clampTimeValue(raw);
      field.setAttribute('data-time-raw', raw);
      field.value = toDisplayTime(raw);
      saveRulesAndPreview(true);
    });

    // Keyboard: arrows, Enter, A/P
    field.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowUp') { e.preventDefault(); adjustTimeField(field, 30); saveRulesAndPreview(true); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); adjustTimeField(field, -30); saveRulesAndPreview(true); return; }

      // A/P toggle (12h mode only)
      if ((e.key === 'a' || e.key === 'A' || e.key === 'p' || e.key === 'P') && !is24hMode()) {
        e.preventDefault();
        var raw = field.getAttribute('data-time-raw') || getRawTime(field.value);
        if (!raw || !/^\d{2}:\d{2}$/.test(raw)) { raw = '00:00'; }
        var parts = raw.split(':');
        var h = parseInt(parts[0], 10);
        var m = parts[1];
        var isPM = e.key.toLowerCase() === 'p';
        if (isPM && h < 12) { h += 12; }
        else if (!isPM && h >= 12) { h -= 12; }
        raw = String(h).padStart(2, '0') + ':' + m;
        field.setAttribute('data-time-raw', raw);
        field.value = toDisplayTime(raw);
        saveRulesAndPreview(true);
        return;
      }

      // Enter: move to next or confirm
      if (e.key === 'Enter') {
        e.preventDefault();
        var raw = field.getAttribute('data-time-raw') || getRawTime(field.value);
        raw = clampTimeValue(raw);
        field.setAttribute('data-time-raw', raw);
        field.value = toDisplayTime(raw);
        if (field === endTime) {
          field.blur();
          saveRulesAndPreview(true);
        } else {
          field.blur();
          if (endTime) { endTime.focus(); }
        }
      }
    });

    // Initial display
    var initRaw = getRawTime(field.value);
    if (initRaw) { field.setAttribute('data-time-raw', clampTimeValue(initRaw)); }
    field.value = toDisplayTime(field.getAttribute('data-time-raw'));
  });

  // Reset Dates button
  var resetDatesBtn = document.getElementById('resetDates');
  if (resetDatesBtn) {
    resetDatesBtn.addEventListener('click', function() {
      if (startDate) startDate.value = '';
      if (endDate) endDate.value = '';
      saveRulesAndPreview(true);
    });
  }

  // Reset Times button
  var resetTimesBtn = document.getElementById('resetTimes');
  if (resetTimesBtn) {
    resetTimesBtn.addEventListener('click', function() {
      if (startTime) startTime.value = '';
      if (endTime) endTime.value = '';
      saveRulesAndPreview(true);
    });
  }

  // Excluded days
  document.querySelectorAll('input[name="excluded-days"]').forEach(function(cb) {
    cb.addEventListener('change', function() { saveRulesAndPreview(true); });
  });

  // Excluded specific dates — Enter to add
  var excludedDatesInput = document.getElementById('excluded-specific-dates');
  if (excludedDatesInput) {
    excludedDatesInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var dateVal = this.value;
        if (!dateVal) return;
        var list = document.getElementById('exclude-dates-list');
        if (!list) return;
        // Check duplicates
        var existing = list.querySelectorAll('.custom-option-tag');
        for (var i = 0; i < existing.length; i++) {
          if (existing[i].getAttribute('data-date') === dateVal) { this.value = ''; return; }
        }
        var tag = document.createElement('span');
        tag.className = 'custom-option-tag';
        tag.setAttribute('data-date', dateVal);
        tag.innerHTML = dateVal + ' <button type="button" class="remove-custom-option-tag" title="Remove">&times;</button>';
        tag.querySelector('.remove-custom-option-tag').addEventListener('click', function() {
          tag.remove();
          saveRulesAndPreview(true);
        });
        list.appendChild(tag);
        this.value = '';
        saveRulesAndPreview(true);
      }
    });
  }


  // Excluded specific dates — Add button
  var addExcludedDateBtn = document.getElementById('addExcludedDate');
  if (addExcludedDateBtn) {
    addExcludedDateBtn.addEventListener('click', function() {
      var input = document.getElementById('excluded-specific-dates');
      if (!input) return;
      var dateVal = input.value;
      if (!dateVal) return;
      var list = document.getElementById('exclude-dates-list');
      if (!list) return;
      var existing = list.querySelectorAll('.custom-option-tag');
      for (var i = 0; i < existing.length; i++) {
        if (existing[i].getAttribute('data-date') === dateVal) { input.value = ''; return; }
      }
      var tag = document.createElement('span');
      tag.className = 'custom-option-tag';
      tag.setAttribute('data-date', dateVal);
      tag.innerHTML = dateVal + ' <button type="button" class="remove-custom-option-tag" title="Remove">&times;</button>';
      tag.querySelector('.remove-custom-option-tag').addEventListener('click', function() {
        tag.remove();
        saveRulesAndPreview(true);
      });
      list.appendChild(tag);
      input.value = '';
      saveRulesAndPreview(true);
    });
  }

  // Use numeric months
  var useNumericMonths = document.getElementById('useNumericMonths');
  if (useNumericMonths) {
    useNumericMonths.addEventListener('change', function() { saveRulesAndPreview(true); });
  }

  // Create Other folder for unmatched types
  var createOtherFolder = document.getElementById('createOtherFolder');
  if (createOtherFolder) {
    createOtherFolder.addEventListener('change', function() { saveRulesAndPreview(true); });
  }

  // File operations: delete originals, skip hidden, skip DS_Store
  var deleteOriginals = document.getElementById('deleteOriginals');
  var skipHidden = document.getElementById('skipHidden');
  var skipDSStore = document.getElementById('skipDSStore');
  if (deleteOriginals) deleteOriginals.addEventListener('change', function() { saveRulesAndPreview(true); });
  if (skipHidden) skipHidden.addEventListener('change', function() { saveRulesAndPreview(true); });
  if (skipDSStore) skipDSStore.addEventListener('change', function() { saveRulesAndPreview(true); });

  // File filter tags — add on Enter or button click
  var fileFilterInput = document.getElementById('fileFilterInput');
  if (fileFilterInput) {
    fileFilterInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addFileFilterTag(this.value);
        this.value = '';
        saveRulesAndPreview(true);
      }
    });
  }
  var addFileFilterBtn = document.getElementById('addFileFilterTag');
  if (addFileFilterBtn) {
    addFileFilterBtn.addEventListener('click', function() {
      var input = document.getElementById('fileFilterInput');
      if (input) {
        addFileFilterTag(input.value);
        input.value = '';
        saveRulesAndPreview(true);
      }
    });
  }
  // Remove file filter tag on click (via existing delegation for .remove-custom-option-tag)
  // But we need to trigger save when a file filter tag is removed
  var filterTagsContainer = document.getElementById('fileFilterTags');
  if (filterTagsContainer) {
    filterTagsContainer.addEventListener('click', function(e) {
      if (e.target.classList.contains('remove-custom-option-tag')) {
        e.target.parentElement.remove();
        setTimeout(function() { saveRulesAndPreview(true); }, 0);
      }
    });
  }

  // 24-hour time toggle — update all time fields when changed
  var use24hToggle = document.getElementById('use24HourTime');
  if (use24hToggle) {
    if (localStorage.getItem('morganized-24h-time') === '1') {
      use24hToggle.checked = true;
    }
    use24hToggle.addEventListener('change', function() {
      localStorage.setItem('morganized-24h-time', this.checked ? '1' : '0');
      document.querySelectorAll('.time-custom-input').forEach(function(f) {
        syncTimeDisplay(f);
      });
    });
  }

  // Apply Rules button
  var applyBtn = document.getElementById('apply-rules-btn');
  if (applyBtn) {
    applyBtn.addEventListener('click', function(e) {
      e.preventDefault();
      saveRulesAndPreview(true);
    });
  }

  // Reset Rules button
  var resetBtn = document.getElementById('reset-rules-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (!confirm(t('resetConfirm'))) return;
      resetOrganizeRules();
    });
  }


}
