# Collection checklist source of truth

The **OverPower Check List** is the source of truth for collection card names and numbers in Excelsior Deckbuilder.

- **URL**: [Kyle's Copy of OverPower Check List](https://docs.google.com/spreadsheets/d/1WGvA8v8NAd8ByOtiuhhG6d13R3twSGbs/edit?gid=1007221192#gid=1007221192)
- **Local markdown (all tabs)**: [`docs/checklist-source/`](../checklist-source/README.md) — one `.md` file per sheet tab, regenerated with `python3 scripts/export-overpower-checklist-markdown.py`
- **Use**: Correcting or populating card names, `set_number` (the "#" column), and **`rarity`** in the database so the Collection interface and deck editor **Select Art** captions stay aligned with the official list.

## Canonical rarities (database)

Stored on card tables as **`rarity`** (`NULL` allowed):

- **Common**
- **Uncommon**
- **Rare**
- **Ultra Rare**

PostgreSQL enforces this set via `CHECK` constraints (see migration `V252__Normalize_card_rarity_canonical.sql`). **`NULL`** is used where there is no retail tier (including all rows in **promo sets** — see below).

The main checklist sometimes labels foil booster rows **`Common slot, rare drop`**. In the database that is stored as **`Common`** (same slot economics, normalized caption).

## How it’s used

- **Data corrections**: When cards show "Unknown" or missing numbers in the Collection view, the checklist is the reference for the correct name and number. Use it to:
  - Update database rows where `name` (or the relevant display name column) is NULL or empty.
  - Populate or fix `set_number` (and optionally `set`) on card tables (e.g. `ally_universe_cards`, `basic_universe_cards`, `training_cards`, `advanced_universe_cards`, and others that have these columns).
- **Migrations**: SQL migrations that fix names or set numbers should align with this checklist (e.g. by exporting the sheet to CSV or maintaining a static mapping derived from it).
- **Scripts**: Any script that bulk-updates card names, set numbers, or rarity (e.g. `scripts/data-maintenance/populate-rarity-from-checklist.ts`) should use `docs/checklist-source/checklist.md` (or an export derived from it) so the app stays consistent with the official list. That script **does not** set `rarity` on **`ERBP`** rows from the main checklist—promo rows use **`checklist-promos.md`**.
- **Promo sets (`ERBP`, `TFCP`, `SKYP`)**: Every card in these sets keeps its **`set`** code for grouping but has **`set_number`**, **`set_number_foil`**, and **`rarity`** all **`NULL`** so the Collection / Select Art UI does not show main-line checklist numbers or tiers. Enforced in bulk by `migrations/V257__Clear_set_numbers_and_rarity_for_all_promo_sets.sql`. Examples: Leonidas Comic Con and **`dracula2`** on **`ERBP`** (`V249`, `V253`); level-8 promo powers on **`ERBP`** (`V244`); foil-only **Training (Sekhmet)** on **`ERBP`** linked to ERB **545** via **`foil_card_map`** (`V258`); **7 - Combat** TFCP promo on **`TFCP`** (`V202`, `tfacp/power/7_combat.png` foil-only → ERB base in `V294`, non-foil second printing `7_combat_2.jpg` in `V293`, path relocated in `V292`); **7 - Any-Power** Skybound promo on **`SKYP`** (`V255`–`V256`, `V262`, path relocated to `skyp/power/` in `V291`); **Rex Splode** Comic Con exclusive on **`SKYP`** (`V291`). Set-scoped promo art paths: **`skyp/characters/`**, **`skyp/power/`**, **`tfacp/power/`** (not `characters/alternate/` or `power-cards/alternate/`).

## Options for applying checklist data

- **Option A – Migration**: Add a SQL migration that updates rows (e.g. where `name` or `set_number` is NULL) using a static mapping derived from the checklist. Best when the set of missing cards is known and small.
- **Option B – Script**: Add a script (e.g. under `scripts/`) that reads a CSV export of the checklist and updates the database. Document the export and run steps. Use when you have a one-off or repeatable import.
- **Option C – Manual + doc**: Use the checklist as a reference and fix data manually (or via one-off SQL) as needed. This doc serves as the reference; no automated import is required.

Start with Option C; add Option B if you have a CSV or structured export, and Option A only when you want to fix a specific set of rows in migrations.
