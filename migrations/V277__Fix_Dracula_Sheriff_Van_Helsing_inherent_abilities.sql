-- Correct inherent ability text (characters.special_abilities) per card wording.
-- UPDATE by name affects all prints (alternates, foils, prize variants).

UPDATE characters
SET special_abilities = 'After Discard Phase, Dracula may offer 1 of Opponent''s Characters to gain +2 to all actions this battle. If accepted, Dracula may remove 2 hits.',
    updated_at = NOW()
WHERE name = 'Dracula';

UPDATE characters
SET special_abilities = 'May make 1 or both follow up attacks to Teamwork Universe cards he plays.',
    updated_at = NOW()
WHERE name = 'Sheriff of Nottingham';

UPDATE characters
SET special_abilities = 'Van Helsing is +1 to attacks made against Dracula.',
    updated_at = NOW()
WHERE name = 'Van Helsing';
