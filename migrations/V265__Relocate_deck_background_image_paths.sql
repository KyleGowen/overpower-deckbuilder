-- Deck background assets moved from cards/images/backgrounds to images/backgrounds/landscape.
UPDATE decks
SET background_image_path = REPLACE(
  background_image_path,
  'src/resources/cards/images/backgrounds/',
  'src/resources/images/backgrounds/landscape/'
)
WHERE background_image_path LIKE 'src/resources/cards/images/backgrounds/%';
