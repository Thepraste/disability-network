import { getBookings, saveClassBooking, cancelClassBooking } from "./booking-store.js";
import { getManagedClasses } from "./class-store.js";
const classes = getManagedClasses();
const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);
const requestedId = params.get('id');
const currentClass = classes.find(c => c.id === requestedId) || classes[0];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const user = () => { try { return JSON.parse(localStorage.getItem('dn-current-user') || 'null'); } catch { return null; } };
const userKey = prefix => { const u=user(); return u?.email ? `${prefix}:${u.email.toLowerCase()}` : ''; };
const guideDescriptions = {
 'Twyla Teitzel':'Twyla supports learners in building strength, balance and confidence through welcoming, accessible movement sessions.',
 'Lee Weinberg':'Lee helps people feel more comfortable with everyday technology through clear explanations and practical, step-by-step guidance.',
 'Pilar Rodriguez':'Pilar is passionate about helping people build confidence, learn practical skills and connect with their community.',
 'Stacy Robinson':'Stacy encourages sustainable wellbeing through practical ideas, supportive learning and small steps that make a difference.'
};
const title = currentClass.title;
$('#classTitle').textContent = `${title} (${currentClass.duration}-min class)`;
$('#classCategory').textContent = currentClass.category;
$('#classHeroImage').src = currentClass.image || 'assets/images/community-1.jpg';
$('#classHeroImage').alt = title;
$('#classGuideName').textContent = currentClass.instructor;
$('#classGuideAvatar').src = currentClass.instructorImage || currentClass.image || 'assets/images/community-1.jpg';
$('#guideProfileAvatar').src = currentClass.instructorImage || currentClass.image || 'assets/images/community-1.jpg';
$('#guideProfileName').textContent = currentClass.instructor;
$('#guideBiography').textContent = guideDescriptions[currentClass.instructor] || `${currentClass.instructor} is a Disability Network Guide who helps learners explore useful information and practical skills in a welcoming environment.`;
$('#classDescription').textContent = `${title} is an opportunity to learn practical skills in a welcoming, accessible environment. Follow along with your Guide, explore the key ideas and bring your questions to the session.`;
const topicSets = {
 Technology:['Getting familiar with the tools and features','Step-by-step guidance for common tasks','Helpful tips for building confidence','Ways to practise and apply what you learn'],
 Fitness:['Accessible ways to get started','Building strength, balance and confidence','Making movement part of your routine','Listening to your body and adapting activities'],
 'Health & Wellness':['Understanding the topic and why it matters','Practical habits you can use every day','Helpful resources and next steps','Questions to discuss with your Guide'],
 'Independent Living':['Practical strategies for everyday life','Tools and resources that support independence','Planning ahead and staying safe','Where to find additional support']
};
$('#classTopics').innerHTML = (topicSets[currentClass.category] || ['An introduction to the topic','Practical steps and useful resources','Tips you can use in everyday life','Questions and next steps']).map(t=>`<li>${esc(t)}</li>`).join('');
// Tab switching
const tabButtons = [...document.querySelectorAll('[data-detail-tab]')];
tabButtons.forEach(btn=>btn.addEventListener('click',()=>{tabButtons.forEach(b=>{const active=b===btn;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});document.querySelectorAll('.class-detail-panel').forEach(p=>p.hidden=p.id!==btn.dataset.detailTab);}));
// Upcoming sessions for the selected class; schedule dates are Detroit-local.
const dateLabel = date => new Intl.DateTimeFormat('en-US',{timeZone:'America/Detroit',weekday:'short',month:'short',day:'numeric'}).format(new Date(`${date}T12:00:00-05:00`));
const timeLabel = (date,time,duration) => { const [h,m]=time.split(':').map(Number); const start=new Date(`${date}T${time}:00-05:00`); const end=new Date(start.getTime()+duration*60000); return `${new Intl.DateTimeFormat('en-US',{timeZone:'America/Detroit',hour:'numeric',minute:'2-digit'}).format(start)} – ${new Intl.DateTimeFormat('en-US',{timeZone:'America/Detroit',hour:'numeric',minute:'2-digit'}).format(end)}`; };
const sessions = [currentClass,...classes.filter(c=>c.id!==currentClass.id && c.category===currentClass.category)].slice(0,2);
const bookings = () => getBookings();
function renderSessions(){ $('#upcomingSessions').innerHTML=sessions.map((s,i)=>{const booked=bookings().some(b=>b.id===s.id&&b.date===s.date);return `<div class="upcoming-session"><div><strong>${esc(dateLabel(s.date))}</strong><span>${esc(timeLabel(s.date,s.time,s.duration))}</span></div><div class="upcoming-session-actions">${booked?`<button type="button" data-enter="${esc(s.id)}"><i class="fa-solid fa-play"></i> Enter</button><button class="secondary" type="button" data-cancel="${esc(s.id)}">Cancel</button>`:`<button type="button" data-book="${esc(s.id)}">Book</button>`}</div></div>`;}).join(''); }
renderSessions();
const modal=$('#classDetailModal');function showModal(title,html){$('#classModalTitle').textContent=title;$('#classModalContent').innerHTML=html;modal.hidden=false;}function closeModal(){modal.hidden=true;}$('#closeClassModal').addEventListener('click',closeModal);$('#classModalDone').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
$('#upcomingSessions').addEventListener('click',e=>{const book=e.target.closest('[data-book]'),cancel=e.target.closest('[data-cancel]'),enter=e.target.closest('[data-enter]');if(book){const u=user();if(!u?.email){showModal('Log in to book this class','<p>Please log in or create an account to reserve your place in this session.</p><p><a href="auth.html#login">Log in</a> · <a href="auth.html#register">Join now</a></p>');return;}const s=sessions.find(x=>x.id===book.dataset.book);saveClassBooking(s);renderSessions();showModal('You’re booked!',`<p>Your place in <strong>${esc(s.title)}</strong> has been reserved.</p><p>${esc(dateLabel(s.date))} · ${esc(timeLabel(s.date,s.time,s.duration))}</p>`);}else if(cancel){const session=sessions.find(x=>x.id===cancel.dataset.cancel);if(session)cancelClassBooking(session.id,session.date);renderSessions();}else if(enter){window.location.href=`classroom.html?id=${encodeURIComponent(enter.dataset.enter)}&mode=live`;}});
$('#addClassToPlaylist').addEventListener('click',()=>{const u=user();if(!u?.email){$('#classActionStatus').textContent='Please log in to save classes to a playlist.';return;}const key=userKey('dn-playlists');let lists=[];try{lists=JSON.parse(localStorage.getItem(key)||'[]')}catch{}if(!Array.isArray(lists))lists=[];if(!lists.length){lists.push({id:`playlist-${Date.now()}`,name:'My Classes',description:'Classes I want to revisit',classIds:[]});}const choices=lists.map((p,i)=>`${i+1}. ${p.name}`).join('\n');const choice=lists.length===1?0:Number(prompt(`Add this class to which playlist?\n${choices}\n\nEnter the playlist number:`))-1;if(!Number.isInteger(choice)||choice<0||choice>=lists.length)return;lists[choice].classIds=lists[choice].classIds||[];if(!lists[choice].classIds.includes(currentClass.id))lists[choice].classIds.push(currentClass.id);localStorage.setItem(key,JSON.stringify(lists));$('#classActionStatus').textContent=`Added to “${lists[choice].name}”.`;});
$('#watchClassRecording').addEventListener('click',()=>{window.location.href=`classroom.html?id=${encodeURIComponent(currentClass.id)}&mode=replay`;});
$('#supportToggle').addEventListener('click',()=>{const btn=$('#supportToggle'),content=$('#supportContent'),expanded=btn.getAttribute('aria-expanded')==='true';btn.setAttribute('aria-expanded',String(!expanded));content.hidden=expanded;btn.querySelector('i').className=`fa-solid fa-chevron-${expanded?'down':'up'}`;});

window.addEventListener('dn:bookings-updated',renderSessions);window.addEventListener('storage',event=>{if(event.key?.startsWith('dn-bookings:'))renderSessions();});
