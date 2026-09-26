# Heroic Games — squad planner for *Fire Emblem: Fortune's Weave*

A fan-made, single-page planner for building the four lords' squads in *Fire Emblem: Fortune's Weave*.
It runs entirely in the browser — no build step, no server, no account. Your plans are saved in your browser's local storage.

**Languages:** 25 — English, Spanish, Arabic, Portuguese, German, French, Turkish, Italian, Ukrainian, Polish, Dutch, Romanian, Hungarian, Greek, Czech, Swedish, Belarusian, Irish, Danish, Norwegian, Finnish, Georgian, Lithuanian, Welsh and Crimean Tatar. Pick a flag in the top-right corner; the planner opens in English until you do. The flags are ordered by roughly how many people each language is the national language of — the population of the countries and regions where it is the nation's own language (e.g. Ireland for Irish, Wales for Welsh), plus the people living abroad — largest first. Arabic is shown as a letter badge rather than one country's flag, Belarusian with the white-red-white flag, Crimean Tatar with the Crimean Tatar flag; Portuguese is European Portuguese. Arabic reads right to left, except the top bar with the squads and flags. Ukrainian and English are written by hand; the rest were translated with AI help. Stats, weapons and class tiers use Nintendo's official names from Fire Emblem: Three Houses / Engage in Spanish, French, German and Italian, and the official Echoes names for weapons and magic in Dutch (the only Fire Emblem released in Dutch); the other languages never had an official Fire Emblem release, so their terms are plain translations. Class, character, item and ability names stay in English. Corrections from native speakers are very welcome — especially for Crimean Tatar, Irish, Welsh and Georgian.

## What it does

- **Four squads** — Rose Tempest (Leda), Ribeira Winds (Cai), House Lamine (Dietrich), Megaira's Beacon (Theodora), each starting with the fighters the game gives that lord. A fighter can only be in one squad.
- **Recruitment conditions per path** — chapter, support and renown needed, plus extra requirements (quests, gold, items). Fighters a lord can't recruit are locked.
- **Class paths** — pick a Specialty → Advanced → Master class for every fighter:
  - every stage shows a row of skill tiles: the seven weapon types always in the game's order, then the other exam skills. The tile's fill says what the class does with the weapon (strong tint — the chosen priority, light tint — the class's own weapon, empty, outline only — allowed but not the class's own, dark and dimmed — not allowed), its frame shows the fighter's strength (green) or weakness (purple), and a corner badge gives the exam rank. A row always stays on one line;
  - path-exclusive classes (each lord's path offers 11 of the 17 Advanced classes; classes of another lord's path are not listed at all), women-only classes, temple unlocks, one-holder classes;
  - a Master class can only be held by one fighter per squad; a repeated Advanced class is flagged, and the better-prepared fighter is treated as the main one;
  - recommended earlier classes (★) once a later class is chosen;
  - priority weapons: only the class's own weapons (its exam weapons) can be priority; on a class with several, click a tile to add it to or drop it from the priority set. The class list shows each class's row as it would look for that fighter.
