-- Store official Season 1 card clarifications, rulings, and errata once, then
-- associate each entry with every applicable catalog printing.
--
-- Plain text source:
--   src/resources/rules/OverPower_Season_1_Card_Clarifications_Rulings_and_Errata_September_2026.pdf
-- Canonical deep links:
--   https://overpowercardgame.com/errata/

CREATE TABLE errata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_section SMALLINT NOT NULL UNIQUE,
    entry_title VARCHAR(255) NOT NULL,
    entry_text TEXT NOT NULL,
    source_url TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT errata_source_section_chk CHECK (source_section BETWEEN 1 AND 23),
    CONSTRAINT errata_entry_title_not_blank_chk CHECK (BTRIM(entry_title) <> ''),
    CONSTRAINT errata_entry_text_not_blank_chk CHECK (BTRIM(entry_text) <> ''),
    CONSTRAINT errata_source_url_not_blank_chk CHECK (BTRIM(source_url) <> '')
);

CREATE TRIGGER update_errata_updated_at BEFORE UPDATE ON errata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE card_errata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    errata_id UUID NOT NULL REFERENCES errata(id) ON DELETE CASCADE,
    card_id UUID NOT NULL,
    card_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT card_errata_card_type_not_blank_chk CHECK (BTRIM(card_type) <> ''),
    CONSTRAINT card_errata_entry_card_unique UNIQUE (errata_id, card_type, card_id)
);

CREATE INDEX idx_card_errata_card ON card_errata(card_type, card_id);
CREATE INDEX idx_card_errata_errata_id ON card_errata(errata_id);

