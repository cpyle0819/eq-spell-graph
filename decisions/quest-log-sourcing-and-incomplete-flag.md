# Quests sourced from a real chat log get an `incomplete` flag, not silence or invention

eqlwiki.com sometimes lags brand-new EQL content entirely — issue #54's froglok starting-hub quests (a full-text wiki search for "froglok starting," "phosphorous," etc. returned zero hits) had no page to research at all, not just a thin one. `decisions/eqlwiki-quest-research-method.md` covers the normal case (a real wiki page, fetched and hand-authored); this is the fallback for when that page doesn't exist yet.

## Sourcing: `/log on`, a real log, `scripts/parse-eq-log.ts`

`/log on` in-game writes `eqlog_<Character>_<Server>.txt` to the client's own `Logs` folder — this captures NPC dialogue verbatim, the same bar every other quest in this graph is held to (a real page/log, not invented). `scripts/parse-eq-log.ts` condenses a raw log down to what's worth reading for this: NPC/player dialogue and target context, with known noise (combat spam, guild chat, achievement spam, forage spam) dropped. Anything not matched by either its noise or signal pattern lists is kept and tagged `unclassified` rather than silently dropped — the script's own header comment expects both lists to grow as more logs from other sessions/zones surface message shapes the first pass (one log, one zone) never saw. Extend the pattern lists there rather than writing a parallel one-off parser per log.

## `quest.incomplete` / `quest.incompleteNote`

A log captures real dialogue, but not necessarily the whole quest — issue #54's own log had no confirmed reward for two fetch quests and no confirmed location for one piece of a three-piece quest chain. Rather than wait indefinitely to model anything, or invent the missing piece to make the record look finished, a quest gets:

```ts
{
  incomplete: true,
  incompleteNote: "Chalex's exact bones location in Rathe Mountains, the reward for completing all three pieces, and whether this is one combined quest vs. three independent hand-ins are all unconfirmed.",
}
```

Same "absent = normal case, no reassuring badge" convention as `outOfEra` (`decisions/quest-era-flagging.md`) — a fully-confirmed quest gets neither field at all, not `incomplete: false`. `QuestSummary`/`QuestGroupSummary` (`src/graph.ts`) carry both through unchanged from the raw node; `quest-shared.js`'s `incompleteBadge()` renders an amber "Unconfirmed Details" badge (deliberately a different register from `outOfEraBadge`'s red — this doesn't warn the player off content the way out-of-era does, it warns that *the record itself* isn't finished) with `incompleteNote` as the hover tooltip. Composed in `quest-card.js` and `quest-group-card.js` right next to `outOfEraBadge`, same pattern both places.

**No backfill.** This isn't a data-quality audit of every existing quest — it only applies going forward to quests actually sourced this way. A future migration should fill in the real answer and drop both fields once it's confirmed, rather than leave a permanently-flagged quest around.

## Don't reach for classic-EQ sources to fill the gap

`decisions/eql-vs-classic-eq-zone-connectivity.md` already warns off Project 1999/classic-EQ sources for EQL facts — this came up concretely here: confirming which zone Gukta (the froglok hub these quests are set in) physically loads as was done by asking the project owner directly (they were playing live), not by trusting wiki.project1999.com's Froglok page, even though that page happens to describe the same relocation-to-Rathe-Mountains fact. A classic-EQ source can be cited as flavor corroboration in a migration's comments when it happens to agree, but never as the actual authority for an EQL-specific fact — the in-game/in-log observation is.
