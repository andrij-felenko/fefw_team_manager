// The squad's view switches above the cards: full cards or compact plates, which stages to show (all for planning,
// or the one or two you are at in the game), and whether stats count from the join level or from level 1.
import {tr} from "../core/i18n.js";
import {$,esc} from "../core/utils.js";
import {STAGE_S} from "../core/terms.js";
import {S,save,STAGE_WINDOWS} from "../core/state.js";
import {renderTeam} from "./squad.js";
import {renderTiers,renderClassTools} from "./classes.js";

export function renderSquadTools(){
  function seg(attr,cur,opts,label){
    return '<span class="segs" role="group" aria-label="'+esc(label)+'">'+opts.map(function(o){
      return '<button type="button" data-'+attr+'="'+o[0]+'" class="'+(cur===o[0]?"on":"")+'" aria-pressed="'+(cur===o[0])+'"'+(o[2]?' title="'+esc(o[2])+'"':'')+'>'+o[1]+'</button>'}).join("")+'</span>';
  }
  $("sqTools").innerHTML=
    seg("view",S.view,[["full",tr("Повні картки","Full cards")],["compact",tr("Компактно","Compact")]],tr("Вигляд","View"))+
    '<label class="sq-st">'+tr("Етапи:","Stages:")+' <select id="stw">'+STAGE_WINDOWS.map(function(w){
      return '<option value="'+w+'"'+(w===S.stw?" selected":"")+'>'+(w?w.split("").map(function(d){return STAGE_S[+d]}).join(" + "):tr("Усі (планування)","All (planning)"))+'</option>'}).join("")+'</select></label>'+
    seg("calc",S.calc,[["join",tr("Від вступу","From joining"),tr("Стати рахуються від рівня, з яким боєць приєднується: пізній рекрут приходить уже прокачаним","Stats count from the level the fighter joins at: a late recruit arrives levelled up")],
      ["full",tr("Увесь шлях","Whole path"),tr("Стати рахуються з 1 рівня, ніби боєць з тобою від початку","Stats count from level 1, as if the fighter were with you from the start")]],tr("Стати","Stats"));
}
export function bindSquadTools(){
  $("sqTools").addEventListener("click",function(e){
    var b=e.target.closest("button"); if(!b)return;
    if(b.dataset.view){S.view=b.dataset.view;save();renderSquadTools();renderTeam();renderClassTools();renderTiers();return}
    if(b.dataset.calc){S.calc=b.dataset.calc;save();renderSquadTools();renderTeam();renderTiers()}
  });
  $("sqTools").addEventListener("change",function(e){if(e.target.id!=="stw")return;S.stw=e.target.value;save();renderTeam()});
}
