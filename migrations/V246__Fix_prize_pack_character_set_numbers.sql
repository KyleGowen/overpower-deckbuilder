-- Prize-pack alternate character arts use checklist #536–544 (Alternative Art Hero Cards),
-- not the base character #. Wrong set_number caused duplicate Select Art labels (e.g. two "209").

-- Sherlock Holmes — prize pack art (violin / lab art was sharing base 209 with default portrait)
UPDATE characters
SET set_number = '539',
    rarity = 'Rare'
WHERE image_path = 'characters/alternate/Sherlock-PrizePack_Alt.png'
  AND is_foil = false;

-- Captain Nemo — prize pack alt was still on booster character #028
UPDATE characters
SET set_number = '543',
    rarity = 'Rare'
WHERE image_path = 'characters/alternate/CaptainNemo-PrizePack_Alt.png';

-- The Three Musketeers — prize pack alt was sharing #244 with main-set art
UPDATE characters
SET set_number = '538',
    set_number_foil = '538F',
    rarity = 'Rare'
WHERE image_path = 'characters/alternate/ThreeMusketeers-PrizePack_Alt.png'
  AND is_foil = false;

UPDATE characters
SET set_number = '538F',
    rarity = 'Rare'
WHERE image_path = 'characters/alternate/ThreeMusketeers-PrizePack_Alt.png'
  AND is_foil = true;
