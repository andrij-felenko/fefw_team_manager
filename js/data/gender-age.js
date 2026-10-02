// Gender and age of every fighter.
// gender from the infobox on fireemblemwiki.org; Gaitz and Kiroc are not stated there
export const GENDER={};
"Leda Mu Olympia Catania Tialla Ultand Esmeralda Mikaela Theodora Lilian Sofia Alexandra Dante Fianna Halvin Inyoni Jasmine Loretta Ludia Ninae Noctula Nydine Sha_Lan Ursula"
  .split(" ").forEach(function(n){GENDER[n.replace("_"," ")]="f"});
"Buccar Sirocco Cai Peter Guzran Dietrich Fabio Yang_Jie Bonaventure Tobias Lysander Benditz Dadao Diego Goliath Io Jester Majide Nezha Nuzzuo Peppe Seteth Simon Zarcone"
  .split(" ").forEach(function(n){GENDER[n.replace("_"," ")]="m"});
// age before the timeskip (Part I): seen in game first, then fireemblemwiki.org infobox,
// Fextralife "Age" field, fireemblem.fandom.com (pre-timeskip value). After the timeskip everyone is +5.
const AGE={Leda:19,Buccar:49,Sirocco:20,Mu:15,Olympia:22,Cai:15,Tialla:15,Peter:15,Ultand:23,Dietrich:22,Esmeralda:17,
  Theodora:22,Bonaventure:49,Tobias:45,Catania:26,Guzran:37,Mikaela:35,"Yang Jie":39,Lysander:20,
  Lilian:18,Io:19,Kiroc:49,"Sha Lan":20,Zarcone:29,Seteth:1000,
  Simon:32,Ninae:471,Inyoni:25,Jasmine:38,Dante:23,Diego:19,Loretta:13,Ludia:17,Majide:28,Nydine:26,Ursula:79,Sofia:28};
const AGE_TXT={Seteth:"1000+"};
export function ageTxt(n){return AGE[n]==null?"":(AGE_TXT[n]||String(AGE[n]))}
// over a hundred: the long-lived (Seteth, a Nabatean; Ninae, whose people the game leaves open).
export function ageBand(n){var a=AGE[n];return a==null?"?":(a>=100?"long":(a<=18?"young":(a>=32?"old":"mid")))}
// gender is fixed in the game; gaps in the wiki are filled in by hand
export function sxEditable(n){return !GENDER[n]}
