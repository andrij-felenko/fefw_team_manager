// Saved state: the open plan and the other three, the language and the filters, kept in this browser (localStorage).
import {LORDS,LI} from "../data/lords.js";
import {U,BY} from "../data/fighters.js";
import {TIER_OF} from "../data/classes.js";

const KEY="rt-konstruktor-v2", OLD="rt-konstruktor-v1";
// four plans side by side in this browser (save slots). The open one lives in S.teams / S.sx as before,
// the other three in S.slots (null — never opened). Language, filters and the end level are shared by all of them
export const NSLOTS=4;
// S is everything that is saved. Other modules change its fields; only setS replaces it (an import rolled back)
export let S;
export function setS(v){S=v}
// which stages the squad shows: all for planning, or the one or two you are at in the game
export const STAGE_WINDOWS=["","0","01","1","12","2","23","3"];
export function shownStages(){return S.stw?S.stw.split("").map(Number):[0,1,2,3]}
export let OPEN=null; // which stage drawer is open: "cardIndex-stage"
export function setOpen(v){OPEN=v}
export function defTeams(){
  var t={leda:[],cai:[],die:[],the:[]};
  U.forEach(function(u){if(t[u.t]&&u.JJ[LI[u.t]]!=="-")t[u.t].push({n:u.n,path:["","","","",""]})});
  return t;
}
// reads the saved state and brings older versions up to date; nothing is written back until the next save()
export function loadState(){
  try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
  if(!S||!S.teams){
    S={teams:defTeams(),cur:"leda",sx:{},avail:true,free:false,tierF:"",hideB:false};
    try{var o=JSON.parse(localStorage.getItem(OLD)); if(o&&o.team){
      S.teams.leda=o.team.map(function(x){if(x.sx)S.sx[x.n]=x.sx;return {n:x.n,cls:x.cls||""}});
      var inLeda={};S.teams.leda.forEach(function(x){inLeda[x.n]=1});
      ["cai","die","the"].forEach(function(k){S.teams[k]=S.teams[k].filter(function(x){return !inLeda[x.n]})});
    }}catch(e){}
  }
  S.sx=S.sx||{}; ["leda","cai","die","the"].forEach(function(k){S.teams[k]=S.teams[k]||[]});
  // tier filter and open tiers are kept by tier number (older versions kept the Ukrainian name)
  if(S.tierF&&!/^\d$/.test(S.tierF))S.tierF="";
  if(S.open&&Object.keys(S.open).some(function(k){return !/^\d$/.test(k)}))S.open=null;
  // All fighters: three switches, each narrowing the list (available to the open lord, not yet in this squad,
  // not in other squads), gender, strengths;
  // older versions had one choice of three, a text search, a tournament-team filter and a fighter for the class list
  if(typeof S.avail!=="boolean"){S.avail=S.filter!=="all"&&S.filter!=="free";S.free=S.filter==="free"}
  S.free=!!S.free; S.fresh=!!S.fresh; delete S.mine; if(S.sxF!=="f"&&S.sxF!=="m")S.sxF="";
  if(!Array.isArray(S.skF))S.skF=[];
  delete S.filter; delete S.q; delete S.ttF; delete S.forU;
  // the sections folded by their headings
  if(!S.fold||typeof S.fold!=="object")S.fold={};
  // each fighter plans a path: one class per tier (Beginner, Specialty, Advanced, Master, Divine)
  LORDS.forEach(function(l){if(S.teams[l.id])S.teams[l.id]=S.teams[l.id].filter(function(x){return BY[x.n]})});
  LORDS.forEach(function(l){(S.teams[l.id]||[]).forEach(function(x){
    if(!x.path){x.path=["","","","",""];if(x.cls&&TIER_OF[x.cls]!=null)x.path[TIER_OF[x.cls]]=x.cls}
    delete x.cls;
  })});
  // the squad's view: full cards or plates, the stages shown, stats from the join level or from level 1
  if(S.view!=="compact")S.view="full";
  if(STAGE_WINDOWS.indexOf(S.stw)<0)S.stw="";
  if(S.calc!=="full")S.calc="join";
  if(!Array.isArray(S.cardOpen))S.cardOpen=[];
  // the plans: the open slot in range, four places, the open one empty (it lives in S.teams / S.sx)
  S.slot=S.slot>=0&&S.slot<NSLOTS?S.slot|0:0;
  S.slots=Array.isArray(S.slots)?S.slots.slice(0,NSLOTS):[];
  while(S.slots.length<NSLOTS)S.slots.push(null);
  S.slots[S.slot]=null;
}
export function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
export function team(){return S.teams[S.cur]}
// the fighter the class list is for: the one card opened in the compact view, else the whole squad ("")
export function classFor(){
  if(S.view!=="compact")return "";
  var o=S.cardOpen.filter(function(n){return team().some(function(x){return x.n===n})});
  return o.length===1?o[0]:"";
}
export function lordOf(n){for(var k in S.teams){if(S.teams[k].some(function(x){return x.n===n}))return k}return null}
