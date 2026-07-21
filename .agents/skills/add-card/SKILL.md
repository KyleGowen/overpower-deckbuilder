---
name: add-card
description: >-
  Add a new card to Excelsior from a source image path. Infers card type, set,
  stats, and text from file path and image contents; writes Flyway migration,
  thumbnail config, tests, and docs. Use when the user says "add card", "/add-card",
  or provides a path under src/resources/cards/images/.
---

# Add card

## When to use

- User says **add card**, **`/add-card`**, or pastes a path under `src/resources/cards/images/`
- User drops a new card image and wants it in the catalog (DB + thumbnails + verification)
- One card at a time; for multiple paths, run the workflow per card with separate approval

## References (read as needed)

- Path parsing: [PATH_RULES.md](PATH_RULES.md)
- Per-type columns and SQL: [CARD_TYPES.md](CARD_TYPES.md)
- Checklist: [`docs/checklist-source/checklist.md`](../../../docs/checklist-source/checklist.md) (main-line ERB, **read-only cross-check**), [`docs/checklist-source/checklist-promos.md`](../../../docs/checklist-source/checklist-promos.md) (promos, **read-only cross-check — do not edit**)
- Image pipeline: [`docs/current/IMAGE_PIPELINE.md`](../../../docs/current/IMAGE_PIPELINE.md)
- Promo metadata rule: `migrations/V257__Clear_set_numbers_and_rarity_for_all_promo_sets.sql`
- Printings grouping: [`defaultCatalogCards.ts`](../../../frontend/src/lib/catalog/defaultCatalogCards.ts) (`variantGroupKey`), [`cardPrintings.ts`](../../../frontend/src/lib/catalog/cardPrintings.ts)

## Workflow checklist

Copy and track progress:

```
Add card:
- [ ] 1. Intake — validate image path, derive DB image_path
- [ ] 2. Parse path — type, set, partial stats (PATH_RULES.md)
- [ ] 3. Read image — name, text, stats, foil appearance
- [ ] 4. Cross-check checklist docs
- [ ] 5. Present summary — WAIT for user approval
- [ ] 6. Implement — migration, thumbs, tests, docs, migrate, restart
- [ ] 7. Verify — DB, thumbnails, browser, unit tests
```

---

## Phase 1 — Intake

1. Accept absolute or repo-relative path; normalize to a file under `src/resources/cards/images/`.
2. **Hard stop** if the file is missing or outside `cards/images/`.
3. Derive DB **`image_path`**: path relative to `cards/images/` only (no `src/resources/` prefix).
   - Example: `src/resources/cards/images/tfacp/ally/5_energy.png` → `tfacp/ally/5_energy.png`
4. Confirm the source image is committed or will be committed with the migration (never commit `thumb/` — gitignored).

---

## Phase 2 — Infer from path

Read [PATH_RULES.md](PATH_RULES.md) for full mappings. Quick rules:

| Path hint | Inference |
|-----------|-----------|
| `tfacp/` | Set **`TFCP`** (folder name ≠ DB code) |
| `skyp/` | Set **`SKYP`** |
| `erbp/` | Set **`ERBP`** |
| `ally-universe/`, `tfacp/ally/` | `ally_universe_cards`, `card_type` `ally-universe` |
| `power-cards/`, `tfacp/power/`, `skyp/power/` | `power_cards`, `card_type` `power` |
| `characters/`, `{set}/characters/` | `characters` |
| Other folders | See PATH_RULES.md |

**Filename stat tokens:** `{n}_energy`, `{n}_combat`, `{n}_brute_force`, `{n}_intelligence`, `{n}_anypower`.

**Ally defaults** (ERB pattern, `migrations/V28`):
- `5_*` → `stat_to_use` = `5 or less`, `attack_value` = 3
- `7_*` → `stat_to_use` = `7 or higher`, `attack_value` = 2
- `attack_type` matches stat suffix; `card_text` = `Teammate must play 1 Special card.`
- **Printings grouping:** ally promos in the same stat slot (e.g. `5 or less|Energy`) appear as printings of the ERB base in DBV/deck editor, like power cards group by `power_type|value`.

**Power defaults:** `value` = leading number; `power_type` from suffix; `name` = `{value} - {PowerType}`; promo powers usually `one_per_deck = TRUE`.

**Second printing:** `_2` before extension → distinct `image_path` (e.g. `7_combat_2.jpg`).

---

## Phase 3 — Infer from image

