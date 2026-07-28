/**
 * Migration 360: add eqlwiki.com's full soldby table for Water Flask.
 *
 * Migration 358 reused the existing `item:water-flask` node as an ingredient
 * across dozens of new Brewing recipes and left a note that it's "sold by
 * merchants across many zones," but never actually added those vendor edges
 * -- its own vendor-adding pass only covered newly-authored ingredients, not
 * pre-existing items being reused. That left Water Flask showing only the 4
 * vendors two earlier migrations happened to add for unrelated reasons
 * (migration 323's two unnamed Crystal Caverns "?" merchants, plus two named
 * ones), against a wiki table of 167 rows. Per the same "every vendor, not a
 * capped subset" rule migration 358 already established, this fills that gap.
 *
 * Sourced from Water Flask's own eqlwiki.com raw wikitext (`action=query&
 * prop=revisions`), not WebFetch's summarizer -- its soldby table lists 167
 * rows; two zones (Erud's Crossing, RunnyEye Citadel) aren't catalogued as
 * `zone` nodes in this graph yet and are skipped, same treatment as
 * migration 358's own skip list. Repeated same-name vendors within a zone
 * (e.g. Ak'Anon's four "a clockwork merchant" rows, at different coords the
 * wiki tracks but this graph doesn't) collapse to one npc node -- addEdge's
 * own dedup, same as migration 358's bakery-vendor batch.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

let vendorsAdded = 0;
let sellsEdgesAdded = 0;
const skippedVendors: string[] = [];

const ZONE_ALIASES: Record<string, string> = {
  "Eastern Plains of Karana": "Eastern Karana",
  "Western Plains of Karana": "Western Karana",
  "Felwithe": "Northern Felwithe",
};

function addVendor(vendorLabel: string, zoneLabel: string, sells: string[]) {
  const resolvedZone = ZONE_ALIASES[zoneLabel] ?? zoneLabel;
  const zoneId = `zone:${slug(resolvedZone)}`;
  if (!hasNode(zoneId)) {
    skippedVendors.push(`${vendorLabel} (${zoneLabel}) -- zone not catalogued in this graph`);
    return;
  }
  const vendorId = `npc:${slug(resolvedZone)}:${slug(vendorLabel)}`;
  if (!hasNode(vendorId)) {
    addNode({ id: vendorId, label: vendorLabel, type: "npc", roles: ["vendor"] });
    addEdge(vendorId, zoneId, "located_in");
    vendorsAdded++;
  }
  for (const itemId of sells) {
    addEdge(vendorId, itemId, "sells");
    sellsEdgesAdded++;
  }
}

const WATER_FLASK_VENDORS: [string, string][] = [
  ["Rylin Coil", "Ak'Anon"],
  ["a clockwork grocer", "Ak'Anon"],
  ["a clockwork merchant", "Ak'Anon"],
  ["Iglan Thranon", "Butcherblock Mountains"],
  ["Gamin Griststone", "Butcherblock Mountains"],
  ["Parn Gylwyn", "Butcherblock Mountains"],
  ["Felen Razdal", "Butcherblock Mountains"],
  ["Klok Sweetzie", "East Cabilis"],
  ["Lybar", "West Cabilis"],
  ["Innkeep Roster", "West Commonlands"],
  ["Innkeep Olissa", "West Commonlands"],
  ["Milliace Gemshard", "Crystal Caverns"],
  ["Klok F`tshai", "Dreadlands"],
  ["Paulina", "Eastern Plains of Karana"],
  ["Bradly", "Eastern Plains of Karana"],
  ["Stace", "Eastern Plains of Karana"],
  ["Sorn", "Eastern Plains of Karana"],
  ["Sharna", "Eastern Plains of Karana"],
  ["Iago", "Eastern Plains of Karana"],
  ["Lucetta", "Eastern Plains of Karana"],
  ["Balthazar", "Eastern Plains of Karana"],
  ["Tanrak", "Eastern Plains of Karana"],
  ["Bubar", "East Commonlands"],
  ["Parthar", "East Commonlands"],
  ["Innkeep Harold", "East Commonlands"],
  ["Innkeep Dolman", "East Commonlands"],
  ["Innkeep Juna", "East Commonlands"],
  ["Germe Threadspinner", "East Commonlands"],
  ["Innkeep Blaise", "East Commonlands"],
  ["Beth Breadmaker", "Erudin"],
  ["Helia BlueHawk", "Erudin"],
  ["Teria Finleather", "Erudin"],
  ["Borge Finleather", "Erudin"],
  ["Renna", "Erud's Crossing"],
  ["Innkeep Gub", "The Feerrott"],
  ["Innkeep Morpa", "The Feerrott"],
  ["Kogg", "The Feerrott"],
  ["Rolyn Longwalker", "Felwithe"],
  ["Fishmonger Issa", "Felwithe"],
  ["Merchant Sorintal", "Felwithe"],
  ["Leala Swiftarrow", "Firiona Vie"],
  ["Glinya Sweetpie", "Firiona Vie"],
  ["Rolfic Gohar", "East Freeport"],
  ["Ralfson Gerositan", "East Freeport"],
  ["Innkeep Paggie", "East Freeport"],
  ["Innkeep Rastle", "East Freeport"],
  ["Innkeep Nasumi", "East Freeport"],
  ["Innkeep Hunter", "East Freeport"],
  ["Winda Lylil", "East Freeport"],
  ["Henna Treghost", "East Freeport"],
  ["Gregor Nasin", "East Freeport"],
  ["Rashinda Elore", "North Freeport"],
  ["Gern Tassel", "North Freeport"],
  ["Gibbon Morfield", "North Freeport"],
  ["Yellus Gravien", "North Freeport"],
  ["Tradesman Lyna", "North Freeport"],
  ["Tradesman Tulan", "North Freeport"],
  ["Innkeep Palola", "North Freeport"],
  ["Bran Greenglade", "North Freeport"],
  ["Alec Greenglade", "North Freeport"],
  ["Innkeep Rille", "North Freeport"],
  ["Innkeep Evelona", "North Freeport"],
  ["Merchant Weaolanae", "Greater Faydark"],
  ["Merchant Kanoldar", "Greater Faydark"],
  ["Innkeep Anisyla", "Greater Faydark"],
  ["Innkeep Wuleran", "Greater Faydark"],
  ["Innkeep Larya", "Greater Faydark"],
  ["Innkeep Linen", "Greater Faydark"],
  ["Merchant Aianya", "Greater Faydark"],
  ["Merchant Iludarae", "Greater Faydark"],
  ["Merchant Kwein", "Greater Faydark"],
  ["Merchant Tuluvdar", "Greater Faydark"],
  ["Ootok", "Grobb"],
  ["Wista", "Grobb"],
  ["Zatok", "Grobb"],
  ["Dok", "Halas"],
  ["Teria O`Danos", "Halas"],
  ["Greta Terrilon", "Halas"],
  ["Hetie McDonald", "Halas"],
  ["Leopok Terrilon", "Halas"],
  ["Baker Jena", "High Keep"],
  ["Treasurer Lynn", "High Keep"],
  ["Maigin Greyeagle", "Highpass Hold"],
  ["Sernn Rossook", "Highpass Hold"],
  ["Doramafi Ratsbone", "North Kaladim"],
  ["Harnoff Splitrock", "North Kaladim"],
  ["Melixis", "Kerra Island"],
  ["Innkeep Min", "Kithicor Forest"],
  ["Elsbyth", "Kithicor Forest"],
  ["Innkeep Jurn", "Kithicor Forest"],
  ["Innkeep Grace", "Kithicor Forest"],
  ["Dreana", "Lake Rathetear"],
  ["Turga", "Lake Rathetear"],
  ["Jenah Wheelspinner", "Lavastorm Mountains"],
  ["Anelia Thrywiel", "Lesser Faydark"],
  ["Bim Buskin", "Misty Thicket"],
  ["Ootok", "Neriak Foreign Quarter"],
  ["Smaka", "Neriak Foreign Quarter"],
  ["Vala Tanbor", "Neriak Foreign Quarter"],
  ["The Gobbler", "Neriak Foreign Quarter"],
  ["Tal Drana", "Neriak Foreign Quarter"],
  ["Bull Crusher", "Neriak Foreign Quarter"],
  ["Dran `slug` Rembor", "Neriak Foreign Quarter"],
  ["Sal Drana", "Neriak Foreign Quarter"],
  ["Dunred M`Trik", "Neriak Commons"],
  ["Volkoon D`Dbth", "Neriak Commons"],
  ["Romella", "Northern Karana"],
  ["Innkeep Disda", "Northern Karana"],
  ["Innkeep James", "Northern Karana"],
  ["Bilbis Briar", "Northern Karana"],
  ["Murissa Sandwhisper", "Northern Desert of Ro"],
  ["Innkeep Valon", "Northern Desert of Ro"],
  ["Isslana", "Oasis of Marr"],
  ["Innkeep Marnan", "Oasis of Marr"],
  ["Angrog", "Oggok"],
  ["Sinsaal", "Oggok"],
  ["Crunga", "Oggok"],
  ["Erung", "Oggok"],
  ["Cleonae Kalen", "Ocean of Tears"],
  ["Endan Halson", "Ocean of Tears"],
  ["Tin Merchant I", "The Overthere"],
  ["Klok G`rshai", "The Overthere"],
  ["Rallia Hapera", "Paineel"],
  ["Geomar Hapera", "Paineel"],
  ["Linnleu Brackmar", "Paineel"],
  ["Keletha Nightweaver", "Paineel"],
  ["Gorng Alusnein", "Paineel"],
  ["Iva Tersala", "Paineel"],
  ["Misla McMannus", "Western Plains of Karana"],
  ["Innkeep Danin", "Western Plains of Karana"],
  ["Innkeep Rislarn", "Western Plains of Karana"],
  ["Cleet Miller Jr", "Western Plains of Karana"],
  ["Karn Tassen", "South Qeynos"],
  ["Voleen Tassen", "South Qeynos"],
  ["Tubal Weaver", "North Qeynos"],
  ["Tanlyn Galliway", "North Qeynos"],
  ["Sneed Galliway", "North Qeynos"],
  ["Ghil Starn", "North Qeynos"],
  ["Sequea Erthinon", "Surefall Glade"],
  ["Grathin Nilm", "Surefall Glade"],
  ["Guzzla", "Rathe Mountains"],
  ["Viira Bali", "Rathe Mountains"],
  ["Philicia Drinn", "Rathe Mountains"],
  ["Sven Drinn", "Rathe Mountains"],
  ["Susanna", "Rathe Mountains"],
  ["Innkeep Troy", "Rathe Mountains"],
  ["Innkeep Serge", "Rathe Mountains"],
  ["Chandra Kali", "Rathe Mountains"],
  ["Crista Tagglefoot", "Rivervale"],
  ["Daleen Leafsway", "Rivervale"],
  ["Wibble Bramblebush", "Rivervale"],
  ["A goblin merchant", "RunnyEye Citadel"],
  ["Ruru the Cook", "Skyshrine"],
  ["goblin merchant", "Solusek's Eye"],
  ["Rathmana Allin", "Southern Desert of Ro"],
  ["Finkel Rardobaen", "Steamfont Mountains"],
  ["Glen Garginburr", "Steamfont Mountains"],
  ["Chef Stead", "Stonebrunt Mountains"],
  ["Petcas Coldbeard", "Thurgadin"],
  ["Perkins Doughbeard", "Thurgadin"],
  ["Mordin Frostcleaver", "Thurgadin"],
  ["Coldain Outcast", "Icewell Keep"],
  ["Seloris Windweaver", "Timorous Deep"],
  ["Klok Rogalin", "Warsliks Woods"],
];

for (const [vendorLabel, zoneLabel] of WATER_FLASK_VENDORS) addVendor(vendorLabel, zoneLabel, ["item:water-flask"]);

save();
console.log(`Migration 360 complete: ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added for Water Flask`);
if (skippedVendors.length) {
  console.log(`Skipped ${skippedVendors.length} vendor(s):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
