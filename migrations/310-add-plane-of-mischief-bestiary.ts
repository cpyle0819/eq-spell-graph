/**
 * Migration 310: add npc nodes (roles: ["mob"]) for
 * zone:plane-of-mischief, per the unified `npc`/`roles` schema from
 * migration 265 (decisions/npc-mob-unification-and-zone-groups.md) -- see
 * issue #36.
 *
 * `Category:Plane of Mischief` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to
 * 133 `{{Namedmobpage}}` candidates -- Bristlebane's realm is built almost
 * entirely from joke/novelty-named NPCs (numbered "One" through
 * "TwentyTwo", the letter-spelling "YOU"/"SHALL"/"NOT"/"PASS" quartet in
 * the Upside-Down Wing, puzzle-piece placeholders like "Another piece"),
 * plus the six god-themed puppets, the "dancing" Ashley/Brittina/
 * Diana/Roxxanne quartet, mushroom-men in the forest, and several NPCs
 * the wiki flags as sitting in unreachable "GM Room"-style pockets (Doo,
 * Dree, Seeks, Vive, Vour, Vun, LosCountAhAhAh).
 *
 * Zero exclusions this batch, unusually -- every one of the 133
 * candidates carries a stated numeric level despite how whimsical the
 * names read, including the seemingly-decorative "no-model" letter NPCs
 * (level 56 each) and the reachability-uncertain "GM Room" mobs (all have
 * real stat blocks). Per the established "stats over name" rule, a joke
 * name or an odd/isolated location isn't grounds for exclusion on its
 * own -- only a missing level, a non-creature description, or a `zone`
 * field naming somewhere else is. "A Dastardly Rascal"'s own page voices
 * uncertainty about whether it exists on EQL specifically ("these are
 * post-revamp mobs, not sure if they will exist on EQL") -- kept anyway
 * since it's still categorized with full stats and no definitive
 * non-existence claim, but worth a second look if EQL's own client ever
 * contradicts it.
 *
 * "Bob the Painter", "Ferjeneror", and "Debbis the Fish" already existed
 * as `npc:` quest-giver nodes -- same both-roles-legitimate shape as The
 * Warrens' Aderius Rhenar/Koajin, so this batch unions the `mob` role and
 * level data onto them rather than skipping. "Snitch (PoM)" carries a
 * disambiguating zone suffix in its own page title; label stored without
 * it.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Peachy D`Vicci", minLevel: 48, maxLevel: 48 },
  { label: "Bob the Painter", minLevel: 49, maxLevel: 49 },
  { label: "A White Stallion", minLevel: 55, maxLevel: 55 },
  { label: "A False Treasure Chest", minLevel: 51, maxLevel: 51 },
  { label: "A Clever Sphinx", minLevel: 57, maxLevel: 57 },
  { label: "Posie the Librarian", minLevel: 55, maxLevel: 55 },
  { label: "Bristlebane (God)", minLevel: 64, maxLevel: 64 },
  { label: "Geb", minLevel: 55, maxLevel: 55 },
  { label: "Xnyl", minLevel: 46, maxLevel: 46 },
  { label: "Mnyup", minLevel: 46, maxLevel: 46 },
  { label: "Pela", minLevel: 46, maxLevel: 46 },
  { label: "Klia", minLevel: 46, maxLevel: 46 },
  { label: "Ruttus", minLevel: 50, maxLevel: 50 },
  { label: "Raesar", minLevel: 50, maxLevel: 50 },
  { label: "Ratmlet", minLevel: 50, maxLevel: 50 },
  { label: "Tribunal Puppet", minLevel: 55, maxLevel: 55 },
  { label: "Innoruuk Puppet", minLevel: 55, maxLevel: 55 },
  { label: "Erollisi Puppet", minLevel: 55, maxLevel: 55 },
  { label: "Rallos Puppet", minLevel: 55, maxLevel: 55 },
  { label: "Solusek Puppet", minLevel: 55, maxLevel: 55 },
  { label: "Tunare Puppet", minLevel: 55, maxLevel: 55 },
  { label: "Bristlebane Puppet", minLevel: 55, maxLevel: 55 },
  { label: "Bizzznawa", minLevel: 43, maxLevel: 43 },
  { label: "Poddle Dod", minLevel: 40, maxLevel: 40 },
  { label: "Brendaine", minLevel: 55, maxLevel: 55 },
  { label: "Selvz", minLevel: 55, maxLevel: 55 },
  { label: "Terana", minLevel: 55, maxLevel: 55 },
  { label: "Osfof", minLevel: 55, maxLevel: 55 },
  { label: "A Ratfink", minLevel: 48, maxLevel: 48 },
  { label: "Ratman Rager", minLevel: 47, maxLevel: 47 },
  { label: "Teriling", minLevel: 49, maxLevel: 49 },
  { label: "A Ratling", minLevel: 46, maxLevel: 46 },
  { label: "Chuckles the Great", minLevel: 55, maxLevel: 55 },
  { label: "Ricoculous", minLevel: 55, maxLevel: 55 },
  { label: "Grenn", minLevel: 51, maxLevel: 57 },
  { label: "Brenn", minLevel: 51, maxLevel: 57 },
  { label: "Ferjeneror", minLevel: 65, maxLevel: 65 },
  { label: "Snitch (PoM)", minLevel: 56, maxLevel: 56 },
  { label: "Plupple", minLevel: 56, maxLevel: 56 },
  { label: "Stitch", minLevel: 56, maxLevel: 56 },
  { label: "Dupple", minLevel: 56, maxLevel: 56 },
  { label: "A misplaced hand", minLevel: 59, maxLevel: 59 },
  { label: "A merry mushroom man", minLevel: 55, maxLevel: 55 },
  { label: "A mirthful mushroom man", minLevel: 52, maxLevel: 52 },
  { label: "A puckish mushroom", minLevel: 53, maxLevel: 53 },
  { label: "A bishop thingy", minLevel: 58, maxLevel: 58 },
  { label: "A Dastardly Rascal", minLevel: 57, maxLevel: 57 },
  { label: "A hedge wizard", minLevel: 59, maxLevel: 61 },
  { label: "A jovial white knight", minLevel: 55, maxLevel: 55 },
  { label: "A lost gnome", minLevel: 35, maxLevel: 35 },
  { label: "A maniacal dark knight", minLevel: 60, maxLevel: 60 },
  { label: "A moldy sausage", minLevel: 57, maxLevel: 57 },
  { label: "A petal pusher", minLevel: 53, maxLevel: 53 },
  { label: "A random piece", minLevel: 58, maxLevel: 58 },
  { label: "A stalker", minLevel: 54, maxLevel: 54 },
  { label: "A sunny day", minLevel: 55, maxLevel: 55 },
  { label: "A vinecator", minLevel: 52, maxLevel: 52 },
  { label: "Abbis", minLevel: 55, maxLevel: 55 },
  { label: "Another piece", minLevel: 58, maxLevel: 58 },
  { label: "Ashley", minLevel: 55, maxLevel: 55 },
  { label: "Bit", minLevel: 55, maxLevel: 55 },
  { label: "Blich", minLevel: 56, maxLevel: 56 },
  { label: "Bombadier Bixie Bernice", minLevel: 55, maxLevel: 55 },
  { label: "Bozer the Bear", minLevel: 53, maxLevel: 53 },
  { label: "Brittina", minLevel: 55, maxLevel: 55 },
  { label: "Carrot Top", minLevel: 52, maxLevel: 52 },
  { label: "Chesnut", minLevel: 48, maxLevel: 48 },
  { label: "Chuckles", minLevel: 55, maxLevel: 55 },
  { label: "Dabbis", minLevel: 55, maxLevel: 55 },
  { label: "Debbis the Fish", minLevel: 60, maxLevel: 60 },
  { label: "Diana", minLevel: 55, maxLevel: 55 },
  { label: "Dinner", minLevel: 1, maxLevel: 1 },
  { label: "Dolep Dopp", minLevel: 41, maxLevel: 41 },
  { label: "Donk", minLevel: 55, maxLevel: 55 },
  { label: "Doo", minLevel: 48, maxLevel: 48 },
  { label: "Doobis", minLevel: 55, maxLevel: 55 },
  { label: "Dop Dop", minLevel: 39, maxLevel: 39 },
  { label: "Dopple Pop", minLevel: 39, maxLevel: 39 },
  { label: "Dree", minLevel: 48, maxLevel: 48 },
  { label: "EightySix", minLevel: 60, maxLevel: 60 },
  { label: "Glonk", minLevel: 51, maxLevel: 57 },
  { label: "Gono", minLevel: 51, maxLevel: 51 },
  { label: "Gorilla Scholar", minLevel: 58, maxLevel: 58 },
  { label: "Grink", minLevel: 51, maxLevel: 57 },
  { label: "Guard McSprayel", minLevel: 51, maxLevel: 51 },
  { label: "Guard McStinkles", minLevel: 50, maxLevel: 50 },
  { label: "Guard Roses", minLevel: 52, maxLevel: 52 },
  { label: "Hall Monitor Willy", minLevel: 55, maxLevel: 55 },
  { label: "Jumbo Gorilla King", minLevel: 55, maxLevel: 55 },
  { label: "Keel", minLevel: 51, maxLevel: 51 },
  { label: "Kitch", minLevel: 56, maxLevel: 56 },
  { label: "Krupple", minLevel: 56, maxLevel: 56 },
  { label: "Life", minLevel: 55, maxLevel: 55 },
  { label: "Lithiniath (Black Version)", minLevel: 64, maxLevel: 64 },
  { label: "Lithiniath (White Version)", minLevel: 64, maxLevel: 64 },
  { label: "LosCountAhAhAh", minLevel: 49, maxLevel: 49 },
  { label: "Mees", minLevel: 51, maxLevel: 51 },
  { label: "Mister Malodor", minLevel: 51, maxLevel: 51 },
  { label: "Mizer", minLevel: 55, maxLevel: 55 },
  { label: "My Finger", minLevel: 52, maxLevel: 52 },
  { label: "My Right Hand", minLevel: 63, maxLevel: 63 },
  { label: "NOT", minLevel: 56, maxLevel: 56 },
  { label: "Not Poddle Pop", minLevel: 44, maxLevel: 44 },
  { label: "Not Yours", minLevel: 51, maxLevel: 51 },
  { label: "Nupple", minLevel: 56, maxLevel: 56 },
  { label: "One", minLevel: 50, maxLevel: 50 },
  { label: "Pansies", minLevel: 35, maxLevel: 45 },
  { label: "PASS", minLevel: 56, maxLevel: 56 },
  { label: "Petunia the Doll", minLevel: 37, maxLevel: 37 },
  { label: "Pinky Ekkolofezznaboten III", minLevel: 55, maxLevel: 55 },
  { label: "Pod Dop Pop", minLevel: 43, maxLevel: 43 },
  { label: "Popple Dop", minLevel: 40, maxLevel: 40 },
  { label: "Raisin", minLevel: 55, maxLevel: 55 },
  { label: "Rissa", minLevel: 44, maxLevel: 44 },
  { label: "Roxxanne", minLevel: 55, maxLevel: 55 },
  { label: "Seeks", minLevel: 48, maxLevel: 48 },
  { label: "SHALL", minLevel: 56, maxLevel: 56 },
  { label: "Sniffles", minLevel: 16, maxLevel: 16 },
  { label: "Some other piece", minLevel: 58, maxLevel: 58 },
  { label: "Stomples", minLevel: 63, maxLevel: 63 },
  { label: "Teence the Naysayer", minLevel: 45, maxLevel: 45 },
  { label: "Three", minLevel: 50, maxLevel: 50 },
  { label: "Treasure Chest", minLevel: 51, maxLevel: 51 },
  { label: "TwentyTwo", minLevel: 53, maxLevel: 60 },
  { label: "Two", minLevel: 50, maxLevel: 50 },
  { label: "Uuuz", minLevel: 51, maxLevel: 51 },
  { label: "Vinny V. D`vicci", minLevel: 48, maxLevel: 48 },
  { label: "Vive", minLevel: 48, maxLevel: 48 },
  { label: "Vour", minLevel: 52, maxLevel: 52 },
  { label: "Vun", minLevel: 52, maxLevel: 52 },
  { label: "Walnut", minLevel: 55, maxLevel: 55 },
  { label: "YOU", minLevel: 56, maxLevel: 56 },
  { label: "Zero", minLevel: 50, maxLevel: 50 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:plane-of-mischief:${slug(mob.label)}`;
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
  addEdge(id, "zone:plane-of-mischief", "located_in");
  added++;
}

save();
console.log(`Migration 310 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:plane-of-mischief`);
