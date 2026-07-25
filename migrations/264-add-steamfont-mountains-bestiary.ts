/**
 * Migration 264: add mob nodes for zone:steamfont-mountains, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue
 * #36.
 *
 * `Category:Steamfont Mountains` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 67
 * `{{Namedmobpage}}` candidates: the zone's wildlife (rats, spiderlings,
 * pumas, mountain lions, coyotes), the kobold camps (Clan Grikbar/Clan
 * Kolbok), an undead cluster (gnome/dwarf skeletons), the Rogue Clockwork
 * faction (clockwork spiders, cleaners, the Cargo/Runaway Clockworks), the
 * minotaur slaver-cave roster (Meldrath The Malignant and his Minotaur
 * Guard/Sentry/Lord/Hero ranks), young/lesser drake variants, and a long
 * roster of standalone named NPCs (several factions' watchmen and
 * spellcasters -- Gem Choppers, Eldritch Collective, Deep Muses, Faydark's
 * Champions). Every candidate carries a stated numeric level and a `zone`
 * field either naming Steamfont Mountains directly or co-listing it
 * alongside other zones with no contradiction, so none were excluded as
 * miscategorized. Unlike this batch's Rathe Mountains/Surefall Glade
 * zones, no city and no guildmasters here, so no CLAUDE.md exclusion
 * applies either.
 *
 * "A Decaying Skeleton" is the one candidate carried over from the Rathe
 * Mountains batch (migration 260) instead of sourced fresh here: its
 * `level` field's only per-zone breakout is "(Steamfont Mountains)" with a
 * 7-10 range, which is what's recorded below rather than the field's bare
 * leading "1" (that unqualified value covers whichever zone the wiki's
 * shared page defaults to, not Steamfont specifically).
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const MOBS = [
  { label: "A skeleton", minLevel: 4, maxLevel: 18 },
  { label: "A Decaying Skeleton", minLevel: 7, maxLevel: 10 },
  { label: "A minotaur slaver", minLevel: 9, maxLevel: 11 },
  { label: "A Spiderling", minLevel: 1, maxLevel: 4 },
  { label: "A Kobold Scout", minLevel: 3, maxLevel: 5 },
  { label: "An Earth Elemental", minLevel: 9, maxLevel: 17 },
  { label: "A Decaying Gnome Skeleton", minLevel: 1, maxLevel: 1 },
  { label: "A Lesser Ebon Drake", minLevel: 8, maxLevel: 10 },
  { label: "A Gnome Skeleton", minLevel: 1, maxLevel: 1 },
  { label: "A Runaway Clockwork", minLevel: 1, maxLevel: 1 },
  { label: "A Harpy", minLevel: 9, maxLevel: 11 },
  { label: "A Kobold Missionary", minLevel: 26, maxLevel: 26 },
  { label: "A Puma", minLevel: 5, maxLevel: 10 },
  { label: "A Mountain Lion", minLevel: 7, maxLevel: 7 },
  { label: "A Giant Spider", minLevel: 7, maxLevel: 9 },
  { label: "A Female Rat", minLevel: 5, maxLevel: 7 },
  { label: "A Large Rat", minLevel: 1, maxLevel: 1 },
  { label: "A kobold runt (Steamfont)", minLevel: 1, maxLevel: 1 },
  { label: "A kobold shaman (Steamfont)", minLevel: 6, maxLevel: 6 },
  { label: "An ebon drakeling", minLevel: 5, maxLevel: 5 },
  { label: "A steam elemental", minLevel: 9, maxLevel: 10 },
  { label: "A giant diseased rat", minLevel: 8, maxLevel: 8 },
  { label: "A young plague rat", minLevel: 2, maxLevel: 2 },
  { label: "A large plague rat", minLevel: 8, maxLevel: 8 },
  { label: "A young ebon drake", minLevel: 8, maxLevel: 8 },
  { label: "A small coyote", minLevel: 3, maxLevel: 3 },
  { label: "A brittle skeleton", minLevel: 9, maxLevel: 10 },
  { label: "A Gnome Slave", minLevel: 3, maxLevel: 3 },
  { label: "A small mountain lion", minLevel: 3, maxLevel: 6 },
  { label: "Berinsan", minLevel: 8, maxLevel: 8 },
  { label: "Minotaur Hero", minLevel: 35, maxLevel: 35 },
  { label: "Minotaur Lord", minLevel: 30, maxLevel: 30 },
  { label: "Meldrath The Malignant", minLevel: 35, maxLevel: 35 },
  { label: "Feddi Dooger", minLevel: 11, maxLevel: 11 },
  { label: "Cargo Clockwork", minLevel: 30, maxLevel: 30 },
  { label: "Rogue Clockwork", minLevel: 3, maxLevel: 9 },
  { label: "Runaway Clockwork", minLevel: 1, maxLevel: 1 },
  { label: "Jogl Doobraugh", minLevel: 33, maxLevel: 33 },
  { label: "Bugglegupp", minLevel: 10, maxLevel: 10 },
  { label: "Minotaur Guard", minLevel: 25, maxLevel: 25 },
  { label: "Minotaur Sentry", minLevel: 30, maxLevel: 30 },
  { label: "Forpar Fizfla", minLevel: 51, maxLevel: 51 },
  { label: "Genda Minyte", minLevel: 2, maxLevel: 2 },
  { label: "Lodrand Dindlenod", minLevel: 7, maxLevel: 7 },
  { label: "Phiz Frugrin", minLevel: 25, maxLevel: 25 },
  { label: "Thetherthag Wakintrob", minLevel: 7, maxLevel: 7 },
  { label: "Watchman Dreeb", minLevel: 50, maxLevel: 50 },
  { label: "Watchman Grep", minLevel: 35, maxLevel: 35 },
  { label: "Tindo Frugrin", minLevel: 30, maxLevel: 30 },
  { label: "Legyn Sarawyn", minLevel: 7, maxLevel: 8 },
  { label: "Dimlore Stormhammer", minLevel: 8, maxLevel: 8 },
  { label: "Frebin Tinderhue", minLevel: 25, maxLevel: 25 },
  { label: "Charlotte", minLevel: 35, maxLevel: 35 },
  { label: "Crusader Swiftmoon", minLevel: 28, maxLevel: 28 },
  { label: "Nilit's contraption", minLevel: 20, maxLevel: 21 },
  { label: "Brona Frugrin", minLevel: 35, maxLevel: 35 },
  { label: "Diseased female rat", minLevel: 5, maxLevel: 5 },
  { label: "Driver Bryggin", minLevel: 10, maxLevel: 10 },
  { label: "Nilit Druzlit", minLevel: 35, maxLevel: 35 },
  { label: "Rogue cleaner", minLevel: 2, maxLevel: 2 },
  { label: "Watchman Mylz", minLevel: 35, maxLevel: 35 },
  { label: "Watchman Prenn", minLevel: 50, maxLevel: 50 },
  { label: "Watchman Prynn", minLevel: 50, maxLevel: 50 },
  { label: "Winex Kloktik", minLevel: 12, maxLevel: 12 },
  { label: "Watchman Halv", minLevel: 35, maxLevel: 35 },
  { label: "Zondo Hyzill", minLevel: 25, maxLevel: 25 },
  { label: "Yendar Starpyre", minLevel: 65, maxLevel: 65 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:steamfont-mountains:${slug(mob.label)}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:steamfont-mountains", "located_in");
}

save();
console.log(`Migration 264 complete: ${added} mob node(s) added to zone:steamfont-mountains`);
