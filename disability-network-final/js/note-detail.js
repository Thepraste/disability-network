(() => {
  const $ = selector => document.querySelector(selector);
  const params = new URLSearchParams(window.location.search);
  const noteId = params.get("id");
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("dn-current-user") || "null"); }
    catch { return null; }
  })();
  const content = $("#savedNoteText");

  if (!user?.email) {
    content.innerHTML = `<div class="notes-empty"><h3>Please log in to view your notes</h3><p>Your saved class notes belong to your learner account.</p><a class="notes-primary" href="auth.html#login">Log in</a></div>`;
    return;
  }
  if (!noteId) {
    content.innerHTML = `<div class="notes-empty"><h3>No class selected</h3><p>Return to My Class Notes and choose the class notes you want to open.</p><a class="notes-primary" href="my-class-notes.html">Back to My Class Notes</a></div>`;
    return;
  }

  const key = `dn-class-notes:${user.email.toLowerCase()}`;
  let records = [];
  try {
    const stored = JSON.parse(localStorage.getItem(key) || "[]");
    records = Array.isArray(stored) ? stored : [];
  } catch {}
  const record = records.find(item => String(item.id) === String(noteId));

  if (!record) {
    content.innerHTML = `<div class="notes-empty"><h3>These notes could not be found</h3><p>The saved notes may have been removed, or they may belong to a different signed-in account.</p><a class="notes-primary" href="my-class-notes.html">Back to My Class Notes</a></div>`;
    return;
  }

  const safe = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[char]));
  $("#detailTitle").textContent = record.title || "Class Notes";
  $("#detailInstructor").textContent = record.instructor || "Disability Network Guide";
  const meta = document.querySelector(".notes-doc .note-meta");
  if (meta) {
    const date = record.date ? new Intl.DateTimeFormat("en-US", {
      month:"short", day:"numeric", year:"numeric"
    }).format(new Date(`${record.date}T12:00:00`)) : "Date not available";
    meta.innerHTML = `<span><i class="fa-regular fa-calendar"></i> ${safe(date)}</span><span><i class="fa-regular fa-clock"></i> ${safe(record.duration || "—")} min</span><span><i class="fa-regular fa-file-lines"></i> Saved notes</span>`;
  }
  const viewClass = document.querySelector('.notes-doc .note-actions a[href="class-detail.html"]');
  if (viewClass) viewClass.href = `class-detail.html?id=${encodeURIComponent(record.id)}`;
  const noteText = String(record.notes || "").trim();
  content.innerHTML = noteText
    ? `<div class="saved-note-body">${safe(noteText).replace(/\r\n?|\n/g, "<br>")}</div><p class="saved-note-date">Last saved ${safe(record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "on this device")}</p>`
    : `<p>You haven't written any notes for this class yet. Open the classroom, add your notes and select Save notes.</p>`;
})();