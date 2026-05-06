import { applyTheme, setFontPreset } from "./style.js";
import { t } from "./i18n.js";
import {
  createId,
  loadAppData,
  resetAppData,
  saveAppData,
  timestamp,
} from "./storage.js";
import { buildGroupedSearchResults } from "./search.js";
import { computeDashboard, flattenNotes } from "./dashboard.js";
import { createViewerState, getActivePdf, renderPdfFrame, goToPage } from "./pdf_viewer.js";

applyTheme();

const NOTEBOOK_ICONS = ["💬", "📚", "🧪", "🎓", "📋", "🏥", "📝", "🔬", "📖", "🗂️"];
const CHAPTER_ICONS  = ["📅", "🗂️", "📁", "📂", "🗓️", "🔖", "🧠", "💊", "📌", "🔍"];
function pickIcon(pool) { return pool[Math.floor(Math.random() * pool.length)]; }

const app = document.querySelector("#app");

// ── App state ─────────────────────────────────────────────────────
let data = null;
let currentView = "dashboard"; // "dashboard" | "chapter" | "note" | "search"
let selectedNoteId = null;
let selectedChapterId = null;
let selectedNotebookId = null;
let expandedPdfId = null;
let viewerState = createViewerState(null);
let searchQuery = "";
let sidebarOpen = true;
let saveState = { saving: false, error: "", paths: null };
let treeState = { notebooks: {} };

// ── Modal state ───────────────────────────────────────────────────
// pendingModal: null | { type: "input"|"confirm", label, defaultValue, resolve }
let pendingModal = null;

function askInput(label, defaultValue = "") {
  return new Promise((resolve) => {
    pendingModal = { type: "input", label, defaultValue, resolve };
    render();
  });
}

function askConfirm(message) {
  return new Promise((resolve) => {
    pendingModal = { type: "confirm", label: message, resolve };
    render();
  });
}

function resolveModal(value) {
  const r = pendingModal?.resolve;
  pendingModal = null;
  render();
  r?.(value);
}

function renderModalHtml() {
  if (!pendingModal) return "";
  if (pendingModal.type === "input") {
    return `
      <div class="modal-overlay" data-action="modal-backdrop">
        <div class="modal-box" onclick="event.stopPropagation()">
          <div class="modal-title">${pendingModal.label}</div>
          <input class="modal-input" id="modal-input-field" type="text"
                 value="${pendingModal.defaultValue || ""}"
                 placeholder="입력하세요" />
          <div class="modal-actions">
            <button class="ghost-btn" data-action="modal-cancel">취소</button>
            <button class="primary-btn" data-action="modal-ok">확인</button>
          </div>
        </div>
      </div>`;
  }
  // confirm
  return `
    <div class="modal-overlay" data-action="modal-backdrop">
      <div class="modal-box" onclick="event.stopPropagation()">
        <div class="modal-message">${pendingModal.label}</div>
        <div class="modal-actions">
          <button class="ghost-btn" data-action="modal-cancel">취소</button>
          <button class="danger-btn" data-action="modal-ok">삭제</button>
        </div>
      </div>
    </div>`;
}

// ── Context menu ──────────────────────────────────────────────────
let ctxMenuEl = null;

function removeCtxMenu() {
  ctxMenuEl?.remove();
  ctxMenuEl = null;
}

function showCtxMenu(type, id, notebookId, x, y) {
  removeCtxMenu();
  const menu = document.createElement("div");
  menu.className = "context-menu";
  const menuWidth = 160;
  menu.style.left = Math.min(x, window.innerWidth - menuWidth - 8) + "px";
  menu.style.top = y + "px";

  const items = type === "notebook"
    ? [
        { label: "📝  이름 변경",    action: "rename-notebook" },
        { label: "📌  아이콘 변경",  action: "change-icon-notebook" },
        { sep: true },
        { label: "＋  Chapter 추가", action: "create-chapter" },
        { sep: true },
        { label: "🗑  삭제",          action: "delete-notebook", danger: true },
      ]
    : [
        { label: "📝  이름 변경",        action: "rename-chapter" },
        { label: "📌  아이콘 변경",      action: "change-icon-chapter" },
        { sep: true },
        { label: "＋  Leaf page 추가",   action: "create-note" },
        { sep: true },
        { label: "🗑  삭제",              action: "delete-chapter", danger: true },
      ];

  items.forEach((item) => {
    if (item.sep) {
      const sep = document.createElement("div");
      sep.className = "context-menu-sep";
      menu.append(sep);
      return;
    }
    const el = document.createElement("div");
    el.className = "context-menu-item" + (item.danger ? " danger" : "");
    el.textContent = item.label;
    el.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      removeCtxMenu();
      handleCtxAction(item.action, id, notebookId);
    });
    menu.append(el);
  });

  document.body.append(menu);
  ctxMenuEl = menu;
}

