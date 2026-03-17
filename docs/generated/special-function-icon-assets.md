# Special Function Icon Assets

This file documents the generated standalone PNG assets for special-card function icons.

## Source References

- Rules reference: `src/resources/rules/Overpower_Rule-Book_Comprehensive_March_2025.pdf`
- Semantics reference: `docs/special-card-icons.md`
- Visual card references: `src/resources/cards/images/specials/*.webp`

## Output Specification

- Directory: `src/resources/images/icons/specials/`
- Format: PNG
- Size: 512x512
- Background: transparent alpha
- Icon style: monochrome white glyph, centered

## Filename Mapping

- `icon_offensive_swords.png` -> crossed swords (offensive action)
- `icon_defensive_shield.png` -> shield (defensive action)
- `icon_remainder_of_battle.png` -> half hourglass (remainder of battle)
- `icon_remainder_of_game.png` -> full hourglass (remainder of game)
- `icon_attached_paperclip.png` -> paperclip (attached to character)
- `icon_astral_plane.png` -> astral plane symbol (`A`)
- `icon_first_action_only.png` -> `1ST` (first action only)

## Validation Notes

- All seven files are present at the target path.
- All seven files report `pixelWidth: 512`, `pixelHeight: 512`, and `hasAlpha: yes`.
