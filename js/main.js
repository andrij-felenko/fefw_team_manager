// Fire Emblem: Fortune's Weave squad planner. Starts the page: the saved state, its language, the events, the first drawing.
// Imports go one way: core/utils, terms, i18n → data → core/state, plans → model → ui → main.js (see README.md).
import {LANG,setLang,withLang} from "./core/i18n.js";
import {S,loadState} from "./core/state.js";
import {renderAll} from "./ui/render.js";
import {bindTopbar} from "./ui/topbar.js";
import {bindFolds} from "./ui/page.js";
import {bindLegend} from "./ui/legend.js";
import {initTooltip} from "./ui/tooltip.js";
import {bindSlots} from "./ui/slots.js";
import {bindSquad} from "./ui/squad.js";
import {bindSquadTools} from "./ui/squad-tools.js";
import {bindPool} from "./ui/pool.js";
import {bindClasses} from "./ui/classes.js";

loadState();
// language: the visitor's saved choice, else English
setLang(S.lang||"en");
// the pieces that redraw the whole page get renderAll passed in, so no piece imports render.js (no import cycles)
bindTopbar(renderAll);
bindFolds();
bindLegend(renderAll);
initTooltip();
bindSlots(renderAll);
bindSquad(renderAll);
bindSquadTools();
bindPool(renderAll);
bindClasses();
withLang(LANG,renderAll);