// ── Helpers ───────────────────────────────────────────────────────
function getLanguage() { return data?.settings?.language || "ko"; }
function getFontPreset() { return data?.settings?.ui_font_preset || "regular"; }

function fmt(dateString) {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat(getLanguage() === "ko" ? "ko-KR" : "en-US", {
    dateStyle: "medium", timeStyle: "short",
  }).format(new Date(dateString));
}

function findNoteById(noteId) {
  if (!data) return null;
  for (const nb of data.notebooks)
    for (const ch of nb.chapters) {
      const n = ch.notes.find((x) => x.id === noteId);
      if (n) return { notebook: nb, chapter: ch, note: n };
    }
  return null;
}

function findChapterById(chapterId) {
  if (!data) return null;
  for (const nb of data.notebooks) {
    const ch = nb.chapters.find((c) => c.id === chapterId);
    if (ch) return { notebook: nb, chapter: ch };
  }
  return null;
}

function toFileUrl(filePath) {
  if (!filePath) return filePath;
  if (filePath.startsWith("file://") || filePath.startsWith("./") || filePath.startsWith("http")) return filePath;
  return "file:///" + filePath.replace(/\\/g, "/");
}

function pickPdfInBrowser() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf,.pdf";
    input.style.display = "none";
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      input.remove();
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        resolve({ name: file.name, dataUrl: reader.result });
      });
      reader.addEventListener("error", () => resolve(null));
      reader.readAsDataURL(file);
    }, { once: true });
    document.body.appendChild(input);
    input.click();
  });
}

async function persistData() {
  if (!data) return;
  saveState.saving = true;
  saveState.error = "";
  render();
  try { data = await saveAppData(data); }
  catch (err) { saveState.error = err instanceof Error ? err.message : String(err); }
  finally { saveState.saving = false; render(); }
}

async function setSelectedNote(noteId, pdfId = null) {
  const match = findNoteById(noteId);
  if (!match) return;
  selectedNoteId = noteId;
  selectedChapterId = match.chapter.id;
  selectedNotebookId = match.notebook.id;
  currentView = "note";
  expandedPdfId = pdfId ?? match.note.pdfs[0]?.id ?? null;
  viewerState = createViewerState(match.note);
  if (pdfId) viewerState.activePdfId = pdfId;
  const openedAt = timestamp();
  match.note.last_opened_at = openedAt;
  match.note.view_count = (match.note.view_count || 0) + 1;
  const activePdf = getActivePdf(match.note, viewerState);
  if (activePdf) { activePdf.last_opened_at = openedAt; activePdf.view_count = (activePdf.view_count || 0) + 1; }
  await persistData();
}

function setSelectedChapter(notebookId, chapterId) {
  selectedNotebookId = notebookId;
  selectedChapterId = chapterId;
  selectedNoteId = null;
  currentView = "chapter";
  render();
}

