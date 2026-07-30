/**
 * Migration 382: froglok starting-hub content for Rathe Mountains (issue
 * #54). eqlwiki.com has no page for any of this yet (confirmed zero hits
 * for "froglok starting," "phosphorous," "Gukta," etc. -- see the issue's
 * own technical note), so this is sourced from a real EQL chat log instead
 * (decisions/quest-log-sourcing-and-incomplete-flag.md), parsed with the
 * new scripts/parse-eq-log.ts. Dialogue quoted here is verbatim from that
 * log, not paraphrased/invented.
 *
 * "Gukta, the Outpost of Marr" -- the froglok hub these NPCs live in -- is
 * confirmed in-game (by the project owner, playing live) to be physically
 * inside the existing Rathe Mountains zone, not a separate loadable zone;
 * that's the actual authority for this placement. wiki.project1999.com's
 * Froglok page ("Gukta was relocated to the Rathe Mountains") is classic-EQ
 * lore (decisions/eql-vs-classic-eq-zone-connectivity.md says not to trust
 * that source for EQL facts) and is cited here only as flavor corroboration
 * that happens to agree, not as the sourced fact.
 *
 * Three real player-actionable quests turned up; all three are flagged
 * `incomplete` (decisions/tradeskill-recipe-node-schema.md-style "flag
 * what's unconfirmed rather than invent it" -- this is the same call
 * applied to quests, via the new quest.incomplete/.incompleteNote fields
 * and quest-shared.js's incompleteBadge()):
 *   - Zok Zribb's phosphorous powder request: reward and the powder's real
 *     source are both unconfirmed (the issue's own "had no clue where to
 *     get the quest item" gap).
 *   - Dar Collector Reokar's bone-fragment request: same shape, reward and
 *     source unconfirmed.
 *   - "The Sword of Chalex" (a descriptive label of our own -- no in-game
 *     journal title was ever captured, since the log never shows one):
 *     Master Scribe Uklo's multi-part lore quest to recover three pieces of
 *     a sword sealing a dead froglok hero's spirit. Piece 2 (the troll
 *     Gribnor, Neriak 3rd Gate) and piece 3 (an insane explorer, Lower Guk)
 *     are geographically placed; piece 1 (Chalex's own bones, somewhere in
 *     Rathe Mountains) is not -- the project owner hasn't found it in-game
 *     yet. Whether this is really one combined quest or three independent
 *     hand-ins, and what (if anything) completing all three actually
 *     rewards, are also unconfirmed.
 *
 * Every other named NPC the log encountered gets a roster entry too, full
 * roster not just quest-relevant subset (this graph's usual bestiary
 * convention) -- most carry no role at all (zero roles = "named resident,
 * no known function", an existing convention per
 * decisions/npc-mob-unification-and-zone-groups.md), since their only
 * captured dialogue is a redirect ("seek out the Armorers...") or ambient
 * flavor with nothing player-actionable in it. Zok Tabruu/Caropni/Kilikko
 * never got their own "Targeted (Merchant)" line in this log segment, but
 * share the exact same canned dialogue and "Zok" naming convention as three
 * confirmed Merchants (Zribb/Sevrana/Giisip) -- vendor role inferred from
 * that pattern, not directly confirmed.
 *
 * Also updates Rathe Mountains' own map legend: pin 20 previously read only
 * "Sphinx (Zazamoukh)" (an existing mob still in the zone, per the project
 * owner) -- now also notes it's Gukta's location, rather than dropping the
 * sphinx reference to make room.
 */

import { loadGraph } from "./_lib";

const { graph, addNode, addEdge, addGiver, updateNode, save } = loadGraph(import.meta.dir);

const ratheId = "zone:rathe-mountains";
const neriak3rdId = "zone:neriak-3rd-gate";
const lowerGukId = "zone:lower-guk";

function addNpc(id: string, label: string, roles: string[] = []) {
  addNode({ id, label, type: "npc", ...(roles.length ? { roles } : {}) });
  addEdge(id, ratheId, "located_in");
}

