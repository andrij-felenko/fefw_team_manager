// Growth along a class path: the stats a fighter is expected to gain by the level each stage is left.
import {clamp} from "../core/utils.js";
import {S} from "../core/state.js";
import {TIERS} from "../data/classes.js";
import {CG,CB} from "../data/growth.js";

// Stats are what a fighter is expected to gain level by level along the path: growth = personal + class modifier
// (Game8). Up to level 5 the base Commoner class adds nothing; the Beginner class runs from 5. Ideal levels (Game8):
// Beginner 5, Specialty 20, Advanced 35, Master 45. A stage is judged at the level it is left: Beginner at 20, Specialty at 35,
// Advanced at 45, Master at the end.
export const LV_AT=[5,20,35,45]; // the level each stage starts: Beginner, Specialty, Advanced, Master
export function withBonus(st,cn){var b=CB[cn];return b?st.map(function(v,k){return v+b[k]}):st}
export function endLv(){return clamp(+S.endLv||60,46,99)}
export function exitLv(ti){return ti<3?LV_AT[ti+1]:endLv()}
const AVG_MOD={};
export function avgMod(ti){ // the tier's average modifier stands in for an earlier stage when the scale is built
  if(AVG_MOD[ti])return AVG_MOD[ti];
  var n=0, m=[0,0,0,0,0,0,0,0,0];
  TIERS[ti].list.forEach(function(c){var d=CG[c[0]];if(!d)return;n++;d.forEach(function(v,k){m[k]+=v})});
  return (AVG_MOD[ti]=m.map(function(v){return n?v/n:0}));
}
// expected gains up to the exit level of stage ti; mods[s] = modifier on stage s (none → the one before carries on).
// join: the level the fighter joins at (none → 1). Before it they grow on their own: own growth, plus their start
// class's modifier from the Beginner level on (most start as Commoner, which adds nothing); the chosen classes count after
export function gainsTo(u,mods,ti,join){
  var J=join||1, pre=u.c&&CG[u.c]||null, st=[0,0,0,0,0,0,0,0,0], cur=null;
  function add(a,b,m){if(b>a)u.g.forEach(function(v,k){st[k]+=Math.max(0,v+(m?m[k]:0))*(b-a)/100})}
  add(1,LV_AT[0],null);
  for(var s=0;s<=ti;s++){
    if(mods[s])cur=mods[s];
    var a=LV_AT[s], b=exitLv(s);
    add(a,Math.min(b,J),pre); add(Math.max(a,J),b,cur);
  }
  return st;
}
