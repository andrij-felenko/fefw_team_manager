// The squad: one card per fighter with the four stages of the class path, growth bars and the skill path.
import {LANG,tr,fmt} from "../core/i18n.js";
import {$,esc} from "../core/utils.js";
import {SK,STAT,STAGE,STAGE_S,MARKS} from "../core/terms.js";
import {S,OPEN,setOpen,save,team,shownStages} from "../core/state.js";
import {LI,lordUa,home} from "../data/lords.js";
import {BY,extra,ability} from "../data/fighters.js";
import {CLS,RANKS,treq} from "../data/classes.js";
import {CG} from "../data/growth.js";
import {sxEditable,ageTxt,ageBand} from "../data/gender-age.js";
import {sxOf,access,holders,mainHolder,fixedIn,isLord} from "../model/rules.js";
import {prioAt,relAt} from "../model/weapons.js";
import {joinInfo,joinAt} from "../model/recruit.js";
import {LV_AT,exitLv} from "../model/growth.js";
import {rateAt,nameBand,clearPathCache} from "../model/ratings.js";
import {ic,STORY_SVG} from "./icons.js";
import {chips,reqLine} from "./tiles.js";
import {rtTip,rateStrip} from "./rating.js";
import {mountBadge} from "./mounts.js";
import {pickList} from "./picker.js";
import {renderSummary} from "./summary.js";
import {restr,renderTiers,renderClassTools} from "./classes.js";

