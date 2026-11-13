import { hubTopics, hubSections } from "./medicaid-data.js";
const topicRoot=document.querySelector("#hubTopicPills");
const sectionsRoot=document.querySelector("#hubSections");
const search=document.querySelector("#hubSearch");
const modal=document.querySelector("#resourceModal");
const modalTitle=document.querySelector("#resourceModalTitle");
const modalText=document.querySelector("#resourceModalText");
let activeTopic="";
let searchTerm="";
let expanded=new Set();
const esc=value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
topicRoot.innerHTML=hubTopics.map(topic=>`<button type="button" data-topic="${esc(topic)}">${esc(topic)}</button>`).join("");
function render(){
 const filtered=hubSections.map(section=>({...section,items:section.items.filter(item=>(!activeTopic||section.title===activeTopic)&&(!searchTerm||`${item.title} ${item.summary} ${section.title}`.toLowerCase().includes(searchTerm)))})).filter(section=>section.items.length);
 if(!filtered.length){sectionsRoot.innerHTML='<div class="hub-no-results">No resources match your search. Try another keyword or topic.</div>';return;}
 sectionsRoot.innerHTML=filtered.map(section=>{
  const showAll=expanded.has(section.title);
  const visible=showAll?section.items:section.items.slice(0,4);
  return `<section class="hub-category" id="${hubTopics.includes(section.title)?'':''}">
   <div class="hub-category-head"><div><h3>${esc(section.title)}</h3><p>${esc(section.description)}</p></div></div>
   <div class="hub-resource-grid">${visible.map(item=>`<article class="hub-resource-card">
    <img src="${esc(item.image)}" alt="" loading="lazy">
    <div class="hub-resource-content"><span class="hub-card-label">${esc(section.title)}</span><h4>${esc(item.title)}</h4>
    <div class="hub-resource-meta"><span><i class="fa-regular fa-clock"></i> ${esc(item.duration)}</span><span>Learning guide</span></div>
    <button type="button" data-resource="${esc(item.title)}" data-summary="${esc(item.summary)}">View resource</button></div>
   </article>`).join("")}</div>
   ${section.items.length>4?`<button class="hub-view-more" type="button" data-expand="${esc(section.title)}">${showAll?"Show less":"View all resources"}</button>`:""}
  </section>`;
 }).join("");
}
topicRoot.addEventListener("click",event=>{
 const button=event.target.closest("[data-topic]");if(!button)return;
 activeTopic=activeTopic===button.dataset.topic?"":button.dataset.topic;
 topicRoot.querySelectorAll("button").forEach(item=>item.classList.toggle("active",item.dataset.topic===activeTopic));
 if(activeTopic){document.querySelector("#medicaid-library").scrollIntoView({behavior:"smooth"});}
 render();
});
search.addEventListener("input",()=>{searchTerm=search.value.trim().toLowerCase();activeTopic="";topicRoot.querySelectorAll("button").forEach(item=>item.classList.remove("active"));render();});
sectionsRoot.addEventListener("click",event=>{
 const expand=event.target.closest("[data-expand]");
 if(expand){const key=expand.dataset.expand;expanded.has(key)?expanded.delete(key):expanded.add(key);render();return;}
 const resource=event.target.closest("[data-resource]");
 if(resource){modalTitle.textContent=resource.dataset.resource;modalText.textContent=resource.dataset.summary;modal.hidden=false;}
});
function closeModal(){modal.hidden=true;}
modal.querySelectorAll("[data-close-resource],.hub-modal-close").forEach(button=>button.addEventListener("click",closeModal));
modal.addEventListener("click",event=>{if(event.target===modal)closeModal();});
document.addEventListener("keydown",event=>{if(event.key==="Escape")closeModal();});
const featuredResources = {
 featured: ["Medicaid basics: where to begin","An introductory resource to help you understand what Medicaid is, explore common enrollment questions and prepare to speak with a qualified benefits assister."],
 eligibility: ["Understanding eligibility and enrollment","Explore general Medicaid eligibility and enrollment topics. Eligibility depends on individual circumstances; contact an appropriate benefits assister for help with your situation."],
 services: ["Finding services that support independent living","Learn about home and community-based services and prepare questions to discuss with a qualified local support provider."]
};
document.querySelectorAll("[data-open-resource]").forEach(button=>button.addEventListener("click",()=>{
 const details=featuredResources[button.dataset.openResource]||featuredResources.featured;
 modalTitle.textContent=details[0];modalText.textContent=details[1];modal.hidden=false;
}));

// Functional featured-video slider with arrows, dots, keyboard support and gentle autoplay.
const slides=[...document.querySelectorAll(".medicaid-slide")];
const dots=[...document.querySelectorAll("[data-slide-to]")];
let activeSlide=0, sliderTimer;
function showSlide(index){
 if(!slides.length)return;
 activeSlide=(index+slides.length)%slides.length;
 slides.forEach((slide,i)=>slide.classList.toggle("active",i===activeSlide));
 dots.forEach((dot,i)=>{dot.classList.toggle("active",i===activeSlide);dot.setAttribute("aria-current",String(i===activeSlide));});
}
function restartSliderTimer(){clearInterval(sliderTimer);sliderTimer=setInterval(()=>showSlide(activeSlide+1),6500);}
document.querySelector(".medicaid-slide-arrow.prev")?.addEventListener("click",()=>{showSlide(activeSlide-1);restartSliderTimer();});
document.querySelector(".medicaid-slide-arrow.next")?.addEventListener("click",()=>{showSlide(activeSlide+1);restartSliderTimer();});
dots.forEach(dot=>dot.addEventListener("click",()=>{showSlide(Number(dot.dataset.slideTo));restartSliderTimer();}));
const slider=document.querySelector(".medicaid-feature-slider");
slider?.addEventListener("mouseenter",()=>clearInterval(sliderTimer));
slider?.addEventListener("mouseleave",restartSliderTimer);
slider?.addEventListener("focusin",()=>clearInterval(sliderTimer));
slider?.addEventListener("focusout",restartSliderTimer);
showSlide(0);restartSliderTimer();
render();
