# Deck legality catalog (Standard / Venture, Skirmish, Limited)

Single reference for **what the rulebooks say**, **what Excelsior validates**, and **where the code lives**.  
**Standard (Venture)** is the constructed format the server and APIs target today. **Skirmish** and **Brawl** are documented for comparison only. **Limited** (in-app) is a metadata mode that skips persisting computed legality—not the same as rulebook Limited/Draft/Sealed.

---

## 1. Official sources

| Source | Path / note |
|--------|-------------|
| Learn to Play (March 2025 PDF) | `src/resources/rules/Overpower_Rule-Book_Learn-to-Play_March_2025.pdf` — **not present in repo at time of writing**; place file here for versioned links. |
| Comprehensive (March 2025 PDF) | `src/resources/rules/Overpower_Rule-Book_Comprehensive_March_2025.pdf` — same. |
| Tournament Guide (March 2025 PDF) | `src/resources/rules/Overpower_Rule-Book_Tournament-Guide_March_2025.pdf` — same. |
| In-repo text derivative | [`src/resources/rules/overpower-learn-to-play-rules.txt`](../../src/resources/rules/overpower-learn-to-play-rules.txt) — Markdown-style export used below for **line-level pointers** until PDFs are available in-tree. |

**Rulebook anchors (Learn-to-Play text file):**

- Deck size 51 / 56 with events — intro paragraph (~L39).
- Four characters, threat ≤ 76 including homebase — Character / Location sections (~L49–L59).
- Deck building summary list — “DECK BUILDING RULES” (~L131–L139).
- Venture / Brawl / Skirmish — “CONSTRUCTED PLAY” (~L141–L157).
- Angry Mob specials — “SPECIAL CARDS” (~L105–L111).
- Limited Draft / Sealed — “LIMITED PLAY” onward (~L159+).

When the PDFs are added, update this doc with **PDF page numbers** beside these sections.

---

## 2. Formats at a glance

