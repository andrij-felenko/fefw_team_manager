// Under the flags: the four plans (save slots 1–4) and the export / import buttons.
import {tr,fmt} from "../core/i18n.js";
import {$,esc} from "../core/utils.js";
import {S,setS,setOpen,save,NSLOTS} from "../core/state.js";
import {useSlot,exportData,readPlans,usePlans} from "../core/plans.js";
import {LORDS} from "../data/lords.js";

function planSum(p){
  var n=0,w=0;
  LORDS.forEach(function(l){(p.teams&&p.teams[l.id]||[]).forEach(function(x){n++;(x.path||[]).forEach(function(c){if(c)w++})})});
  return fmt(tr("бійців: {n} · обрано класів: {w}","{n} fighters · {w} classes chosen"),{n:n,w:w});
}
export function renderSlots(){
  var h='<span class="lb">'+tr("План","Plan")+'</span>';
  for(var i=0;i<NSLOTS;i++){
    var on=i===S.slot, p=S.slots[i];
    var tip=fmt(tr("План {n}","Plan {n}"),{n:i+1})+" · "+
      (on?tr("відкритий зараз","open now"):(p?planSum(p):tr("порожній — почнеться з нуля","empty — starts from scratch")))+
      " · "+tr("зберігається сам, у цьому браузері","saved automatically in this browser");
    h+='<button type="button" data-slot="'+i+'" class="'+(on?"on":(p?"":"empty"))+'" aria-pressed="'+on+'" title="'+esc(tip)+'">'+(i+1)+'</button>';
  }
  h+='<button type="button" id="exportBtn" title="'+esc(tr("Усі чотири плани в одному файлі · на резерв або щоб переслати",
      "All four plans in one file · to keep as a backup or send to a friend"))+'">'+tr("Експорт","Export")+'</button>'+
    '<button type="button" id="importBtn" title="'+esc(tr("Завантажити плани з файлу · замінить усі чотири плани тут",
      "Load plans from a file · replaces all four plans here"))+'">'+tr("Імпорт","Import")+'</button>';
  $("slots").innerHTML=h; $("slots").setAttribute("aria-label",tr("Слоти збереження","Save slots"));
}
// one file with all four plans: to keep as a backup or to send to someone
function exportPlans(){
  var d=new Date(), day=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  var data=exportData(d);
  var a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:"application/json"}));
  a.download="fortunes-weave-plans-"+day+".json";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function(){URL.revokeObjectURL(a.href)},10000);
}
function notOurFile(){alert(tr("Цей файл не схожий на експорт планувальника.","This file isn't a planner export."))}
// the file replaces all four plans; if the page can't draw it, everything goes back as it was
function importPlans(text,renderAll){
  var f=readPlans(text);
  if(!f){notOurFile();return}
  if(!confirm(tr("Завантажити плани з цього файлу? Вони замінять усі чотири плани тут — спершу експортуй свої, якщо хочеш їх зберегти.",
                 "Load the plans from this file? They will replace all four plans here — export yours first if you want to keep them.")))return;
  var before=JSON.stringify(S);
  usePlans(f);
  try{renderAll()}catch(err){setS(JSON.parse(before));setOpen(null);renderAll();notOurFile();return}
  save();
}
export function bindSlots(renderAll){
  $("slots").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;
    if(b.dataset.slot!=null){if(useSlot(+b.dataset.slot))renderAll()}
    else if(b.id==="exportBtn")exportPlans();
    else if(b.id==="importBtn")$("importFile").click()});
  $("importFile").addEventListener("change",function(){var f=this.files&&this.files[0];this.value="";if(!f)return;
    if(f.size>2e6){notOurFile();return}
    var rd=new FileReader();rd.onload=function(){importPlans(String(rd.result),renderAll)};rd.readAsText(f)});
}
