-- Dracula alternate art (dracula2) is promo / variant art — not main-line ERB checklist numbering.
-- Align with ERBP (ERB Promos) like Leonidas Comic Con (V249): NULL rarity and set numbers for Select Art / Collection.

INSERT INTO sets (code, name) VALUES
    ('ERBP', 'Edgar Rice Burroughs and the World Legends - Promos')
ON CONFLICT (code) DO NOTHING;

UPDATE characters
SET
  set = 'ERBP',
  rarity = NULL,
  set_number = NULL,
  set_number_foil = NULL,
  updated_at = NOW()
WHERE name = 'Dracula'
  AND (
    image_path = 'characters/alternate/dracula2.png'
    OR image_path ILIKE '%/dracula2.png'
  );
