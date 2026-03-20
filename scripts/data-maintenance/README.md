# Data Maintenance Scripts

Ad-hoc scripts for card data maintenance and set number analysis. Run with `ts-node` from project root.

- `check-exact-names.ts` - Verify exact name matches
- `match-missing-set-numbers.ts` - Match missing set numbers
- `analyze-set-number-gaps.ts` - Analyze gaps in set numbering
- `check-missing-set-numbers.ts` - Check for missing set numbers
- `get-missing-set-number-details.ts` - Get details on missing set numbers
- `populate-rarity-from-checklist.ts` - Set `rarity` on card tables from `docs/checklist-source/checklist.md`. After `npm run migrate`, run `npx ts-node scripts/data-maintenance/populate-rarity-from-checklist.ts` (add `--dry-run` to print match counts only). Updates **exclude** `set = 'ERBP'` (ERB Promos); those rows keep **NULL** `rarity`. Review the printed “Unmatched” lines for checklist↔DB numbering drift (e.g. alt-art hero `#` vs `set_number` in DB).
