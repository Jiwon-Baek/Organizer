const theme = {
  colors: {
    bg: "#f5f1e8",
    surface: "#fffdf8",
    surfaceAlt: "#f0e7d8",
    ink: "#1f1d1a",
    muted: "#736b5f",
    line: "#d7ccbb",
    accent: "#b3541e",
    accentSoft: "#f5d8c7",
    success: "#2f6f4f",
    danger: "#a2352b",
    shadow: "rgba(58, 36, 17, 0.12)",
  },
  fonts: {
    ui: "'NanumGothic', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif",
    mono: "'SFMono-Regular', Consolas, monospace",
  },
  radius: {
    sm: "8px",
    md: "14px",
    lg: "20px",
  },
  space: {
    xs: "4px",
    sm: "8px",
    md: "14px",
    lg: "20px",
    xl: "28px",
  },
};

const css = `
@font-face {
  font-family: 'NanumGothic';
  src: url('./assets/fonts/NanumGothic.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}
@font-face {
  font-family: 'NanumGothic';
  src: url('./assets/fonts/NanumGothic-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
}
@font-face {
  font-family: 'Freesentation';
  src: url('./assets/fonts/Freesentation-4Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}
@font-face {
  font-family: 'Freesentation';
  src: url('./assets/fonts/Freesentation-7Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
}

:root {
  --bg: ${theme.colors.bg};
  --surface: ${theme.colors.surface};
  --surface-alt: ${theme.colors.surfaceAlt};
  --ink: ${theme.colors.ink};
  --muted: ${theme.colors.muted};
  --line: ${theme.colors.line};
  --accent: ${theme.colors.accent};
  --accent-soft: ${theme.colors.accentSoft};
  --success: ${theme.colors.success};
  --danger: ${theme.colors.danger};
  --shadow: ${theme.colors.shadow};
  --font-ui: ${theme.fonts.ui};
  --font-mono: ${theme.fonts.mono};
  --font-ui-weight: 400;
  --font-strong: 700;
  --radius-sm: ${theme.radius.sm};
  --radius-md: ${theme.radius.md};
  --radius-lg: ${theme.radius.lg};
  --space-xs: ${theme.space.xs};
  --space-sm: ${theme.space.sm};
  --space-md: ${theme.space.md};
  --space-lg: ${theme.space.lg};
  --space-xl: ${theme.space.xl};
}

* { box-sizing: border-box; font-family: var(--font-ui); }
html, body {
  margin: 0;
  min-height: 100%;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-ui);
  font-size: 13px;
  -webkit-font-smoothing: antialiased;
}
body { min-height: 100vh; }
button, input, textarea, select, option { font: inherit; }
button { cursor: pointer; border: 0; background: none; color: inherit; }
input, textarea, select {
  width: 100%;
  border: 1px solid var(--line);
  background: rgba(255,255,255,0.86);
  color: var(--ink);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  font-size: 13px;
}
textarea { resize: vertical; min-height: 100px; }

/* ── Layout ─────────────────────────────── */
.app-shell {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  min-height: 100vh;
}
.app-shell.sidebar-hidden {
  grid-template-columns: minmax(0, 1fr);
}

/* ── Sidebar container (holds sidebar + toggle) ── */
.sidebar-container {
  position: relative;
  display: flex;
}
.sidebar-container.collapsed .sidebar {
  display: none;
}

.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #fffdf8 0%, #f5ede0 100%);
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  overflow-x: visible;
}

.sidebar-toggle {
  position: absolute;
  right: -12px;
  top: 16px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: 0 1px 4px var(--shadow);
  cursor: pointer;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--muted);
  padding: 0;
  flex-shrink: 0;
}
.sidebar-toggle:hover { background: var(--surface-alt); }

/* Floating toggle when sidebar is closed */
.sidebar-toggle-float {
  position: fixed;
  left: 6px;
  top: 14px;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: 0 1px 4px var(--shadow);
  z-index: 200;
  font-size: 9px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  padding: 0;
}
.sidebar-toggle-float:hover { background: var(--surface-alt); color: var(--ink); }

/* Sidebar header */
.sidebar-header {
  padding: 14px 14px 8px;
  border-bottom: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sidebar-brand {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  cursor: pointer;
}
.sidebar-brand:hover { color: var(--accent); }

/* Sidebar recent files link */
.sidebar-recent-link {
  font-size: 12px;
  color: var(--muted);
  padding: 5px 14px;
  cursor: pointer;
  display: block;
}
.sidebar-recent-link:hover { background: var(--surface-alt); color: var(--ink); }

/* ── Tree (Notebook / Chapter) ───────────── */
.tree,
.tree ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tree { padding: 6px 0; flex: 1; }

.tree-notebook-row,
.tree-chapter-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px 4px 10px;
  border-radius: 6px;
  position: relative;
  cursor: pointer;
  user-select: none;
}
.tree-notebook-row:hover,
.tree-chapter-row:hover {
  background: rgba(115,107,95,0.08);
}
.tree-notebook-row.active,
.tree-chapter-row.active {
  background: rgba(179,84,30,0.10);
}

.tree-icon { font-size: 14px; flex-shrink: 0; }
.tree-label {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tree-notebook-row .tree-label { font-weight: 600; font-size: 13px; }
.tree-chapter-row .tree-label { font-weight: 400; font-size: 12px; }

.tree-toggle {
  width: 18px;
  font-size: 10px;
  color: var(--muted);
  flex-shrink: 0;
  text-align: center;
  padding: 0;
}

/* 3-dot more button */
.more-btn {
  display: none;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tree-notebook-row:hover .more-btn,
.tree-chapter-row:hover .more-btn {
  display: flex;
}
.more-btn:hover {
  background: var(--surface-alt);
  color: var(--ink);
}

/* Notebook children indent */
.tree ul {
  padding-left: 12px;
  margin: 2px 0;
  border-left: 1px solid rgba(115,107,95,0.15);
  margin-left: 18px;
}

/* ── Context Menu ──────────────────────── */
.context-menu {
  position: fixed;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: 0 6px 20px var(--shadow);
  z-index: 300;
  min-width: 148px;
  padding: 4px 0;
  font-size: 13px;
}
.context-menu-item {
  padding: 7px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ink);
}
.context-menu-item:hover { background: var(--surface-alt); }
.context-menu-item.danger { color: var(--danger); }
.context-menu-sep {
  height: 1px;
  background: var(--line);
  margin: 3px 0;
}

/* ── Toolbar ─────────────────────────── */
.main {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
}

.toolbar {
  padding: 12px 20px;
  border-bottom: 1px solid var(--line);
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  background: rgba(245,241,232,0.92);
  position: sticky;
  top: 0;
  z-index: 10;
}
.toolbar-left { display: flex; align-items: center; gap: 10px; }
.toolbar-breadcrumb {
  font-size: 12px;
  color: var(--muted);
}
.toolbar-breadcrumb strong {
  color: var(--ink);
  font-size: 15px;
  font-weight: 700;
}
.toolbar-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* ── Buttons ─────────────────────────── */
.ghost-btn,
.primary-btn,
.danger-btn,
.chip-btn {
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  transition: background 120ms, transform 80ms;
}
.ghost-btn { background: rgba(255,255,255,0.72); border: 1px solid var(--line); }
.primary-btn { background: var(--accent); color: #fff; border: none; }
.danger-btn { background: rgba(162,53,43,0.08); color: var(--danger); border: 1px solid rgba(162,53,43,0.15); }
.chip-btn { background: var(--surface-alt); border: 1px solid var(--line); }
.ghost-btn:hover { background: var(--surface-alt); }
.primary-btn:hover { filter: brightness(1.08); }
.danger-btn:hover { background: rgba(162,53,43,0.15); }

/* ── Search ──────────────────────────── */
.search-wrap {
  display: flex;
  gap: 8px;
  align-items: center;
}
.search-wrap input[type="search"] {
  min-width: 200px;
  max-width: 320px;
  padding: 6px 10px;
  font-size: 12px;
}

/* ── Content area ─────────────────────── */
.content {
  padding: 20px 24px;
  overflow: auto;
}

/* ── Dashboard ───────────────────────── */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 14px;
}
.span-4 { grid-column: span 4; }
.span-6 { grid-column: span 6; }
.span-8 { grid-column: span 8; }
.span-12 { grid-column: span 12; }

.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 14px;
  box-shadow: 0 2px 8px var(--shadow);
}
.section-head h3 { margin: 0 0 2px; font-size: 13px; font-weight: 700; }
.section-head p { margin: 0; font-size: 12px; color: var(--muted); }
.subtle-sep { height: 1px; background: var(--line); margin: 8px 0; }

.pill-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 3px 8px;
  background: var(--surface-alt);
  border: 1px solid var(--line);
  font-size: 11px;
}

.metric {
  font-family: var(--font-mono);
  font-size: 28px;
  font-weight: 700;
  margin: 8px 0 4px;
}

.result-list { display: grid; gap: 6px; }
.result-item {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: rgba(255,255,255,0.6);
  text-align: left;
  width: 100%;
  cursor: pointer;
}
.result-item:hover { background: var(--surface-alt); }
.result-item h4 { margin: 0 0 2px; font-size: 13px; font-weight: 700; }
.result-item p { margin: 0; font-size: 12px; color: var(--muted); }
.meta-line { font-size: 11px; color: var(--muted); margin-top: 2px; }

.empty-state {
  padding: 20px;
  border-radius: var(--radius-md);
  border: 1px dashed var(--line);
  background: rgba(255,255,255,0.4);
  text-align: center;
  font-size: 12px;
  color: var(--muted);
}

/* ── Chapter view (leaf page list) ──────── */
.chapter-view { max-width: 860px; }
.chapter-view h1 { font-size: 24px; font-weight: 700; margin: 0 0 16px; }
.chapter-view .chapter-subtitle { font-size: 12px; color: var(--muted); margin-bottom: 20px; }

.leaf-list {
  border-top: 2px solid var(--ink);
  border-bottom: 2px solid var(--ink);
}
.leaf-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
  cursor: pointer;
  font-size: 13px;
  text-align: left;
  width: 100%;
  background: none;
  border-radius: 0;
}
.leaf-row:last-child { border-bottom: none; }
.leaf-row:hover { background: var(--surface-alt); }
.leaf-icon { font-size: 14px; flex-shrink: 0; }
.leaf-title { flex: 1; font-weight: 500; }
.leaf-meta { font-size: 11px; color: var(--muted); }

/* ── Note workspace (PDF cards) ─────────── */
.note-view { max-width: 960px; }
.note-view-header {
  margin-bottom: 20px;
}
.note-breadcrumb { font-size: 12px; color: var(--muted); margin-bottom: 4px; }
.note-breadcrumb .crumb-link { cursor: pointer; }
.note-breadcrumb .crumb-link:hover { color: var(--ink); text-decoration: underline; }
.note-title { font-size: 24px; font-weight: 700; margin: 0 0 6px; }
.tag-row { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
.tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 2px 8px;
  background: var(--surface-alt);
  border: 1px solid var(--line);
  font-size: 11px;
}

.note-memo-area {
  margin-bottom: 20px;
}
.note-memo-area label { font-size: 12px; font-weight: 700; display: block; margin-bottom: 4px; }
.note-memo-area textarea { font-size: 13px; min-height: 80px; }
.note-memo-actions { margin-top: 6px; display: flex; gap: 6px; }

/* ── PDF accordion cards ─────────────────── */
.pdf-cards { display: flex; flex-direction: column; gap: 0; }

.pdf-card {
  border: 1px solid var(--line);
  border-radius: 0;
  background: var(--surface);
  overflow: hidden;
}
.pdf-card:first-child { border-radius: var(--radius-sm) var(--radius-sm) 0 0; }
.pdf-card:last-child { border-radius: 0 0 var(--radius-sm) var(--radius-sm); }
.pdf-card:only-child { border-radius: var(--radius-sm); }
.pdf-card + .pdf-card { border-top: none; }

.pdf-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  cursor: pointer;
  user-select: none;
}
.pdf-card-header:hover { background: var(--surface-alt); }
.pdf-card-title { flex: 1; font-size: 13px; font-weight: 500; }
.pdf-card-meta { font-size: 12px; color: var(--muted); }
.pdf-card-chevron { font-size: 11px; color: var(--muted); transition: transform 200ms; }
.pdf-card.expanded .pdf-card-chevron { transform: rotate(180deg); }

.pdf-card-body {
  display: none;
  border-top: 1px solid var(--line);
}
.pdf-card.expanded .pdf-card-body { display: grid; grid-template-columns: 1fr 320px; }

.pdf-viewer-col {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-right: 1px solid var(--line);
}
.pdf-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  background: var(--ink);
  color: #fff;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
}
.pdf-nav button {
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}
.pdf-nav button:hover { background: rgba(255,255,255,0.15); }
.pdf-nav .page-display { flex: 1; text-align: center; }
.pdf-frame {
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: #888;
  min-height: 520px;
}
.pdf-frame iframe { width: 100%; height: 100%; min-height: 520px; border: 0; }

.pdf-comments-col {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: 600px;
  position: relative;
}
.pdf-comments-col h4 { margin: 0 0 6px; font-size: 13px; font-weight: 700; }

.comment-card {
  background: var(--surface-alt);
  border-radius: 8px;
  padding: 10px 12px;
  border: 1px solid var(--line);
  font-size: 12px;
}
.comment-page-link {
  font-size: 11px;
  color: var(--accent);
  cursor: pointer;
  font-weight: 700;
  display: block;
  margin-bottom: 4px;
}
.comment-page-link:hover { text-decoration: underline; }
.comment-text { color: var(--ink); line-height: 1.5; }
.comment-date { font-size: 11px; color: var(--muted); margin-top: 4px; }

.add-comment-form { display: flex; flex-direction: column; gap: 6px; margin-top: auto; padding-top: 8px; border-top: 1px solid var(--line); }
.add-comment-form input[type="number"] { width: 80px; }
.add-comment-row { display: flex; gap: 6px; align-items: flex-end; }
.add-comment-row textarea { min-height: 60px; flex: 1; font-size: 12px; }

.pdf-add-btn {
  position: absolute;
  bottom: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(179,84,30,0.3);
}
.pdf-add-btn:hover { filter: brightness(1.1); }

/* ── Search results ──────────────────── */
.search-results-overlay {
  margin-top: 16px;
}

/* ── Modal overlay ───────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.38);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-box {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  box-shadow: 0 12px 40px rgba(0,0,0,0.22);
  padding: 22px 24px 18px;
  min-width: 320px;
  max-width: 480px;
  width: 90%;
}
.modal-title {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 14px;
  color: var(--ink);
}
.modal-input {
  width: 100%;
  margin-bottom: 14px;
  font-size: 13px;
}
.modal-message {
  font-size: 13px;
  color: var(--ink);
  margin-bottom: 16px;
  line-height: 1.5;
}
.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* ── Utility ─────────────────────────── */
.hint { font-size: 11px; color: var(--muted); }

@media (max-width: 1100px) {
  .pdf-card.expanded .pdf-card-body { grid-template-columns: 1fr; }
  .pdf-viewer-col { border-right: none; border-bottom: 1px solid var(--line); }
  .span-4, .span-6, .span-8 { grid-column: span 12; }
}
@media (max-width: 720px) {
  .app-shell { grid-template-columns: 1fr; }
  .toolbar { flex-direction: column; align-items: stretch; }
  .search-wrap input[type="search"] { min-width: 0; max-width: none; }
  .content { padding: 12px; }
}
`;

export function applyTheme() {
  const styleTag = document.createElement("style");
  styleTag.id = "organizer-theme";
  styleTag.textContent = css;
  document.head.append(styleTag);
}

export function setFontPreset(preset) {
  const weightMap = { regular: "400", medium: "500", semibold: "700" };
  const weight = weightMap[preset] || weightMap.regular;
  document.documentElement.style.setProperty("--font-ui-weight", weight);
}

export { theme };
