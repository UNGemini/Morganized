// Copyright 2026 UNLOOP MORGAN
// SPDX-License-Identifier: Apache-2.0

use chrono::{Datelike, Local, NaiveDate, NaiveDateTime, TimeZone, Timelike};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::{Emitter, Manager};

mod plugins;

// ── Data types ──────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OrganizeOptions {
    #[serde(rename = "sourcePath")]
    pub source_path: String,
    #[serde(rename = "destPath")]
    pub dest_path: String,
    #[serde(rename = "deleteOriginals")]
    pub delete_originals: bool,
    #[serde(rename = "skipHidden")]
    pub skip_hidden: bool,
    #[serde(rename = "skipDSStore")]
    pub skip_ds_store: bool,
    #[serde(rename = "fileFilter", default)]
    pub file_filter: Vec<String>,
    #[serde(rename = "organizeRules", default)]
    pub organize_rules: Option<OrganizeRules>,
    #[serde(rename = "dryRun", default)]
    pub dry_run: bool,
    #[serde(rename = "useNumericMonths", default)]
    pub use_numeric_months: bool,
    #[serde(rename = "createOtherFolder", default)]
    pub create_other_folder: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OrganizeRules {
    #[serde(rename = "timeToggle")]
    pub time_toggle: bool,
    #[serde(rename = "timeOptions", default)]
    pub time_options: Vec<String>,
    #[serde(rename = "fileTypeToggle")]
    pub file_type_toggle: bool,
    #[serde(rename = "fileTypes", default)]
    pub file_types: Vec<String>,
    #[serde(rename = "customFileOptions", default)]
    pub custom_file_options: Option<HashMap<String, Vec<String>>>,
    #[serde(rename = "startDate", default)]
    pub start_date: Option<String>,
    #[serde(rename = "endDate", default)]
    pub end_date: Option<String>,
    #[serde(rename = "excludedDays", default)]
    pub excluded_days: Vec<String>,
    #[serde(rename = "excludedSpecificDates", default)]
    pub excluded_specific_dates: Option<Vec<String>>,
    #[serde(rename = "yearCustomName", default)]
    pub year_custom_name: Option<String>,
    #[serde(rename = "monthCustomName", default)]
    pub month_custom_name: Option<String>,
    #[serde(rename = "weekCustomName", default)]
    pub week_custom_name: Option<String>,
    #[serde(rename = "dayCustomName", default)]
    pub day_custom_name: Option<String>,
    #[serde(rename = "fileTypeNames", default)]
    pub file_type_names: Option<HashMap<String, String>>,
    #[serde(rename = "useNumericMonths", default)]
    pub use_numeric_months: bool,
    #[serde(rename = "createOtherFolder", default)]
    pub create_other_folder: bool,
    #[serde(rename = "startTime", default)]
    pub start_time: Option<String>,
    #[serde(rename = "endTime", default)]
    pub end_time: Option<String>,
    #[serde(rename = "removedDefaultTags", default)]
    pub removed_default_tags: Option<HashMap<String, Vec<String>>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FilePlanEntry {
    pub source: String,
    pub destination: String,
    pub action: String, // "copy" | "move"
    #[serde(default)]
    pub skipped: bool,
    #[serde(default)]
    pub reason: Option<String>,
    #[serde(default)]
    pub created: Option<String>,
}

#[derive(Debug, Serialize, Clone)]
pub struct ProgressPayload {
    pub processed: usize,
    pub total: usize,
    pub percent: u32,
}

// ── Tauri commands ──────────────────────────────────────────────────────

#[tauri::command]
async fn pick_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    let result = app
        .dialog()
        .file()
        .blocking_pick_folder();
    Ok(result.map(|p| p.to_string()))
}

