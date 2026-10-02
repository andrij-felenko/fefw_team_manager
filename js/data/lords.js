// The four lords and their squads. Sources are listed in README.md.
import {LANG,tr} from "../core/i18n.js";
export const LORDS=[
  {id:"leda",name:"Rose Tempest",uk:"Леда",en:"Leda"},
  {id:"cai",name:"Ribeira Winds",uk:"Цай",en:"Cai"},
  {id:"die",name:"House Lamine",uk:"Дітріх",en:"Dietrich"},
  {id:"the",name:"Megaira's Beacon",uk:"Теодора",en:"Theodora"}];
export const LI={leda:3,cai:0,die:1,the:2}; // index into J (order: Cai | Dietrich | Theodora | Leda)
export function lordUa(id){var l=LORDS.filter(function(l){return l.id===id})[0];return LANG==="uk"?l.uk:l.en}
export function home(t){return {leda:tr("Загін Леди","Leda's squad"),cai:tr("Загін Цая","Cai's squad"),die:tr("Загін Дітріха","Dietrich's squad"),the:tr("Загін Теодори","Theodora's squad"),p3:tr("Частина III","Part III")}[t]}
