/**
 * Migration 405: reconciles the "general goods" vendor economy (food,
 * drink, light sources, fishing gear, adventuring containers) against
 * eqlwiki.com's real per-item "Sold by" tables.
 *
 * Follow-up to migration 404: checking the Adventuring Supplies Vendors
 * Type filter after 404 shipped showed the vast majority of vendors
 * returning exactly one item -- not because that's all they sell, but
 * because the original scrape only ever captured 1-3 of a given vendor's
 * real stock. Cross-referencing 18 item pages' full vendor tables against
 * ~300 recurring named merchants (bakers, innkeepers, barkeeps, alemakers,
 * fishing-supply sellers) confirmed this: e.g. Innkeep Paggie (East
 * Freeport) had exactly 1 sells edge here (Water Flask) but her real
 * eqlwiki page lists 10 items.
 *
 * Items covered (8 pre-existing + 10 more found via this pass -- 4 brand
 * new nodes, 6 that already existed as quest-reward-only orphans):
 * Water Flask, Ration, Bandages, Mead, Dwarven Ale, Elven Wine, Bottle of
 * Milk, Fishing Bait, Fishing Pole, Iron Ration, Loaf of Bread, Muffin,
 * Torch, Small Lantern, Short Beer, Short Ale, Fish Wine, Fishcakes, Keg of
 * Vox Tail Ale, Large Bag.
 *
 * Deliberately excluded, even though seen on some of these same vendors'
 * pages:
 *   - Dagger: a real starter weapon (Piercing, dmg 3, delay 20) sold by a
 *     much larger, separate "weapons vendor" economy (~140 more NPCs) --
 *     opening that up is its own project, not an Adventuring Supplies gap.
 *   - Box of Lute Strings / Unfinished Brass Trumpet (seen on Innkeep
 *     Roster): Bard instrument-crafting components, a different tradeskill
 *     economy entirely.
 *   - Fresh Fish: already modeled (Tradeskill Supplies, a cooking
 *     ingredient) with its own separate identity; not re-touched here.
 *   - Renna (Erud's Crossing) and Merchant Kwein (Kelethin): both real
 *     eqlwiki vendors, but their zones (Erud's Crossing, Kelethin) aren't
 *     modeled in this graph at all -- adding a whole zone (map, NPC
 *     roster, connectivity, faction table) is out of scope for a vendor
 *     sells-edge fix. Same boundary migration 404 already drew for
 *     Tuloline/Kelethin.
 *
 * Data entry note: raw "Sold by" tables below are pasted from eqlwiki.com
 * per-item pages (fetched directly, not via search-summary) and
 * spot-verified against several individual NPC pages (Innkeep Paggie,
 * Tanlok Harson, Maula Fishcatcher). One real gap surfaced by that
 * cross-check: Innkeep Paggie's own page lists Muffin, but Muffin's
 * item-page table didn't include her -- added back in by hand (one line,
 * confirmed by her own page) rather than inferring the rest of her
 * Loaf-of-Bread-selling East Freeport cohort also sells Muffin, since that
 * pattern isn't actually consistent everywhere (Mordin Frostcleaver sells
 * Muffin but not Bread) -- a correlation, not a source. A handful of zone
 * labels also needed manual resolution where the source differs from this
 * graph's own zone naming -- see ZONE_OVERRIDES.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, updateNode, save } = loadGraph(import.meta.dir);
const g = graph;

// --- Zone label -> zone id, with known wiki-summary quirks resolved ---
const ZONE_OVERRIDES = {
  "highpass keep": "zone:high-keep", // wiki summarizer's paraphrase of "High Keep" (Treasurer Lynn's real zone)
  "kael drakkel": "zone:kael-drakkal",
  "neriak third gate": "zone:neriak-3rd-gate",
  "felwithe": "zone:northern-felwithe", // bare "Felwithe" consistently = Northern Felwithe elsewhere
  "eastern plains of karana": "zone:eastern-karana",
  "western plains of karana": "zone:western-karana",
  "runnyeye citadel": "zone:runnyeye-citadel",
  // Not modeled in this graph -- explicitly skipped, not guessed at.
  "erud's crossing": null,
  "kelethin": null,
};
const zoneByLabel = new Map(
  g.nodes.filter((n) => n.type === "zone").map((n) => [n.label.toLowerCase(), n.id])
);
function resolveZone(rawZoneLabel) {
  const key = rawZoneLabel.trim().toLowerCase();
  if (key in ZONE_OVERRIDES) return ZONE_OVERRIDES[key];
  if (zoneByLabel.has(key)) return zoneByLabel.get(key);
  return undefined; // unknown -- surfaced as an error, not silently skipped
}

function slug(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function normName(s) {
  return s.toLowerCase().replace(/[`']/g, "'").trim();
}

// --- Raw "Sold by" tables, eqlwiki.com, one block per item ---
const RAW = {
"item:water-flask": `
Rylin Coil - Ak'Anon
a clockwork grocer - Ak'Anon
a clockwork merchant - Ak'Anon
Iglan Thranon - Butcherblock Mountains
Gamin Griststone - Butcherblock Mountains
Parn Gylwyn - Butcherblock Mountains
Felen Razdal - Butcherblock Mountains
Klok Sweetzie - East Cabilis
Lybar - West Cabilis
Innkeep Roster - West Commonlands
Innkeep Olissa - West Commonlands
Milliace Gemshard - Crystal Caverns
Klok F\`tshai - Dreadlands
Paulina - Eastern Plains of Karana
Bradly - Eastern Plains of Karana
Stace - Eastern Plains of Karana
Sorn - Eastern Plains of Karana
Sharna - Eastern Plains of Karana
Iago - Eastern Plains of Karana
Lucetta - Eastern Plains of Karana
Balthazar - Eastern Plains of Karana
Tanrak - Eastern Plains of Karana
Bubar - East Commonlands
Parthar - East Commonlands
Innkeep Harold - East Commonlands
Innkeep Dolman - East Commonlands
Innkeep Juna - East Commonlands
Germe Threadspinner - East Commonlands
Innkeep Blaise - East Commonlands
Beth Breadmaker - Erudin
Helia BlueHawk - Erudin
Teria Finleather - Erudin
Borge Finleather - Erudin
Renna - Erud's Crossing
Innkeep Gub - The Feerrott
Innkeep Morpa - The Feerrott
Kogg - The Feerrott
Rolyn Longwalker - Felwithe
Fishmonger Issa - Felwithe
Merchant Sorintal - Felwithe
Leala Swiftarrow - Firiona Vie
Glinya Sweetpie - Firiona Vie
Rolfic Gohar - East Freeport
Ralfson Gerositan - East Freeport
Innkeep Paggie - East Freeport
Innkeep Rastle - East Freeport
Innkeep Nasumi - East Freeport
Innkeep Hunter - East Freeport
Winda Lylil - East Freeport
Henna Treghost - East Freeport
Gregor Nasin - East Freeport
Rashinda Elore - North Freeport
Gern Tassel - North Freeport
Gibbon Morfield - North Freeport
Yellus Gravien - North Freeport
Tradesman Lyna - North Freeport
Tradesman Tulan - North Freeport
Innkeep Palola - North Freeport
Bran Greenglade - North Freeport
Alec Greenglade - North Freeport
Innkeep Rille - North Freeport
Innkeep Evelona - North Freeport
Merchant Weaolanae - Greater Faydark
Merchant Kanoldar - Greater Faydark
Innkeep Anisyla - Greater Faydark
Innkeep Wuleran - Greater Faydark
Innkeep Larya - Greater Faydark
Innkeep Linen - Greater Faydark
Merchant Aianya - Greater Faydark
Merchant Iludarae - Greater Faydark
Merchant Kwein - Greater Faydark
Merchant Tuluvdar - Greater Faydark
Ootok - Grobb
Wista - Grobb
Zatok - Grobb
Dok - Halas
Teria O\`Danos - Halas
Greta Terrilon - Halas
Hetie McDonald - Halas
Leopok Terrilon - Halas
Baker Jena - High Keep
Treasurer Lynn - High Keep
Maigin Greyeagle - Highpass Hold
Sernn Rossook - Highpass Hold
Doramafi Ratsbone - North Kaladim
Harnoff Splitrock - North Kaladim
Melixis - Kerra Island
Innkeep Min - Kithicor Forest
Elsbyth - Kithicor Forest
Innkeep Jurn - Kithicor Forest
Innkeep Grace - Kithicor Forest
Dreana - Lake Rathetear
Turga - Lake Rathetear
Jenah Wheelspinner - Lavastorm Mountains
Anelia Thrywiel - Lesser Faydark
Bim Buskin - Misty Thicket
Ootok - Neriak Foreign Quarter
Smaka - Neriak Foreign Quarter
Vala Tanbor - Neriak Foreign Quarter
The Gobbler - Neriak Foreign Quarter
Tal Drana - Neriak Foreign Quarter
Bull Crusher - Neriak Foreign Quarter
Dran \`slug\` Rembor - Neriak Foreign Quarter
Sal Drana - Neriak Foreign Quarter
Dunred M\`Trik - Neriak Commons
Volkoon D\`Dbth - Neriak Commons
Romella - Northern Karana
Innkeep Disda - Northern Karana
Innkeep James - Northern Karana
Bilbis Briar - Northern Karana
Murissa Sandwhisper - Northern Desert of Ro
Innkeep Valon - Northern Desert of Ro
Isslana - Oasis of Marr
Innkeep Marnan - Oasis of Marr
Angrog - Oggok
Sinsaal - Oggok
Crunga - Oggok
Erung - Oggok
Cleonae Kalen - Ocean of Tears
Endan Halson - Ocean of Tears
Tin Merchant I - The Overthere
Klok G\`rshai - The Overthere
Rallia Hapera - Paineel
Geomar Hapera - Paineel
Linnleu Brackmar - Paineel
Keletha Nightweaver - Paineel
Gorng Alusnein - Paineel
Iva Tersala - Paineel
Misla McMannus - Western Plains of Karana
Innkeep Danin - Western Plains of Karana
Innkeep Rislarn - Western Plains of Karana
Cleet Miller Jr - Western Plains of Karana
Karn Tassen - South Qeynos
Voleen Tassen - South Qeynos
Tubal Weaver - North Qeynos
Tanlyn Galliway - North Qeynos
Sneed Galliway - North Qeynos
Ghil Starn - North Qeynos
Sequea Erthinon - Surefall Glade
Grathin Nilm - Surefall Glade
Guzzla - Rathe Mountains
Viira Bali - Rathe Mountains
Philicia Drinn - Rathe Mountains
Sven Drinn - Rathe Mountains
Susanna - Rathe Mountains
Innkeep Troy - Rathe Mountains
Innkeep Serge - Rathe Mountains
Chandra Kali - Rathe Mountains
Crista Tagglefoot - Rivervale
Daleen Leafsway - Rivervale
Wibble Bramblebush - Rivervale
A goblin merchant - RunnyEye Citadel
Ruru the Cook - Skyshrine
goblin merchant - Solusek's Eye
Rathmana Allin - Southern Desert of Ro
Finkel Rardobaen - Steamfont Mountains
Glen Garginburr - Steamfont Mountains
Chef Stead - Stonebrunt Mountains
Petcas Coldbeard - Thurgadin
Perkins Doughbeard - Thurgadin
Mordin Frostcleaver - Thurgadin
Coldain Outcast - Icewell Keep
Seloris Windweaver - Timorous Deep
Klok Rogalin - Warsliks Woods
`,
"item:ration": `
Rylin Coil - Ak'Anon
a clockwork grocer - Ak'Anon
a clockwork merchant - Ak'Anon
Iglan Thranon - Butcherblock Mountains
Gamin Griststone - Butcherblock Mountains
Parn Gylwyn - Butcherblock Mountains
Felen Razdal - Butcherblock Mountains
Magus Tira - Butcherblock Mountains
Innkeep Roster - West Commonlands
Innkeep Olissa - West Commonlands
Milliace Gemshard - Crystal Caverns
Paulina - Eastern Plains of Karana
Bradly - Eastern Plains of Karana
Stace - Eastern Plains of Karana
Sorn - Eastern Plains of Karana
Sharna - Eastern Plains of Karana
Iago - Eastern Plains of Karana
Lucetta - Eastern Plains of Karana
Balthazar - Eastern Plains of Karana
Tanrak - Eastern Plains of Karana
Bubar - East Commonlands
Innkeep Harold - East Commonlands
Innkeep Dolman - East Commonlands
Innkeep Juna - East Commonlands
Germe Threadspinner - East Commonlands
Innkeep Blaise - East Commonlands
Magus Zeir - East Commonlands
Beth Breadmaker - Erudin
Helia BlueHawk - Erudin
Teria Finleather - Erudin
Borge Finleather - Erudin
Magus Delin - Everfrost Peaks
Innkeep Gub - The Feerrott
Innkeep Morpa - The Feerrott
Kogg - The Feerrott
Rolyn Longwalker - Felwithe
Fishmonger Issa - Felwithe
Merchant Sorintal - Felwithe
Glinya Sweetpie - Firiona Vie
Leala Swiftarrow - Firiona Vie
Rolfic Gohar - East Freeport
Ralfson Gerositan - East Freeport
Innkeep Paggie - East Freeport
Innkeep Rastle - East Freeport
Innkeep Nasumi - East Freeport
Innkeep Hunter - East Freeport
Rashinda Elore - North Freeport
Gern Tassel - North Freeport
Gibbon Morfield - North Freeport
Yellus Gravien - North Freeport
Tradesman Lyna - North Freeport
Tradesman Tulan - North Freeport
Innkeep Palola - North Freeport
Bran Greenglade - North Freeport
Alec Greenglade - North Freeport
Innkeep Rille - North Freeport
Innkeep Evelona - North Freeport
Innkeep Anisyla - Greater Faydark
Innkeep Wuleran - Greater Faydark
Innkeep Larya - Greater Faydark
Innkeep Linen - Greater Faydark
Merchant Aianya - Greater Faydark
Merchant Iludarae - Greater Faydark
Merchant Kwein - Greater Faydark
Ootok - Grobb
Dok - Halas
Teria O\`Danos - Halas
Greta Terrilon - Halas
Hetie McDonald - Halas
Leopok Terrilon - Halas
Baker Jena - High Keep
Treasurer Lynn - High Keep
Maigin Greyeagle - Highpass Hold
Sernn Rossook - Highpass Hold
Doramafi Ratsbone - North Kaladim
Innkeep Min - Kithicor Forest
Elsbyth - Kithicor Forest
Innkeep Jurn - Kithicor Forest
Innkeep Grace - Kithicor Forest
Dreana - Lake Rathetear
Turga - Lake Rathetear
Jenah Wheelspinner - Lavastorm Mountains
Anelia Thrywiel - Lesser Faydark
Ootok - Neriak Foreign Quarter
Smaka - Neriak Foreign Quarter
Vala Tanbor - Neriak Foreign Quarter
The Gobbler - Neriak Foreign Quarter
Tal Drana - Neriak Foreign Quarter
Bull Crusher - Neriak Foreign Quarter
Dran \`slug\` Rembor - Neriak Foreign Quarter
Sal Drana - Neriak Foreign Quarter
Dunred M\`Trik - Neriak Commons
Volkoon D\`Dbth - Neriak Commons
Romella - Northern Karana
Innkeep Disda - Northern Karana
Innkeep James - Northern Karana
Bilbis Briar - Northern Karana
Innkeep Valon - Northern Desert of Ro
Magus Arindri - Northern Desert of Ro
Isslana - Oasis of Marr
Innkeep Marnan - Oasis of Marr
Angrog - Oggok
Sinsaal - Oggok
Crunga - Oggok
Erung - Oggok
Cleonae Kalen - Ocean of Tears
Endan Halson - Ocean of Tears
Tin Merchant I - The Overthere
Linnleu Brackmar - Paineel
Keletha Nightweaver - Paineel
Gorng Alusnein - Paineel
Iva Tersala - Paineel
Toryn Roltaire - Paineel
Misla McMannus - Western Plains of Karana
Innkeep Danin - Western Plains of Karana
Innkeep Rislarn - Western Plains of Karana
Karn Tassen - South Qeynos
Voleen Tassen - South Qeynos
Tanlyn Galliway - North Qeynos
Sneed Galliway - North Qeynos
Ghil Starn - North Qeynos
Guzzla - Rathe Mountains
Viira Bali - Rathe Mountains
Philicia Drinn - Rathe Mountains
Sven Drinn - Rathe Mountains
Susanna - Rathe Mountains
Innkeep Troy - Rathe Mountains
Innkeep Serge - Rathe Mountains
Chandra Kali - Rathe Mountains
Wibble Bramblebush - Rivervale
A goblin merchant - RunnyEye Citadel
Grudash the Baker - Skyshrine
Magus Jerira - Southern Desert of Ro
Glen Garginburr - Steamfont Mountains
Coldain Outcast - Icewell Keep
Seloris Windweaver - Timorous Deep
`,
"item:bandages": `
Rylin Coil - Ak'Anon
Drekon Vebnebber - Ak'Anon
a clockwork priest - Ak'Anon
a clockwork merchant - Ak'Anon
Iglan Thranon - Butcherblock Mountains
Gamin Griststone - Butcherblock Mountains
Parn Gylwyn - Butcherblock Mountains
Felen Razdal - Butcherblock Mountains
Rastok - East Cabilis
Lybar - West Cabilis
Innkeep Roster - West Commonlands
Innkeep Olissa - West Commonlands
Milliace Gemshard - Crystal Caverns
Klok F\`tshai - Dreadlands
Bradly - Eastern Plains of Karana
Stace - Eastern Plains of Karana
Sorn - Eastern Plains of Karana
Tanrak - Eastern Plains of Karana
Bubar - East Commonlands
Ponila Quickfingers - East Commonlands
Innkeep Harold - East Commonlands
Innkeep Dolman - East Commonlands
Innkeep Juna - East Commonlands
Germe Threadspinner - East Commonlands
Innkeep Blaise - East Commonlands
Ayth Niphiria - Erudin
Stella Breezemoon - Erudin
Fhania Aserdon - Erudin
Ghemna Nyjuss - Erudin
Teria Finleather - Erudin
Borge Finleather - Erudin
Rem Knarjon - Erudin
Innkeep Gub - The Feerrott
Innkeep Morpa - The Feerrott
Rolyn Longwalker - Felwithe
Merchant Sorintal - Felwithe
Tylar Windspirit - Felwithe
Isyna Firspanyl - Felwithe
Dran Hieth - Firiona Vie
Leala Swiftarrow - Firiona Vie
Ralfson Gerositan - East Freeport
Innkeep Paggie - East Freeport
Innkeep Rastle - East Freeport
Innkeep Nasumi - East Freeport
Innkeep Hunter - East Freeport
Celanie Xtoria - East Freeport
Prasen Rusgor - East Freeport
Tenni Kohern - East Freeport
Gern Tassel - North Freeport
Mevah Toklius - North Freeport
Hulos Ghenar - North Freeport
Jekel Enhied - North Freeport
Gibbon Morfield - North Freeport
Yellus Gravien - North Freeport
Jusia Vapious - North Freeport
Tradesman Lyna - North Freeport
Tradesman Tulan - North Freeport
Innkeep Palola - North Freeport
Bran Greenglade - North Freeport
Alec Greenglade - North Freeport
Innkeep Rille - North Freeport
Innkeep Evelona - North Freeport
Asnod Marnoc - West Freeport
Fania Esruc - West Freeport
Tyeg Envil - West Freeport
Innkeep Anisyla - Greater Faydark
Innkeep Wuleran - Greater Faydark
Innkeep Larya - Greater Faydark
Innkeep Linen - Greater Faydark
Merchant Aianya - Greater Faydark
Merchant Iludarae - Greater Faydark
Merchant Kwein - Greater Faydark
Merchant Tenra - Greater Faydark
Merchant Gililya - Greater Faydark
Merchant Tuluvdar - Greater Faydark
Merchant Milania - Greater Faydark
Merchant Muvien - Greater Faydark
Gluku - Grobb
Kagbkek - Grobb
Ootok - Grobb
Zumzal - Grobb
Holana Oleary - Halas
Dok - Halas
Greta Terrilon - Halas
Hetie McDonald - Halas
Kar O\`Dansin - Halas
Leopok Terrilon - Halas
Elona McMahon - Halas
Treasurer Lynn - High Keep
Jail Clerk Maryl - High Keep
Maigin Greyeagle - Highpass Hold
Sernn Rossook - Highpass Hold
Vacto Molunel - South Kaladim
Handaaf Orcslicer - South Kaladim
Doramafi Ratsbone - North Kaladim
Kafia Ratsbone - North Kaladim
Darthur Nightseer - North Kaladim
Baleki Nightseer - North Kaladim
Innkeep Min - Kithicor Forest
Elsbyth - Kithicor Forest
Innkeep Jurn - Kithicor Forest
Innkeep Grace - Kithicor Forest
Dreana - Lake Rathetear
Turga - Lake Rathetear
Jenah Wheelspinner - Lavastorm Mountains
a brownie merchant - Lesser Faydark
Anelia Thrywiel - Lesser Faydark
Ootok - Neriak Foreign Quarter
Smaka - Neriak Foreign Quarter
Vala Tanbor - Neriak Foreign Quarter
The Gobbler - Neriak Foreign Quarter
Bull Crusher - Neriak Foreign Quarter
Dran \`slug\` Rembor - Neriak Foreign Quarter
Relgor - Neriak Foreign Quarter
Namarg - Neriak Foreign Quarter
Dunred M\`Trik - Neriak Commons
Volkoon D\`Dbth - Neriak Commons
Issva H\`Rugla - Neriak Commons
Cazum N\`Tan - Neriak Third Gate
Jerris W\`Selo - Neriak Third Gate
Kanthu M\`Rekkor - Neriak Third Gate
Tzanso S\`Tai - Neriak Third Gate
Romella - Northern Karana
Innkeep Disda - Northern Karana
Innkeep James - Northern Karana
Murissa Sandwhisper - Northern Desert of Ro
Innkeep Valon - Northern Desert of Ro
Isslana - Oasis of Marr
Innkeep Marnan - Oasis of Marr
Endan Halson - Ocean of Tears
Doran Vargnus - Ocean of Tears
Angrog - Oggok
Sinsaal - Oggok
Crunga - Oggok
Erung - Oggok
Rora Dirtstamp - Oggok
Iksob Darkchaser - Oggok
Snarg Bonesmacker - Oggok
Tin Merchant I - The Overthere
Klok G\`rshai - The Overthere
Tenralus Brackmar - Paineel
Rallia Hapera - Paineel
Geomar Hapera - Paineel
Innkeep Rislarn - Western Plains of Karana
Sansa Nusk - South Qeynos
Bisdlo Ravtahm - South Qeynos
Rabley Trumend - South Qeynos
Ghul Rustem - South Qeynos
Tyokan Mekase - North Qeynos
Whysia Flock - North Qeynos
Tubal Weaver - North Qeynos
Tanlyn Galliway - North Qeynos
Sneed Galliway - North Qeynos
Shenro Kazpur - North Qeynos
Ghil Starn - North Qeynos
Sequea Erthinon - Surefall Glade
Grathin Nilm - Surefall Glade
Guzzla - Rathe Mountains
Ukla - Rathe Mountains
Viira Bali - Rathe Mountains
Philicia Drinn - Rathe Mountains
Sven Drinn - Rathe Mountains
Susanna - Rathe Mountains
Innkeep Troy - Rathe Mountains
Innkeep Serge - Rathe Mountains
Chandra Kali - Rathe Mountains
Lianna Ferasa - Rathe Mountains
Gaffin Deeppockets - Rivervale
Crista Tagglefoot - Rivervale
Pipple Purpleroot - Rivervale
Wibble Bramblebush - Rivervale
Rantho Goobler - Rivervale
Raelrik - Skyshrine
Tulgadin - Skyshrine
goblin merchant - Solusek's Eye
Rathmana Allin - Southern Desert of Ro
Glen Garginburr - Steamfont Mountains
Clara - Thurgadin
Brigam - Thurgadin
Mordin Frostcleaver - Thurgadin
Coldain Outcast - Icewell Keep
Seloris Windweaver - Timorous Deep
`,
"item:bottle-of-milk": `
a clockwork baker - Ak'Anon
a clockwork merchant - Ak'Anon
Urazun Thranon - Butcherblock Mountains
Gamin Griststone - Butcherblock Mountains
Parn Gylwyn - Butcherblock Mountains
Felen Razdal - Butcherblock Mountains
Klok Sweetzie - East Cabilis
Milliace Gemshard - Crystal Caverns
Praps Gemshard - Crystal Caverns
Bradly - Eastern Plains of Karana
Stace - Eastern Plains of Karana
Sorn - Eastern Plains of Karana
Tanrak - Eastern Plains of Karana
Parthar - East Commonlands
Teria Finleather - Erudin
Borge Finleather - Erudin
Bup - The Feerrott
Rolyn Longwalker - Northern Felwithe
Merchant Sorintal - Northern Felwithe
Ralfson Gerositan - East Freeport
Gibbon Morfield - North Freeport
Yellus Gravien - North Freeport
Tradesman Lyna - North Freeport
Tradesman Tulan - North Freeport
Bran Greenglade - North Freeport
Alec Greenglade - North Freeport
Pincia Brownloe - West Freeport
Merchant Aianya - Greater Faydark
Merchant Iludarae - Greater Faydark
Merchant Kwein - Greater Faydark
Ootok - Grobb
Sissia - Halas
Dok - Halas
Greta Terrilon - Halas
Leopok Terrilon - Halas
Maigin Greyeagle - Highpass Hold
Sernn Rossook - Highpass Hold
Doramafi Ratsbone - North Kaladim
Melixis - Kerra Island
Turga - Lake Rathetear
Bim Buskin - Misty Thicket
Smaka - Neriak Foreign Quarter
Vala Tanbor - Neriak Foreign Quarter
The Gobbler - Neriak Foreign Quarter
Dran \`slug\` Rembor - Neriak Foreign Quarter
Niz L\`Crit - Neriak Commons
Angrog - Oggok
Sinsaal - Oggok
Endan Halson - Ocean of Tears
Tin Merchant XI - The Overthere
Chrislin Baker - Western Plains of Karana
Cleet Miller Jr - Western Plains of Karana
Tanlyn Galliway - North Qeynos
Sneed Galliway - North Qeynos
Ghil Starn - North Qeynos
Guzzla - Rathe Mountains
Wibble Bramblebush - Rivervale
Chef Kollof - Skyshrine
Finkel Rardobaen - Steamfont Mountains
Glen Garginburr - Steamfont Mountains
Chef Stead - Stonebrunt Mountains
Petcas Coldbeard - Thurgadin
Perkins Doughbeard - Thurgadin
Seloris Windweaver - Timorous Deep
Quana Rainsparkle - Toxxulia Forest
`,
"item:mead": `
Rylin Coil - Ak'Anon
A clockwork barkeep - Ak'Anon
A clockwork merchant - Ak'Anon
Gamin Griststone - Butcherblock Mountains
Parn Gylwyn - Butcherblock Mountains
Felen Razdal - Butcherblock Mountains
Klok Sass - East Cabilis
Innkeep Seke - West Commonlands
Innkeep Roster - West Commonlands
Innkeep Redthorn - West Commonlands
Innkeep Olissa - West Commonlands
Milliace Gemshard - Crystal Caverns
Grabble Coldheart - Crystal Caverns
Bradly - Eastern Plains of Karana
Stace - Eastern Plains of Karana
Sorn - Eastern Plains of Karana
Tanrak - Eastern Plains of Karana
Innkeep Harold - East Commonlands
Innkeep Dolman - East Commonlands
Innkeep Leo - East Commonlands
Innkeep Juna - East Commonlands
Innkeep Elora - East Commonlands
Germe Threadspinner - East Commonlands
Innkeep Fenia - East Commonlands
Innkeep Calen - East Commonlands
Innkeep Blaise - East Commonlands
Teria Finleather - Erudin
Borge Finleather - Erudin
Geoard BlueHawk - Erudin
Innkeep Gub - The Feerrott
Innkeep Morpa - The Feerrott
Rolyn Longwalker - Felwithe
Wela Muselender - Felwithe
Tyle Songwhisper - Felwithe
Merchant Sorintal - Felwithe
Samson - Firiona Vie
Lunce Nasin - East Freeport
Ralfson Gerositan - East Freeport
Innkeep Paggie - East Freeport
Innkeep Rastle - East Freeport
Lynda Tapper - East Freeport
Nesin Tapper - East Freeport
Innkeep Nasumi - East Freeport
Innkeep Hunter - East Freeport
Jaleel Hoglomp - East Freeport
Henna Treghost - East Freeport
Gregor Nasin - East Freeport
Cloud Alemaker - East Freeport
River Alemaker - East Freeport
Sun Alemaker - East Freeport
Roghur Muleson - East Freeport
Gern Tassel - North Freeport
Gibbon Morfield - North Freeport
Yellus Gravien - North Freeport
Tradesman Lyna - North Freeport
Tradesman Tulan - North Freeport
Innkeep Palola - North Freeport
Galio - North Freeport
Bran Greenglade - North Freeport
Alec Greenglade - North Freeport
Judicla Riverfield - North Freeport
Shania Tassel - North Freeport
Innkeep Rille - North Freeport
Innkeep Evelona - North Freeport
Drona Whystlethin - West Freeport
Swin Blackeye - West Freeport
Merchant Weaolanae - Greater Faydark
Merchant Kanoldar - Greater Faydark
Innkeep Anisyla - Greater Faydark
Innkeep Wuleran - Greater Faydark
Innkeep Larya - Greater Faydark
Innkeep Linen - Greater Faydark
Barkeep Tvanla - Greater Faydark
Barkeep Sissya - Greater Faydark
Barkeep Myrisa - Greater Faydark
Barkeep Lysslan - Greater Faydark
Barkeep Tuviena - Greater Faydark
Barkeep Syntan - Greater Faydark
Barkeep Uulianu - Greater Faydark
Barkeep Manlawen - Greater Faydark
Merchant Aianya - Greater Faydark
Merchant Iludarae - Greater Faydark
Merchant Kwein - Greater Faydark
Ootok - Grobb
Wista - Grobb
Zatok - Grobb
Dok - Halas
Greta Terrilon - Halas
Hetie McDonald - Halas
Brandyn McDonald - Halas
Brin McQuaid - Halas
Donald McQuaid - Halas
Scon McDaniel - Halas
Leopok Terrilon - Halas
Dealer Shonta - Highpass Keep
Paulina - Highpass Hold
Maigin Greyeagle - Highpass Hold
Bartender - Highpass Hold
Sernn Rossook - Highpass Hold
Bartholemew - Highpass Hold
Tumpy Irontoe - South Kaladim
Doramafi Ratsbone - North Kaladim
Raarrk - Kerra Island
Innkeep Min - Kithicor Forest
Innkeep Jurn - Kithicor Forest
Innkeep Grace - Kithicor Forest
Abrod - Lake Rathetear
Turga - Lake Rathetear
Anelia Thrywiel - Lesser Faydark
Ootok - Neriak Foreign Quarter
Wista - Neriak Foreign Quarter
Smaka - Neriak Foreign Quarter
Vala Tanbor - Neriak Foreign Quarter
The Gobbler - Neriak Foreign Quarter
Damar Nislan - Neriak Foreign Quarter
Bull Crusher - Neriak Foreign Quarter
Tala Felton - Neriak Foreign Quarter
Darien Felton - Neriak Foreign Quarter
Tanai Tanbor - Neriak Foreign Quarter
Sera Buelle - Neriak Foreign Quarter
Uawn Betell - Neriak Foreign Quarter
Yala Thiss - Neriak Foreign Quarter
Dran \`slug\` Rembor - Neriak Foreign Quarter
Slunga - Neriak Foreign Quarter
Dunred M\`Trik - Neriak Commons
Rysva To\`Biath - Neriak Commons
Marenkor To\`Biath - Neriak Commons
Myrva N\`Tan - Neriak Commons
Volkoon D\`Dbth - Neriak Commons
Lysanda S\`Kor - Neriak Commons
Frivsa Punox - Neriak Commons
Svlis C\`Luzz - Neriak Commons
Rista S\`lon - Neriak Commons
Tenso H\`Rugla - Neriak Commons
Belyea K\`Jartan - Neriak Third Gate
Cecile K\`Jartan - Neriak Third Gate
Grazis L\`Crit - Neriak Third Gate
Katara L\`Crit - Neriak Third Gate
Romi - Northern Karana
Barkeep Milo - Northern Karana
Barkeep Jeny - Northern Karana
Innkeep Disda - Northern Karana
Innkeep James - Northern Karana
Innkeep Tozie - Northern Desert of Ro
Innkeep Valon - Northern Desert of Ro
Tran - Oasis of Marr
Innkeep Tizzy - Oasis of Marr
Innkeep Marnan - Oasis of Marr
Angrog - Oggok
Sinsaal - Oggok
Crunga - Oggok
Erung - Oggok
Endan Halson - Ocean of Tears
Loleluz - Paineel
Archenm - Paineel
Lolenton - Paineel
Gernatis - Paineel
Taralani Rahnta - Paineel
Winnla Crestus - Paineel
Innkeep Danin - Western Plains of Karana
Innkeep Rislarn - Western Plains of Karana
Sunsa Jocub - South Qeynos
McNeal Jocub - South Qeynos
Fish Ranamer - South Qeynos
Rucio Divella - South Qeynos
Sissy Huntlan - South Qeynos
Tasya Huntlan - South Qeynos
Nug Rellash - South Qeynos
Earron Huntlan - South Qeynos
Crow - North Qeynos
Tanlyn Galliway - North Qeynos
Sneed Galliway - North Qeynos
Ania Klephia - North Qeynos
Sabnie Blagard - North Qeynos
Ghil Starn - North Qeynos
Guzzla - Rathe Mountains
Philicia Drinn - Rathe Mountains
Sven Drinn - Rathe Mountains
Innkeep Troy - Rathe Mountains
Innkeep Serge - Rathe Mountains
Wibble Bramblebush - Rivervale
Mac Deeppockets - Rivervale
Flyndia Deeppockets - Rivervale
A goblin bartender - RunnyEye Citadel
Barkeep Droz - Skyshrine
Merchant Ulyssa - Southern Desert of Ro
Glen Garginburr - Steamfont Mountains
Loremaster Fronden - Thurgadin
Karey - Thurgadin
Celtir Gronback - Thurgadin
Klarp Bartleby - Thurgadin
Bixx Bartleby - Thurgadin
Adia Coldbeard - Thurgadin
Doogle McBanick - Thurgadin
Fogerty Bottlenip - Thurgadin
Durgan Bottlenip - Thurgadin
Coldain Outcast - Icewell Keep
Portik Grolam - Timorous Deep
Seloris Windweaver - Timorous Deep
Micus Vloren - Timorous Deep
`,
"item:fishing-bait": `
A clockwork merchant - Ak'Anon
Gamin Griststone - Butcherblock Mountains
Parn Gylwyn - Butcherblock Mountains
Felen Razdal - Butcherblock Mountains
Klok Foxmyr - East Cabilis
Klok Dytar - East Cabilis
Maula Fishcatcher - West Commonlands
Milliace Gemshard - Crystal Caverns
Bradly - Eastern Plains of Karana
Stace - Eastern Plains of Karana
Sorn - Eastern Plains of Karana
Tanrak - Eastern Plains of Karana
Germe Threadspinner - East Commonlands
Teria Finleather - Erudin
Borge Finleather - Erudin
Renna - Erud's Crossing
Kogg - The Feerrott
Elytan Rantas - Felwithe
Tam Slyspan - Felwithe
Fishmonger Jassa - Felwithe
Rolyn Longwalker - Felwithe
Merchant Sorintal - Felwithe
Klok Acet - Field of Bone
Dorg McMerin - Firiona Vie
Leala Swiftarrow - Firiona Vie
Ralfson Gerositan - East Freeport
Tanlok Harson - East Freeport
Iseba Gargurd - East Freeport
Tarker Gargurd - East Freeport
Lysric Loresinger - North Freeport
Gibbon Morfield - North Freeport
Yellus Gravien - North Freeport
Tradesman Lyna - North Freeport
Tradesman Tulan - North Freeport
Bran Greenglade - North Freeport
Alec Greenglade - North Freeport
Merchant Aianya - Greater Faydark
Merchant Iludarae - Greater Faydark
Merchant Kwein - Greater Faydark
Merchant Tuluvdar - Greater Faydark
Ootok - Grobb
Dok - Halas
Greta Terrilon - Halas
Leopok Terrilon - Halas
Quillion O'Zinn - Halas
Maigin Greyeagle - Highpass Hold
Sernn Rossook - Highpass Hold
Treasurer Lynn - High Keep
Bendad the Trader - Kael Drakkel
Doramafi Ratsbone - North Kaladim
Roary Fishpouncer - Kerra Island
Klok Gnask - Lake of Ill Omen
Turga - Lake Rathetear
Ootok - Neriak Foreign Quarter
Smaka - Neriak Foreign Quarter
Vala Tanbor - Neriak Foreign Quarter
The Gobbler - Neriak Foreign Quarter
Dran \`slug\` Rembor - Neriak Foreign Quarter
Mariz Ixtaz - Neriak Commons
Angrog - Oggok
Sinsaal - Oggok
Cleonae Kalen - Ocean of Tears
Craven Jonsbrow - Ocean of Tears
Endan Halson - Ocean of Tears
Sanian Shearsin - Ocean of Tears
Misla McMannus - Western Plains of Karana
Captain Rohand - South Qeynos
Tubal Weaver - North Qeynos
Tanlyn Galliway - North Qeynos
Sneed Galliway - North Qeynos
Ghil Starn - North Qeynos
Grathin Nilm - Surefall Glade
Guzzla - Rathe Mountains
Wibble Bramblebush - Rivervale
Dock merchant - Rivervale
Fiddy Bobick - Rivervale
Glen Garginburr - Steamfont Mountains
Klok Migo - Swamp of No Hope
Brigam - Thurgadin
Seloris Windweaver - Timorous Deep
Klok Gragin - Warsliks Woods
Klok Rogalin - Warsliks Woods
`,
"item:dwarven-ale": `
Hardat Gemshard - Crystal Caverns
Henna Treghost - East Freeport
Gregor Nasin - East Freeport
Ston O'Donner - East Freeport
Myrissa O'Donner - East Freeport
Slan ODonner - East Freeport
Monita O'Donner - East Freeport
Barkeep Aanlawen - Greater Faydark
Dyn Tarburner - Highpass Hold
Dura Darkfoam - South Kaladim
Abrod - Lake Rathetear
Romi - Northern Karana
Tran - Oasis of Marr
Kelkarn - Paineel
`,
"item:elven-wine": `
Wela Muselender - Felwithe
Tyle Songwhisper - Felwithe
Henna Treghost - East Freeport
Gregor Nasin - East Freeport
Ston O'Donner - East Freeport
Myrissa O'Donner - East Freeport
Slan ODonner - East Freeport
Monita O'Donner - East Freeport
Merchant Weaolanae - Greater Faydark
Merchant Kanoldar - Greater Faydark
Barkeep Tvanla - Greater Faydark
Barkeep Sissya - Greater Faydark
Barkeep Aanlawen - Greater Faydark
Barkeep Myrisa - Greater Faydark
Barkeep Lysslan - Greater Faydark
Barkeep Syntan - Greater Faydark
Barkeep Uulianu - Greater Faydark
Barkeep Manlawen - Greater Faydark
Dyn Tarburner - Highpass Hold
Abrod - Lake Rathetear
Yally G'Noir - Neriak Third Gate
Romi - Northern Karana
Tran - Oasis of Marr
Clurg - Oggok
Cleonae Kalen - Ocean of Tears
Kelkarn - Paineel
`,
"item:fishing-pole": `
Rylin Coil - Ak'Anon
a clockwork merchant - Ak'Anon
Gamin Griststone - Butcherblock Mountains
Parn Gylwyn - Butcherblock Mountains
Felen Razdal - Butcherblock Mountains
Klok Foxmyr - East Cabilis
Milliace Gemshard - Crystal Caverns
Bradly - Eastern Plains of Karana
Stace - Eastern Plains of Karana
Sorn - Eastern Plains of Karana
Tanrak - Eastern Plains of Karana
Teria Finleather - Erudin
Borge Finleather - Erudin
Renna - Erud's Crossing
Elytan Rantas - Felwithe
Tam Slyspan - Felwithe
Fishmonger Jassa - Felwithe
Rolyn Longwalker - Felwithe
Merchant Sorintal - Felwithe
Klok Acet - Field of Bone
Dorg McMerin - Firiona Vie
Ralfson Gerositan - East Freeport
Tanlok Harson - East Freeport
Iseba Gargurd - East Freeport
Tarker Gargurd - East Freeport
Gibbon Morfield - North Freeport
Yellus Gravien - North Freeport
Tradesman Lyna - North Freeport
Tradesman Tulan - North Freeport
Bran Greenglade - North Freeport
Alec Greenglade - North Freeport
Merchant Winerasea - Greater Faydark
Merchant Aianya - Greater Faydark
Merchant Iludarae - Greater Faydark
Merchant Kwein - Greater Faydark
Merchant Tuluvdar - Greater Faydark
Ootok - Grobb
Dok - Halas
Greta Terrilon - Halas
Leopok Terrilon - Halas
Quillion O\`Zinn - Halas
Maigin Greyeagle - Highpass Hold
Sernn Rossook - Highpass Hold
Treasurer Lynn - High Keep
Doramafi Ratsbone - North Kaladim
Roary Fishpouncer - Kerra Island
Mune Woodchopper - Kithicor Forest
Klok Gnask - Lake of Ill Omen
Turga - Lake Rathetear
Ootok - Neriak Foreign Quarter
Smaka - Neriak Foreign Quarter
Vala Tanbor - Neriak Foreign Quarter
The Gobbler - Neriak Foreign Quarter
Dran \`slug\` Rembor - Neriak Foreign Quarter
Mariz Ixtaz - Neriak Commons
Angrog - Oggok
Squeea - Oggok
Sinsaal - Oggok
Cleonae Kalen - Ocean of Tears
Craven Jonsbrow - Ocean of Tears
Endan Halson - Ocean of Tears
Sanian Shearsin - Ocean of Tears
Carlan the Young - Western Plains of Karana
Maldin the Old - Western Plains of Karana
Stan Cloven - South Qeynos
Nesiff Tallaherd - South Qeynos
Captain Rohand - South Qeynos
Tanlyn Galliway - North Qeynos
Sneed Galliway - North Qeynos
Ghil Starn - North Qeynos
Guzzla - Rathe Mountains
Wibble Bramblebush - Rivervale
dock merchant - Rivervale
Fiddy Bobick - Rivervale
Glen Garginburr - Steamfont Mountains
Grathin Nilm - Surefall Glade
Klok Migo - Swamp of No Hope
Brigam - Thurgadin
Seloris Windweaver - Timorous Deep
Klok Gragin - Warsliks Woods
Klok Rogalin - Warsliks Woods
Maula Fishcatcher - West Commonlands
`,
"item:iron-ration": `
Rylin Coil - Ak'Anon
a clockwork grocer - Ak'Anon
a clockwork merchant - Ak'Anon
Iglan Thranon - Butcherblock Mountains
Gamin Griststone - Butcherblock Mountains
Parn Gylwyn - Butcherblock Mountains
Felen Razdal - Butcherblock Mountains
Innkeep Roster - West Commonlands
Innkeep Olissa - West Commonlands
Milliace Gemshard - Crystal Caverns
Klok F'tshai - Dreadlands
Paulina - Eastern Plains of Karana
Bradly - Eastern Plains of Karana
Stace - Eastern Plains of Karana
Sorn - Eastern Plains of Karana
Sharna - Eastern Plains of Karana
Iago - Eastern Plains of Karana
Lucetta - Eastern Plains of Karana
Balthazar - Eastern Plains of Karana
Tanrak - Eastern Plains of Karana
Bubar - East Commonlands
Innkeep Harold - East Commonlands
Innkeep Dolman - East Commonlands
A Shady Swashbuckler - East Commonlands
Innkeep Juna - East Commonlands
Germe Threadspinner - East Commonlands
Innkeep Blaise - East Commonlands
Beth Breadmaker - Erudin
Helia BlueHawk - Erudin
Teria Finleather - Erudin
Borge Finleather - Erudin
Innkeep Gub - The Feerrott
Innkeep Morpa - The Feerrott
Kogg - The Feerrott
Rolyn Longwalker - Felwithe
Fishmonger Issa - Felwithe
Merchant Sorintal - Felwithe
Glinya Sweetpie - Firiona Vie
Rolfic Gohar - East Freeport
Ralfson Gerositan - East Freeport
Innkeep Paggie - East Freeport
Innkeep Rastle - East Freeport
Innkeep Nasumi - East Freeport
Innkeep Hunter - East Freeport
Winda Lylil - East Freeport
Rashinda Elore - North Freeport
Gern Tassel - North Freeport
Gibbon Morfield - North Freeport
Yellus Gravien - North Freeport
Tradesman Lyna - North Freeport
Tradesman Tulan - North Freeport
Innkeep Palola - North Freeport
Bran Greenglade - North Freeport
Alec Greenglade - North Freeport
Innkeep Rille - North Freeport
Innkeep Evelona - North Freeport
Innkeep Anisyla - Greater Faydark
Innkeep Wuleran - Greater Faydark
Innkeep Larya - Greater Faydark
Innkeep Linen - Greater Faydark
Merchant Aianya - Greater Faydark
Merchant Iludarae - Greater Faydark
Merchant Kwein - Greater Faydark
Merchant Tuluvdar - Greater Faydark
Ootok - Grobb
Dok - Halas
Teria O'Danos - Halas
Greta Terrilon - Halas
Hetie McDonald - Halas
Leopok Terrilon - Halas
Baker Jena - High Keep
Treasurer Lynn - High Keep
Maigin Greyeagle - Highpass Hold
Sernn Rossook - Highpass Hold
Ymik - Kael Drakkel
Doramafi Ratsbone - North Kaladim
Innkeep Min - Kithicor Forest
Elsbyth - Kithicor Forest
Innkeep Jurn - Kithicor Forest
Innkeep Grace - Kithicor Forest
Dreana - Lake Rathetear
Turga - Lake Rathetear
Jenah Wheelspinner - Lavastorm Mountains
Anelia Thrywiel - Lesser Faydark
Ootok - Neriak Foreign Quarter
Smaka - Neriak Foreign Quarter
Vala Tanbor - Neriak Foreign Quarter
The Gobbler - Neriak Foreign Quarter
Tal Drana - Neriak Foreign Quarter
Bull Crusher - Neriak Foreign Quarter
Dran 'slug' Rembor - Neriak Foreign Quarter
Sal Drana - Neriak Foreign Quarter
Dunred M'Trik - Neriak Commons
Volkoon D'Dbth - Neriak Commons
Romella - Northern Karana
Innkeep Disda - Northern Karana
Innkeep James - Northern Karana
Bilbis Briar - Northern Karana
Innkeep Valon - Northern Desert of Ro
Isslana - Oasis of Marr
Innkeep Marnan - Oasis of Marr
Angrog - Oggok
Sinsaal - Oggok
Crunga - Oggok
Erung - Oggok
Chef Dooga - Oggok
Endan Halson - Ocean of Tears
Tin Merchant I - The Overthere
Klok G'rshai - The Overthere
Linnleu Brackmar - Paineel
Keletha Nightweaver - Paineel
Gorng Alusnein - Paineel
Iva Tersala - Paineel
Misla McMannus - Western Plains of Karana
Innkeep Danin - Western Plains of Karana
Innkeep Rislarn - Western Plains of Karana
Karn Tassen - South Qeynos
Voleen Tassen - South Qeynos
Tubal Weaver - North Qeynos
Tanlyn Galliway - North Qeynos
Sneed Galliway - North Qeynos
Ghil Starn - North Qeynos
Sequea Erthinon - Surefall Glade
Grathin Nilm - Surefall Glade
Guzzla - Rathe Mountains
Viira Bali - Rathe Mountains
Philicia Drinn - Rathe Mountains
Sven Drinn - Rathe Mountains
Susanna - Rathe Mountains
Innkeep Troy - Rathe Mountains
Innkeep Serge - Rathe Mountains
Chandra Kali - Rathe Mountains
Crista Tagglefoot - Rivervale
Wibble Bramblebush - Rivervale
A goblin merchant - RunnyEye Citadel
Glen Garginburr - Steamfont Mountains
Coldain Outcast - Icewell Keep
Seloris Windweaver - Timorous Deep
Brigam - Thurgadin
`,
"item:loaf-of-bread": `
a clockwork baker - Ak'Anon
Lybar - West Cabilis
Innkeep Roster - West Commonlands
Innkeep Olissa - West Commonlands
Paulina - Eastern Plains of Karana
Iago - Eastern Plains of Karana
Lucetta - Eastern Plains of Karana
Balthazar - Eastern Plains of Karana
Innkeep Harold - East Commonlands
Innkeep Dolman - East Commonlands
Innkeep Juna - East Commonlands
Innkeep Blaise - East Commonlands
Beth Breadmaker - Erudin
Helia BlueHawk - Erudin
Bup - The Feerrott
Innkeep Gub - The Feerrott
Innkeep Morpa - The Feerrott
Glinya Sweetpie - Firiona Vie
Rolfic Gohar - East Freeport
Innkeep Paggie - East Freeport
Innkeep Rastle - East Freeport
Innkeep Nasumi - East Freeport
Innkeep Hunter - East Freeport
Winda Lylil - East Freeport
Rashinda Elore - North Freeport
Gern Tassel - North Freeport
Innkeep Palola - North Freeport
Innkeep Rille - North Freeport
Innkeep Evelona - North Freeport
Olyna Midel - West Freeport
Pincia Brownloe - West Freeport
Innkeep Anisyla - Greater Faydark
Innkeep Wuleran - Greater Faydark
Innkeep Larya - Greater Faydark
Innkeep Linen - Greater Faydark
Teria O'Danos - Halas
Hetie McDonald - Halas
Baker Jena - High Keep
Gretta Mottle - South Kaladim
Innkeep Min - Kithicor Forest
Innkeep Jurn - Kithicor Forest
Innkeep Grace - Kithicor Forest
Anelia Thrywiel - Lesser Faydark
Tal Drana - Neriak Foreign Quarter
Bull Crusher - Neriak Foreign Quarter
Sal Drana - Neriak Foreign Quarter
Dunred M'Trik - Neriak Commons
Volkoon D'Dbth - Neriak Commons
Niz L'Crit - Neriak Commons
Innkeep Disda - Northern Karana
Innkeep James - Northern Karana
Bilbis Briar - Northern Karana
Innkeep Valon - Northern Desert of Ro
Innkeep Marnan - Oasis of Marr
Chef Dooga - Oggok
Crunga - Oggok
Erung - Oggok
Cleonae Kalen - Ocean of Tears
Geomar Hapera - Paineel
Gorng Alusnein - Paineel
Iva Tersala - Paineel
Toryn Roltaire - Paineel
Innkeep Danin - Western Plains of Karana
Innkeep Rislarn - Western Plains of Karana
Cleet Miller Jr - Western Plains of Karana
Karn Tassen - South Qeynos
Voleen Tassen - South Qeynos
Philicia Drinn - Rathe Mountains
Sven Drinn - Rathe Mountains
Innkeep Troy - Rathe Mountains
Innkeep Serge - Rathe Mountains
A goblin merchant - RunnyEye Citadel
Grudash the Baker - Skyshrine
Rathmana Allin - Southern Desert of Ro
Petcas Coldbeard - Thurgadin
Coldain Outcast - Icewell Keep
`,
"item:muffin": `
A clockwork baker - Ak'Anon
Innkeep Paggie - East Freeport
Lybar - West Cabilis
Innkeep Roster - West Commonlands
Innkeep Olissa - West Commonlands
Innkeep Harold - East Commonlands
Paulina - Eastern Plains of Karana
Iago - Eastern Plains of Karana
Lucetta - Eastern Plains of Karana
Balthazar - Eastern Plains of Karana
Beth Breadmaker - Erudin
Helia BlueHawk - Erudin
Bup - The Feerrott
Innkeep Gub - The Feerrott
Innkeep Morpa - The Feerrott
Glinya Sweetpie - Firiona Vie
Innkeep Anisyla - Greater Faydark
Innkeep Wuleran - Greater Faydark
Innkeep Larya - Greater Faydark
Innkeep Linen - Greater Faydark
Teria O'Danos - Halas
Hetie McDonald - Halas
Baker Jena - High Keep
Gretta Mottle - South Kaladim
Innkeep Min - Kithicor Forest
Innkeep Jurn - Kithicor Forest
Innkeep Grace - Kithicor Forest
Tal Drana - Neriak Foreign Quarter
Bull Crusher - Neriak Foreign Quarter
Sal Drana - Neriak Foreign Quarter
Dunred M'Trik - Neriak Commons
Volkoon D'Dbth - Neriak Commons
Niz L'Crit - Neriak Commons
Innkeep Disda - Northern Karana
Innkeep James - Northern Karana
Innkeep Valon - Northern Desert of Ro
Innkeep Marnan - Oasis of Marr
Chef Dooga - Oggok
Crunga - Oggok
Erung - Oggok
Geomar Hapera - Paineel
Gorng Alusnein - Paineel
Iva Tersala - Paineel
Toryn Roltaire - Paineel
Innkeep Rislarn - Western Plains of Karana
Karn Tassen - South Qeynos
Voleen Tassen - South Qeynos
Philicia Drinn - Rathe Mountains
Sven Drinn - Rathe Mountains
Innkeep Troy - Rathe Mountains
Innkeep Serge - Rathe Mountains
A goblin merchant - RunnyEye Citadel
Grudash the Baker - Skyshrine
Mordin Frostcleaver - Thurgadin
Coldain Outcast - Icewell Keep
Innkeep Rille - North Freeport
Pincia Brownloe - West Freeport
`,
"item:torch": `
a clockwork cobbler - Ak'Anon
a clockwork merchant - Ak'Anon
Iglan Thranon - Butcherblock Mountains
Gamin Griststone - Butcherblock Mountains
Parn Gylwyn - Butcherblock Mountains
Felen Razdal - Butcherblock Mountains
Klok Dytar - East Cabilis
Lybar - West Cabilis
Innkeep Roster - West Commonlands
Innkeep Olissa - West Commonlands
Milliace Gemshard - Crystal Caverns
Bradly - Eastern Plains of Karana
Stace - Eastern Plains of Karana
Sorn - Eastern Plains of Karana
Tanrak - Eastern Plains of Karana
Innkeep Harold - East Commonlands
Innkeep Dolman - East Commonlands
A Shady Swashbuckler - East Commonlands
Innkeep Juna - East Commonlands
Germe Threadspinner - East Commonlands
Innkeep Blaise - East Commonlands
Teria Finleather - Erudin
Borge Finleather - Erudin
Renna - Erud's Crossing
Innkeep Gub - The Feerrott
Innkeep Morpa - The Feerrott
Rolyn Longwalker - Felwithe
Merchant Sorintal - Felwithe
Chenori Berinal - Felwithe
Leala Swiftarrow - Firiona Vie
Klok Acet - Field of Bone
Ralfson Gerositan - East Freeport
Innkeep Paggie - East Freeport
Innkeep Rastle - East Freeport
Innkeep Nasumi - East Freeport
Innkeep Hunter - East Freeport
Gern Tassel - North Freeport
Gibbon Morfield - North Freeport
Yellus Gravien - North Freeport
Tradesman Lyna - North Freeport
Tradesman Tulan - North Freeport
Innkeep Palola - North Freeport
Bran Greenglade - North Freeport
Alec Greenglade - North Freeport
Innkeep Rille - North Freeport
Innkeep Evelona - North Freeport
Innkeep Anisyla - Greater Faydark
Innkeep Wuleran - Greater Faydark
Innkeep Larya - Greater Faydark
Innkeep Linen - Greater Faydark
Merchant Aianya - Greater Faydark
Merchant Iludarae - Greater Faydark
Merchant Kwein - Greater Faydark
Ootok - Grobb
Dok - Halas
Greta Terrilon - Halas
Hetie McDonald - Halas
Leopok Terrilon - Halas
Treasurer Lynn - High Keep
Maigin Greyeagle - Highpass Hold
Sernn Rossook - Highpass Hold
Doramafi Ratsbone - North Kaladim
Innkeep Min - Kithicor Forest
Innkeep Jurn - Kithicor Forest
Innkeep Grace - Kithicor Forest
Klok Gnask - Lake of Ill Omen
Turga - Lake Rathetear
Anelia Thrywiel - Lesser Faydark
Ootok - Neriak Foreign Quarter
Smaka - Neriak Foreign Quarter
Vala Tanbor - Neriak Foreign Quarter
The Gobbler - Neriak Foreign Quarter
Bull Crusher - Neriak Foreign Quarter
Dran \`slug\` Rembor - Neriak Foreign Quarter
Dunred M\`Trik - Neriak Commons
Volkoon D\`Dbth - Neriak Commons
Innkeep Disda - Northern Karana
Innkeep James - Northern Karana
Innkeep Valon - Northern Desert of Ro
Innkeep Marnan - Oasis of Marr
Angrog - Oggok
Sinsaal - Oggok
Crunga - Oggok
Erung - Oggok
Endan Halson - Ocean of Tears
Tin Merchant I - The Overthere
Rallia Hapera - Paineel
Geomar Hapera - Paineel
Innkeep Danin - Western Plains of Karana
Innkeep Rislarn - Western Plains of Karana
Tubal Weaver - North Qeynos
Tanlyn Galliway - North Qeynos
Sneed Galliway - North Qeynos
Ghil Starn - North Qeynos
Guzzla - Rathe Mountains
Philicia Drinn - Rathe Mountains
Sven Drinn - Rathe Mountains
Innkeep Troy - Rathe Mountains
Innkeep Serge - Rathe Mountains
Wibble Bramblebush - Rivervale
goblin merchant - Solusek's Eye
Glen Garginburr - Steamfont Mountains
Klok Migo - Swamp of No Hope
Mordin Frostcleaver - Thurgadin
Brigam - Thurgadin
Coldain Outcast - Icewell Keep
Seloris Windweaver - Timorous Deep
Klok Gragin - Warsliks Woods
Klok Rogalin - Warsliks Woods
`,
"item:small-lantern": `
Rylin Coil - Ak'Anon
a clockwork merchant - Ak'Anon
Iglan Thranon - Butcherblock Mountains
Gamin Griststone - Butcherblock Mountains
Parn Gylwyn - Butcherblock Mountains
Felen Razdal - Butcherblock Mountains
Klok Dytar - East Cabilis
Lybar - West Cabilis
Innkeep Roster - West Commonlands
Innkeep Olissa - West Commonlands
Milliace Gemshard - Crystal Caverns
Bradly - Eastern Plains of Karana
Stace - Eastern Plains of Karana
Sorn - Eastern Plains of Karana
Tanrak - Eastern Plains of Karana
Bubar - East Commonlands
Innkeep Harold - East Commonlands
Innkeep Dolman - East Commonlands
Innkeep Juna - East Commonlands
Germe Threadspinner - East Commonlands
Innkeep Blaise - East Commonlands
Teria Finleather - Erudin
Borge Finleather - Erudin
Innkeep Gub - The Feerrott
Innkeep Morpa - The Feerrott
Rolyn Longwalker - Felwithe
Merchant Sorintal - Felwithe
Klok Acet - Field of Bone
Ralfson Gerositan - East Freeport
Innkeep Paggie - East Freeport
Innkeep Rastle - East Freeport
Innkeep Nasumi - East Freeport
Innkeep Hunter - East Freeport
Gern Tassel - North Freeport
Gibbon Morfield - North Freeport
Yellus Gravien - North Freeport
Tradesman Lyna - North Freeport
Tradesman Tulan - North Freeport
Innkeep Palola - North Freeport
Bran Greenglade - North Freeport
Alec Greenglade - North Freeport
Innkeep Rille - North Freeport
Innkeep Evelona - North Freeport
Innkeep Anisyla - Greater Faydark
Innkeep Wuleran - Greater Faydark
Innkeep Larya - Greater Faydark
Innkeep Linen - Greater Faydark
Merchant Aianya - Greater Faydark
Merchant Iludarae - Greater Faydark
Merchant Kwein - Greater Faydark
Ootok - Grobb
Dok - Halas
Greta Terrilon - Halas
Hetie McDonald - Halas
Leopok Terrilon - Halas
Maigin Greyeagle - Highpass Hold
Sernn Rossook - Highpass Hold
Kadek Norkhitter - North Kaladim
Doramafi Ratsbone - North Kaladim
Innkeep Min - Kithicor Forest
Elsbyth - Kithicor Forest
Innkeep Jurn - Kithicor Forest
Innkeep Grace - Kithicor Forest
Klok Gnask - Lake of Ill Omen
Dreana - Lake Rathetear
Turga - Lake Rathetear
Jenah Wheelspinner - Lavastorm Mountains
Anelia Thrywiel - Lesser Faydark
Ootok - Neriak Foreign Quarter
Smaka - Neriak Foreign Quarter
Vala Tanbor - Neriak Foreign Quarter
The Gobbler - Neriak Foreign Quarter
Bull Crusher - Neriak Foreign Quarter
Dran \`slug\` Rembor - Neriak Foreign Quarter
Dunred M\`Trik - Neriak Commons
Volkoon D\`Dbth - Neriak Commons
Romella - Northern Karana
Innkeep Disda - Northern Karana
Innkeep James - Northern Karana
Innkeep Valon - Northern Desert of Ro
Isslana - Oasis of Marr
Innkeep Marnan - Oasis of Marr
Angrog - Oggok
Sinsaal - Oggok
Crunga - Oggok
Erung - Oggok
Endan Halson - Ocean of Tears
Tin Merchant I - The Overthere
Rallia Hapera - Paineel
Geomar Hapera - Paineel
Innkeep Danin - Western Plains of Karana
Innkeep Rislarn - Western Plains of Karana
Tanlyn Galliway - North Qeynos
Sneed Galliway - North Qeynos
Ghil Starn - North Qeynos
Guzzla - Rathe Mountains
Viira Bali - Rathe Mountains
Philicia Drinn - Rathe Mountains
Sven Drinn - Rathe Mountains
Susanna - Rathe Mountains
Innkeep Troy - Rathe Mountains
Innkeep Serge - Rathe Mountains
Chandra Kali - Rathe Mountains
Wibble Bramblebush - Rivervale
goblin merchant - Solusek's Eye
Glen Garginburr - Steamfont Mountains
Klok Migo - Swamp of No Hope
Mordin Frostcleaver - Thurgadin
Coldain Outcast - Icewell Keep
Seloris Windweaver - Timorous Deep
Klok Gragin - Warsliks Woods
Klok Rogalin - Warsliks Woods
`,
"item:short-beer": `
a clockwork barkeep - Ak'Anon
Klok Sass - East Cabilis
Innkeep Seke - West Commonlands
Innkeep Roster - West Commonlands
Innkeep Redthorn - West Commonlands
Innkeep Olissa - West Commonlands
Hardat Gemshard - Crystal Caverns
Grabble Coldheart - Crystal Caverns
Innkeep Harold - East Commonlands
Innkeep Dolman - East Commonlands
Innkeep Leo - East Commonlands
Innkeep Juna - East Commonlands
Innkeep Elora - East Commonlands
Innkeep Fenia - East Commonlands
Innkeep Calen - East Commonlands
Innkeep Blaise - East Commonlands
Geoard BlueHawk - Erudin
Innkeep Gub - The Feerrott
Innkeep Morpa - The Feerrott
Samson - Firiona Vie
Lunce Nasin - East Freeport
Innkeep Paggie - East Freeport
Innkeep Rastle - East Freeport
Lynda Tapper - East Freeport
Nesin Tapper - East Freeport
Innkeep Nasumi - East Freeport
Innkeep Hunter - East Freeport
Jaleel Hoglomp - East Freeport
Henna Treghost - East Freeport
Gregor Nasin - East Freeport
Myrissa O'Donner - East Freeport
Slan ODonner - East Freeport
Cloud Alemaker - East Freeport
River Alemaker - East Freeport
Sun Alemaker - East Freeport
Roghur Muleson - East Freeport
Gern Tassel - North Freeport
Innkeep Palola - North Freeport
Judicla Riverfield - North Freeport
Shania Tassel - North Freeport
Innkeep Rille - North Freeport
Innkeep Evelona - North Freeport
Drona Whystlethin - West Freeport
Swin Blackeye - West Freeport
Innkeep Anisyla - Greater Faydark
Innkeep Wuleran - Greater Faydark
Innkeep Larya - Greater Faydark
Innkeep Linen - Greater Faydark
Barkeep Tuviena - Greater Faydark
Hetie McDonald - Halas
Brandyn McDonald - Halas
Brin McQuaid - Halas
Donald McQuaid - Halas
Scon McDaniel - Halas
Dealer Shonta - Highpass Keep
Bartender - Highpass Hold
Tumpy Irontoe - South Kaladim
Dura Darkfoam - South Kaladim
Raarrk - Kerra Island
Innkeep Min - Kithicor Forest
Innkeep Jurn - Kithicor Forest
Innkeep Grace - Kithicor Forest
Abrod - Lake Rathetear
Anelia Thrywiel - Lesser Faydark
Damar Nislan - Neriak Foreign Quarter
Bull Crusher - Neriak Foreign Quarter
Tala Felton - Neriak Foreign Quarter
Darien Felton - Neriak Foreign Quarter
Tanai Tanbor - Neriak Foreign Quarter
Sera Buelle - Neriak Foreign Quarter
Uawn Betell - Neriak Foreign Quarter
Yala Thiss - Neriak Foreign Quarter
Slunga - Neriak Foreign Quarter
Dunred M'Trik - Neriak Commons
Rysva To'Biath - Neriak Commons
Marenkor To'Biath - Neriak Commons
Myrva N'Tan - Neriak Commons
Volkoon D'Dbth - Neriak Commons
Lysanda S'Kor - Neriak Commons
Frivsa Punox - Neriak Commons
Svlis C'Luzz - Neriak Commons
Rista S'lon - Neriak Commons
Tenso H'Rugla - Neriak Commons
Belyea K'Jartan - Neriak Third Gate
Cecile K'Jartan - Neriak Third Gate
Grazis L'Crit - Neriak Third Gate
Katara L'Crit - Neriak Third Gate
Romi - Northern Karana
Barkeep Milo - Northern Karana
Barkeep Jeny - Northern Karana
Innkeep Disda - Northern Karana
Innkeep James - Northern Karana
Innkeep Tozie - Northern Desert of Ro
Innkeep Valon - Northern Desert of Ro
Tran - Oasis of Marr
Innkeep Tizzy - Oasis of Marr
Innkeep Marnan - Oasis of Marr
Clurg - Oggok
Crunga - Oggok
Erung - Oggok
Tin Merchant IX - The Overthere
Loleluz - Paineel
Archenm - Paineel
Lolenton - Paineel
Gernatis - Paineel
Taralani Rahnta - Paineel
Innkeep Danin - Western Plains of Karana
Innkeep Rislarn - Western Plains of Karana
Sunsa Jocub - South Qeynos
McNeal Jocub - South Qeynos
Fish Ranamer - South Qeynos
Rucio Divella - South Qeynos
Sissy Huntlan - South Qeynos
Tasya Huntlan - South Qeynos
Nug Rellash - South Qeynos
Earron Huntlan - South Qeynos
Crow - North Qeynos
Ania Klephia - North Qeynos
Sabnie Blagard - North Qeynos
Philicia Drinn - Rathe Mountains
Sven Drinn - Rathe Mountains
Innkeep Troy - Rathe Mountains
Innkeep Serge - Rathe Mountains
A goblin bartender - RunnyEye Citadel
Barkeep Droz - Skyshrine
Loremaster Fronden - Thurgadin
Karey - Thurgadin
Celtir Gronback - Thurgadin
Klarp Bartleby - Thurgadin
Bixx Bartleby - Thurgadin
Adia Coldbeard - Thurgadin
Doogle McBanick - Thurgadin
Fogerty Bottlenip - Thurgadin
Durgan Bottlenip - Thurgadin
Coldain Outcast - Icewell Keep
Portik Grolam - Timorous Deep
Micus Vloren - Timorous Deep
`,
"item:short-ale": `
a clockwork barkeep - Ak'Anon
a clockwork merchant - Ak'Anon
Klok Poklon - East Cabilis
Klok Sass - East Cabilis
Innkeep Seke - West Commonlands
Innkeep Redthorn - West Commonlands
Maula Fishcatcher - West Commonlands
Hardat Gemshard - Crystal Caverns
Grabble Coldheart - Crystal Caverns
Innkeep Leo - East Commonlands
Innkeep Elora - East Commonlands
Innkeep Fenia - East Commonlands
Innkeep Calen - East Commonlands
Geoard BlueHawk - Erudin
Elytan Rantas - Felwithe
Tam Slyspan - Felwithe
Fishmonger Jassa - Felwithe
Dorg McMerin - Firiona Vie
Samson - Firiona Vie
Lunce Nasin - East Freeport
Lynda Tapper - East Freeport
Nesin Tapper - East Freeport
Jaleel Hoglomp - East Freeport
Tanlok Harson - East Freeport
Iseba Gargurd - East Freeport
Tarker Gargurd - East Freeport
Myrissa O'Donner - East Freeport
Cloud Alemaker - East Freeport
River Alemaker - East Freeport
Sun Alemaker - East Freeport
Judicla Riverfield - North Freeport
Shania Tassel - North Freeport
Drona Whystlethin - West Freeport
Swin Blackeye - West Freeport
Barkeep Tuviena - Greater Faydark
Brandyn McDonald - Halas
Brin McQuaid - Halas
Donald McQuaid - Halas
Scon McDaniel - Halas
Quillion O'Zinn - Halas
Dealer Shonta - Highpass Keep
Paulina - Highpass Hold
Bartender - Highpass Hold
Bartholemew - Highpass Hold
Tumpy Irontoe - South Kaladim
Dura Darkfoam - South Kaladim
Raarrk - Kerra Island
Abrod - Lake Rathetear
Turga - Lake Rathetear
Damar Nislan - Neriak Foreign Quarter
Tala Felton - Neriak Foreign Quarter
Darien Felton - Neriak Foreign Quarter
Tanai Tanbor - Neriak Foreign Quarter
Sera Buelle - Neriak Foreign Quarter
Uawn Betell - Neriak Foreign Quarter
Yala Thiss - Neriak Foreign Quarter
Slunga - Neriak Foreign Quarter
Rysva To'Biath - Neriak Commons
Marenkor To'Biath - Neriak Commons
Myrva N'Tan - Neriak Commons
Lysanda S'Kor - Neriak Commons
Frivsa Punox - Neriak Commons
Svlis C'Luzz - Neriak Commons
Mariz Ixtaz - Neriak Commons
Rista S'lon - Neriak Commons
Tenso H'Rugla - Neriak Commons
Belyea K'Jartan - Neriak Third Gate
Cecile K'Jartan - Neriak Third Gate
Grazis L'Crit - Neriak Third Gate
Katara L'Crit - Neriak Third Gate
Romi - Northern Karana
Barkeep Milo - Northern Karana
Barkeep Jeny - Northern Karana
Bilbis Briar - Northern Karana
Innkeep Tozie - Northern Desert of Ro
Juni Sandfisher - Northern Desert of Ro
Tira Sandfisher - Northern Desert of Ro
Tran - Oasis of Marr
Innkeep Tizzy - Oasis of Marr
Cleonae Kalen - Ocean of Tears
Loleluz - Paineel
Archenm - Paineel
Lolenton - Paineel
Gernatis - Paineel
Taralani Rahnta - Paineel
Winnla Crestus - Paineel
Sunsa Jocub - South Qeynos
Fish Ranamer - South Qeynos
Captain Rohand - South Qeynos
Rucio Divella - South Qeynos
Sissy Huntlan - South Qeynos
Tasya Huntlan - South Qeynos
Nug Rellash - South Qeynos
Earron Huntlan - South Qeynos
Crow - North Qeynos
Ania Klephia - North Qeynos
Sabnie Blagard - North Qeynos
dock merchant - Rivervale
Fiddy Bobick - Rivervale
Mac Deeppockets - Rivervale
Flyndia Deeppockets - Rivervale
A goblin bartender - RunnyEye Citadel
Loremaster Fronden - Thurgadin
Karey - Thurgadin
Celtir Gronback - Thurgadin
Klarp Bartleby - Thurgadin
Bixx Bartleby - Thurgadin
Adia Coldbeard - Thurgadin
Doogle McBanick - Thurgadin
Fogerty Bottlenip - Thurgadin
Durgan Bottlenip - Thurgadin
Portik Grolam - Timorous Deep
Micus Vloren - Timorous Deep
`,
"item:fish-wine": `
a clockwork grocer - Ak'Anon
a clockwork barkeep - Ak'Anon
a clockwork merchant - Ak'Anon
Klok Foxmyr - East Cabilis
Klok Poklon - East Cabilis
Klok Sass - East Cabilis
Blumblum Swigwater - Cobalt Scar
Innkeep Seke - West Commonlands
Innkeep Redthorn - West Commonlands
Maula Fishcatcher - West Commonlands
Grabble Coldheart - Crystal Caverns
Sharna - Eastern Plains of Karana
Innkeep Leo - East Commonlands
Innkeep Elora - East Commonlands
Innkeep Fenia - East Commonlands
Innkeep Calen - East Commonlands
Geoard BlueHawk - Erudin
Renna - Erud's Crossing
Kogg - The Feerrott
Elytan Rantas - Felwithe
Tam Slyspan - Felwithe
Fishmonger Jassa - Felwithe
Fishmonger Issa - Felwithe
Dorg McMerin - Firiona Vie
Samson - Firiona Vie
Lunce Nasin - East Freeport
Lynda Tapper - East Freeport
Nesin Tapper - East Freeport
Henna Treghost - East Freeport
Gregor Nasin - East Freeport
Tanlok Harson - East Freeport
Iseba Gargurd - East Freeport
Tarker Gargurd - East Freeport
Cloud Alemaker - East Freeport
River Alemaker - East Freeport
Sun Alemaker - East Freeport
Judicla Riverfield - North Freeport
Shania Tassel - North Freeport
Drona Whystlethin - West Freeport
Swin Blackeye - West Freeport
Barkeep Tuviena - Greater Faydark
Brandyn McDonald - Halas
Brin McQuaid - Halas
Donald McQuaid - Halas
Scon McDaniel - Halas
Quillion O\`Zinn - Halas
Dealer Shonta - Highpass Keep
Paulina - Highpass Hold
Bartholemew - Highpass Hold
Tumpy Irontoe - South Kaladim
Roary Fishpouncer - Kerra Island
Raarrk - Kerra Island
Damar Nislan - Neriak Foreign Quarter
Tala Felton - Neriak Foreign Quarter
Darien Felton - Neriak Foreign Quarter
Tanai Tanbor - Neriak Foreign Quarter
Sera Buelle - Neriak Foreign Quarter
Uawn Betell - Neriak Foreign Quarter
Yala Thiss - Neriak Foreign Quarter
Slunga - Neriak Foreign Quarter
Rysva To\`Biath - Neriak Commons
Marenkor To\`Biath - Neriak Commons
Myrva N\`Tan - Neriak Commons
Lysanda S\`Kor - Neriak Commons
Frivsa Punox - Neriak Commons
Svlis C\`Luzz - Neriak Commons
Mariz Ixtaz - Neriak Commons
Rista S\`lon - Neriak Commons
Tenso H\`Rugla - Neriak Commons
Belyea K\`Jartan - Neriak Third Gate
Cecile K\`Jartan - Neriak Third Gate
Yally G\`Noir - Neriak Third Gate
Grazis L\`Crit - Neriak Third Gate
Katara L\`Crit - Neriak Third Gate
Barkeep Milo - Northern Karana
Barkeep Jeny - Northern Karana
Innkeep Tozie - Northern Desert of Ro
Juni Sandfisher - Northern Desert of Ro
Tira Sandfisher - Northern Desert of Ro
Innkeep Tizzy - Oasis of Marr
Clurg - Oggok
Loleluz - Paineel
Archenm - Paineel
Lolenton - Paineel
Gernatis - Paineel
Taralani Rahnta - Paineel
Misla McMannus - Western Plains of Karana
Sunsa Jocub - South Qeynos
McNeal Jocub - South Qeynos
Fish Ranamer - South Qeynos
Captain Rohand - South Qeynos
Rucio Divella - South Qeynos
Sissy Huntlan - South Qeynos
Tasya Huntlan - South Qeynos
Nug Rellash - South Qeynos
Earron Huntlan - South Qeynos
Crow - North Qeynos
Ania Klephia - North Qeynos
Sabnie Blagard - North Qeynos
dock merchant - Rivervale
Fiddy Bobick - Rivervale
Mac Deeppockets - Rivervale
Flyndia Deeppockets - Rivervale
A goblin bartender - RunnyEye Citadel
Loremaster Fronden - Thurgadin
Karey - Thurgadin
Celtir Gronback - Thurgadin
Klarp Bartleby - Thurgadin
Bixx Bartleby - Thurgadin
Adia Coldbeard - Thurgadin
Doogle McBanick - Thurgadin
Fogerty Bottlenip - Thurgadin
Durgan Bottlenip - Thurgadin
Portik Grolam - Timorous Deep
Micus Vloren - Timorous Deep
`,
"item:fishcakes": `
A clockwork grocer - Ak'Anon
A clockwork merchant - Ak'Anon
Klok Foxmyr - East Cabilis
Maula Fishcatcher - West Commonlands
Sharna - Eastern Plains of Karana
Renna - Erud's Crossing
Kogg - The Feerrott
Elytan Rantas - Felwithe
Tam Slyspan - Felwithe
Fishmonger Jassa - Felwithe
Fishmonger Issa - Felwithe
Dorg McMerin - Firiona Vie
Lunce Nasin - East Freeport
Nesin Tapper - East Freeport
Rolfic Gohar - East Freeport
Winda Lylil - East Freeport
Tanlok Harson - East Freeport
Iseba Gargurd - East Freeport
Tarker Gargurd - East Freeport
Quillion O'Zinn - Halas
Roary Fishpouncer - Kerra Island
Melixis - Kerra Island
Mariz Ixtaz - Neriak Commons
Juni Sandfisher - Northern Desert of Ro
Tira Sandfisher - Northern Desert of Ro
Chef Dooga - Oggok
Cleonae Kalen - Ocean of Tears
Misla McMannus - Western Plains of Karana
Captain Rohand - South Qeynos
Dock merchant - Rivervale
Fiddy Bobick - Rivervale
`,
"item:keg-of-vox-tail-ale": `
A clockwork merchant - Ak'Anon
Maula Fishcatcher - West Commonlands
Elytan Rantas - Felwithe
Tam Slyspan - Felwithe
Fishmonger Jassa - Felwithe
Tanlok Harson - East Freeport
Iseba Gargurd - East Freeport
Quillion O'Zinn - Halas
Mariz Ixtaz - Neriak Commons
Captain Rohand - South Qeynos
Dock merchant - Rivervale
Fiddy Bobick - Rivervale
`,
"item:large-bag": `
a clockwork merchant - Ak'Anon
Klok Vednir - East Cabilis
Lybar - West Cabilis
Ruby Boxcrafter - West Commonlands
Maula Fishcatcher - West Commonlands
Klok F\`tshai - Dreadlands
Nerth Sailwind - Erudin
Luren Renthalis - Erudin
Reihan Wilhemson - Erudin
Kisrin Breezeshadow - Erudin
Reko Saltamer - Erudin
Vall Stonewisp - Erudin Palace
Tan Monosty - Erudin Palace
Judge Monosty - Erudin Palace
Elytan Rantas - Felwithe
Tam Slyspan - Felwithe
Fishmonger Jassa - Felwithe
Merchant Issynal - Felwithe
Broawn Goshart - Firiona Vie
Dorg McMerin - Firiona Vie
Dom Pathfinder - Firiona Vie
Tanlok Harson - East Freeport
Iseba Gargurd - East Freeport
Tarker Gargurd - East Freeport
Merchant Aildien - Greater Faydark
Merchant Aluuvila - Greater Faydark
Merchant Tilluen - Greater Faydark
Graktak - Grobb
Rose McDowell - Halas
Quillion O\`Zinn - Halas
Treasurer Lynn - Highpass Keep
Merchant Dominik - Highpass Keep
Ymik - Kael Drakkel
Aarina Ratsbone - South Kaladim
Eithne Walker - Kithicor Forest
Srynda - Lake Rathetear
Palais Derekor - Neriak Foreign Quarter
Mariz Ixtaz - Neriak Commons
Mrysila - Northern Karana
Juni Sandfisher - Northern Desert of Ro
Tira Sandfisher - Northern Desert of Ro
Synthan - Oasis of Marr
Brokk Boxtripper - Oggok
Tin Merchant II - The Overthere
Klok G\`rshai - The Overthere
Rallia Hapera - Paineel
Geomar Hapera - Paineel
Bassanio Weekin - South Qeynos
Captain Rohand - South Qeynos
Fellesha Varshen - South Qeynos
Raheim Varshen - South Qeynos
Gahna Salbeen - South Qeynos
Roshmael - Rathe Mountains
bag merchant - Rivervale
dock merchant - Rivervale
Fiddy Bobick - Rivervale
goblin merchant - Solusek's Eye
Mordin Frostcleaver - Thurgadin
Agar - Thurgadin
Stylla Parsini - Toxxulia Forest
Emil Parsini - Toxxulia Forest
`,
};

// --- New item nodes (weren't in the graph at all before this pass) ---
const NEW_ITEMS: Record<string, Record<string, unknown>> = {
  "item:loaf-of-bread": {
    label: "Loaf of Bread",
    type: "item",
    weight: 0.5,
    size: "Small",
    source: "Sold by general-goods merchants across many zones",
    category: "Adventuring Supplies",
  },
  "item:fishcakes": {
    label: "Fishcakes",
    type: "item",
    weight: 0.5,
    size: "Small",
    source: "Sold by fishing-supply merchants across many zones",
    category: "Adventuring Supplies",
  },
  "item:keg-of-vox-tail-ale": {
    label: "Keg of Vox Tail Ale",
    type: "item",
    weight: 10,
    size: "Large",
    value: "106p",
    source: "Sold by fishing-supply merchants across many zones",
    category: "Adventuring Supplies",
  },
  "item:large-bag": {
    label: "Large Bag",
    type: "item",
    weight: 1,
    capacity: 6,
    containerSize: "Large",
    source: "Sold by general-goods merchants across many zones",
    category: "Adventuring Supplies",
  },
};
for (const [id, data] of Object.entries(NEW_ITEMS)) {
  if (hasNode(id)) throw new Error(`node already exists: ${id}`);
  addNode({ id, ...data });
}

// --- Items that already existed (quest-reward-sourced) but had no
// category or sells edges yet -- just add the category, keep `source`. ---
for (const id of [
  "item:muffin",
  "item:short-beer",
  "item:short-ale",
  "item:fish-wine",
  "item:torch",
  "item:small-lantern",
]) {
  if (!hasNode(id)) throw new Error(`node missing: ${id}`);
  updateNode(id, { category: "Adventuring Supplies" });
}

// --- Parse raw blocks into {name, zoneLabel} rows ---
function parseBlock(text) {
  return text
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.lastIndexOf(" - ");
      return { name: line.slice(0, idx).trim(), zoneLabel: line.slice(idx + 3).trim() };
    });
}

const ITEM_VENDORS = {};
for (const [itemId, block] of Object.entries(RAW)) {
  ITEM_VENDORS[itemId] = parseBlock(block);
}

// --- Cross-reference against the graph ---
const nodesById = new Map(g.nodes.map((n) => [n.id, n]));
const npcsByZoneAndName = new Map(); // "zoneId::normName" -> npc node
for (const n of g.nodes) {
  if (n.type !== "npc") continue;
  const zoneId = "zone:" + n.id.split(":")[1];
  npcsByZoneAndName.set(`${zoneId}::${normName(n.label)}`, n);
}
const existingSells = new Set(
  g.edges.filter((e) => e.type === "sells").map((e) => `${e.source}::${e.target}`)
);

const missingEdgesForExistingNpcs = []; // {npcId, itemId}
const newNpcsNeeded = new Map(); // npcId -> {label, zoneId, items:Set}
const unresolvedZones = new Set();

for (const [itemId, rows] of Object.entries(ITEM_VENDORS)) {
  for (const { name, zoneLabel } of rows) {
    const zoneId = resolveZone(zoneLabel);
    if (zoneId === undefined) {
      unresolvedZones.add(zoneLabel);
      continue;
    }
    if (zoneId === null) continue; // deliberately out of scope (Erud's Crossing, Kelethin)

    const key = `${zoneId}::${normName(name)}`;
    const existingNpc = npcsByZoneAndName.get(key);
    if (existingNpc) {
      const edgeKey = `${existingNpc.id}::${itemId}`;
      if (!existingSells.has(edgeKey)) {
        missingEdgesForExistingNpcs.push({ npcId: existingNpc.id, itemId });
      }
    } else {
      const npcId = `npc:${zoneId.slice("zone:".length)}:${slug(name)}`;
      if (!newNpcsNeeded.has(npcId)) {
        newNpcsNeeded.set(npcId, { label: name, zoneId, items: new Set() });
      }
      newNpcsNeeded.get(npcId).items.add(itemId);
    }
  }
}

if (unresolvedZones.size > 0) {
  throw new Error(`unresolved zone labels: ${[...unresolvedZones].join(", ")}`);
}

// --- Apply: missing sells edges on NPCs that already exist ---
for (const { npcId, itemId } of missingEdgesForExistingNpcs) {
  if (!hasNode(npcId)) throw new Error(`npc not found: ${npcId}`);
  if (!hasNode(itemId)) throw new Error(`item not found: ${itemId}`);
  addEdge(npcId, itemId, "sells");
}

// --- Apply: brand new NPCs (name+zone combo not already in the graph) ---
for (const [npcId, { label, zoneId, items }] of newNpcsNeeded) {
  if (hasNode(npcId)) throw new Error(`npc already exists: ${npcId}`);
  if (!hasNode(zoneId)) throw new Error(`zone not found: ${zoneId}`);
  addNode({ id: npcId, label, type: "npc", roles: ["vendor"] });
  addEdge(npcId, zoneId, "located_in");
  for (const itemId of items) {
    if (!hasNode(itemId)) throw new Error(`item not found: ${itemId}`);
    addEdge(npcId, itemId, "sells");
  }
}

let newNpcEdgeCount = 0;
for (const v of newNpcsNeeded.values()) newNpcEdgeCount += v.items.size;

save();
console.log(
  `Migration 405 complete: added ${Object.keys(NEW_ITEMS).length} new items, categorized 6 existing items, ` +
    `added ${missingEdgesForExistingNpcs.length} sells edges to existing vendors, and added ${newNpcsNeeded.size} ` +
    `new vendor NPCs (${newNpcEdgeCount} sells edges).`
);
