// Top bar: the squad tabs with the squad's header, and the language flags.
import {LANG,setLang,tr,withLang} from "../core/i18n.js";
import {$} from "../core/utils.js";
import {S,save,setOpen} from "../core/state.js";
import {LORDS,lordUa} from "../data/lords.js";
import {routeClasses} from "../model/rules.js";

export function renderTabs(){
  $("tabs").innerHTML=LORDS.map(function(l){
    return '<button type="button" data-lord="'+l.id+'" class="'+(l.id===S.cur?"on":"")+'" aria-pressed="'+(l.id===S.cur)+'"><span>'+l.name+'</span><small>'+lordUa(l.id)+' · '+S.teams[l.id].length+tr(" бійців"," fighters")+'</small></button>';
  }).join("");
  var L=LORDS.filter(function(l){return l.id===S.cur})[0];
  document.body.dataset.lord=S.cur;
  $("teamName").textContent=L.name;
  var rc=routeClasses(S.cur);
  $("teamSub").innerHTML=tr("Загін: ","Lord: ")+lordUa(S.cur)+tr(" · класи маршруту: "," · path classes: ")+
    rc.ex.map(function(c){return '<b class="rc-ex">'+c+'</b>'}).concat(rc.un.map(function(c){return '<span class="rc-un">'+c+'</span>'})).join(", ");
  $("filter").options[0].textContent=tr("Доступні: ","Available to ")+lordUa(S.cur);
}
// a language loads on its first click; when flags are clicked quickly, the last click wins
let LANG_WANT=null;
export function bindTopbar(renderAll){
  document.querySelector(".lang").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;
    var l=b.dataset.lang; LANG_WANT=l;
    withLang(l,function(){if(LANG_WANT!==l)return;setLang(l);S.lang=LANG;save();renderAll()})});
  $("tabs").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;S.cur=b.dataset.lord;S.forU="";setOpen(null);save();renderAll()});
}
