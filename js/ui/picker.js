// The class picker: a stage's drawer with every class of the tier, recommended ones first.
import {tr} from "../core/i18n.js";
import {S,team} from "../core/state.js";
import {lordUa} from "../data/lords.js";
import {BY} from "../data/fighters.js";
import {TIERS,CLS} from "../data/classes.js";
import {fit,holders,holdersAll,offPath,access} from "../model/rules.js";
import {recommend} from "../model/recommend.js";
import {rateAt,nameBand} from "../model/ratings.js";
import {reqLine} from "./tiles.js";
import {rateStrip} from "./rating.js";
import {mountBadge} from "./mounts.js";

export function pickList(n,sel,ti,i){
  var u=BY[n], rec=recommend(n,ti,team()[i].path);
  var order=TIERS[ti].list.filter(function(c){return !offPath(c[0])||c[0]===sel}).sort(function(a,b){
    var ra=rec.list.indexOf(a[0]),rb=rec.list.indexOf(b[0]);
    return (ra<0?99:ra)-(rb<0?99:rb);
  });
  return (rec.list.length?'<div class="rec-h">'+tr("Веде до: ","Leads to: ")+rec.to.join(", ")+'</div>':'')+
    (sel?'<button type="button" class="opt clear" data-set="'+i+'-'+ti+'" data-c="">'+tr("— прибрати клас","— remove class")+'</button>':'')+
    order.map(function(c){
      var isRec=rec.list.indexOf(c[0])>=0;
      var f=fit(u,c[0]),a=access(n,c[0]),C=CLS[c[0]];
      var taken=C.x.div?holdersAll(c[0],n):holders(c[0],n);
      var rt=rateAt(u,team()[i],ti,c[0]), rb=nameBand(rt);
      var oc=(taken.length||a.block?"taken":(f.m.length?"weak":""))+(isRec?" rec":"")+(rb?" rb-"+rb:"");
      // the stage's tile row as it would look with this class chosen
      var need=reqLine(C,u,team()[i],ti,i,true);
      var note=a.block?"⛔ "+a.block:(taken.length?tr("зайнято: ","taken: ")+taken.join(", "):(C.x.fem?tr("лише жінки","women only"):""));
      if(!a.block&&(C.x.excl===S.cur||(C.x.route&&C.x.route.indexOf(S.cur)>=0)))note=(note?note+" · ":"")+tr("клас маршруту ","path class of ")+lordUa(S.cur);
      // a blocked class cannot be picked at all
      return '<button type="button" class="opt '+oc+(c[0]===sel?" on":"")+'" data-set="'+i+'-'+ti+'" data-c="'+c[0]+'"'+(a.block&&c[0]!==sel?" disabled":"")+'>'+
        '<span class="o-n">'+(taken.length||a.block?"⊘ ":"")+c[0]+mountBadge(c[0])+'</span>'+rateStrip(rt,true)+'<span class="o-r">'+need+'</span>'+
        (note?'<span class="o-x">'+note+'</span>':'')+'</button>';
    }).join("");
}
