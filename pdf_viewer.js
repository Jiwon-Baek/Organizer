function buildPdfUrl(path, page, zoom) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeZoom = Math.max(60, Math.min(200, Number(zoom) || 110));
  return `${path}#page=${safePage}&zoom=${safeZoom}`;
}

const resolvedPdfUrls = new Map();
const resolvingPdfUrls = new Set();
let pdfUrlResolver = null;

export function registerPdfUrlResolver(resolver) {
  pdfUrlResolver = resolver;
}

function isDeferredPdfPath(path) {
  return typeof path === "string" && path.startsWith("indexeddb://pdf/");
}

function getRenderablePdfPath(path) {
  if (!isDeferredPdfPath(path)) {
    return path;
  }

  const cached = resolvedPdfUrls.get(path);
  if (cached || !pdfUrlResolver || resolvingPdfUrls.has(path)) {
    return cached;
  }

  resolvingPdfUrls.add(path);
  pdfUrlResolver(path)
    .then((url) => {
      resolvedPdfUrls.set(path, url);
      window.dispatchEvent(new CustomEvent("organizer:pdf-url-ready"));
    })
    .catch((error) => {
      window.dispatchEvent(new CustomEvent("organizer:pdf-url-error", {
        detail: error instanceof Error ? error.message : String(error),
      }));
    })
    .finally(() => {
      resolvingPdfUrls.delete(path);
    });

  return null;
}

export function createViewerState(note) {
  const firstPdf = note?.pdfs?.[0] ?? null;
  return {
    activePdfId: firstPdf?.id ?? null,
    page: 1,
    zoom: 110,
  };
}

export function getActivePdf(note, viewerState) {
  if (!note) {
    return null;
  }

  return note.pdfs.find((pdf) => pdf.id === viewerState.activePdfId) ?? note.pdfs[0] ?? null;
}

export function goToPage(viewerState, pageNum) {
  viewerState.page = Math.max(1, Number(pageNum) || 1);
}

export function renderPdfFrame(note, viewerState) {
  const activePdf = getActivePdf(note, viewerState);

  if (!activePdf) {
    return `<div class="empty-state"><p>연결된 PDF가 없습니다.</p></div>`;
  }

  const renderablePath = getRenderablePdfPath(activePdf.path);
  if (!renderablePath) {
    return `<div class="empty-state"><p>PDF 파일을 불러오는 중입니다.</p></div>`;
  }

  const src = buildPdfUrl(renderablePath, viewerState.page, viewerState.zoom);
  return `<iframe title="${activePdf.title}" src="${src}"></iframe>`;
}
