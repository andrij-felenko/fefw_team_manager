// All fighters: the list with its filters (switches, gender, strengths), where fighters are added to the open squad.
import {LANG,tr} from "../core/i18n.js";
import {$,esc} from "../core/utils.js";
import {SK} from "../core/terms.js";
import {S,save,team,lordOf} from "../core/state.js";
import {LORDS,LI,lordUa,home} from "../data/lords.js";
import {U,extra} from "../data/fighters.js";
import {ageTxt} from "../data/gender-age.js";
import {sxOf} from "../model/rules.js";
import {joinInfo} from "../model/recruit.js";
import {chips} from "./tiles.js";
import {ic} from "./icons.js";
import {pathsMark} from "./paths.js";

function homeTag(u){
  var where=lordOf(u.n);
  if(where&&where!==S.cur)return '<span class="tag lock">'+tr("у загоні: ","in squad: ")+lordUa(where)+'</span>';
  return '<span class="tag">'+(u.t?home(u.t):tr("вільний","free agent"))+'</span>';
}
// which lords can recruit them at all; a badge only when not all four can
function uniqBadge(u){
  if(u.t==="p3"||u.JJ.indexOf("L")>=0)return "";
  var ok=LORDS.filter(function(l){return u.JJ[LI[l.id]]!=="-"}).map(function(l){return lordUa(l.id)});
  if(ok.length===4)return "";
  var no=LORDS.filter(function(l){return u.JJ[LI[l.id]]==="-"}).map(function(l){return lordUa(l.id)});
  return '<span class="tag uniq">'+(ok.length<=2?tr("лише: ","only: ")+ok.join(", "):tr("немає в: ","not with: ")+no.join(", "))+'</span>';
}
// the filters: three switches, each one narrows the list (all off: everyone), gender, and strengths
// (a fighter must be strong in every one picked)
function renderPoolTools(){
  function sw(k,on,label){return '<button type="button" class="sw'+(on?" on":"")+'" data-pf="'+k+'" aria-pressed="'+on+'"><i></i>'+label+'</button>'}
  function tg(attr,v,on,body,tip){return '<button type="button" class="tgl'+(on?" on":"")+'" data-'+attr+'="'+v+'" aria-pressed="'+on+'" title="'+esc(tip)+'" aria-label="'+esc(tip)+'">'+body+'</button>'}
  $("poolTools").innerHTML=
    sw("avail",S.avail,tr("Доступні: ","Available to ")+lordUa(S.cur))+sw("fresh",S.fresh,tr("Ще не в цьому загоні","Not yet in this squad"))+
    sw("free",S.free,tr("Не в інших загонах","Not in other squads"))+
    '<span class="skf">'+tg("sxf","f",S.sxF==="f","♀",tr("♀ Жінки","♀ Women"))+tg("sxf","m",S.sxF==="m","♂",tr("♂ Чоловіки","♂ Men"))+'</span>'+
    '<span class="skf"><span class="lb">'+tr("Сильні в:","Strong in:")+'</span>'+Object.keys(SK).map(function(k){
      return tg("skf",k,S.skF.indexOf(k)>=0,ic(k),SK[k])}).join("")+'</span>';
}
export function renderPool(){
  renderPoolTools();
  var list=U.filter(function(u){
    var ji=joinInfo(u,S.cur), where=lordOf(u.n);
    // the open squad's own fighters count as available to its lord (the lord and the story joins too)
    if(where===S.cur){if(S.fresh)return false}
    else if(S.avail&&!ji.ok||S.free&&where)return false;
    if(S.sxF&&sxOf(u.n)!==S.sxF)return false;
    return S.skF.every(function(k){return u.F.indexOf(k)>=0});
  });
  $("pool").innerHTML=list.map(function(u){
    var ji=joinInfo(u,S.cur), where=lordOf(u.n), btn;
    if(where===S.cur)btn='<span class="tag">'+tr("у загоні","in squad")+'</span>';
    else if(where)btn='<button type="button" class="round" disabled title="'+tr("Вже в іншому загоні","Already in another squad")+'" aria-label="'+tr("Зайнятий","Taken")+'">+</button>';
    else if(!ji.ok)btn='<button type="button" class="round" disabled title="'+tr("Цей лідер не може завербувати","This lord cannot recruit them")+'" aria-label="'+tr("Недоступний","Unavailable")+'">+</button>';
    else btn='<button type="button" class="round add" data-add="'+esc(u.n)+'" title="'+tr("Додати в загін","Add to squad")+'" aria-label="'+tr("Додати ","Add ")+esc(u.n)+'">+</button>';
    // how the open lord recruits them: short lines under the button (the lord is the open tab, so no name);
    // an extra condition (a quest, gold, items) goes on its own line at the bottom, across the whole card
    var s=u.JJ[LI[S.cur]], rec, cond="";
    if(s==="-"||s==="L")rec='<span class="no">'+esc(ji.txt)+'</span>';
    else if(s==="P")rec=tr("Частина III","Part III");
    else if(s[0]==="a")rec=tr("автоматично","automatic")+'<br>'+tr("Гл. ","Ch. ")+s.slice(1);
    else{var p=s.split("/");rec=tr("Гл. ","Ch. ")+p[0]+'<br>'+tr("Підтримка ","Support ")+p[1]+'<br>'+tr("Слава ","Renown ")+p[2];cond=p[3]?extra(p[3]):""}
    if(LANG==="en")cond=cond.replace(" to "+u.n,"");
    return '<div class="row'+(where===S.cur?" mine":(where?" in":""))+'">'+
      '<div class="r-main">'+
        '<div class="r-name">'+esc(u.n)+' <span class="tag"><b class="sxb">'+({f:"♀",m:"♂"}[sxOf(u.n)]||"?")+'</b>'+(ageTxt(u.n)?" · "+ageTxt(u.n)+tr(" р."," y"):"")+'</span></div>'+
        '<div class="c-meta">'+homeTag(u)+uniqBadge(u)+'</div>'+
        '<div class="chips">'+chips(u)+'</div>'+
      '</div>'+
      '<div class="r-side">'+btn+'<div class="r-rec">'+pathsMark(u)+rec+'</div></div>'+
      (cond?'<div class="join r-cond">'+esc(cond)+'</div>':'')+
    '</div>';
  }).join("")||'<p class="src">'+tr("Нікого не знайдено.","Nobody found.")+'</p>';
}
export function bindPool(renderAll){
  $("pool").addEventListener("click",function(e){var n=e.target.dataset.add;if(!n||lordOf(n))return;team().push({n:n,path:["","","","",""]});save();renderAll()});
  $("poolTools").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;
    if(b.dataset.pf)S[b.dataset.pf]=!S[b.dataset.pf];
    else if(b.dataset.sxf)S.sxF=S.sxF===b.dataset.sxf?"":b.dataset.sxf;
    else if(b.dataset.skf){var at=S.skF.indexOf(b.dataset.skf);if(at>=0)S.skF.splice(at,1);else S.skF.push(b.dataset.skf)}
    else return;
    save();renderPool()});
}
