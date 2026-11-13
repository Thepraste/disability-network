import { getManagedClasses } from "./class-store.js";
const classes = getManagedClasses();
const $=s=>document.querySelector(s);
const params=new URLSearchParams(location.search);
const id=params.get("id");
const mode=params.get("mode")==="replay"?"replay":"live";
const current=classes.find(item=>item.id===id)||null;
const user=(()=>{try{return JSON.parse(localStorage.getItem("dn-current-user")||"null")}catch{return null}})();
const video=$("#classVideo"),empty=$("#videoEmpty"),badge=$("#playbackBadge");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const guide=current?.instructor||"Disability Network Guide";
const initials=guide.split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase();
const classTitle=current?.title||"Disability Network Classroom";
document.title=`${classTitle} | Disability Network`;
$("#roomClassName").textContent=classTitle;
$("#roomGuideName").textContent=guide;
$("#videoTitle").textContent=classTitle;
$("#chatGuideName").textContent=guide;
$("#chatGuideInitials").textContent=initials;
$("#infoGuideInitials").textContent=initials;
$("#infoGuideName").textContent=guide;
$("#infoTitle").textContent=classTitle;
$("#infoDescription").textContent=current?.description||`${classTitle} is a learning session led by ${guide}. Join the class and explore practical information in a welcoming environment.`;
$("#infoDuration").textContent=current?.duration?`${current.duration} minutes`:"Class session";
$("#infoCategory").textContent=current?.category||"Learning";
$("#fullDetailsLink").href=current?`class-detail.html?id=${encodeURIComponent(current.id)}`:"class-detail.html";
$("#exitRoom").href=current?`class-detail.html?id=${encodeURIComponent(current.id)}`:"my-schedule.html";
badge.textContent=mode==="live"?"LIVE":"REPLAY";
badge.classList.toggle("live",mode==="live");
$("#roomModeStatus").textContent=mode==="live"?"Live session":"Recorded class";
$("#videoMessage").textContent=mode==="live"?"The live stream will appear here when the session starts and a stream link has been added.":"The class recording will appear here when a recording has been uploaded to the Disability Network server.";
const source=mode==="live"?(current?.liveStreamUrl||current?.streamUrl||""):(current?.recordingUrl||current?.videoUrl||"");
const type=mode==="live"?(current?.liveVideoType||current?.videoType||"hls"):(current?.recordingType||current?.videoType||"mp4");
if(source){
 empty.hidden=true;video.classList.add("has-source");
 if(type==="hls"&&window.Hls&&window.Hls.isSupported()){
  const hls=new Hls();hls.loadSource(source);hls.attachMedia(video);hls.on(Hls.Events.ERROR,(_,data)=>{if(data.fatal)$("#videoError").hidden=false;});
 }else if(video.canPlayType("application/vnd.apple.mpegurl")&&type==="hls"){video.src=source;}
 else{video.src=source;}
 video.addEventListener("error",()=>$("#videoError").hidden=false);
 const progressKey=user?.email?`dn-video-progress:${user.email.toLowerCase()}:${current?.id}:${mode}`:"";
 if(progressKey){
  video.addEventListener("loadedmetadata",()=>{const saved=Number(localStorage.getItem(progressKey)||0);if(saved>5&&saved<video.duration-5)video.currentTime=saved;});
  video.addEventListener("timeupdate",()=>{if(Number.isFinite(video.currentTime)&&video.currentTime>0)localStorage.setItem(progressKey,String(Math.floor(video.currentTime)));});
  video.addEventListener("ended",()=>localStorage.removeItem(progressKey));
 }
}else{video.classList.remove("has-source");empty.hidden=false;}
// Tutor-owned class notes: read-only for learners and supplied through class data.
const publishedTutorNotes = (() => {
 try { const record=JSON.parse(localStorage.getItem(`dn-published-class-notes:${current?.id}`)||"null"); return record?.status==="published"?record:null; }
 catch { return null; }
})();
const tutorNotes = publishedTutorNotes ?? current?.tutorNotes ?? current?.instructorNotes ?? current?.classNotes ?? current?.notes ?? null;
const notesBody = $("#tutorNotesBody");
const safeText = value => String(value ?? "").replace(/[&<>"']/g, char => ({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[char]));
const renderTutorNotes = value => {
 if (!value) {
  notesBody.innerHTML = `<div class="tutor-notes-empty"><i class="fa-regular fa-file-lines"></i><h3>Instructor notes coming soon</h3><p>Your Guide has not added class notes for this session yet. Check back during the class.</p></div>`;
  return;
 }
 if (typeof value === "string") {
  notesBody.innerHTML = `<div class="tutor-notes-prose">${safeText(value).replace(/\\r\\n?|\\n/g,"<br>")}</div>`;
  return;
 }
 const sections = Array.isArray(value) ? value : (Array.isArray(value.sections) ? value.sections : [value]);
 const intro = typeof value==="object"&&!Array.isArray(value)?value.intro||"":"";
 const links = typeof value==="object"&&!Array.isArray(value)&&Array.isArray(value.links)?value.links:[];
 const sectionHtml = sections.map(section => {
  if (typeof section === "string") return `<div class="tutor-note-section"><p>${safeText(section).replace(/\r\n?|\n/g,"<br>")}</p></div>`;
  const heading = section.heading || section.title || section.topic || "";
  const body = section.content || section.text || section.description || "";
  const items = Array.isArray(section.items) ? `<ul>${section.items.map(item=>`<li>${safeText(item)}</li>`).join("")}</ul>` : "";
  const sectionLinks = Array.isArray(section.links) ? `<div class="tutor-note-links">${section.links.map(link=>`<p><a href="${safeText(link.url||"#")}" target="_blank" rel="noopener">${safeText(link.label||link.title||link.url)}</a></p>`).join("")}</div>` : "";
  return `<section class="tutor-note-section">${heading?`<h3>${safeText(heading)}</h3>`:""}${body?`<p>${safeText(body).replace(/\r\n?|\n/g,"<br>")}</p>`:""}${items}${sectionLinks}</section>`;
 }).join("");
 const linksHtml = links.map(url=>{try{const parsed=new URL(typeof url==="string"?url:url.url);if(!["http:","https:"].includes(parsed.protocol))return "";return `<p><a href="${safeText(parsed.href)}" target="_blank" rel="noopener">${safeText(typeof url==="string"?url:(url.label||url.title||parsed.href))}</a></p>`}catch{return ""}}).join("");
 notesBody.innerHTML = `${intro?`<p class="tutor-notes-intro">${safeText(intro).replace(/\r\n?|\n/g,"<br>")}</p>`:""}${sectionHtml}${linksHtml}` || `<p>Your instructor has not added notes yet.</p>`;
};
$("#tutorNotesTitle").textContent=current?.title ? `${current.title} — Class Notes` : "Class Notes";
renderTutorNotes(tutorNotes);
const notesToggle=$("#classNotesToggle");
const showPanelView = name => {
 document.querySelectorAll(".panel-view").forEach(panel=>panel.classList.toggle("active",panel.id===`panel-${name}`));
 document.querySelectorAll("[data-panel]").forEach(button=>button.classList.toggle("active",button.dataset.panel===name));
 notesToggle?.setAttribute("aria-pressed",String(name==="notes"));
};
notesToggle?.addEventListener("click",()=>showPanelView(notesToggle.getAttribute("aria-pressed")==="true"?"chat":"notes"));
const layout=$(".room-layout");
$("#panelCollapse").addEventListener("click",()=>layout.classList.add("panel-hidden"));
$("#closePanel").addEventListener("click",()=>layout.classList.add("panel-hidden"));
$("#reopenPanel").addEventListener("click",()=>layout.classList.remove("panel-hidden"));
$("#panelExpand").addEventListener("click",()=>layout.classList.toggle("panel-wide"));
$("#expandSide").addEventListener("click",()=>layout.classList.toggle("panel-hidden"));
document.querySelectorAll("[data-panel]").forEach(btn=>btn.addEventListener("click",()=>showPanelView(btn.dataset.panel)));
document.querySelectorAll("[data-chat-mode]").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll("[data-chat-mode]").forEach(b=>b.classList.toggle("active",b===btn));$("#classChatView").classList.toggle("active",btn.dataset.chatMode==="class");$("#helenView").classList.toggle("active",btn.dataset.chatMode==="helen");}));
const appendLocalMessage=(name,text)=>{const placeholder=$("#chatMessages .chat-placeholder");placeholder?.remove();const el=document.createElement("div");el.style.cssText="background:#fff;border:1px solid #e5e6eb;border-radius:9px;padding:8px 10px;margin:7px 0;font-size:11px";const strong=document.createElement("strong");strong.textContent=name;strong.style.cssText="display:block;color:#29358c;margin-bottom:3px";const body=document.createElement("span");body.textContent=text;el.append(strong,body);$("#chatMessages").append(el);$("#chatMessages").scrollTop=$("#chatMessages").scrollHeight;};
$("#classChatForm").addEventListener("submit",e=>{e.preventDefault();const input=$("#classChatInput"),text=input.value.trim();if(!text)return;appendLocalMessage(user?.name||"You",text);input.value="";});
$("#helenForm").addEventListener("submit",e=>{e.preventDefault();const input=$("#helenInput"),text=input.value.trim();if(!text)return;alert("Helen's AI service will be connected here. Your question is ready to send once the assistant backend is configured.");input.value="";});
document.querySelectorAll(".helen-suggestions button").forEach(b=>b.addEventListener("click",()=>{$("#helenInput").value=b.textContent;$("#helenInput").focus();}));
