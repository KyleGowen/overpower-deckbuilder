-- Preserve each official source entry verbatim in errata.entry_text while
-- allowing a linked card to display only the shared guidance and the portion
-- that applies to that card.

ALTER TABLE card_errata
ADD COLUMN display_text TEXT;

ALTER TABLE card_errata
ADD CONSTRAINT card_errata_display_text_not_blank_chk
CHECK (display_text IS NULL OR BTRIM(display_text) <> '');

-- Section 1 contains one shared Absolute KO explanation followed by four
-- independent card cases. Each linked card keeps the shared explanation and
-- only its own case.
WITH scoped (source_section, card_set, set_number, character_name, card_name, display_text) AS (
    VALUES
        (
            1,
            'SKY',
            '048',
            'Allen The Alien',
            'Near Death Experience',
            $text$Absolute KO ensures that a defeated character goes to the Defeated Characters Pile and the normal KO process is followed, including discarding placed cards to the character and effects attached or “paper clipped” to the character. It does not prevent resurrection from the Defeated Characters Pile. The practical implications are as follows:

Allen the Alien - When Allen the Alien is KO’d in any way, his KO is processed and he goes to the Defeated Characters Pile, and then is resurrected in reserve if “Near Death Experience” is in play. Absolute KO does not prevent the effects of Allen the Alien’s “Near Death Experience”, and that card lives in the Astral Plane rather than attached to Allen the Alien, so the effect is NOT discarded when processing the initial KO.$text$
        ),
        (
            1,
            'SKY',
            '073',
            'Immortal',
            'I am Immortal',
            $text$Absolute KO ensures that a defeated character goes to the Defeated Characters Pile and the normal KO process is followed, including discarding placed cards to the character and effects attached or “paper clipped” to the character. It does not prevent resurrection from the Defeated Characters Pile. The practical implications are as follows:

Immortal - When Immortal is KO’d in any way, he goes to the Defeated Characters Pile, and then is resurrected in reserve if “I Am Immortal” is in play. Absolute KO does not prevent the effects of Immortal’s “I Am Immortal” and that card lives in the Astral Plane rather than attached to Immortal, so the effect is NOT discarded when processing the initial KO.$text$
        ),
        (
            1,
            'SKY',
            '059',
            'Mauler Twins',
            'My Brother',
            $text$Absolute KO ensures that a defeated character goes to the Defeated Characters Pile and the normal KO process is followed, including discarding placed cards to the character and effects attached or “paper clipped” to the character. It does not prevent resurrection from the Defeated Characters Pile. The practical implications are as follows:

Mauler Twins - Their Special card “My Brother” does not prevent Absolute KO. My Brother is attached or “paper clipped” to the Mauler Twins, so processing the KO includes discarding that effect. Because it is not a resurrection mechanic, Absolute KO will put Mauler Twins into the Defeated Characters Pile, and then “My Brother” has no effect.$text$
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

WITH scoped (source_section, card_set, set_number, card_name, display_text) AS (
    VALUES
        (
            1,
            'SKY',
            '226',
            'Walkers: Herd',
            $text$Absolute KO ensures that a defeated character goes to the Defeated Characters Pile and the normal KO process is followed, including discarding placed cards to the character and effects attached or “paper clipped” to the character. It does not prevent resurrection from the Defeated Characters Pile. The practical implications are as follows:

Walkers: Herd - Their Inherent Ability does not prevent Absolute KO. Like Mauler Twins “My Brother” special card, this is not a resurrection mechanic. Absolute KO puts the Walkers: Herd character card into the Defeated Characters Pile, which prevents them from flipping over, and their Inherent Ability has no effect.$text$
        ),
        (
            1,
            'SKY',
            '450',
            'Walkers: Herd',
            $text$Absolute KO ensures that a defeated character goes to the Defeated Characters Pile and the normal KO process is followed, including discarding placed cards to the character and effects attached or “paper clipped” to the character. It does not prevent resurrection from the Defeated Characters Pile. The practical implications are as follows:

Walkers: Herd - Their Inherent Ability does not prevent Absolute KO. Like Mauler Twins “My Brother” special card, this is not a resurrection mechanic. Absolute KO puts the Walkers: Herd character card into the Defeated Characters Pile, which prevents them from flipping over, and their Inherent Ability has no effect.$text$
        )
)
UPDATE card_errata ce
SET display_text = scoped.display_text,
    updated_at = NOW()
FROM scoped
JOIN errata e ON e.source_section = scoped.source_section
JOIN characters c
  ON c.set = scoped.card_set
 AND c.set_number = scoped.set_number
 AND c.name = scoped.card_name
WHERE ce.errata_id = e.id
  AND ce.card_type = 'character'
  AND ce.card_id = c.id
  AND ce.display_text IS DISTINCT FROM scoped.display_text;

-- Section 2 establishes a shared grid-checking rule, then gives separate Allen
-- and Flaxans cases. Friendly Manipulation displays the rule and Allen case.
WITH scoped (source_section, card_set, set_number, character_name, card_name, display_text) AS (
    VALUES
        (
            2,
            'SKY',
            '049',
            'Allen The Alien',
            'Friendly Manipulation',
            $text$Effectively immediately, the following section of the Comprehensive Rulebook is considered to be eliminated:

“NOTE: Sometimes characters have Special cards that “Act as” a Power card. These may be combined with Training cards as long as the Special card is 5 or less in a Power Type in which that character’s Power Grid is also 5 or less.” (Page 6 of the 2025 Comprehensive Rulebook).”

It will be replaced with:

“NOTE: Sometimes characters have Special cards that “Act as” a Power card. These may be combined with Training cards as long as the character’s power grid is currently less than 5 in the applicable Power Type. Special cards which “Act as” as Power card may prescribe a value that is above the character's normal grid. However, the Training card checks the Character’s Grid, not the Power card. In the case of Special cards that “Act as” an Any-power Power card, they must use one of the character’s grids to combine with Universe cards or other cards requiring a type”

To summarize, all Universe cards with grid requirements now check the character’s grid, and that’s it.

Allen the Alien’s “Friendly Manipulation” specifies that it acts as a 6 Intelligence Power card that he can use. A Training Universe card would check his Power Grid (at level 3, still low enough by default), and he may combine it with that Special card, as was specified in the character spotlight on YouTube.$text$
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

-- Section 23 contains two independent Lancelot card rulings with no shared
-- paragraph, so each card displays only its own paragraph.
WITH scoped (source_section, card_set, set_number, character_name, card_name, display_text) AS (
    VALUES
        (
            23,
            'ERB',
            '134',
            'Lancelot',
            'For Guinevere''s Love',
            $text$“For Guinevere’s Love” may now be played with a power card attack, to immediately fetch “Sword and Shield” and boost that power card attack. If used in this manner, it cannot be as a direct follow-up to an Ally Universe card or a Teamwork Universe card.$text$
        ),
        (
            23,
            'ERB',
            '136',
            'Lancelot',
            'Knight of the Round Table',
            $text$“Knight of the Round Table” must remove a hit before fetching Sword and Shield. It cannot be played with a power card attack.$text$
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
    scoped_rows INTEGER;
BEGIN
    SELECT COUNT(*) INTO scoped_rows
    FROM card_errata ce
    JOIN errata e ON e.id = ce.errata_id
    WHERE e.source_section IN (1, 2, 23)
      AND ce.display_text IS NOT NULL;

    IF scoped_rows <> 8 THEN
        RAISE EXCEPTION 'Expected 8 card-specific errata display rows, found %', scoped_rows;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM card_errata ce
        JOIN errata e ON e.id = ce.errata_id
        WHERE e.source_section NOT IN (1, 2, 23)
          AND ce.display_text IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Unexpected card-specific display text outside sections 1, 2, and 23';
    END IF;
END $$;

COMMENT ON COLUMN card_errata.display_text IS
    'Optional card-specific display text; preserves shared guidance and omits sibling-card-only passages while errata.entry_text remains canonical';
