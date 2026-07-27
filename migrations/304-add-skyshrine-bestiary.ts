/**
 * Migration 304: add npc nodes (roles: ["mob"]) for zone:skyshrine, per
 * the unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #36.
 *
 * `Category:Skyshrine` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to
 * 188 `{{Namedmobpage}}` candidates -- the largest single-zone bestiary
 * sourced in this issue so far, reflecting Skyshrine's status as a
 * Claws-of-Veeshan dragon stronghold layered over a sprawling maze: the
 * Fe`Dhar wyvern clan (dozens of named individuals), Laoch dragon-kin,
 * gargoyle/golem sentries and guardians, bartenders/bouncers in the
 * zone's own tavern, and epic-quest figures (Lord Yelinak, Ziglark
 * Whisperwing, the Skyshrine/armor-quest NPCs).
 *
 * No exclusions this batch -- every candidate carries a stated numeric
 * level with no `GM` guildmaster tell, no boats, and no candidate whose
 * own `zone` field pointed elsewhere. "A Kromzek Spy" and "A krom zek
 * spy" are two distinct pages despite the similar name: the latter is
 * explicitly "Sentry Rotiart"'s own triggered transformed spawn (per its
 * description), kept separately from the ordinary roaming "A Kromzek
 * Spy", same both-versions-real precedent as Ocean of Tears/Timorous
 * Deep's regular/triggered pairs. "A gargoyle guard" and "A Gargoyle
 * Guardian" are likewise two separate pages (one's own description flags
 * the possible mix-up but they're sourced as distinct entries here, same
 * call as keeping visually-similar-but-separately-paged creatures
 * elsewhere). "Pyrox" carries a `Banker` class tag but, like Thurgadin's
 * Gage/Mort and The Overthere's Tin Bankers before it, this is a hostile
 * dungeon with no friendly-city civic roster to begin with -- kept per
 * the same "stats over name" rule.
 *
 * "Ralgyn", "Sentry Emil", "Lord Yelinak", "Lawyla", "Oglard", "Adwetram
 * Fe`Dhar", "Commander Leuz", "Ziglark Whisperwing", "Sentry Kale",
 * "Sentry Kcor", and "Supreme Laochsmith Psorin" already existed as
 * `npc:` quest-giver nodes -- same both-roles-legitimate shape as The
 * Warrens' Aderius Rhenar/Koajin, so this batch unions the `mob` role and
 * level data onto them rather than skipping.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Ralgyn", minLevel: 60, maxLevel: 60 },
  { label: "Sentry Emil", minLevel: 37, maxLevel: 37 },
  { label: "Lord Yelinak", minLevel: 70, maxLevel: 70 },
  { label: "Liason Dolvak", minLevel: 39, maxLevel: 39 },
  { label: "Patroller Doruuk", minLevel: 33, maxLevel: 33 },
  { label: "Patroller Imochen", minLevel: 36, maxLevel: 36 },
  { label: "Patroller Sven", minLevel: 38, maxLevel: 38 },
  { label: "Patroller Unelorn", minLevel: 34, maxLevel: 34 },
  { label: "Patroller Victan", minLevel: 34, maxLevel: 34 },
  { label: "Fardonad Fe`Dhar", minLevel: 35, maxLevel: 35 },
  { label: "A Crystal Spider", minLevel: 27, maxLevel: 31 },
  { label: "Jahuta Botara", minLevel: 38, maxLevel: 38 },
  { label: "Orivin Vor`Tun", minLevel: 47, maxLevel: 47 },
  { label: "Vren T`Nek", minLevel: 34, maxLevel: 34 },
  { label: "Welenor", minLevel: 39, maxLevel: 39 },
  { label: "Drash Du Nen", minLevel: 34, maxLevel: 34 },
  { label: "Lothieder Fe`Dhar", minLevel: 35, maxLevel: 35 },
  { label: "Lawyla", minLevel: 65, maxLevel: 65 },
  { label: "A Shambling Cube", minLevel: 44, maxLevel: 49 },
  { label: "Dalshim Fe`Dhar", minLevel: 50, maxLevel: 50 },
  { label: "Deoryn Fe`Dhar", minLevel: 48, maxLevel: 48 },
  { label: "Dygwyn Fe`Dhar", minLevel: 45, maxLevel: 45 },
  { label: "Dyr Fe`Dhar", minLevel: 54, maxLevel: 54 },
  { label: "Elder Hajnix", minLevel: 55, maxLevel: 55 },
  { label: "Elder Kajind", minLevel: 55, maxLevel: 55 },
  { label: "Elder Kalur", minLevel: 55, maxLevel: 55 },
  { label: "Eldriaks Fe`Dhar", minLevel: 58, maxLevel: 58 },
  { label: "Elyshum Fe`Dhar", minLevel: 47, maxLevel: 47 },
  { label: "Glydoc Fe`Dhar", minLevel: 48, maxLevel: 48 },
  { label: "Jualicn", minLevel: 65, maxLevel: 65 },
  { label: "Kalacs Fe`Dhar", minLevel: 46, maxLevel: 46 },
  { label: "Laoch Ealkiq", minLevel: 61, maxLevel: 61 },
  { label: "Laoch Zalbryn", minLevel: 57, maxLevel: 57 },
  { label: "Lignark", minLevel: 62, maxLevel: 62 },
  { label: "Medry Fe`Dhar", minLevel: 50, maxLevel: 50 },
  { label: "Morachii Fe`Dhar", minLevel: 49, maxLevel: 49 },
  { label: "Oct Velic", minLevel: 43, maxLevel: 43 },
  { label: "Oglard", minLevel: 65, maxLevel: 65 },
  { label: "Placlis", minLevel: 65, maxLevel: 65 },
  { label: "Poalgin Fe`Dhar", minLevel: 45, maxLevel: 45 },
  { label: "Qalcnic Fe`Dhar", minLevel: 46, maxLevel: 46 },
  { label: "Quadrix Velic", minLevel: 60, maxLevel: 60 },
  { label: "Riran Fe`Dhar", minLevel: 51, maxLevel: 51 },
  { label: "Taegria Fe`Dhar", minLevel: 47, maxLevel: 47 },
  { label: "Talgixn Fe`Dhar", minLevel: 52, maxLevel: 52 },
  { label: "Talnifs", minLevel: 65, maxLevel: 65 },
  { label: "Talon Velic", minLevel: 65, maxLevel: 65 },
  { label: "Tonvan Fe`Dhar", minLevel: 55, maxLevel: 55 },
  { label: "Tri Velic", minLevel: 58, maxLevel: 58 },
  { label: "Tyddyn Fe`Dhar", minLevel: 52, maxLevel: 52 },
  { label: "Vellyn Fe`Dhar", minLevel: 49, maxLevel: 49 },
  { label: "Vobryn Fe`Dhar", minLevel: 47, maxLevel: 47 },
  { label: "Zaldin Fe`Dhar", minLevel: 60, maxLevel: 60 },
  { label: "Adwetram Fe`Dhar", minLevel: 35, maxLevel: 35 },
  { label: "Qynydd Fe`Dhar", minLevel: 35, maxLevel: 35 },
  { label: "Bezeb", minLevel: 38, maxLevel: 38 },
  { label: "Chymot", minLevel: 35, maxLevel: 35 },
  { label: "Norsirx", minLevel: 32, maxLevel: 32 },
  { label: "Commander Leuz", minLevel: 34, maxLevel: 34 },
  { label: "Jaylorx", minLevel: 46, maxLevel: 46 },
  { label: "Suez", minLevel: 41, maxLevel: 41 },
  { label: "Yaced", minLevel: 34, maxLevel: 34 },
  { label: "Zalerez", minLevel: 35, maxLevel: 35 },
  { label: "Ziglark Whisperwing", minLevel: 36, maxLevel: 36 },
  { label: "Umykith Fe`Dhar", minLevel: 35, maxLevel: 35 },
  { label: "Jendavudd Fe`Dhar", minLevel: 35, maxLevel: 35 },
  { label: "Onerind Fe`Dhar", minLevel: 35, maxLevel: 35 },
  { label: "Komawin Fe`Dhar", minLevel: 35, maxLevel: 35 },
  { label: "Crendatha Fe`Dhar", minLevel: 35, maxLevel: 35 },
  { label: "Asteinnon Fe`Dhar", minLevel: 35, maxLevel: 35 },
  { label: "Nalelin Fe`Dhar", minLevel: 35, maxLevel: 35 },
  { label: "Ocoenydd Fe`Dhar", minLevel: 35, maxLevel: 35 },
  { label: "Abudan Fe`Dhar", minLevel: 35, maxLevel: 35 },
  { label: "Elaend Fe`Dhar", minLevel: 35, maxLevel: 35 },
  { label: "Sentry Kale", minLevel: 39, maxLevel: 39 },
  { label: "A Gargoyle Guardian", minLevel: 37, maxLevel: 37 },
  { label: "Sentry Kcor", minLevel: 25, maxLevel: 25 },
  { label: "Supreme Laochsmith Psorin", minLevel: 59, maxLevel: 59 },
  { label: "Jaelk", minLevel: 47, maxLevel: 47 },
  { label: "Sentry Rotiart", minLevel: 43, maxLevel: 43 },
  { label: "A Large Velium Statue", minLevel: 53, maxLevel: 53 },
  { label: "A Kromzek Spy", minLevel: 55, maxLevel: 55 },
  { label: "A Golem Adjudicator", minLevel: 36, maxLevel: 36 },
  { label: "An Aged Golem Sentinel", minLevel: 43, maxLevel: 43 },
  { label: "A krom zek spy", minLevel: 53, maxLevel: 55 },
  { label: "Trezum", minLevel: 38, maxLevel: 38 },
  { label: "Evreth Menesez", minLevel: 35, maxLevel: 35 },
  { label: "A Hungry Cube", minLevel: 37, maxLevel: 37 },
  { label: "Pyrox", minLevel: 45, maxLevel: 45 },
  { label: "Guardian Selbbep", minLevel: 35, maxLevel: 35 },
  { label: "A gargoyle guard", minLevel: 37, maxLevel: 37 },
  { label: "Telnaq", minLevel: 42, maxLevel: 42 },
  { label: "Zynil", minLevel: 43, maxLevel: 43 },
  { label: "Tetragon Velic", minLevel: 35, maxLevel: 35 },
  { label: "Orthor Velic", minLevel: 35, maxLevel: 35 },
  { label: "Lararith", minLevel: 45, maxLevel: 45 },
  { label: "A Dalgortha", minLevel: 53, maxLevel: 53 },
  { label: "Count Grivennor", minLevel: 48, maxLevel: 48 },
  { label: "Sentry Enots", minLevel: 25, maxLevel: 25 },
  { label: "Sentry Dolsam", minLevel: 35, maxLevel: 35 },
  { label: "Nalginor Fe`Dhar", minLevel: 46, maxLevel: 46 },
  { label: "Ualkic Fe`Dhar", minLevel: 46, maxLevel: 46 },
  { label: "Laegdric Fe`Dhar", minLevel: 43, maxLevel: 43 },
  { label: "A Huge Gargoyle Guard", minLevel: 65, maxLevel: 65 },
  { label: "A Huge Golem Sentry", minLevel: 64, maxLevel: 64 },
  { label: "Ahcaz", minLevel: 34, maxLevel: 34 },
  { label: "Anex", minLevel: 36, maxLevel: 36 },
  { label: "Bartender Chalgoc", minLevel: 34, maxLevel: 34 },
  { label: "Bartender Diphenyl", minLevel: 34, maxLevel: 34 },
  { label: "Bartender Helvit", minLevel: 34, maxLevel: 34 },
  { label: "Bartender Ovalene", minLevel: 34, maxLevel: 34 },
  { label: "Beeliz Fe`Dhar", minLevel: 40, maxLevel: 40 },
  { label: "Blodoc Fe`Dhar", minLevel: 45, maxLevel: 45 },
  { label: "Bouncer Boulder", minLevel: 34, maxLevel: 34 },
  { label: "Calexic Fe`Dhar", minLevel: 45, maxLevel: 45 },
  { label: "Count Darchen", minLevel: 48, maxLevel: 48 },
  { label: "Count Taloob", minLevel: 48, maxLevel: 48 },
  { label: "Erepon", minLevel: 35, maxLevel: 35 },
  { label: "Guardian Brichon", minLevel: 34, maxLevel: 34 },
  { label: "Guardian Chairny", minLevel: 43, maxLevel: 43 },
  { label: "Guardian Elgoyr", minLevel: 43, maxLevel: 43 },
  { label: "Guardian Laigyr", minLevel: 36, maxLevel: 36 },
  { label: "Guardian Llomed", minLevel: 36, maxLevel: 36 },
  { label: "Guardian Lyaric", minLevel: 37, maxLevel: 37 },
  { label: "Guardian Noit", minLevel: 35, maxLevel: 35 },
  { label: "Guardian Olgax", minLevel: 44, maxLevel: 44 },
  { label: "Guardian Quliax", minLevel: 44, maxLevel: 44 },
  { label: "Guardian Rolsa", minLevel: 39, maxLevel: 39 },
  { label: "Guardian Salgor", minLevel: 49, maxLevel: 49 },
  { label: "Guardian Salva", minLevel: 35, maxLevel: 35 },
  { label: "Guardian Selucreh", minLevel: 32, maxLevel: 32 },
  { label: "Guardian Silnark", minLevel: 45, maxLevel: 45 },
  { label: "Guardian Synarus", minLevel: 39, maxLevel: 39 },
  { label: "Guardian Tion", minLevel: 35, maxLevel: 35 },
  { label: "Guardian Torret", minLevel: 31, maxLevel: 31 },
  { label: "Guardian Xatyl", minLevel: 39, maxLevel: 39 },
  { label: "Guardian Xilac", minLevel: 35, maxLevel: 35 },
  { label: "Laoch Aewern", minLevel: 61, maxLevel: 61 },
  { label: "Laoch Chief Seti", minLevel: 64, maxLevel: 64 },
  { label: "Laoch Drazifs", minLevel: 61, maxLevel: 61 },
  { label: "Laoch Drixnal", minLevel: 58, maxLevel: 58 },
  { label: "Laoch Jaklor", minLevel: 55, maxLevel: 55 },
  { label: "Laoch Juklax", minLevel: 60, maxLevel: 60 },
  { label: "Laoch Laeor", minLevel: 61, maxLevel: 61 },
  { label: "Laoch Maljix", minLevel: 59, maxLevel: 59 },
  { label: "Laoch Nablibx", minLevel: 60, maxLevel: 60 },
  { label: "Laoch Sabtooth", minLevel: 58, maxLevel: 58 },
  { label: "Laoch Salthz", minLevel: 60, maxLevel: 60 },
  { label: "Laoch Uljux", minLevel: 55, maxLevel: 55 },
  { label: "Laoch Yailin", minLevel: 55, maxLevel: 55 },
  { label: "Laoch Yilnor", minLevel: 60, maxLevel: 60 },
  { label: "Laoch Yralix", minLevel: 58, maxLevel: 58 },
  { label: "Laoch Yubtin", minLevel: 57, maxLevel: 57 },
  { label: "Laoch Zelnair", minLevel: 55, maxLevel: 55 },
  { label: "Laoch Zialben", minLevel: 59, maxLevel: 59 },
  { label: "Lyphor", minLevel: 39, maxLevel: 39 },
  { label: "Meonyc Fe`Dhar", minLevel: 43, maxLevel: 43 },
  { label: "Merec", minLevel: 25, maxLevel: 25 },
  { label: "Oazyln Fe`Dhar", minLevel: 46, maxLevel: 46 },
  { label: "Osino", minLevel: 29, maxLevel: 29 },
  { label: "Polhidrix Velic", minLevel: 40, maxLevel: 40 },
  { label: "Propron", minLevel: 30, maxLevel: 30 },
  { label: "Saliz Fe`Dhar", minLevel: 42, maxLevel: 42 },
  { label: "Sarot", minLevel: 34, maxLevel: 34 },
  { label: "Sentry Bruchz", minLevel: 34, maxLevel: 34 },
  { label: "Sentry Drahs", minLevel: 37, maxLevel: 37 },
  { label: "Sentry Galgix", minLevel: 48, maxLevel: 48 },
  { label: "Sentry Goman", minLevel: 34, maxLevel: 34 },
  { label: "Sentry Haerz", minLevel: 34, maxLevel: 34 },
  { label: "Sentry Halcix", minLevel: 34, maxLevel: 34 },
  { label: "Sentry Hubniq", minLevel: 41, maxLevel: 41 },
  { label: "Sentry Iglotn", minLevel: 48, maxLevel: 48 },
  { label: "Sentry Kaop", minLevel: 46, maxLevel: 46 },
  { label: "Sentry Maof", minLevel: 37, maxLevel: 37 },
  { label: "Sentry Marfat", minLevel: 33, maxLevel: 33 },
  { label: "Sentry Nalox", minLevel: 43, maxLevel: 43 },
  { label: "Sentry Plaxgc", minLevel: 47, maxLevel: 47 },
  { label: "Sentry Vlaz", minLevel: 36, maxLevel: 36 },
  { label: "Sentry Wegylx", minLevel: 38, maxLevel: 38 },
  { label: "Sentry Yeakloc", minLevel: 48, maxLevel: 48 },
  { label: "Sentry Zalgoty", minLevel: 44, maxLevel: 44 },
  { label: "Teoc Fe`Dhar", minLevel: 46, maxLevel: 46 },
  { label: "The Seer", minLevel: 63, maxLevel: 63 },
  { label: "Tycyn Fe`Dhar", minLevel: 46, maxLevel: 46 },
  { label: "Veobryn Fe`Dhar", minLevel: 44, maxLevel: 44 },
  { label: "Wealrn Fe`Dhar", minLevel: 46, maxLevel: 46 },
  { label: "Yeinn Kor`Va", minLevel: 44, maxLevel: 44 },
  { label: "Zeldaile Fe`Dhar", minLevel: 43, maxLevel: 43 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:skyshrine:${slug(mob.label)}`;
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
  addEdge(id, "zone:skyshrine", "located_in");
  added++;
}

save();
console.log(`Migration 304 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:skyshrine`);
