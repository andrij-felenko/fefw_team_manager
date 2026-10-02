// Classes: every tier's classes with who in the squad can take them, filtered by fighter and tier.
import {tr,pick} from "../core/i18n.js";
import {$,esc} from "../core/utils.js";
import {S,save,team} from "../core/state.js";
import {lordUa} from "../data/lords.js";
import {BY} from "../data/fighters.js";
import {TIERS,CLS,tname,treq,NOTES,TEMPLE_UK} from "../data/classes.js";
import {holdersAll,offPath,access} from "../model/rules.js";
import {reqLine} from "./tiles.js";
import {mountBadge} from "./mounts.js";

function ruleOf(C){
  var r=C.x.excl?tr("лише маршрут: ","only path: ")+lordUa(C.x.excl):(C.x.route?tr("лише маршрути: ","only paths: ")+C.x.route.map(lordUa).join(", "):(C.x.fem?tr("лише жінки","women only"):tr("будь-хто","anyone")));
  return r+(C.x.div?tr(" · один носій на всю армію"," · one holder in the whole army"):(C.x.one?tr(" · один носій у загоні"," · one per squad"):""));
}
export function restr(c){
  var x=c.x,o=[];
  if(x.route&&x.route.indexOf(S.cur)>=0)o.push('<i class="mine">'+tr("клас маршруту","path class")+'</i>');
  if(x.temple)o.push('<i class="soft">'+tr("храм "+TEMPLE_UK[x.temple],x.temple+"'s temple")+'</i>');
  if(x.p3)o.push('<i class="soft">'+tr("з Частини III","from Part III")+'</i>');
  if(x.item)o.push('<i class="soft">'+tr("Ключ Діадеми + ","Key of the Diadem + ")+x.item+'</i>');
  if(x.note)o.push('<i class="soft">'+pick(NOTES[x.note])+'</i>');
  return o.length?'<div class="rs">'+o.join("")+'</div>':"";
}
function usedMap(){var m={};team().forEach(function(x){x.path.forEach(function(c){if(c)(m[c]=m[c]||[]).push(x.n)})});return m}
export function renderClassTools(){
  var names=team().map(function(x){return x.n});
  if(S.forU&&names.indexOf(S.forU)<0)S.forU="";
  $("forU").innerHTML='<option value="">'+tr("Для всього загону","For the whole squad")+'</option>'+names.map(function(n){return '<option value="'+esc(n)+'"'+(n===S.forU?" selected":"")+'>'+tr("Для: ","For: ")+esc(n)+'</option>'}).join("");
  $("tierF").innerHTML='<option value="">'+tr("Усі рівні","All tiers")+'</option>'+[0,1,2,3,4].map(function(i){return '<option value="'+i+'"'+(String(i)===S.tierF?" selected":"")+'>'+tname(i)+'</option>'}).join("");
  $("hideBlocked").checked=!!S.hideB;
}
export function renderTiers(){
  var m=usedMap(), open=S.open||{1:1,2:1};
  var one=S.forU||null, ou=one?BY[one]:null;
  $("tiers").innerHTML=[0,1,2,3,4].filter(function(ti){return !S.tierF||String(ti)===S.tierF}).map(function(ti){
    var t=TIERS[ti], cells=[], used=0, list=t.list.filter(function(c){return !offPath(c[0])});
    list.forEach(function(c){
      var C=CLS[c[0]], who=C.x.div?(holdersAll(c[0],null).length?holdersAll(c[0],null):null):m[c[0]], st="", why="";
      if(who)used++;
      // who can take it at all: in principle, then in this squad
      var rule=ruleOf(C);
      if(one){
        var a=access(one,c[0]);
        if(S.hideB&&a.block)return;
        why=a.block?'<div class="why warn">⛔ '+one+tr(" не може: "," can't: ")+a.block+'</div>'
                   :'<div class="why good">'+one+tr(" може"," can")+(a.warn?' · <span class="warn">'+a.warn+'</span>':'')+'</div>';
        if(a.block)st="st-block";
      } else {
        var can=[],no=[],unk=[];
        team().forEach(function(x){var a=access(x.n,c[0]);if(a.block)no.push(x.n+" ("+a.block+")");else if(a.warn)unk.push(x.n);else can.push(x.n)});
        if(S.hideB&&!can.length&&!unk.length)return;
        if(!can.length&&!unk.length)st="st-block";
        if(C.x.div&&who&&!m[c[0]]&&!can.length)why='';
        else why='<div class="why">'+(can.length===team().length?'<span class="good">'+tr("можуть усі в загоні","everyone in the squad can")+'</span>':
             (can.length?'<span class="good">'+tr("можуть: ","can: ")+can.join(", ")+'</span>':(unk.length?'':'<span class="warn">'+tr("у загоні ніхто","nobody in the squad")+'</span>')))+
             (unk.length?(can.length?'<br>':'')+'<span class="warn">'+tr("вкажи стать: ","set gender: ")+unk.join(", ")+'</span>':'')+
             (no.length&&no.length<=3?'<br><span>'+tr("не можуть: ","can't: ")+no.join(", ")+'</span>':'')+'</div>';
      }
      cells.push('<div class="cl'+(who?" used":"")+(st?" "+st:"")+'"><div class="t">'+c[0]+mountBadge(c[0])+'</div>'+
        '<div class="lbl">'+rule+'</div>'+
        reqLine(C,ou)+restr(C)+
        (who?'<div class="who">'+tr("зайнято: ","taken: ")+who.join(", ")+'</div>':'')+why+
      '</div>');
    });
    return '<details class="tier" data-t="'+ti+'"'+(open[ti]||S.tierF?" open":"")+'><summary><b>'+tname(ti)+'</b><span>'+tr("зайнято ","taken ")+used+tr(" з "," of ")+list.length+' · '+treq(ti)+'</span></summary><div class="cls">'+
      (cells.join("")||'<p class="src">'+tr("Тут нічого не підходить.","Nothing fits here.")+'</p>')+'</div></details>';
  }).join("");
}
export function bindClasses(){
  $("forU").addEventListener("change",function(){S.forU=this.value;save();renderTiers()});
  $("tierF").addEventListener("change",function(){S.tierF=this.value;save();renderTiers()});
  $("hideBlocked").addEventListener("change",function(){S.hideB=this.checked;save();renderTiers()});
  $("tiers").addEventListener("toggle",function(e){var t=e.target.dataset&&e.target.dataset.t;if(t==null||S.tierF)return;S.open=S.open||{1:1,2:1};
    if(e.target.open)S.open[t]=1;else delete S.open[t];save()},true);
}
