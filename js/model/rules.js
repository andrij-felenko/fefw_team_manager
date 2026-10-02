// The rules: which classes count as taken, who may take a class in the open squad, story fighters and lords.
import {tr} from "../core/i18n.js";
import {S,team} from "../core/state.js";
import {LORDS,LI,lordUa} from "../data/lords.js";
import {BY} from "../data/fighters.js";
import {CLS,TIER_OF} from "../data/classes.js";
import {GENDER,sxEditable} from "../data/gender-age.js";

// classes that count as "taken": Advanced and up. Beginner and Specialty repeat freely (e.g. two Priests for healers);
// a repeated Advanced class is allowed but flagged; a Master class belongs to one fighter per squad
export function counted(x){return x.path.filter(function(c,i){return c&&i>1})}
// a fighter's gender: the game's, else the one set by hand
export function sxOf(n){return sxEditable(n)?(S.sx[n]||""):GENDER[n]}

export function fit(u,cn){var c=CLS[cn];if(!c)return {p:[],m:[]};
  return {p:c.w.filter(function(w){return u.F.indexOf(w)>=0}),m:c.w.filter(function(w){return u.X.indexOf(w)>=0})};}
export function holdersAll(cn,except){var o=[];LORDS.forEach(function(l){S.teams[l.id].forEach(function(x){if(x.n!==except&&counted(x).indexOf(cn)>=0)o.push(x.n+" ("+lordUa(l.id)+")")})});return o}
// among fighters sharing an Advanced class, the "main" one is best prepared for it:
// the Specialty stage already trains its skills, and those skills are his strengths (green)
function prep(x,cn){
  var u=BY[x.n], C=CLS[cn], sp=CLS[x.path[1]], s=0;
  C.w.forEach(function(k){
    if(sp&&sp.w.indexOf(k)>=0)s+=1;
    if(u.F.indexOf(k)>=0)s+=0.5;
    if(u.X.indexOf(k)>=0)s-=0.5;
  });
  return s;
}
export function mainHolder(cn){
  var best=null,bs=-1e9;
  team().forEach(function(x){if(x.path[2]!==cn)return;var s=prep(x,cn);if(s>bs){bs=s;best=x.n}});
  return best;
}
export function holders(cn,except){if(TIER_OF[cn]<=1)return [];return team().filter(function(x){return x.n!==except&&counted(x).indexOf(cn)>=0}).map(function(x){return x.n})}
// a class another lord's path owns: not shown for this squad at all
export function offPath(cn){var c=CLS[cn];return !!c&&((c.x.excl&&c.x.excl!==S.cur)||(c.x.route&&c.x.route.indexOf(S.cur)<0))}
export function access(n,cn){
  var c=CLS[cn],u=BY[n],r={block:null,warn:null},sx=sxOf(n); if(!c||!u)return r;
  // Part I: each lord's path offers 11 of the 17 Advanced classes (matches the in-game count)
  if(c.x.excl&&c.x.excl!==S.cur)r.block=tr("лише на маршруті: ","only on the path of ")+lordUa(c.x.excl);
  else if(c.x.route&&c.x.route.indexOf(S.cur)<0)r.block=tr("лише на маршрутах: ","only on the paths of ")+c.x.route.map(lordUa).join(", ");
  else if(c.x.p3)r.block=tr("лише з Частини III","Part III only");
  else if(u.nm&&(c.w.indexOf("ri")>=0||c.w.indexOf("fl")>=0))r.block=tr("не може верхи чи в польоті","cannot ride or fly");
  else if(c.x.fem&&sx==="m")r.block=tr("лише для жінок","women only");
  // Master: one per squad, no exceptions. Advanced may repeat, the stage is flagged instead (see renderTeam)
  else if(TIER_OF[cn]===3&&holders(cn,n).length)r.block=tr("вже зайнято: ","already taken: ")+holders(cn,n).join(", ");
  // Divine classes come in Part III, when all four squads are one army: one holder across all of them
  else if(c.x.div&&holdersAll(cn,n).length)r.block=tr("вже зайнято: ","already taken: ")+holdersAll(cn,n).join(", ");
  if(!r.block&&c.x.fem&&sx!=="f")r.warn=tr("лише для жінок — вкажи стать","women only — set the gender");
  return r;
}
// the lord's own squad as the game gives it (story joins and the tutorial recruit)
export function fixedIn(u,lord){return u.t===lord&&u.JJ[LI[lord]]!=="-"}
// a lord stays in their own squad; a fighter the story gives a lord can still be planned for another lord
export function isLord(u){return u.JJ.indexOf("L")>=0}
// classes tied to a lord's path: exclusive ones first, then the ones only this path (and one other) has
export function routeClasses(id){
  var ex=[],un=[];
  Object.keys(CLS).forEach(function(k){var x=CLS[k].x;if(x.excl===id)ex.push(k);else if(x.route&&x.route.indexOf(id)>=0)un.push(k)});
  return {ex:ex,un:un};
}
