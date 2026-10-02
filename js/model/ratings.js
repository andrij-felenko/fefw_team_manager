// Ratings of a fighter in a class: damage, evasion, defense and the overall one, with their scales and colours.
import {S} from "../core/state.js";
import {U} from "../data/fighters.js";
import {TIERS,CLS} from "../data/classes.js";
import {CG,CB} from "../data/growth.js";
import {access} from "./rules.js";
import {physOf,magOf,wieldOf} from "./weapons.js";
import {LV_AT,withBonus,endLv,exitLv,avgMod,gainsTo} from "./growth.js";
import {joinLvFor} from "./recruit.js";

// ---------- combat rating of a fighter in a class ----------
// Works on growth rates (own + class modifier), since base stats aren't known for everyone.
// Known mechanics (Game8/Fextralife): Str/Mag = damage; Spd = avoid and attack speed — 4 more than the foe means a
// second hit, for every weapon and magic; Dex = hit and crit, crit = triple damage; Def/Res = damage taken;
// Lck = avoiding enemy crits; Cha = gambit hit. Magic has limited uses, weapons don't.
// ---------- three ratings: damage, evasion, defense ----------
// Damage: attack stat (Str or Mag, whichever the class can use) + Spd for follow-ups (AS +4 over the foe) + Dex for hit
// and crits (triple damage). Evasion: Spd (Avo) + Lck (lowers enemy crits). Defense: ½ HP + Def + Res. Res counts in full:
// spells add little Might (Fire 3, Thunder 5 against 8–13 for iron weapons, Game8), so a foe's magic is mostly his Mag
// and enough Res wipes it out — a good mage takes almost nothing from other mages.
// Scale: for each rating, the best fighter with the best class on every stage, grown to the end level, makes 100;
// the three scales are stretched so their maxima match. Overall = (the two best + half the weakest) / 2.5: two strong
// sides cover the third (damage + evasion needs no armour, damage + defense needn't dodge, a dodging wall holds a gap).
// Colours say how a rating compares with every fighter × class option of the same tier. The overall's colour uses the
// same rule on how far each side stands from the tier's average (in typical spreads), with the weakest side's hole capped.
function rateIdx(st,C){
  var w=wieldOf(C), ph=!w.length||physOf(C).length>0, mg=magOf(C).length>0;
  var mag=mg&&(!ph||st[2]>st[1]), atk=mag?st[2]:st[1];
  return {v:[atk+0.5*st[4]+0.35*st[3], st[4]+0.4*st[5], 0.5*st[0]+st[6]+st[7]], mag:mag};
}
// the three weights: index 0 damage (attack stat filled in below), 1 evasion, 2 defense; stat order HP Str Mag Dex Spd Lck Def Res Cha
const RW=[null,[0,0,0,0,1,0.4,0,0,0],[0.5,0,0,0,0,0,1,1,0]];
function segPts(u,mod,n,w){var t=0;u.g.forEach(function(v,k){if(w[k])t+=w[k]*Math.max(0,v+(mod?mod[k]:0))*n/100});return t}
// the best any fighter can reach on each rating by the end level, picking the best class of every tier for it
const AXMAX={};
function axisMax(){
  var key=endLv(); if(AXMAX[key])return AXMAX[key];
  var ws=[[[0,1,0,0.35,0.5,0,0,0,0],[0,0,1,0.35,0.5,0,0,0,0]],[RW[1]],[RW[2]]];
  var best=ws.map(function(list){var top={v:0};list.forEach(function(w){U.forEach(function(u){
    var t=segPts(u,null,LV_AT[0]-1,w), cls=[];
    for(var ti=0;ti<=3;ti++){var n=exitLv(ti)-LV_AT[ti], b=-1, bc="";
      TIERS[ti].list.forEach(function(c){if(!CG[c[0]])return;var v=segPts(u,CG[c[0]],n,w);
        if(ti===3&&CB[c[0]])CB[c[0]].forEach(function(q,k){v+=(w[k]||0)*q});
        if(v>b){b=v;bc=c[0]}});
      t+=b; cls.push(bc)}
    if(t>top.v)top={v:t,n:u.n,cls:cls};
  })});return top});
  return (AXMAX[key]=best);
}
function ovOf(q){var s=q.slice().sort(function(a,b){return b-a});return (s[0]+s[1]+0.5*s[2])/2.5}
function ovRel(v,sc){var z=v.map(function(x,k){return (x-sc.zm[k])/sc.zs[k]}).sort(function(a,b){return b-a});return (z[0]+z[1]+0.5*Math.max(z[2],-1.5))/2.5}
function upper(a,v){var lo=0,hi=a.length;while(lo<hi){var m=(lo+hi)>>1;if(a[m]<=v)lo=m+1;else hi=m}return lo}
function share(a,v){return Math.min(99,Math.round(100*upper(a,v)/a.length))}
const SCALE={};
function scaleOf(ti){
  var key=ti+"-"+endLv(); if(SCALE[key])return SCALE[key];
  var rows=[], stl=[];
  U.forEach(function(u){TIERS[ti].list.forEach(function(c){
    if(!CG[c[0]])return;
    var mods=[]; for(var s=0;s<ti;s++)mods.push(avgMod(s)); mods[ti]=CG[c[0]];
    var g=withBonus(gainsTo(u,mods,ti),c[0]); stl.push(g); rows.push(rateIdx(g,CLS[c[0]]).v);
  })});
  var mx=axisMax(), sc={a:[0,1,2].map(function(k){return rows.map(function(r){return r[k]}).sort(function(p,q){return p-q})})};
  // the overall's colour: each side measured in typical spreads above or below the tier's average, so a record
  // strength counts in full; the weakest side's hole is capped at 1.5 spreads, so it can't sink two strong sides
  sc.zm=[0,1,2].map(function(k){return rows.reduce(function(t,r){return t+r[k]},0)/rows.length});
  sc.zs=[0,1,2].map(function(k){return Math.sqrt(rows.reduce(function(t,r){return t+(r[k]-sc.zm[k])*(r[k]-sc.zm[k])},0)/rows.length)||1});
  sc.o=rows.map(function(r){return ovRel(r,sc)}).sort(function(p,q){return p-q});
  sc.m=[0,1,2,3,4,5,6,7,8].map(function(k){return stl.reduce(function(t,g){return t+g[k]},0)/stl.length});
  sc.sd=sc.m.map(function(m,k){return Math.sqrt(stl.reduce(function(t,g){return t+(g[k]-m)*(g[k]-m)},0)/stl.length)||1});
  return (SCALE[key]=sc);
}
export function bandOf(p){return p>=90?"gold":p>=75?"silver":p>=55?"bronze":p>=30?"":"poor"}
// colour of the class name: the fighter's own verdict when known (ordinary = "unripe" green), else the global one
export function nameBand(r){return !r?"":r.own?(bandOf(r.own[3])||"ord"):bandOf(r.o)}
// Paths. The master is usually picked first, so a class is judged on its own merit: for each class of a stage we take
// the best way this fighter can reach it (every Specialty × Advanced combination for a master), and where the earlier
// stages are still empty the numbers use that best way too. Chosen earlier classes are used as chosen.
let PCACHE={};
export function clearPathCache(){PCACHE={}}
function stageCands(n,s){return TIERS[s].list.map(function(c){return c[0]}).filter(function(c){return CG[c]&&!access(n,c).block})}
function modsOf(path,ti){var m=[];for(var s=0;s<ti;s++)m.push(path[s]&&CG[path[s]]?CG[path[s]]:null);m[ti]=null;return m}
// best filling of the empty earlier stages for class cn on stage ti; fixed[s] = a chosen class or ""
function bestFill(u,ti,cn,fixed){
  var key="f|"+u.n+"|"+ti+"|"+cn+"|"+fixed.join(",")+"|"+S.cur+"|"+endLv()+"|"+S.calc; if(PCACHE[key])return PCACHE[key];
  var sc=scaleOf(ti), best=null, path=fixed.slice(), J=joinLvFor(u);
  (function walk(s){
    if(s>=ti){var mods=modsOf(path,ti); mods[ti]=CG[cn];
      var v=rateIdx(withBonus(gainsTo(u,mods,ti,J),cn),CLS[cn]).v, rel=ovRel(v,sc);
      if(!best||rel>best.rel)best={rel:rel,path:path.slice()}; return}
    if(fixed[s]){walk(s+1);return}
    stageCands(u.n,s).forEach(function(c){path[s]=c;walk(s+1)}); path[s]="";
  })(0);
  return (PCACHE[key]=best||{rel:0,path:fixed.slice()});
}
function potential(u,ti,cn){ // the class at its best for this fighter, whatever was chosen before
  var key="p|"+u.n+"|"+ti+"|"+cn+"|"+S.cur+"|"+endLv()+"|"+S.calc; if(PCACHE[key])return PCACHE[key];
  var f=bestFill(u,ti,cn,["","","",""]), mods=modsOf(f.path,ti), mx=axisMax(); mods[ti]=CG[cn];
  var sv=rateIdx(withBonus(gainsTo(u,mods,ti,joinLvFor(u)),cn),CLS[cn]).v.map(function(q,k){return 100*q/mx[k].v});
  return (PCACHE[key]=sv.concat(ovOf(sv)));
}
// the fighter's own range on a stage: worst to best class, each at its best; five equal steps between them
function ownRange(u,x,ti){
  var key="r|"+u.n+"|"+ti+"|"+(x.path[ti]||"")+"|"+S.cur+"|"+endLv()+"|"+S.calc; if(PCACHE[key])return PCACHE[key];
  var lo=[1e9,1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9,-1e9];
  TIERS[ti].list.forEach(function(c){
    var cn=c[0]; if(!CG[cn]||(access(u.n,cn).block&&cn!==x.path[ti]))return;
    potential(u,ti,cn).forEach(function(q,k){lo[k]=Math.min(lo[k],q);hi[k]=Math.max(hi[k],q)});
  });
  return (PCACHE[key]={lo:lo,hi:hi});
}
// place in the fighter's own range → a mark bandOf reads: top 20% gold, then silver, bronze, green, poor
function ownMark(q,lo,hi){var f=hi-lo<1e-6?1:(q-lo)/(hi-lo);return f>=0.8?95:f>=0.6?80:f>=0.4?60:f>=0.2?40:10}
export function rateAt(u,x,ti,cn){
  var C=CLS[cn]; if(!C||!CG[cn]||ti<0||ti>3)return null;
  var fixed=["","","",""]; for(var s=0;s<ti;s++)fixed[s]=x&&x.path[s]&&CG[x.path[s]]?x.path[s]:"";
  var way=x&&x.n?bestFill(u,ti,cn,fixed).path:fixed, mods=modsOf(way,ti); mods[ti]=CG[cn];
  var st=withBonus(gainsTo(u,mods,ti,joinLvFor(u)),cn), ix=rateIdx(st,C), sc=scaleOf(ti);
  var mx=axisMax(), p=[0,1,2].map(function(k){return share(sc.a[k],ix.v[k])});
  var sv=ix.v.map(function(v,k){return 100*v/mx[k].v}), ov=ovOf(sv);
  var z=st.map(function(v,k){return (v-sc.m[k])/sc.sd[k]}), rel=ovRel(ix.v,sc), own=null;
  if(x&&x.n){var R=ownRange(u,x,ti), pot=potential(u,ti,cn);own=pot.map(function(q,k){return ownMark(q,R.lo[k],R.hi[k])})}
  var filled=[]; for(var s2=0;s2<ti;s2++)if(!fixed[s2]&&way[s2])filled.push(way[s2]);
  return {p:p,o:share(sc.o,rel),own:own,n:u.n,filled:filled,pts:sv.map(Math.round).concat(Math.round(ov)),z:z,mag:ix.mag,ti:ti};
}
