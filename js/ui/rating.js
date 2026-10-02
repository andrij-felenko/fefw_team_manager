// Rating tiles: the four marks with their points, and the tooltip that explains them in words.
import {LANG,tr,loc,fmt} from "../core/i18n.js";
import {esc,cap} from "../core/utils.js";
import {bandOf} from "../model/ratings.js";
import {RT_SVG} from "./icons.js";

export function rtName(k){return [tr("Урон","Damage"),tr("Ухилення","Evasion"),tr("Захист","Defense"),tr("Загальна","Overall")][k]}
// the tooltip explains in words: how good the rating is, what lifts or drags it, and for the overall a hint how to use the fighter
const RT_WORD={m:[["дуже сильний","сильний","вище середнього","середній","слабкий"],["very strong","strong","above average","average","weak"]],
  n:[["дуже сильне","сильне","вище середнього","середнє","слабке"],["very strong","strong","above average","average","weak"]]};
function rtWord(p,g){var b=["gold","silver","bronze","","poor"].indexOf(bandOf(p));return LANG==="uk"?RT_WORD[g][0][b]:loc(RT_WORD[g][1][b])}
export function rtTip(r,k){
  var z=r.z, hi=function(i){return z[i]>=0.75}, lo=function(i){return z[i]<=-0.75}, out=[];
  function say(i,up,dn){if(hi(i))out.push(up);else if(lo(i))out.push(dn)}
  if(k===0){
    var a=r.mag?2:1;
    say(a,r.mag?tr("сильна магія","strong magic"):tr("сильний удар","hits hard"),r.mag?tr("слабка магія","weak magic"):tr("слабкий удар","hits softly"));
    say(4,tr("часто б'є двічі","often hits twice"),tr("рідко б'є двічі","rarely hits twice"));
    say(3,tr("добре влучає, частіше критує","accurate, crits more"),tr("частіше маже","misses more"));
  } else if(k===1){
    say(4,tr("ворог часто мазатиме","foes will often miss"),tr("мала швидкість — легко влучити","slow, easy to hit"));
    say(5,tr("рідко ловить крити","rarely takes crits"),tr("часто ловить крити","prone to crits"));
  } else if(k===2){
    say(0,tr("багато HP","lots of HP"),tr("мало HP","little HP"));
    say(6,tr("тримає удари зброї","takes weapon hits well"),tr("зброя б'є боляче","weapons hurt"));
    say(7,tr("магія майже не бере","magic barely hurts"),tr("магія б'є боляче","magic hurts"));
  }
  var mine=r.own?"\n"+cap(tr("для ","for ")+r.n+tr(" серед усіх класів етапу — "," among all classes of the tier — ")+(function(q){return q>=90?tr("один із найкращих","one of the best"):
      q>=75?tr("сильний","strong"):q>=55?tr("середній","middling"):q>=30?tr("слабший","weaker"):tr("з найгірших","among the worst")})(r.own[k])):"";
  var cmp=cap(tr("краще за ","beats ")+(k<3?r.p[k]:r.o)+tr("% варіантів етапу","% of the tier's options"));
  if(k<3)return rtName(k)+" "+r.pts[k]+" — "+rtWord(r.p[k],k===1?"n":"m")+(out.length?"\n"+out.map(cap).join("\n"):"")+"\n"+cmp+mine;
  // overall: which sides carry the fighter, and what that means on the map
  var o=[0,1,2].sort(function(a,b){return r.pts[b]-r.pts[a]}), P=r.p, weak=o[2];
  var top=[0,1,2].filter(function(i){return P[i]>=75});
  var hint=Math.min(P[0],P[1],P[2])>=30&&Math.max(P[0],P[1],P[2])-Math.min(P[0],P[1],P[2])<=20?tr("Без слабких місць.","No weak spot."):
    P[o[0]]>=55&&P[o[1]]>=55?(weak===2?tr("Б'є й ухиляється, але удару не тримає — не лишай під кількома ворогами.","Hits and dodges but can't take a hit — don't leave them under several foes."):
      weak===1?tr("Б'є й тримає удари — можна йти в лоб, ухилятися не треба.","Hits and takes hits — can go head-on, no need to dodge."):
      tr("Мало б'є, зате тримає все — ставити в прохід чи на передову.","Hits little but holds everything — put them in a gap or up front.")):
    top.length===1?[r.mag?tr("Сильна магія, решта слабша — бити здалеку й відходити.","Strong magic, the rest is weaker — cast from range and pull back."):
        tr("Сильний удар, решта слабша — бити й відходити, не підставлятися.","Hits hard, the rest is weaker — strike and pull back."),
      tr("Добре ухиляється, решта слабша — відволікати ворогів.","Dodges well, the rest is weaker — draw the foes' attention."),
      tr("Тримає удари, решта слабша — стояти попереду й прикривати інших.","Takes hits, the rest is weaker — stand in front and cover the others.")][top[0]]:
    r.o<30?tr("У цьому класі слабко — краще пошукати інший.","Weak in this class — look for another."):tr("Нічим особливо не виділяється.","Nothing stands out.");
  var via=r.filled&&r.filled.length?"\n"+tr("Бали пораховані з найкращим шляхом до цього класу: ","Points assume the best way to this class: ")+r.filled.join(" → "):"";
  var head=LANG==="uk"?"Загальна "+r.pts[3]+" — "+rtWord(r.o,"m")+" вибір.":fmt(loc("Overall {n} — {w} choice."),{n:r.pts[3],w:rtWord(r.o,"m")});
  return head+"\n"+hint+via+"\n"+cmp+mine;
}
export function rateStrip(r,small){
  if(!r)return "";
  return '<span class="rt'+(small?" sm":"")+'">'+[0,1,2,3].map(function(k){var p=k<3?r.p[k]:r.o, b=bandOf(p);
    return '<span class="rt-t'+(k===3?" rt-o":"")+(b?" rb-"+b:"")+'" role="img" title="'+esc(rtTip(r,k))+'" aria-label="'+esc(rtTip(r,k))+'">'+RT_SVG[k]+'<i class="sk-r'+(r.own?" pb-"+(bandOf(r.own[k])||"ord"):"")+'">'+r.pts[k]+'</i></span>'}).join("")+'</span>';
}
