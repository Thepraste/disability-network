import { getManagedClasses } from "./class-store.js";
const classes = getManagedClasses();
const $=s=>document.querySelector(s);
const currentUser=(()=>{try{return JSON.parse(localStorage.getItem("dn-current-user")||"null")}catch{return null}})();
const profile=(()=>{try{return currentUser?.email?JSON.parse(localStorage.getItem(`dn-account:${currentUser.email.toLowerCase()}`)||"null"):null}catch{return null}})();
const role=String(profile?.role||currentUser?.role||"").toLowerCase();
const isAdmin=["admin","administrator"].includes(role);
const isTutor=role==="tutor";
const access=$("#accessDenied");
if(!currentUser?.email||(!isAdmin&&!isTutor)){
 access.hidden=false;document.querySelector(".td-topbar").hidden=true;document.querySelector(".td-shell").hidden=true;
}else{
 const email=currentUser.email.toLowerCase();
 const fullName=profile?.name||currentUser.name||email.split("@")[0];
 const firstName=String(profile?.firstName||fullName.split(/\s+/)[0]||"Tutor");
 $("#tdUserName").textContent=fullName;$("#tdFirstName").textContent=firstName;if(isAdmin)$("#tdAdminLink").hidden=false;
 const assigned=Array.isArray(profile?.assignedClassIds)?profile.assignedClassIds:[];
 const available=isAdmin?classes:classes.filter(item=>assigned.includes(item.id)||String(item.instructor||"").toLowerCase()===fullName.toLowerCase());
 const publishedKey=id=>`dn-published-class-notes:${id}`;
 const draftKey=id=>`dn-tutor-note-draft:${email}:${id}`;
 const getPublished=id=>{try{return JSON.parse(localStorage.getItem(publishedKey(id))||"null")}catch{return null}};
 const getDraft=id=>{try{return JSON.parse(localStorage.getItem(draftKey(id))||"null")}catch{return null}};
 let selected=null;
 const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const navTo=name=>{document.querySelectorAll(".td-view").forEach(v=>v.classList.toggle("active",v.id===`view-${name}`));document.querySelectorAll(".td-nav").forEach(b=>b.classList.toggle("active",b.dataset.view===name));};
 document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>navTo(b.dataset.view)));
 document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>navTo(b.dataset.goto)));
 const noteCounts=()=>({published:available.filter(c=>getPublished(c.id)?.status==="published").length,drafts:available.filter(c=>getDraft(c.id)).length});
 const card=(item)=>{const published=getPublished(item.id);return `<article class="td-class-card"><img src="${esc(item.image||"assets/images/community-1.jpg")}" alt=""><div class="td-card-body"><div class="td-card-meta"><span>${esc(item.category||"Class")}</span><span class="td-status ${published?.status==="published"?"is-published":""}">${published?.status==="published"?"PUBLISHED":"NOT PUBLISHED"}</span></div><h3>${esc(item.title)}</h3><p><i class="fa-regular fa-user"></i> ${esc(item.instructor||"Disability Network Guide")}</p><button class="td-secondary td-manage" data-class-id="${esc(item.id)}">Manage class notes <i class="fa-solid fa-arrow-right"></i></button></div></article>`};
 const renderClasses=()=>{const html=available.length?available.map(card).join(""):`<div class="td-empty"><i class="fa-solid fa-chalkboard"></i><h3>No classes assigned yet</h3><p>${isAdmin?"There are no classes in the class catalogue yet.":"Ask an administrator to assign classes to your tutor account."}</p></div>`;$("#overviewClasses").innerHTML=html;$("#allClasses").innerHTML=html;$("#notesClassList").innerHTML=available.map(c=>`<button class="td-note-class ${selected?.id===c.id?"active":""}" data-class-id="${esc(c.id)}"><strong>${esc(c.title)}</strong><small>${esc(c.instructor||"Disability Network Guide")}</small><span>${getPublished(c.id)?.status==="published"?"Published":"Draft / not published"}</span></button>`).join("")||`<p class="td-muted">No assigned classes.</p>`;document.querySelectorAll("[data-class-id]").forEach(b=>b.addEventListener("click",()=>openClass(b.dataset.classId)));const counts=noteCounts();$("#statClasses").textContent=available.length;$("#statPublished").textContent=counts.published;$("#statDrafts").textContent=counts.drafts;};
 const toSections=text=>String(text||"").split(/\n\s*\n/).map(chunk=>chunk.trim()).filter(Boolean).map(chunk=>{const lines=chunk.split("\n");const heading=lines[0].startsWith("#")?lines.shift().replace(/^#+\s*/,""):"";const body=lines.join("\n")||(heading?"":"");return {heading,content:body||(!heading?chunk:"")};});
 const formData=()=>({intro:$("#notesIntro").value.trim(),body:$("#notesBody").value.trim(),links:$("#notesLinks").value.split(/\n/).map(x=>x.trim()).filter(Boolean)});
 const linksHtml=links=>links.map(url=>{try{const parsed=new URL(url);if(!["http:","https:"].includes(parsed.protocol))return "";return `<p><a href="${esc(parsed.href)}" target="_blank" rel="noopener">${esc(parsed.href)}</a></p>`}catch{return ""}}).join("");
 const notesObject=(data,status)=>({status,title:selected.title,intro:data.intro,sections:toSections(data.body),links:data.links,updatedBy:email,updatedAt:new Date().toISOString(),status});
 function openClass(id){selected=available.find(c=>c.id===id)||null;if(!selected)return;navTo("notes");$("#editorEmpty").hidden=true;$("#notesEditor").hidden=false;$("#editorClassTitle").textContent=selected.title;$("#editorClassMeta").textContent=`${selected.instructor||"Disability Network Guide"} · ${selected.category||"Class"}`;const saved=getDraft(id)||getPublished(id)||{};$("#notesIntro").value=saved.intro||"";$("#notesBody").value=(saved.sections||[]).map(s=>(s.heading?`# ${s.heading}\n`:"")+(s.content||"")).join("\n\n")||saved.body||"";$("#notesLinks").value=(saved.links||[]).join("\n");const published=getPublished(id)?.status==="published";$("#editorStatus").textContent=published?"PUBLISHED":"DRAFT";$("#editorStatus").classList.toggle("is-published",published);$("#editorFeedback").textContent="";renderClasses();}
 const saveDraft=()=>{if(!selected)return;const data=formData();localStorage.setItem(draftKey(selected.id),JSON.stringify({...data,status:"draft",updatedAt:new Date().toISOString()}));$("#editorStatus").textContent="DRAFT SAVED";$("#editorFeedback").textContent="Your draft has been saved. Learners cannot see it yet.";renderClasses();};
 $("#saveDraft").addEventListener("click",saveDraft);
 $("#notesEditor").addEventListener("submit",event=>{event.preventDefault();if(!selected)return;const data=formData();if(!data.intro&&!data.body&&!data.links.length){$("#editorFeedback").textContent="Add some notes or resources before publishing.";return;}const record=notesObject(data,"published");localStorage.setItem(publishedKey(selected.id),JSON.stringify(record));localStorage.removeItem(draftKey(selected.id));$("#editorStatus").textContent="PUBLISHED";$("#editorStatus").classList.add("is-published");$("#editorFeedback").textContent="Published. Learners can now see these notes in the classroom.";renderClasses();});
 $("#unpublishNotes").addEventListener("click",()=>{if(!selected)return;localStorage.removeItem(publishedKey(selected.id));$("#editorStatus").textContent="NOT PUBLISHED";$("#editorStatus").classList.remove("is-published");$("#editorFeedback").textContent="These notes are no longer visible to learners.";renderClasses();});
 const renderPreview=()=>{if(!selected)return;const d=formData();$("#previewTitle").textContent=`${selected.title} — Class Notes`;$("#previewContent").innerHTML=`${d.intro?`<p>${esc(d.intro)}</p>`:""}${toSections(d.body).map(s=>`<section>${s.heading?`<h3>${esc(s.heading)}</h3>`:""}<p>${esc(s.content).replace(/\n/g,"<br>")}</p></section>`).join("")}${linksHtml(d.links)}`;$("#previewModal").hidden=false;};
 $("#previewNotes").addEventListener("click",renderPreview);$("#closePreview").addEventListener("click",()=>$("#previewModal").hidden=true);$("#previewModal").addEventListener("click",e=>{if(e.target.id==="previewModal")$("#previewModal").hidden=true;});
 $("#tdCreateFirst").addEventListener("click",()=>{if(available[0])openClass(available[0].id);else navTo("classes");});
 $("#tdLogout").addEventListener("click",()=>{localStorage.removeItem("dn-current-user");location.href="index.html";});
 renderClasses();
}
