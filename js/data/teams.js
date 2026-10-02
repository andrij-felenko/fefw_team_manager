// Game data: the Heroic Games tournament teams.
import {tr} from "../core/i18n.js";

// Heroic Games bracket teams (fireemblemwiki.org list of characters) — only used by the list filter
export const TT={};
[["Fiery Mane","Goliath Jester Dante Gaitz"],["Tale of the Moon","Simon Ludia Fianna Ursula"],
 ["Linaria Dewdrops","Diego Loretta Ninae Seteth"],["Pale Raven","Nezha Dadao Halvin Sha_Lan"],
 ["other","Jasmine Alexandra Benditz Zarcone Kiroc Inyoni Peppe"]]
 .forEach(function(t){t[1].split(" ").forEach(function(n){TT[n.replace("_"," ")]=t[0]})});
export const TTNAMES=["Fiery Mane","Tale of the Moon","Linaria Dewdrops","Pale Raven","other"];
export function ttName(t){return t==="other"?tr("інші фракції","other factions"):t}
