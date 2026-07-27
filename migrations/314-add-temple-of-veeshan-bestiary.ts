/**
 * Migration 314: add npc nodes (roles: ["mob"]) for
 * zone:temple-of-veeshan, per the unified `npc`/`roles` schema from
 * migration 265 (decisions/npc-mob-unification-and-zone-groups.md) -- see
 * issue #36 -- the last zone in this batch.
 *
 * `Category:Temple of Veeshan` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to
 * 105 `{{Namedmobpage}}` candidates spanning the zone's three wings: the
 * Halls of Testing roster in the East Wing (Casalen/Grozzmel/Krigara and
 * the guardian/drake/racnar trash that share its "Check out HOT Mobs
 * Guide" tell), the West Wing's quest-giving trio (Gozzrem/Lendiniara the
 * Keeper/Telkorenar), and the North Wing's dragon lords (Vulak`Aerr,
 * Lord Vyemm, the Cekenar/Sevalak/Zlexak triplets) with their many named
 * "NTOV Flurry Mob" guards and juvenile hatchlings.
 *
 * One exclusion: "Glimmering emerald drake" and "A glimmering emerald
 * drake" are genuine duplicate pages for the same in-game creature (both
 * internally named `a glimmering emerald drake` in their own
 * `{{Namedmobpage}}` params, same level/race/zone) from different import
 * passes -- the fuller-stat page with `class = Rogue`, real HP/damage
 * values, and its own screenshot was kept; the thinner `{{Screenshot
 * Needed}}` duplicate with `class = ?` and no combat stats was dropped,
 * same call as Upper Guk's duplicate "A Froglok Ton Shaman"/"Froglok ton
 * shaman" pages.
 *
 * "Lendiniara the Keeper", "Telkorenar", and "Gozzrem" already existed as
 * `npc:` quest-giver nodes (the Halls of Testing armor-quest turn-in
 * NPCs) -- same both-roles-legitimate shape as The Warrens' Aderius
 * Rhenar/Koajin, so this batch unions the `mob` role and level data onto
 * them rather than skipping. "A racnar (Temple of Veeshan)" carries a
 * disambiguating zone suffix in its own page title; label stored without
 * it.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Lendiniara the Keeper", minLevel: 66, maxLevel: 66 },
  { label: "Dozekar the Cursed", minLevel: 66, maxLevel: 66 },
  { label: "Telkorenar", minLevel: 66, maxLevel: 66 },
  { label: "Casalen", minLevel: 60, maxLevel: 60 },
  { label: "Grozzmel", minLevel: 60, maxLevel: 60 },
  { label: "Krigara", minLevel: 60, maxLevel: 60 },
  { label: "Lepethida", minLevel: 60, maxLevel: 60 },
  { label: "Midayor", minLevel: 60, maxLevel: 60 },
  { label: "Tavekalem", minLevel: 60, maxLevel: 60 },
  { label: "Gozzrem", minLevel: 66, maxLevel: 66 },
  { label: "Ymmeln", minLevel: 60, maxLevel: 60 },
  { label: "Essedera", minLevel: 60, maxLevel: 60 },
  { label: "An onyx sky drake", minLevel: 60, maxLevel: 64 },
  { label: "A lava dancer", minLevel: 62, maxLevel: 62 },
  { label: "Aaryonar", minLevel: 66, maxLevel: 66 },
  { label: "Ikatiar the Venom", minLevel: 66, maxLevel: 66 },
  { label: "A fiery temple guardian", minLevel: 62, maxLevel: 62 },
  { label: "An emerald sky defender", minLevel: 60, maxLevel: 60 },
  { label: "A shimmering green drake", minLevel: 62, maxLevel: 62 },
  { label: "An elder temple defender", minLevel: 60, maxLevel: 60 },
  { label: "Arreken Skyward", minLevel: 62, maxLevel: 62 },
  { label: "Cekenar", minLevel: 66, maxLevel: 66 },
  { label: "Dagarn the Destroyer", minLevel: 70, maxLevel: 70 },
  { label: "Eashen of the Sky", minLevel: 66, maxLevel: 66 },
  { label: "Jorlleag", minLevel: 66, maxLevel: 66 },
  { label: "Lady Mirenilla", minLevel: 66, maxLevel: 66 },
  { label: "Lady Nevederia", minLevel: 66, maxLevel: 66 },
  { label: "Lord Feshlak", minLevel: 66, maxLevel: 66 },
  { label: "Lord Koi'Doken", minLevel: 66, maxLevel: 66 },
  { label: "Lord Kreizenn", minLevel: 66, maxLevel: 66 },
  { label: "Sevalak", minLevel: 66, maxLevel: 66 },
  { label: "Zlexak", minLevel: 66, maxLevel: 66 },
  { label: "Vulak`Aerr", minLevel: 70, maxLevel: 70 },
  { label: "Lord Vyemm", minLevel: 66, maxLevel: 66 },
  { label: "An ancient frost guardian", minLevel: 64, maxLevel: 64 },
  { label: "An ancient guardian wurm", minLevel: 62, maxLevel: 62 },
  { label: "A burning guardian", minLevel: 64, maxLevel: 64 },
  { label: "An emerald watcher", minLevel: 60, maxLevel: 60 },
  { label: "A raging wyvern", minLevel: 61, maxLevel: 61 },
  { label: "A fiery drake", minLevel: 60, maxLevel: 60 },
  { label: "A greater sky drake", minLevel: 62, maxLevel: 62 },
  { label: "A racnar (Temple of Veeshan)", minLevel: 60, maxLevel: 60 },
  { label: "A shimmer drake", minLevel: 60, maxLevel: 60 },
  { label: "A vehement wyvern", minLevel: 66, maxLevel: 66 },
  { label: "An ancient shard wyvern", minLevel: 64, maxLevel: 64 },
  { label: "An ancient tigerclaw racnar", minLevel: 63, maxLevel: 63 },
  { label: "An elder shard wyvern", minLevel: 61, maxLevel: 61 },
  { label: "Bryrym", minLevel: 60, maxLevel: 60 },
  { label: "Zyerek Onyxblood", minLevel: 65, maxLevel: 65 },
  { label: "Vyldin Flamereaver", minLevel: 65, maxLevel: 65 },
  { label: "Quellod Earthspirit", minLevel: 65, maxLevel: 65 },
  { label: "Malteor Flamecaller", minLevel: 65, maxLevel: 65 },
  { label: "Kalkar of the Maelstrom", minLevel: 65, maxLevel: 65 },
  { label: "Carx`Vean", minLevel: 60, maxLevel: 60 },
  { label: "Gra`Vloren", minLevel: 60, maxLevel: 60 },
  { label: "Hsrek", minLevel: 60, maxLevel: 60 },
  { label: "Kal`Vunar", minLevel: 60, maxLevel: 60 },
  { label: "Kedrak", minLevel: 60, maxLevel: 60 },
  { label: "Lurian", minLevel: 60, maxLevel: 60 },
  { label: "Mazrien", minLevel: 60, maxLevel: 60 },
  { label: "Nir`Tan", minLevel: 60, maxLevel: 60 },
  { label: "Vukuz", minLevel: 60, maxLevel: 60 },
  { label: "An ancient ice wurm defender", minLevel: 62, maxLevel: 62 },
  { label: "A fiery watcher", minLevel: 60, maxLevel: 60 },
  { label: "Zemm", minLevel: 66, maxLevel: 66 },
  { label: "Yrrindor Emerald Claw", minLevel: 65, maxLevel: 65 },
  { label: "A glimmer drake", minLevel: 60, maxLevel: 64 },
  { label: "A cerulean sky gazer", minLevel: 60, maxLevel: 60 },
  { label: "A glimmering emerald drake", minLevel: 62, maxLevel: 62 },
  { label: "An elder crimson drake", minLevel: 61, maxLevel: 61 },
  { label: "An elder onyx drake", minLevel: 62, maxLevel: 62 },
  { label: "Yendilor the Cerulean Wing", minLevel: 60, maxLevel: 60 },
  { label: "Theldek the Stinger", minLevel: 59, maxLevel: 59 },
  { label: "An ancient sky drake", minLevel: 62, maxLevel: 62 },
  { label: "Ajorek the Crimson Fang", minLevel: 63, maxLevel: 63 },
  { label: "A cerulean guardian", minLevel: 60, maxLevel: 60 },
  { label: "A crimson claw hatchling", minLevel: 46, maxLevel: 46 },
  { label: "A fiery guardian", minLevel: 62, maxLevel: 62 },
  { label: "A glimmering drake", minLevel: 60, maxLevel: 64 },
  { label: "A greater malevolent drake", minLevel: 61, maxLevel: 61 },
  { label: "A Lava Defender", minLevel: 65, maxLevel: 65 },
  { label: "A malevolent drake", minLevel: 60, maxLevel: 60 },
  { label: "A shard wyvern hatchling", minLevel: 46, maxLevel: 46 },
  { label: "A Sky Defender", minLevel: 65, maxLevel: 65 },
  { label: "A skyseeker hatchling", minLevel: 46, maxLevel: 46 },
  { label: "A tigerclaw racnar", minLevel: 60, maxLevel: 60 },
  { label: "A wyvern hatchling", minLevel: 46, maxLevel: 46 },
  { label: "An ebon wing hatchling", minLevel: 46, maxLevel: 46 },
  { label: "An elder racnar", minLevel: 63, maxLevel: 63 },
  { label: "An Emerald Defender", minLevel: 65, maxLevel: 65 },
  { label: "An emerald eye hatchling", minLevel: 46, maxLevel: 46 },
  { label: "An Onyx Defender", minLevel: 65, maxLevel: 65 },
  { label: "Beldion Icewind", minLevel: 60, maxLevel: 60 },
  { label: "Belijor the Emerald Eye", minLevel: 63, maxLevel: 63 },
  { label: "Cyndor Lightningfang", minLevel: 65, maxLevel: 65 },
  { label: "Degta`Glis", minLevel: 60, maxLevel: 60 },
  { label: "Dktan`Nirsl", minLevel: 60, maxLevel: 60 },
  { label: "Meldikor the Windchaser", minLevel: 60, maxLevel: 60 },
  { label: "Nelaarn the Ebon Claw", minLevel: 63, maxLevel: 63 },
  { label: "Rlinf`Tae", minLevel: 60, maxLevel: 60 },
  { label: "Sarek`Relan", minLevel: 60, maxLevel: 60 },
  { label: "Velcra`Dron", minLevel: 60, maxLevel: 60 },
  { label: "Wel`Wnas", minLevel: 62, maxLevel: 62 },
  { label: "Zed`Renzicd", minLevel: 60, maxLevel: 60 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:temple-of-veeshan:${slug(mob.label)}`;
  const label = mob.label.replace(/ \([^)]*\)$/, "");

  if (hasNode(id)) {
    const node = graph.nodes.find((n: { id: string }) => n.id === id);
    const roles: string[] = node.roles || [];
    if (!roles.includes("mob")) roles.push("mob");
    node.roles = roles;
    node.minLevel = mob.minLevel;
    node.maxLevel = mob.maxLevel;
    merged++;
    continue;
  }
  addNode({ id, label, type: "npc", roles: ["mob"], minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:temple-of-veeshan", "located_in");
  added++;
}

save();
console.log(`Migration 314 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:temple-of-veeshan`);
