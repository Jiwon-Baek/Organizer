function sortByDate(items, key) {
  return [...items].sort((a, b) => new Date(b[key]) - new Date(a[key]));
}

export function flattenNotes(data) {
  return data.notebooks.flatMap((notebook) =>
    notebook.chapters.flatMap((chapter) =>
      chapter.notes.map((note) => ({
        ...note,
        notebookId: notebook.id,
        notebookTitle: notebook.title,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
      })),
    ),
  );
}

export function flattenPdfs(data) {
  return flattenNotes(data).flatMap((note) =>
    note.pdfs.map((pdf) => ({
      ...pdf,
      noteId: note.id,
      noteTitle: note.title,
      notebookTitle: note.notebookTitle,
      chapterTitle: note.chapterTitle,
    })),
  );
}

export function computeDashboard(data) {
  const notes = flattenNotes(data);
  const pdfs = flattenPdfs(data);
  const today = new Date().toISOString().slice(0, 10);

  return {
    totalNotes: notes.length,
    totalPdfs: pdfs.length,
    recentNotes: sortByDate(notes, "last_opened_at").slice(0, 4),
    recentPdfs: sortByDate(pdfs, "last_opened_at").slice(0, 4),
    updatedNotes: sortByDate(notes, "updated_at").slice(0, 4),
    activityToday: [
      ...notes.filter((note) => note.last_opened_at.startsWith(today)).map((note) => ({
        label: note.title,
        detail: `${note.notebookTitle} / ${note.chapterTitle}`,
        at: note.last_opened_at,
      })),
      ...pdfs.filter((pdf) => pdf.last_opened_at.startsWith(today)).map((pdf) => ({
        label: pdf.title,
        detail: pdf.noteTitle,
        at: pdf.last_opened_at,
      })),
    ]
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 8),
  };
}
