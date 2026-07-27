/**
 * Migration 290: add npc nodes (roles: ["mob"]) for zone:the-overthere,
 * per the unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #36.
 *
 * `Category:The Overthere` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 58
 * `{{Namedmobpage}}` candidates: the evil-race outpost's dragoons/generals
 * (General V`Deers' nightly patrol, Admiral Tylix, the Dragoon roster),
 * cliff golems, the scorpiki-chasm cluster, cockatrices/succulents/Kunark
 * rhinos, undead constructs (foreman/marine/herald), and a Monk Epic
 * Quest NPC (Astral Projection).
 *
 * Two exclusions:
 * - "Bloated Belly" has no numeric level (`"You can't consider that."`)
 *   and no `zone` field at all -- its own description confirms it's the
 *   ferry boat to Timorous Deep, not a creature, same call as prior
 *   batches' excluded "A Boat".
 * - "Dyth X`Teria" is a `GM [[Wizard]]` guildmaster -- excluded per
 *   CLAUDE.md, same call as South Qeynos/Qeynos Catacombs.
 *
 * "Tin Banker I"/"Tin Banker II"/"Tin Banker Assistant" carry a `Banker`
 * class tag but are actually hostile Clockwork Gnome constructs with full
 * AC 279/HP 2000/32-124 damage stat blocks and a negative Venril Sathir
 * faction hit on death -- kept per the established "stats over name" rule
 * (Runnyeye Citadel's "A goblin banker" precedent), not excluded as
 * civic-utility NPCs.
 *
 * "Sabretooth Tigress"/"A Sabertooth Tigress"/"Sabretooth Tiger" are three
 * distinct pages (different level ranges, one shared with Trakanon's
 * Teeth, one with Lake of Ill Omen) despite similar names -- all three
 * kept as separate creatures, their own `zone` fields explicitly co-list
 * The Overthere alongside the other zone each appears in.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const ID_OVERRIDES: Record<string, string> = {
  "Astral Projection (Overthere)": "npc:the-overthere:astral-projection",
};
const LABEL_OVERRIDES: Record<string, string> = {
  "Astral Projection (Overthere)": "Astral Projection",
};

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Captain Rottgrime", minLevel: 55, maxLevel: 55 },
  { label: "Admiral Tylix", minLevel: 59, maxLevel: 59 },
  { label: "Corundium", minLevel: 50, maxLevel: 50 },
  { label: "General V`Deers", minLevel: 58, maxLevel: 58 },
  { label: "Dragoon V`Resh", minLevel: 50, maxLevel: 50 },
  { label: "Slicia J`Singe", minLevel: 49, maxLevel: 49 },
  { label: "Dragoon Barber W`Selo", minLevel: 50, maxLevel: 50 },
  { label: "Dragoon T`Vem", minLevel: 50, maxLevel: 50 },
  { label: "Dragoon V`Lask", minLevel: 50, maxLevel: 50 },
  { label: "Dragoon T`Vex", minLevel: 50, maxLevel: 50 },
  { label: "Impaler Tzilug", minLevel: 50, maxLevel: 50 },
  { label: "Iron Sentinel", minLevel: 50, maxLevel: 50 },
  { label: "Scorpikis Guardian", minLevel: 44, maxLevel: 45 },
  { label: "Stishovite", minLevel: 50, maxLevel: 50 },
  { label: "Tektite", minLevel: 50, maxLevel: 50 },
  { label: "Tin Banker I", minLevel: 40, maxLevel: 40 },
  { label: "Tin Banker II", minLevel: 40, maxLevel: 40 },
  { label: "Tin Banker Assistant", minLevel: 40, maxLevel: 40 },
  { label: "Tourmaline", minLevel: 50, maxLevel: 50 },
  { label: "Kurron Ni", minLevel: 54, maxLevel: 54 },
  { label: "A Cliff Golem", minLevel: 58, maxLevel: 58 },
  { label: "A Sarnak Knight", minLevel: 33, maxLevel: 37 },
  { label: "Sabretooth Tigress", minLevel: 30, maxLevel: 34 },
  { label: "A Sabertooth Tigress", minLevel: 14, maxLevel: 16 },
  { label: "Sabretooth Tiger", minLevel: 35, maxLevel: 39 },
  { label: "A Kunark rhino", minLevel: 16, maxLevel: 35 },
  { label: "A spiked succulent", minLevel: 32, maxLevel: 36 },
  { label: "A thorny succulent", minLevel: 29, maxLevel: 33 },
  { label: "A scorpikis scrounger", minLevel: 34, maxLevel: 34 },
  { label: "A stonepeep cockatrice", minLevel: 16, maxLevel: 16 },
  { label: "Drixiv Arcut", minLevel: 50, maxLevel: 50 },
  { label: "Xlixinar Arcut", minLevel: 50, maxLevel: 50 },
  { label: "An undead foreman", minLevel: 50, maxLevel: 50 },
  { label: "Zorash", minLevel: 37, maxLevel: 37 },
  { label: "Gogu the Smasher", minLevel: 61, maxLevel: 61 },
  { label: "A scorpikis", minLevel: 36, maxLevel: 37 },
  { label: "A skeleton worker", minLevel: 29, maxLevel: 33 },
  { label: "A stoneglint cockatrice", minLevel: 19, maxLevel: 20 },
  { label: "Modani Qu`Loni", minLevel: 55, maxLevel: 55 },
  { label: "A glowing cliff golem", minLevel: 55, maxLevel: 55 },
  { label: "A barbed succulent", minLevel: 19, maxLevel: 19 },
  { label: "A prickly succulent", minLevel: 15, maxLevel: 17 },
  { label: "A bristly succulent", minLevel: 12, maxLevel: 12 },
  { label: "Astral Projection (Overthere)", minLevel: 50, maxLevel: 50 },
  { label: "A Sarnak berzerker", minLevel: 29, maxLevel: 33 },
  { label: "A stoneleer cockatrice", minLevel: 29, maxLevel: 33 },
  { label: "Galdon Vok Nir", minLevel: 15, maxLevel: 15 },
  { label: "An undead marine", minLevel: 50, maxLevel: 50 },
  { label: "Alchemist Granika", minLevel: 25, maxLevel: 25 },
  { label: "An undead herald", minLevel: 29, maxLevel: 32 },
  { label: "Brinaa Darkpact", minLevel: 48, maxLevel: 48 },
  { label: "Bukuku Wolffeetz", minLevel: 48, maxLevel: 48 },
  { label: "Iron guardian", minLevel: 50, maxLevel: 50 },
  { label: "Siladdarae N`Riese", minLevel: 49, maxLevel: 49 },
  { label: "Utandar Rizndown", minLevel: 40, maxLevel: 40 },
  { label: "Vaean the Night", minLevel: 49, maxLevel: 49 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = ID_OVERRIDES[mob.label] ?? `npc:the-overthere:${slug(mob.label)}`;
  const label = LABEL_OVERRIDES[mob.label] ?? mob.label;

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
  addEdge(id, "zone:the-overthere", "located_in");
  added++;
}

save();
console.log(`Migration 290 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:the-overthere`);
