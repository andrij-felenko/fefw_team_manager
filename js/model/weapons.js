// Weapons: what a class can wield, which weapons a stage holds as priority, and the growth stats they need.
import {SK} from "../core/terms.js";
import {BY} from "../data/fighters.js";
import {CLS,CW,PHYS} from "../data/classes.js";

export function wieldOf(c){var w=(CW[c.name]||"").split(" ").filter(Boolean);c.w.forEach(function(k){if((PHYS.indexOf(k)>=0||k==="wm"||k==="bm")&&w.indexOf(k)<0)w.push(k)});return w}
// physical weapons a class can hold: its exam weapons first, then the others it allows
export function physOf(c){var e=c.w.filter(function(k){return PHYS.indexOf(k)>=0});wieldOf(c).forEach(function(k){if(PHYS.indexOf(k)>=0&&e.indexOf(k)<0)e.push(k)});return e}
export function magOf(c){return wieldOf(c).filter(function(k){return k==="wm"||k==="bm"})}
// priority weapons of a stage: at least one, up to all of the class's physical weapons.
// Not chosen yet → one by default: the first the fighter is strong in, else the class's first weapon
export function prioAt(x,ti){return prioFor(CLS[x.path[ti]],x,ti)}
// the same for any class put on that stage (the class list previews it before it is chosen).
// Only the class's own weapons (its exam weapons) can be priority; others it merely allows can't
export function eligOf(c){return c.w.filter(function(k){return PHYS.indexOf(k)>=0})}
export function prioFor(c,x,ti){
  if(!c)return [];
  var el=eligOf(c); if(!el.length)return [];
  var m=x.main&&x.main[ti]; if(typeof m==="string")m=[m]; // an earlier version stored a single weapon
  var own=(m||[]).filter(function(k){return el.indexOf(k)>=0});
  if(own.length)return own;
  var u=BY[x.n], good=el.filter(function(k){return u.F.indexOf(k)>=0&&u.X.indexOf(k)<0});
  return [good[0]||el[0]];
}
// which growth stats a skill needs. Stat roles (Game8/Fextralife): Str = physical damage, Mag = magic damage,
// Dex = hit and crit, Spd = avoid and attack speed (follow-ups), Def/Res = damage taken, Cha = gambit hit.
// Weapon traits (Game8): sword ×1.2 on follow-ups, axe hits hard but less accurately, bow is effective at range
// and lives on accuracy, gauntlets rely on avoid, black magic targets Resilience.
// d = direct (the weapon's damage/core), i = indirect (helps it land or repeat). Stat order: HP Str Mag Dex Spd Lck Def Res Cha
const REL={sw:{d:[1,4],i:[3]},sp:{d:[1],i:[3,4]},ax:{d:[1],i:[3,4]},bo:{d:[1,3],i:[4]},br:{d:[1,4],i:[3]},
  wm:{d:[2],i:[3,4]},bm:{d:[2],i:[3,4]},he:{d:[6],i:[0]},au:{d:[8],i:[]}};
// relevance for one stage: its class's skills, keeping only the priority weapons among physical ones
export function relAt(x,ti){
  var c=CLS[x.path[ti]], r=[0,0,0,0,0,0,0,0,0], why=[[],[],[],[],[],[],[],[],[]]; if(!c)return null;
  var pr=prioAt(x,ti), ks=c.w.slice(); pr.forEach(function(k){if(ks.indexOf(k)<0)ks.push(k)});
  ks.forEach(function(k){
    if(PHYS.indexOf(k)>=0&&pr.indexOf(k)<0)return;
    var m=REL[k]; if(!m)return;
    m.d.forEach(function(s){r[s]=2;why[s].push(SK[k])});
    m.i.forEach(function(s){if(r[s]<1)r[s]=1;if(why[s].indexOf(SK[k])<0)why[s].push(SK[k])});
  });
  return {r:r,why:why};
}
