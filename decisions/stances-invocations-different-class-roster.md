# Stances/invocations cover a different, larger class roster than spells

The Stances & Invocations data includes **Berserker**, a class with no purchasable spells and no entry in migration 007's `ALL_CLASSES` or the spell-derived `/api/classes` roster (`scrape-spells.ts` already skips Monk/Warrior/Rogue for the same "no vendor spells" reason — Berserker is the same case, just not previously encountered since nothing referenced it). Rather than reconciling this into one shared class list, `/api/classes/abilities` derives its own roster directly from `stance`/`invocation`/`aa` node `classes` fields, independent of `/api/classes`. The two endpoints will keep diverging by design — don't unify them into a single "all classes" list.

