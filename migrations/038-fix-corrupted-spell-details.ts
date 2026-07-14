/**
 * Migration 038: Fix spell detail data corrupted by migration 011's scraper.
 *
 * Migration 011 enriched spell nodes from data/spell-details.json, produced
 * by scripts/scrape-spell-details.ts parsing each spell's wiki infobox
 * template. On 16 spells the parser mis-split the raw `{{Spell Infobox|...}}`
 * pipe-delimited template, producing two distinct failure shapes (found
 * while investigating a user report that "Form of the Bear" looked
 * corrupted; verified against eqlwiki.com per decisions/
 * eqlwiki-quest-research-method.md's "quote verbatim" method):
 *
 * 1. Cascading field corruption (Form of the Bear, Mass Imbue Sapphire):
 *    duration/targetType/spellType/resist each retained the entire
 *    remaining tail of the pipe-delimited template starting from their own
 *    key onward, instead of being isolated to just their own value.
 * 2. Truncated description (the 5 warder "Spirit of ..." spells, Rune I,
 *    Rune II): description text was cut off mid-sentence into a raw
 *    `{{SpellHoverLink|...` or `{{:ItemName` template fragment, losing the
 *    real remainder of the sentence.
 * 3. Garbage `resist` field (9 spells): resist held a stray `"| other ="` or
 *    `"| msg_cast_on_you = ..."` template fragment instead of a real value.
 *    All 9 verified on eqlwiki.com to have a blank/empty resist field (same
 *    as many other legitimate spells already in the graph), so the field is
 *    removed rather than given a fabricated value.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const DATA_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

const nodeById = (id: string) => {
  const n = graph.nodes.find((n: { data: { id: string } }) => n.data.id === id);
  if (!n) throw new Error(`Node not found: ${id}`);
  return n.data;
};

// 1. Cascading field corruption
Object.assign(nodeById("spell:form-of-the-bear"), {
  description: "Illusion: Old Bear,  Increase Current Hit Points by 1 per Tick,   \tIncrease Wisdom by 5",
  duration: "2h 24m",
  targetType: "Self",
  spellType: "Beneficial",
});
delete nodeById("spell:form-of-the-bear").resist;

Object.assign(nodeById("spell:mass-imbue-sapphire"), {
  description: "Focuses the power of Innoruuk  into Sapphire. Consumes an Sapphire x5 when cast. Creates an Imbued Sapphire x5.",
  duration: "Instant",
  targetType: "Self",
  spellType: "Beneficial",
  resist: "Unresistable",
});

// 2. Truncated description -- completed with the same raw wikitext the
// scraper cut off mid-sentence (quoted verbatim, including the wiki's own
// unrendered {{...}} damage-type template artifact -- eqlwiki.com's own
// page source has this, not a fetch-tool rendering issue).
nodeById("spell:spirit-of-lightning").description =
  "Fills your warder with the power of a great spirit, increasing their dexterity by 75 and giving them a chance to perform Spirit of Lightning Strike, a {44}1 attack.";
nodeById("spell:spirit-of-the-blizzard").description =
  "Fills your warder with the power of a great spirit, increasing their dexterity by 75 and giving them a chance to perform Spirit of Blizzard Strike, a {44}3 attack.";
nodeById("spell:spirit-of-inferno").description =
  "Fills your warder with the power of a great spirit, increasing their dexterity by 75 and giving them a chance to perform Spirit of Inferno Strike, a {44}2 attack.";
nodeById("spell:spirit-of-the-scorpion").description =
  "Fills your warder with the power of a great spirit, increasing their dexterity by 75 and giving them a chance to perform Spirit of Scorpion Strike, a {44}4 attack.";
nodeById("spell:spirit-of-vermin").description =
  "Fills your warder with the power of a great spirit, increasing their dexterity by 75 and giving them a chance to perform Spirit of Vermin Strike, a {44}5 attack.";
nodeById("spell:rune-i").description =
  "Covers your target in a shimmer of runes that absorb damage.  Consumes a Cat's Eye Agate when cast.";
nodeById("spell:rune-ii").description =
  "Covers your target in a shimmer of runes that absorb damage.  Consumes a Bloodstone when cast.";

// 3. Garbage resist field -- all 9 verified blank on eqlwiki.com
for (const id of [
  "spell:talisman-of-the-beast",
  "spell:remove-minor-curse",
  "spell:remove-lesser-curse",
  "spell:rizlona-s-embers",
  "spell:shock-of-venom",
  "spell:kragg-s-salve",
  "spell:o-keil-s-embers",
  "spell:o-keil-s-levity",
  "spell:o-keil-s-flickering-flame",
]) {
  delete nodeById(id).resist;
}

writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 038 complete: fixed 16 corrupted spell detail records");
