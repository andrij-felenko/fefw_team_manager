// The legend: what the colours, tiles and ratings mean, and the end level the ratings grow to.
import {tr} from "../core/i18n.js";
import {$} from "../core/utils.js";
import {S,save} from "../core/state.js";
import {endLv} from "../model/growth.js";
import {ic,RT_SVG} from "./icons.js";
import {skTile} from "./tiles.js";
import {rtName} from "./rating.js";

export function renderLegend(){
  var html=
    '<span><b style="color:var(--plus)">'+tr("зелене","green")+'</b> — '+tr("схильність","strength")+'</span><span><b style="color:var(--minus)">'+tr("фіолетове","purple")+'</b> — '+tr("слабкість","weakness")+'</span>'+
    '<span class="ln lt">'+[[skTile("sw","pr"),tr("обрана пріоритетна","chosen priority")],[skTile("sw","own"),tr("зброя класу, можна зробити пріоритетною","the class's own, can be priority")],
      [skTile("sw","al"),tr("дозволена, але не зброя класу","allowed, not the class's own")],
      [skTile("sw","na"),tr("клас не дозволяє","not allowed")],[skTile("ax","","","up"),tr("рамка — схильність","frame — strength")],
      [skTile("ax","","","dn"),tr("рамка — слабкість","frame — weakness")],[skTile("sp","","C"),tr("ранг для іспиту","exam rank")]]
      .map(function(p){return '<span>'+p[0]+p[1]+'</span>'}).join("")+'</span>'+
    '<span><span class="mt">'+ic("m-horse")+'</span>'+tr("тварина класу (наведи — як дістати)","the class's mount (hover: how to get one)")+'</span>'+
    '<span><i class="sw-rd"></i>'+tr("приріст, важливий для обраної зброї","growth key for the chosen weapons")+'</span><span><i class="sw-ri"></i>'+tr("допомагає їй","helps them")+'</span>'+
    '<span class="ln lt">'+[0,1,2,3].map(function(k){return '<span><span class="rt-t'+(k===3?" rt-o":"")+'">'+RT_SVG[k]+'</span>'+rtName(k)+'</span>'}).join("")+
      '<span>'+tr("бали з 100 (100 — найкраще можливе в грі до рівня кінця): урон = Сил або Маг + ½ Шв + 0,35 Спр · ухилення = Шв + 0,4 Уд · захист = ½ HP + Зах + Оп · загальна = (дві найкращі + ½ найслабшої) / 2,5; відсотки — у підказці",
        "points of 100 (100 — the best possible in the game by the end level): damage = Str or Mag + ½ Spd + 0.35 Dex · evasion = Spd + 0.4 Lck · defense = ½ HP + Def + Res · overall = (the two best + ½ the weakest) / 2.5; percentages are in the tooltip")+'</span></span>'+
    '<span class="ln">'+tr("тло плитки — порівняння з усіма бійцями; колір числа й назви класу — з іншими класами цього ж бійця на етапі (золото — найкращий варіант для бійця): ",
      "tile — compared with every fighter; the colour of the number and the class name — with the same fighter's other classes on the tier (gold is their best option): ")+'<b style="color:var(--gold)">'+tr("золото","gold")+'</b> 90+ · <b style="color:var(--silver)">'+tr("срібло","silver")+'</b> 75+ · '+
      '<b style="color:var(--bronze)">'+tr("бронза","bronze")+'</b> 55+ · <b>'+tr("звичайна","ordinary")+'</b> 30+ ('+tr("число — ","its number is ")+'<b style="color:var(--unripe)">'+tr("зелене, «недозріле»","green, “not ripe yet”")+'</b>) · <b style="color:var(--block)">'+tr("погана","poor")+'</b>'+
      tr(" · стати накопичуються по шляху: до 5 рівня власний ріст, далі з модифікатором класу (початковий клас з 5-го, спец. з 20-го), плюс бонус статів класу, в якому боєць зараз; початковий оцінюю на 20 рівні, спец. на 35, прос. на 45, майстра на рівні ",
         " · stats build up along the path: own growth up to level 5, then with the class modifier (Beginner class from 5, Specialty from 20), plus the stat bonus of the class the fighter is in; Beginner is judged at 20, Specialty at 35, Advanced at 45, Master at level ")+
      '<input type="number" id="endLv" min="46" max="99" value="'+endLv()+'" aria-label="'+tr("Рівень кінця гри","End-game level")+'"></span>';
  var open=$("legend").dataset.open; if(open==null)open=innerWidth>700?"1":"";
  $("legend").innerHTML='<details'+(open?' open':'')+'><summary>'+tr("Легенда","Legend")+'</summary><div class="lg">'+html+'</div></details>';
  $("legend").querySelector("details").addEventListener("toggle",function(){$("legend").dataset.open=this.open?"1":""});
}
export function bindLegend(renderAll){
  $("legend").addEventListener("change",function(e){if(e.target.id!=="endLv")return;S.endLv=+e.target.value;S.endLv=endLv();save();renderAll()});
}