// ── Sidebar ───────────────────────────────────────────────────────
function renderSidebar() {
  const rows = data.notebooks.map((nb) => {
    const expanded = treeState.notebooks[nb.id] !== false;
    return `
      <li>
        <div class="tree-notebook-row" data-action="toggle-notebook" data-id="${nb.id}">
          <span class="tree-toggle">${expanded ? "▾" : "▸"}</span>
          <span class="tree-icon">${nb.icon || "📓"}</span>
          <span class="tree-label">${nb.title}</span>
          <button class="more-btn" data-action="ctx-notebook" data-id="${nb.id}" title="더보기">···</button>
        </div>
        ${expanded ? `<ul>${nb.chapters.map((ch) => `
          <li>
            <div class="tree-chapter-row ${selectedChapterId === ch.id ? "active" : ""}"
                 data-action="open-chapter" data-id="${ch.id}" data-notebook-id="${nb.id}">
              <span class="tree-icon">${ch.icon || "📁"}</span>
              <span class="tree-label">${ch.title}</span>
              <button class="more-btn" data-action="ctx-chapter"
                      data-id="${ch.id}" data-notebook-id="${nb.id}" title="더보기">···</button>
            </div>
          </li>`).join("")}</ul>` : ""}
      </li>`;
  }).join("");

  return `
    <div class="sidebar-header">
      <div class="sidebar-brand" data-action="show-dashboard">Organizer</div>
    </div>
    <a class="sidebar-recent-link" data-action="show-dashboard">대시보드 / 최근 파일</a>
    <div style="height:1px;background:var(--line);"></div>
    <ul class="tree">${rows}</ul>
    <div style="padding:8px 14px 14px;">
      <button class="ghost-btn" style="width:100%;font-size:12px;" data-action="create-notebook">
        + 새 Notebook
      </button>
    </div>`;
}

// ── Toolbar ───────────────────────────────────────────────────────
function renderToolbar() {
  const lang = getLanguage();
  let breadcrumb = "";
  if (currentView === "search") {
    breadcrumb = `<span class="toolbar-breadcrumb"><strong>검색: "${searchQuery}"</strong></span>`;
  } else if (currentView === "chapter" && selectedChapterId) {
    const f = findChapterById(selectedChapterId);
    if (f) breadcrumb = `<span class="toolbar-breadcrumb">${f.notebook.title} / <strong>${f.chapter.title}</strong></span>`;
  } else if (currentView === "note" && selectedNoteId) {
    const f = findNoteById(selectedNoteId);
    if (f) breadcrumb = `<span class="toolbar-breadcrumb">
      <span class="crumb-link" data-action="open-chapter"
            data-id="${f.chapter.id}" data-notebook-id="${f.notebook.id}">
        ${f.notebook.title} / ${f.chapter.title}
      </span>&nbsp;/&nbsp;<strong>${f.note.title}</strong>
    </span>`;
  } else {
    breadcrumb = `<span class="toolbar-breadcrumb"><strong>대시보드</strong></span>`;
  }
  return `
    <div class="toolbar-left">${breadcrumb}</div>
    <div class="toolbar-right">
      <div class="search-wrap">
        <input id="search-input" type="search" value="${searchQuery}"
               placeholder="${t(lang, "searchPlaceholder")}" />
      </div>
      <select id="language-select" style="font-size:12px;padding:5px 8px;width:auto;">
        <option value="ko" ${lang === "ko" ? "selected" : ""}>KO</option>
        <option value="en" ${lang === "en" ? "selected" : ""}>EN</option>
      </select>
    </div>`;
}

// ── Dashboard ─────────────────────────────────────────────────────
function renderDashboard() {
  const lang = getLanguage();
  const summary = computeDashboard(data);
  const notes = flattenNotes(data);
  const pdfCount = notes.reduce((s, n) => s + n.pdfs.length, 0);
  const renderList = (items, act) => items.length
    ? `<div class="result-list">${items.map((item) => `
        <button class="result-item" data-action="${act}"
                data-note-id="${item.noteId || item.id}"
                data-pdf-id="${(item.id || "").startsWith("pdf_") ? item.id : ""}">
          <h4>${item.title || item.label}</h4>
          <p>${item.description || item.detail || ""}</p>
          <div class="meta-line">${fmt(item.last_opened_at || item.updated_at || item.at)}</div>
        </button>`).join("")}</div>`
    : `<div class="empty-state"><p>-</p></div>`;
  return `
    <div class="dashboard-grid">
      <section class="card span-4">
        <div class="section-head"><h3>전체 현황</h3></div>
        <div class="subtle-sep"></div>
        <div class="pill-row">
          <span class="pill">Notebook ${data.notebooks.length}</span>
          <span class="pill">Chapter ${data.notebooks.reduce((s,nb)=>s+nb.chapters.length,0)}</span>
          <span class="pill">Note ${notes.length}</span>
          <span class="pill">PDF ${pdfCount}</span>
        </div>
        <div class="metric">${notes.length}</div>
        <p style="font-size:12px;color:var(--muted);">노트</p>
        <div style="margin-top:10px;">
          <button class="ghost-btn" data-action="reset-demo" style="font-size:11px;">Reset Demo</button>
        </div>
      </section>
      <section class="card span-4">
        <div class="section-head"><h3>${t(lang,"recentNotes")}</h3></div>
        <div class="subtle-sep"></div>
        ${renderList(summary.recentNotes,"open-note")}
      </section>
      <section class="card span-4">
        <div class="section-head"><h3>${t(lang,"recentPdfs")}</h3></div>
        <div class="subtle-sep"></div>
        ${renderList(summary.recentPdfs,"open-note-pdf")}
      </section>
      <section class="card span-6">
        <div class="section-head"><h3>${t(lang,"recentlyUpdated")}</h3></div>
        <div class="subtle-sep"></div>
        ${renderList(summary.updatedNotes,"open-note")}
      </section>
      <section class="card span-6">
        <div class="section-head"><h3>${t(lang,"activity")}</h3></div>
        <div class="subtle-sep"></div>
        ${summary.activityToday.length
          ? `<div class="result-list">${summary.activityToday.map((i)=>`
              <div class="result-item">
                <h4>${i.label}</h4><p>${i.detail||""}</p>
                <div class="meta-line">${fmt(i.at)}</div>
              </div>`).join("")}</div>`
          : `<div class="empty-state"><p>-</p></div>`}
      </section>
    </div>`;
}

