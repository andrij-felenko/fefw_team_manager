// Mount badges: the animal next to a mounted class, with the tooltip on how to get one.
import {tr,pick,fmt} from "../core/i18n.js";
import {esc} from "../core/utils.js";
import {MOUNT_OF,MOUNTS,FOOD} from "../data/mounts.js";
import {ic} from "./icons.js";

// the animal a mounted class rides; the tooltip says how to get a better one than the standard mount
export function mountName(m){return pick(MOUNTS[m].name)}
function mountTip(cn){
  var m=MOUNT_OF[cn], M=MOUNTS[m], L=[fmt(tr("Тварина: {w}","Mount: {w}"),{w:mountName(m)})];
  if(cn==="Charioteer")L.push(tr("колісниця, яку тягнуть коні","a chariot drawn by horses"));
  L.push(M.food?fmt(tr("Ловити: маршрут Цая з Гл. 5, приманка — {w}","Capture: Cai's path from Ch. 5, lure with {w}"),{w:pick(FOOD[M.food])}):
    tr("Слони — нагорода побічного завдання Частини III","Elephants: the reward of a Part III side quest"));
  if(M.del)L.push(fmt(tr("{w} хоче делікатес","{w} wants a delicacy"),{w:M.del}));
  if(M.own)L.push(fmt(tr("{n} приходить зі своїм: {w}","{n} comes with {w}"),{n:M.own[0],w:M.own[1]}));
  if(M.food)L.push(tr("Звичайна тварина дається з класом; спіймана краща: до +5 до стату, +25% росту й свої вміння",
    "A standard mount comes with the class; a caught one is better: up to +5 to a stat, +25% growth and its own abilities"));
  if(m==="bau")L.push(tr("Bau для цього класу — поки лише з фанатської вікі","Bau for this class: from a fan wiki only so far"));
  return L.join(" · ");
}
export function mountBadge(cn){var m=MOUNT_OF[cn];return m?'<span class="mt" title="'+esc(mountTip(cn))+'">'+ic("m-"+m)+'</span>':""}
