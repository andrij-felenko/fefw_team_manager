// All fighters: the searchable list with filters, where fighters are added to the open squad.
import {tr} from "../core/i18n.js";
import {$,esc} from "../core/utils.js";
import {SK} from "../core/terms.js";
import {S,save,team,lordOf} from "../core/state.js";
import {LORDS,LI,lordUa,home} from "../data/lords.js";
import {U,ability} from "../data/fighters.js";
import {ageTxt} from "../data/gender-age.js";
import {TT} from "../data/teams.js";
import {sxOf} from "../model/rules.js";
import {joinInfo} from "../model/recruit.js";
import {chips} from "./tiles.js";
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
export function renderPool(){
  var q=(S.q||"").trim().toLowerCase();
  var list=U.filter(function(u){
    var ji=joinInfo(u,S.cur), where=lordOf(u.n);
    if(S.filter==="avail"&&!ji.ok&&where!==S.cur)return false;
    if(S.filter==="free"&&where)return false;
    if(S.sxF&&sxOf(u.n)!==S.sxF)return false;
    if(S.ttF&&TT[u.n]!==S.ttF)return false;
    if(!q)return true;
    return (u.n+" "+u.F.map(function(k){return SK[k]}).join(" ")+" "+ability(u)).toLowerCase().indexOf(q)>=0;
  });
  $("pool").innerHTML=list.map(function(u){
    var ji=joinInfo(u,S.cur), where=lordOf(u.n), btn;
    if(where===S.cur)btn='<span class="tag">'+tr("у загоні","in squad")+'</span>';
    else if(where)btn='<button type="button" class="round" disabled title="'+tr("Вже в іншому загоні","Already in another squad")+'" aria-label="'+tr("Зайнятий","Taken")+'">+</button>';
    else if(!ji.ok)btn='<button type="button" class="round" disabled title="'+tr("Цей лідер не може завербувати","This lord cannot recruit them")+'" aria-label="'+tr("Недоступний","Unavailable")+'">+</button>';
    else btn='<button type="button" class="round add" data-add="'+esc(u.n)+'" title="'+tr("Додати в загін","Add to squad")+'" aria-label="'+tr("Додати ","Add ")+esc(u.n)+'">+</button>';
    return '<div class="row'+(where?" in":"")+'">'+
      '<div class="r-head"><span class="r-name">'+esc(u.n)+' <span class="tag"><b class="sxb">'+({f:"♀",m:"♂"}[sxOf(u.n)]||"?")+'</b>'+(ageTxt(u.n)?" · "+ageTxt(u.n)+tr(" р."," y"):"")+'</span></span>'+btn+'</div>'+
      '<div class="c-meta">'+homeTag(u)+uniqBadge(u)+'</div>'+
      '<div class="chips">'+chips(u)+'</div>'+
      '<div class="join'+(ji.ok?"":" no")+'">'+lordUa(S.cur)+': '+esc(ji.txt)+pathsMark(u)+'</div>'+
    '</div>';
  }).join("")||'<p class="src">'+tr("Нікого не знайдено.","Nobody found.")+'</p>';
}
export function bindPool(renderAll){
  $("pool").addEventListener("click",function(e){var n=e.target.dataset.add;if(!n||lordOf(n))return;team().push({n:n,path:["","","","",""]});save();renderAll()});
  $("q").value=S.q||""; $("filter").value=S.filter||"avail";
  $("q").addEventListener("input",function(){S.q=this.value;save();renderPool()});
  $("filter").addEventListener("change",function(){S.filter=this.value;save();renderPool()});
  $("ttF").addEventListener("change",function(){S.ttF=this.value;save();renderPool()});
  $("sxF").value=S.sxF||"";
  $("sxF").addEventListener("change",function(){S.sxF=this.value;save();renderPool()});
}