#[tauri::command]
async fn organize_files(
    app: tauri::AppHandle,
    options: OrganizeOptions,
) -> Result<Vec<FilePlanEntry>, String> {
    let source_path = PathBuf::from(&options.source_path);
    let dest_path = PathBuf::from(&options.dest_path);

    if !source_path.exists() {
        return Err("Source path does not exist.".into());
    }

    // Create dest folder if actually writing files
    if !options.dry_run && !dest_path.exists() {
        fs::create_dir_all(&dest_path).map_err(|e| e.to_string())?;
    }

    // Read all files in source
    let mut files: Vec<String> = fs::read_dir(&source_path)
        .map_err(|e| e.to_string())?
        .filter_map(|entry| {
            let e = entry.ok()?;
            if e.file_type().ok()?.is_file() {
                Some(e.file_name().to_string_lossy().to_string())
            } else {
                None
            }
        })
        .collect();

    // Save unfiltered list for preview
    let all_files = files.clone();

    // (file filter debug removed)

    // Apply filters
    if options.skip_hidden {
        files.retain(|name| !name.starts_with('.'));
    }
    if options.skip_ds_store {
        files.retain(|name| name != ".DS_Store");
    }
    if !options.file_filter.is_empty() {
        files.retain(|name| {
            let lower = name.to_lowercase();
            !options.file_filter.iter().any(|f| lower.ends_with(f))
        });
    }

    if let Some(ref rules) = options.organize_rules {
        if rules.time_toggle {
            files = filter_by_time(&files, &source_path, rules)?;
        }
        if rules.file_type_toggle {
            files = filter_by_file_type(&files, rules);
        }
        if !rules.excluded_days.is_empty() || rules.excluded_specific_dates.is_some() {
            files = filter_by_excluded_days(&files, &source_path, rules)?;
        }
    }


    // Preview: show all files but mark which would be filtered
    let files_to_process = if options.dry_run {
        &all_files
    } else {
        &files
    };

    // Build a set of filtered filenames for quick lookup
    let filtered_set: HashSet<&str> = files.iter().map(|s| s.as_str()).collect();

    let total = files_to_process.len().max(1);
    let mut plan: Vec<FilePlanEntry> = Vec::new();
    let mut processed = 0usize;

    for file in files_to_process {
        let src = source_path.join(file);

        // Build destination path (with fallback for preview)
        let dest = if let Some(ref rules) = options.organize_rules {
            match build_organized_path(&dest_path, &src, rules, options.use_numeric_months, options.create_other_folder) {
                Ok(p) => p,
                Err(_) if options.dry_run => dest_path.join(file),
                Err(e) => return Err(e),
            }
        } else {
            dest_path.join(file)
        };

        let action = if options.delete_originals { "move" } else { "copy" };

        if !options.dry_run {
            // Ensure destination parent exists
            if let Some(parent) = dest.parent() {
                fs::create_dir_all(parent).map_err(|e| e.to_string())?;
            }
            if options.delete_originals {
                fs::rename(&src, &dest).map_err(|e| e.to_string())?;
            } else {
                fs::copy(&src, &dest).map_err(|e| e.to_string())?;
            }
        }

        // For preview, mark files that would be filtered out
        let is_skipped = options.dry_run && !filtered_set.contains(file.as_str());
        // Read creation time for sorting (epoch millis, sorts correctly as string)
        let created_str = fs::metadata(&src).ok()
            .and_then(|m| m.created().ok())
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_millis().to_string());
        plan.push(FilePlanEntry {
            source: src.to_string_lossy().to_string(),
            destination: dest.to_string_lossy().to_string(),
            action: action.to_string(),
            skipped: is_skipped,
            reason: if is_skipped { Some("Filtered by rules".into()) } else { None },
            created: created_str,
        });

        processed += 1;
        let percent = ((processed as f64 / total as f64) * 100.0) as u32;
        let _ = app.emit(
            "organize-progress",
            ProgressPayload {
                processed,
                total,
                percent,
            },
        );
    }

    Ok(plan)
}

// ── File filtering helpers ─────────────────────────────────────────────

