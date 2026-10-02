// Recruitment: what each lord's path asks to recruit a fighter, and which path gets them soonest.
import {tr} from "../core/i18n.js";
import {S} from "../core/state.js";
import {LORDS,LI} from "../data/lords.js";
import {extra} from "../data/fighters.js";
import {JOIN_LV,JOIN_LV_P3,JOIN_FIX} from "../data/join-levels.js";

// renown grows slowly over the whole playthrough, so a low chapter with a high renown is not early.
// Renown by chapter in Game8's 100% walkthrough (Cai's path): Ch. 3 → 1, Ch. 4 → 3, Ch. 5 → 4, Ch. 6 → 5,
// Ch. 7 → 6–7, Ch. 8 → 7–8, Ch. 10 → 10. RENOWN_CH[r]: the chapter by which renown r is there, roughly
const RENOWN_CH=[0,3,4,4,5,6,7,8,8,9,10];
// when a path gets this fighter, to compare paths: [estimated chapter, renown, support, chapter], lower is sooner.
// The estimate is the later of the chapter and the chapter that brings the renown; joining on its own beats
// the same chapter with conditions. null: this path can't recruit them (or it is their lord)
function joinWhen(u,lord){
  var s=u.JJ[LI[lord]];
  if(s==="-"||s==="L")return null;
  if(s==="P")return [99,0,0,99];
  if(s[0]==="a"){var c=+s.slice(1);return [c,0,0,c]}
  var p=s.split("/"), ch=+p[0], r=+p[2];
  return [Math.max(ch,RENOWN_CH[r]||r),r,+p[1],ch];
}
function cmpWhen(a,b){for(var i=0;i<4;i++)if(a[i]!==b[i])return a[i]-b[i];return 0}
export function joinInfo(u,lord){
  var s=u.JJ[LI[lord]];
  if(s==="-")return {ok:false,txt:tr("не вербується","not recruitable")};
  if(s==="L")return {ok:false,txt:tr("лідер","lord")};
  if(s==="P")return {ok:true,txt:tr("Частина III","Part III")};
  if(s[0]==="a")return {ok:true,txt:tr("авто, Гл. ","automatic, Ch. ")+s.slice(1)};
  var p=s.split("/");
  return {ok:true,txt:tr("Гл. ","Ch. ")+p[0]+tr(" · підтримка "," · support ")+p[1]+tr(" · слава "," · renown ")+p[2]+(p[3]?" · "+extra(p[3]):"")};
}
// when and at what level the fighter joins this lord: the soonest real chance (chapter, or renown if it comes later)
// and the recommended level there. A lord starts at Lv 1; a path that can't recruit them borrows their soonest path
export function joinAt(u,lord){
  if(u.JJ.indexOf("L")>=0)return {ch:1,lv:1};
  var w=joinWhen(u,lord)||pathRows(u).best; if(!w)return {ch:1,lv:1};
  var fix=JOIN_FIX[u.n]&&JOIN_FIX[u.n][lord];
  return {ch:w[0],lv:fix||(w[0]>=99?JOIN_LV_P3:JOIN_LV[Math.min(w[0],JOIN_LV.length-1)])};
}
// the level this fighter's numbers start from: their join level with the open lord, or 1 when counting the whole path
export function joinLvFor(u){return S.calc==="full"?1:joinAt(u,S.cur).lv}
// every path with its estimate, the ones that can recruit first (soonest first); sooner: another path beats the open lord's
export function pathRows(u){
  var rows=LORDS.map(function(l){return {id:l.id,s:u.JJ[LI[l.id]],w:joinWhen(u,l.id)}});
  var can=rows.filter(function(r){return r.w}).sort(function(a,b){return cmpWhen(a.w,b.w)});
  var cur=rows.filter(function(r){return r.id===S.cur})[0], best=can.length?can[0].w:null;
  return {all:can.concat(rows.filter(function(r){return !r.w})),best:best,cur:cur,sooner:!!(cur.w&&best&&best[0]<cur.w[0])};
}
