// ═══════════════════════════════════════════════════════════════
// I18N — Translations for en / zh / ja / ko
// ═══════════════════════════════════════════════════════════════

var LOCALE = {
  en: {
    // App
    organized: "Morganized",
    newTask: "New Task",
    createNewTask: "Create New Task",
    welcomeUser: "Welcome, User!",
    welcomeSub: "What do you want to organize today?",
    savedTasks: "Saved Tasks",
    noSavedTasks: "No saved tasks yet. Create one to get started.",
    ready: "Ready.",

    // Left panel
    sourceFolder: "Pick Source Folder",
    destFolder: "Pick Destination Folder",
    noFolder: "No folder selected",
    organizeFiles: "Organize Files",
    defineLogic: "Define your file organization logic",

    // Tabs
    tasks: "Tasks",
    preview: "Preview",
    settings: "Settings",

    // Rules
    organizeRules: "Organize Rules",
    organizeByTime: "Organize by Time",
    organizeByFileTypes: "Organize by File Types",
    coreDimensions: "Core Dimensions",
    year: "Year",
    month: "Month",
    week: "Week",
    day: "Day",
    timeRange: "Time Range",
    startDate: "Start Date",
    endDate: "End Date",
    startTime: "Start Time",
    endTime: "End Time",
    dayExclusion: "Day Exclusion",
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    excludeSpecificDates: "EXCLUDE SPECIFIC DATES",
    fileOperations: "File Operations",
    moveFiles: "Move files (instead of copy)",
    skipHidden: "Skip hidden files",
    skipDSStore: "Skip .DS_Store files",
    useNumericMonths: "Use numbers for months (01 instead of January)",
    createOtherFolder: "Create folder for file types not included in categories",
    useDateModified: "Use Date Modified (instead of Date Created)",
    fileTypeFilter: "File Type Filter",
    addExtPlaceholder: "Add extension (e.g. .jpg)",
    add: "Add",
    applyRules: "Update Preview",
    reset: "Reset",
    resetConfirm: "Reset all rules? This cannot be undone.",
    saveRules: "Save Rules",

    // Categories
    documents: "Documents (PDF, DOCX, TXT)",
    media: "Media (Images, Videos, Audio)",
    archives: "Archives (ZIP, RAR)",
    addCategory: "+ Add Category",
    categoryName: "Category name",
    cancel: "Cancel",
    confirm: "Confirm",

    // Settings
    appearance: "Appearance",
    lightMode: "Light mode",
    solidBg: "Solid background",
    themeColor: "Theme color",
    profile: "Profile",
    about: "About",
    language: "Language",
    use24h: "Use 24-hour time (00:00 – 23:59)",
    saveDefaultCatsEnglish: "Use translated folder names",
    back: "Back",

    // Sort
    sort: "Sort:",
    sortNameAsc: "Name (A-Z)",
    sortNameDesc: "Name (Z-A)",
    sortTimeDesc: "Time (Newest first)",
    sortTimeAsc: "Time (Oldest first)",

    // Status
    noRules: "No rules applied yet",
    rules: "rules",
    nRules: "{0} rules",
    selectFolders: "Please select both source and destination folders.",
    organizing: "Organizing files…",
    processing: "Processing",
    completed: "Completed",
    filesProcessed: "file(s) processed.",
    previewReady: "Preview ready.",
    generatingPreview: "Generating preview…",
    noFiles: "No files to organize",
    allFiltered: "All files would be filtered out by the current rules",
    filteredByRules: "Filtered by rules",
    pleaseEnterName: "Please enter a category name.",
    categoryAdded: 'Category',
    added: "added.",
    overlapWarn: "is in both",
    filesGoToFirst: "— files go to the first listed category",

    // Time
    hhmm: "HH:MM",
    enable: "Enable",
    disable: "Disable",

    // Misc
    previewFailed: "Preview failed:",
    enableOneOption: "Please enable at least one organization option (File Types or Time) to preview.",
    previewingRules: "Previewing organize rules...",
    selectFoldersPreview: "Please select both source and destination folders before previewing.",
    titleTasks: "TaskName — Tasks",
    titlePreview: "TaskName — Preview",
    titleSettings: "TaskName — Settings",
    rename: "Rename",
    saveTask: "Save Task",
    saved: "Saved!",

    // Unsaved changes modal
    unsavedTitle: "You have unsaved changes.",
    unsavedSub: "Save before leaving?",
    leave: "Leave",
    saveLeave: "Save & Leave",
  },

  zh: {
    organized: "Morganized",
    newTask: "新任务",
    createNewTask: "创建新任务",
    welcomeUser: "欢迎, User!",
    welcomeSub: "今天想整理什么？",
    savedTasks: "已保存的任务",
    noSavedTasks: "还没有保存的任务。创建一个开始吧。",
    ready: "就绪。",
    sourceFolder: "选择源文件夹",
    destFolder: "选择目标文件夹",
    noFolder: "未选择文件夹",
    organizeFiles: "整理文件",
    defineLogic: "定义你的文件整理逻辑",
    tasks: "任务",
    preview: "预览",
    settings: "设置",
    organizeRules: "整理规则",
    organizeByTime: "按时间整理",
    organizeByFileTypes: "按文件类型整理",
    coreDimensions: "核心维度",
    year: "年",
    month: "月",
    week: "周",
    day: "日",
    timeRange: "时间范围",
    startDate: "开始日期",
    endDate: "结束日期",
    startTime: "开始时间",
    endTime: "结束时间",
    dayExclusion: "日期排除",
    sunday: "星期日",
    monday: "星期一",
    tuesday: "星期二",
    wednesday: "星期三",
    thursday: "星期四",
    friday: "星期五",
    saturday: "星期六",
    excludeSpecificDates: "排除特定日期",
    fileOperations: "文件操作",
    moveFiles: "移动文件（而非复制）",
    skipHidden: "跳过隐藏文件",
    skipDSStore: "跳过 .DS_Store 文件",
    useNumericMonths: "使用数字月份（01 代替 January）",
    createOtherFolder: "为未分类文件创建文件夹",
    useDateModified: "使用修改日期（而非创建日期）",
    fileTypeFilter: "文件类型过滤",
    addExtPlaceholder: "添加扩展名（如 .jpg）",
    add: "添加",
    applyRules: "更新预览",
    reset: "重置",
    resetConfirm: "重置所有规则？此操作无法撤销。",
    saveRules: "保存规则",
    documents: "文档 (PDF, DOCX, TXT)",
    media: "媒体 (图片, 视频, 音频)",
    archives: "压缩包 (ZIP, RAR)",
    addCategory: "+ 添加分类",
    categoryName: "分类名称",
    cancel: "取消",
    confirm: "确认",
    appearance: "外观",
    lightMode: "浅色模式",
    solidBg: "纯色背景",
    themeColor: "主题颜色",
    profile: "个人资料",
    about: "关于",
    language: "语言",
    use24h: "使用24小时制 (00:00 – 23:59)",
    saveDefaultCatsEnglish: "使用翻译后的文件夹名称",
    back: "返回",
    sort: "排序:",
    sortNameAsc: "名称 (A-Z)",
    sortNameDesc: "名称 (Z-A)",
    sortTimeDesc: "时间 (最新优先)",
    sortTimeAsc: "时间 (最早优先)",
    noRules: "尚未应用规则",
    rules: "规则",
    nRules: "{0} 个整理规则",
    selectFolders: "请选择源文件夹和目标文件夹。",
    organizing: "正在整理文件…",
    processing: "处理中",
    completed: "完成",
    filesProcessed: "个文件已处理。",
    previewReady: "预览就绪。",
    generatingPreview: "正在生成预览…",
    noFiles: "没有文件需要整理",
    allFiltered: "当前规则会过滤掉所有文件",
    filteredByRules: "被规则过滤",
    pleaseEnterName: "请输入分类名称。",
    categoryAdded: "分类",
    added: "已添加。",
    overlapWarn: "同时存在于",
    filesGoToFirst: "— 文件将归入第一个分类",
    hhmm: "HH:MM",
    enable: "启用",
    disable: "禁用",
    previewFailed: "预览失败:",
    enableOneOption: "请至少启用一个整理选项（文件类型或时间）以预览。",
    previewingRules: "正在预览整理规则...",
    selectFoldersPreview: "请在预览前选择源文件夹和目标文件夹。",
    titleTasks: "TaskName — 任务",
    titlePreview: "TaskName — 预览",
    titleSettings: "TaskName — 设置",
    rename: "重命名",
    saveTask: "保存任务",
    saved: "已保存!",

    // Unsaved changes modal
    unsavedTitle: "您有未保存的更改。",
    unsavedSub: "是否在离开前保存？",
    leave: "离开",
    saveLeave: "保存并离开",
  },

  "zh-TW": {
    organized: "Morganized",
    newTask: "新任務",
    createNewTask: "建立新任務",
    welcomeUser: "歡迎, User!",
    welcomeSub: "今天想整理什麼？",
    savedTasks: "已儲存的任務",
    noSavedTasks: "尚無已儲存的任務。建立一個開始吧。",
    ready: "就緒。",
    sourceFolder: "選擇來源資料夾",
    destFolder: "選擇目標資料夾",
    noFolder: "未選擇資料夾",
    organizeFiles: "整理檔案",
    defineLogic: "定義你的檔案整理邏輯",
    tasks: "任務",
    preview: "預覽",
    settings: "設定",
    organizeRules: "整理規則",
    organizeByTime: "按時間整理",
    organizeByFileTypes: "按檔案類型整理",
    coreDimensions: "核心維度",
    year: "年",
    month: "月",
    week: "週",
    day: "日",
    timeRange: "時間範圍",
    startDate: "開始日期",
    endDate: "結束日期",
    startTime: "開始時間",
    endTime: "結束時間",
    dayExclusion: "排除日期",
    sunday: "星期日",
    monday: "星期一",
    tuesday: "星期二",
    wednesday: "星期三",
    thursday: "星期四",
    friday: "星期五",
    saturday: "星期六",
    excludeSpecificDates: "排除特定日期",
    fileOperations: "檔案操作",
    moveFiles: "移動檔案（而非複製）",
    skipHidden: "跳過隱藏檔案",
    skipDSStore: "跳過 .DS_Store 檔案",
    useNumericMonths: "使用數字表示月份（01 取代 January）",
    createOtherFolder: "為未分類的檔案類型建立資料夾",
    useDateModified: "使用修改日期（而非建立日期）",
    fileTypeFilter: "檔案類型過濾",
    addExtPlaceholder: "新增副檔名（例如 .jpg）",
    add: "新增",
    applyRules: "更新預覽",
    reset: "重設",
    resetConfirm: "重設所有規則？此操作無法復原。",
    saveRules: "儲存規則",
    documents: "文件（PDF, DOCX, TXT）",
    media: "媒體（圖片, 影片, 音訊）",
    archives: "壓縮檔（ZIP, RAR）",
    addCategory: "+ 新增分類",
    categoryName: "分類名稱",
    cancel: "取消",
    confirm: "確認",
    appearance: "外觀",
    lightMode: "淺色模式",
    solidBg: "純色背景",
    themeColor: "主題色彩",
    profile: "個人檔案",
    about: "關於",
    language: "語言",
    use24h: "使用 24 小時制（00:00 – 23:59）",
    saveDefaultCatsEnglish: "使用翻譯後的資料夾名稱",
    back: "返回",
    sort: "排序:",
    sortNameAsc: "名稱（A-Z）",
    sortNameDesc: "名稱（Z-A）",
    sortTimeDesc: "時間（最新優先）",
    sortTimeAsc: "時間（最舊優先）",
    noRules: "尚未套用規則",
    rules: "規則",
    nRules: "{0} 個整理規則",
    selectFolders: "請選擇來源與目標資料夾。",
    organizing: "正在整理檔案…",
    processing: "處理中",
    completed: "完成",
    filesProcessed: "個檔案已處理。",
    previewReady: "預覽已就緒。",
    generatingPreview: "正在產生預覽…",
    noFiles: "沒有可整理的檔案",
    allFiltered: "當前規則會過濾掉所有檔案",
    filteredByRules: "已被規則過濾",
    pleaseEnterName: "請輸入分類名稱。",
    categoryAdded: "分類",
    added: "已新增。",
    overlapWarn: "同時存在於",
    filesGoToFirst: "— 檔案將移至第一個列出的分類",
    hhmm: "HH:MM",
    enable: "啟用",
    disable: "停用",
    previewFailed: "預覽失敗:",
    enableOneOption: "請至少啟用一個整理選項（檔案類型或時間）以進行預覽。",
    previewingRules: "正在預覽整理規則...",
    selectFoldersPreview: "預覽前請先選擇來源與目標資料夾。",
    titleTasks: "TaskName — 任務",
    titlePreview: "TaskName — 預覽",
    titleSettings: "TaskName — 設定",
    rename: "重新命名",
    saveTask: "儲存任務",
    saved: "已儲存！",

    // Unsaved changes modal
    unsavedTitle: "您有未儲存的更改。",
    unsavedSub: "是否在離開前儲存？",
    leave: "離開",
    saveLeave: "儲存並離開",
  },

  ja: {
    organized: "Morganized",
    newTask: "新規タスク",
    createNewTask: "新規タスクを作成",
    welcomeUser: "ようこそ, User!",
    welcomeSub: "今日は何を整理しますか？",
    savedTasks: "保存済みタスク",
    noSavedTasks: "保存されたタスクはまだありません。作成して始めましょう。",
    ready: "準備完了。",
    sourceFolder: "ソースフォルダを選択",
    destFolder: "宛先フォルダを選択",
    noFolder: "フォルダが選択されていません",
    organizeFiles: "ファイルを整理",
    defineLogic: "ファイル整理ロジックを定義",
    tasks: "タスク",
    preview: "プレビュー",
    settings: "設定",
    organizeRules: "整理ルール",
    organizeByTime: "時間で整理",
    organizeByFileTypes: "ファイルタイプで整理",
    coreDimensions: "コアディメンション",
    year: "年",
    month: "月",
    week: "週",
    day: "日",
    timeRange: "時間範囲",
    startDate: "開始日",
    endDate: "終了日",
    startTime: "開始時間",
    endTime: "終了時間",
    dayExclusion: "曜日除外",
    sunday: "日曜日",
    monday: "月曜日",
    tuesday: "火曜日",
    wednesday: "水曜日",
    thursday: "木曜日",
    friday: "金曜日",
    saturday: "土曜日",
    excludeSpecificDates: "特定の日付を除外",
    fileOperations: "ファイル操作",
    moveFiles: "ファイルを移動（コピーではなく）",
    skipHidden: "隠しファイルをスキップ",
    skipDSStore: ".DS_Store ファイルをスキップ",
    useNumericMonths: "月を数字で表示（01 で January の代わり）",
    createOtherFolder: "未分類ファイル用フォルダを作成",
    useDateModified: "更新日時を使用（作成日時ではなく）",
    fileTypeFilter: "ファイルタイプフィルター",
    addExtPlaceholder: "拡張子を追加（例: .jpg）",
    add: "追加",
    applyRules: "プレビューを更新",
    reset: "リセット",
    resetConfirm: "すべてのルールをリセットしますか？この操作は元に戻せません。",
    saveRules: "ルールを保存",
    documents: "ドキュメント (PDF, DOCX, TXT)",
    media: "メディア (画像, 動画, 音声)",
    archives: "アーカイブ (ZIP, RAR)",
    addCategory: "+ カテゴリを追加",
    categoryName: "カテゴリ名",
    cancel: "キャンセル",
    confirm: "確認",
    appearance: "外観",
    lightMode: "ライトモード",
    solidBg: "ソリッド背景",
    themeColor: "テーマカラー",
    profile: "プロフィール",
    about: "について",
    language: "言語",
    use24h: "24時間表示 (00:00 – 23:59)",
    saveDefaultCatsEnglish: "翻訳されたフォルダ名を使用",
    back: "戻る",
    sort: "並び替え:",
    sortNameAsc: "名前 (A-Z)",
    sortNameDesc: "名前 (Z-A)",
    sortTimeDesc: "時間 (新しい順)",
    sortTimeAsc: "時間 (古い順)",
    noRules: "ルールはまだ適用されていません",
    rules: "ルール",
    nRules: "{0} ルール",
    selectFolders: "ソースと宛先の両方のフォルダを選択してください。",
    organizing: "ファイルを整理中…",
    processing: "処理中",
    completed: "完了",
    filesProcessed: "件のファイルを処理しました。",
    previewReady: "プレビュー準備完了。",
    generatingPreview: "プレビューを生成中…",
    noFiles: "整理するファイルがありません",
    allFiltered: "現在のルールではすべてのファイルが除外されます",
    filteredByRules: "ルールによりフィルター",
    pleaseEnterName: "カテゴリ名を入力してください。",
    categoryAdded: "カテゴリ",
    added: "を追加しました。",
    overlapWarn: "が両方に存在します",
    filesGoToFirst: "— ファイルは最初のカテゴリに振り分けられます",
    hhmm: "HH:MM",
    enable: "有効",
    disable: "無効",
    previewFailed: "プレビュー失敗:",
    enableOneOption: "プレビューするには少なくとも1つの整理オプションを有効にしてください。",
    previewingRules: "整理ルールをプレビュー中...",
    selectFoldersPreview: "プレビュー前にソースと宛先フォルダを選択してください。",
    titleTasks: "TaskName — タスク",
    titlePreview: "TaskName — プレビュー",
    titleSettings: "TaskName — 設定",
    rename: "名前変更",
    saveTask: "タスクを保存",
    saved: "保存しました!",

    // Unsaved changes modal
    unsavedTitle: "未保存の変更があります。",
    unsavedSub: "離れる前に保存しますか？",
    leave: "離れる",
    saveLeave: "保存して離れる",
  },

  ko: {
    organized: "Morganized",
    newTask: "새 작업",
    createNewTask: "새 작업 만들기",
    welcomeUser: "환영합니다, User!",
    welcomeSub: "오늘은 무엇을 정리할까요?",
    savedTasks: "저장된 작업",
    noSavedTasks: "아직 저장된 작업이 없습니다. 새로 만들어 시작하세요.",
    ready: "준비 완료.",
    sourceFolder: "소스 폴더 선택",
    destFolder: "대상 폴더 선택",
    noFolder: "선택된 폴더 없음",
    organizeFiles: "파일 정리",
    defineLogic: "파일 정리 로직 정의",
    tasks: "작업",
    preview: "미리보기",
    settings: "설정",
    organizeRules: "정리 규칙",
    organizeByTime: "시간별 정리",
    organizeByFileTypes: "파일 유형별 정리",
    coreDimensions: "핵심 기준",
    year: "년",
    month: "월",
    week: "주",
    day: "일",
    timeRange: "시간 범위",
    startDate: "시작 날짜",
    endDate: "종료 날짜",
    startTime: "시작 시간",
    endTime: "종료 시간",
    dayExclusion: "요일 제외",
    sunday: "일요일",
    monday: "월요일",
    tuesday: "화요일",
    wednesday: "수요일",
    thursday: "목요일",
    friday: "금요일",
    saturday: "토요일",
    excludeSpecificDates: "특정 날짜 제외",
    fileOperations: "파일 작업",
    moveFiles: "파일 이동 (복사 대신)",
    skipHidden: "숨김 파일 건너뛰기",
    skipDSStore: ".DS_Store 파일 건너뛰기",
    useNumericMonths: "숫자 월 사용 (01이 January 대신)",
    createOtherFolder: "미분류 파일용 폴더 생성",
    useDateModified: "수정한 날짜 사용 (만든 날짜 대신)",
    fileTypeFilter: "파일 유형 필터",
    addExtPlaceholder: "확장자 추가 (예: .jpg)",
    add: "추가",
    applyRules: "미리보기 업데이트",
    reset: "초기화",
    resetConfirm: "모든 규칙을 초기화하시겠습니까? 이 작업은 취소할 수 없습니다.",
    saveRules: "규칙 저장",
    documents: "문서 (PDF, DOCX, TXT)",
    media: "미디어 (이미지, 비디오, 오디오)",
    archives: "압축파일 (ZIP, RAR)",
    addCategory: "+ 카테고리 추가",
    categoryName: "카테고리 이름",
    cancel: "취소",
    confirm: "확인",
    appearance: "외관",
    lightMode: "라이트 모드",
    solidBg: "단색 배경",
    themeColor: "테마 색상",
    profile: "프로필",
    about: "정보",
    language: "언어",
    use24h: "24시간제 사용 (00:00 – 23:59)",
    saveDefaultCatsEnglish: "번역된 폴더 이름 사용",
    back: "뒤로",
    sort: "정렬:",
    sortNameAsc: "이름 (A-Z)",
    sortNameDesc: "이름 (Z-A)",
    sortTimeDesc: "시간 (최신순)",
    sortTimeAsc: "시간 (오래된순)",
    noRules: "적용된 규칙 없음",
    rules: "규칙",
    nRules: "{0} 규칙",
    selectFolders: "소스와 대상 폴더를 모두 선택하세요.",
    organizing: "파일 정리 중…",
    processing: "처리 중",
    completed: "완료",
    filesProcessed: "개 파일 처리됨.",
    previewReady: "미리보기 준비 완료.",
    generatingPreview: "미리보기 생성 중…",
    noFiles: "정리할 파일이 없습니다",
    allFiltered: "현재 규칙으로 모든 파일이 필터링됩니다",
    filteredByRules: "규칙으로 필터링됨",
    pleaseEnterName: "카테고리 이름을 입력하세요.",
    categoryAdded: "카테고리",
    added: "추가됨.",
    overlapWarn: "이(가) 양쪽에 존재합니다",
    filesGoToFirst: "— 파일은 첫 번째 카테고리로 이동합니다",
    hhmm: "HH:MM",
    enable: "활성화",
    disable: "비활성화",
    previewFailed: "미리보기 실패:",
    enableOneOption: "미리보기하려면 파일 유형 또는 시간 옵션을 하나 이상 활성화하세요.",
    previewingRules: "정리 규칙 미리보기 중...",
    selectFoldersPreview: "미리보기 전에 소스 및 대상 폴더를 선택하세요.",
    titleTasks: "TaskName — 작업",
    titlePreview: "TaskName — 미리보기",
    titleSettings: "TaskName — 설정",
    rename: "이름 변경",
    saveTask: "작업 저장",
    saved: "저장됨!",

    // Unsaved changes modal
    unsavedTitle: "저장되지 않은 변경 사항이 있습니다.",
    unsavedSub: "떠나기 전에 저장하시겠습니까?",
    leave: "떠나기",
    saveLeave: "저장 후 떠나기",
  }
};