fn filter_by_time(
    files: &[String],
    source_path: &Path,
    rules: &OrganizeRules,
) -> Result<Vec<String>, String> {
    let has_date_range = rules.start_date.as_ref().map_or(false, |s| !s.is_empty())
        && rules.end_date.as_ref().map_or(false, |s| !s.is_empty());
    let has_time_range = rules.start_time.as_ref().map_or(false, |s| !s.is_empty())
        || rules.end_time.as_ref().map_or(false, |s| !s.is_empty());

    if !has_date_range && !has_time_range {
        return Ok(files.to_vec());
    }

    // Parse date range
    let date_start = if has_date_range {
        let s = rules.start_date.as_ref().unwrap();
        let e = rules.end_date.as_ref().unwrap();
        Some((
            NaiveDate::parse_from_str(s, "%Y-%m-%d").map_err(|e| format!("Invalid start date: {}", e))?,
            NaiveDate::parse_from_str(e, "%Y-%m-%d").map_err(|e| format!("Invalid end date: {}", e))?,
        ))
    } else {
        None
    };

    // Parse time range (HH:MM format)
    let parse_time = |t: &str| -> Result<(u32, u32), String> {
        let parts: Vec<&str> = t.split(':').collect();
        if parts.len() != 2 {
            return Err(format!("Invalid time: {}", t));
        }
        let h: u32 = parts[0].parse().map_err(|_| format!("Invalid hour: {}", parts[0]))?;
        let m: u32 = parts[1].parse().map_err(|_| format!("Invalid minute: {}", parts[1]))?;
        Ok((h, m))
    };

    let time_start = if let Some(ref t) = rules.start_time {
        if !t.is_empty() { Some(parse_time(t)?) } else { None }
    } else { None };
    let time_end = if let Some(ref t) = rules.end_time {
        if !t.is_empty() { Some(parse_time(t)?) } else { None }
    } else { None };

    let filtered: Vec<String> = files
        .iter()
        .filter(|name| {
            let path = source_path.join(name);
            if let Ok(meta) = fs::metadata(&path) {
                if let Ok(created) = meta.created() {
                    let dt = created_to_naive(created);

                    // Check date range
                    if let Some((ref start_date, ref end_date)) = date_start {
                        let start_dt = start_date.and_hms_opt(0, 0, 0).unwrap();
                        let end_dt = end_date.and_hms_opt(23, 59, 59).unwrap();
                        if dt < start_dt || dt > end_dt {
                            return false;
                        }
                    }

                    // Check time range
                    if let Some((sh, sm)) = time_start {
                        let file_minutes = dt.hour() * 60 + dt.minute();
                        let start_minutes = sh * 60 + sm;
                        if file_minutes < start_minutes {
                            return false;
                        }
                    }
                    if let Some((eh, em)) = time_end {
                        let file_minutes = dt.hour() * 60 + dt.minute();
                        let end_minutes = eh * 60 + em;
                        if file_minutes > end_minutes {
                            return false;
                        }
                    }

                    return true;
                }
            }
            // If metadata is unreadable, keep the file
            true
        })
        .cloned()
        .collect();
    Ok(filtered)
}


fn filter_defaults<'a>(exts: &mut Vec<&'a str>, rules: &OrganizeRules, category: &str) {
    if let Some(ref removed) = rules.removed_default_tags {
        if let Some(removed_exts) = removed.get(category) {
            exts.retain(|e| !removed_exts.iter().any(|r| r.as_str() == *e));
        }
    }
}

