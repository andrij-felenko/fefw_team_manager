// The squad summary above the cards (gender, ages, who uses each skill and animal per stage) and the header's meter.
import {tr,pick} from "../core/i18n.js";
import {$} from "../core/utils.js";
import {SK,STAGE,STAGE_S} from "../core/terms.js";
import {team,shownStages} from "../core/state.js";
import {CLS,GROUPS,PHYS} from "../data/classes.js";
import {MOUNT_OF,MOUNT_KEYS} from "../data/mounts.js";
import {ageBand} from "../data/gender-age.js";
import {sxOf,counted} from "../model/rules.js";
import {prioAt} from "../model/weapons.js";
import {ic} from "./icons.js";
import {mountName} from "./mounts.js";

export function renderSummary(){
  // squad summary: headcount by gender and age, then per stage how many fighters use each skill
  var f=0,mm=0,q=0,ab={young:0,mid:0,old:0,long:0,"?":0};
  team().forEach(function(x){
    var s=sxOf(x.n); if(s==="f")f++;else if(s==="m")mm++;else q++;
    ab[ageBand(x.n)]++;
  });
  // per stage: who uses each skill and rides each animal; an empty stage means the fighter stays in the previous class
  // (e.g. keeps the Specialty class through Advanced)
  var rows=shownStages().map(function(ti){
    var use={},pri={},none=0;
    team().forEach(function(x){
      var src=ti; while(src>=0&&!x.path[src])src--;
      var c=src>=0?CLS[x.path[src]]:null; if(!c){none++;return}
      // no riding and no flying: the class fights on foot, so it counts as infantry
      var sk=c.w.slice(); prioAt(x,src).forEach(function(k){if(sk.indexOf(k)<0)sk.push(k)});
      if(sk.indexOf("ri")<0&&sk.indexOf("fl")<0&&sk.indexOf("in")<0)sk.push("in");
      if(MOUNT_OF[c.name])sk.push("m-"+MOUNT_OF[c.name]);
      sk.forEach(function(k){(use[k]=use[k]||[]).push(x.n+(src<ti?" ("+c.name+")":""))});
      prioAt(x,src).forEach(function(k){(pri[k]=pri[k]||[]).push(x.n)})});
    return {ti:ti,use:use,pri:pri,none:none};
  });
  function cell(r,k,j){
    var n=r.use[k]?r.use[k].length:0, p=r.pri[k]?r.pri[k].length:0;
    return '<td class="'+(j===0?"gs":"")+(n?"":" z")+'" title="'+(n?r.use[k].join(", "):"")+(p?tr(" · пріоритет: "," · priority: ")+r.pri[k].join(", "):"")+'">'+
      // one white number when everyone holding it has it as priority; otherwise "total / priority"
      (n?'<b>'+n+'</b>'+(PHYS.indexOf(k)>=0&&p!==n?' / <span class="pr">'+p+'</span>':''):'−')+'</td>';
  }
  function stTh(ti){return '<th class="st" title="'+STAGE[ti]+'">'+STAGE_S[ti]+'</th>'}
  function colTh(k,j,name){return '<th class="sk-h'+(j===0?" gs":"")+'" title="'+name+'">'+ic(k)+'<span>'+name+'</span></th>'}
  // skills: one fixed column per skill so the stages line up; weapons also show how many hold them as priority
  var skills='<tr><th></th>'+GROUPS.map(function(g){return '<th colspan="'+g[1].length+'" class="gh">'+pick(g[0])+'</th>'}).join("")+'<th></th></tr>'+
    '<tr><th></th>'+GROUPS.map(function(g){return g[1].map(function(k,j){return colTh(k,j,SK[k])}).join("")}).join("")+'<th class="nc">'+tr("без класу","no class")+'</th></tr>'+
    rows.map(function(r){return '<tr>'+stTh(r.ti)+GROUPS.map(function(g){return g[1].map(function(k,j){return cell(r,k,j)}).join("")}).join("")+
      '<td class="nc">'+(r.none||'−')+'</td></tr>'}).join("");
  // animals, a table of their own: how many of each the squad needs at the stage
  var animals='<tr><th></th><th colspan="'+MOUNT_KEYS.length+'" class="gh">'+tr("Тварини","Animals")+'</th></tr>'+
    '<tr><th></th>'+MOUNT_KEYS.map(function(m,j){return colTh("m-"+m,j,mountName(m))}).join("")+'</tr>'+
    rows.map(function(r){return '<tr>'+stTh(r.ti)+MOUNT_KEYS.map(function(m,j){return cell(r,"m-"+m,j)}).join("")+'</tr>'}).join("");
  $("tstats").innerHTML='<div class="ts-head"><span class="ts-g"><b>'+team().length+'</b>'+tr(" бійців"," fighters")+' · ♂ <b>'+mm+'</b> · ♀ <b>'+f+'</b>'+(q?' · ? <b>'+q+'</b>':'')+'</span>'+
    '<span class="ts-g"><span title="'+tr("18 і менше","18 and under")+'">'+tr("підлітки","teens")+'</span> <b>'+ab.young+'</b> · <span title="19–31">'+tr("молоді","young")+'</span> <b>'+ab.mid+'</b> · <span title="32+">'+tr("дорослі","adults")+'</span> <b>'+ab.old+'</b>'+
      (ab.long?' · <span title="'+tr("понад 100 років","over 100 years")+'">'+tr("довгожителі","long-lived")+'</span> <b>'+ab.long+'</b>':'')+(ab["?"]?' · '+tr("невідомо","unknown")+' <b>'+ab["?"]+'</b>':'')+'</span></div>'+
    '<div class="ts-tbls"><div class="ts-tbl"><table>'+skills+'</table></div><div class="ts-tbl"><table>'+animals+'</table></div></div>';
  var distinct={};team().forEach(function(x){counted(x).forEach(function(c){distinct[c]=1})});
  $("meter").textContent=team().length+tr(" бійців · "," fighters · ")+Object.keys(distinct).length+tr(" різних класів (просунуті й майстер)"," distinct classes (Advanced & Master)");
}