// ── Search view ───────────────────────────────────────────────────
function renderSearchView() {
  const { notebooks, chapters, notes } = buildGroupedSearchResults(data, searchQuery);
  const total = notebooks.length + chapters.length + notes.length;
  const sec = (title, items, fn) => `
    <div style="margin-bottom:22px;">
      <div class="section-head" style="margin-bottom:8px;"><h3>${title} (${items.length})</h3></div>
      ${items.length
        ? `<div class="result-list">${items.map(fn).join("")}</div>`
        : `<div class="empty-state"><p>없음</p></div>`}
    </div>`;
  return `
    <div style="max-width:760px;">
      <div style="margin-bottom:20px;">
        <h2 style="font-size:20px;font-weight:700;margin:0 0 4px;">"${searchQuery}" 검색 결과</h2>
        <p style="font-size:12px;color:var(--muted);">총 ${total}건</p>
      </div>
      ${sec("Notebooks", notebooks, (nb) => `
        <button class="result-item" data-action="search-open-notebook" data-id="${nb.id}">
          <h4>${nb.icon} ${nb.title}</h4>
        </button>`)}
      ${sec("Chapters", chapters, (ch) => `
        <button class="result-item" data-action="open-chapter"
                data-id="${ch.id}" data-notebook-id="${ch.notebookId}">
          <h4>${ch.icon} ${ch.title}</h4>
          <p>${ch.notebookTitle}</p>
        </button>`)}
      ${sec("Leaf pages", notes, (note) => `
        <button class="result-item" data-action="open-note" data-id="${note.id}">
          <h4>${note.icon} ${note.title}</h4>
          <p>${note.description}</p>
          <div class="tag-row">${note.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        </button>`)}
    </div>`;
}

// ── Chapter view ──────────────────────────────────────────────────
function renderChapterView() {
  const found = findChapterById(selectedChapterId);
  if (!found) return `<div class="empty-state"><p>챕터를 선택하세요.</p></div>`;
  const { notebook, chapter } = found;
  return `
    <div class="chapter-view">
      <h1>${chapter.title}</h1>
      <div class="chapter-subtitle">${notebook.title}</div>
      <div class="leaf-list">
        ${chapter.notes.length
          ? chapter.notes.map((note) => `
              <button class="leaf-row" data-action="open-note" data-id="${note.id}">
                <span class="leaf-icon">${note.icon || "📄"}</span>
                <span class="leaf-title">${note.title}</span>
                <span class="leaf-meta">${note.pdfs.length} PDF · ${fmt(note.updated_at)}</span>
              </button>`).join("")
          : `<div class="leaf-row" style="color:var(--muted);cursor:default;pointer-events:none;">Leaf page가 없습니다.</div>`}
      </div>
      <div style="margin-top:12px;">
        <button class="ghost-btn" style="font-size:12px;"
                data-action="create-note"
                data-notebook-id="${notebook.id}" data-chapter-id="${chapter.id}">
          + Leaf page 추가
        </button>
      </div>
    </div>`;
}

// ── Note workspace ────────────────────────────────────────────────
function renderNoteView() {
  const found = findNoteById(selectedNoteId);
  if (!found) return `<div class="empty-state"><p>노트를 선택하세요.</p></div>`;
  const { notebook, chapter, note } = found;
  const lang = getLanguage();

  const cards = note.pdfs.map((pdf) => {
    const isExpanded = expandedPdfId === pdf.id;
    const comments = note.pdf_comments.filter((c) => c.pdf_id === pdf.id);
    let bodyHtml = "";
    if (isExpanded) {
      viewerState.activePdfId = pdf.id;
      bodyHtml = `
        <div class="pdf-card-body">
          <div class="pdf-viewer-col">
            <div class="pdf-nav">
              <button data-action="prev-page">＜＜</button>
              <span class="page-display">${viewerState.page}</span>
              <button data-action="next-page">＞＞</button>
              <button data-action="zoom-out">－</button>
              <button data-action="zoom-in">＋</button>
            </div>
            <div class="pdf-frame">${renderPdfFrame(note, viewerState)}</div>
          </div>
          <div class="pdf-comments-col">
            <h4>${t(lang,"pdfComments")} (${comments.length})</h4>
            ${comments.length
              ? comments.sort((a,b)=>a.page-b.page).map((c) => `
                  <div class="comment-card">
                    <span class="comment-page-link" data-action="goto-page"
                          data-page="${c.page}" data-pdf-id="${pdf.id}">Page ${c.page}</span>
                    <div class="comment-text">${c.comment}</div>
                    <div class="comment-date">${fmt(c.updated_at)}</div>
                  </div>`).join("")
              : `<div class="empty-state"><p>코멘트 없음</p></div>`}
            <div class="add-comment-form">
              <div class="add-comment-row">
                <input id="comment-page-input-${pdf.id}" type="number" min="1"
                       value="${viewerState.page}" style="width:64px;" placeholder="Page"/>
                <textarea id="comment-input-${pdf.id}"
                          placeholder="${t(lang,"commentPlaceholder")}"></textarea>
              </div>
              <button class="primary-btn" data-action="add-comment"
                      data-pdf-id="${pdf.id}" style="align-self:flex-end;">
                ${t(lang,"addComment")}
              </button>
            </div>
          </div>
        </div>`;
    }
    return `
      <div class="pdf-card ${isExpanded ? "expanded" : ""}">
        <div class="pdf-card-header" data-action="toggle-pdf" data-pdf-id="${pdf.id}">
          <span class="pdf-card-title">📄 ${pdf.title}</span>
          <span class="pdf-card-meta">${comments.length} comments</span>
          <span class="pdf-card-chevron">▼</span>
        </div>
        ${bodyHtml}
      </div>`;
  }).join("");

  return `
    <div class="note-view">
      <div class="note-view-header">
        <div class="note-breadcrumb">
          <span class="crumb-link" data-action="open-chapter"
                data-id="${chapter.id}" data-notebook-id="${notebook.id}">
            ${notebook.title} / ${chapter.title}
          </span>
        </div>
        <h1 class="note-title">${note.title}</h1>
        <div class="tag-row">${note.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      </div>
      <div class="note-memo-area">
        <label>메모</label>
        <textarea id="note-body-input"
                  placeholder="${t(lang,"notePlaceholder")}">${note.note_body||""}</textarea>
        <div class="note-memo-actions">
          <button class="primary-btn" data-action="save-note-body">${t(lang,"saveMemo")}</button>
          <button class="danger-btn" data-action="delete-note">${t(lang,"delete")}</button>
        </div>
      </div>
      <div style="font-size:12px;font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:10px;">
        <span>PDF (${note.pdfs.length})</span>
        <button class="ghost-btn" data-action="add-pdf-to-note" style="font-size:11px;">+ PDF 추가</button>
      </div>
      <div class="pdf-cards">
        ${cards || `<div class="empty-state"><p>연결된 PDF가 없습니다.</p></div>`}
      </div>
    </div>`;
}

// ── Main render ───────────────────────────────────────────────────
function render() {
  removeCtxMenu();
  if (!data) {
    app.innerHTML = `<div class="empty-state" style="margin:24px;"><p>Loading...</p></div>`;
    return;
  }
  setFontPreset(getFontPreset());

  let mainContent = "";
  if (currentView === "dashboard") mainContent = renderDashboard();
  else if (currentView === "search")  mainContent = renderSearchView();
  else if (currentView === "chapter") mainContent = renderChapterView();
  else if (currentView === "note")    mainContent = renderNoteView();

  app.innerHTML = `
    ${renderModalHtml()}
    ${!sidebarOpen ? `<button class="sidebar-toggle-float" id="float-toggle">▶</button>` : ""}
    <div class="app-shell ${sidebarOpen ? "" : "sidebar-hidden"}">
      <div class="sidebar-container ${sidebarOpen ? "" : "collapsed"}">
        <aside class="sidebar">${renderSidebar()}</aside>
        <button class="sidebar-toggle" data-action="toggle-sidebar">◀</button>
      </div>
      <main class="main">
        <header class="toolbar">${renderToolbar()}</header>
        <div class="content">
          ${mainContent}
          ${saveState.error ? `<div class="hint" style="color:var(--danger);margin-top:8px;">저장 오류: ${saveState.error}</div>` : ""}
        </div>
      </main>
    </div>`;

  bindEvents();
}

// ── Event binding ─────────────────────────────────────────────────
function bindEvents() {
  app.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", handleAction);
  });

  document.getElementById("float-toggle")?.addEventListener("click", () => {
    sidebarOpen = true;
    render();
  });

  const searchEl = app.querySelector("#search-input");
  if (searchEl) {
    searchEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const q = e.target.value.trim();
        if (q) { searchQuery = q; currentView = "search"; render(); }
      }
    });
  }

  app.querySelector("#language-select")?.addEventListener("change", async (e) => {
    data.settings.language = e.target.value;
    await persistData();
  });

  // Modal: focus input on open
  if (pendingModal?.type === "input") {
    setTimeout(() => {
      const input = document.getElementById("modal-input-field");
      if (input) { input.focus(); input.select(); }
    }, 30);
  }

  // Modal: Enter key submits
  document.getElementById("modal-input-field")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") resolveModal(e.target.value.trim() || null);
    if (e.key === "Escape") resolveModal(null);
  });
}

