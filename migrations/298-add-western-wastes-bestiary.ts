/**
 * Migration 298: add npc nodes (roles: ["mob"]) for zone:western-wastes,
 * per the unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #36.
 *
 * `Category:Western Wastes` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 77
 * `{{Namedmobpage}}` candidates: this zone is almost entirely a named
 * dragon roster (Klandicar/Sontalak guarding the Temple of Veeshan
 * entrance, the Sapara dragon family, egg-nest guardians, and dozens more)
 * plus a Kromzek/Claws of Veeshan camp and general wildlife (drakes,
 * wyverns, mastodons, brontotheriums).
 *
 * One exclusion: "Bloodpriest Ioukond" carries the Western Wastes category
 * tag but its own `zone` field names only Wakening Lands (a Velium Focus
 * quest NPC that spawns there, not here) -- same miscategorized-candidate
 * pattern as Lower Guk's excluded "A froglok tsu shaman".
 *
 * "Makil Rargon"/"Melalafen"/"The Dragon Sage"/"Harla Dar" already existed
 * as `npc:` quest-giver nodes -- same both-roles-legitimate shape as The
 * Warrens' Aderius Rhenar/Koajin, so this batch unions the `mob` role and
 * level data onto them rather than skipping. "A drake"/"A wyvern"/"An
 * elder wyvern" carry a disambiguating zone suffix in their own page
 * titles (generic names also exist elsewhere); label stored without it,
 * id keeps the zone namespace anyway.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Makil Rargon", minLevel: 50, maxLevel: 50 },
  { label: "Guardian Kozzalym", minLevel: 55, maxLevel: 55 },
  { label: "Melalafen", minLevel: 65, maxLevel: 65 },
  { label: "Klandicar", minLevel: 70, maxLevel: 70 },
  { label: "Gangel", minLevel: 51, maxLevel: 51 },
  { label: "Sontalak", minLevel: 70, maxLevel: 70 },
  { label: "The Dragon Sage", minLevel: 60, maxLevel: 60 },
  { label: "Breezeboot Swordrattler", minLevel: 61, maxLevel: 61 },
  { label: "Tranala", minLevel: 66, maxLevel: 66 },
  { label: "Shardwing Courier", minLevel: 50, maxLevel: 50 },
  { label: "Esorpa of the Ring", minLevel: 53, maxLevel: 53 },
  { label: "Draazak", minLevel: 58, maxLevel: 58 },
  { label: "Honvar", minLevel: 52, maxLevel: 52 },
  { label: "Pantrilla", minLevel: 53, maxLevel: 53 },
  { label: "Ionat", minLevel: 56, maxLevel: 56 },
  { label: "Nintal", minLevel: 54, maxLevel: 54 },
  { label: "Amcilla", minLevel: 53, maxLevel: 53 },
  { label: "Gafala", minLevel: 52, maxLevel: 52 },
  { label: "Atpaev", minLevel: 51, maxLevel: 51 },
  { label: "Entariz", minLevel: 57, maxLevel: 57 },
  { label: "Vraptin", minLevel: 53, maxLevel: 53 },
  { label: "Yal", minLevel: 52, maxLevel: 52 },
  { label: "Linbrak", minLevel: 53, maxLevel: 53 },
  { label: "Jen Sapara", minLevel: 62, maxLevel: 62 },
  { label: "Glati", minLevel: 54, maxLevel: 54 },
  { label: "Cargalia", minLevel: 57, maxLevel: 57 },
  { label: "Vitaela", minLevel: 53, maxLevel: 53 },
  { label: "Yeldema", minLevel: 52, maxLevel: 52 },
  { label: "Karkona", minLevel: 57, maxLevel: 57 },
  { label: "Mazi", minLevel: 54, maxLevel: 54 },
  { label: "Hechaeva", minLevel: 54, maxLevel: 54 },
  { label: "Neordla", minLevel: 57, maxLevel: 57 },
  { label: "Quoza", minLevel: 54, maxLevel: 54 },
  { label: "Von", minLevel: 57, maxLevel: 57 },
  { label: "Harla Dar", minLevel: 66, maxLevel: 66 },
  { label: "Sivar", minLevel: 53, maxLevel: 53 },
  { label: "Del Sapara", minLevel: 60, maxLevel: 60 },
  { label: "Kar Sapara", minLevel: 60, maxLevel: 60 },
  { label: "Mav Sapara", minLevel: 60, maxLevel: 60 },
  { label: "Rak Sapara", minLevel: 59, maxLevel: 59 },
  { label: "Zil Sapara", minLevel: 60, maxLevel: 60 },
  { label: "Bufa", minLevel: 54, maxLevel: 54 },
  { label: "Onava", minLevel: 54, maxLevel: 54 },
  { label: "Bratavar", minLevel: 53, maxLevel: 53 },
  { label: "Scout Charisa", minLevel: 55, maxLevel: 55 },
  { label: "Tantor", minLevel: 66, maxLevel: 66 },
  { label: "Derasinal", minLevel: 57, maxLevel: 57 },
  { label: "Icehackle", minLevel: 61, maxLevel: 61 },
  { label: "Makala", minLevel: 51, maxLevel: 51 },
  { label: "Ayillish", minLevel: 57, maxLevel: 57 },
  { label: "A rogue dire wolf", minLevel: 48, maxLevel: 50 },
  { label: "A velium hound", minLevel: 49, maxLevel: 49 },
  { label: "Tsiraka", minLevel: 66, maxLevel: 66 },
  { label: "Uiliak", minLevel: 53, maxLevel: 53 },
  { label: "Mraaka", minLevel: 66, maxLevel: 66 },
  { label: "A Kromzek Captain", minLevel: 58, maxLevel: 58 },
  { label: "Travala", minLevel: 66, maxLevel: 66 },
  { label: "A gravid drake", minLevel: 46, maxLevel: 46 },
  { label: "A cragwyrm", minLevel: 52, maxLevel: 52 },
  { label: "An ice burrower", minLevel: 61, maxLevel: 61 },
  { label: "Strong Horn", minLevel: 65, maxLevel: 65 },
  { label: "A lindwyrm", minLevel: 51, maxLevel: 51 },
  { label: "A Velious Drake", minLevel: 47, maxLevel: 52 },
  { label: "A glacier mastodon", minLevel: 45, maxLevel: 50 },
  { label: "A brontotherium", minLevel: 46, maxLevel: 50 },
  { label: "Crial", minLevel: 54, maxLevel: 54 },
  { label: "A drake (Western Wastes)", minLevel: 47, maxLevel: 47 },
  { label: "A Kromzek warrior", minLevel: 54, maxLevel: 54 },
  { label: "A shipwrecked pirate", minLevel: 50, maxLevel: 50 },
  { label: "A wyvern (Western Wastes)", minLevel: 50, maxLevel: 55 },
  { label: "A wyvern hunter", minLevel: 51, maxLevel: 55 },
  { label: "A wyvern huntress", minLevel: 50, maxLevel: 52 },
  { label: "An elder wyvern (Western Wastes)", minLevel: 50, maxLevel: 54 },
  { label: "Jerigozia", minLevel: 58, maxLevel: 58 },
  { label: "Myga", minLevel: 52, maxLevel: 52 },
  { label: "Veredenia", minLevel: 55, maxLevel: 55 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:western-wastes:${slug(mob.label)}`;
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
  addEdge(id, "zone:western-wastes", "located_in");
  added++;
}

save();
console.log(`Migration 298 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:western-wastes`);
