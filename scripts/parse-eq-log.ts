/**
 * Condenses a raw EQL chat log (`eqlog_<Character>_<Server>.txt`, written to
 * the client's own `Logs` folder once `/log on` is run in-game) down to the
 * lines worth reading when sourcing quest text for a migration -- NPC/player
 * dialogue and target context -- by dropping known noise (combat spam, guild
 * chat, achievement spam, forage spam, etc). See issue #54 and
 * decisions/eqlwiki-quest-research-method.md for why a real log is sometimes
 * the only source: eqlwiki hasn't caught up to some newer EQL content yet.
 *
 * The noise/signal pattern lists below are a first pass from one real log
 * (Rathe Mountains froglok starting content). Expect to extend both lists as
 * more logs from other sessions/zones surface message shapes not seen yet --
 * anything not matched by either list is kept and tagged "unclassified" so
 * nothing quietly gets dropped before it's been seen.
 *
 * Also extracts vendor purchases ("You purchased 1 Spell: X from Y for
 * ...") into structured records alongside the condensed transcript, written
 * to <output>.purchases.json. `itemType` on each record is "spell" or
 * "item" -- the same values used for `type` on graph.json nodes -- derived
 * from the "Spell: " prefix the client puts on spell purchases (absent for
 * plain item purchases). A migration can diff these against a vendor npc's
 * existing `sells` edges to fill gaps rather than hand-transcribing prices.
 *
 * Usage: bun run scripts/parse-eq-log.ts <path-to-eqlog.txt> [output-path]
 * Default output: <input>.parsed.txt next to the source log.
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const LINE = /^\[(.+?)\] (.*)$/;

// Lines matching any of these are dropped entirely -- known noise, not quest signal.
const NOISE_PATTERNS: RegExp[] = [
  /^Logging to /,
  /^Your guildmate .+ has completed .+ achievement\.$/,
  /^You fail to locate any food nearby\.$/,
  /^You have become better at /,
  /^You must wait longer before you can /,
  /^\w+ tells the guild, /,
  /^\w+ tells \w+:\d+, /, // channel tells, e.g. "X tells NewPlayers7:1, '...'"
  /slashes .+ for \d+ points of damage\.$/,
  /has been slain by/,
  /^Stand close to and right click/,
  /^You gain experience!/,
  /^The spirit of travel leaves you\.$/,
  /^It will take (you )?about \d+ (more )?seconds to prepare your camp\.$/,
];

// Lines matching these are kept and tagged with a known type.
const SIGNAL_PATTERNS: { type: string; pattern: RegExp }[] = [
  { type: "target", pattern: /^Targeted \((.+?)\): (.+)$/ },
  { type: "player-say", pattern: /^You say, '.*'$/ },
  { type: "npc-say", pattern: /^.+? says?(?: to .+?)?, '.*'$/ },
  { type: "npc-tell", pattern: /^.+? tells? you, '.*'$/ },
];

// "You purchased 1 Spell: Endure Fire from Arrivae Valleren for  5 silver."
// "You purchased 1 Backpack from Colnro Cedar for  6 gold 9 silver 9 copper."
const PURCHASE_PATTERN = /^You purchased (\d+) (.+?) from (.+?) for\s+(.+)\.$/;

type Purchase = { quantity: number; itemLabel: string; itemType: "spell" | "item"; vendor: string; price: string };

function parsePurchase(text: string): Purchase | null {
  const m = text.match(PURCHASE_PATTERN);
  if (!m) return null;
  const [, quantity, rawItem, vendor, price] = m;
  const spellMatch = rawItem.match(/^Spell: (.+)$/);
  return {
    quantity: Number(quantity),
    itemLabel: spellMatch ? spellMatch[1] : rawItem,
    itemType: spellMatch ? "spell" : "item",
    vendor,
    price,
  };
}

type ParsedLine = { timestamp: string; type: string; text: string; purchase?: Purchase };

function parseLog(raw: string): ParsedLine[] {
  const out: ParsedLine[] = [];
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const m = line.match(LINE);
    if (!m) continue;
    const [, timestamp, text] = m;

    if (NOISE_PATTERNS.some((p) => p.test(text))) continue;

    const purchase = parsePurchase(text);
    if (purchase) {
      out.push({ timestamp, type: "purchase", text, purchase });
      continue;
    }

    const signal = SIGNAL_PATTERNS.find((s) => s.pattern.test(text));
    out.push({ timestamp, type: signal?.type ?? "unclassified", text });
  }
  return out;
}

const [inputPath, outputPathArg] = process.argv.slice(2);
if (!inputPath) {
  console.error("Usage: bun run scripts/parse-eq-log.ts <path-to-eqlog.txt> [output-path]");
  process.exit(1);
}

const raw = readFileSync(resolve(inputPath), "utf-8");
const parsed = parseLog(raw);
const outputPath = resolve(outputPathArg ?? `${inputPath}.parsed.txt`);

writeFileSync(outputPath, parsed.map((p) => `[${p.timestamp}] (${p.type}) ${p.text}`).join("\n") + "\n");

const purchases = parsed.filter((p): p is ParsedLine & { purchase: Purchase } => p.purchase !== undefined);
let purchasesPath: string | undefined;
if (purchases.length) {
  purchasesPath = outputPath.replace(/(\.parsed)?\.txt$/, "") + ".purchases.json";
  writeFileSync(purchasesPath, JSON.stringify(purchases.map((p) => ({ timestamp: p.timestamp, ...p.purchase })), null, 2) + "\n");
}

const totalRaw = raw.split(/\r?\n/).filter((l) => l.trim()).length;
const counts = new Map<string, number>();
for (const p of parsed) counts.set(p.type, (counts.get(p.type) ?? 0) + 1);

console.log(`${totalRaw} raw lines -> ${parsed.length} kept (${outputPath})`);
for (const [type, count] of counts) console.log(`  ${type}: ${count}`);
if (purchasesPath) console.log(`${purchases.length} purchase(s) -> ${purchasesPath}`);