**Read the image file** (vision) to extract anything not fully encoded in the path:

- Display **name** (promo allies/characters use art-specific names, not stat slots)
- **Card text**, attack lines, character name (specials), threat and stats (characters)
- **Foil** appearance (shimmer / foil border) when filename does not indicate printing
- Confirm or override path-derived stats when the image disagrees

**Normalize before approval:**
- Ally `card_text`: `Teammate must play 1 Special card.` (digit `1`, not "one")
- Power `name`: `7 - Energy` format (space-hyphen-space)
- `card_description` (universe types): `"{Name} ally card"` / `"{Name} training card"` etc.

---

## Phase 4 — Cross-check sources

1. **Main-line ERB** (`set = 'ERB'`): match `name`, `set_number`, `rarity` in [`checklist.md`](../../../docs/checklist-source/checklist.md) (**read only**).
2. **Promos** (`TFCP`, `SKYP`, `ERBP`): cross-check [`checklist-promos.md`](../../../docs/checklist-source/checklist-promos.md) when helpful (**read only — never edit this file**); **`set_number`**, **`set_number_foil`**, **`rarity`** must be **NULL** in the DB (V257).
3. Flag conflicts between path inference, image read, and checklist in the summary.
4. If main-line ERB with no checklist match → **hard stop**; ask user before proceeding.

---

## Phase 5 — Approval gate (required)

**Do not write any files until the user explicitly approves.**

Present this template filled in with all type-specific fields:

```markdown
## Proposed card

| Field | Value |
|-------|-------|
| Source file | (full repo path) |
| DB image_path | (relative to cards/images/) |
| Table | (PostgreSQL table) |
| card_type | (hyphenated deck API type) |
| Set | (sets.code) |
| Name | |
| (type-specific fields) | |
| is_foil | FALSE / TRUE |
| one_per_deck | |
| foil_card_map | none / link to ERB base (power/training foil-only only — **not** for ally promos) |
| Printing group | (ally/power) stat slot this row joins — e.g. ally `5 or less\|Energy` → ERB Allan Quatermain #324 |
| Promo NULLs | set_number, set_number_foil, rarity |
| Thumbnail subdir | (e.g. tfacp/ally) |
| PROMO_ART_SUBDIRS | new entry needed? preset? |
| Migration | V{N}__{SET}_{description}.sql |
| Docs to update | `IMAGE_PIPELINE.md` only when new promo image subdirs; otherwise **none** |
| Tests to update | (list or "none") |
```

**Ask the user** when any of these are ambiguous: foil-only vs non-foil, `foil_card_map` link to existing ERB base (power/training only), second printing, checklist numbers, `one_per_deck`.

