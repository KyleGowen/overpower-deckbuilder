-- Fix Tarzan alternate character image: file is .png but DB had .webp
UPDATE characters SET image_path = 'characters/alternate/tarzan3.png', updated_at = NOW()
WHERE image_path = 'characters/alternate/tarzan3.webp';
