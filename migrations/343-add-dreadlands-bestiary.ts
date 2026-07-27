/**
 * Migration 343: add npc nodes (roles: ["mob"]) for zone:dreadlands, per
 * the unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md).
 *
 * Not on issue #41's original checklist -- migration 332 added this zone's
 * map after the audit was filed, and a re-run of `scripts/audit-zone-npcs.ts`
 * caught it fresh as an open-world zone with 0 mobs. Same audit theme,
 * folded into this pass rather than a separate issue.
 *
 * `Category:Dreadlands` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 32
 * `{{Namedmobpage}}` candidates. "Frosti Bramblebrew" excluded: `level` and
 * `class` are both a bare `??` with no numeric endpoint anywhere, the same
 * "no lower bound at all means excluded" precedent as prior zones.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:dreadlands";

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Brother Balatin", minLevel: 28, maxLevel: 28 },
  { label: "Gorenaire", minLevel: 60, maxLevel: 60 },
  { label: "A mountain giant patriarch", minLevel: 44, maxLevel: 44 },
  { label: "Gem cutter skeleton", minLevel: 25, maxLevel: 25 },
  { label: "A Drolvarg Snarler", minLevel: 32, maxLevel: 36 },
  { label: "A Drolvarg Growler", minLevel: 29, maxLevel: 33 },
  { label: "A Tundra Yeti", minLevel: 31, maxLevel: 35 },
  { label: "A Drolvarg Rager", minLevel: 37, maxLevel: 41 },
  { label: "Greater plaguebone", minLevel: 39, maxLevel: 43 },
  { label: "Rotting skeleton", minLevel: 43, maxLevel: 43 },
  { label: "A Drolvarg Gnasher", minLevel: 34, maxLevel: 38 },
  { label: "A Glacier Yeti", minLevel: 36, maxLevel: 40 },
  { label: "A dread widow", minLevel: 47, maxLevel: 49 },
  { label: "Greater Spurbone", minLevel: 36, maxLevel: 40 },
  { label: "A Drachnid Recluse", minLevel: 36, maxLevel: 40 },
  { label: "A Drachnid Webmaster", minLevel: 33, maxLevel: 37 },
  { label: "A Drachnid Widow", minLevel: 36, maxLevel: 40 },
  { label: "A Mountain Giant Craig", minLevel: 33, maxLevel: 37 },
  { label: "A mountain giant brae", minLevel: 30, maxLevel: 34 },
  { label: "A Mountain Giant Steep", minLevel: 36, maxLevel: 40 },
  { label: "Plaguebone skeleton", minLevel: 33, maxLevel: 37 },
  { label: "A Ravishing Drolvarg", minLevel: 40, maxLevel: 44 },
  { label: "A Plaguebone Thief", minLevel: 37, maxLevel: 37 },
  { label: "A Voracious Brute", minLevel: 36, maxLevel: 40 },
  { label: "A stonegazer cockatrice", minLevel: 33, maxLevel: 37 },
  { label: "A wulfware lonewolf", minLevel: 35, maxLevel: 36 },
  { label: "Wraithbone champion", minLevel: 42, maxLevel: 45 },
  { label: "A stoneleer cockatrice", minLevel: 29, maxLevel: 33 },
  { label: "A petrifier cockatrice", minLevel: 37, maxLevel: 41 },
  { label: "Baldric Slezaf", minLevel: 55, maxLevel: 55 },
  { label: "A Drachnid Silkmistress", minLevel: 33, maxLevel: 37 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:dreadlands:${slug(mob.label)}`;
  if (hasNode(id)) {
    merged++;
    continue;
  }
  addNode({ id, label: mob.label, type: "npc", roles: ["mob"], minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
  added++;
}

save();
console.log(`Migration 343 complete: ${added} npc node(s) added, ${merged} already present, for zone:dreadlands`);
