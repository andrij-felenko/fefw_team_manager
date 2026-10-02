// The level a recruit has when joining. Recruits are levelled up to roughly where the story is (RPG Site, GameFAQs);
// no source gives a table, so the curve runs through what guides state: Lv 1 at Ch. 1 (fireemblemwiki join blocks),
// Seteth Lv 3 and Guzran Lv 5 at Ch. 3, Leda's path Ch. 5 ≈ 12 and Ch. 6 15 (Game8), Ch. 7–8 ≈ 20–22,
// Theodora's Ch. 10 27 (Game8's only stated level) and Ch. 9 30+, Ch. 11 35–36, late recruits 33–35 at Ch. 12 (GameFAQs).
// JOIN_LV[chapter], Part I
export const JOIN_LV=[1,1,2,4,8,12,15,19,21,28,30,34,34];
// Part III joins: no source; after Part II's training drills (≈ 42 by its Ch. 4, RPG Site)
export const JOIN_LV_P3=44;
// known exceptions by path: Io joins Dietrich at Ch. 5 at Lv 20 whatever the army's level (Game8)
export const JOIN_FIX={Io:{die:20}};
