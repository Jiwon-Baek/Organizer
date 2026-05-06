function buildPdfUrl(path, page, zoom) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeZoom = Math.max(60, Math.min(200, Number(zoom) || 110));
  return `${path}#page=${safePage}&zoom=${safeZoom}`;
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

  const src = buildPdfUrl(activePdf.path, viewerState.page, viewerState.zoom);
  return `<iframe title="${activePdf.title}" src="${src}"></iframe>`;
}
