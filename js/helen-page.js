document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("helenPageForm");
  const input = document.getElementById("helenPageInput");
  const answer = document.getElementById("helenPageAnswer");
  const answerText = document.getElementById("helenPageAnswerText");
  const cards = [...document.querySelectorAll("[data-question-card]")];
  const replies = [
    {keys:["service","support","resource","help"],text:"Disability Network can help you explore independent living resources, advocacy, referrals and community support. The best next step depends on what you need. You can contact the team to discuss options available in your area."},
    {keys:["technology","screen reader","device","assistive"],text:"Assistive technology includes tools such as screen readers, communication devices, mobility aids and accessible software. Start by identifying the task you want help with, then explore suitable tools with a qualified provider."},
    {keys:["class","workshop","learn"],text:"You can explore upcoming classes and workshops on the Class Schedule page. Use the Classes menu to browse the calendar and book a session."},
    {keys:["benefit","snap","medicaid"],text:"Benefits eligibility depends on individual circumstances and programme rules. Helen can point you toward general information, but a qualified benefits assister can help review your specific situation."},
    {keys:["caregiver","family"],text:"Caregivers may find useful information through local support services, community programmes and respite resources. Contact Disability Network to ask about options in your area."},
    {keys:["employment","job","work"],text:"You can explore vocational rehabilitation, accessible job-search resources and workplace accommodation information. Contact the Disability Network team for help identifying relevant local services."},
    {keys:["home","accessible","safety"],text:"Home accessibility can include safer entrances, bathroom modifications, improved lighting and assistive equipment. A local independent living specialist may help you identify options."},
    {keys:["contact","phone","email"],text:"You can reach Disability Network Wayne County Detroit through the Contact Our Team link in the website footer. The team can help direct your question to the right service."}
  ];
  function ask(question) {
    const clean = question.trim();
    if (!clean) return;
    input.value = clean;
    const lower = clean.toLowerCase();
    const match = replies.find(item => item.keys.some(key => lower.includes(key)));
    answerText.textContent = match ? match.text : "Thanks for your question. I can help you explore Disability Network resources, classes, accessibility information and community support. For advice about your individual situation, please contact the Disability Network team.";
    answer.hidden = false;
    answer.scrollIntoView({behavior:"smooth",block:"nearest"});
  }
  form?.addEventListener("submit", event => {event.preventDefault();ask(input.value);});
  document.querySelectorAll("[data-ask-question]").forEach(button => button.addEventListener("click", () => ask(button.dataset.askQuestion)));

  const viewMore = document.getElementById("helenViewMore");
  let expanded = false;
  function updateQuestionCards() {
    cards.forEach((card,index) => {card.hidden = !expanded && index >= 8;});
    if (viewMore) {
      viewMore.innerHTML = expanded ? 'View Less <i class="fa-solid fa-chevron-up"></i>' : 'View More <i class="fa-solid fa-chevron-down"></i>';
    }
  }
  viewMore?.addEventListener("click", () => {expanded = !expanded;updateQuestionCards();});
  updateQuestionCards();

  const track = document.getElementById("helenLearnTrack");
  const prev = document.getElementById("helenLearnPrev");
  const next = document.getElementById("helenLearnNext");
  const move = direction => {
    if (!track) return;
    const card = track.querySelector(".helen-learn-card");
    if (!card) return;
    const gap = parseFloat(getComputedStyle(track).gap) || 12;
    track.scrollBy({left:direction*(card.getBoundingClientRect().width+gap),behavior:"smooth"});
  };
  prev?.addEventListener("click",()=>move(-1));
  next?.addEventListener("click",()=>move(1));

  const modal=document.getElementById("helenVideoModal");
  const close=()=>{if(modal)modal.hidden=true;};
  document.querySelectorAll("[data-open-video]").forEach(button=>button.addEventListener("click",()=>{if(modal)modal.hidden=false;}));
  document.getElementById("helenVideoClose")?.addEventListener("click",close);
  document.getElementById("helenVideoOk")?.addEventListener("click",close);
  modal?.addEventListener("click",event=>{if(event.target===modal)close();});
  document.addEventListener("keydown",event=>{if(event.key==="Escape")close();});
});