// Document-level listener (registered once)
document.addEventListener("click", (e) => {
  if (ctxMenuEl && !ctxMenuEl.contains(e.target)) removeCtxMenu();
});

// ── Action handler ────────────────────────────────────────────────
async function handleAction(e) {
  const el = e.currentTarget;
  const action = el.dataset.action;
  const id = el.dataset.id;
  const notebookId = el.dataset.notebookId;
  const chapterId = el.dataset.chapterId;
  const noteId = el.dataset.noteId;
  const pdfId = el.dataset.pdfId;

  // Modal actions
  if (action === "modal-ok") {
    const inputEl = document.getElementById("modal-input-field");
    resolveModal(inputEl ? (inputEl.value.trim() || null) : true);
    return;
  }
  if (action === "modal-cancel" || action === "modal-backdrop") {
    resolveModal(pendingModal?.type === "confirm" ? false : null);
    return;
  }

  if (action === "ctx-notebook") {
    e.stopPropagation();
    const rect = el.getBoundingClientRect();
    showCtxMenu("notebook", id, null, rect.right + 4, rect.top);
    return;
  }
  if (action === "ctx-chapter") {
    e.stopPropagation();
    const rect = el.getBoundingClientRect();
    showCtxMenu("chapter", id, notebookId, rect.right + 4, rect.top);
    return;
  }

  if (action === "show-dashboard") {
    currentView = "dashboard"; selectedNoteId = null;
    selectedChapterId = null; selectedNotebookId = null; searchQuery = "";
    render(); return;
  }
  if (action === "toggle-sidebar") {
    sidebarOpen = !sidebarOpen; render(); return;
  }
  if (action === "toggle-notebook") {
    const cur = treeState.notebooks[id];
    treeState.notebooks[id] = cur === undefined ? false : !cur;
    render(); return;
  }
  if (action === "open-chapter") {
    setSelectedChapter(notebookId, id); return;
  }
  if (action === "search-open-notebook") {
    const nb = data.notebooks.find((n) => n.id === id);
    if (!nb) return;
    treeState.notebooks[id] = true;
    if (nb.chapters.length > 0) setSelectedChapter(id, nb.chapters[0].id);
    else { selectedNotebookId = id; currentView = "dashboard"; render(); }
    return;
  }
  if (action === "open-note") { await setSelectedNote(id || noteId); return; }
  if (action === "open-note-pdf") { await setSelectedNote(noteId, pdfId); return; }

  if (action === "toggle-pdf") {
    expandedPdfId = expandedPdfId === pdfId ? null : pdfId;
    if (expandedPdfId) { viewerState.activePdfId = pdfId; viewerState.page = 1; }
    render(); return;
  }
  if (action === "goto-page") { goToPage(viewerState, Number(el.dataset.page)||1); render(); return; }
  if (action === "next-page") { viewerState.page += 1; render(); return; }
  if (action === "prev-page") { viewerState.page = Math.max(1, viewerState.page - 1); render(); return; }
  if (action === "zoom-in") { viewerState.zoom = Math.min(200, viewerState.zoom + 10); render(); return; }
  if (action === "zoom-out") { viewerState.zoom = Math.max(60, viewerState.zoom - 10); render(); return; }

  if (action === "save-note-body") {
    const match = findNoteById(selectedNoteId);
    if (!match) return;
    match.note.note_body = app.querySelector("#note-body-input")?.value ?? "";
    match.note.updated_at = timestamp();
    await persistData(); return;
  }

  if (action === "add-comment") {
    const match = findNoteById(selectedNoteId);
    if (!match) return;
    const activePdf = match.note.pdfs.find((p) => p.id === pdfId) || getActivePdf(match.note, viewerState);
    if (!activePdf) return;
    const comment = app.querySelector(`#comment-input-${activePdf.id}`)?.value.trim();
    const page = Number(app.querySelector(`#comment-page-input-${activePdf.id}`)?.value) || viewerState.page;
    if (!comment) return;
    match.note.pdf_comments.push({ id: createId("comment"), pdf_id: activePdf.id, page, comment, created_at: timestamp(), updated_at: timestamp() });
    match.note.updated_at = timestamp();
    await persistData(); return;
  }

  if (action === "add-pdf-to-note") {
    const match = findNoteById(selectedNoteId);
    if (!match) return;
    let filename = "";
    let pdfPath = "";
    if (window.organizerAPI?.pickPdfFile) {
      const filePath = await window.organizerAPI.pickPdfFile();
      if (!filePath) return;
      filename = filePath.split(/[\\/]/).pop();
      pdfPath = toFileUrl(filePath);
    } else {
      const picked = await pickPdfInBrowser();
      if (!picked) return;
      filename = picked.name;
      pdfPath = picked.dataUrl;
    }
    match.note.pdfs.push({
      id: createId("pdf"),
      title: filename.replace(/\.pdf$/i, ""),
      original_filename: filename,
      path: pdfPath,
      added_at: timestamp(), last_opened_at: timestamp(), view_count: 0,
    });
    match.note.updated_at = timestamp();
    await persistData(); return;
  }

  if (action === "create-notebook") { await doCreateNotebook(); return; }
  if (action === "create-chapter") { await doCreateChapter(notebookId || selectedNotebookId); return; }
  if (action === "create-note") { await doCreateNote(notebookId || selectedNotebookId, chapterId || selectedChapterId); return; }

  if (action === "delete-note") {
    const match = findNoteById(selectedNoteId);
    if (!match) return;
    const ok = await askConfirm(`"${match.note.title}" 를 삭제할까요?`);
    if (!ok) return;
    match.chapter.notes = match.chapter.notes.filter((n) => n.id !== selectedNoteId);
    selectedNoteId = null; currentView = "chapter";
    await persistData(); return;
  }

  if (action === "reset-demo") {
    data = await resetAppData();
    currentView = "dashboard"; selectedNoteId = null; selectedChapterId = null;
    selectedNotebookId = null; expandedPdfId = null; searchQuery = "";
    viewerState = createViewerState(null); saveState.error = "";
    render(); return;
  }
}