CREATE TRIGGER update_card_errata_updated_at BEFORE UPDATE ON card_errata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO errata (source_section, entry_title, entry_text, source_url) VALUES
(
    1,
    $title$Absolute KO and Flip/Resurrection Mechanics$title$,
    $entry$Absolute KO ensures that a defeated character goes to the Defeated Characters Pile and the normal KO process is followed, including discarding placed cards to the character and effects attached or “paper clipped” to the character. It does not prevent resurrection from the Defeated Characters Pile. The practical implications are as follows:

Allen the Alien - When Allen the Alien is KO’d in any way, his KO is processed and he goes to the Defeated Characters Pile, and then is resurrected in reserve if “Near Death Experience” is in play. Absolute KO does not prevent the effects of Allen the Alien’s “Near Death Experience”, and that card lives in the Astral Plane rather than attached to Allen the Alien, so the effect is NOT discarded when processing the initial KO.

Immortal - When Immortal is KO’d in any way, he goes to the Defeated Characters Pile, and then is resurrected in reserve if “I Am Immortal” is in play. Absolute KO does not prevent the effects of Immortal’s “I Am Immortal” and that card lives in the Astral Plane rather than attached to Immortal, so the effect is NOT discarded when processing the initial KO.

Mauler Twins - Their Special card “My Brother” does not prevent Absolute KO. My Brother is attached or “paper clipped” to the Mauler Twins, so processing the KO includes discarding that effect. Because it is not a resurrection mechanic, Absolute KO will put Mauler Twins into the Defeated Characters Pile, and then “My Brother” has no effect.

Walkers: Herd - Their Inherent Ability does not prevent Absolute KO. Like Mauler Twins “My Brother” special card, this is not a resurrection mechanic. Absolute KO puts the Walkers: Herd character card into the Defeated Characters Pile, which prevents them from flipping over, and their Inherent Ability has no effect.$entry$,
    'https://overpowercardgame.com/errata/#s1'
),
(
    2,
    $title$Allen the Alien — Friendly Manipulation$title$,
    $entry$Effectively immediately, the following section of the Comprehensive Rulebook is considered to be eliminated:

“NOTE: Sometimes characters have Special cards that “Act as” a Power card. These may be combined with Training cards as long as the Special card is 5 or less in a Power Type in which that character’s Power Grid is also 5 or less.” (Page 6 of the 2025 Comprehensive Rulebook).”

It will be replaced with:

“NOTE: Sometimes characters have Special cards that “Act as” a Power card. These may be combined with Training cards as long as the character’s power grid is currently less than 5 in the applicable Power Type. Special cards which “Act as” as Power card may prescribe a value that is above the character's normal grid. However, the Training card checks the Character’s Grid, not the Power card. In the case of Special cards that “Act as” an Any-power Power card, they must use one of the character’s grids to combine with Universe cards or other cards requiring a type”

To summarize, all Universe cards with grid requirements now check the character’s grid, and that’s it.

Allen the Alien’s “Friendly Manipulation” specifies that it acts as a 6 Intelligence Power card that he can use. A Training Universe card would check his Power Grid (at level 3, still low enough by default), and he may combine it with that Special card, as was specified in the character spotlight on YouTube.

The Flaxans “City Leveling Invasion” Acts as a Level 7 Any-Power Power card. Just like normal Any-Power or MultiPower Power cards, a grid should be specified when playing the card (if not, the Opponent can choose the type). As such, the Flaxans need to choose either their Energy or Intelligence grid to play this card. Their grids are 7 and 8 in Energy and Intelligence, respectively, so this card cannot be played with a Combat or Brute Force Training Universe. It can be combined with an Energy or Intelligence Basic Universe card.$entry$,
    'https://overpowercardgame.com/errata/#s2'
),
(
    3,
    $title$Alpha and the Whisperers — Alpha$title$,
    $entry$Their Special card “Alpha” which Acts a a level 8 Brute Force attack does not need to be successful for the +3 to Venture Total to take effect. If the attack is unsuccessful or removed during the current battle, it goes to the Astral Plane - this is why the card has the conditional slash and then Astral Plane function icons.$entry$,
    'https://overpowercardgame.com/errata/#s3'
),
(
    4,
    $title$Andrea — Aim$title$,
    $entry$When you discard "Aim" from play to make a Power card attack that cannot be defended, it is not considered to be ‘played with’ or ‘combined’ with the Power card attack. This is because “Aim” has already been played and is now being discarded from play to trigger the effect. Discarding “Aim” from play does not count as its own action, separate from the Power card attack, because discarding “Aim” triggers making the Power card attack which cannot be defended. The discard of “Aim” and the Power card attack occur in the same ‘loop’ of the battle mechanic.

The Opponent’s opportunity to deal with “Aim” defensively comes as it is being played; or offensively, it can be removed before it is discarded from play. It may not be avoided or negated as it is being discarded to trigger the effect.

Does Aim potentially work with or synergize with Pinpoint Accuracy?

No. “Pinpoint Accuracy” requires a Power card attack that it modifies to be the first action of the turn. “Aim” requires you to discard it first; and since discarding a card to trigger an effect is an action (battle mechanic to be updated to clarify this) – both effects cannot be triggered at the same time.

NOTE: Regarding “Aim”, if the attack which cannot be defended is shifted to a new target, it still may not be defended. Shifting it doesn’t ‘negate’ the effect of “Aim”. This is similar to the ruling on Anubis’ Special card “Lord of the Sacred Land” in that the “Aim” effect is put into play and executed first, unless a special card negate is played.$entry$,
    'https://overpowercardgame.com/errata/#s4'
),
(
    5,
    $title$Atom Eve — Redirect Electrons$title$,
    $entry$“Redirect Electrons” cannot affect the language on Event cards. Event cards are played by the Player and/or Opponent, not by the ‘team’ - the ‘team’ is the 4 characters. It also cannot affect cards which are not played by a Character, such as Aspect cards.$entry$,
    'https://overpowercardgame.com/errata/#s5'
),
(
    6,
    $title$Barsoom/Mars, Grid Boosts, and Fetches$title$,
    $entry$A grid boost (i.e., John Carter’s “Lower Gravity”) can be played with a Teamwork Universe card or other card, but only if the grid boost is required for the character to play the card.

If the Player is playing with Barsoom/Mars as their Homebase, this would trigger the fetch of a Power card. In this scenario, the Player MAY assume the success of the Power card fetch when playing the initial Teamwork, and can play the Teamwork even if the Player initially has no other playable Power card follow-up attacks available, placed or in hand. If the fetch is successful, the fetched Power card may then be used as the first or second follow-up attack to the Teamwork card, so long as it is legally playable by a teammate. If the Opponent negates “Lower Gravity” or any other grid boosting Special card, this would 1) stop the grid boost effect, 2) defend the Teamwork attack because it invalidates the attack, 3) prevent the fetch.

