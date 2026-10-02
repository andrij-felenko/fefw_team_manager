// The plans: switching save slots, and the export file with all four plans (read back by import).
import {has} from "./utils.js";
import {SK_EN} from "./terms.js";
import {S,save,setOpen,defTeams,NSLOTS} from "./state.js";
import {LORDS,LI} from "../data/lords.js";
import {U,BY} from "../data/fighters.js";
import {CLS,TIER_OF} from "../data/classes.js";
import {sxEditable} from "../data/gender-age.js";

const FILE_APP="fe-fortunes-weave-planner";
function planOf(){return {teams:S.teams,sx:S.sx}}
// a plan from another slot or from someone's file: known fighters and classes only, each fighter in one squad,
// and every lord in their own squad (a fighter the story gives a lord may have been moved to another squad)
function cleanPlan(p){
  if(!p||typeof p!=="object"||!p.teams||typeof p.teams!=="object")return null;
  var seen={}, out={teams:{},sx:{}};
  LORDS.forEach(function(l){
    out.teams[l.id]=[];
    (Array.isArray(p.teams[l.id])?p.teams[l.id]:[]).forEach(function(x){
      if(!x||typeof x.n!=="string"||!has(BY,x.n)||has(seen,x.n))return;
      seen[x.n]=1;
      var y={n:x.n,path:[0,1,2,3,4].map(function(i){var c=Array.isArray(x.path)?x.path[i]:"";
        return typeof c==="string"&&has(CLS,c)&&TIER_OF[c]===i?c:""})};
      if(x.main&&typeof x.main==="object")Object.keys(x.main).forEach(function(i){
        var ks=Array.isArray(x.main[i])?x.main[i].filter(function(k){return typeof k==="string"&&has(SK_EN,k)}):[];
        if(/^[0-4]$/.test(i)&&ks.length){y.main=y.main||{};y.main[i]=ks}
      });
      out.teams[l.id].push(y);
    });
  });
  U.forEach(function(u){LORDS.forEach(function(l){
    if(u.JJ[LI[l.id]]==="L"&&!has(seen,u.n)){seen[u.n]=1;out.teams[l.id].push({n:u.n,path:["","","","",""]})}
  })});
  if(p.sx&&typeof p.sx==="object")Object.keys(p.sx).forEach(function(n){
    if(has(BY,n)&&sxEditable(n)&&(p.sx[n]==="f"||p.sx[n]==="m"))out.sx[n]=p.sx[n]});
  return out;
}
function openPlan(p){
  S.teams=p.teams; S.sx=p.sx;
  if(!S.teams[S.cur].some(function(x){return x.n===S.forU}))S.forU="";
  setOpen(null);
}
// an empty slot starts like a first visit: each lord with the fighters the game gives them.
// false: nothing to switch (the slot is already open)
export function useSlot(i){
  if(i===S.slot||!(i>=0&&i<NSLOTS))return false;
  var next=cleanPlan(S.slots[i])||{teams:defTeams(),sx:{}};
  S.slots[S.slot]=JSON.parse(JSON.stringify(planOf()));
  S.slots[i]=null; S.slot=i; openPlan(next);
  save(); return true;
}
// one file with all four plans: to keep as a backup or to send to someone
export function exportData(d){
  return {app:FILE_APP,version:1,exported:d.toISOString(),open:S.slot,plans:S.slots.map(function(p,i){return i===S.slot?planOf():p})};
}
// the plans of a file, cleaned, and the one to open; null when it isn't a planner export
export function readPlans(text){
  var d=null; try{d=JSON.parse(text)}catch(e){}
  var plans=d&&d.app===FILE_APP&&Array.isArray(d.plans)?d.plans.slice(0,NSLOTS).map(cleanPlan):[];
  while(plans.length<NSLOTS)plans.push(null);
  var open=d?d.open|0:0; if(!(open>=0&&open<NSLOTS&&plans[open]))open=plans.findIndex(function(p){return p});
  return open<0?null:{plans:plans,open:open};
}
// the file's plans replace all four plans here
export function usePlans(f){S.slots=f.plans; S.slot=f.open; openPlan(f.plans[f.open]); S.slots[f.open]=null}