// ── Context menu actions ──────────────────────────────────────────
async function handleCtxAction(action, id, notebookId) {
  if (action === "rename-notebook") {
    const nb = data.notebooks.find((n) => n.id === id);
    if (!nb) return;
    const title = await askInput("Notebook 이름 변경", nb.title);
    if (!title) return;
    nb.title = title; await persistData(); return;
  }
  if (action === "change-icon-notebook") {
    const nb = data.notebooks.find((n) => n.id === id);
    if (!nb) return;
    const icon = await askInput("아이콘 emoji 입력  (예: 📚 💬 🔬 🎓 🏥)", nb.icon || "📓");
    if (!icon) return;
    nb.icon = icon; await persistData(); return;
  }
  if (action === "delete-notebook") {
    const nb = data.notebooks.find((n) => n.id === id);
    if (!nb) return;
    const ok = await askConfirm(`"${nb.title}" Notebook을 삭제할까요?\n하위 Chapter와 Note가 모두 삭제됩니다.`);
    if (!ok) return;
    data.notebooks = data.notebooks.filter((n) => n.id !== id);
    if (selectedNotebookId === id) { selectedNoteId = null; selectedChapterId = null; selectedNotebookId = null; currentView = "dashboard"; }
    await persistData(); return;
  }
  if (action === "rename-chapter") {
    const nb = data.notebooks.find((n) => n.id === notebookId);
    const ch = nb?.chapters.find((c) => c.id === id);
    if (!ch) return;
    const title = await askInput("Chapter 이름 변경", ch.title);
    if (!title) return;
    ch.title = title; await persistData(); return;
  }
  if (action === "change-icon-chapter") {
    const nb = data.notebooks.find((n) => n.id === notebookId);
    const ch = nb?.chapters.find((c) => c.id === id);
    if (!ch) return;
    const icon = await askInput("아이콘 emoji 입력  (예: 📅 🗂️ 📁 🗓️ 🔖)", ch.icon || "📁");
    if (!icon) return;
    ch.icon = icon; await persistData(); return;
  }
  if (action === "delete-chapter") {
    const nb = data.notebooks.find((n) => n.id === notebookId);
    const ch = nb?.chapters.find((c) => c.id === id);
    if (!ch) return;
    const ok = await askConfirm(`"${ch.title}" Chapter를 삭제할까요?`);
    if (!ok) return;
    nb.chapters = nb.chapters.filter((c) => c.id !== id);
    if (selectedChapterId === id) { selectedNoteId = null; selectedChapterId = null; currentView = "dashboard"; }
    await persistData(); return;
  }
  if (action === "create-chapter") { await doCreateChapter(id); return; }
  if (action === "create-note")    { await doCreateNote(notebookId, id); return; }
}

