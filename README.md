# Morganized
> Easily organize your files with just simple clicks. Simple but powerful.

Morganized is a desktop file organization app built with [Tauri](https://tauri.app/) and Rust. Organize messy folders by **time** (year → month → week → day) and **file type** (documents, media, archives, or custom categories) with a live preview before you commit.

---

## Features

- **Dual-pane UI** — task workspace on the left, rich rules engine on the right
- **Organize by time** — year, month, week, day with date range and day exclusion
- **Organize by file type** — built-in Documents, Media, Archives categories + custom categories
- **Live preview** — see the resulting folder tree before moving a single file
- **Acrylic design** — semi-transparent glass UI with blur, light/dark mode, and theme colors
- **Multi-language** — English, 简体中文, 繁體中文, 日本語, 한국어
- **Per-task saving** — create, rename, and save multiple organization tasks
- **Open folders** — click any folder path to reveal it in Finder/Explorer

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | [Tauri 2.x](https://tauri.app/) |
| Backend | Rust |
| Frontend | Vanilla JS, CSS, HTML |
| Icons | Material Symbols (Google Fonts) |
| Platform | macOS, Windows, Linux* |

*Morganized is not tested on Linux and requires self-build.
---

## Development

### Prerequisites

- [Rust](https://rustup.rs/) 1.77+
- [Node.js](https://nodejs.org/) (for `package.json` scripts)
- macOS: Xcode Command Line Tools
- Windows: Microsoft Visual Studio C++ Build Tools
- Linux: `webkit2gtk`, `libgtk-3-dev`, and other [Tauri prerequisites](https://tauri.app/start/prerequisites/)

### Setup

```bash
git clone <repo-url>
cd Morganized-Tauri
npm install        # optional, for convenience scripts
cd src-tauri
cargo build
```

### Run

```bash
npm run tauri dev
# or
cd src-tauri && cargo tauri dev
```

### Build

```bash
npm run tauri build
# or
cd src-tauri && cargo tauri build
```

Output goes to `src-tauri/target/release/bundle/`.

---

## Project Structure

```
Morganized-Tauri/
├── src/                      # Frontend (HTML, CSS, JS)
│   ├── index.html            # Main window
│   ├── index.js              # Entry point
│   ├── style.css             # Acrylic dark/light theme
│   ├── modules/
│   │   ├── i18n.js           # Translations (en/zh/zh-TW/ja/ko)
│   │   ├── state.js          # Task CRUD, view management
│   │   ├── rules.js          # Form collection, rules engine
│   │   ├── categories.js     # Custom file categories
│   │   ├── preview.js        # Preview tree generation
│   │   ├── settings.js       # Settings panel
│   │   ├── window.js         # Window controls & focus tracking
│   │   └── ipc.js            # Tauri bridge
│   └── assets/               # Images, icons, brand
│       └── Icon Exports/     # App icon source files
├── src-tauri/                # Rust backend
│   ├── src/
│   │   ├── lib.rs            # Commands: organize, pick_folder, reveal
│   │   ├── main.rs           # Entry point
│   │   └── plugins/
│   │       └── mac_rounded_corners.rs
│   ├── icons/                # App icons (all platforms)
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
└── README.md
```

---

## Settings

| Setting | Description |
|---|---|
| Light mode | Toggle between dark acrylic and light acrylic themes |
| Solid background | Disable acrylic transparency for a flat look |
| Use 24-hour time | Toggle time format in date pickers |
| Use translated folder names | Folder names on disk follow the UI language |
| Theme color | Choose accent color (pink, blue, green, purple) |
| Language | English, 简体中文, 繁體中文, 日本語, 한국어 |

---

## App Icon

Generated from `src/assets/Icon Exports/` using:

```bash
magick input.png -resize 820x820 -gravity center -background none -extent 1024x1024 icon-base.png
iconutil -c icns icon.iconset -o icon.icns
magick 128.png 32.png 256.png 512.png -colors 256 icon.ico
```

---

## License

ISC

---

> Developed by © UNLOOP MORGAN