// ---------------------------------------------------------------------
// Gukta's NPC roster
// ---------------------------------------------------------------------
addNpc("npc:rathe-mountains:shin-master-grubbus", "Shin Master Grubbus", ["guildmaster"]);
addNpc("npc:rathe-mountains:scribe-rikik", "Scribe Rikik", ["vendor"]);
addNpc("npc:rathe-mountains:dar-banker-zlopps", "Dar Banker Zlopps", ["banker"]);
addNpc("npc:rathe-mountains:froglok-guardsman", "A froglok guardsman", ["guard"]);
addNpc("npc:rathe-mountains:zok-sevrana", "Zok Sevrana", ["vendor"]);
addNpc("npc:rathe-mountains:zok-giisip", "Zok Giisip", ["vendor"]);
addNpc("npc:rathe-mountains:dar-forager-lumun", "Dar Forager Lumun", ["vendor"]);
addNpc("npc:rathe-mountains:zok-tabruu", "Zok Tabruu", ["vendor"]);
addNpc("npc:rathe-mountains:zok-caropni", "Zok Caropni", ["vendor"]);
addNpc("npc:rathe-mountains:zok-kilikko", "Zok Kilikko", ["vendor"]);
addNpc("npc:rathe-mountains:yun-trainer-kintok", "Yun Trainer Kintok", ["guildmaster"]);
addNpc("npc:rathe-mountains:kor-trainer-galdok", "Kor Trainer Galdok", ["guildmaster"]);
addNpc("npc:rathe-mountains:assistant-faldok", "Assistant Faldok");
addNpc("npc:rathe-mountains:lokta-elder-gritib", "Lokta Elder Gritib");
addNpc("npc:rathe-mountains:zokta-elder-gubbigo", "Zokta Elder Gubbigo");
addNpc("npc:rathe-mountains:lokta-elder-froops", "Lokta Elder Froops");
addNpc("npc:rathe-mountains:lokta-elder-ginnid", "Lokta Elder Ginnid");
addNpc("npc:rathe-mountains:zokta-noble-groobl", "Zokta Noble Groobl");
addNpc("npc:rathe-mountains:zokta-elder-fogug", "Zokta Elder Fogug");
addNpc("npc:rathe-mountains:lokta-elder-nywlek", "Lokta Elder Nywlek");
addNpc("npc:rathe-mountains:zokta-noble-bribbiz", "Zokta Noble Bribbiz");
addNpc("npc:rathe-mountains:dar-strategist-guib", "Dar Strategist Guib");
addNpc("npc:rathe-mountains:quartermaster-grik", "Quartermaster Grik");
addNpc("npc:rathe-mountains:tugog-grigol", "Tugog Grigol");

// ---------------------------------------------------------------------
// Quest 1: Zok Zribb's phosphorous powder
// ---------------------------------------------------------------------
{
  const zribbId = "npc:rathe-mountains:zok-zribb";
  addNode({ id: zribbId, label: "Zok Zribb", type: "npc", roles: ["vendor", "quest_giver"] });
  addEdge(zribbId, ratheId, "located_in");

  const questId = "quest:zok-zribbs-phosphorous-powder";
  addNode({
    id: questId,
    label: "Phosphorous Powder for Zok Zribb",
    type: "quest",
    description:
      "Zok Zribb, a merchant in Gukta (Rathe Mountains): \"Ever since we left Guk behind, we've had to buy every scrap of phosphorous powder we can find. The stuff is incredibly useful for farming, smithing, alchemical work, and as a pest repellent! It used to seep in through the cracks in the walls of Guk, making it quite plentiful, however, we've had to scrounge every bit out here. If you could bring me two pinches of phospherous powder, I'd be most grateful!\"",
    steps: ["Hail Zok Zribb in Rathe Mountains and ask about 'supplies'.", "Bring 2 pinches of phosphorous powder back to Zok Zribb."],
    incomplete: true,
    incompleteNote: "Where phosphorous powder actually comes from, and this quest's reward, are both unconfirmed -- not yet found in-game or documented on eqlwiki.com.",
  });
  addEdge(zribbId, questId, "starts");
  addEdge(questId, ratheId, "starts_in");
}

