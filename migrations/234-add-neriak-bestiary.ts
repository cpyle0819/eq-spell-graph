/**
 * Migration 234: add mob nodes for zone:neriak-commons, zone:neriak-
 * foreign-quarter, and zone:neriak-3rd-gate, per the `mob` node type from
 * migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * `Category:Neriak Commons`/`Category:Neriak Foreign Quarter`/`Category:
 * Neriak Third Gate` narrowed via the MediaWiki API method (decisions/
 * eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 108 unique
 * `{{Namedmobpage}}` candidates. Neriak is a dark elf city (KOS to every
 * good race per its own zone faction table, safe only for dark elf/ogre/
 * troll -- same shape as Grobb/Felwithe/High Keep/Oggok/Paineel), so every
 * stat-blocked candidate was kept regardless of role (guards, guild
 * leadership, an ambassador), same "evil city" precedent.
 *
 * Sub-zone assignment came from each candidate's own `zone` field rather
 * than the category it was listed under -- "Guard F`Lok" was categorized
 * under Neriak Commons but its own page states Neriak Foreign Quarter, so
 * it's placed there instead (same miscategorized-candidate pattern as
 * Lower Guk's excluded "A froglok tsu shaman"). Several "Guard <name>"
 * entries carry a `zone` field naming two or three sub-zones at once
 * (patrols) -- each got its own zone-namespaced node in every sub-zone
 * listed, per `mob:<zone-slug>:<mob-slug>`'s existing same-name-different-
 * zone convention.
 *
 * Excluded: "Priest of Discord" (`zone` = Various, a recurring cross-city
 * service NPC, same call as Felwithe's). "A fish" (`zone` = "Various
 * Zones", a generic fishing catch, not a zone creature). "Guard S`Kor"
 * (`level` = "??", no stated numeric value) and "Vorshar the Despised"
 * (`level` = "?") -- both no stated level, same "don't guess" precedent as
 * Grobb's excluded "Basher Ganbaku".
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const COMMONS = [
  { slug: "narex-t-vem", label: "Narex T`Vem", minLevel: 61, maxLevel: 61 },
  { slug: "trizam-n-tan", label: "Trizam N`Tan", minLevel: 61, maxLevel: 61 },
  { slug: "yegek-b-larin", label: "Yegek B`Larin", minLevel: 61, maxLevel: 61 },
  { slug: "seloxia-punox", label: "Seloxia Punox", minLevel: 61, maxLevel: 61 },
  { slug: "olavn-n-mar", label: "Olavn N`Mar", minLevel: 40, maxLevel: 40 },
  { slug: "a-leatherfoot-spy", label: "A Leatherfoot Spy", minLevel: 20, maxLevel: 20 },
  { slug: "razran-f-lok", label: "Razran F`Lok", minLevel: 40, maxLevel: 40 },
  { slug: "gath-n-mare", label: "Gath N`Mare", minLevel: 61, maxLevel: 61 },
  { slug: "draxiz-n-ryt", label: "Draxiz N'Ryt", minLevel: 54, maxLevel: 54 },
  { slug: "guard-k-jartan", label: "Guard K`Jartan", minLevel: 40, maxLevel: 40 },
  { slug: "mavin-d-dbth", label: "Mavin D`Dbth", minLevel: 61, maxLevel: 61 },
  { slug: "antian-f-lok", label: "Antian F`Lok", minLevel: 40, maxLevel: 40 },
  { slug: "aslyn-c-luzz", label: "Aslyn C`Luzz", minLevel: 61, maxLevel: 61 },
  { slug: "belux-j-ver", label: "Belux J`Ver", minLevel: 61, maxLevel: 61 },
  { slug: "camia-v-retta", label: "Camia V`Retta", minLevel: 61, maxLevel: 61 },
  { slug: "drizm-j-axx", label: "Drizm J`Axx", minLevel: 61, maxLevel: 61 },
  { slug: "guard-d-bious", label: "Guard D`Bious", minLevel: 40, maxLevel: 40 },
  { slug: "guard-d-unnar", label: "Guard D`Unnar", minLevel: 40, maxLevel: 40 },
  { slug: "guard-din-a", label: "Guard Din`a", minLevel: 40, maxLevel: 40 },
  { slug: "guard-dmizza", label: "Guard Dmizza", minLevel: 40, maxLevel: 40 },
  { slug: "guard-f-mazz", label: "Guard F`Mazz", minLevel: 40, maxLevel: 40 },
  { slug: "guard-g-noir", label: "Guard G`Noir", minLevel: 40, maxLevel: 40 },
  { slug: "guard-j-axx", label: "Guard J`Axx", minLevel: 40, maxLevel: 40 },
  { slug: "guard-l-crit", label: "Guard L`Crit", minLevel: 40, maxLevel: 40 },
  { slug: "guard-q-tentu", label: "Guard Q`Tentu", minLevel: 40, maxLevel: 40 },
  { slug: "guard-quexill", label: "Guard Quexill", minLevel: 40, maxLevel: 40 },
  { slug: "guard-s-tai", label: "Guard S`Tai", minLevel: 40, maxLevel: 40 },
  { slug: "guard-n-mar", label: "Guard N`Mar", minLevel: 35, maxLevel: 35 },
  { slug: "guard-to-biath", label: "Guard To`Biath", minLevel: 40, maxLevel: 40 },
  { slug: "guard-v-resh", label: "Guard V`Resh", minLevel: 40, maxLevel: 40 },
  { slug: "guard-v-retta", label: "Guard V`Retta", minLevel: 40, maxLevel: 40 },
  { slug: "isvan-s-lon", label: "Isvan S`Lon", minLevel: 10, maxLevel: 10 },
  { slug: "jarrex-n-ryt", label: "Jarrex N`Ryt", minLevel: 61, maxLevel: 61 },
  { slug: "jayna-d-bious", label: "Jayna D`Bious", minLevel: 61, maxLevel: 61 },
  { slug: "jucra-v-lask", label: "Jucra V`Lask", minLevel: 61, maxLevel: 61 },
  { slug: "klan-k-jartan", label: "Klan K`Jartan", minLevel: 40, maxLevel: 40 },
  { slug: "opizel-g-efia", label: "Opizel G`Efia", minLevel: 61, maxLevel: 61 },
  { slug: "ryoz-k-tarn", label: "Ryoz K`Tarn", minLevel: 60, maxLevel: 60 },
  { slug: "shanez-x-teria", label: "Shanez X`Teria", minLevel: 61, maxLevel: 61 },
  { slug: "utvex-d-jerna", label: "Utvex D`Jerna", minLevel: 60, maxLevel: 60 },
  { slug: "vexia-d-ynth", label: "Vexia D`Ynth", minLevel: 70, maxLevel: 70 },
  { slug: "guard-tolax", label: "Guard Tolax", minLevel: 35, maxLevel: 35 },
  { slug: "guard-zexus", label: "Guard Zexus", minLevel: 40, maxLevel: 40 },
];

const FOREIGN_QUARTER = [
  { slug: "guard-f-lok", label: "Guard F`Lok", minLevel: 35, maxLevel: 35 },
  { slug: "x-ta-timpi", label: "X`Ta Timpi", minLevel: 40, maxLevel: 40 },
  { slug: "x-ta-tempi", label: "X`Ta Tempi", minLevel: 40, maxLevel: 40 },
  { slug: "capee", label: "Capee", minLevel: 50, maxLevel: 50 },
  { slug: "svunsa", label: "Svunsa", minLevel: 50, maxLevel: 50 },
  { slug: "uglan", label: "Uglan", minLevel: 50, maxLevel: 50 },
  { slug: "x-ta-tompi", label: "X`Ta Tompi", minLevel: 40, maxLevel: 40 },
  { slug: "guard-t-kix", label: "Guard T`Kix", minLevel: 35, maxLevel: 35 },
  { slug: "divn-l-crit", label: "Divn L`Crit", minLevel: 45, maxLevel: 45 },
  { slug: "pungla", label: "Pungla", minLevel: 14, maxLevel: 14 },
  { slug: "guard-n-mar", label: "Guard N`Mar", minLevel: 35, maxLevel: 35 },
  { slug: "guard-lumpin", label: "Guard Lumpin", minLevel: 18, maxLevel: 18 },
  { slug: "jacker", label: "Jacker", minLevel: 44, maxLevel: 44 },
  { slug: "guard-swang", label: "Guard Swang", minLevel: 35, maxLevel: 35 },
  { slug: "guard-ixtaz", label: "Guard Ixtaz", minLevel: 35, maxLevel: 35 },
  { slug: "guard-punox", label: "Guard Punox", minLevel: 35, maxLevel: 35 },
  { slug: "guard-s-lon", label: "Guard S'Lon", minLevel: 40, maxLevel: 40 },
  { slug: "guard-tolax", label: "Guard Tolax", minLevel: 35, maxLevel: 35 },
  { slug: "guard-zexus", label: "Guard Zexus", minLevel: 40, maxLevel: 40 },
  { slug: "karnan", label: "Karnan", minLevel: 47, maxLevel: 47 },
  { slug: "lisv-d-unnar", label: "Lisv D`Unnar", minLevel: 40, maxLevel: 40 },
  { slug: "mrak", label: "Mrak", minLevel: 48, maxLevel: 48 },
  { slug: "oosa-shadowthumper", label: "Oosa Shadowthumper", minLevel: 42, maxLevel: 42 },
  { slug: "psal-g-noir", label: "Psal G`Noir", minLevel: 40, maxLevel: 40 },
  { slug: "rolynn-bdoph", label: "Rolynn Bdoph", minLevel: 10, maxLevel: 10 },
];

const THIRD_GATE = [
  { slug: "guard-d-bious", label: "Guard D`Bious", minLevel: 40, maxLevel: 40 },
  { slug: "guard-q-tentu", label: "Guard Q`Tentu", minLevel: 40, maxLevel: 40 },
  { slug: "jsvan-zexus", label: "Jsvan Zexus", minLevel: 40, maxLevel: 40 },
  { slug: "hekzin-g-zule", label: "Hekzin G`Zule", minLevel: 61, maxLevel: 61 },
  { slug: "ratraz", label: "Ratraz", minLevel: 19, maxLevel: 19 },
  { slug: "tani-n-mar", label: "Tani N`Mar", minLevel: 45, maxLevel: 45 },
  { slug: "eolorn-j-axx", label: "Eolorn J`Axx", minLevel: 61, maxLevel: 61 },
  { slug: "loveal-s-nez", label: "Loveal S`Nez", minLevel: 61, maxLevel: 61 },
  { slug: "lokar-to-biath", label: "Lokar To`Biath", minLevel: 10, maxLevel: 10 },
  { slug: "nallar-q-tentu", label: "Nallar Q`Tentu", minLevel: 42, maxLevel: 42 },
  { slug: "noxhil-v-sek", label: "Noxhil V`Sek", minLevel: 61, maxLevel: 61 },
  { slug: "degarran-kixl", label: "Degarran Kixl", minLevel: 38, maxLevel: 38 },
  { slug: "kszan-punox", label: "Kszan Punox", minLevel: 40, maxLevel: 40 },
  { slug: "lisvan-x-lottl", label: "Lisvan X`Lottl", minLevel: 40, maxLevel: 40 },
  { slug: "pazin-punox", label: "Pazin Punox", minLevel: 61, maxLevel: 61 },
  { slug: "sazan-k-jartan", label: "Sazan K`Jartan", minLevel: 25, maxLevel: 25 },
  { slug: "vivish-slon", label: "Vivish SLon", minLevel: 34, maxLevel: 34 },
  { slug: "yaz-tolax", label: "Yaz Tolax", minLevel: 38, maxLevel: 38 },
  { slug: "mare-x-lottl", label: "Mare X`Lottl", minLevel: 20, maxLevel: 20 },
  { slug: "perrir-zexus", label: "Perrir Zexus", minLevel: 61, maxLevel: 61 },
  { slug: "spice", label: "Spice", minLevel: 20, maxLevel: 20 },
  { slug: "verina-tomb", label: "Verina Tomb", minLevel: 60, maxLevel: 60 },
  { slug: "guard-tolax", label: "Guard Tolax", minLevel: 35, maxLevel: 35 },
  { slug: "guard-v-lask", label: "Guard V`Lask", minLevel: 35, maxLevel: 35 },
  { slug: "ambassador-rylan", label: "Ambassador Rylan", minLevel: 25, maxLevel: 25 },
  { slug: "ithvol-k-jasn", label: "Ithvol K`Jasn", minLevel: 61, maxLevel: 61 },
  { slug: "frizin-q-tentu", label: "Frizin Q`Tentu", minLevel: 61, maxLevel: 61 },
  { slug: "glazin-k-jartan", label: "Glazin K`Jartan", minLevel: 61, maxLevel: 61 },
  { slug: "dizra-to-biath", label: "Dizra To`Biath", minLevel: 11, maxLevel: 12 },
  { slug: "eruvin-t-kix", label: "Eruvin T`Kix", minLevel: 40, maxLevel: 40 },
  { slug: "evin-x-lottl", label: "Evin X`Lottl", minLevel: 40, maxLevel: 40 },
  { slug: "jabon-t-kix", label: "Jabon T`Kix", minLevel: 40, maxLevel: 40 },
  { slug: "jacum-c-luzz", label: "Jacum C`Luzz", minLevel: 40, maxLevel: 40 },
  { slug: "kerton-r-dev", label: "Kerton R`Dev", minLevel: 61, maxLevel: 61 },
  { slug: "krizin-j-narus", label: "Krizin J`Narus", minLevel: 40, maxLevel: 40 },
  { slug: "krizon-g-noir", label: "Krizon G`Noir", minLevel: 40, maxLevel: 40 },
  { slug: "molon-t-plth", label: "Molon T`plth", minLevel: 14, maxLevel: 14 },
  { slug: "nezzka-tolax", label: "Nezzka Tolax", minLevel: 61, maxLevel: 61 },
  { slug: "tralon-din-a", label: "Tralon Din`a", minLevel: 61, maxLevel: 61 },
  { slug: "ulazia-w-selo", label: "Ulazia W`Selo", minLevel: 61, maxLevel: 61 },
  { slug: "ulraz-s-lon", label: "Ulraz S`Lon", minLevel: 61, maxLevel: 61 },
  { slug: "xon-quexill", label: "Xon Quexill", minLevel: 61, maxLevel: 61 },
];

const BATCHES: [string, string, typeof COMMONS][] = [
  ["neriak-commons", "zone:neriak-commons", COMMONS],
  ["neriak-foreign-quarter", "zone:neriak-foreign-quarter", FOREIGN_QUARTER],
  ["neriak-3rd-gate", "zone:neriak-3rd-gate", THIRD_GATE],
];

let added = 0;
for (const [zoneSlug, zoneId, mobs] of BATCHES) {
  for (const mob of mobs) {
    const id = `mob:${zoneSlug}:${mob.slug}`;
    if (!hasNode(id)) added++;
    addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
    addEdge(id, zoneId, "located_in");
  }
}

save();
console.log(`Migration 234 complete: ${added} mob node(s) added across Neriak Commons/Foreign Quarter/Third Gate`);