For **ally promos:** confirm the ERB stat-slot base (see [PATH_RULES.md — Ally stat slots](PATH_RULES.md#ally-stat-slots-erb-base-mapping)). Promo uses a **unique display name**; printings grouping is automatic when `stat_to_use` + `stat_type_to_use` match the ERB row. **Do not** use `foil_card_map` for non-foil ally promos.

Revise from feedback and re-present until approved.

---

## Phase 6 — Implement (after approval only)

### 6a. Source art

- Confirm file at expected path; if collision with existing printing, rename with `_2` suffix (see `7_combat_2.jpg` precedent in `V293`).

### 6b. Flyway migration

1. Glob `migrations/V*.sql`; pick **max version + 1** (avoid collisions — SKYP work renamed V290 → V291).
2. Name: `V{N}__{SET}_{short_description}.sql` (e.g. `V295__TFCP_tfacp_ally_white_demon.sql`).
3. Idempotent pattern (from `V293`, `V291`):

```sql
INSERT INTO sets (code, name) VALUES ('TFCP', 'The Few and the Cursed - Promos')
ON CONFLICT (code) DO NOTHING;

INSERT INTO ally_universe_cards (...)
SELECT gen_random_uuid(), ...
WHERE NOT EXISTS (
  SELECT 1 FROM ally_universe_cards
  WHERE image_path = 'tfacp/ally/5_energy.png' AND set = 'TFCP' AND is_foil = FALSE
);

UPDATE ally_universe_cards SET ... WHERE image_path = '...' AND (metadata drift);
```

**Ally migration pitfall:** `ally_universe_cards` has **no** `first_attack_bonus` / `second_attack_bonus` columns (added V263, removed V264). Do not include them in INSERT/UPDATE.

4. **Foil-only branch:** see [CARD_TYPES.md — Foil-only promos](CARD_TYPES.md#foil-only-promos); follow `V258` (training) or `V294` (TFCP power): remap `deck_cards`/`collection_cards`, delete non-foil row, `is_foil = TRUE`, insert `foil_card_map`. **Not used for ally promos.**

5. Apply: `.\scripts\flyway-docker.ps1 migrate` (PowerShell) or `bash scripts/flyway-docker.sh migrate`.

### 6c. Thumbnail pipeline

If the path uses a set-scoped subdir **not** in `PROMO_ART_SUBDIRS` ([`generateCardThumbnails.ts`](../../../src/scripts/generateCardThumbnails.ts)):

| Subdir pattern | Preset |
|----------------|--------|
| `{set}/characters/` | `PRESET_CHARACTER` |
| `{set}/power/`, `{set}/ally/` | `PRESET_PORTRAIT` |
| Main-line type folders | Auto-handled by `THUMB_CONFIGS` |

Add entry, update [`tests/unit/generateCardThumbnails.config.test.ts`](../../../tests/unit/generateCardThumbnails.config.test.ts), run:

```bash
npm run generate:thumbnails
```

### 6d. Tests

Update when promo paths, foil semantics, or thumb config change:

- [`tests/unit/generateCardThumbnails.config.test.ts`](../../../tests/unit/generateCardThumbnails.config.test.ts)
- [`tests/unit/cardPrintings.test.ts`](../../../tests/unit/cardPrintings.test.ts) — add case when new promo joins an existing printing group (ally stat slot or power type/value)
- [`tests/integration/alternatePowerCards.test.ts`](../../../tests/integration/alternatePowerCards.test.ts) — power promos / foil
- [`tests/unit/collection-view.test.ts`](../../../tests/unit/collection-view.test.ts) — if collection captions change

Run `npm run test:unit` before reporting done.

### 6e. Docs

Update **[`docs/current/IMAGE_PIPELINE.md`](../../../docs/current/IMAGE_PIPELINE.md)** only when adding a **new** set-scoped promo image subdir (new `PROMO_ART_SUBDIRS` entry). Otherwise skip doc updates.

**Do not edit** during add-card:

- [`docs/checklist-source/checklist-promos.md`](../../../docs/checklist-source/checklist-promos.md)
- [`docs/checklist-source/checklist.md`](../../../docs/checklist-source/checklist.md)
- [`docs/current/COLLECTION_CHECKLIST_SOURCE.md`](../../../docs/current/COLLECTION_CHECKLIST_SOURCE.md)

Checklist files are spreadsheet exports (read-only cross-check in Phase 4). `COLLECTION_CHECKLIST_SOURCE.md` is maintained separately — use for context only.

### 6f. Restart dev servers

Restart **both** after migration: repo root `npm run dev` (:8085) and `frontend/npm run dev` (:5173). Browse **`http://localhost:5173`**.

---

## Phase 7 — Verify

- [ ] DB row exists for `image_path` + `set` (+ `is_foil` if relevant)
- [ ] Thumbnail exists (e.g. `tfacp/thumb/ally/5_energy.webp`) and serves HTTP 200 via Vite proxy
- [ ] Browser: correct DBV tab, set filter **All sets** (or promo set), **Has Foil off**, image renders
- [ ] **Printings (ally/power promos):** open the ERB base card detail → **Printings** lists the new promo; **Apply** switches detail view (DBV: [`DatabasePage.tsx`](../../../frontend/src/features/database/DatabasePage.tsx))
- [ ] Promo also appears as its **own tile** on the type tab grid (DBV does not dedupe by printing group)
- [ ] Deck editor can add the card (logged-in user if needed: `kyle` / `test` locally)
- [ ] Unit tests pass

**Do not commit or ship** unless the user says "ship" or uses the ship skill.

---

## Printings and DBV visibility

After migration, a promo may be “missing” when the user expects it under an ERB base card. Common causes:

| Symptom | Cause | Fix / check |
|---------|-------|-------------|
| Not under ERB base **Printings** | `stat_to_use` / `stat_type_to_use` (ally) or `power_type` / `value` (power) mismatch vs ERB row | Align stats in migration; grouping key is `stat_to_use\|stat_type_to_use` for ally ([`variantGroupKey`](../../../frontend/src/lib/catalog/defaultCatalogCards.ts)) |
| Not in grid at all | Set filter = ERB only, or **Has Foil** on | Use **All sets** / **TFCP**; turn Has Foil off |
| Search “5 energy ally” misses promo | Old bundle or search before stat fields | Hard-refresh `:5173`; search indexes `stat_to_use`, `stat_type_to_use`, `attack_type` ([`catalogTypeMap.ts`](../../../frontend/src/lib/catalog/catalogTypeMap.ts)) |
| User expects `foil_card_map` | Ally promos are non-foil standalone rows grouped by stat slot | **Do not** add `foil_card_map` for ally unless foil-only product decision |

**Ally stat-slot → ERB base (main line):** see [PATH_RULES.md](PATH_RULES.md). Example: `5 or less|Energy` = Allan Quatermain (#324); TFCP White Demon joins that printing group automatically.

**New set-scoped image subdir:** register in `PROMO_ART_SUBDIRS` before verify (e.g. `tfacp/ally` was missing until V295).

---

## Canonical example — White Demon Of Mazandaran

**Input:** `src/resources/cards/images/tfacp/ally/5_energy.png`

| Field | Value |
|-------|-------|
| DB image_path | `tfacp/ally/5_energy.png` |
| Table | `ally_universe_cards` |
| card_type | `ally-universe` |
| Set | `TFCP` |
| Name | White Demon Of Mazandaran |
| card_description | White Demon Of Mazandaran ally card |
| stat_to_use | 5 or less |
| stat_type_to_use | Energy |
| attack_value | 3 |
| attack_type | Energy |
| card_text | Teammate must play 1 Special card. |
| first_attack_bonus / second_attack_bonus | (not on table — removed V264) |
| one_per_deck | FALSE |
| is_foil | FALSE |
| set_number, set_number_foil, rarity | NULL |
| PROMO_ART_SUBDIRS | `{ subdir: 'tfacp/ally', preset: PRESET_PORTRAIT }` (added V295) |
| Printing group | `5 or less|Energy` → appears under Allan Quatermain (ERB #324) in DBV **Printings** |
| foil_card_map | none (not used for ally promos) |

**Implemented:** `V295__TFCP_tfacp_ally_white_demon.sql` + `variantGroupKey` ally-universe case + DBV printings wiring.

---

## Hard stops

| Condition | Action |
|-----------|--------|
| Image file missing | Stop; ask for correct path |
| Cannot read name/text from image | Stop; ask user for metadata |
| Ambiguous foil / base-card link | Stop; ask before migration |
| Main-line ERB without checklist match | Stop; ask or flag checklist update |
| Migration version collision | Re-glob `V*.sql`, pick unused number |
| Flyway checksum error | `flyway repair`; do not hand-apply SQL without Flyway |
| `foil_card_map` needed but base card unknown | Stop; ask which ERB/base row to link (power/training foil-only) |
| Ally INSERT uses `first_attack_bonus` | **Hard stop** — columns removed in V264 |
| Promo not visible under ERB printing | Verify stat slot matches ERB base; check set filter / Has Foil; see **Printings and DBV visibility** |
| Editing `checklist-promos.md`, `checklist.md`, or `COLLECTION_CHECKLIST_SOURCE.md` | **Hard stop** — read-only / maintained separately; never modify during add-card |

## Out of scope

- Auto-commit / ship (user must say "ship")
- Production S3 sync (CI `sync-images` after push)
- Paid AWS / infra changes
- Bulk set import without per-card approval
- Editing `docs/checklist-source/checklist-promos.md`, `docs/checklist-source/checklist.md`, or `docs/current/COLLECTION_CHECKLIST_SOURCE.md` (read-only / maintained separately)

## Related

- Catalog tables: [`src/database/card/catalog-card-tables.ts`](../../../src/database/card/catalog-card-tables.ts)
- TFCP power promos: `migrations/V293__TFCP_tfacp_power_7_promos.sql`
- SKYP character promo: `migrations/V291__SKYP_skyp_image_paths_and_rex_splode.sql`
- Foil-only power: `migrations/V294__TFCP_7_combat_png_foil_only.sql`
- TFCP ally promo: `migrations/V295__TFCP_tfacp_ally_white_demon.sql`
- Ally printings grouping: `frontend/src/lib/catalog/defaultCatalogCards.ts` (`ally-universe` → `stat_to_use|stat_type_to_use`)
- DBV printings UI: `frontend/src/features/database/DatabasePage.tsx`
- Flyway local: [`docs/current/LOCAL_FLYWAY.md`](../../../docs/current/LOCAL_FLYWAY.md)
