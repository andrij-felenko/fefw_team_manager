// Tooltips for the whole page.
import {BY} from "../data/fighters.js";
import {pathsCard} from "./paths.js";

// tooltips: titles become a small card, one fact per line (" · " separates facts); on touch screens a tap shows it.
// The recruit-paths mark (data-paths) gets a table instead
export function initTooltip(){
  var tip=document.createElement("div"), cur=null, timer=null;
  tip.className="tip"; tip.setAttribute("role","tooltip"); tip.hidden=true; document.body.appendChild(tip);
  function textOf(el){if(el.hasAttribute("title")){el.dataset.tip=el.getAttribute("title");el.removeAttribute("title")}return el.dataset.tip||""}
  function hide(){tip.hidden=true;cur=null}
  function show(el){
    var pc=el.dataset.paths, t=pc?"":textOf(el); if(!pc&&!t){hide();return}
    cur=el; tip.classList.toggle("pcard",!!pc); tip.dir=document.documentElement.dir||"ltr";
    if(pc)tip.innerHTML=pathsCard(BY[pc]); else tip.textContent=t.replace(/ · /g,"\n");
    tip.hidden=false;
    var r=el.getBoundingClientRect(), w=tip.offsetWidth, h=tip.offsetHeight;
    var x=Math.min(Math.max(8,r.left+r.width/2-w/2),innerWidth-w-8), y=r.bottom+8;
    if(y+h>innerHeight-8)y=r.top-h-8;
    tip.style.left=x+"px"; tip.style.top=Math.max(8,y)+"px";
  }
  var TIPPED="[title],[data-tip],[data-paths]";
  document.addEventListener("mouseover",function(e){var el=e.target.closest&&e.target.closest(TIPPED);if(el!==cur){if(el)show(el);else hide()}});
  document.addEventListener("focusin",function(e){var el=e.target.closest&&e.target.closest(TIPPED);if(el)show(el)});
  document.addEventListener("focusout",hide);
  window.addEventListener("scroll",hide,true);
  document.addEventListener("touchstart",function(e){var el=e.target.closest&&e.target.closest(TIPPED);
    if(el){show(el);clearTimeout(timer);timer=setTimeout(hide,el.dataset.paths?9000:4000)}else hide()},{passive:true});
}
