-- Keep the official source transcription in errata.entry_text, but omit the
-- approved strategy and power-level commentary from card-facing display text.

WITH scoped (source_section, card_set, set_number, character_name, card_name, display_text) AS (
    VALUES
        (
            7,
            'SKY',
            '055',
            'The Flaxans',
            'Monstrous Leadership',
            $text$“Monstrous Leadership” does not need a function icon (like a half- or full-hourglass) because its effects are played and then resolved without a specified duration. Removing this as a hit or offensively negating this card would not undo the Flaxans’ movement to the Front Line, as it has already been played and processed.

This does mean that occasionally the Player may have 4 Front Line characters!$text$
        ),
        (
            19,
            'SKY',
            '118',
            'Lizard League',
            'Salamander''s Toxikinesis',
            $text$Does the text on this card protect itself, so that once it hits it cannot be negated, healed, or otherwise removed?

Yes - It does prevent itself from being removed.

That said, a higher class card’s effect could override “Salamander's Toxikinesis” effect. For example, Artifacts, Events, Aspects, etc. COULD remove this hit.$text$
        )
)
UPDATE card_errata ce
SET display_text = scoped.display_text,
    updated_at = NOW()
FROM scoped
JOIN errata e ON e.source_section = scoped.source_section
JOIN special_cards sc
  ON sc.set = scoped.card_set
 AND sc.set_number = scoped.set_number
 AND sc.character_name = scoped.character_name
 AND sc.name = scoped.card_name
WHERE ce.errata_id = e.id
  AND ce.card_type = 'special'
  AND ce.card_id = sc.id
  AND ce.display_text IS DISTINCT FROM scoped.display_text;

DO $$
DECLARE
    strategy_free_rows INTEGER;
BEGIN
    SELECT COUNT(*) INTO strategy_free_rows
    FROM card_errata ce
    JOIN errata e ON e.id = ce.errata_id
    JOIN special_cards sc ON ce.card_type = 'special' AND ce.card_id = sc.id
    WHERE (e.source_section = 7 AND sc.set = 'SKY' AND sc.set_number = '055')
       OR (e.source_section = 19 AND sc.set = 'SKY' AND sc.set_number = '118');

    IF strategy_free_rows <> 2 THEN
        RAISE EXCEPTION 'Expected 2 strategy-free errata display rows, found %', strategy_free_rows;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM card_errata ce
        JOIN errata e ON e.id = ce.errata_id
        WHERE e.source_section IN (7, 19)
          AND (
              ce.display_text IS NULL
              OR ce.display_text ILIKE '%rarely a strategic advantage%'
              OR ce.display_text ILIKE '%powerful effect for this Max 6%'
          )
    ) THEN
        RAISE EXCEPTION 'Strategy commentary remains in section 7 or 19 card-facing errata';
    END IF;
END $$;
