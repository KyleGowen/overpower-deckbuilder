# Path rules — image path → card metadata

Paths are relative to `src/resources/cards/images/` unless noted. The DB stores **`image_path`** without the `src/resources/cards/images/` prefix.

## Set folder prefix → DB `set` code

| Image folder prefix | `sets.code` | `sets.name` (typical) |
|---------------------|-------------|------------------------|
| (none — main-line) | `ERB` | Edgar Rice Burroughs |
| `erbp/` | `ERBP` | Edgar Rice Burroughs - Promos |
| `tfacp/` | `TFCP` | The Few and the Cursed - Promos |
| `skyp/` | `SKYP` | Skybound - Promos |

**Critical:** folder `tfacp` ≠ set code `TFACP`; always use **`TFCP`** in SQL.

Promo sets (`ERBP`, `TFCP`, `SKYP`): `set_number`, `set_number_foil`, `rarity` = **NULL** (V257).

---

## Folder → card type → table

| Image path segment(s) | Deck `card_type` | PostgreSQL table |
|----------------------|------------------|------------------|
| `characters/`, `{promo}/characters/` | `character` | `characters` |
| `specials/` | `special` | `special_cards` |
| `power-cards/`, `{promo}/power/` | `power` | `power_cards` |
| `locations/` | `location` | `locations` |
| `missions/` | `mission` | `missions` |
| `events/` | `event` | `events` |
| `aspects/` | `aspect` | `aspects` |
| `advanced-universe/` | `advanced-universe` | `advanced_universe_cards` |
| `teamwork-universe/` | `teamwork` | `teamwork_cards` |
| `ally-universe/`, `{promo}/ally/` | `ally-universe` | `ally_universe_cards` |
| `training-universe/` | `training` | `training_cards` |
| `basic-universe/` | `basic-universe` | `basic_universe_cards` |

`{promo}` = `tfacp`, `skyp`, or `erbp` when art lives under a set-scoped tree.

### Main-line vs promo layout

**Main-line ERB** — type-named top-level folders:

```
characters/robin_hood.webp
ally-universe/allan_quatermain.webp
power-cards/7_combat.webp
training-universe/5_energy_5_brute_force_4.webp
```

**Set-scoped promos** — set prefix + subtype:

```
tfacp/power/7_energy.jpg
tfacp/ally/5_energy.png
skyp/characters/rex_splode.webp
skyp/power/7_anypower.png
```

Prefer set-scoped paths for new promos; do not add to legacy `power-cards/alternate/` or `characters/alternate/` unless relocating an existing row.

---

## Filename stat parsing

### Stat suffix tokens

| Filename token | DB value |
|----------------|----------|
| `energy` | `Energy` |
| `combat` | `Combat` |
| `brute_force` | `Brute Force` |
| `intelligence` | `Intelligence` |
| `anypower` | `Any-Power` |
| `multipower` | `Multi-Power` |

### Power cards (`power_cards`)

Pattern: `{value}_{stat}[_{suffix}].{ext}`

Examples:
- `7_energy.jpg` → `value=7`, `power_type=Energy`, `name='7 - Energy'`
- `7_combat_2.jpg` → second printing; distinct `image_path`
- `7_anypower.png` → `power_type=Any-Power`, `one_per_deck=TRUE`

### Ally universe (`ally_universe_cards`)

Pattern: `{threshold}_{stat}.ext` or character-named file in main-line.

| Filename prefix | stat_to_use | attack_value (default) |
|-----------------|-------------|------------------------|
| `5_` | 5 or less | 3 |
| `7_` | 7 or higher | 2 |

`stat_type_to_use` and `attack_type` from stat suffix. Standard `card_text`: `Teammate must play 1 Special card.`

Promo allies may use stat-based filenames (`5_energy.png`) with a **unique display name** from the image (not the ERB slot name). They still share the ERB stat slot for printings grouping when `stat_to_use` + `stat_type_to_use` match.

### Ally stat slots (ERB base mapping)

Main-line ERB allies use checklist numbers 324–331. Promo allies in the **same stat slot** group as printings of the ERB row (key: `stat_to_use|stat_type_to_use` in `variantGroupKey`).

