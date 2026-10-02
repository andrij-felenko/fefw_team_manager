// Skill tiles: one skill as a framed icon, a stage's row of them, and the fighter's leanings.
import {tr} from "../core/i18n.js";
import {esc} from "../core/utils.js";
import {SK} from "../core/terms.js";
import {wieldOf,eligOf,prioFor} from "../model/weapons.js";
import {ic} from "./icons.js";

// the fighter's strengths, then weaknesses, as framed icons; the tooltip gives the name
export function chips(u){
  if(!u.F.length&&!u.X.length)return '<span class="c-apt none">'+tr("схильностей не вказано","no aptitudes listed")+'</span>';
  return '<span class="c-apt">'+u.F.map(function(k){return skTile(k,"","","up")}).join("")+(u.F.length&&u.X.length?'<i class="gap"></i>':'')+
    u.X.map(function(k){return skTile(k,"","","dn")}).join("")+'</span>';
}
// one skill tile. st: "pr" chosen priority, "own" the class's own weapon (can be made priority),
// "al" allowed but not the class's own, "na" the class can't use it, "" a non-weapon exam skill;
// apt: "up" / "dn" the fighter's strength / weakness; rk: exam rank; main: "card-stage-skill" makes it a priority toggle
export function skTile(k,st,rk,apt,main,on){
  var t=SK[k]+(rk?" "+rk:"")+(st==="pr"?tr(" · обрана пріоритетна"," · chosen priority"):st==="own"?tr(" · зброя класу"," · the class's own weapon"):
    st==="na"?tr(" · клас не дозволяє"," · the class can't use it"):st==="al"?tr(" · дозволена, але не зброя класу"," · allowed, not the class's own"):"")+
    (apt==="up"?tr(" · схильність"," · strength"):apt==="dn"?tr(" · слабкість"," · weakness"):"")+
    (main?tr(" · клікни, щоб змінити пріоритет"," · click to change priority"):"");
  return '<span class="sk-t'+(st?" "+st:"")+(apt?" "+apt:"")+'" title="'+esc(t)+'" aria-label="'+esc(t)+'"'+
    (main?' data-main="'+main+'" role="button" tabindex="0" aria-pressed="'+!!on+'"':' role="img"')+'>'+
    ic(k)+(rk?'<i class="sk-r">'+rk+'</i>':'')+'</span>';
}
function aptOf(u,k){return u?(u.X.indexOf(k)>=0?"dn":(u.F.indexOf(k)>=0?"up":"")):""}
// weapons always in the game's order, so the three stages line up column by column; then the other exam skills.
// On a class with several own physical weapons a click adds one to / drops it from the priority set
const WEAP=["sw","sp","ax","bo","br","bm","wm"];
// preview: the class is only shown in the class list, so nothing is clickable
export function reqLine(c,u,x,ti,i,preview){
  var wl=wieldOf(c), el=eligOf(c), pr=x?prioFor(c,x,ti):[], pick=x&&!preview&&el.length>1;
  function rkOf(k){var q=c.r.filter(function(q){return q.k===k})[0];return q?q.rk:""}
  var other=c.r.filter(function(q){return WEAP.indexOf(q.k)<0});
  return '<span class="req">'+WEAP.map(function(k){
    var rk=rkOf(k), can=!!rk||wl.indexOf(k)>=0, on=pr.indexOf(k)>=0;
    return skTile(k,!can?"na":(on?"pr":(rk?"own":"al")),rk,aptOf(u,k),pick&&el.indexOf(k)>=0?i+"-"+ti+"-"+k:"",on);
  }).join("")+
  other.map(function(q){return skTile(q.k,"",q.rk,aptOf(u,q.k))}).join("")+'</span>';
}