- **Growth rates** — personal growths plus each class's growth modifier, per stage; the stats that matter for the chosen weapons are highlighted.
- **Three ratings per class** (a heuristic, not a game formula) — damage, evasion and defense, plus an overall one, each shown as an icon with a number. Stats build up along the path the way the game grows them: own growth up to level 20 (the base Commoner class adds nothing), then growth plus the class modifier — Specialty from 20, Advanced from 35, Master from 45 (Game8's ideal levels) up to an end level you set (60 by default). On top of that comes the flat stat bonus of the class the fighter is in at that stage (Fextralife's "Bonus Points to Basic Stats", e.g. Castle Knight HP +9, Str +6, Def +13, Spd −6); it holds only while in the class, so earlier classes' bonuses don't add up. A stage is judged at the level it is left: Specialty at 35, Advanced at 45, Master at the end. Damage = attack stat (Str or Mag, whichever the class can use) + ½ Spd (follow-ups) + 0.35 Dex (hit and crits); evasion = Spd + 0.4 Lck (Lck lowers enemy crits); defense = ½ HP + Def + Res (Res counts in full: spells add little Might — Fire 3, Thunder 5 against 8–13 for iron weapons — so enough Res wipes out a foe's magic). The tiles show points of 100: for each rating, the best fighter with the best class of every tier, grown to the end level, makes 100 (so the three scales match). Overall = (the two best + half the weakest) / 2.5 — two strong sides cover the third. The colour, and the percentage in the tooltip, compare them with every fighter × class option of the same tier: gold beats 90%+, silver 75%+, bronze 55%+, ordinary 30%+, poor below. The overall's colour applies the same two-best-plus-half rule to how far each side stands above or below the tier's average (in typical spreads): a record strength counts in full, and the weakest side's hole is capped, so it can't sink two strong sides. The number's own colour is personal and doesn't depend on the classes chosen before (the master is often picked first): every class of the stage is taken at its best for this fighter (for a master, the best Specialty × Advanced way to it), and the range from their worst to their best class is split into five equal steps — top 20% gold, then silver, bronze, green, grey ( an ordinary number is swamp green, “not ripe yet”, so it can't be taken for silver), so a fighter who is weak overall still sees which class suits them most. While earlier stages are still empty, the points assume the best way to the class (the tooltip names it). The class name takes the colour of the fighter's own overall verdict (see below), so even a fighter who is weak overall sees their best class in gold. Charm and Authority are left out.
- **Skill path bars** — the rank each skill has to reach at each stage.
- **Squad summary** — gender, age groups (teens / young / adults / long-lived — over 100, like Seteth and Ninae), and how many fighters use each weapon, magic, movement type and armour at every stage.
- **Four plans (save slots)** — the buttons 1–4 under the flags keep four separate plans side by side, each with its own squads and classes; language, filters and the end level are shared. Everything is saved automatically in this browser. An empty slot starts like a first visit.
- **Export / Import** — *Export* saves all four plans into one `.json` file, as a backup or to send to a friend; *Import* loads such a file and replaces all four plans (it asks first). Unknown fighters or classes in a file are skipped, and the fighters the story gives a lord are always kept in that lord's squad.

## Icons

`icons/` holds the 12 skill icons drawn for this project (sword, spear, axe, bow, brawling, white and black magic, authority, heavy armor, riding, flying, infantry): one 24×24 SVG per skill plus `sprite.svg` with all of them as `<symbol id="i-…">`. They use `fill="currentColor"`, so they take the text colour; only the two tomes keep fixed covers (white magic is a white book, black magic a dark one). Open `icons/preview.html` to see them all. Simplified shapes after the game's skill icons, drawn for this project, not copies; MIT like the rest.

## Use it

Open `index.html` in a browser, or publish it with GitHub Pages:

1. Create a new repository on GitHub and upload these files (`index.html`, `README.md`, `LICENSE`, `.nojekyll`).
2. In the repository go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. After a minute the planner is live at `https://<your-username>.github.io/<repository-name>/`.

Plans are stored per browser and per address: the same browser on a different address (for example `localhost` vs. GitHub Pages) starts with an empty plan. To move them, use *Export* on one and *Import* on the other.

## Data sources

Collected in September 2026 from community wikis and guides:
[Fextralife](https://fortunesweave.wiki.fextralife.com/Characters) (characters, classes, growth modifiers, class stat bonuses, ages),
[Game8](https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/620256) (class requirements, growth modifiers, path availability and per-path recruitment conditions),
[Fire Emblem Wiki](https://fireemblemwiki.org/wiki/List_of_characters_in_Fire_Emblem:_Fortune%27s_Weave) and
[Fandom](https://fireemblem.fandom.com/wiki/List_of_characters_in_Fire_Emblem:_Fortune%27s_Weave) (gender, ages),
[TheGamer](https://www.thegamer.com/fire-emblem-fortunes-weave-how-to-change-class/) (class restrictions),
[Serenes Forest](https://serenesforest.net/fortunes-weave/characters/growth-rates/) (growth rates).

The game is new and the wikis are still incomplete, so some ages are unknown. Where Fextralife and Game8 disagree on a class's growth modifiers (Light Cavalry, Charioteer, Ovate), Game8 is used. Corrections are welcome.

Ages are listed as before the timeskip. The planner contains no story spoilers beyond who joins which squad.

## Disclaimer

Unofficial fan project. *Fire Emblem* and *Fire Emblem: Fortune's Weave* are trademarks of Nintendo / Intelligent Systems. This project is not affiliated with or endorsed by them. Game data belongs to its respective owners; the code is released under the MIT License.