// ── CRUD ──────────────────────────────────────────────────────────
async function doCreateNotebook() {
  const title = await askInput("새 Notebook 이름");
  if (!title) return;
  const nb = { id: createId("notebook"), title, icon: pickIcon(NOTEBOOK_ICONS), chapters: [] };
  data.notebooks.push(nb);
  treeState.notebooks[nb.id] = true;
  await persistData();
}

async function doCreateChapter(notebookId) {
  const nb = data.notebooks.find((n) => n.id === notebookId);
  if (!nb) return;
  const title = await askInput("새 Chapter 이름");
  if (!title) return;
  nb.chapters.push({ id: createId("chapter"), title, icon: pickIcon(CHAPTER_ICONS), notes: [] });
  await persistData();
}

async function doCreateNote(notebookId, chapterId) {
  const nb = data.notebooks.find((n) => n.id === notebookId);
  const ch = nb?.chapters.find((c) => c.id === chapterId);
  if (!ch) return;
  const title = await askInput("새 Leaf page 이름");
  if (!title) return;
  const now = timestamp();
  const note = { id: createId("note"), title, description: "", tags: [], icon: "📄", created_at: now, updated_at: now, last_opened_at: now, view_count: 0, note_body: "", pdfs: [], pdf_comments: [] };
  ch.notes.push(note);
  await persistData();
  await setSelectedNote(note.id);
}

// ── Initialize ────────────────────────────────────────────────────
async function initialize() {
  render();
  saveState.paths = await window.organizerAPI?.getPaths?.();
  data = await loadAppData();
  treeState.notebooks = {};
  data.notebooks.forEach((nb) => { treeState.notebooks[nb.id] = true; });
  if (!data.last_saved_at) await persistData();
  else render();
}

initialize();
