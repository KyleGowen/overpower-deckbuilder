# Card types — per-type INSERT reference

Catalog map: [`src/database/card/catalog-card-tables.ts`](../../../src/database/card/catalog-card-tables.ts)

**Global columns (all 12 tables):** `id` (UUID), `name`, `set` (FK → `sets.code`), `image_path`, `is_foil` (default FALSE), `set_number`, `set_number_foil`, `rarity` (nullable), `created_at`, `updated_at`.

**Before any INSERT:** ensure `sets` row exists:

```sql
INSERT INTO sets (code, name) VALUES ('TFCP', 'The Few and the Cursed - Promos')
ON CONFLICT (code) DO NOTHING;
```

**Idempotent INSERT skeleton:**

```sql
INSERT INTO <table> (id, name, set, <type_cols>, image_path, is_foil,
  set_number, set_number_foil, rarity, created_at, updated_at)
SELECT gen_random_uuid(), <values>
WHERE NOT EXISTS (
  SELECT 1 FROM <table>
  WHERE image_path = '<path>' AND set = '<SET>' AND is_foil = <BOOL>
);
```

---

## Summary table

| card_type | Table | Image folder(s) | Type-specific NOT NULL / required |
|-----------|-------|-----------------|-------------------------------------|
| `character` | `characters` | `characters/`, `{set}/characters/` | `energy`, `combat`, `brute_force`, `intelligence`; `threat_level`, `image_path` |
| `special` | `special_cards` | `specials/` | `character_name`, `card_effect` |
| `power` | `power_cards` | `power-cards/`, `{set}/power/` | `power_type`, `value` |
| `location` | `locations` | `locations/` | `threat_level`, `special_ability` (practical) |
| `mission` | `missions` | `missions/` | `mission_description` |
| `event` | `events` | `events/` | `event_description`; `mission_set`, `game_effect` (practical) |
| `aspect` | `aspects` | `aspects/` | `aspect_description` |
| `advanced-universe` | `advanced_universe_cards` | `advanced-universe/` | `card_description`; `character` (practical) |
| `teamwork` | `teamwork_cards` | `teamwork-universe/` | `card_description`; `to_use`, `acts_as`, bonus cols (practical) |
| `ally-universe` | `ally_universe_cards` | `ally-universe/`, `{set}/ally/` | `card_description`; stat/attack cols (practical) |
| `training` | `training_cards` | `training-universe/` | `card_description`; `type_1`, `type_2`, `value_to_use`, `bonus` (practical) |
| `basic-universe` | `basic_universe_cards` | `basic-universe/` | `card_description`; `type`, `value_to_use`, `bonus` (practical) |

---

## 1. Character (`characters`)

**Naming:** display name; `special_abilities` rule text or `''`.

```sql
INSERT INTO characters (
  id, name, set, energy, combat, brute_force, intelligence,
  threat_level, special_abilities, description, image_path,
  one_per_deck, set_number, set_number_foil, rarity, is_foil,
  created_at, updated_at
)
SELECT gen_random_uuid(),
  'Rex Splode', 'SKYP', 7, 5, 3, 2,
  18, '**Inherent Special Ability:** ...', NULL, 'skyp/characters/rex_splode.webp',
  FALSE, NULL, NULL, NULL, FALSE, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM characters WHERE image_path = 'skyp/characters/rex_splode.webp' AND set = 'SKYP'
);
```

**Example migration:** `V291__SKYP_skyp_image_paths_and_rex_splode.sql`

---

## 2. Special (`special_cards`)

**Naming:** `name` = card title; `character_name` = owner or `Any Character`.

```sql
INSERT INTO special_cards (
  id, name, character_name, set, card_effect, image_path,
  one_per_deck, cataclysm, ambush, assist, banned, is_foil,
  set_number, set_number_foil, rarity, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Kali: Goddess of War', 'Any Character', 'ERBP',
  '**Cataclysm!** ...', 'specials/kali_goddess_of_war.webp',
  TRUE, TRUE, FALSE, FALSE, FALSE, FALSE,
  NULL, NULL, NULL, NOW(), NOW()
WHERE NOT EXISTS (...);
```

**Example migration:** `V209__Add_banned_column_and_kali_card.sql`

---

## 3. Power (`power_cards`)

**Naming:** `name` = `"{value} - {power_type}"`; promo powers usually `one_per_deck = TRUE`.

```sql
INSERT INTO power_cards (
  id, name, power_type, value, image_path, one_per_deck,
  set, set_number, set_number_foil, rarity, is_foil, created_at, updated_at
)
SELECT gen_random_uuid(),
  '7 - Energy', 'Energy', 7, 'tfacp/power/7_energy.jpg', TRUE,
  'TFCP', NULL, NULL, NULL, FALSE, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM power_cards
  WHERE image_path = 'tfacp/power/7_energy.jpg' AND set = 'TFCP' AND is_foil = FALSE
);
```

