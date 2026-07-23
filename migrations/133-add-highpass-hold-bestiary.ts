/**
 * Migration 133: add mob nodes for zone:highpass-hold, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced from eqlwiki.com's Highpass Hold NPC table: gnoll/orc trash and
 * named Shralok-clan orcs (a hostile faction also seen in Kithicor
 * Forest), plus the zone's own bandit/smuggler-ring rogues (map legend
 * item #5's "Bandit Camp", item #4's smuggler tunnel) -- excluded are the
 * zone's many "Qeynos Citizen Merchant" rows, guards, quest-giver
 * captains, and rogue trainers/guildmasters (Anson McBale, Cyrla
 * Shadowstepper), none of which are combat targets.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:highpass-hold";

const MOBS = [
  { slug: "gnoll-brawler", label: "A Gnoll Brawler", minLevel: 13, maxLevel: 15 },
  { slug: "gnoll", label: "A Gnoll", minLevel: 9, maxLevel: 10 },
  { slug: "gnoll-champion", label: "A Gnoll Champion", minLevel: 16, maxLevel: 16 },
  { slug: "gnoll-flamepaw", label: "A Gnoll Flamepaw", minLevel: 18, maxLevel: 18 },
  { slug: "gnoll-shaman", label: "A Gnoll Shaman", minLevel: 7, maxLevel: 11 },
  { slug: "gnoll-soothsayer", label: "A Gnoll Soothsayer", minLevel: 16, maxLevel: 16 },
  { slug: "orc-acolyte", label: "An Orc Acolyte", minLevel: 14, maxLevel: 14 },
  { slug: "orc-berserker", label: "An Orc Berserker", minLevel: 12, maxLevel: 14 },
  { slug: "orc-conscript", label: "An Orc Conscript", minLevel: 12, maxLevel: 15 },
  { slug: "orc-medic", label: "An Orc Medic", minLevel: 15, maxLevel: 18 },
  { slug: "orc-scout", label: "An Orc Scout", minLevel: 15, maxLevel: 15 },
  { slug: "orc-warrior", label: "An Orc Warrior", minLevel: 6, maxLevel: 18 },
  { slug: "orc-fanatic", label: "An Orc Fanatic", minLevel: 19, maxLevel: 21 },
  { slug: "orc-mercenary", label: "An Orc Mercenary", minLevel: 18, maxLevel: 20 },
  { slug: "orc-soldier", label: "An Orc Soldier", minLevel: 12, maxLevel: 12 },
  { slug: "grenix-mucktail", label: "Grenix Mucktail", minLevel: 20, maxLevel: 20 },
  { slug: "vexven-mucktail", label: "Vexven Mucktail", minLevel: 21, maxLevel: 21 },
  { slug: "grigga-shralok", label: "Grigga Shralok", minLevel: 12, maxLevel: 12 },
  { slug: "hagnis-shralok", label: "Hagnis Shralok", minLevel: 21, maxLevel: 21 },
  { slug: "kladnog-shralok", label: "Kladnog Shralok", minLevel: 11, maxLevel: 11 },
  { slug: "recfek-shralok", label: "Recfek Shralok", minLevel: 21, maxLevel: 21 },
  { slug: "vopuk-shralok", label: "Vopuk Shralok", minLevel: 15, maxLevel: 22 },
  { slug: "burgek", label: "Burgek", minLevel: 18, maxLevel: 18 },
  { slug: "beef", label: "Beef", minLevel: 40, maxLevel: 40 },
  { slug: "breck-damison", label: "Breck Damison", minLevel: 22, maxLevel: 22 },
  { slug: "brenon", label: "Brenon", minLevel: 11, maxLevel: 11 },
  { slug: "bryan", label: "Bryan", minLevel: 40, maxLevel: 40 },
  { slug: "bryan-mcgee", label: "Bryan McGee", minLevel: 40, maxLevel: 40 },
  { slug: "crenn-salbet", label: "Crenn Salbet", minLevel: 38, maxLevel: 38 },
  { slug: "dalishea", label: "Dalishea", minLevel: 17, maxLevel: 17 },
  { slug: "kaden-gron", label: "Kaden Gron", minLevel: 31, maxLevel: 31 },
  { slug: "lylea", label: "Lylea", minLevel: 17, maxLevel: 17 },
  { slug: "prak", label: "Prak", minLevel: 27, maxLevel: 27 },
  { slug: "wres-corber", label: "Wres Corber", minLevel: 34, maxLevel: 34 },
  { slug: "mutt-rootlit", label: "Mutt Rootlit", minLevel: 5, maxLevel: 5 },
  { slug: "cytodl-krish", label: "Cytodl Krish", minLevel: 25, maxLevel: 25 },
  { slug: "greth-truksorn", label: "Greth Truksorn", minLevel: 15, maxLevel: 15 },
  { slug: "swiftfingers", label: "Swiftfingers", minLevel: 15, maxLevel: 17 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:highpass-hold:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 133 complete: ${added} mob node(s) added for Highpass Hold`);