fn filter_by_file_type(files: &[String], rules: &OrganizeRules) -> Vec<String> {
    // Check if any selected file type actually has matching extensions
    let has_real_extensions = rules.file_types.iter().any(|ft| match ft.as_str() {
        "documents" | "media" | "archives" => true,
        _ => {
            // Check custom/dynamic categories for extensions
            if let Some(ref custom) = rules.custom_file_options {
                // First try exact key match
                for (cat_name, extensions) in custom {
                    if cat_name.to_lowercase() == ft.to_lowercase()
                        || cat_name.to_lowercase().replace(' ', "") == ft.to_lowercase()
                    {
                        return !extensions.is_empty();
                    }
                }
                // Fallback: any custom category with extensions counts
                // (handles dynamic-N keys that don't match category names)
                return custom.values().any(|exts| !exts.is_empty());
            }
            false
        }
    });

    if !has_real_extensions {
        return files.to_vec();
    }

    files
        .iter()
        .filter(|name| {
            let ext = Path::new(name)
                .extension()
                .map(|e| format!(".{}", e.to_string_lossy().to_lowercase()))
                .unwrap_or_default();

            for file_type in &rules.file_types {
                match file_type.as_str() {
                    "documents" => {
                        let mut docs = vec![
                            ".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt",
                        ];
                        if let Some(ref custom) = rules.custom_file_options {
                            if let Some(c) = custom.get("documents") {
                                docs.extend(c.iter().map(|s| s.as_str()));
                            }
                        }
                        filter_defaults(&mut docs, rules, "documents");
                        if docs.contains(&ext.as_str()) {
                            return true;
                        }
                    }
                    "media" => {
                        let mut media = vec![
                            ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".mp4",
                            ".avi", ".mov", ".mp3", ".wav",
                        ];
                        if let Some(ref custom) = rules.custom_file_options {
                            if let Some(c) = custom.get("media") {
                                media.extend(c.iter().map(|s| s.as_str()));
                            }
                        }
                        filter_defaults(&mut media, rules, "media");
                        if media.contains(&ext.as_str()) {
                            return true;
                        }
                    }
                    "archives" => {
                        let mut archives =
                            vec![".zip", ".rar", ".tar", ".gz", ".7z"];
                        if let Some(ref custom) = rules.custom_file_options {
                            if let Some(c) = custom.get("archives") {
                                archives.extend(c.iter().map(|s| s.as_str()));
                            }
                        }
                        filter_defaults(&mut archives, rules, "archives");
                        if archives.contains(&ext.as_str()) {
                            return true;
                        }
                    }
                    _other => {
                        // Custom/dynamic: only check THIS specific category's extensions
                        if let Some(ref custom) = rules.custom_file_options {
                            if let Some(extensions) = custom.get(_other) {
                                if extensions.iter().any(|e| e.as_str() == ext) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
            rules.create_other_folder
        })
        .cloned()
        .collect()
}

fn filter_by_excluded_days(
    files: &[String],
    source_path: &Path,
    rules: &OrganizeRules,
) -> Result<Vec<String>, String> {
    // Parse excluded dates into a set
    let mut excluded_dates: HashSet<String> = HashSet::new();
    if let Some(ref dates) = rules.excluded_specific_dates {
        for d in dates {
            excluded_dates.insert(d.clone());
        }
    }

    let day_map: HashMap<&str, u32> = [
        ("sunday", 0),
        ("monday", 1),
        ("tuesday", 2),
        ("wednesday", 3),
        ("thursday", 4),
        ("friday", 5),
        ("saturday", 6),
    ]
    .iter()
    .cloned()
    .collect();

    let excluded_day_nums: HashSet<u32> = rules
        .excluded_days
        .iter()
        .filter_map(|d| day_map.get(d.as_str()).copied())
        .collect();

    let filtered: Vec<String> = files
        .iter()
        .filter(|name| {
            let path = source_path.join(name);
            if let Ok(meta) = fs::metadata(&path) {
                if let Ok(created) = meta.created() {
                    let dt = created_to_naive(created);
                    let date_str = dt.format("%Y-%m-%d").to_string();
                    if excluded_dates.contains(&date_str) {
                        return false;
                    }
                    if excluded_day_nums.contains(&dt.weekday().num_days_from_sunday())
                    {
                        return false;
                    }
                    return true;
                }
            }
            // If metadata is unreadable, keep the file
            true
        })
        .cloned()
        .collect();
    Ok(filtered)
}

// ── Path building ───────────────────────────────────────────────────────

fn build_organized_path(
    dest_base: &Path,
    src_path: &Path,
    rules: &OrganizeRules,
    use_numeric_months: bool,
    create_other_folder: bool,
) -> Result<PathBuf, String> {
    let mut parts: Vec<String> = vec![dest_base.to_string_lossy().to_string()];
    let time_enabled = rules.time_toggle && !rules.time_options.is_empty();
    let filetype_enabled = rules.file_type_toggle && !rules.file_types.is_empty();

    // Read file creation time once
    let dt_opt = if time_enabled {
        let meta = fs::metadata(src_path).map_err(|e| e.to_string())?;
        let created = meta
            .created()
            .map_err(|e| format!("Cannot read creation time: {}", e))?;
        Some(created_to_naive(created))
    } else {
        None
    };

    // File type folder FIRST (top-level under destination)
    if filetype_enabled {
        let ext = src_path
            .extension()
            .map(|e| format!(".{}", e.to_string_lossy().to_lowercase()))
            .unwrap_or_default();
        let folder = get_file_type_folder(&ext, rules);
        // Skip "Other" folder if the user hasn't enabled it
        if folder != "Other" || create_other_folder {
            parts.push(folder);
        }
    }

    // Time-based folder SECOND — build a single combined folder name
    if let Some(ref dt) = dt_opt {
        // Check if any per-option custom names are set
        let has_custom = rules.year_custom_name.is_some()
            || rules.month_custom_name.is_some()
            || rules.week_custom_name.is_some()
            || rules.day_custom_name.is_some();

        if has_custom {
            // Compute all replacement values once
            let year_val = dt.year().to_string();
            let month_val = format_month(dt.month(), use_numeric_months);
            let has_month_for_week = rules.time_options.iter().any(|o| o == "month");
            let has_year_for_week = rules.time_options.iter().any(|o| o == "year");
            let week_val = compute_week_label(dt, has_month_for_week, has_year_for_week);
            let day_val = format!("{:02}", dt.day());

            // Helper: apply ALL placeholder replacements to a name
            let apply_all = |name: &str| -> String {
                name.replace("{Year}", &year_val)
                    .replace("{Month}", &month_val)
                    .replace("{Week}", &week_val)
                    .replace("{Day}", &day_val)
            };

            for opt in &rules.time_options {
                match opt.as_str() {
                    "year" => {
                        let name = rules.year_custom_name.as_ref()
                            .map(|n| apply_all(n))
                            .unwrap_or_else(|| year_val.clone());
                        parts.push(name);
                    }
                    "month" => {
                        let name = rules.month_custom_name.as_ref()
                            .map(|n| apply_all(n))
                            .unwrap_or_else(|| month_val.clone());
                        parts.push(name);
                    }
                    "week" => {
                        let name = rules.week_custom_name.as_ref()
                            .map(|n| apply_all(n))
                            .unwrap_or_else(|| week_val.clone());
                        parts.push(name);
                    }
                    "day" => {
                        let name = rules.day_custom_name.as_ref()
                            .map(|n| apply_all(n))
                            .unwrap_or_else(|| day_val.clone());
                        parts.push(name);
                    }
                    _ => {}
                }
            }
        } else {
            // Default naming
            let has_year = rules.time_options.iter().any(|o| o == "year");
            let has_month = rules.time_options.iter().any(|o| o == "month");
            let week_label = compute_week_label(dt, has_month, has_year);

            if has_year {
                // Nested folders: year / month / week / day
                for opt in &rules.time_options {
                    match opt.as_str() {
                        "year" => parts.push(dt.year().to_string()),
                        "month" => parts.push(month_name(dt.month()).to_string()),
                        "week" => parts.push(week_label.clone()),
                        "day" => parts.push(format!("{:02}", dt.day())),
                        _ => {}
                    }
                }
            } else if has_month {
                // Month provides context; nest week/day under it
                let context = format!("{}-{}", dt.year(), format_month(dt.month(), use_numeric_months));
                let mut pushed_context = false;
                for opt in &rules.time_options {
                    match opt.as_str() {
                        "month" => {
                            parts.push(context.clone());
                            pushed_context = true;
                        }
                        "week" => {
                            if !pushed_context {
                                parts.push(context.clone());
                                pushed_context = true;
                            }
                            parts.push(week_label.clone());
                        }
                        "day" => {
                            if !pushed_context {
                                parts.push(context.clone());
                                pushed_context = true;
                            }
                            parts.push(format!("{:02}", dt.day()));
                        }
                        _ => {}
                    }
                }
            } else {
                // No year, no month — combine everything into a single folder
                let mut label = format!("{}-{}", dt.year(), format_month(dt.month(), use_numeric_months));
                for opt in &rules.time_options {
                    match opt.as_str() {
                        "week" => {
                            label = format!("{}-{}", label, week_label);
                        }
                        "day" => {
                            label = format!("{}-{}", label, format!("{:02}", dt.day()));
                        }
                        _ => {}
                    }
                }
                parts.push(label);
            }
        }
    }

    // Filename
    if let Some(name) = src_path.file_name() {
        parts.push(name.to_string_lossy().to_string());
    } else {
        return Err("Invalid source filename".into());
    }

    let dest: PathBuf = parts.iter().collect();
    Ok(dest)
}

fn compute_week_label(dt: &NaiveDateTime, has_month: bool, has_year: bool) -> String {
    if has_month {
        let week_of_month = ((dt.day() - 1) / 7) + 1;
        format!("Week_{}", week_of_month)
    } else if has_year {
        let week_of_year = dt.iso_week().week();
        format!("Week_{}", week_of_year)
    } else {
        let week_of_year = dt.iso_week().week();
        format!("Week_{}", week_of_year)
    }
}

fn get_file_type_folder(ext: &str, rules: &OrganizeRules) -> String {
    let default_docs = &[".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt"];
    let default_media = &[
        ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".mp4", ".avi", ".mov", ".mp3", ".wav",
    ];
    let default_archives = &[".zip", ".rar", ".tar", ".gz", ".7z"];

    for file_type in &rules.file_types {
        match file_type.as_str() {
            "documents" => {
                let mut docs: Vec<&str> = default_docs.to_vec();
                if let Some(ref custom) = rules.custom_file_options {
                    if let Some(c) = custom.get("documents") {
                        docs.extend(c.iter().map(|s| s.as_str()));
                    }
                }
                filter_defaults(&mut docs, rules, "documents");
                if docs.contains(&ext) {
                    return rules.file_type_names.as_ref()
                        .and_then(|m| m.get("documents"))
                        .cloned()
                        .unwrap_or_else(|| "Documents".to_string());
                }
            }
            "media" => {
                let mut media: Vec<&str> = default_media.to_vec();
                if let Some(ref custom) = rules.custom_file_options {
                    if let Some(c) = custom.get("media") {
                        media.extend(c.iter().map(|s| s.as_str()));
                    }
                }
                filter_defaults(&mut media, rules, "media");
                if media.contains(&ext) {
                    return rules.file_type_names.as_ref()
                        .and_then(|m| m.get("media"))
                        .cloned()
                        .unwrap_or_else(|| "Media".to_string());
                }
            }
            "archives" => {
                let mut archives: Vec<&str> = default_archives.to_vec();
                if let Some(ref custom) = rules.custom_file_options {
                    if let Some(c) = custom.get("archives") {
                        archives.extend(c.iter().map(|s| s.as_str()));
                    }
                }
                filter_defaults(&mut archives, rules, "archives");
                if archives.contains(&ext) {
                    return rules.file_type_names.as_ref()
                        .and_then(|m| m.get("archives"))
                        .cloned()
                        .unwrap_or_else(|| "Archives".to_string());
                }
            }
            other => {
                // Custom/dynamic category: only check THIS specific category's extensions
                if let Some(ref custom) = rules.custom_file_options {
                    if let Some(extensions) = custom.get(other) {
                        if extensions.iter().any(|e| e.as_str() == ext) {
                            return rules.file_type_names.as_ref()
                                .and_then(|m| m.get(other))
                                .cloned()
                                .unwrap_or_else(|| other.to_string());
                        }
                    }
                }
            }
        }
    }
    "Other".to_string()
}

// ── Utilities ───────────────────────────────────────────────────────────

#[cfg(unix)]
fn created_to_naive(created: std::time::SystemTime) -> NaiveDateTime {
    use std::time::UNIX_EPOCH;
    let duration = created.duration_since(UNIX_EPOCH).unwrap_or_default();
    let secs = duration.as_secs() as i64;
    let nsecs = duration.subsec_nanos();
    Local.timestamp_opt(secs, nsecs)
        .unwrap()
        .naive_local()
}

#[cfg(not(unix))]
fn created_to_naive(created: std::time::SystemTime) -> NaiveDateTime {
    use std::time::UNIX_EPOCH;
    let duration = created.duration_since(UNIX_EPOCH).unwrap_or_default();
    let secs = duration.as_secs() as i64;
    let nsecs = duration.subsec_nanos();
    Local.timestamp_opt(secs, nsecs)
        .unwrap()
        .naive_local()
}

fn month_name(month: u32) -> &'static str {
    match month {
        1 => "January",
        2 => "February",
        3 => "March",
        4 => "April",
        5 => "May",
        6 => "June",
        7 => "July",
        8 => "August",
        9 => "September",
        10 => "October",
        11 => "November",
        12 => "December",
        _ => "Unknown",
    }
}

fn format_month(month: u32, numeric: bool) -> String {
    if numeric {
        format!("{:02}", month)
    } else {
        month_name(month).to_string()
    }
}

// ── App entry point ─────────────────────────────────────────────────────

#[tauri::command]
async fn close_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn minimize_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.minimize().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn toggle_fullscreen(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        let is_fullscreen = window.is_fullscreen().map_err(|e| e.to_string())?;
        window.set_fullscreen(!is_fullscreen).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn reveal_in_file_manager(path: String) -> Result<(), String> {
    use std::path::PathBuf;
    let p = PathBuf::from(&path);
    if !p.exists() { return Err("Path does not exist".into()); }
    #[cfg(target_os = "macos")]
    { std::process::Command::new("open").arg(&p).spawn().map_err(|e| e.to_string())?; }
    #[cfg(target_os = "windows")]
    { std::process::Command::new("explorer").arg(&p).spawn().map_err(|e| e.to_string())?; }
    #[cfg(target_os = "linux")]
    { std::process::Command::new("xdg-open").arg(&p).spawn().map_err(|e| e.to_string())?; }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                if let Some(window) = app.get_webview_window("main") {
                    let ns_window = window.ns_window().expect("NSWindow should exist");
                    plugins::mac_rounded_corners::enable_modern_window_style(
                        ns_window,
                        plugins::mac_rounded_corners::WindowStyle {
                            corner_radius: 16.0,
                            offset_x: 0.0,
                            offset_y: 0.0,
                        },
                    );
                }
            }

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![pick_folder, organize_files, close_window, minimize_window, toggle_fullscreen, reveal_in_file_manager])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