However, the Power card fetched cannot be used to attack in the same step / action as the fetch itself, because Barsoom/Mars does not permit the fetched Power card to be played ‘immediately’. For example, “Lower Gravity” may not be played as a follow-up to a Teamwork Universe card to boost the grid, fetch a Power card, and then play that fetched Power card all in the same step / ‘loop’ of the Battle mechanic.

Overall - you must have and declare / play everything you intend to play in each loop of the battle mechanic. You cannot fetch AND play a card at the same time UNLESS a card says a fetched card may be IMMEDIATELY played. See the battle mechanic, below:

NOTE: King Arthur’s “Heavy is the Head” Special card allows a fetched card to be played ‘immediately’, so it COULD be played as a Teamwork card follow-up to fetch a Special card such as Robin Hood’s “Band of Merry Men,” which acts as a Power card, if it is then immediately used as a legal follow-up attack. As above, the player is allowed to assume success of “Heavy is the Head” fetching and immediately playing an 'Acts as” Power card.$entry$,
    'https://overpowercardgame.com/errata/#s6'
),
(
    7,
    $title$The Flaxans — Monstrous Leadership$title$,
    $entry$“Monstrous Leadership” does not need a function icon (like a half- or full-hourglass) because its effects are played and then resolved without a specified duration. Removing this as a hit or offensively negating this card would not undo the Flaxans’ movement to the Front Line, as it has already been played and processed.

This does mean that occasionally the Player may have 4 Front Line characters! Generally speaking, this is rarely a strategic advantage (4 Characters generally means more ability for the Opponent to score venture).$entry$,
    'https://overpowercardgame.com/errata/#s7'
),
(
    8,
    $title$The Flaxans — Second Invasion$title$,
    $entry$Errata: This card should be considered to have the text “May be played from Reserve.”$entry$,
    'https://overpowercardgame.com/errata/#s8'
),
(
    9,
    $title$Glenn’s Inherent Ability$title$,
    $entry$Glenn’s Inherent Ability only applies to his ability to play Basic Universe cards. It does not allow him to play Power cards that his grid does not normally allow, even when he combines one with a Basic Universe card ignoring grid requirements according to his Inherent Ability.

The practical implication is that Glenn can use an 8 to use +3 Energy Basic Universe card, but only with an Energy Power card which Glenn’s grid allows him to normally play (i.e. level 1 or 2). Strategically, look for Glenn to be played with the GDA Battleground Any Character Special card “Shapesmith” to fully unlock his Inherent Ability’s potential!$entry$,
    'https://overpowercardgame.com/errata/#s9'
),
(
    10,
    $title$God King Lore — The Nevermind$title$,
    $entry$“The Nevermind” cannot be avoided, but may be negated. It also cannot be shifted. The card affects the Opponent initially, with God King Lore choosing a Character; then if it is not declined or negated, it takes effect. To restate this - It DOES NOT target a character itself; it is played against the Opponent but affects a target character while in play.

If accepted, this paper-clips / attaches to the chosen characters. If rejected, it paper-clips / attaches to God King Lore until the venture is counted.$entry$,
    'https://overpowercardgame.com/errata/#s10'
),
(
    11,
    $title$Leonidas — Baptized in Combat$title$,
    $entry$“Baptized in Combat” is played simultaneously with an attack or defense as a modifier. It does not start a chain where “Baptized in Combat” is played first and then the bonus is applied to a follow-up action. If it is negated defensively, the Combat numerical attack continues without the bonus.

The practical implication of this with an eye towards the Skybound set is that this cannot be used to follow up Robot’s “Predictive Tactics”.$entry$,
    'https://overpowercardgame.com/errata/#s11'
),
(
    12,
    $title$Immortal — I am Immortal$title$,
    $entry$Errata: The “I am Immortal” Special card should be considered to have the Remainder of Game Full Hourglass function icon, rather than the half-hourglass icon.$entry$,
    'https://overpowercardgame.com/errata/#s12'
),
(
    13,
    $title$Machine Head and His Gang — Isotope$title$,
    $entry$The ruling on “Isotope” is that under normal game conditions it may always be played defensively to shift 1 attack of the specified Power types, even if Machine Head and His Gang already have 2 or more hits. After the shift is completed, the Player checks whether the conditions for it to persist are present; if Machine Head and His Gang already have 2 (or more) hits, the effect is resolved and removed from play.$entry$,
    'https://overpowercardgame.com/errata/#s13'
),
(
    14,
    $title$Maggie — The Widow’s Leadership$title$,
    $entry$“The Widow’s Leadership” allows any teammate, including the Reserve character, to play 1 card as a follow-up action. The follow-up card cannot be modified by any other card(s) because the specified quantity of cards allowed is 1. A card played by the Reserve following “The Widow’s Leadership” does NOT need to be normally playable from Reserve (i.e., Cthulhu could play his “The Sleeper Awakens” Level 11 Any-Power attack Special card, or a Power card attack normally playable by him according to his grid).

However, any costs normally required to play a card from Reserve would remain (i.e., Victory Harben would still need to discard an Intelligence Power card to play her “Practical Physics” 7 Energy attack Special card as a follow-up to “The Widow’s Leadership.” Widow’s leadership does not modify or remove “Practical Physics” text, and the Reserve character is still in Reserve when they play their card).

NOTE: Anytime a special grants follow-up actions to teammate(s), the granted follow-ups may not start another string of attacks (this is the Cthulhu “Network of Fanatics” / Joan of Arc “Inspirational Leadership” ruling). Practically this means Widow’s Leadership cannot be used to create a large string.$entry$,
    'https://overpowercardgame.com/errata/#s14'
),
(
    15,
    $title$Michonne — Post-Apocalyptic Lawyer$title$,
    $entry$Instead of being used as a numerical attack or defense, “Post-Apocalyptic Lawyer” may be discarded, whether placed or hand, to prevent any other card(s) belonging to the Player from being discarded by the Opponent. For example, besides the obvious use of being played defensively against a card like “Grim Reaper,” this can be played defensively to prevent an Opponent’s attempt to remove a hit from one of their characters; trigger their 221-B Baker/Ageis St. Homebase Inherent Ability; etc.

NOTE: If Michonne has “Walker Camouflage” in play and the Opponent attacks the Player’s team, Michonne is the one discarding “Walker Camouflage” from play to take a hit. “Post-Apocalyptic Lawyer” cannot be discarded instead to essentially use "Walker Camouflage" twice. If the Opponent tries to Negate or use a card like Hercules’ “Slaying the Hydra” to discard “Walker Camouflage”, then “Post-Apocalyptic Lawyer” may be used to protect it.

If a card both discards a card itself and then triggers 221-B Baker/ Ageis, “Post-Apocalyptic Lawyer” would prevent both/all discards.$entry$,
    'https://overpowercardgame.com/errata/#s15'
),
(
    16,
    $title$“Who Killed the Guardians of the Globe” Mission set Event, “The New Guardians”$title$,
    $entry$Does this allow the reserve to play Allies?

Yes. It says “Any Character”. ‘Any’ truly means any, including the Reserve.$entry$,
    'https://overpowercardgame.com/errata/#s16'
),
(
    17,
    $title$Omni-Man — Guardians of the Globe No More$title$,
    $entry$“Guardians of the Globe No More” does not affect Venture Total when a character is KO’d; any hits from current battle on a KO’d character are moved to the Astral Plane to be counted towards the Venture total at the end of the battle, according to normal KO rules.$entry$,
    'https://overpowercardgame.com/errata/#s17'
),
(
    18,
    $title$Walkers’ Inherent Ability$title$,
    $entry$Errata: the Walkers’ alternate art variant card #450 is missing the text that restricts their Universe card usage; this text should be present, and it should read identical to the Walkers’ normal inherent (card #226).

NOTE: although their Inherent Ability restricts them from playing Universe cards themselves, they MAY play follow-up actions to Universe cards (for example, Teamwork or Ally Universe cards) played by teammates according to normal rules.

If the “Who Killed the Guardians of the Globe” Mission set Event, “The New Guardians” is in play, as a higher class of card this overrides the Walkers’ Inherent, and they could play an Ally Universe card.$entry$,
    'https://overpowercardgame.com/errata/#s18'
),
(
    19,
    $title$Lizard League — Salamander's Toxikinesis$title$,
    $entry$Does the text on this card protect itself, so that once it hits it cannot be negated, healed, or otherwise removed?

Yes - It does prevent itself from being removed. This is a powerful effect for this Max 6 grid character.

That said, a higher class card’s effect could override “Salamander's Toxikinesis” effect. For example, Artifacts, Events, Aspects, etc. COULD remove this hit.$entry$,
    'https://overpowercardgame.com/errata/#s19'
),
(
    20,
    $title$Machine Head — Quantum Realities Upgrade$title$,
    $entry$The fetch of “Isotope” triggers when either option of “Quantum Realities Upgrade” is selected. You choose to play one of the 2 effects, and then execute the Fetch next. Since the first option reads that Machine Head “May” Negate, he can also choose Option1; decline to negate; and then fetch.$entry$,
    'https://overpowercardgame.com/errata/#s20'
),
(
    21,
    $title$Maggie — Farmer’s Daughter$title$,
    $entry$The Power cards placed to father’s daughter are truly placed on the board and can be discarded by Grim Reaper, etc.

However, they do not count towards duplication versus your hand or other placed cards.$entry$,
    'https://overpowercardgame.com/errata/#s21'
),
(
    22,
    $title$Negan — Sanctuary$title$,
    $entry$This card may not choose / target the reserve teammate.$entry$,
    'https://overpowercardgame.com/errata/#s22'
),
(
    23,
    $title$Lancelot — For Guinevere’s Love and Knight of the Round Table (updated guidance)$title$,
    $entry$“Knight of the Round Table” must remove a hit before fetching Sword and Shield. It cannot be played with a power card attack.

“For Guinevere’s Love” may now be played with a power card attack, to immediately fetch “Sword and Shield” and boost that power card attack. If used in this manner, it cannot be as a direct follow-up to an Ally Universe card or a Teamwork Universe card.$entry$,
    'https://overpowercardgame.com/errata/#s23'
);

