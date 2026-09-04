-- Keep the complete official section 9 transcription in errata.entry_text,
-- but omit its deckbuilding recommendation from the card-facing text.

WITH scoped_text AS (
    SELECT $text$Glenn’s Inherent Ability only applies to his ability to play Basic Universe cards. It does not allow him to play Power cards that his grid does not normally allow, even when he combines one with a Basic Universe card ignoring grid requirements due to his Inherent Ability.

The practical implication is that Glenn can use an 8 to use +3 Energy Basic Universe card, but only with an Energy Power card which Glenn’s grid allows him to normally play (i.e. level 1 or 2).$text$::TEXT AS display_text
)
UPDATE card_errata ce
SET display_text = scoped_text.display_text,
    updated_at = NOW()
FROM errata e
CROSS JOIN scoped_text
WHERE ce.errata_id = e.id
  AND e.source_section = 9
  AND ce.card_type = 'character'
  AND ce.display_text IS DISTINCT FROM scoped_text.display_text;

DO $$
DECLARE
    scoped_rows INTEGER;
BEGIN
    SELECT COUNT(*) INTO scoped_rows
    FROM card_errata ce
    JOIN errata e ON e.id = ce.errata_id
    JOIN characters c ON ce.card_type = 'character' AND c.id = ce.card_id
    WHERE e.source_section = 9
      AND c.set = 'SKY'
      AND c.set_number IN ('170', '442', '442F')
      AND c.name = 'Glenn'
      AND ce.display_text IS NOT NULL
      AND ce.display_text LIKE '%The practical implication is that Glenn can use an 8%'
      AND ce.display_text NOT LIKE '%Strategically,%'
      AND ce.display_text NOT LIKE '%Shapesmith%';

    IF scoped_rows <> 3 THEN
        RAISE EXCEPTION 'Expected 3 strategy-free Glenn errata display rows, found %', scoped_rows;
    END IF;
END $$;
