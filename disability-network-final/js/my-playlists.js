
import { getManagedClasses } from "./class-store.js";
const classes = getManagedClasses();
(() => {
 const $=s=>document.querySelector(s);
 const user=(()=>{try{return JSON.parse(localStorage.getItem("dn-current-user")||"null")}catch{return null}})();
 const storageKey=user?.email?`dn-playlists:${user.email.toLowerCase()}`:"";
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const grid=$("#playlistGrid"), detail=$("#playlistDetail"), modal=$("#createPlaylistModal");
 let playlists=[];
 if(storageKey){try{const saved=JSON.parse(localStorage.getItem(storageKey)||"[]");if(Array.isArray(saved))playlists=saved}catch{}}
 let selectedId=null, search="";
 const persist=()=>{if(storageKey)localStorage.setItem(storageKey,JSON.stringify(playlists))};
 const getClass=id=>classes.find(c=>c.id===id);
 const coverImages=items=>items.slice(0,2).map(c=>`<img src="${esc(c.image||"assets/images/community-1.jpg")}" alt="">`).join("");
 function renderGrid(){
  if(!user?.email){
   grid.innerHTML=`<div class="playlist-empty"><i class="fa-solid fa-list-check"></i><h2>Log in to view your playlists</h2><p>Your playlists are saved to your account, so you can return to your favourite classes whenever you sign in.</p><a class="create-playlist-btn" href="auth.html#login">Log in</a></div>`;
   $("#playlistCount").textContent="0 playlists";return;
  }
  const shown=playlists.filter(p=>(p.name+" "+(p.description||"")).toLowerCase().includes(search));
  $("#playlistCount").textContent=`${playlists.length} ${playlists.length===1?"playlist":"playlists"}`;
  if(!shown.length){
   grid.innerHTML=`<div class="playlist-empty"><i class="fa-solid fa-list-check"></i><h2>${playlists.length?"No matching playlists":"Your learning, organized"}</h2><p>${playlists.length?"Try another search.":"Create your first playlist and collect the classes you want to revisit."}</p><button class="create-playlist-btn" type="button" data-create>+ Create Playlist</button></div>`;
   return;
  }
  grid.innerHTML=shown.map(p=>{
   const items=(p.classIds||[]).map(getClass).filter(Boolean);
   return `<article class="playlist-card"><div class="playlist-cover">${items.length?coverImages(items):'<div class="playlist-cover-empty"><i class="fa-solid fa-book-open"></i></div>'}</div><div class="playlist-card-body"><h2>${esc(p.name)}</h2><p>${esc(p.description||"A personal collection of classes to learn from.")}</p><div class="playlist-card-footer"><span>${items.length} ${items.length===1?"class":"classes"}</span><button type="button" data-open="${esc(p.id)}">Open playlist</button></div></div></article>`;
  }).join("");
 }
 function renderDetail(){
  const p=playlists.find(x=>x.id===selectedId);if(!p){detail.hidden=true;grid.hidden=false;return}
  grid.hidden=true;detail.hidden=false;$("#selectedPlaylistTitle").textContent=p.name;
  const items=(p.classIds||[]).map(getClass).filter(Boolean);
  $("#selectedPlaylistMeta").textContent=`${items.length} ${items.length===1?"class":"classes"} · ${p.description||"Your personal class collection"}`;
  $("#playlistClasses").innerHTML=items.length?items.map(c=>`<article class="playlist-class-row"><img src="${esc(c.image||"assets/images/community-1.jpg")}" alt=""><div><h3>${esc(c.title)}</h3><p>${esc(c.category)} · ${esc(c.instructor)} · ${c.duration} min</p></div><button type="button" data-remove="${esc(c.id)}" aria-label="Remove ${esc(c.title)}"><i class="fa-regular fa-trash-can"></i></button></article>`).join(""):`<div class="playlist-empty"><i class="fa-regular fa-folder-open"></i><h2>This playlist is empty</h2><p>Choose a class below to add it to this playlist.</p></div>`;
  const select=$("#classToAdd");
  const available=classes.filter(c=>!(p.classIds||[]).includes(c.id));
  select.innerHTML=available.length?available.map(c=>`<option value="${esc(c.id)}">${esc(c.title)} — ${esc(c.instructor)}</option>`).join(""):`<option value="">All available classes are already in this playlist</option>`;
  $("#addClassToPlaylist").disabled=!available.length;
 }
 function openModal(){modal.classList.add("open");$("#newPlaylistName").focus()}
 function closeModal(){modal.classList.remove("open");$("#createPlaylistForm").reset()}
 $("#openCreatePlaylist")?.addEventListener("click",openModal);
 $("#closeCreatePlaylist")?.addEventListener("click",closeModal);
 modal?.addEventListener("click",e=>{if(e.target===modal)closeModal()});
 document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
 $("#createPlaylistForm")?.addEventListener("submit",e=>{
  e.preventDefault();if(!user?.email)return;
  const name=$("#newPlaylistName").value.trim();if(!name)return;
  playlists.unshift({id:`playlist-${Date.now()}`,name,description:$("#newPlaylistDescription").value.trim(),classIds:[],createdAt:new Date().toISOString()});
  persist();closeModal();renderGrid();
 });
 grid?.addEventListener("click",e=>{
  const create=e.target.closest("[data-create]");if(create){openModal();return}
  const open=e.target.closest("[data-open]");if(open){selectedId=open.dataset.open;renderDetail()}
 });
 $("#playlistSearch")?.addEventListener("input",e=>{search=e.target.value.trim().toLowerCase();renderGrid()});
 $("#backToPlaylists")?.addEventListener("click",()=>{selectedId=null;renderDetail();renderGrid()});
 $("#deletePlaylist")?.addEventListener("click",()=>{
  const p=playlists.find(x=>x.id===selectedId);if(!p)return;
  if(!confirm(`Delete "${p.name}"? This will remove the playlist, not the classes.`))return;
  playlists=playlists.filter(x=>x.id!==selectedId);selectedId=null;persist();renderDetail();renderGrid();
 });
 $("#addClassToPlaylist")?.addEventListener("click",()=>{
  const p=playlists.find(x=>x.id===selectedId),id=$("#classToAdd").value;if(!p||!id)return;
  p.classIds=p.classIds||[];if(!p.classIds.includes(id))p.classIds.push(id);
  persist();renderDetail();
 });
 $("#playlistClasses")?.addEventListener("click",e=>{
  const btn=e.target.closest("[data-remove]");if(!btn)return;
  const p=playlists.find(x=>x.id===selectedId);if(!p)return;
  p.classIds=(p.classIds||[]).filter(id=>id!==btn.dataset.remove);persist();renderDetail();
 });
 renderGrid();
})();