WITH expected (source_section, card_set, set_number, character_name, card_name) AS (
    VALUES
        (1, 'SKY', '048', 'Allen The Alien', 'Near Death Experience'),
        (1, 'SKY', '073', 'Immortal', 'I am Immortal'),
        (1, 'SKY', '059', 'Mauler Twins', 'My Brother'),
        (2, 'SKY', '049', 'Allen The Alien', 'Friendly Manipulation'),
        (3, 'SKY', '186', 'Alpha and the Whisperers', 'Alpha'),
        (4, 'SKY', '137', 'Andrea', 'Aim'),
        (5, 'SKY', '035', 'Atom Eve', 'Redirect Electrons'),
        (7, 'SKY', '055', 'The Flaxans', 'Monstrous Leadership'),
        (8, 'SKY', '052', 'The Flaxans', 'Second Invasion'),
        (10, 'SKY', '243', 'God King Lore', 'The Nevermind'),
        (11, 'ERB', '141', 'Leonidas', 'Baptized in Combat'),
        (12, 'SKY', '073', 'Immortal', 'I am Immortal'),
        (13, 'SKY', '105', 'Machine Head and His Gang', 'Isotope'),
        (14, 'SKY', '166', 'Maggie', 'The Widow''s Leadership'),
        (15, 'SKY', '146', 'Michonne', 'Post-Apocalyptic Lawyer'),
        (17, 'SKY', '013', 'Omni-Man', 'Guardians of the Globe No More'),
        (19, 'SKY', '118', 'Lizard League', 'Salamander''s Toxikinesis'),
        (20, 'SKY', '101', 'Machine Head and His Gang', 'Quantum Realities Upgrade'),
        (21, 'SKY', '165', 'Maggie', 'Farmer''s Daughter'),
        (22, 'SKY', '151', 'Negan', 'Sanctuary'),
        (23, 'ERB', '134', 'Lancelot', 'For Guinevere''s Love'),
        (23, 'ERB', '136', 'Lancelot', 'Knight of the Round Table')
)
INSERT INTO card_errata (errata_id, card_id, card_type)
SELECT e.id, sc.id, 'special'
FROM expected x
JOIN errata e ON e.source_section = x.source_section
JOIN special_cards sc
  ON sc.set = x.card_set
 AND sc.set_number = x.set_number
 AND sc.character_name = x.character_name
 AND sc.name = x.card_name;

