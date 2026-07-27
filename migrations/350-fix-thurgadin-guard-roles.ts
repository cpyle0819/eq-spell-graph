/**
 * Migration 350: fixes issue #41's high-mob-count flags for zone:thurgadin
 * (117 mobs) and the "Guard `<name>`" subset of zone:plane-of-mischief's
 * mob roster, by applying migration 265's own label-detection rule
 * (decisions/npc-mob-unification-and-zone-groups.md: "guard if its label
 * matches /^(A |An )?Guard /, else mob") to 35 npc nodes that were added
 * *after* migration 265 without it.
 *
 * Root cause: migration 302 (Thurgadin bestiary) added "Guard `<name>`"
 * npcs directly with `roles: ["mob"]`, and its own docblock claims this is
 * "consistent with Kaladim's precedent for a friendly city with a real,
 * farmable guard roster" -- but that citation is backwards. Kaladim's own
 * pre-existing `mob:*-kaladim:guard-*` nodes (see e.g.
 * mob:south-kaladim:guard-didek) all correctly carry `roles: ["guard"]`,
 * not `["mob"]`, because they existed before migration 265 and got its
 * automatic conversion. Migration 302 never got that conversion and
 * introduced 32 mislabeled nodes; zone:plane-of-mischief's bestiary
 * migration made the same mistake for 3 more.
 *
 * This is a narrow, mechanical fix (swap "mob" for "guard" in `roles`,
 * nothing else) -- it does not touch Thurgadin's other ~85 mob-role named
 * citizens (Lieutenant/Templar/Initiate/Loremaster/plain names), which
 * migration 302's own docblock already documented as individually
 * eqlwiki-verified real leveled NPCs kept deliberately per the "stats over
 * name/role" rule, not an oversight.
 *
 * zone:plane-of-mischief's other high-mob-adjacent flag this run --
 * duplicate label "Lithiniath" appears 2 times -- is a false positive, not
 * a bug: the two nodes (`lithiniath-black-version`, `lithiniath-white-
 * version`) are already disambiguated by id suffix, representing two
 * genuinely distinct color-variant spawns, the same reused-name pattern
 * already accepted for "Priest of Discord" elsewhere. Left as-is.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const GUARD_RE = /^(A |An )?Guard /;
const TARGET_ZONES = ["thurgadin", "plane-of-mischief"];

let fixed = 0;

for (const node of graph.nodes) {
  if (node.type !== "npc") continue;
  if (!TARGET_ZONES.some((z) => node.id.startsWith(`npc:${z}:`))) continue;
  if (!GUARD_RE.test(node.label)) continue;
  const roles: string[] = node.roles || [];
  if (!roles.includes("mob")) continue;
  node.roles = roles.filter((r) => r !== "mob").concat("guard");
  fixed++;
}

save();
console.log(`Migration 350 complete: ${fixed} npc node(s) converted from mob to guard role`);
