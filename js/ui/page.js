// The page's fixed parts: language and direction, title, headings and labels, the source note, the flags' state.
import {LANG,tr,pick} from "../core/i18n.js";
import {$} from "../core/utils.js";
import {S} from "../core/state.js";
import {TTNAMES,ttName} from "../data/teams.js";

// the fixed texts of index.html (data-i18n), in Ukrainian and English
const T={
  h_squad:["Загін","Squad"], h_all:["Усі бійці","All fighters"], h_classes:["Класи","Classes"],
  f_free:["Ще ні в якому загоні","Not in any squad yet"], f_all:["Усі","Everyone"],
  sx_any:["Будь-яка стать","Any gender"], sx_f:["♀ Жінки","♀ Women"], sx_m:["♂ Чоловіки","♂ Men"],
  hide_blocked:["сховати недоступні","hide unavailable"],
  q_ph:["Пошук за іменем або навичкою (сокира, політ…)","Search by name or skill (axe, flying…)"],
  title:["Heroic Games · конструктор","Heroic Games · squad planner"],
  src:['Фанатський планувальник, не пов\'язаний з Nintendo чи Intelligent Systems. Дані: сторінки персонажів і класів <a href="https://fortunesweave.wiki.fextralife.com/Characters" target="_blank" rel="noopener">Fextralife</a>, вимоги класів і умови вербування <a href="https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/620256" target="_blank" rel="noopener">Game8</a>, стать і вік <a href="https://fireemblemwiki.org/wiki/List_of_characters_in_Fire_Emblem:_Fortune%27s_Weave" target="_blank" rel="noopener">Fire Emblem Wiki</a> і <a href="https://fireemblem.fandom.com/wiki/List_of_characters_in_Fire_Emblem:_Fortune%27s_Weave" target="_blank" rel="noopener">Fandom</a>, обмеження <a href="https://www.thegamer.com/fire-emblem-fortunes-weave-how-to-change-class/" target="_blank" rel="noopener">TheGamer</a>; вересень 2026. Ранги — мінімум для іспиту (E+ &lt; D &lt; C &lt; B &lt; A &lt; S). Приріст у класі = власний приріст + надбавка класу (<a href="https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/618974" target="_blank" rel="noopener">Game8</a>, <a href="https://serenesforest.net/fortunes-weave/characters/growth-rates/" target="_blank" rel="noopener">Serenes Forest</a>). Вік — до перестрибування в часі. Боєць може бути лише в одному загоні. Усе зберігається лише в цьому браузері.',
       'Fan-made planner, not affiliated with Nintendo or Intelligent Systems. Data: character and class pages on <a href="https://fortunesweave.wiki.fextralife.com/Characters" target="_blank" rel="noopener">Fextralife</a>, class requirements and recruitment conditions from <a href="https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/620256" target="_blank" rel="noopener">Game8</a>, gender and age from <a href="https://fireemblemwiki.org/wiki/List_of_characters_in_Fire_Emblem:_Fortune%27s_Weave" target="_blank" rel="noopener">Fire Emblem Wiki</a> and <a href="https://fireemblem.fandom.com/wiki/List_of_characters_in_Fire_Emblem:_Fortune%27s_Weave" target="_blank" rel="noopener">Fandom</a>, restrictions from <a href="https://www.thegamer.com/fire-emblem-fortunes-weave-how-to-change-class/" target="_blank" rel="noopener">TheGamer</a>; September 2026. Ranks are the exam minimum (E+ &lt; D &lt; C &lt; B &lt; A &lt; S). Growth in a class = personal growth + class modifier (<a href="https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/618974" target="_blank" rel="noopener">Game8</a>, <a href="https://serenesforest.net/fortunes-weave/characters/growth-rates/" target="_blank" rel="noopener">Serenes Forest</a>). Ages are before the timeskip. A fighter can be in one squad only. Everything is saved in this browser only.']
};
export function renderStatic(){
  document.documentElement.lang=LANG; document.documentElement.dir=LANG==="ar"?"rtl":"ltr";
  document.title=pick(T.title);
  document.querySelectorAll("[data-i18n]").forEach(function(el){el.textContent=pick(T[el.dataset.i18n])});
  $("q").placeholder=pick(T.q_ph);
  $("srcNote").innerHTML=pick(T.src);
  $("ttF").innerHTML='<option value="">'+tr("Будь-яка команда турніру","Any tournament team")+'</option>'+TTNAMES.map(function(t){return '<option value="'+t+'">'+ttName(t)+'</option>'}).join("");
  $("ttF").value=S.ttF||"";
  document.querySelectorAll(".lang button").forEach(function(b){var on=b.dataset.lang===LANG;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)});
}