**Example migrations:** `V293__TFCP_tfacp_power_7_promos.sql`, `V291` (SKYP Any-Power)

---

## 4. Location (`locations`)

**Naming:** `set` may be themed (`Dracula`, not `ERB`); `special_ability` = homebase rules.

```sql
INSERT INTO locations (
  id, name, set, threat_level, special_ability, image_path,
  is_foil, set_number, set_number_foil, rarity, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Castle Dracula', 'Dracula', 3, 'Homebase ability text...', 'locations/castle_dracula.webp',
  FALSE, NULL, NULL, NULL, NOW(), NOW()
WHERE NOT EXISTS (...);
```

---

## 5. Mission (`missions`)

**Naming:** `mission_set` groups story arc; `mission_description` NOT NULL.

```sql
INSERT INTO missions (
  id, name, set, mission_description, mission_set, image_path,
  is_foil, set_number, set_number_foil, rarity, created_at, updated_at
)
SELECT gen_random_uuid(),
  'The Call', 'ERB', 'Internal description', 'The Call of Cthulhu',
  'missions/the_call.webp', FALSE, NULL, NULL, 'Common', NOW(), NOW()
WHERE NOT EXISTS (...);
```

---

## 6. Event (`events`)

**Naming:** tied to `mission_set`; `game_effect` + `flavor_text` for rules.

```sql
INSERT INTO events (
  id, name, set, event_description, mission_set, game_effect, flavor_text,
  image_path, is_foil, set_number, set_number_foil, rarity, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Jane Arrives', 'ERB', 'Legacy desc', 'Tarzan', 'Effect text', 'Flavor',
  'events/jane_arrives.webp', FALSE, NULL, NULL, NULL, NOW(), NOW()
WHERE NOT EXISTS (...);
```

---

## 7. Aspect (`aspects`)

**Naming:** `aspect_description` includes rules; optional `location` (e.g. `Any Homebase`).

```sql
INSERT INTO aspects (
  id, name, set, aspect_description, location, image_path,
  is_foil, set_number, set_number_foil, rarity, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Amaru: Dragon Legend', 'ERB', '**Fortifications!** ...', 'Any Homebase',
  'aspects/amaru_dragon_legend.webp', FALSE, '101', NULL, 'Rare', NOW(), NOW()
WHERE NOT EXISTS (...);
```

---

## 8. Advanced universe (`advanced_universe_cards`)

**Naming:** `character` column for owner; `card_description` = effect text.

```sql
INSERT INTO advanced_universe_cards (
  id, name, set, card_description, character, image_path,
  one_per_deck, is_foil, set_number, set_number_foil, rarity, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Staff Fragments', 'ERB', 'Effect text **One Per Deck**', 'Ra',
  'advanced-universe/staff_fragments.webp', TRUE, FALSE, NULL, NULL, 'Uncommon', NOW(), NOW()
WHERE NOT EXISTS (...);
```

---

## 9. Teamwork (`teamwork_cards`)

**Naming:** `name` often primary stat label (`7 Combat`); bonus columns as string digits.

```sql
INSERT INTO teamwork_cards (
  id, name, set, card_description, to_use, acts_as, followup_attack_types,
  first_attack_bonus, second_attack_bonus, image_path,
  is_foil, set_number, set_number_foil, rarity, created_at, updated_at
)
SELECT gen_random_uuid(),
  '7 Combat', 'ERB', '7 Combat teamwork card', '7 Combat', '7 Combat', 'Energy, Intelligence',
  '1', '1', 'teamwork-universe/7_combat_1e_1i.webp',
  FALSE, '312', NULL, 'Common', NOW(), NOW()
WHERE NOT EXISTS (...);
```

---

## 10. Ally universe (`ally_universe_cards`)

**Naming:** `name` = character (promo allies use art-specific names, not the ERB slot name). Standard ally `card_text`: `Teammate must play 1 Special card.`

**Schema note:** Do **not** insert `first_attack_bonus` / `second_attack_bonus` — columns were added in V263 and **removed in V264** (teamwork cards still use them).

