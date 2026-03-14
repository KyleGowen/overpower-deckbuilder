# Collection checklist source of truth

The **OverPower Check List** is the source of truth for collection card names and numbers in Excelsior Deckbuilder.

- **URL**: [Kyle's Copy of OverPower Check List](https://docs.google.com/spreadsheets/d/1WGvA8v8NAd8ByOtiuhhG6d13R3twSGbs/edit?gid=1007221192#gid=1007221192)
- **Use**: Correcting or populating card names and `set_number` (the "#" column) in the database so the Collection interface shows correct names and numbers and can sort by them.

## How it’s used

- **Data corrections**: When cards show "Unknown" or missing numbers in the Collection view, the checklist is the reference for the correct name and number. Use it to:
  - Update database rows where `name` (or the relevant display name column) is NULL or empty.
  - Populate or fix `set_number` (and optionally `set`) on card tables (e.g. `ally_universe_cards`, `basic_universe_cards`, `training_cards`, `advanced_universe_cards`, and others that have these columns).
- **Migrations**: SQL migrations that fix names or set numbers should align with this checklist (e.g. by exporting the sheet to CSV or maintaining a static mapping derived from it).
- **Scripts**: Any script that bulk-updates card names or set numbers (e.g. under `scripts/`) should use an export or structured data from this checklist so the app stays consistent with the official list.

## Options for applying checklist data

- **Option A – Migration**: Add a SQL migration that updates rows (e.g. where `name` or `set_number` is NULL) using a static mapping derived from the checklist. Best when the set of missing cards is known and small.
- **Option B – Script**: Add a script (e.g. under `scripts/`) that reads a CSV export of the checklist and updates the database. Document the export and run steps. Use when you have a one-off or repeatable import.
- **Option C – Manual + doc**: Use the checklist as a reference and fix data manually (or via one-off SQL) as needed. This doc serves as the reference; no automated import is required.

Start with Option C; add Option B if you have a CSV or structured export, and Option A only when you want to fix a specific set of rows in migrations.
