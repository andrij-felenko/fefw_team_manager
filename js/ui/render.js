// Draws the whole page, piece by piece (each piece also redraws on its own when only it changes).
import {renderStatic} from "./page.js";
import {renderSlots} from "./slots.js";
import {renderLegend} from "./legend.js";
import {renderTabs} from "./topbar.js";
import {renderTeam} from "./squad.js";
import {renderSquadTools} from "./squad-tools.js";
import {renderPool} from "./pool.js";
import {renderClassTools,renderTiers} from "./classes.js";

export function renderAll(){renderStatic();renderSlots();renderLegend();renderTabs();renderSquadTools();renderTeam();renderPool();renderClassTools();renderTiers()}
