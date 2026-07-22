/**
 * Migration 111: seventh batch of GitHub issue #26's "Questlines" section,
 * plus two standalone spell-trade quests from the main quest list.
 * Researched against eqlwiki.com per decisions/eqlwiki-quest-research-method.md.
 *
 * Covers: Dozekar Tear Quests (quest_group of 13 confirmed sibling turn-ins,
 * per decisions/quest-group-node-type.md -- unordered parallel options across
 * three givers, not a chain; ~2 more may exist per the wiki's own cross-links
 * but weren't found), Druid Spells, Enchanter Spells (Good) and (Evil).
 *
 * Reward items for the Dozekar sub-quests are modeled without numeric stats --
 * eqlwiki.com's own pages for these particular items weren't fetched/confirmed,
 * so only the name and source are recorded rather than fabricating stats.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addGiver, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Dozekar Tear Quests
// ---------------------------------------------------------------------
{
  const veeshanId = "zone:temple-of-veeshan";
  const meleeClasses = ["bard", "monk", "paladin", "ranger", "rogue", "shadow knight", "warrior"];
  const casterClasses = ["enchanter", "magician", "necromancer", "wizard"];
  const priestClasses = ["cleric", "druid", "shaman"];

  const lendiniaraId = "npc:temple-of-veeshan:lendiniara-the-keeper";
  addGiver(lendiniaraId, "Lendiniara the Keeper", veeshanId);
  const telkorenarId = "npc:temple-of-veeshan:telkorenar";
  addGiver(telkorenarId, "Telkorenar", veeshanId);
  const gozzremId = "npc:temple-of-veeshan:gozzrem";
  addGiver(gozzremId, "Gozzrem", veeshanId);

  const groupId = "quest_group:dozekar-tear-quests";
  addNode({
    id: groupId, label: "Dozekar Tear Quests", type: "quest_group",
    description: "A cluster of parallel tear-and-symbol turn-in quests at the Temple of Veeshan, all sharing the same Dozekar-the-Cursed tear mechanic, segregated by caster/melee/priest/all-class groups across three givers: Lendiniara the Keeper (all-class and caster tasks), Telkorenar (melee-only tests), and Gozzrem (caster and priest tests). 13 of an estimated ~15 sibling quests are confirmed.",
    wiki_title: "Dozekar Tear Quests",
  });
  addEdge(groupId, veeshanId, "located_in");

  function addMember(id: string, label: string, giver: string, classes: string[] | undefined, description: string) {
    addNode({ id, label, type: "quest", ...(classes ? { classes } : {}), description, wiki_title: label, steps: [description] });
    addEdge(giver, id, "starts");
    addEdge(id, veeshanId, "starts_in");
    addEdge(id, groupId, "member_of");
  }

  addMember(
    "quest:dozekar-request-of-the-arcane", "Request of the Arcane", lendiniaraId, casterClasses,
    "Lendiniara the Keeper's caster tear turn-in at the Temple of Veeshan; reward not yet confirmed."
  );
  addMember(
    "quest:dozekar-request-of-the-strong", "Request of the Strong", lendiniaraId, undefined,
    "Lendiniara the Keeper's tear turn-in at the Temple of Veeshan; reward not yet confirmed."
  );

  addMember(
    "quest:dozekar-test-of-the-emerald-tear", "Test of the Emerald Tear", lendiniaraId, undefined,
    "One of Lendiniara the Keeper's three all-class tasks, 'which any may complete,' at the Temple of Veeshan; reward not yet confirmed."
  );
  addMember(
    "quest:dozekar-test-of-the-platinum-tear", "Test of the Platinum Tear", lendiniaraId, undefined,
    "One of Lendiniara the Keeper's three all-class tasks, 'which any may complete,' at the Temple of Veeshan; reward not yet confirmed."
  );
  addMember(
    "quest:dozekar-test-of-the-ruby-tear", "Test of the Ruby Tear", lendiniaraId, undefined,
    "One of Lendiniara the Keeper's three all-class tasks, 'which any may complete,' at the Temple of Veeshan; reward not yet confirmed."
  );

  addMember(
    "quest:dozekar-test-of-protection", "Test of Protection", telkorenarId, meleeClasses,
    "One of Telkorenar's four melee-class tests at the Temple of Veeshan. Turn in Ruby Tear, Emerald Tear, Emerald Symbol, and Platinum Symbol for the Pauldrons of the Deep Flame."
  );
  addMember(
    "quest:dozekar-test-of-the-fire-storm", "Test of the Fire Storm", telkorenarId, meleeClasses,
    "One of Telkorenar's four melee-class tests at the Temple of Veeshan; reward not yet confirmed."
  );
  addMember(
    "quest:dozekar-test-of-the-living-flame", "Test of the Living Flame", telkorenarId, meleeClasses,
    "One of Telkorenar's four melee-class tests at the Temple of Veeshan; reward not yet confirmed."
  );
  addMember(
    "quest:dozekar-test-of-the-tooth", "Test of the Tooth", telkorenarId, meleeClasses,
    "One of Telkorenar's four melee-class tests at the Temple of Veeshan. Turn in White Tear, White Symbol, Silver Symbol, and Glowing Drake Orb for the Serrated Dragon Tooth."
  );

  addMember(
    "quest:dozekar-first-arcane-test", "The First Arcane Test", gozzremId, casterClasses,
    "Gozzrem's Enchanter/Magician/Necromancer/Wizard tear-and-symbol turn-in at the Temple of Veeshan. Turn in Poison Tear, Poison Symbol, Serrated Symbol, and Runed Symbol for the White Dragon Statue."
  );
  addMember(
    "quest:dozekar-second-arcane-test", "The Second Arcane Test", gozzremId, casterClasses,
    "A harder sequel to The First Arcane Test, per Gozzrem's own page; reward not yet confirmed."
  );

  addMember(
    "quest:dozekar-wisdom-the-long-battle", "Wisdom - The Long Battle", gozzremId, priestClasses,
    "Gozzrem's Cleric/Druid/Shaman tear turn-in at the Temple of Veeshan. Turn in Runed Tear, Flame Kissed Tear, Black Symbol, and Glowing Drake Orb for the Boots of Silent Striding."
  );
  addMember(
    "quest:dozekar-wisdom-the-short-battle", "Wisdom - The Short Battle", gozzremId, priestClasses,
    "Gozzrem's Cleric/Druid/Shaman tear turn-in at the Temple of Veeshan. Turn in Platinum Tear and Platinum/Silver/Emerald Symbol for the White Dragon Idol."
  );

  addEdge("quest:dozekar-second-arcane-test", "quest:dozekar-first-arcane-test", "requires");

  const pauldronsId = "item:pauldrons-of-the-deep-flame";
  addNode({ id: pauldronsId, label: "Pauldrons of the Deep Flame", type: "item", slots: ["Shoulders"], classes: meleeClasses, source: "Test of Protection reward (Telkorenar, Temple of Veeshan)" });
  addEdge("quest:dozekar-test-of-protection", pauldronsId, "rewards");

  const toothId = "item:serrated-dragon-tooth";
  addNode({ id: toothId, label: "Serrated Dragon Tooth", type: "item", classes: meleeClasses, source: "Test of the Tooth reward (Telkorenar, Temple of Veeshan)" });
  addEdge("quest:dozekar-test-of-the-tooth", toothId, "rewards");

  const statueId = "item:white-dragon-statue";
  addNode({ id: statueId, label: "White Dragon Statue", type: "item", classes: casterClasses, source: "The First Arcane Test reward (Gozzrem, Temple of Veeshan)" });
  addEdge("quest:dozekar-first-arcane-test", statueId, "rewards");

  const bootsId = "item:boots-of-silent-striding";
  addNode({ id: bootsId, label: "Boots of Silent Striding", type: "item", slots: ["Feet"], classes: priestClasses, source: "Wisdom - The Long Battle reward (Gozzrem, Temple of Veeshan)" });
  addEdge("quest:dozekar-wisdom-the-long-battle", bootsId, "rewards");

  const idolId = "item:white-dragon-idol";
  addNode({ id: idolId, label: "White Dragon Idol", type: "item", classes: priestClasses, source: "Wisdom - The Short Battle reward (Gozzrem, Temple of Veeshan)" });
  addEdge("quest:dozekar-wisdom-the-short-battle", idolId, "rewards");
}

// ---------------------------------------------------------------------
// Druid Spells (spell-scroll trade quest)
// ---------------------------------------------------------------------
{
  const firionaId = "zone:firiona-vie";
  const samithaId = "npc:firiona-vie:samitha-lightheart";
  addGiver(samithaId, "Samitha Lightheart", firionaId);

  const questId = "quest:druid-spells-trade";
  addNode({
    id: questId, label: "Druid Spells", type: "quest", classes: ["druid"], minLevel: 51,
    description: "Samitha Lightheart in Firiona Vie trades any one of four rare spell scrolls -- Circle of Summer, Circle of Winter, Form of the Howler, or Spirit of Scale -- for one of four spells: Call of Karana, Egress, Glamour of Tunare, or Upheaval.",
    steps: ["Obtain any one of Circle of Summer, Circle of Winter, Form of the Howler, Spirit of Scale", "Turn in to Samitha Lightheart, Firiona Vie, for one of Call of Karana, Egress, Glamour of Tunare, Upheaval"],
    wiki_title: "Druid Spells",
  });
  addEdge(samithaId, questId, "starts");
  addEdge(questId, firionaId, "starts_in");
}

// ---------------------------------------------------------------------
// Enchanter Spells (Good) and (Evil) (spell-scroll trade quests)
// ---------------------------------------------------------------------
{
  const firionaId = "zone:firiona-vie";
  const overthereId = "zone:the-overthere";
  const gracieId = "npc:firiona-vie:gracie-fliler";
  addGiver(gracieId, "Gracie F`Liler", firionaId);
  const siladdaraeId = "npc:the-overthere:siladdarae-nriese";
  addGiver(siladdaraeId, "Siladdarae N`Riese", overthereId);

  const goodId = "quest:enchanter-spells-good";
  addNode({
    id: goodId, label: "Enchanter Spells (Good)", type: "quest", classes: ["enchanter"], minLevel: 51,
    description: "Gracie F`Liler in Firiona Vie trades any one of four rare spell scrolls -- Theft of Thought, Color Slant, Cripple, or Dementia -- for one of four spells: Boon of the Clear Mind, Clarity II, Recant Magic, or Wake of Tranquility.",
    steps: ["Obtain any one of Theft of Thought, Color Slant, Cripple, Dementia", "Turn in to Gracie F`Liler, Firiona Vie, for one of Boon of the Clear Mind, Clarity II, Recant Magic, Wake of Tranquility"],
    wiki_title: "Enchanter Spells (Good)",
  });
  addEdge(gracieId, goodId, "starts");
  addEdge(goodId, firionaId, "starts_in");

  const evilId = "quest:enchanter-spells-evil";
  addNode({
    id: evilId, label: "Enchanter Spells (Evil)", type: "quest", classes: ["enchanter"], minLevel: 51,
    description: "Siladdarae N`Riese in The Overthere trades any one of four rare spell scrolls -- Color Slant, Cripple, Dementia, or Theft of Thought -- for one of four spells: Boon of the Clear Mind, Clarity II, Recant Magic, or Wake of Tranquility.",
    steps: ["Obtain any one of Color Slant, Cripple, Dementia, Theft of Thought", "Turn in to Siladdarae N`Riese, The Overthere, for one of Boon of the Clear Mind, Clarity II, Recant Magic, Wake of Tranquility"],
    wiki_title: "Enchanter Spells (Evil)",
  });
  addEdge(siladdaraeId, evilId, "starts");
  addEdge(evilId, overthereId, "starts_in");
}

save();

console.log(
  "Migration 111 complete: modeled the GitHub issue #26 Dozekar Tear Quests cluster (quest_group of 13 sibling turn-ins) plus Druid Spells, Enchanter Spells (Good), and Enchanter Spells (Evil) as standalone spell-trade quests."
);