function currentLocale() {
  return localStorage.getItem('morganized-language') || 'en';
}

function t(key, replacements) {
  var lang = currentLocale();
  var dict = LOCALE[lang] || LOCALE.en;
  var str = dict[key];
  if (str === undefined && LOCALE.en) {
    // If key is an English string, find its translation key by value
    for (var k in LOCALE.en) {
      if (LOCALE.en[k] === key) {
        str = dict[k];
        break;
      }
    }
  }
  if (str === undefined) {
    // Last resort: use LOCALE.en value
    str = (LOCALE.en || {})[key];
  }
  if (str === undefined) return key;
  // Apply replacements {0}, {1}, ...
  if (replacements) {
    for (var i = 0; i < replacements.length; i++) {
      str = str.replace('{' + i + '}', replacements[i]);
    }
  }
  return str;
}

function applyI18n() {
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    // Use explicit key if set, otherwise store original text on first run
    var explicitKey = el.getAttribute('data-i18n');
    var key;
    if (explicitKey) {
      key = explicitKey;
    } else {
      // First run: store original English text as data-i18n-key
      if (!el.getAttribute('data-i18n-key')) {
        el.setAttribute('data-i18n-key', el.textContent.trim());
      }
      key = el.getAttribute('data-i18n-key');
    }
    // If it's an input placeholder
    if (el.tagName === 'INPUT' && el.hasAttribute('data-i18n-placeholder')) {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    } else if (el.tagName === 'INPUT') {
      el.value = t(key);
    } else {
      // Don't overwrite if element has child nodes (like buttons with icons)
      if (!el.querySelector('span, button')) {
        el.textContent = t(key);
      }
    }
  });

  // Update page title
  document.title = t('organized');

  // Refresh status bar
  var statusEl = document.getElementById('statusText');
  if (statusEl) statusEl.textContent = t('ready');

  // Refresh rules list
  var saved = localStorage.getItem('organizeRules');
  if (saved && typeof updateRulesList === 'function') {
    updateRulesList(JSON.parse(saved));
  }

  // Refresh saved tasks grid
  if (typeof renderSavedTasks === 'function') {
    renderSavedTasks();
  }

  // Refresh preview if visible
  var sp = document.getElementById('sourcePath');
  var dp = document.getElementById('destPath');
  if (sp && dp && typeof generatePreview === 'function') {
    var src = sp.innerText;
    var dst = dp.innerText;
    if (src && src !== t('noFolder') && dst && dst !== t('noFolder')) {
      generatePreview(src, dst);
    }
  }

  // Restore custom welcome title (overwritten by i18n translation)
  if (typeof updateWelcomeTitle === 'function') {
    updateWelcomeTitle();
  }
  // Refresh task title so tab suffix follows language
  if (typeof updateTaskViewTitle === 'function') {
    updateTaskViewTitle();
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
  applyI18n();
});