**Printings:** Grouped by stat slot `stat_to_use|stat_type_to_use` in [`variantGroupKey`](../../../frontend/src/lib/catalog/defaultCatalogCards.ts) (same idea as power `power_type|value`). Promo allies with matching stats appear as printings of the ERB base in DBV/deck editor **without** `foil_card_map`. ERB slot map: [PATH_RULES.md — Ally stat slots](PATH_RULES.md#ally-stat-slots-erb-base-mapping).

```sql
INSERT INTO ally_universe_cards (
  id, name, set, card_description,
  stat_to_use, stat_type_to_use, attack_value, attack_type,   card_text,
  image_path, one_per_deck,
  set_number, set_number_foil, rarity, is_foil, created_at, updated_at
)
SELECT gen_random_uuid(),
  'White Demon Of Mazandaran', 'TFCP', 'White Demon Of Mazandaran ally card',
  '5 or less', 'Energy', 3, 'Energy',   'Teammate must play 1 Special card.',
  'tfacp/ally/5_energy.png', FALSE,
  NULL, NULL, NULL, FALSE, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM ally_universe_cards
  WHERE image_path = 'tfacp/ally/5_energy.png' AND set = 'TFCP' AND is_foil = FALSE
);
```

**ERB reference:** `V28__Populate_ally_universe_cards_data.sql`  
**TFCP promo reference:** `V295__TFCP_tfacp_ally_white_demon.sql`  
**Printings test:** `tests/unit/cardPrintings.test.ts` — `groups ally universe cards by stat slot across sets`

---

## 11. Training (`training_cards`)

**Naming:** `name` = `Training ({Character})`; `bonus` = `+4`, `+5`, etc.

```sql
INSERT INTO training_cards (
  id, name, set, card_description,
  type_1, type_2, value_to_use, bonus, image_path,
  one_per_deck, is_foil, set_number, set_number_foil, rarity, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Training (Sekhmet)', 'ERB', 'Training (Sekhmet) training card',
  'Energy', 'Brute Force', '5 or less', '+4', 'training-universe/sekhmet.webp',
  FALSE, FALSE, '545', NULL, 'Common', NOW(), NOW()
WHERE NOT EXISTS (...);
```

---

## 12. Basic universe (`basic_universe_cards`)

**Naming:** item name; `value_to_use` like `6 or greater`.

```sql
INSERT INTO basic_universe_cards (
  id, name, set, card_description,
  type, value_to_use, bonus, image_path,
  one_per_deck, is_foil, set_number, set_number_foil, rarity, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Ray Gun', 'ERB', 'Ray Gun basic universe card',
  'Energy', '6 or greater', '+2', 'basic-universe/ray_gun.webp',
  FALSE, FALSE, '301', NULL, 'Common', NOW(), NOW()
WHERE NOT EXISTS (...);
```

---

## Foil-only promos

Use when physical printing is **foil-only** and should link to an ERB base for Select Art / deck editor foil toggle.

### `foil_card_map` table

`(foil_card_id, base_card_id, card_type)` — `card_type` uses deck strings: `character`, `special`, `power`, `training`.

| Type | Typical join keys |
|------|-------------------|
| character | `name`, `set`, `image_path` |
| special | `character_name`, `name`, `image_path` |
| power | `power_type`, `value` (cross-set / cross-art OK) |
| training | `name`, `image_path` (cross-set) |

### Pattern A — foil-only training (V258)

1. `INSERT` ERBP foil row cloned from ERB base stats; `is_foil=TRUE`, promo NULLs.
2. `INSERT INTO foil_card_map` linking ERBP foil ↔ ERB base.

### Pattern B — convert existing row to foil-only (V294)

1. Remap `deck_cards` from non-foil → foil row (merge quantities).
2. Update `collection_cards.card_id` to foil UUID (use UUID type, not `::text`).
3. `DELETE` non-foil row and stale `foil_card_map` entries.
4. `UPDATE` surviving row: `is_foil=TRUE`.
5. `INSERT INTO foil_card_map`: TFCP foil → ERB base on `power_type` + `value`.

```sql
INSERT INTO foil_card_map (foil_card_id, base_card_id, card_type)
SELECT foil.id::text, base.id::text, 'power'
FROM power_cards foil
JOIN power_cards base
  ON base.set = 'ERB'
 AND base.power_type = 'Combat'
 AND base.value = 7
 AND base.image_path = 'power-cards/7_combat.webp'
 AND base.is_foil = FALSE
WHERE foil.set = 'TFCP'
  AND foil.image_path = 'tfacp/power/7_combat.png'
  AND foil.is_foil = TRUE
ON CONFLICT DO NOTHING;
```

**Note:** `foil_card_map` is for **foil-only** promos (power, training, character, special). **Ally promos** join printings via stat-slot `variantGroupKey`, not `foil_card_map`. No ally rows exist in `foil_card_map` today.

---

## Metadata drift UPDATE

After INSERT, normalize fields if re-running migration:

```sql
UPDATE power_cards SET
  name = '7 - Energy', power_type = 'Energy', value = 7,
  set = 'TFCP', one_per_deck = TRUE,
  set_number = NULL, set_number_foil = NULL, rarity = NULL,
  updated_at = NOW()
WHERE image_path = 'tfacp/power/7_energy.jpg' AND set = 'TFCP' AND is_foil = FALSE
  AND (name IS DISTINCT FROM '7 - Energy' OR ...);
```

---

## Main-line ERB vs promo

| Field | Main-line ERB | Promo (TFCP/SKYP/ERBP) |
|-------|---------------|-------------------------|
| `set_number` | From checklist | NULL |
| `set_number_foil` | When applicable | NULL |
| `rarity` | Common/Uncommon/Rare/Ultra Rare | NULL |
| `name` | Checklist name | Often art-specific (promos) or stat label (powers) |