// the level the fighter joins the open lord at, when it is past the Beginner level (an estimate, the tooltip says how)
function joinTag(u,J){
  if(J.lv<=LV_AT[0])return "";
  var c=J.ch>=99?tr("Частина III","Part III"):"≈ "+tr("Гл. ","Ch. ")+J.ch;
  var tip=fmt(tr("Вступ — {w}: {c}, ≈ {n} рівень (оцінка за рекомендованими рівнями глав)","Joining {w}: {c}, ≈ Lv {n} (estimated from the chapters' recommended levels)"),{w:lordUa(S.cur),c:c,n:J.lv})+" · "+
    fmt(tr("До того росте сам як {k}; обрані тобою класи діють з цього рівня","Before that they grow on their own as {k}; the classes you choose count from that level"),{k:u.c||"Commoner"});
  return '<span class="tag join" title="'+esc(tip)+'">'+fmt(tr("≈ {n} рів.","≈ Lv {n}"),{n:J.lv})+'</span>';
}
// what the current lord needs to recruit this fighter: support / renown
function recTag(u){
  var s=u.JJ[LI[S.cur]];
  if(s==="L"||s==="-")return "";
  if(s[0]==="a")return ""; // comes with the story, nothing to recruit
  if(s==="P")return '<span class="c-rec">'+tr("Ч. III","Pt. III")+'</span>';
  var p=s.split("/");
  return '<span class="c-rec" title="'+tr("Гл. ","Ch. ")+p[0]+tr(" · підтримка "," · support ")+p[1]+tr(" · слава "," · renown ")+p[2]+(p[3]?' · '+esc(extra(p[3])):'')+'">'+
    tr("Підтримка ","Support ")+p[1]+' · '+tr("Слава ","Renown ")+p[2]+'</span>';
}
// how each skill has to grow along the chosen path
function progression(x,u,shown){
  var cols=[],skills=[];
  x.path.forEach(function(cn,i){if(!cn||i>3||shown.indexOf(i)<0)return;cols.push(i);CLS[cn].r.forEach(function(q){if(skills.indexOf(q.k)<0)skills.push(q.k)})});
  if(!cols.length)return "";
  var MK=MARKS[LANG]||MARKS.en;
  function rk(cn,k){var q=CLS[cn].r.filter(function(q){return q.k===k})[0];return q?RANKS.indexOf(q.rk):-1}
  // one rank bar per skill: E+ … S, filled to the highest rank the path needs, stage marks at the rank each stage asks for;
  // the ranks are written once under the bars, like a table's foot, so each skill takes one short line
  var h='<div class="prog">';
  skills.forEach(function(k){
    var cl=u.X.indexOf(k)>=0?"m":(u.F.indexOf(k)>=0?"p":""), best=-1, marks={};
    cols.forEach(function(i){var v=rk(x.path[i],k);if(v<0)return;best=Math.max(best,v);(marks[v]=marks[v]||[]).push(MK[i])});
    h+='<div class="sk '+cl+'"><span class="sk-n">'+ic(k)+SK[k]+'</span><div class="track">'+
      RANKS.map(function(r,v){return '<span class="seg'+(v<=best?" on":"")+'" title="'+r+'">'+(marks[v]?'<em>'+marks[v].join(" ")+'</em>':'')+'</span>'}).join("")+
      '</div><b class="sk-g">'+RANKS[best]+'</b></div>';
  });
  return h+'<div class="sk sk-ft" aria-hidden="true"><span></span><div class="track">'+RANKS.map(function(r){return '<i>'+r+'</i>'}).join("")+'</div><b></b></div></div>';
}
function relCls(rel,i,mx,v){return rel&&rel.r[i]===2?"rd":(rel&&rel.r[i]===1?"ri":(v===mx?"hi":""))}
function relTip(rel,i){return rel&&rel.r[i]?" · "+(rel.r[i]===2?tr("важливо для: ","key for: "):tr("допомагає: ","helps: "))+rel.why[i].join(", "):""}
// growth in a class: own growth + class modifier, with the modifier shown under the number
function classGrow(u,cn,rel){
  var mod=CG[cn]; if(!mod)return "";
  var vals=u.g.map(function(v,i){return Math.max(0,v+mod[i])}), mx=Math.max.apply(null,vals);
  return '<div class="grow cg">'+vals.map(function(v,i){var d=mod[i];
    return '<div class="g '+(rel&&rel.r[i]===2?"gd":(rel&&rel.r[i]===1?"gi":""))+'"><i class="'+relCls(rel,i,mx,v)+'" style="height:'+Math.max(4,v)+'%" title="'+STAT[i]+' '+u.g[i]+(d>=0?" +":" ")+d+" = "+v+'%'+relTip(rel,i)+'"></i>'+
      '<span><b>'+v+'</b><em class="'+(d>0?"up":(d<0?"dn":""))+'">'+(d>0?"+"+d:(d<0?d:"·"))+'</em></span></div>'}).join("")+'</div>';
}
// personal growths; highlighted for the highest stage that has a class
function growBars(u,rel){
  var mx=Math.max.apply(null,u.g);
  return '<div class="grow">'+u.g.map(function(v,i){return '<div class="g '+(rel&&rel.r[i]===2?"gd":(rel&&rel.r[i]===1?"gi":""))+'"><i class="'+relCls(rel,i,mx,v)+'" style="height:'+Math.max(4,v)+'%" title="'+STAT[i]+' '+v+'%'+relTip(rel,i)+'"></i><span><b>'+v+'</b>'+STAT[i]+'</span></div>'}).join("")+'</div>';
}
// the highest shown stage that has a class (the last shown one when none has)
function topStage(x,shown){for(var k=shown.length-1;k>=0;k--)if(x.path[shown[k]])return shown[k];return shown[shown.length-1]}
// compact plate: name, the class of the last shown stage with one, and its overall points in their colour
function plate(x,on,shown){
  var u=BY[x.n]; if(!u)return "";
  var ti=topStage(x,shown), cn=x.path[ti], rt=cn?rateAt(u,x,ti,cn):null, rb=nameBand(rt);
  return '<button type="button" class="sq-chip'+(on?" on":"")+'" data-card="'+esc(x.n)+'" aria-pressed="'+on+'" title="'+esc(tr("Відкрити або сховати повну картку","Open or close the full card"))+'">'+
    '<span class="ch-n">'+esc(u.n)+'</span><span class="ch-c">'+(cn?esc(cn):"—")+'</span>'+(rt?'<b class="ch-p'+(rb?" rb-"+rb:"")+'">'+rt.pts[3]+'</b>':'')+'</button>';
}
export function renderTeam(){
  clearPathCache();
  var T=team(), shown=shownStages(), compact=S.view==="compact";
  var opened=S.cardOpen.filter(function(n){return T.some(function(x){return x.n===n})});
  $("sqChips").innerHTML=compact?T.map(function(x){return plate(x,opened.indexOf(x.n)>=0,shown)}).join(""):"";
  $("team").innerHTML=T.map(function(x,i){return compact&&opened.indexOf(x.n)<0?"":card(x,i,shown)}).join("")||
    (T.length?"":'<p class="src">'+tr("Загін порожній — додай бійців зі списку нижче.","The squad is empty — add fighters from the list below.")+'</p>');
  renderSummary();
}
// one fighter's full card, with the shown stages
function card(x,i,shown){
    var u=BY[x.n]; if(!u)return "";
    var sx=sxOf(x.n), anyBad=false, anyDup=false;
    // the planner goes Beginner → Specialty → Advanced → Master; Divine is only in the class list
    // a late recruit arrives levelled up: the stages before their join level pass without your choice
    // (only when counting from the join level)
    var J=joinAt(u,S.cur), jl=S.calc==="full"?1:J.lv;
    var stages=shown.map(function(ti){var cn=x.path[ti];
      var pre=exitLv(ti)<=jl, part=!pre&&LV_AT[ti]<jl&&jl>LV_AT[0];
      var c=CLS[cn], fl=[], key=i+"-"+ti, open=OPEN===key, clash=false, a=null;
      if(c){
        a=access(x.n,cn); var dup=holders(cn,x.n);
        if(a.block){fl.push('<span class="warn">⛔ '+a.block+'</span>');anyBad=true}
        if(a.warn)fl.push('<span class="warn">'+a.warn+'</span>');
        if(dup.length&&!a.block){
          var main=mainHolder(cn);
          if(main!==x.n){fl.push('<span class="warn">'+tr("дубль · головний: ","duplicate · main: ")+main+'</span>');anyDup=true;clash=true}
        }
      }
      var rt=c?rateAt(u,x,ti,cn):null, rb=nameBand(rt);
      return '<div class="stage'+(c?"":" empty")+(pre?" pre":"")+(open?" open":"")+(clash||(a&&a.block)?" clash":"")+(rb&&!clash&&!(a&&a.block)?" rb-"+rb:"")+'">'+
        // stage name with the picker arrow under it on the left, so the class and its skills get the full width
        '<div class="st-row"><div class="st-l"><span class="st-t" title="'+STAGE[ti]+' · '+treq(ti)+'">'+STAGE_S[ti]+'</span>'+
          '<button type="button" class="pick" data-pick="'+key+'" aria-expanded="'+open+'" aria-label="'+STAGE[ti]+tr(": обрати клас",": choose class")+'">▾</button></div>'+
          '<span class="st-v">'+(c?'<b'+(rt?' title="'+rtTip(rt,3)+'"':'')+'>'+c.name+'</b>'+mountBadge(c.name)+rateStrip(rt)+reqLine(c,u,x,ti,i):'<span class="muted">—</span>')+'</span></div>'+
        (pre||part?'<div class="st-join">'+(pre?tr("до вступу","before joining"):fmt(tr("з ≈ {n} рівня","from ≈ Lv {n}"),{n:jl}))+'</div>':'')+
        (c&&(fl.length||restr(c))?'<div class="st-note">'+restr(c)+(fl.length?'<div class="fit">'+fl.join("")+'</div>':'')+'</div>':'')+
        (c?classGrow(u,cn,relAt(x,ti)):'')+
        '<div class="drawer"'+(open?'':' hidden')+'>'+(open?pickList(x.n,cn,ti,i):'')+'</div>'+
      '</div>';
    }).join("");
    var cant=!(joinInfo(u,S.cur).ok||u.JJ[LI[S.cur]]==="L");
    return '<article class="card'+(anyDup?" dup":"")+(anyBad||cant?" bad":"")+'">'+
      '<div class="c-top">'+
        '<div class="c-line"><span class="c-name">'+esc(u.n)+'</span>'+
          chips(u)+'</div>'+
        // right side: the remove button (a fighter the story gives this lord can still be moved; only a lord stays put)
        '<div class="c-right">'+
        (isLord(u)?'':'<button type="button" class="round" data-rm="'+i+'" aria-label="'+tr("Прибрати ","Remove ")+esc(u.n)+'" title="'+tr("Прибрати","Remove")+'">−</button>')+'</div></div>'+
      // under the name, from the left: gender, the story mark, age and, when it is not the squad being built, the home squad; recruit conditions on the right
      '<div class="c-sub">'+
          (sxEditable(x.n)
            ?'<span class="sx" role="group" aria-label="'+tr("Стать","Gender")+'">'+[["f","♀"],["m","♂"],["","?"]].map(function(s){
               return '<button type="button" data-sx="'+s[0]+'" data-n="'+esc(x.n)+'" class="'+(sx===s[0]?"on":"")+'" aria-pressed="'+(sx===s[0])+'">'+s[1]+'</button>'}).join("")+'</span>'
            :'<span class="c-sx" title="'+(sx==="f"?tr("жінка","woman"):tr("чоловік","man"))+'">'+(sx==="f"?"♀":"♂")+'</span>')+
(fixedIn(u,S.cur)?'<span class="c-story" role="img" title="'+(isLord(u)?tr("Лідер загону","The squad's lord"):
          tr("Сюжет: на цьому маршруті гра дає цього бійця сама; його можна перенести в загін іншого лідера","Story: on this path the game gives you this fighter; you can still move them to another lord's squad"))+
          '" aria-label="'+tr("Сюжетний боєць","Story fighter")+'">'+STORY_SVG+'</span>':'')+'<span class="c-age" title="'+tr("Вік до перестрибування в часі","Age before the timeskip")+'">'+(ageTxt(x.n)?ageTxt(x.n)+tr(" р."," y")+(ageBand(x.n)==="long"?tr(sxOf(x.n)==="f"?" · довгожителька":" · довгожитель"," · long-lived"):""):tr("вік ?","age ?"))+'</span>'+
        (u.t&&u.t!==S.cur?'<span class="tag lock"'+(LI[u.t]!=null?' title="'+esc(fmt(tr("Домашній загін: {w} — {t}","Home squad: {w} — {t}"),{w:lordUa(u.t),t:joinInfo(u,u.t).txt}))+'"':'')+'>'+home(u.t)+'</span>':'')+joinTag(u,J)+recTag(u)+'</div>'+
      (cant?'<div class="warn">⛔ '+lordUa(S.cur)+tr(" не може його завербувати"," cannot recruit this fighter")+'</div>':'')+
      growBars(u,relAt(x,topStage(x,shown)))+
      '<div class="path">'+stages+'</div>'+
      (x.path.slice(0,4).some(function(c){return c})?'<button type="button" class="ghost clear-all" data-clear="'+i+'">'+tr("Очистити класи","Clear classes")+'</button>':'')+
      progression(x,u,shown)+
      '<div class="ability"><b>'+esc(ability(u).split(":")[0])+'</b>'+(ability(u).indexOf(":")>0?":"+esc(ability(u).slice(ability(u).indexOf(":")+1)):"")+'</div>'+
    '</article>';
}
// add/remove a weapon from the stage's priority set; the last one cannot be removed
function toggleMain(el){
  var p=el.dataset.main.split("-"), x=team()[+p[0]], ti=+p[1], k=p[2];
  var cur=prioAt(x,ti).slice(), at=cur.indexOf(k);
  if(at>=0){if(cur.length===1)return;cur.splice(at,1)}else cur.push(k);
  x.main=x.main||{}; x.main[ti]=cur;
  save();renderTeam();
}
export function bindSquad(renderAll){
  // compact view: a plate opens or closes the fighter's full card (several can be open)
  $("sqChips").addEventListener("click",function(e){var b=e.target.closest("[data-card]");if(!b)return;
    var n=b.dataset.card, at=S.cardOpen.indexOf(n); if(at>=0)S.cardOpen.splice(at,1);else S.cardOpen.push(n);
    save();renderTeam();renderClassTools();renderTiers()});
  $("team").addEventListener("keydown",function(e){var m=e.target.closest("[data-main]");if(m&&(e.key==="Enter"||e.key===" ")){e.preventDefault();toggleMain(m)}});
  $("team").addEventListener("click",function(e){
    var m=e.target.closest("[data-main]"); if(m){toggleMain(m);return}
    var b=e.target.closest("button"); if(!b)return;
    if(b.dataset.clear!==undefined){var xc=team()[+b.dataset.clear];xc.path=["","","","",""];xc.main={};setOpen(null);save();renderTeam();renderTiers();return}
    if(b.dataset.pick){setOpen(OPEN===b.dataset.pick?null:b.dataset.pick);renderTeam();return}
    if(b.dataset.set){var p=b.dataset.set.split("-"),xs=team()[+p[0]];xs.path[+p[1]]=b.dataset.c;
      if(xs.main)delete xs.main[+p[1]]; // new class: back to the default priority
      setOpen(null);save();renderTeam();renderTiers();return}
    if(b.dataset.rm!==undefined){if(isLord(BY[team()[+b.dataset.rm].n]))return;setOpen(null);team().splice(+b.dataset.rm,1);save();renderAll();return}
    if(b.dataset.sx!==undefined){S.sx[b.dataset.n]=b.dataset.sx;save();renderTeam();renderTiers()}
  });
}