// ---------------------------------------------------------------------
// Quest 2: Dar Collector Reokar's bone fragments
// ---------------------------------------------------------------------
{
  const reokarId = "npc:rathe-mountains:dar-collector-reokar";
  addNpc(reokarId, "Dar Collector Reokar", ["quest_giver"]);

  const questId = "quest:dar-collector-reokars-bone-fragments";
  addNode({
    id: questId,
    label: "Bone Fragments for Dar Collector Reokar",
    type: "quest",
    description:
      "Dar Collector Reokar, in Gukta (Rathe Mountains): \"I collect and study the mutations of the various pests in the area, collecting data on the effects of the environment they live in over a lengthy period of time. This research helps me track patterns and come up with more effective salves and other for our armies. Currently, I'm studying the recent infestation of skeletons. If you could bring me any fragments of bone you may find, I'd appreciate it.\"",
    steps: ["Hail Dar Collector Reokar in Rathe Mountains.", "Bring fragments of bone back to Dar Collector Reokar."],
    incomplete: true,
    incompleteNote: "This quest's reward, and exactly what counts as a qualifying bone fragment, are unconfirmed.",
  });
  addEdge(reokarId, questId, "starts");
  addEdge(questId, ratheId, "starts_in");
}

// ---------------------------------------------------------------------
// Quest 3: The Sword of Chalex (Master Scribe Uklo)
// ---------------------------------------------------------------------
{
  const ukloId = "npc:rathe-mountains:master-scribe-uklo";
  addNpc(ukloId, "Master Scribe Uklo", ["quest_giver"]);

  const questId = "quest:the-sword-of-chalex";
  addNode({
    id: questId,
    label: "The Sword of Chalex",
    type: "quest",
    description:
      "Master Scribe Uklo, Gukta (Rathe Mountains): \"Long ago, a great hero of our people lost his life fighting the trolls. He was in Rathe Mountains investigating a rumor that the trolls were stockpiling special weapons in an effort to turn the tide of war back in their favor. He was ambushed by a group of troll marauders and their captain Krignok. He fought valiantly, slaying the marauders and eventually locking swords with the captain. But in the end, exhaustion got the better of him and he died by the troll's hand. The Krignok respected the froglok's ferocity and swore that they would one day finish their fight. So through a dark ritual the troll captain locked the froglok's spirit in his own sword and broke it into three pieces. One piece he placed on the battlefield where they fought. The other piece he gave to an infamous troll warrior to guard. The location of the third piece has been lost over the time but there are clues as to where it may be.\"",
    steps: [
      "Hail Master Scribe Uklo in Rathe Mountains and ask about 'powerful magic', 'illusions', 'teach', and 'prove' to hear the full story.",
      "Piece 1 -- 'battlefield': at the bones of froglok warrior Chalex, somewhere in Rathe Mountains. Say aloud \"I wish to recover what is lost\" at the bones. Exact location not yet found.",
      "Piece 2 -- 'infamous troll': held by the troll Gribnor, described as short but immensely strong, in Neriak - Third Gate.",
      "Piece 3 -- 'clues': lost in Lower Guk, in the possession of an explorer the sword's power drove insane.",
    ],
    incomplete: true,
    incompleteNote: "Chalex's exact bones location in Rathe Mountains, the reward for completing all three pieces, and whether this is one combined quest vs. three independent hand-ins are all unconfirmed. \"The Sword of Chalex\" is a descriptive label of our own -- no in-game journal title was captured in the log.",
  });
  addEdge(ukloId, questId, "starts");
  addEdge(questId, ratheId, "starts_in");
  addEdge(questId, ratheId, "located_in");
  addEdge(questId, neriak3rdId, "located_in");
  addEdge(questId, lowerGukId, "located_in");
}

// ---------------------------------------------------------------------
// Rathe Mountains map legend: pin 20 is also Gukta
// ---------------------------------------------------------------------
{
  const zone = graph.nodes.find((n: { id: string }) => n.id === ratheId);
  const legend = zone?.maps?.[0]?.legend as { key: string; label: string }[] | undefined;
  const pin20 = legend?.find((entry) => entry.key === "20");
  if (pin20) pin20.label = "Gukta, the Froglok Outpost of Marr (also Sphinx: Zazamoukh)";
}

save();

console.log(
  "Migration 382 complete: added Rathe Mountains' froglok Gukta hub (24 NPCs), 3 log-sourced quests flagged incomplete (issue #54), and updated the zone's map legend pin 20."
);
