import { learningCategories } from "./data.js";
import { getManagedClasses, upsertManagedClass, deleteManagedClass } from "./class-store.js";
import { currentStaff, readProfile, saveProfile, saveAuth, passwordHash, normalizeEmail, signOut } from "./staff-auth-utils.js";

const $ = selector => document.querySelector(selector);
const admin = currentStaff();
const profile = admin?.email ? readProfile(admin.email) : null;
const allowed = ["admin", "administrator"].includes(String(profile?.role || admin?.role || "").toLowerCase());
if (!admin?.email || !allowed) location.href = "staff-login.html";
else {
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
  const readJSON = key => { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; } };
  const classes = () => getManagedClasses();
  const allProfiles = () => Object.keys(localStorage).filter(key => key.startsWith("dn-account:")).map(key => readJSON(key)).filter(Boolean);
  const tutors = () => allProfiles().filter(item => String(item.role).toLowerCase() === "tutor");
  const notesFor = item => readJSON(`dn-published-class-notes:${item.id}`);
  const formatDate = value => { if (!value) return "Date not set"; const date = new Date(`${value}T12:00:00`); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { month:"short", day:"numeric", year:"numeric" }).format(date); };
  const safeURL = value => { try { const url = new URL(value); return ["http:","https:"].includes(url.protocol) ? url.href : ""; } catch { return ""; } };
  const fullName = profile?.name || admin.name || "Administrator";
  $("#adminIdentity").textContent = fullName;
  $("#adminFirstName").textContent = String(profile?.firstName || fullName.split(/\s+/)[0]);
  $("#adminLogout").addEventListener("click", signOut);

  const panels = ["overview","classes","tutors","notes","resources"];
  function showPanel(name) {
    if (!panels.includes(name)) return;
    document.querySelectorAll(".admin-panel").forEach(panel => panel.classList.toggle("active", panel.id === `panel-${name}`));
    document.querySelectorAll(".admin-nav").forEach(button => button.classList.toggle("active", button.dataset.panel === name));
    if (name === "classes") renderClasses(); if (name === "tutors") renderTutors(); if (name === "notes") renderNotes(); if (name === "resources") renderMedia();
  }
  document.querySelectorAll("[data-panel]").forEach(button => button.addEventListener("click", () => showPanel(button.dataset.panel)));
  document.querySelectorAll("[data-open-panel]").forEach(button => button.addEventListener("click", () => showPanel(button.dataset.openPanel)));

  const categoryOptions = learningCategories.map(category => `<option value="${esc(category)}">${esc(category)}</option>`).join("");
  $("#classCategory").innerHTML = categoryOptions;
  $("#categoryFilter").innerHTML += learningCategories.map(category => `<option value="${esc(category)}">${esc(category)}</option>`).join("");
  function updateStats() {
    const list = classes(); const activeTutors = tutors().filter(item => item.active !== false);
    $("#statClasses").textContent = list.length;
    $("#statSessions").textContent = list.filter(item => item.date).length;
    $("#statTutors").textContent = activeTutors.length;
    $("#statNotes").textContent = list.filter(item => notesFor(item)?.status === "published").length;
  }
  function renderOverview() {
    const upcoming = classes().filter(item => item.date).sort((a,b) => `${a.date} ${a.time || "00:00"}`.localeCompare(`${b.date} ${b.time || "00:00"}`)).slice(0,5);
    $("#upcomingList").innerHTML = upcoming.length ? upcoming.map(item => `<div class="admin-list-row"><span class="list-date"><b>${esc(item.date?.slice(8,10) || "—")}</b><small>${esc(item.date?.slice(5,7) || "")}</small></span><div><strong>${esc(item.title)}</strong><small>${esc(formatDate(item.date))} · ${esc(item.time || "Time TBC")} · ${esc(item.instructor || "Instructor TBC")}</small></div></div>`).join("") : `<p class="empty-state">No scheduled classes yet.</p>`;
    const team = tutors().filter(item => item.active !== false).slice(0,5);
    $("#overviewTutors").innerHTML = team.length ? team.map(item => `<div class="admin-list-row"><span class="avatar-circle">${esc((item.name || "T").split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase())}</span><div><strong>${esc(item.name || item.email)}</strong><small>${(item.assignedClassIds || []).length} assigned class(es)</small></div></div>`).join("") : `<p class="empty-state">No active tutors yet.</p>`;
  }
  function renderClasses() {
    const query = $("#classSearch").value.trim().toLowerCase(); const category = $("#categoryFilter").value;
    const filtered = classes().filter(item => (!category || item.category === category) && (!query || `${item.title} ${item.instructor} ${item.category}`.toLowerCase().includes(query)));
    $("#classesTable").innerHTML = `<table class="admin-data-table"><thead><tr><th>Class</th><th>Instructor</th><th>Schedule</th><th>Media</th><th></th></tr></thead><tbody>${filtered.map(item => `<tr><td><b>${esc(item.title)}</b><small>${esc(item.category || "Uncategorised")}</small></td><td>${esc(item.instructor || "—")}</td><td>${esc(formatDate(item.date))}<small>${esc(item.time || "Time TBC")} · ${esc(item.duration || 30)} min</small></td><td><span class="media-state ${item.liveStreamUrl || item.streamUrl ? "has-media" : ""}">${item.liveStreamUrl || item.streamUrl ? "Live link added" : "No live link"}</span><small>${item.recordingUrl || item.videoUrl ? "Replay added" : "No replay"}</small></td><td class="row-actions"><button data-edit-class="${esc(item.id)}" aria-label="Edit ${esc(item.title)}"><i class="fa-solid fa-pen"></i></button><button data-delete-class="${esc(item.id)}" aria-label="Delete ${esc(item.title)}"><i class="fa-solid fa-trash"></i></button></td></tr>`).join("") || `<tr><td colspan="5"><p class="empty-state">No classes match your search.</p></td></tr>`}</tbody></table>`;
    $("#classesTable").querySelectorAll("[data-edit-class]").forEach(button => button.addEventListener("click", () => openClassEditor(button.dataset.editClass)));
    $("#classesTable").querySelectorAll("[data-delete-class]").forEach(button => button.addEventListener("click", () => removeClass(button.dataset.deleteClass)));
  }
  function openClassEditor(id = "") {
    const item = classes().find(entry => entry.id === id) || {};
    $("#classEditorTitle").textContent = id ? "Edit class & session" : "Add a class";
    $("#classId").value = item.id || ""; $("#classTitle").value = item.title || ""; $("#classCategory").value = item.category || learningCategories[0] || "";
    $("#classInstructor").value = item.instructor || ""; $("#classDate").value = item.date || ""; $("#classTime").value = item.time || "";
    $("#classDuration").value = item.duration || 30; $("#classImage").value = item.image || ""; $("#classDescription").value = item.description || item.intro || "";
    $("#classFeedback").textContent = ""; $("#classEditor").hidden = false; $("#classEditor").scrollIntoView({ behavior:"smooth", block:"start" });
  }
  function closeEditor() { $("#classEditor").hidden = true; $("#classForm").reset(); }
  function removeClass(id) {
    const item = classes().find(entry => entry.id === id); if (!item || !confirm(`Delete “${item.title}”? This also removes its published class notes.`)) return;
    deleteManagedClass(id); localStorage.removeItem(`dn-published-class-notes:${id}`);
    Object.keys(localStorage).filter(key => key.startsWith("dn-tutor-note-draft:") && key.endsWith(`:${id}`)).forEach(key => localStorage.removeItem(key));
    renderAll();
  }
  $("#addClassBtn").addEventListener("click", () => openClassEditor());
  $("#closeClassEditor").addEventListener("click", closeEditor); $("#cancelClass").addEventListener("click", closeEditor);
  $("#classSearch").addEventListener("input", renderClasses); $("#categoryFilter").addEventListener("change", renderClasses);
  $("#classForm").addEventListener("submit", event => {
    event.preventDefault(); const id = $("#classId").value || `dn-class-${Date.now()}`;
    const image = safeURL($("#classImage").value.trim()); if ($("#classImage").value.trim() && !image) { $("#classFeedback").textContent = "Enter a valid http or https image URL."; return; }
    const old = classes().find(item => item.id === id) || {};
    upsertManagedClass({ ...old, id, title:$("#classTitle").value.trim(), category:$("#classCategory").value, instructor:$("#classInstructor").value.trim(), date:$("#classDate").value, time:$("#classTime").value, duration:Number($("#classDuration").value), image:image || old.image || "assets/images/community-1.jpg", description:$("#classDescription").value.trim() });
    closeEditor(); renderAll();
  });

  function renderAssignmentChoices(selected = []) {
    $("#classChoices").innerHTML = classes().map(item => `<label class="check-row"><input type="checkbox" value="${esc(item.id)}" ${selected.includes(item.id) ? "checked" : ""}><span>${esc(item.title)}</span></label>`).join("") || `<p class="empty-state">Add classes before assigning a tutor.</p>`;
  }
  function renderTutors() {
    const list = tutors();
    $("#staffList").innerHTML = list.length ? list.map(item => `<article class="tutor-row"><div class="tutor-row-main"><span class="avatar-circle">${esc((item.name || "T").split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase())}</span><div><b>${esc(item.name || item.email)}</b><small>${esc(item.email)}</small><small>${(item.assignedClassIds || []).length} assigned class(es) · <span class="${item.active === false ? "inactive-text" : "active-text"}">${item.active === false ? "Inactive" : "Active"}</span></small></div></div><button class="admin-secondary" data-manage-tutor="${esc(item.email)}">Manage</button></article>`).join("") : `<p class="empty-state">No tutor accounts have been created yet.</p>`;
    $("#staffList").querySelectorAll("[data-manage-tutor]").forEach(button => button.addEventListener("click", () => openTutorEditor(button.dataset.manageTutor)));
    renderAssignmentChoices();
  }
  $("#createTutor").addEventListener("submit", async event => {
    event.preventDefault(); const name = $("#tutorName").value.trim(); const email = normalizeEmail($("#tutorEmail").value); const password = $("#tutorPassword").value;
    const assignedClassIds = [...$("#classChoices").querySelectorAll("input:checked")].map(input => input.value); const feedback = $("#tutorFeedback"); feedback.textContent = "";
    if (password.length < 10) { feedback.textContent = "Temporary password must contain at least 10 characters."; return; }
    if (readProfile(email)) { feedback.textContent = "An account with this email already exists."; return; }
    try { const tutor = { email, name, firstName:name.split(/\s+/)[0], role:"tutor", assignedClassIds, active:true, createdAt:new Date().toISOString() };
      saveProfile(tutor); saveAuth(email, { passwordHash:await passwordHash(password), active:true, role:"tutor", mustChangePassword:true });
      feedback.textContent = "Tutor account created. Share the login details securely."; event.target.reset(); renderTutors(); updateStats(); renderOverview();
    } catch { feedback.textContent = "Account could not be created. Use localhost or HTTPS in a modern browser."; }
  });
  function openTutorEditor(email) {
    const tutor = readProfile(email); if (!tutor) return;
    const overlay = document.createElement("div"); overlay.className = "admin-modal-backdrop"; overlay.innerHTML = `<section class="admin-modal" role="dialog" aria-modal="true" aria-labelledby="tutorModalTitle"><div class="card-heading"><div><h3 id="tutorModalTitle">Manage tutor</h3><p>${esc(tutor.email)}</p></div><button class="icon-close" data-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div><label class="modal-label">Tutor name<input id="editTutorName" value="${esc(tutor.name || "")}"></label><div class="class-picker"><strong>Assigned classes</strong><div id="editTutorClasses" class="assignment-choices">${classes().map(item => `<label class="check-row"><input type="checkbox" value="${esc(item.id)}" ${(tutor.assignedClassIds || []).includes(item.id) ? "checked" : ""}><span>${esc(item.title)}</span></label>`).join("")}</div></div><label class="toggle-row"><input id="editTutorActive" type="checkbox" ${tutor.active !== false ? "checked" : ""}> Account is active</label><div class="form-actions"><button class="admin-secondary" data-close>Cancel</button><button class="admin-action" id="saveTutorChanges">Save changes</button></div><p class="admin-feedback" id="tutorEditFeedback" aria-live="polite"></p></section>`;
    document.body.append(overlay); const close = () => overlay.remove(); overlay.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", close)); overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
    overlay.querySelector("#saveTutorChanges").addEventListener("click", () => {
      tutor.name = overlay.querySelector("#editTutorName").value.trim() || tutor.name;
      tutor.firstName = tutor.name.split(/\s+/)[0]; tutor.assignedClassIds = [...overlay.querySelectorAll("#editTutorClasses input:checked")].map(input => input.value);
      tutor.active = overlay.querySelector("#editTutorActive").checked; saveProfile(tutor);
      const auth = readJSON(`dn-staff-auth:${email}`) || {}; auth.active = tutor.active; localStorage.setItem(`dn-staff-auth:${email}`, JSON.stringify(auth));
      close(); renderTutors(); renderOverview(); updateStats();
    });
  }
  function renderNotes() {
    const rows = classes().map(item => ({ item, note:notesFor(item) })).filter(row => row.note);
    $("#notesTable").innerHTML = `<table class="admin-data-table"><thead><tr><th>Class</th><th>Status</th><th>Last updated</th><th>Actions</th></tr></thead><tbody>${rows.map(({item,note}) => `<tr><td><b>${esc(item.title)}</b><small>${esc(note.updatedBy || "Tutor")}</small></td><td><span class="note-pill">${esc(String(note.status || "published").toUpperCase())}</span></td><td>${esc(note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : "—")}</td><td class="row-actions"><button data-unpublish="${esc(item.id)}" title="Unpublish notes"><i class="fa-solid fa-eye-slash"></i></button></td></tr>`).join("") || `<tr><td colspan="4"><p class="empty-state">No tutor notes have been published yet.</p></td></tr>`}</tbody></table>`;
    $("#notesTable").querySelectorAll("[data-unpublish]").forEach(button => button.addEventListener("click", () => { const item = classes().find(entry => entry.id === button.dataset.unpublish); if (!item || !confirm(`Unpublish the notes for “${item.title}”?`)) return; localStorage.removeItem(`dn-published-class-notes:${item.id}`); renderNotes(); updateStats(); }));
  }
  function renderMedia() {
    $("#mediaTable").innerHTML = `<table class="admin-data-table"><thead><tr><th>Class</th><th>Live stream</th><th>Replay</th><th>Manage</th></tr></thead><tbody>${classes().map(item => `<tr><td><b>${esc(item.title)}</b><small>${esc(item.instructor || "Instructor TBC")}</small></td><td><span class="media-state ${item.liveStreamUrl || item.streamUrl ? "has-media" : ""}">${item.liveStreamUrl || item.streamUrl ? "Added" : "Not added"}</span></td><td><span class="media-state ${item.recordingUrl || item.videoUrl ? "has-media" : ""}">${item.recordingUrl || item.videoUrl ? "Added" : "Not added"}</span></td><td><button class="admin-secondary" data-media-edit="${esc(item.id)}">Edit media</button></td></tr>`).join("") || `<tr><td colspan="4"><p class="empty-state">No classes available.</p></td></tr>`}</tbody></table>`;
    $("#mediaTable").querySelectorAll("[data-media-edit]").forEach(button => button.addEventListener("click", () => openMediaEditor(button.dataset.mediaEdit)));
  }
  function openMediaEditor(id) {
    const item = classes().find(entry => entry.id === id); if (!item) return;
    const overlay = document.createElement("div"); overlay.className = "admin-modal-backdrop"; overlay.innerHTML = `<section class="admin-modal" role="dialog" aria-modal="true"><div class="card-heading"><div><h3>Class media links</h3><p>${esc(item.title)}</p></div><button class="icon-close" data-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div><label class="modal-label">Live stream URL (HLS or MP4)<input id="editLiveUrl" type="url" value="${esc(item.liveStreamUrl || item.streamUrl || "")}" placeholder="https://example.com/live.m3u8"></label><label class="modal-label">Replay / recording URL<input id="editReplayUrl" type="url" value="${esc(item.recordingUrl || item.videoUrl || "")}" placeholder="https://example.com/recording.mp4"></label><div class="form-actions"><button class="admin-secondary" data-close>Cancel</button><button class="admin-action" id="saveMedia">Save media links</button></div><p class="admin-feedback" id="mediaFeedback" aria-live="polite"></p></section>`;
    document.body.append(overlay); const close = () => overlay.remove(); overlay.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", close)); overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
    overlay.querySelector("#saveMedia").addEventListener("click", () => {
      const liveRaw = overlay.querySelector("#editLiveUrl").value.trim(); const replayRaw = overlay.querySelector("#editReplayUrl").value.trim();
      const live = liveRaw ? safeURL(liveRaw) : ""; const replay = replayRaw ? safeURL(replayRaw) : "";
      if ((liveRaw && !live) || (replayRaw && !replay)) { overlay.querySelector("#mediaFeedback").textContent = "Use valid http or https URLs for media links."; return; }
      upsertManagedClass({ ...item, liveStreamUrl:live, streamUrl:live, recordingUrl:replay, videoUrl:replay, video:Boolean(live || replay) }); close(); renderMedia(); renderClasses(); updateStats();
    });
  }
  function renderAll() { updateStats(); renderOverview(); renderClasses(); renderTutors(); renderNotes(); renderMedia(); }
  renderAll();
}