WITH expected (source_section, card_set, set_number, card_name) AS (
    VALUES
        (1, 'SKY', '226', 'Walkers: Herd'),
        (1, 'SKY', '450', 'Walkers: Herd'),
        (9, 'SKY', '170', 'Glenn'),
        (9, 'SKY', '442', 'Glenn'),
        (9, 'SKY', '442F', 'Glenn'),
        (18, 'SKY', '226', 'Walkers: Herd'),
        (18, 'SKY', '450', 'Walkers: Herd')
)
INSERT INTO card_errata (errata_id, card_id, card_type)
SELECT e.id, c.id, 'character'
FROM expected x
JOIN errata e ON e.source_section = x.source_section
JOIN characters c
  ON c.set = x.card_set
 AND c.set_number = x.set_number
 AND c.name = x.card_name;

WITH expected (source_section, card_set, set_number, card_name) AS (
    VALUES
        (6, 'ERB', '468', 'Barsoom'),
        (6, 'SKY', '384', 'Mars')
)
INSERT INTO card_errata (errata_id, card_id, card_type)
SELECT e.id, l.id, 'location'
FROM expected x
JOIN errata e ON e.source_section = x.source_section
JOIN locations l
  ON l.set = x.card_set
 AND l.set_number = x.set_number
 AND l.name = x.card_name;

