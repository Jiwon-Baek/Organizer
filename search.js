function score(haystack, needle) {
  return haystack?.toLowerCase().includes(needle) ? 1 : 0;
}

export function buildGroupedSearchResults(data, query) {
  const q = query.trim().toLowerCase();
  if (!q) return { notebooks: [], chapters: [], notes: [] };

  const notebooks = [];
  const chapters = [];
  const notes = [];

  data.notebooks.forEach((notebook) => {
    if (score(notebook.title, q)) {
      notebooks.push({ id: notebook.id, title: notebook.title, icon: notebook.icon || "📓" });
    }

    notebook.chapters.forEach((chapter) => {
      if (score(chapter.title, q)) {
        chapters.push({
          id: chapter.id,
          notebookId: notebook.id,
          title: chapter.title,
          icon: chapter.icon || "📁",
          notebookTitle: notebook.title,
        });
      }

      chapter.notes.forEach((note) => {
        let s = 0;
        s += score(note.title, q) * 5;
        s += score(note.description, q) * 3;
        s += score(note.note_body, q) * 2;
        s += score(note.tags.join(" "), q) * 3;
        note.pdfs.forEach((pdf) => {
          s += score(pdf.title, q) * 2;
          s += score(pdf.original_filename, q) * 2;
        });
        note.pdf_comments.forEach((c) => {
          s += score(c.comment, q) * 4;
        });

        if (s > 0) {
          notes.push({
            id: note.id,
            noteId: note.id,
            notebookId: notebook.id,
            chapterId: chapter.id,
            title: note.title,
            icon: note.icon || "📄",
            description: `${notebook.title} / ${chapter.title}`,
            tags: note.tags,
            score: s,
          });
        }
      });
    });
  });

  notes.sort((a, b) => b.score - a.score);
  return { notebooks, chapters, notes };
}

export function buildSearchResults(data, query) {
  const { notes } = buildGroupedSearchResults(data, query);
  return notes;
}
