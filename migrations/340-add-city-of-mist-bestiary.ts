/**
 * Migration 340: add npc nodes (roles: ["mob"]) for zone:city-of-mist, per
 * the unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #41
 * (data-quality audit flagged this zone as having zero NPCs of any kind).
 *
 * `Category:City of Mist` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 24
 * `{{Namedmobpage}}` candidates, all confirmed by their own `zone` field
 * (several shared with Dreadlands/Emerald Jungle/Howling Stones as generic
 * golem/skeleton mobs). "Captain of the Guard" doesn't match the
 * `/^(A |An )?Guard /` guard-role pattern (decisions/npc-mob-unification-
 * and-zone-groups.md) so stays a plain `mob`, same as any other named
 * combat NPC. "Greater war boned skeleton (City of Mist)" -- wiki page
 * title disambiguator stripped for the in-game label.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:city-of-mist";

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "A black reaver", minLevel: 48, maxLevel: 52 },
  { label: "Lord Rak`Ashiir", minLevel: 54, maxLevel: 54 },
  { label: "Lord Ghiosk", minLevel: 53, maxLevel: 53 },
  { label: "Neh`Ashiir", minLevel: 54, maxLevel: 54 },
  { label: "Wraith of Jaxion", minLevel: 45, maxLevel: 45 },
  { label: "An army behemoth", minLevel: 42, maxLevel: 42 },
  { label: "Spectral courier", minLevel: 35, maxLevel: 35 },
  { label: "Gyrating goo", minLevel: 35, maxLevel: 47 },
  { label: "A phantom", minLevel: 39, maxLevel: 43 },
  { label: "Greater plaguebone", minLevel: 39, maxLevel: 43 },
  { label: "A haze golem", minLevel: 33, maxLevel: 36 },
  { label: "A vapor golem", minLevel: 36, maxLevel: 40 },
  { label: "A fog golem", minLevel: 39, maxLevel: 43 },
  { label: "Greater Spurbone", minLevel: 36, maxLevel: 40 },
  { label: "An apparition", minLevel: 36, maxLevel: 40 },
  { label: "Lhranc", minLevel: 60, maxLevel: 60 },
  { label: "A wraith", minLevel: 42, maxLevel: 46 },
  { label: "A mist golem", minLevel: 42, maxLevel: 46 },
  { label: "Plaguebone skeleton", minLevel: 33, maxLevel: 37 },
  { label: "Spurbone skeleton", minLevel: 31, maxLevel: 34 },
  { label: "Captain of the Guard", minLevel: 33, maxLevel: 33 },
  { label: "A human skeleton", minLevel: 39, maxLevel: 40 },
  { label: "A shadow", minLevel: 34, maxLevel: 38 },
  { label: "Greater war boned skeleton", minLevel: 42, maxLevel: 46 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:city-of-mist:${slug(mob.label)}`;
  if (hasNode(id)) {
    merged++;
    continue;
  }
  addNode({ id, label: mob.label, type: "npc", roles: ["mob"], minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
  added++;
}

save();
console.log(`Migration 340 complete: ${added} npc node(s) added, ${merged} already present, for zone:city-of-mist`);
