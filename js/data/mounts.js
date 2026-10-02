// Game data: the animals the mounted classes ride, and how to get a better one.
// the animal each mounted class rides; a class takes any animal of its own family, and the class itself
// comes with a standard one (Game8 "Best Mounts and Abilities", Fandom wiki pages Horse, Ornius, Bau and Elephant Rider).
// Bau for Dragoon and Bau Lord: Fandom only so far
export const MOUNT_OF={"Ornius Rider":"ornius","Armored Ornius Rider":"ornius","Caladrius":"ornius",
  "Light Cavalry":"horse","Charioteer":"horse","Forest Knight":"horse","Cataphract":"horse","Bardinger":"horse","Troubadour":"horse",
  "High Savant":"horse","Bow Knight":"horse","Orichaldia":"horse","Great Knight":"horse","Valkyrium":"horse","The Cavalier":"horse",
  "Wing Soldier":"pegasus","Celestial Trooper":"pegasus","Dragoon":"bau","Bau Lord":"bau","Elephant Rider":"elephant"};
// caught on Cai's path from Part I Ch. 5 with Lure and food on the world map (Game8 "How to Capture Animal Mounts");
// elephants come from a Part III side quest; Io and Alexandra join with their own
export const MOUNTS={horse:{name:["кінь","horse"],food:"veg",del:"Monoceros",own:["Io","Rocinan"]},ornius:{name:["Ornius","Ornius"],food:"fish"},
  pegasus:{name:["пегас","pegasus"],food:"veg",del:"Falicorn",own:["Alexandra","Bucephalus"]},bau:{name:["Bau","Bau"],food:"meat"},
  elephant:{name:["слон","elephant"]}};
export const MOUNT_KEYS=["horse","ornius","pegasus","bau","elephant"];
export const FOOD={fish:["риба","fish"],veg:["овочі","vegetables"],meat:["м'ясо","meat"]};