INSERT INTO card_errata (errata_id, card_id, card_type)
SELECT e.id, ev.id, 'event'
FROM errata e
JOIN events ev
  ON ev.set = 'SKY'
 AND ev.set_number = '402'
 AND ev.name = 'The New Guardians'
WHERE e.source_section = 16;

DO $$
DECLARE
    actual_errata_count INTEGER;
    actual_card_errata_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO actual_errata_count FROM errata;
    IF actual_errata_count <> 23 THEN
        RAISE EXCEPTION 'Expected 23 errata entries, found %', actual_errata_count;
    END IF;

    SELECT COUNT(*) INTO actual_card_errata_count FROM card_errata;
    IF actual_card_errata_count <> 32 THEN
        RAISE EXCEPTION 'Expected 32 card errata associations, found %', actual_card_errata_count;
    END IF;

    IF EXISTS (
        WITH expected_counts (source_section, expected_count) AS (
            VALUES
                (1, 5), (2, 1), (3, 1), (4, 1), (5, 1), (6, 2),
                (7, 1), (8, 1), (9, 3), (10, 1), (11, 1), (12, 1),
                (13, 1), (14, 1), (15, 1), (16, 1), (17, 1), (18, 2),
                (19, 1), (20, 1), (21, 1), (22, 1), (23, 2)
        ),
        actual_counts AS (
            SELECT e.source_section, COUNT(ce.id)::INTEGER AS actual_count
            FROM errata e
            LEFT JOIN card_errata ce ON ce.errata_id = e.id
            GROUP BY e.source_section
        )
        SELECT 1
        FROM expected_counts x
        JOIN actual_counts a USING (source_section)
        WHERE a.actual_count <> x.expected_count
    ) THEN
        RAISE EXCEPTION 'Unexpected card association count for one or more errata sections';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM card_errata ce
        WHERE (ce.card_type = 'special' AND NOT EXISTS (
                  SELECT 1 FROM special_cards sc WHERE sc.id = ce.card_id
              ))
           OR (ce.card_type = 'character' AND NOT EXISTS (
                  SELECT 1 FROM characters c WHERE c.id = ce.card_id
              ))
           OR (ce.card_type = 'location' AND NOT EXISTS (
                  SELECT 1 FROM locations l WHERE l.id = ce.card_id
              ))
           OR (ce.card_type = 'event' AND NOT EXISTS (
                  SELECT 1 FROM events ev WHERE ev.id = ce.card_id
              ))
           OR ce.card_type NOT IN ('special', 'character', 'location', 'event')
    ) THEN
        RAISE EXCEPTION 'One or more errata associations do not resolve to the declared card type';
    END IF;
END $$;

COMMENT ON TABLE errata IS 'Official card clarifications, rulings, and errata with display text and canonical source links';
COMMENT ON COLUMN errata.entry_text IS 'Plain-text transcription of the official source entry with paragraph breaks preserved';
COMMENT ON COLUMN card_errata.card_id IS 'UUID reference to a catalog card table selected by card_type';
