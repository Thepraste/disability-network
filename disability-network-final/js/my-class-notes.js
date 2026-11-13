
(() => {
 const $=s=>document.querySelector(s);
 const user=(()=>{try{return JSON.parse(localStorage.getItem("dn-current-user")||"null")}catch{return null}})();
 const key=user?.email?`dn-class-notes:${user.email.toLowerCase()}`:"";
 const sample={
  id:"google-calendar-basics",title:"How to Schedule Events With Google Calendar (15-min class)",
  instructor:"Wade Yarbrough",date:"2026-11-10",duration:13,
  image:"assets/images/google-calendar.svg",
  summary:"In this class you discover how to effectively use Google Calendar for scheduling events and appointments."
 };
 let records=[];
 if(key){
  try{records=JSON.parse(localStorage.getItem(key)||"null")}catch{}
  if(!Array.isArray(records)){records=[sample];localStorage.setItem(key,JSON.stringify(records))}
 }
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const dateLabel=d=>new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric"}).format(new Date(`${d}T12:00:00`));
 const list=$("#classNotesList");
 if(list){
  if(!user?.email){
   list.innerHTML=`<div class="notes-empty"><i class="fa-regular fa-file-lines"></i><h2>Log in to view your class notes</h2><p>Your notes and recordings will appear here after you sign in.</p><a class="notes-primary" href="auth.html#login">Log in</a></div>`;
  }else if(!records.length){
   list.innerHTML=`<div class="notes-empty"><i class="fa-regular fa-file-lines"></i><h2>No class notes yet</h2><p>Notes from classes you've attended will appear here.</p><a class="notes-primary" href="calendar.html">Browse classes</a></div>`;
  }else{
   list.innerHTML=records.map(r=>`<article class="note-class-card">
    <img class="note-class-image" src="${esc(r.image||sample.image)}" alt="Class thumbnail">
    <div class="note-class-info"><h2>${esc(r.title)}</h2><p class="note-instructor">${esc(r.instructor)}</p>
     <div class="note-meta"><span><i class="fa-regular fa-calendar"></i> ${esc(dateLabel(r.date))}</span><span><i class="fa-regular fa-clock"></i> ${esc(r.duration)} min</span></div>
     <div class="note-actions"><a class="primary" href="note-detail.html?id=${encodeURIComponent(r.id)}"><i class="fa-regular fa-file-lines"></i> View Notes</a><button type="button" data-open-feedback data-title="${esc(r.title)}" data-guide="${esc(r.instructor)}"><i class="fa-regular fa-comment"></i> Give Feedback</button><a href="class-detail.html?id=${encodeURIComponent(r.id)}">View Class <i class="fa-solid fa-chevron-right"></i></a></div>
    </div></article>`).join("");
  }
 }
 const params=new URLSearchParams(location.search), current=records.find(r=>r.id===params.get("id"))||sample;
 ["#detailTitle"].forEach(sel=>{if($(sel))$(sel).textContent=current.title});
 if($("#detailInstructor"))$("#detailInstructor").textContent=current.instructor;
 // Class / Guide tabs on the class details page.
 document.querySelectorAll("[data-tab]").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll("[data-tab]").forEach(b=>{b.classList.toggle("active",b===btn);b.setAttribute("aria-selected",String(b===btn))});
  $("#classTab").hidden=btn.dataset.tab!=="class";$("#guideTab").hidden=btn.dataset.tab!=="guide";
 }));
 // Playlist demo action.
 $("#detailAddPlaylist")?.addEventListener("click",()=>{
  const k=user?.email?`dn-playlists:${user.email.toLowerCase()}`:"dn-playlists:guest";
  let saved=[];try{saved=JSON.parse(localStorage.getItem(k)||"[]")}catch{}
  if(!saved.includes(current.id))saved.push(current.id);
  localStorage.setItem(k,JSON.stringify(saved));
  $("#playlistStatus").textContent="Added to your saved playlist.";
 });
 // Feedback modal and accessible star rating controls.
 const modal=$("#feedbackModal"), form=$("#feedbackForm"), ratings={session:0,guide:0};
 function buildStars(){
  document.querySelectorAll(".stars").forEach(group=>{
   const type=group.dataset.rating;
   group.innerHTML=[1,2,3,4,5].map(n=>`<button type="button" aria-label="${n} star${n>1?"s":""}" data-star="${n}" class="${n<=ratings[type]?"selected":""}">★</button>`).join("");
   group.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{ratings[type]=Number(b.dataset.star);buildStars()}));
  });
 }
 buildStars();
 function openFeedback(trigger){
  if(!modal)return;
  $("#feedbackClassTitle").textContent=trigger?.dataset.title||current.title;
  $("#feedbackGuideName").textContent=`By ${trigger?.dataset.guide||current.instructor}`;
  modal.classList.add("open");document.body.style.overflow="hidden";
 }
 function closeFeedback(){modal?.classList.remove("open");document.body.style.overflow=""}
 document.querySelectorAll("[data-open-feedback]").forEach(b=>b.addEventListener("click",()=>openFeedback(b)));
 document.querySelectorAll("[data-close-feedback]").forEach(b=>b.addEventListener("click",closeFeedback));
 modal?.addEventListener("click",e=>{if(e.target===modal)closeFeedback()});
 document.addEventListener("keydown",e=>{if(e.key==="Escape")closeFeedback()});
 form?.addEventListener("submit",e=>{
  e.preventDefault();
  const feedback={classTitle:$("#feedbackClassTitle").textContent,guide:$("#feedbackGuideName").textContent,ratings:{...ratings},...Object.fromEntries(new FormData(form).entries()),submittedAt:new Date().toISOString()};
  const fk=user?.email?`dn-class-feedback:${user.email.toLowerCase()}`:"dn-class-feedback:demo";
  let all=[];try{all=JSON.parse(localStorage.getItem(fk)||"[]")}catch{}
  all.push(feedback);localStorage.setItem(fk,JSON.stringify(all));
  $("#feedbackStatus").textContent="Thank you. Your feedback has been received.";
  form.querySelectorAll("textarea").forEach(t=>t.value="");ratings.session=0;ratings.guide=0;buildStars();
 });
})();