| Format | Rulebook role | Excelsior validation |
|--------|----------------|----------------------|
| **Standard (Venture)** | Normal constructed: full mission deck (7 objectives per player in deck), events allowed, venture win conditions. | **Yes** — [`DeckValidationService`](../../src/services/deckValidationService.ts) orchestrates an ordered [`DeckValidationRuleList`](../../src/services/deck-validation/deck-validation-rule-list.ts) of rules under [`src/services/deck-validation/`](../../src/services/deck-validation/); incremental add in [`validateCardAddition`](../../src/index.ts); client [`validateDeck`](../../public/js/validation-calculation-functions.js). |
| **Skirmish** | Remove **events** from decks; **5, 7, or 9** shared objectives placed in **Astral Plane**; special concede / majority / KO rules (~L151–L157 in learn-to-play txt). | **No** — no Skirmish deck mode; validators still assume **Venture-shaped** decks (7 missions in deck, events allowed by rules). |
| **Brawl** | Remove venture/objective-related cards from decks; no mission, no events, no concede; KO-only win (~L149). | **No** — not modeled as a separate validator. |
| **Limited (rulebook)** | Draft / Sealed construction from restricted pool (~L159+). | **Not implemented** as a full rule matrix. |
| **Limited (in-app toggle)** | N/A — UI flag on a deck. | **Legality persistence skipped** — see [§6](#6-limited-in-app-toggle). |

---

## 3. Standard (Venture) — rulebook ↔ code

Columns: **Rule** | **Rulebook (Learn-to-Play txt)** | **Server** ([`deckValidationService.ts`](../../src/services/deckValidationService.ts) + [`deck-validation/rules/`](../../src/services/deck-validation/rules/)) | **Incremental add** [`validateCardAddition`](../../src/index.ts) | **Main client** [`validation-calculation-functions.js`](../../public/js/validation-calculation-functions.js) |

| Rule | Rulebook | Server (`rule` id) | `validateCardAddition` | Client `validateDeck` |
|------|----------|-------------------|------------------------|------------------------|
| Character count | Exactly **4** (~L49, ~L136) | `character_count` — sum of character **quantities** must be 4 | Blocks **> 4 character rows** (`.length`, not quantity sum) | Rule 1 — **4 character rows** (`.length`) |
| Banned cards | (Tournament / list on card data) | `banned_card` | Not checked here | Rule 1.5 |
| Angry Mob characters | At most one **variant** on team; specials match variant (~L105–L111) | `angry_mob_limit` — more than one name starting with `"Angry Mob"` | Not checked | Rule 1.6 — more than one Angry Mob **row** |
| Mission count | **7** mission cards per deck (Venture; ~L43 win condition implies 7 objectives) | `mission_count` — total mission **quantities** = **7** | Blocks **> 7 mission rows** | Rule 2 — at most **1 mission row** (`DECK_RULES.MAX_MISSIONS`; see [§7](#7-known-implementation-gaps)) |
| Mission set | Same set | `mission_set` if >1 distinct `mission_set` among missions | Not checked | Not enforced |
| Location count | At most **1** homebase (~L57–L59) | `location_count` — sum of quantities ≤ 1 | Blocks second location row | Rule 4 — ≤ 1 location row |
| Threat | **≤ 76** characters + homebase (~L53, ~L59) | `threat_level` — sums character **`threat` only** (locations **not** added) | Not checked | Rule 5 — characters + locations use **`threat_level`** per row (no `quantity` multiply); reserve display tweaks live in `calculateTotalThreat` only |
| Draw pile / deck size | Min **51**, or **56** if using events (~L39, ~L135) | `deck_size` — **total** card count (all types) ≥ 51 or ≥ 56 if **any event row** exists | Not checked | Rule 6 — count **excludes** mission, character, location rows (draw pile only) |
| Specials usable | Specials only for characters on team; Angry Mob rules (~L102–L111, ~L139) | `unusable_special` (+ Angry Mob variant logic); uses `character` or `character_name` from catalog | Not checked | **Aligned:** client `validateDeck` mirrors server (incl. `characters[]` extras) |
| Events vs mission set | Events align with mission set | `unusable_event` | Not checked | **Aligned:** client checks when mission rows supply sets (same gate as server: no error if no missions in deck) |
| One per deck | Single copy (~L138) | `one_per_deck_violation` | Rule 4 block + row checks | `one_per_deck` flag (does not check `is_one_per_deck` alias) |
| Power cards usable | Grid / type (~L65–L71) | `unusable_power` — DB `power_type` / `value`; **Energy / Combat / Brute Force / Intelligence** vs matching stat; **Any-Power** uses max of the four; **Multi Power** and **Multi-Power** are **not** gated by character stats (usable in any Venture deck) | Not checked | **Aligned:** client skips grid check for Multi Power / Multi-Power |
| Universe cards usable | To Use / grid text; Training cap (~L51, Training NOTE) | `unusable_universe` — **teamwork:** `to_use` regex (**Any-Power** = **max** of four primaries for **≥**); **basic:** `value_to_use` + skill type (map keeps `basic_skill_type`); **training:** `type_1`/`type_2` + cap from `value_to_use` (**Any-Power** = **any** primary **≤** cap — [§3.1](#31-any-power-semantics)); **ally:** `stat_to_use` / `stat_type_to_use` + ≥2 character rows; **advanced:** `character` gate | Not checked | **Aligned:** same split as server for editor `validateDeck` |
| Aspects vs Homebase | Aspects played by Homebase; some require a specific Homebase | `unusable_aspect` — needs a location row if aspect has a `location` constraint; `Any Homebase` / substring match skips mismatch | Not checked | **Aligned:** client same rules |
| Cataclysm | (Card-type restriction) | **Not** in `DeckValidationService` | At most **1** cataclysm special | Not in `validateDeck` |
| Assist / Ambush | (Card-type restriction) | **Not** in `DeckValidationService` | At most **1** each (special flags) | Not in `validateDeck` |
| Fortification | (Aspect restriction) | **Not** in `DeckValidationService` | At most **1** fortification aspect | Not in `validateDeck` |
| Duplicate character | — | Allowed only if quantities on one row (server sums to 4) | **One row per character id** | Not explicit (relies on editor behavior) |

**Multi Power (deck vs play):** Learn-to-Play text ([`overpower-learn-to-play-rules.txt`](../../src/resources/rules/overpower-learn-to-play-rules.txt) ~L67–70) ties **in-game** use of MultiPower to declaring one of the four types and having grid in that type. Excelsior **deck construction** does not run that play-time check: **Multi Power** / **Multi-Power** rows in the deck are allowed regardless of team character grids (see `unusable_power` + client `validateDeck`).

**Deck card `type` strings:** API/editor rows use hyphens (e.g. `basic-universe`). Server validation normalizes to underscore map keys via `deckCardTypeKeyPrefix` in [`deckValidationService.ts`](../../src/services/deckValidationService.ts) so lookups match catalog rows.

**Persistence snapshot:** [`computeDeckIsValidForPersistence`](../../public/js/validation-calculation-functions.js) returns whether `validateDeck` has zero errors (warnings allowed). Used when updating `metadata.is_valid` from [`deck-editor-core.js`](../../public/js/deck-editor-core.js) unless Limited skip applies. Client unusable rules are kept in sync with `DeckValidationService` so the Legal / Not Legal badge matches API `is_valid` for the same deck content.

### 3.1 Any-Power semantics

**Any-Power is not a fifth stat on the character grid** — it always refers to the four primaries: Energy, Combat, Brute Force, and Intelligence. Deck construction uses **different math** for Training than for Power / Teamwork:

| Card class | Server rule | Threshold | How `Any-Power` is evaluated |
|------------|-------------|-----------|------------------------------|
| **Power** | `unusable_power` | **≥** printed `value` | [`statForPowerType`](../../src/services/deck-validation/deck-validation-utils.ts) — **maximum** of the four stats (character must meet the value in their **best** primary). |
| **Teamwork** | `unusable_universe` (teamwork path) | **≥** from `to_use` | Same helper: **maximum** of the four. |
| **Training** | `unusable_universe` ([`UnusableTrainingRule`](../../src/services/deck-validation/rules/unusable-training.rule.ts)) | **≤** cap (first integer in `value_to_use`) | [`trainingTypeAtOrBelowCap`](../../src/services/deck-validation/deck-validation-utils.ts) — **true if any** of the four stats is **≤ cap** (e.g. a character with 8 / 6 / 8 / 5 satisfies cap **5** because Intelligence is 5). |

**Client parity:** [`statForPowerGridClient`](../../public/js/validation-calculation-functions.js) vs [`trainingTypeAtOrBelowCapClient`](../../public/js/validation-calculation-functions.js) in the same file.

**Icon / summary UI:** [`deck-validation.js`](../../public/js/deck-validation.js) may omit Any-Power from four-stat icon totals; that is separate from unusable checks above.

---

## 4. Skirmish (constructed sub-format)

Official **deck / setup** differences vs Venture (from learn-to-play txt ~L151–L157):

- **Event cards:** removed from decks for Skirmish.
- **Objectives:** players choose **5, 7, or 9** mission objective cards for **both** players; chosen cards start in **Astral Plane** (not the same as “7 copies in each deck” wording—confirm exact deck construction in Comprehensive PDF when available).
- **Play:** venture tie stacking, conceding, immediate loss if all four characters KO’d, majority-objective concede lockout.

| Topic | Venture (current app default) | Skirmish (rulebook) | Validated for Skirmish in Excelsior? |
|-------|--------------------------------|---------------------|--------------------------------------|
| Events in deck | Allowed; deck size 56 if any event | **Not in deck** | **No** — server/client do not strip or forbid events by mode |
| Mission cards in deck | **Exactly 7** per deck (server) | **5 / 7 / 9** shared pool + Astral Plane setup | **No** |
| Min draw pile | 51 (no events) / 56 (with events) | Typically **51** with no events (after removing events); confirm in PDF | **No** mode-specific check |
| Other | Standard KO / mission win | Skirmish-specific concede / KO rules | **No** |

**Brawl (one-line):** All venture/objective-related cards removed from decks; no mission completion, no events, no concede; KO-only win (~L149). Excelsior does **not** implement a Brawl deck profile.

---

## 5. Limited (rulebook)

Draft and Sealed use a **restricted card pool** plus Basic Power allowances (~L159+ in learn-to-play txt). Excelsior does **not** ship a full Limited-pool validator in this catalog’s scope.

---

## 6. Limited (in-app toggle)

When the user marks a deck **Limited** (`isDeckLimited` in [`validation-calculation-functions.js`](../../public/js/validation-calculation-functions.js)):

- [`isDeckLegalityEvaluationSkipped()`](../../public/js/validation-calculation-functions.js) is true.
- [`updateDeckTitleValidation`](../../public/js/validation-calculation-functions.js) shows the **Limited** badge instead of running full Legal / Not Legal messaging.
- [`deck-editor-core.js`](../../public/js/deck-editor-core.js) **does not** write `metadata.is_valid` from `computeDeckIsValidForPersistence` when skip is true (e.g. after normalization ~L835–L844; card sync ~L998–L1005).

This is **not** validation of rulebook Limited format—only a **bypass** for persisting standard legality snapshots.

---

## 7. Known implementation gaps

1. **Client vs server — missions and events:** Server requires **7** mission **copies** and allows multiple events subject to rules; main client `validateDeck` is written for **at most one mission row** and **at most one event row** when `DECK_RULES.MAX_MISSIONS` / `MAX_EVENTS` are defined (unit tests set `1`). [`public/index.html`](../../public/index.html) `DECK_RULES` **does not** define `MAX_MISSIONS` / `MAX_EVENTS`, so those checks may be ineffective at runtime unless another script supplies them.
2. **Deck size definition:** Server counts **all** cards; client counts **draw pile** only (excludes character, mission, location rows).
3. **Threat:** Rulebook 76 cap includes **homebase**. Server `threat_level` sums **characters only** (uses `threat` or `threat_level` per character row). Client `validateDeck` adds location `threat_level` per row but does not multiply by `quantity` and does not apply reserve adjustments (those exist in `calculateTotalThreat` for display).
4. **Cataclysm / Assist / Ambush / Fortification:** Enforced only in **`validateCardAddition`**, not in `DeckValidationService` or client `validateDeck` (aspect **usability** vs Homebase is now in `DeckValidationService` + client; fortification **count** cap remains add-path only).
5. **Character rows vs quantities:** Incremental validator uses **row counts** for mission/character caps; server uses **quantities** for characters and missions.
6. **Skirmish / Brawl:** No deck `format` flag—single Venture-oriented path.
7. **Artifacts:** Not a `DeckCard` type in the app schema; no deck-level unusable check yet.

---

## 8. Legacy / duplicate validators

These may duplicate or override rules; treat as **secondary** to `DeckValidationService` + `validation-calculation-functions.js`:

- [`public/index.html`](../../public/index.html) — inline `DECK_RULES`
- [`public/deck-builder.html`](../../public/deck-builder.html) — inline `DECK_RULES` / `validateDeck`
- [`public/database-backup.html`](../../public/database-backup.html)

---

## 9. Tests (behavioral specs)

- Server: `tests/unit/deckValidationService*.test.ts`, `tests/unit/deck-validation-rule-list.test.ts`, `tests/unit/unusable-training-rule.test.ts` (Training + Any-Power caps), `tests/unit/limitedDeckFunctionality.test.ts`
- Client sandbox: `tests/unit/validation-calculation-functions.angrymob.test.ts`
- Broader client rules mock: `tests/unit/deckValidationRules.test.ts` (may not mirror production `validateDeck` exactly)

---

## 10. Changelog

| Date | Change |
|------|--------|
| 2026-04 | Initial catalog from code + `overpower-learn-to-play-rules.txt`; PDF page cites pending files under `src/resources/rules/`. |
| 2026-04 | Client `validateDeck` parity for unusable specials/events/powers/universe/aspects; server map-key hyphen fix, `character` on specials, basic/training/ally/advanced/aspect rules, `basic_skill_type` for Basic Universe map entries. |
| 2026-04 | Server: `DeckValidationService` delegates to `src/services/deck-validation/` — `DeckValidationRuleList`, per-rule modules, shared `deck-validation-messages.ts`, `buildAvailableCardsMap`. |
| 2026-04 | **Multi Power / Multi-Power** power cards: no character-stat grid check in `unusable_power` + client `validateDeck` (Excelsior policy; not “max stat” or “all stats” gate). |
| 2026-04-07 | **Training `Any-Power`:** cap checks use **any** primary stat ≤ cap (`trainingTypeAtOrBelowCap`); Power / Teamwork **Any-Power** unchanged (**max** for ≥). Documented in §3.1. |
| 2026-06 | **`is_valid` is server-owned (v2 consistency):** recomputed and persisted on **every** mutation — card add/replace/delete (`DeckCardsService.syncDeckValidity`), **create** (`DeckWriteService.createDeck`), **import** (`importDeckFromExport`), and **new-user sample copy** (`NewUserSampleDeckService`). Metadata `PUT /api/v1/decks/:id` no longer accepts a client `is_valid`. The v2 SPA renders one shared badge (`deckLegalityBadge`, Legal/Not Legal/Limited) on tiles and in the editor; the editor's live `POST /decks/validate` now returns `{ valid:false }` for invalid decks (was HTTP 400 that the client swallowed). |
