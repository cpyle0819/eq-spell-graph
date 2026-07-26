/**
 * Migration 267: add item nodes for gear introduced by 2026's revamps of
 * Blackburrow (2026-06-09), Crushbone (2026-07-14), Najena (2026-06-23), and
 * Splitpaw Lair (2026-07-14) -- eqlwiki.com/Patch_Notes and each zone's own
 * page. Feeds the leveling guide's new zone-revamp trail (issue-driven
 * rewrite, see public/leveling-guide.html).
 *
 * Introduces `npc --drops--> item`: eqlwiki's own zone pages tie some of
 * these directly to the boss that drops them (Shiny Brass Shield/Orc
 * Trainer, Dwarven Ringmail Tunic/Emperor Crush, both Najena robe+tome
 * drops/Najena herself, Verishe Mal Greataxe/Verishe Mal Executioner, Robe
 * of the Ishva/The Ishva Mal) -- a real relationship this graph had no edge
 * for (decisions/edge-semantics.md only had item provenance via quest
 * `rewards`). Blackburrow's three drops and Splitpaw's Gnoll Hide Tome have
 * no wiki-stated dropper, so they only get `located_in`, reusing that edge
 * type for an `item` source the same way `quest --located_in--> zone`
 * already reuses it for a non-npc source.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ITEMS: {
  id: string;
  label: string;
  zone: string;
  dropper?: string;
  details: Record<string, unknown>;
}[] = [
  {
    id: "item:runed-totem-staff",
    label: "Runed Totem Staff",
    zone: "zone:blackburrow",
    details: { slots: ["Primary"], skill: "2H Blunt", damage: 9, delay: 37, hp: 5, mana: 5, source: "Blackburrow drop" },
  },
  {
    id: "item:keg-mallet",
    label: "Keg Mallet",
    zone: "zone:blackburrow",
    details: { slots: ["Primary"], skill: "1H Blunt", source: "Blackburrow drop" },
  },
  {
    id: "item:sabertooth-short-bow",
    label: "Sabertooth Short Bow",
    zone: "zone:blackburrow",
    details: { slots: ["Ranged"], skill: "Bow", source: "Blackburrow drop" },
  },
  {
    id: "item:shiny-brass-shield",
    label: "Shiny Brass Shield",
    zone: "zone:crushbone",
    dropper: "mob:crushbone:orc-trainer",
    details: { slots: ["Secondary"], ac: 10, resists: { magic: 10 }, source: "Orc Trainer (Crushbone)" },
  },
  {
    id: "item:dwarven-ringmail-tunic",
    label: "Dwarven Ringmail Tunic",
    zone: "zone:crushbone",
    dropper: "mob:crushbone:emperor-crush",
    details: { slots: ["Chest"], source: "Emperor Crush (Crushbone)" },
  },
  {
    id: "item:flowing-black-robe",
    label: "Flowing Black Robe",
    zone: "zone:najena",
    dropper: "mob:najena:najena-npc",
    details: { slots: ["Chest"], source: "Najena (Najena)" },
  },
  {
    id: "item:black-tome-with-silver-runes",
    label: "Black Tome with Silver Runes",
    zone: "zone:najena",
    dropper: "mob:najena:najena-npc",
    details: { source: "Najena (Najena)" },
  },
  {
    id: "item:verishe-mal-greataxe",
    label: "Verishe Mal Greataxe",
    zone: "zone:splitpaw-lair",
    dropper: "mob:splitpaw:verishe-mal-executioner",
    details: { slots: ["Primary"], skill: "2H Slashing", damage: 26, source: "Verishe Mal Executioner (Splitpaw Lair)" },
  },
  {
    id: "item:robe-of-the-ishva",
    label: "Robe of the Ishva",
    zone: "zone:splitpaw-lair",
    dropper: "mob:splitpaw:the-ishva-mal",
    details: { slots: ["Chest"], mana: 50, source: "The Ishva Mal (Splitpaw Lair)" },
  },
  {
    id: "item:gnoll-hide-tome",
    label: "Gnoll Hide Tome",
    zone: "zone:splitpaw-lair",
    details: { stats: { int: 10, wis: 5 }, source: "Splitpaw Lair drop" },
  },
];

let added = 0;
for (const item of ITEMS) {
  if (!hasNode(item.id)) added++;
  addNode({ id: item.id, label: item.label, type: "item", magic: true, lore: true, ...item.details });
  addEdge(item.id, item.zone, "located_in");
  if (item.dropper) addEdge(item.dropper, item.id, "drops");
}

save();
console.log(`Migration 267 complete: ${added} item node(s) added across Blackburrow/Crushbone/Najena/Splitpaw Lair`);
