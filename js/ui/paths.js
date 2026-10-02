// Recruit paths: the mark after a fighter's recruit line, and the table card it opens (see tooltip.js).
import {LANG,tr} from "../core/i18n.js";
import {esc} from "../core/utils.js";
import {S} from "../core/state.js";
import {lordUa} from "../data/lords.js";
import {extra} from "../data/fighters.js";
import {joinInfo,pathRows} from "../model/recruit.js";
import {PATHS_SVG} from "./icons.js";

// after the recruit line of the fighter list: how every path recruits them, as a small table
// (soonest path on green with ★); the mark is green when another path gets them sooner than the open lord's
export function pathsMark(u){
  var P=pathRows(u);
  if(!P.all.some(function(r){return r.id!==S.cur&&r.w}))return "";
  if(u.JJ.every(function(s){return s===u.JJ[0]}))return ""; // the same on every path
  var label=(P.sooner?tr("На іншому маршруті — раніше","Sooner on another path")+". ":"")+tr("Вербування на кожному маршруті (★ — найраніше)","Recruiting on each path (★ soonest)");
  return '<span class="paths'+(P.sooner?" sooner":"")+'" tabindex="0" role="img" aria-label="'+esc(label)+'" data-paths="'+esc(u.n)+'">'+PATHS_SVG+'</span>';
}
// the card behind the mark. An extra condition shared by every path is written once under the table,
// a column appears only when the paths ask for different things (often different gold)
export function pathsCard(u){
  var P=pathRows(u), best=P.best;
  var cond=function(c){var t=extra(c);return LANG==="en"?t.replace(" to "+u.n,""):t};
  var conds=P.all.filter(function(r){return r.w&&r.s.indexOf("/")>0}).map(function(r){return r.s.split("/")[3]||""});
  var same=conds.length>0&&conds.every(function(c){return c===conds[0]}), col=!same&&conds.length>0;
  var ch=tr("Гл. ","Ch. ").trim(), n=col?6:5;
  var h='<table class="pc"><thead><tr><th>'+tr("Маршрут","Path")+'</th><th class="n">'+ch+'</th><th class="n">'+tr("Підтримка ","Support ").trim()+
    '</th><th class="n">'+tr("Слава ","Renown ").trim()+'</th><th class="n">≈ '+ch+'</th>'+(col?'<th>'+tr("Умова","Condition")+'</th>':'')+'</tr></thead><tbody>';
  P.all.forEach(function(r){
    var top=r.w&&r.w[0]===best[0], s=r.s;
    h+='<tr class="'+(top?"best":"")+(r.id===S.cur?" cur":"")+'"><td class="ln">'+(top?"★ ":"")+esc(lordUa(r.id))+'</td>';
    if(!r.w||s==="P")h+='<td colspan="'+(n-1)+'" class="na">'+esc(joinInfo(u,r.id).txt)+'</td>';
    else if(s[0]==="a")h+='<td class="n">'+r.w[3]+'</td><td colspan="2" class="na">'+tr("автоматично","automatic")+'</td><td class="n">'+r.w[0]+'</td>'+(col?'<td></td>':'');
    else{var p=s.split("/");
      h+='<td class="n">'+p[0]+'</td><td class="n">'+p[1]+'</td><td class="n">'+p[2]+'</td><td class="n'+(r.w[0]>r.w[3]?" late":"")+'">'+r.w[0]+'</td>'+
        (col?'<td class="cd">'+esc(p[3]?cond(p[3]):"—")+'</td>':'');}
    h+='</tr>';
  });
  return (P.sooner?'<div class="pc-s">'+tr("На іншому маршруті — раніше","Sooner on another path")+'</div>':'')+
    '<div class="pc-h">'+tr("Вербування на кожному маршруті (★ — найраніше)","Recruiting on each path (★ soonest)")+'</div>'+h+'</tbody></table>'+
    (same&&conds[0]?'<div class="pc-x">'+tr("Умова","Condition")+': '+esc(cond(conds[0]))+'</div>':'');
}
