# OverPower Check List — markdown exports

This folder holds **one markdown file per tab** of the [OverPower Check List](https://docs.google.com/spreadsheets/d/1WGvA8v8NAd8ByOtiuhhG6d13R3twSGbs/edit) Google Sheet, generated as Git-friendly snapshots for search, diff, and offline reference.

| File | Tab (approx.) | Contents |
| --- | --- | --- |
| [checklist.md](./checklist.md) | Checklist | Main numbered card list |
| [checklist-promos.md](./checklist-promos.md) | Checklist Promos | Promos, events, Kickstarter, etc. |
| [erb-woprize-packs.md](./erb-woprize-packs.md) | ERB | ERB WoPrize / prize-pack subset |
| [edgar-rice-burroughs-full-checklist.md](./edgar-rice-burroughs-full-checklist.md) | Edgar Rice Burroughs and the WoPrize Packs | Full ERB-style list with Have / Notes |

## Refresh from Google

Requires a network connection and that the sheet remains accessible the same way (e.g. link sharing).

```bash
python3 scripts/export-overpower-checklist-markdown.py
```

The export script post-processes **Checklist Promos** so level 8 power **alternate-art** rows (`8A`–`8I` titles like `8E - Zeus`) get **ERB promos —** prepended to **Location**, distinguishing them from the core **ERB** set in `checklist.md` / the database `set` code `ERB`.

If Google adds or renames tabs, update the `SHEETS` list in that script (discover new `gid` values from the sheet URL or from **Share → Publish to web** / HTML view).

## Canonical usage in the app

See [COLLECTION_CHECKLIST_SOURCE.md](../current/COLLECTION_CHECKLIST_SOURCE.md) for how Excelsior uses the checklist for collection data.