| stat_to_use | stat_type_to_use | attack_value | ERB name | set_number | ERB image_path |
|-------------|------------------|--------------|----------|------------|----------------|
| 5 or less | Energy | 3 | Allan Quatermain | 324 | `ally-universe/5_energy.webp` |
| 7 or higher | Energy | 2 | Hera | 325 | `ally-universe/7_energy.webp` |
| 5 or less | Brute Force | 3 | Hucklebuck | 326 | `ally-universe/5_brute_force.webp` |
| 7 or higher | Brute Force | 2 | Sir Galahad | 327 | `ally-universe/7_brute_force.webp` |
| 5 or less | Combat | 3 | Little John | 328 | `ally-universe/5_combat.webp` |
| 7 or higher | Combat | 2 | Guy of Gisborne | 329 | `ally-universe/7_combat.webp` |
| 5 or less | Intelligence | 3 | Professor Porter | 330 | `ally-universe/5_intelligence.webp` |
| 7 or higher | Intelligence | 2 | Queen Guinevere | 331 | `ally-universe/7_intelligence.webp` |

**Example:** `tfacp/ally/5_energy.png` → TFCP **White Demon Of Mazandaran** → printing group with **Allan Quatermain** (ERB #324).

**`PROMO_ART_SUBDIRS`:** `tfacp/ally` registered in V295 (`PRESET_PORTRAIT`). New `{set}/ally/` subdirs need the same before thumbnails work.

### Training (`training_cards`)

Pattern: `{type1}_{type2}_{bonus}.webp` under `training-universe/`

Example: `5_energy_5_brute_force_4.webp` → types Energy/Brute Force, bonus +4.

### Teamwork (`teamwork_cards`)

Pattern: `{level}_{stat}_{bonuses}.webp` under `teamwork-universe/`

Example: `7_combat_1e_1i.webp` → 7 Combat with follow-up bonuses.

### Characters

Often `snake_case.webp` or `{set_number}_{name}.webp`. Stats and threat come from the image, not the filename.

### Locations

May be bare `snake_case.webp` or `locations/snake_case.webp`; client normalizes. `set` may be character-themed (`Dracula`, `Spartan`) not `ERB`.

---

## Second printing suffix

When two physical printings share stats but different art:

- Primary: `7_combat.png`
- Second: `7_combat_2.jpg`

Each gets its own DB row with distinct `image_path`. Foil-only printings use `is_foil=TRUE` and may delete the non-foil row (V294).

---

## Legacy alternate paths

Relocate to set-scoped folders when touching these rows:

| Legacy path | Preferred promo path |
|-------------|---------------------|
| `power-cards/alternate/7_anypower.png` | `skyp/power/7_anypower.png` |
| `characters/alternate/...` | `{set}/characters/...` |

Use `UPDATE ... SET image_path = '...'` in migration when relocating (see `V291`).

---

## Thumbnail output paths

For set-scoped promo subdirs registered in `PROMO_ART_SUBDIRS`:

```
Source:  tfacp/ally/5_energy.png
Thumb:   tfacp/thumb/ally/5_energy.webp
```

For main-line folders, `thumb/` is inserted after the first segment:

```
Source:  ally-universe/allan_quatermain.webp
Thumb:   ally-universe/thumb/allan_quatermain.webp
```

---

## `card_description` conventions (universe types)

| Type | Pattern |
|------|---------|
| ally | `{Name} ally card` |
| training | `{Name} training card` or `Training ({Character})` as `name` |
| basic | `{Name} basic universe card` |
| advanced | `{Name} advanced universe card` |
| teamwork | Human-readable summary of stats |

---

## Detection algorithm (for the agent)

1. Strip `src/resources/cards/images/` prefix → `image_path`.
2. If path starts with `tfacp/`, `skyp/`, or `erbp/` → promo set; map prefix to `sets.code`.
3. Second segment (or first for main-line) → card type folder → table (table above).
4. Parse basename (no extension) for stat tokens and numeric prefix.
5. Read image for name, text, and overrides.
6. Cross-check checklist; present for approval.
7. For ally promos: confirm stat slot matches intended ERB base ([Ally stat slots](#ally-stat-slots-erb-base-mapping) table).

## DBV discovery (after implement)

- Promo appears as **own tile** on the type tab (all printings stay in grid).
- Under ERB base detail → **Printings** section lists cross-set alternates (click **Apply** to preview in DBV).
- Set filter **ERB** hides TFCP-only tiles; use **All sets** or the promo set.
- **Has Foil** filter hides promos with no `foil_card_map` entry.
