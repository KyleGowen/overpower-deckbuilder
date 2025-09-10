import { User, Deck, Character, Location, SpecialCard, Mission, Event, Aspect, AdvancedUniverse, Teamwork, AllyUniverse, TrainingCard, BasicUniverse, PowerCard, ApiResponse } from '../types';
import * as fs from 'fs';
import * as path from 'path';

class InMemoryDatabase {
  private users: Map<string, User> = new Map();
  private decks: Map<string, Deck> = new Map();
  private characters: Map<string, Character> = new Map();
  private locations: Map<string, Location> = new Map();
  private specialCards: Map<string, SpecialCard> = new Map();
  private missions: Map<string, Mission> = new Map();
  private events: Map<string, Event> = new Map();
  private aspects: Map<string, Aspect> = new Map();
  private advancedUniverse: Map<string, AdvancedUniverse> = new Map();
  private teamwork: Map<string, Teamwork> = new Map();
  private allyUniverse: Map<string, AllyUniverse> = new Map();
  private trainings: Map<string, TrainingCard> = new Map();
  private basicUniverse: Map<string, BasicUniverse> = new Map();
  private powerCards: Map<string, PowerCard> = new Map();
  
  private nextUserId = 1;
  private nextDeckId = 1;
  private nextCharacterId = 1;
  private nextLocationId = 1;
  private nextSpecialCardId = 1;
  private nextMissionId = 1;
  private nextEventId = 1;
  private nextAspectId = 1;
  private nextAdvancedUniverseId = 1;
  private nextTeamworkId = 1;
  private nextAllyUniverseId = 1;
  private nextTrainingId = 1;
  private nextBasicUniverseId = 1;
  private nextPowerCardId = 1;

  async initialize(): Promise<void> {
    console.log('🗄️ Initializing clean database schema...');
    
    // Load characters from the markdown file
    await this.loadCharacters();
    
    // Load locations from the markdown file
    await this.loadLocations();
    
    // Load special cards from the markdown file
    await this.loadSpecialCards();
    
    // Load missions from the markdown file
    await this.loadMissions();
    
    // Load events from the markdown file
    await this.loadEvents();
    
    // Load aspects from the markdown file
    await this.loadAspects();
    
    // Load advanced universe from the markdown file
    await this.loadAdvancedUniverse();
    
    // Load teamwork from the markdown file
    await this.loadTeamwork();

    // Load Ally Universe from the markdown file
    await this.loadAllyUniverse();

    // Load Training from the markdown file
    await this.loadTraining();

    // Load Basic Universe from the markdown file
    await this.loadBasicUniverse();

    // Load Power Cards from the markdown file
    await this.loadPowerCards();
    
    console.log('✅ Database initialization complete');
    console.log(`📊 Database loaded: ${this.characters.size} characters, ${this.locations.size} locations, ${this.specialCards.size} special cards, ${this.missions.size} missions, ${this.events.size} events, ${this.aspects.size} aspects, ${this.advancedUniverse.size} advanced universe, ${this.teamwork.size} teamwork, ${this.allyUniverse.size} ally universe, ${this.trainings.size} trainings, ${this.basicUniverse.size} basic universe, ${this.powerCards.size} power cards`);
  }

  private async loadCharacters(): Promise<void> {
    try {
      console.log('📖 Loading characters from file...');
      const filePath = path.join(process.cwd(), 'src/resources/cards/descriptions/overpower-erb-characters.md');
      
      if (!fs.existsSync(filePath)) {
        console.log('❌ Character file not found, skipping character loading');
        return;
      }

      console.log('📖 Reading character data from file...');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim().length > 0);

      let loadedCount = 0;
      const totalLines = lines.length;

      for (const line of lines) {
        // Skip header and separator lines
        if (line.startsWith('|') && !line.includes('----') && !line.includes('Name')) {
          const columns = line.split('|').map(col => col.trim());
          
          if (columns.length >= 9) { // Split by | creates 9 elements for 8 columns
            const characterName = columns[1];
            const alternateImages = this.getCharacterAlternateImages(characterName);
            
            const character: Character = {
              id: `char_${this.nextCharacterId++}`,
              name: characterName,
              energy: parseInt(columns[2]) || 0,
              combat: parseInt(columns[3]) || 0,
              brute_force: parseInt(columns[4]) || 0,
              intelligence: parseInt(columns[5]) || 0,
              threat_level: parseInt(columns[6]) || 0,
              special_abilities: columns[7] || '',
              image: columns[8],
              ...(alternateImages.length > 0 && { alternateImages })
            };

            this.characters.set(character.id, character);
            loadedCount++;

            if (loadedCount % 10 === 0) {
              console.log(`   Loaded ${loadedCount}/${totalLines} characters...`);
            }
          }
        }
      }

      console.log(`🎉 Successfully loaded ${loadedCount} characters into database!`);
      console.log('✅ Characters loaded successfully');
    } catch (error) {
      console.error('❌ Error loading characters:', error);
    }
  }

  private async loadLocations(): Promise<void> {
    try {
      console.log('📖 Loading locations from file...');
      const filePath = path.join(process.cwd(), 'src/resources/cards/descriptions/overpower-erb-locations.md');
      
      if (!fs.existsSync(filePath)) {
        console.log('❌ Locations file not found, skipping location loading');
        return;
      }

      console.log('📖 Reading location data from file...');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim().length > 0);

      let loadedCount = 0;
      const totalLines = lines.length;

      for (const line of lines) {
        // Skip header and separator lines
        if (line.startsWith('|') && !line.includes('----') && !line.includes('Name')) {
          const columns = line.split('|').map(col => col.trim());
          
          if (columns.length >= 4) { // Split by | creates 4+ elements for 3 columns
            const location: Location = {
              id: `loc_${this.nextLocationId++}`,
              name: columns[1],
              threat_level: parseInt(columns[2]) || 0,
              special_ability: columns[3] || '',
              image: this.getLocationImage(columns[1])
            };

            this.locations.set(location.id, location);
            loadedCount++;
          }
        }
      }

      console.log(`🎉 Successfully loaded ${loadedCount} locations into database!`);
      console.log('✅ Locations loaded successfully');
    } catch (error) {
      console.error('❌ Error loading locations:', error);
    }
  }

  private getLocationImage(locationName: string): string {
    // Map location names to their image files
    const locationImageMap: { [key: string]: string } = {
      "Dracula's Armory": 'locations/465_draculas_armory.webp',
      "Spartan Training Ground": 'locations/466_spartan_training_ground.webp',
      "The Round Table": 'locations/467_the_round_table.webp',
      "Barsoom": 'locations/468_barsoom.webp',
      "Asclepieion": 'locations/469_ascleipeion.webp',
      "221-B Baker St.": 'locations/470_221b_baker_st.webp',
      "Event Horizon: The Future": 'locations/471_horizon.webp',
      "The Land That Time Forgot": 'locations/472_the_land_that_time_forgot.webp'
    };
    
    return locationImageMap[locationName] || 'unknown_location.webp';
  }

  private async loadSpecialCards(): Promise<void> {
    try {
      console.log('📖 Loading special cards from file...');
      const filePath = path.join(process.cwd(), 'src/resources/cards/descriptions/overpower-erb-specials.md');
      
      if (!fs.existsSync(filePath)) {
        console.log('❌ Special cards file not found, skipping special card loading');
        return;
      }

      console.log('📖 Reading special card data from file...');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim().length > 0);

      let loadedCount = 0;
      const totalLines = lines.length;

      for (const line of lines) {
        // Skip header and separator lines
        if (line.startsWith('|') && !line.includes('----') && !line.includes('Card Name')) {
          const columns = line.split('|').map(col => col.trim());
          
                      if (columns.length >= 5) { // Split by | creates 5+ elements for 4 columns
              const specialCard: SpecialCard = {
                id: `special_${this.nextSpecialCardId++}`,
                name: columns[1],
                card_type: columns[2],
                character: columns[3],
                card_effect: columns[4],
                image: this.getSpecialCardImage(columns[1]),
                is_cataclysm: columns[4].includes('**Cataclysm!**')
              };

            this.specialCards.set(specialCard.id, specialCard);
            loadedCount++;

            if (loadedCount % 10 === 0) {
              console.log(`   Loaded ${loadedCount}/${totalLines} special cards...`);
            }
          }
        }
      }

      console.log(`🎉 Successfully loaded ${loadedCount} special cards into database!`);
      console.log('✅ Special cards loaded successfully');
    } catch (error) {
      console.error('❌ Error loading special cards:', error);
    }
  }

  private getCharacterAlternateImages(characterName: string): string[] {
    const alternateImages: string[] = [];
    const alternateDir = path.join(process.cwd(), 'src/resources/cards/images/characters/alternate');
    
    if (!fs.existsSync(alternateDir)) {
      return alternateImages;
    }
    
    try {
      const files = fs.readdirSync(alternateDir);
      const characterNameLower = characterName.toLowerCase();
      
      for (const file of files) {
        if (file.endsWith('.webp')) {
          const fileName = file.toLowerCase().replace('.webp', '');
          // Check if the filename matches the character name (case insensitive)
          if (fileName === characterNameLower) {
            alternateImages.push(file);
          }
        }
      }
    } catch (error) {
      console.error('Error reading alternate images directory:', error);
    }
    
    return alternateImages;
  }

  public getCharacterEffectiveImage(characterId: string, selectedAlternateImage?: string): string {
    const character = this.characters.get(characterId);
    if (!character) {
      return '';
    }
    
    // If a specific alternate image is selected, use it
    if (selectedAlternateImage && character.alternateImages?.includes(selectedAlternateImage)) {
      return `characters/alternate/${selectedAlternateImage}`;
    }
    
    // Otherwise, use the default image
    return character.image;
  }

  private getSpecialCardImage(cardName: string): string {
    // Convert card name to snake_case for intelligent matching
    const snakeCaseName = this.convertToSnakeCase(cardName);
    
    // First try to find an exact match with the snake_case name
    const availableImages = this.getAvailableSpecialCardImages();
    
    // Handle specific known mismatches based on actual existing images
    const knownMismatches: { [key: string]: string } = {
      // Cthulhu special cards - map to actual existing images
      'ancient_one': 'specials/381_giant_man_of_mars.webp',
      'devoted_follower': 'specials/382_the_battle_with_zod.webp', 
      'distracting_intervention': 'specials/383_eyes_in_the_dark.webp',
      'network_of_fanatics': 'events/470_221b_baker_st.webp',
      'the_call_of_cthulhu': 'events/471_horizon.webp',
      'the_sleeper_awakens': 'events/472_the_land_that_time_forgot.webp',
      
      // Any Character special cards - these should work with existing logic
      'heimdall': 'specials/439_heimdall.webp',
      'lady_of_the_lake': 'specials/440_lady_of_the_lake.webp',
      'robin_hood_master_thief': 'specials/441_robin_hood_master_thief.webp',
      'tunupa': 'specials/442_tunupa.webp',
      'fairy_protection': 'specials/443_fairy_protection.webp',
      'loki': 'specials/444_loki.webp',
      'wrath_of_ra': 'specials/445_wrath_of_ra.webp',
      'valkyrie_skeggold': 'specials/446_valkyrie_skeggold.webp',
      'oni_and_succubus': 'specials/447_oni_and_succubus.webp',
      'bodhisattava_enlightened_one': 'specials/448_bodhisattava_enlightened_one.webp',
      'mystical_energy': 'specials/449_mystical_energy.webp',
      'charge_into_battle': 'specials/450_charge_into_battle.webp',
      'subjugate_the_meek': 'specials/451_subjugate_the_meek.webp',
      'draconic_leadership': 'specials/452_draconic_leadership.webp',
      'liliths_swarm': 'specials/453_liliths_swarm.webp',
      'disorient_opponent': 'specials/454_disorient_opponent.webp',
      'freya': 'specials/455_freya.webp',
      'grim_reaper': 'specials/456_grim_reaper.webp',
      'gunnr': 'specials/457_gunnr.webp',
      'hades': 'specials/458_hades.webp',
      'legendary_escape': 'specials/459_legendary_escape.webp',
      'merlins_magic': 'specials/460_merlins_magic.webp',
      'preternatural_healing': 'specials/461_preternatural_healing.webp',
      'princess_and_the_pea': 'specials/462_princess_and_the_pea.webp',
      'the_gemni': 'specials/463_the_gemni.webp',
      'valkyrie_hilder': 'specials/464_valkyrie_hilder.webp'
    };
    
    if (knownMismatches[snakeCaseName]) {
      return knownMismatches[snakeCaseName];
    }
    
    // Look for exact matches first
    for (const imageFile of availableImages) {
      if (imageFile.includes(snakeCaseName)) {
        return imageFile;
      }
    }
    
    // Try matching without the ID prefix
    const nameWithoutId = snakeCaseName.replace(/^\d+_/, '');
    for (const imageFile of availableImages) {
      const imageNameWithoutId = imageFile.replace(/^\d+_/, '').replace('.webp', '');
      if (imageNameWithoutId === nameWithoutId) {
        return imageFile;
      }
    }
    
    // Try singular/plural variations and word transformations
    const transformedNames = this.generateNameVariations(snakeCaseName);
    for (const transformedName of transformedNames) {
      for (const imageFile of availableImages) {
        const imageName = imageFile.replace(/^\d+_/, '').replace('.webp', '');
        if (imageName.includes(transformedName) || transformedName.includes(imageName)) {
          return imageFile;
        }
      }
    }
    
    // Try partial word matching with better logic
    const words = snakeCaseName.split('_').filter(word => word.length > 2); // Filter out very short words
    for (const imageFile of availableImages) {
      const imageWords = imageFile.replace(/^\d+_/, '').replace('.webp', '').split('_');
      
      // Check if most words match (at least 70% of words)
      const matchingWords = words.filter(word => 
        imageWords.some(imgWord => 
          imgWord.includes(word) || 
          word.includes(imgWord) || 
          this.levenshteinDistance(word, imgWord) <= 2
        )
      );
      
      if (matchingWords.length >= words.length * 0.7) {
        return imageFile;
      }
    }
    
    // Try fuzzy matching for similar names
    for (const imageFile of availableImages) {
      const imageName = imageFile.replace(/^\d+_/, '').replace('.webp', '');
      if (this.levenshteinDistance(snakeCaseName, imageName) <= 3) {
        return imageFile;
      }
    }
    
    // Fallback to unknown image
    return 'unknown_special_card.webp';
  }

  private generateNameVariations(name: string): string[] {
    const variations = [name];
    const words = name.split('_');
    
    // Generate singular/plural variations
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let variation = [...words];
      
      // Common plural to singular transformations
      if (word.endsWith('s') && word.length > 3) {
        variation[i] = word.slice(0, -1); // Remove 's'
        variations.push(variation.join('_'));
      }
      
      // Common singular to plural transformations
      if (!word.endsWith('s') && word.length > 2) {
        variation[i] = word + 's'; // Add 's'
        variations.push(variation.join('_'));
      }
      
      // Handle specific word variations
      if (word === 'champion') {
        variation[i] = 'champions';
        variations.push(variation.join('_'));
      }
      if (word === 'champions') {
        variation[i] = 'champion';
        variations.push(variation.join('_'));
      }
      if (word === 'hero') {
        variation[i] = 'heroes';
        variations.push(variation.join('_'));
      }
      if (word === 'heroes') {
        variation[i] = 'hero';
        variations.push(variation.join('_'));
      }
      if (word === 'knights') {
        variation[i] = 'knight';
        variations.push(variation.join('_'));
      }
      if (word === 'knight') {
        variation[i] = 'knights';
        variations.push(variation.join('_'));
      }
    }
    
    return variations;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  private convertToSnakeCase(cardName: string): string {
    return cardName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .trim();
  }

  private getAvailableSpecialCardImages(): string[] {
    // Return a list of available special card image files
    // This would ideally be loaded from the filesystem, but for now we'll hardcode the known ones
    return [
      // Any Character special cards (439-464)
      "specials/439_heimdall.webp", "specials/440_lady_of_the_lake.webp", "specials/441_robin_hood_master_thief.webp",
      "specials/442_tunupa.webp", "specials/443_fairy_protection.webp", "specials/444_loki.webp", "specials/445_wrath_of_ra.webp",
      "specials/446_valkyrie_skeggold.webp", "specials/447_oni_and_succubus.webp", "specials/448_bodhisattava_enlightened_one.webp",
      "specials/449_mystical_energy.webp", "specials/450_charge_into_battle.webp", "specials/451_subjugate_the_meek.webp",
      "specials/452_draconic_leadership.webp", "specials/453_liliths_swarm.webp", "specials/454_disorient_opponent.webp",
      "specials/455_freya.webp", "specials/456_grim_reaper.webp", "specials/457_gunnr.webp", "specials/458_hades.webp",
      "specials/459_legendary_escape.webp", "specials/460_merlins_magic.webp", "specials/461_preternatural_healing.webp",
      "specials/462_princess_and_the_pea.webp", "specials/463_the_gemni.webp", "specials/464_valkyrie_hilder.webp",
      
      // Character-specific special cards (001-291)
      "specials/001_angry_mob_middle_ages.webp", "specials/002_dont_let_it_get_away.webp", "specials/003_mob_mentality.webp",
      "specials/004_strength_in_numbers.webp", "specials/005_swarm_them.webp", "specials/006_pitchforks_and_torches.webp",
      "specials/007_regent_of_the_crown.webp", "specials/008_angry_mob_industrial_age.webp", "specials/009_disrupt_supply_lines.webp",
      "specials/010_union_power.webp", "specials/011_angry_mob_modern_age.webp", "specials/012_online_cyber_attack.webp",
      "specials/013_ransom_your_secrets.webp", "specials/014_anubis.webp", "specials/015_book_of_the_dead.webp",
      "specials/016_lord_of_the_sacred_land.webp", "specials/017_shepherd_of_the_damned.webp", "specials/018_syphon_strike.webp",
      "specials/019__weighing_ofthe_heart.webp", "specials/020_wither.webp", "specials/021_billy_the_kid.webp",
      "specials/022_head_for_mexico.webp", "specials/023_ill_make_you_famous.webp", "specials/024_pals.webp",
      "specials/025_quick_draw.webp", "specials/026_reap_the_whirlwind.webp", "specials/027_regulators.webp",
      "specials/028_captain_nemo.webp", "specials/029_ethnologist.webp", "specials/030_never_set_foot_on_dry_land.webp",
      "specials/031_silent_running.webp", "specials/032_ruthless_plunderer.webp", "specials/033_the_nautilus.webp",
      "specials/034_weapons_of_wrath_and_hatred.webp", "specials/035_janjong_duare_mintep.webp", "specials/036_on_the_razors_edge.webp",
      "specials/037_telepathic_resistance.webp", "specials/038_sometimes_piracy_is_the_best_option.webp", "specials/039_t_ray_gun.webp",
      "specials/040_telepathic_training.webp", "specials/041_friend_to_foe.webp", "specials/042_jacopo.webp",
      "specials/043_ancient_one.webp", "specials/044_devoted_follower.webp", "specials/045_distracting_intervention.webp",
      "specials/046_network_of_fanatics.webp", "specials/047_the_call_of_cthulhu.webp", "specials/048_the_sleeper_awakens.webp",
      "specials/049_warrior_of_helium.webp", "specials/050_diplomat_to_all_martians.webp", "specials/051_fortune_of_helium.webp",
      "specials/052_head_of_martian_science.webp", "specials/053_protector_of_barsoom.webp", "specials/054_champions_of_barsoom.webp",
      "specials/055_all_chips_on_the_table.webp", "specials/056_blackheath_rugby_star.webp", "specials/057_british_army_surgeon.webp",
      "specials/058_english_gentleman.webp", "specials/059_not_a_bad_detective.webp", "specials/060_always_there_for_a_friend.webp",
      "specials/061_crimson_restoration.webp", "specials/062_veil_of_deceit.webp", "specials/063_lord_of_the_vampires.webp",
      "specials/064_paralyzing_gaze.webp", "specials/065_to_the_last_man.webp", "specials/066_undead_flesh.webp",
      "specials/067_decapitate.webp", "specials/068_human_spine_whip.webp", "specials/069_mark_of_the_headless.webp",
      "specials/070_pumpkin_head.webp", "specials/071_relentless_hessian.webp", "specials/072_visage_of_terror.webp",
      "specials/073_sowing_chaos.webp", "specials/074_great_club.webp", "specials/075_lion_skin_cloak.webp",
      "specials/076_godly_prowess.webp", "specials/077_protector_of_mankind.webp", "specials/078_slaying_the_hydra.webp",
      "specials/079_didnt_see_it_coming.webp", "specials/080_hidden_sociopath.webp", "specials/081_im_in_your_house.webp",
      "specials/082_ive_murdered_before.webp", "specials/083_one_at_a_time.webp", "specials/084_run_and_hide.webp",
      "specials/085_archimedes_q_porter.webp", "specials/086_ethnoarchaeology.webp", "specials/087_tenacious_pursuit.webp",
      "specials/088_lady_of_the_jungle.webp", "specials/089_not_without_my_friends.webp", "specials/090_not_a_damsel_in_distress.webp",
      "specials/091_angelic_visions.webp", "specials/092_burned_at_the_stake.webp", "specials/093_early_feminist_leader.webp",
      "specials/094_inspirational_leadership.webp", "specials/095_patron_saint_of_france.webp", "specials/096_protection_of_saint_michael.webp",
      "specials/097_dotar_sojat.webp", "specials/098_immortality.webp", "specials/099_leap_into_the_fray.webp",
      "specials/100_lower_gravity.webp", "specials/101_superhuman_endurance.webp", "specials/102_virginia_fighting_man.webp",
      "specials/103_excalibur.webp", "specials/104_king_of_camelot.webp", "specials/105_knights_of_the_round_table.webp",
      "specials/106_legendary_partnership.webp", "specials/107_heavy_is_the_head.webp", "specials/108_lead_from_the_front.webp",
      "specials/109_john_clayton_iii.webp", "specials/110_jungle_survival.webp", "specials/111_like_father_like_son.webp",
      "specials/112_meriem_and_jackie_clayton.webp", "specials/113_son_of_the_jungle.webp", "specials/114_to_the_death.webp",
      "specials/115_chivalrous_protector.webp", "specials/116_for_guineveres_love.webp", "specials/117_for_the_queen.webp",
      "specials/118_knight_of_the_round_table.webp", "specials/119_sword_and_shield.webp", "specials/120_true_strike.webp",
      "specials/121_300.webp", "specials/122_baptized_in_combat.webp", "specials/123_for_sparta.webp",
      "specials/124_give_them_nothing.webp", "specials/125_greatest_soldiers_in_history.webp", "specials/126_shield_phalanx.webp",
      "specials/127_archimedes.webp", "specials/128_ascendant_mage.webp", "specials/129_for_camelot.webp",
      "specials/130_foretell_the_future.webp", "specials/131_transmogrification.webp", "specials/132_summon_the_elements.webp",
      "specials/133_draculas_telepathic_connection.webp", "specials/134_jonathan_harker_solicitor.webp", "specials/135_nocturnal_hunter.webp",
      "specials/136_the_hunger.webp", "specials/137_tracking_movements.webp", "specials/138_vampiric_celerity.webp",
      "specials/139_apprentice_of_merlin.webp", "specials/140_avalons_warmth.webp", "specials/141_duality.webp",
      "specials/142_enchantress_guile.webp", "specials/143_shapeshifters_guise.webp", "specials/144_teleportation_circle.webp",
      "specials/145_overdose.webp", "specials/146_sadistic_tendencies.webp", "specials/147_set_loose.webp",
      "specials/148_the_serum.webp", "specials/149_trample.webp", "specials/150_victorian_sophisticant.webp",
      "specials/151_reclaim_the_waters.webp", "specials/152_form_of_water.webp", "specials/153_poseidons_might.webp",
      "specials/154_rising_tides.webp", "specials/155_trident.webp", "specials/156_tsunami.webp",
      "specials/157_complex_criminal_scheme.webp", "specials/158_criminal_mastermind.webp", "specials/159_future_plans.webp",
      "specials/160_mathematical_genius.webp", "specials/161_napoleon_of_crime.webp", "specials/162_tactical_fighter.webp",
      "specials/163_cult_of_menevis_bull.webp", "specials/164_eye_of_sekmet.webp", "specials/165_healing_waters_of_the_nile.webp",
      "specials/166_band_of_merry_men.webp", "specials/167_defender_of_the_people.webp", "specials/168_hero_of_nottingham.webp",
      "specials/169_master_archer.webp", "specials/170_master_thief.webp", "specials/171_steal_from_the_rich.webp",
      "specials/172_flaming_arrows.webp", "specials/173_i_command_an_army.webp", "specials/174_read_the_bones.webp",
      "specials/175_rule_by_fear.webp", "specials/176_squeeze_the_commoners.webp", "specials/177_taxes.webp",
      "specials/178_battle_of_wits.webp", "specials/179_brilliant_deduction.webp", "specials/180_irene_adler.webp",
      "specials/181_logical_reasoning.webp", "specials/182_probability_evaluation.webp", "specials/183_unpredictable_mind.webp",
      "specials/184_cloud_surfing.webp", "specials/185_godly_strength.webp", "specials/186_grasp_of_the_five_elements.webp",
      "specials/187_staff_of_the_monkey_king.webp", "specials/188_stone_skin.webp", "specials/189_transformation_trickery.webp",
      "specials/190_avenging_my_love.webp", "specials/191_barsoomian_warrior_statesman.webp", "specials/192_four_armed_warrior.webp",
      "specials/193_jeddak_of_thark.webp", "specials/194_protector_of_the_incubator.webp", "specials/195_sola.webp",
      "specials/196_emotional_senses.webp", "specials/197_jungle_tactics.webp", "specials/198_lord_of_the_jungle.webp",
      "specials/199_my_feet_are_like_hands.webp", "specials/200_raised_by_mangani_apes.webp", "specials/201_deceptive_maneuver.webp",
      "specials/202_ancient_wisdom.webp", "specials/203_fury_of_the_desert.webp", "specials/204_pharaoh_of_the_fourth_dynasty.webp",
      "specials/205_reinvigorated_by_fresh_organs.webp", "specials/206_relentless_pursuit.webp", "specials/207_the_eternal_journey.webp",
      "specials/208_all_for_one.webp", "specials/209_aramis.webp", "specials/210_athos.webp",
      "specials/211_dartagnan.webp", "specials/212_porthos.webp", "specials/213_valiant_charge.webp",
      "specials/214_from_a_mile_away.webp", "specials/215_futuristic_phaser.webp", "specials/216_ill_already_be_gone.webp",
      "specials/217_knowledge_of_tomorrow.webp", "specials/218_harbingers_warning.webp", "specials/219_the_tomorrow_doctor.webp",
      "specials/220_doctor_professor_lawyer_scientist.webp", "specials/221_monster_hunting_expert.webp", "specials/222_crossbow_expert.webp",
      "specials/223_right_tools_for_the_job.webp", "specials/224_sacred_wafers_from_amsterdam.webp", "specials/225_world_renowned_doctor.webp",
      "specials/226_abner_perrys_lab_assistant.webp", "specials/227_archery_knives_jiu_jitsu.webp", "specials/228_chamston_hedding_estate.webp",
      "specials/229_department_of_theoretical_physics.webp", "specials/230_fires_of_halos.webp", "specials/231_practical_physics.webp",
      "specials/232_232.webp", "specials/233_233.webp", "specials/234_234.webp", "specials/235_235.webp", "specials/236_236.webp", "specials/237_237.webp",
      "specials/238_238.webp", "specials/239_239.webp", "specials/240_240.webp", "specials/241_241.webp", "specials/242_242.webp", "specials/243_243.webp",
      "specials/244_244.webp", "specials/245_245.webp", "specials/246_246.webp", "specials/247_247.webp", "specials/248_248.webp", "specials/249_249.webp",
      "specials/250_250.webp", "specials/251_251.webp", "specials/252_252.webp", "specials/253_253.webp", "specials/254_254.webp", "specials/255_255.webp",
      "specials/256_256.webp", "specials/257_257.webp", "specials/258_258.webp", "specials/259_259.webp", "specials/260_260.webp", "specials/261_261.webp",
      "specials/262_262.webp", "specials/263_263.webp", "specials/264_264.webp", "specials/265_265.webp", "specials/266_266.webp", "specials/267_267.webp",
      "specials/268_268.webp", "specials/269_269.webp", "specials/270_270.webp", "specials/271_271.webp", "specials/272_272.webp",
      "specials/273_aquaphobic.webp", "specials/274_feard_by_all_witches.webp", "specials/275_i_will_have_those_silver_shoes.webp",
      "specials/276_one_eye.webp", "specials/277_harness_the_wind.webp", "specials/278_wolves_crows_black_birds_en_237.webp",
      "specials/279_279.webp", "specials/280_a_jealous_god.webp", "specials/281_banishment.webp", "specials/282_hera.webp",
      "specials/283_law_and_order.webp", "specials/284_thunderbolt.webp", "specials/285_285.webp", "specials/286_3_quick_strokes.webp",
      "specials/287_elite_swordsmanship.webp", "specials/288_master_of_escape.webp", "specials/289_ancestial_rapier.webp",
      "specials/290_riches_of_don_diego_de_la_vega.webp", "specials/291_reposte.webp", "specials/292_292.webp", "specials/293_293.webp",
      "specials/294_294.webp", "specials/295_295.webp", "specials/296_296.webp", "specials/297_297.webp", "specials/298_298.webp", "specials/299_299.webp",
      "specials/300_300.webp", "specials/301_301.webp", "specials/302_302.webp", "specials/303_303.webp", "specials/304_304.webp", "specials/305_305.webp",
      "specials/306_306.webp", "specials/307_307.webp", "specials/308_308.webp", "specials/309_309.webp", "specials/310_310.webp", "specials/311_311.webp",
      "specials/312_312.webp", "specials/313_313.webp", "specials/314_314.webp", "specials/315_315.webp", "specials/316_316.webp", "specials/317_317.webp",
      "specials/318_318.webp", "specials/319_319.webp", "specials/320_320.webp", "specials/321_321.webp", "specials/322_322.webp", "specials/323_323.webp",
      "specials/324_324.webp", "specials/325_325.webp", "specials/326_326.webp", "specials/327_327.webp", "specials/328_328.webp", "specials/329_329.webp",
      "specials/330_330.webp", "specials/331_331.webp", "specials/332_332.webp", "specials/333_333.webp", "specials/334_334.webp", "specials/335_335.webp",
      "specials/336_336.webp", "specials/337_337.webp", "specials/338_338.webp", "specials/339_339.webp", "specials/340_340.webp", "specials/341_341.webp",
      "specials/342_342.webp", "specials/343_343.webp", "specials/344_344.webp", "specials/345_345.webp", "specials/346_346.webp", "specials/347_347.webp",
      "specials/348_348.webp", "specials/349_349.webp", "specials/350_350.webp", "specials/351_351.webp", "specials/352_352.webp", "specials/353_353.webp",
      "specials/354_354.webp", "specials/355_355.webp", "specials/356_356.webp", "specials/357_357.webp", "specials/358_358.webp", "specials/359_359.webp",
      "specials/360_360.webp", "specials/361_361.webp", "specials/362_362.webp", "specials/363_363.webp", "specials/364_364.webp", "specials/365_365.webp",
      "specials/366_366.webp", "specials/367_367.webp", "specials/368_368.webp", "specials/369_369.webp", "specials/370_370.webp", "specials/371_371.webp",
      "specials/372_372.webp", "specials/373_373.webp", "specials/374_374.webp", "specials/375_375.webp", "specials/376_376.webp", "specials/377_377.webp",
      "specials/378_378.webp", "specials/379_379.webp", "specials/380_380.webp", "specials/381_381.webp", "specials/382_382.webp", "specials/383_383.webp",
      "specials/384_384.webp", "specials/385_385.webp", "specials/386_386.webp", "specials/387_387.webp", "specials/388_388.webp", "specials/389_389.webp",
      "specials/390_390.webp", "specials/391_391.webp", "specials/392_392.webp", "specials/393_393.webp", "specials/394_394.webp", "specials/395_395.webp",
      "specials/396_396.webp", "specials/397_397.webp", "specials/398_398.webp", "specials/399_399.webp", "specials/400_400.webp", "specials/401_401.webp",
      "specials/402_402.webp", "specials/403_403.webp", "specials/404_404.webp", "specials/405_405.webp", "specials/406_406.webp", "specials/407_407.webp",
      "specials/408_408.webp", "specials/409_409.webp", "specials/410_410.webp", "specials/411_411.webp", "specials/412_412.webp", "specials/413_413.webp",
      "specials/414_414.webp", "specials/415_415.webp", "specials/416_416.webp", "specials/417_417.webp", "specials/418_418.webp", "specials/419_419.webp",
      "specials/420_420.webp", "specials/421_421.webp", "specials/422_422.webp", "specials/423_423.webp", "specials/424_424.webp", "specials/425_425.webp",
      "specials/426_426.webp", "specials/427_427.webp", "specials/428_428.webp", "specials/429_429.webp", "specials/430_430.webp", "specials/431_431.webp",
      "specials/432_432.webp", "specials/433_433.webp", "specials/434_434.webp", "specials/435_435.webp", "specials/436_436.webp", "specials/437_437.webp",
      "specials/438_438.webp"
    ];
  }

  // User management
  createUser(name: string, email: string): User {
    const id = `user_${this.nextUserId++}`;
    const user: User = { id, name, email };
    this.users.set(id, user);
    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Deck management
  createDeck(userId: string, name: string): Deck {
    const id = `deck_${this.nextDeckId++}`;
    const deck: Deck = { id, user_id: userId, name };
    this.decks.set(id, deck);
    return deck;
  }

  getDeckById(id: string): Deck | undefined {
    return this.decks.get(id);
  }

  getDecksByUserId(userId: string): Deck[] {
    return Array.from(this.decks.values()).filter(deck => deck.user_id === userId);
  }

  getAllDecks(): Deck[] {
    return Array.from(this.decks.values());
  }

  // Character management
  getCharacterById(id: string): Character | undefined {
    return this.characters.get(id);
  }

  getAllCharacters(): Character[] {
    return Array.from(this.characters.values());
  }

  // Location management
  getLocationById(id: string): Location | undefined {
    return this.locations.get(id);
  }

  getAllLocations(): Location[] {
    return Array.from(this.locations.values());
  }

  // Special Card management
  getSpecialCardById(id: string): SpecialCard | undefined {
    return this.specialCards.get(id);
  }

  getAllSpecialCards(): SpecialCard[] {
    return Array.from(this.specialCards.values());
  }

  // Mission management
  getMissionById(id: string): Mission | undefined {
    return this.missions.get(id);
  }

  getAllMissions(): Mission[] {
    return Array.from(this.missions.values());
  }

  private async loadMissions(): Promise<void> {
    try {
      console.log('📖 Loading missions from file...');
      const filePath = path.join(process.cwd(), 'src/resources/cards/descriptions/overpower-erb-missions.md');
      
      if (!fs.existsSync(filePath)) {
        console.log('❌ Missions file not found, skipping mission loading');
        return;
      }

      console.log('📖 Reading mission data from file...');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim().length > 0);

      let loadedCount = 0;
      let currentMissionSet = '';
      let missionIndex = 1;

      for (const line of lines) {
        // Check if this is a mission set header
        if (line.startsWith('## ')) {
          currentMissionSet = line.replace('## ', '').trim();
          missionIndex = 1;
          continue;
        }

        // Skip header and separator lines
        if (line.startsWith('|') && !line.includes('----') && !line.includes('Mission Set')) {
          const columns = line.split('|').map(col => col.trim());
          
          if (columns.length >= 3) { // Split by | creates 3+ elements for 2 columns
            const mission: Mission = {
              id: `mission_${this.nextMissionId++}`,
              mission_set: currentMissionSet,
              card_name: columns[2],
              image: this.getMissionImage(currentMissionSet, columns[2], missionIndex)
            };

            this.missions.set(mission.id, mission);
            loadedCount++;
            missionIndex++;
          }
        }
      }

      console.log(`🎉 Successfully loaded ${loadedCount} missions into database!`);
      console.log('✅ Missions loaded successfully');
    } catch (error) {
      console.error('❌ Error loading missions:', error);
    }
  }

  private getMissionImage(missionSet: string, cardName: string, index: number): string {
    // Convert mission set and card name to snake_case for matching
    const missionSetSnake = this.convertToSnakeCase(missionSet);
    const cardNameSnake = this.convertToSnakeCase(cardName);
    
    // Map mission set names to their image prefixes
    const missionSetMapping: { [key: string]: string } = {
      'The Call of Cthulhu': 'call_of_cthulu',
      'King of the Jungle': 'tarzan_king_of_the_jungle',
      'Warlord of Mars': 'chronicles_of_mars',
      'Time Wars: Rise of the Gods': 'world_legends'
    };
    
    // Get the mapped image prefix for this mission set
    const imagePrefix = missionSetMapping[missionSet];
    if (!imagePrefix) {
      return 'unknown_mission.webp';
    }
    
    // Look for the specific image with the correct index
    const availableImages = this.getAvailableMissionImages();
    
    for (const imageFile of availableImages) {
      const imageName = imageFile.replace('.webp', '');
      
      // Check if this image matches the mission set and index
      if (imageName.includes(imagePrefix) && imageName.includes(`_${index}`)) {
        return imageFile;
      }
    }
    
    // Fallback to unknown image
    return 'unknown_mission.webp';
  }

  private getAvailableMissionImages(): string[] {
    // Return a list of available mission image files
    return [
      // Call of Cthulhu missions (350-356)
      "missions/350_call_of_cthulu_1.webp", "missions/351_call_of_cthulu_2.webp", "missions/352_call_of_cthulu_3.webp",
      "missions/353_call_of_cthulu_4.webp", "missions/354_call_of_cthulu_5.webp", "missions/355_call_of_cthulu_6.webp",
      "missions/356_call_of_cthulu_7.webp",
      // Tarzan King of the Jungle missions (362-368)
      "missions/362_tarzan_king_of_the_jungle_1.webp", "missions/363_tarzan_king_of_the_jungle_2.webp", "missions/364_tarzan_king_of_the_jungle_3.webp",
      "missions/365_tarzan_king_of_the_jungle_4.webp", "missions/366_tarzan_king_of_the_jungle_5.webp", "missions/367_tarzan_king_of_the_jungle_6.webp",
      "missions/368_tarzan_king_of_the_jungle_7.webp",
      // Chronicles of Mars missions (374-380)
      "missions/374_chronicles_of_mars_1.webp", "missions/375_chronicles_of_mars_2.webp", "missions/376_chronicles_of_mars_3.webp",
      "missions/377_chronicles_of_mars_4.webp", "missions/378_chronicles_of_mars_5.webp", "missions/379_chronicles_of_mars_6.webp",
      "missions/380_chronicles_of_mars_7.webp",
      // World Legends missions (386-392)
      "missions/386_world_legends_1.webp", "missions/387_world_legends_2.webp", "missions/388_world_legends_3.webp",
      "missions/389_world_legends_4.webp", "missions/390_world_legends_5.webp", "missions/391_world_legends_6.webp",
      "missions/392_world_legends_7.webp"
    ];
  }

  // Event management
  getEventById(id: string): Event | undefined {
    return this.events.get(id);
  }

  getAllEvents(): Event[] {
    return Array.from(this.events.values());
  }

  // Aspect management
  getAspectById(id: string): Aspect | undefined {
    return this.aspects.get(id);
  }

  getAllAspects(): Aspect[] {
    return Array.from(this.aspects.values());
  }

  // Advanced Universe management
  getAdvancedUniverseById(id: string): AdvancedUniverse | undefined {
    return this.advancedUniverse.get(id);
  }

  getAllAdvancedUniverse(): AdvancedUniverse[] {
    return Array.from(this.advancedUniverse.values());
  }

  // Teamwork management
  getTeamworkById(id: string): Teamwork | undefined {
    return this.teamwork.get(id);
  }

  getAllTeamwork(): Teamwork[] {
    return Array.from(this.teamwork.values());
  }

  // Ally Universe management
  getAllAllyUniverse(): AllyUniverse[] {
    return Array.from(this.allyUniverse.values());
  }

  getAllTraining(): TrainingCard[] {
    return Array.from(this.trainings.values());
  }

  getAllBasicUniverse(): BasicUniverse[] {
    return Array.from(this.basicUniverse.values());
  }

  getAllPowerCards(): PowerCard[] {
    return Array.from(this.powerCards.values());
  }

  private async loadEvents(): Promise<void> {
    try {
      console.log('📖 Loading events from file...');
      const filePath = path.join(process.cwd(), 'src/resources/cards/descriptions/overpower-erb-events.md');
      
      if (!fs.existsSync(filePath)) {
        console.log('❌ Events file not found, skipping event loading');
        return;
      }

      console.log('📖 Reading event data from file...');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim().length > 0);

      let loadedCount = 0;
      let currentMissionSet = '';

      for (const line of lines) {
        // Check if this is a mission set header
        if (line.startsWith('## ')) {
          currentMissionSet = line.replace('## ', '').trim();
          continue;
        }

        // Skip header and separator lines
        if (line.startsWith('|') && !line.includes('----') && !line.includes('Name')) {
          const columns = line.split('|').map(col => col.trim());
          
          if (columns.length >= 5) { // Split by | creates 5+ elements for 4 columns
            const event: Event = {
              id: `event_${this.nextEventId++}`,
              name: columns[1],
              mission_set: currentMissionSet,
              game_effect: columns[3],
              flavor_text: columns[4],
              image: this.getEventImage(currentMissionSet, columns[1])
            };

            this.events.set(event.id, event);
            loadedCount++;
          }
        }
      }

      console.log(`🎉 Successfully loaded ${loadedCount} events into database!`);
      console.log('✅ Events loaded successfully');
    } catch (error) {
      console.error('❌ Error loading events:', error);
    }
  }

  private getEventImage(missionSet: string, eventName: string): string {
    // Map mission set names to their image prefixes and find the event image
    const missionSetMapping: { [key: string]: string } = {
      'The Call of Cthulhu': 'call_of_cthulu',
      'King of the Jungle': 'tarzan_king_of_the_jungle',
      'Chronicles of Mars': 'chronicles_of_mars',
      'Time Wars: Rise of the Gods': 'world_legends'
    };
    
    // Get the mapped image prefix for this mission set
    const imagePrefix = missionSetMapping[missionSet];
    if (!imagePrefix) {
      return 'unknown_event.webp';
    }
    
    // Convert event name to snake_case for matching
    const eventNameSnake = this.convertToSnakeCase(eventName);
    
    // Look for the event image that comes after the mission set images
    const availableImages = this.getAvailableEventImages();
    
    // First try exact matching
    for (const imageFile of availableImages) {
      const imageName = imageFile.replace('.webp', '');
      
      // Check if this image matches the event name
      if (imageName.includes(eventNameSnake)) {
        return imageFile;
      }
    }
    
    // Try partial word matching for cases like "The Giant Man of Mars" vs "giant_man_of_mars"
    const words = eventNameSnake.split('_').filter(word => word.length > 2);
    for (const imageFile of availableImages) {
      const imageName = imageFile.replace('.webp', '');
      
      // Check if most words match (at least 70% of words)
      const matchingWords = words.filter(word =>
        imageName.includes(word)
      );
      
      if (matchingWords.length >= words.length * 0.7) {
        return imageFile;
      }
    }
    
    // Try fuzzy matching for similar names
    for (const imageFile of availableImages) {
      const imageName = imageFile.replace('.webp', '');
      if (this.levenshteinDistance(eventNameSnake, imageName) <= 3) {
        return imageFile;
      }
    }
    
    // Fallback to unknown image
    return 'unknown_event.webp';
  }

  private getAvailableEventImages(): string[] {
    // Return a list of available event image files
    // These come after the mission set images
    return [
      // Call of Cthulhu events (after 356_call_of_cthulu_7.webp)
      "events/357_a_desperate_gamble.webp", "events/358_the_cost_of_knowledge_is_sanity.webp", "events/359_stars_align.webp",
      // King of the Jungle events (after 368_tarzan_king_of_the_jungle_7.webp)
      "events/369_the_lost_city_of_opar.webp", "events/370_tarzan_the_terrible.webp", "events/371_the_power_of_gonfal.webp",
      // Chronicles of Mars events (after 380_chronicles_of_mars_7.webp)
      "events/381_giant_man_of_mars.webp", "events/382_the_battle_with_zod.webp", "events/383_eyes_in_the_dark.webp",
      // Time Wars: Rise of the Gods events (after 392_world_legends_7.webp)
      "events/393_rally_our_allies.webp", "events/394_second_chances.webp", "events/395_heroes_we_need.webp"
    ];
  }

  private async loadAspects(): Promise<void> {
    try {
      console.log('📖 Loading aspects from file...');
      const filePath = path.join(process.cwd(), 'src/resources/cards/descriptions/overpower-erb-aspects.md');
      
      if (!fs.existsSync(filePath)) {
        console.log('❌ Aspects file not found, skipping aspects loading');
        return;
      }

      console.log('📖 Reading aspects data from file...');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim().length > 0);

      let loadedCount = 0;
      const totalLines = lines.length;
      
      for (const line of lines) {
        // Skip header and separator lines
        if (line.startsWith('|') && !line.includes('----') && !line.includes('Card Name')) {
          const columns = line.split('|').map(col => col.trim());
          
          if (columns.length >= 6) { // Split by | creates 6 elements for 5 columns
            const cardEffect = columns[4] || '';
            const isFortification = cardEffect.includes('**Fortifications!**');
            const isOnePerDeck = cardEffect.includes('**One Per Deck**');
            
            const aspect: Aspect = {
              id: `aspect_${this.nextAspectId++}`,
              card_name: columns[1],
              card_type: columns[2],
              location: columns[3],
              card_effect: cardEffect,
              image: this.getAspectImage(columns[1]),
              is_fortification: isFortification,
              is_one_per_deck: isOnePerDeck
            };

            this.aspects.set(aspect.id, aspect);
            loadedCount++;

            if (loadedCount % 5 === 0) {
              console.log(`   Loaded ${loadedCount}/${totalLines} aspects...`);
            }
          }
        }
      }

      console.log(`🎉 Successfully loaded ${loadedCount} aspects into database!`);
      console.log('✅ Aspects loaded successfully');
    } catch (error) {
      console.error('❌ Error loading aspects:', error);
    }
  }

  private getAspectImage(cardName: string): string {
    // Direct mapping for aspect cards based on their specific names
    const aspectImageMap: { [key: string]: string } = {
      'Amaru: Dragon Legend': 'aspects/434_amaru_dragon_legend.webp',
      'Mallku': 'aspects/435_mallku.webp',
      'Supay': 'aspects/436_supay.webp',
      'Cheshire Cat': 'aspects/437_cheshire_cat.webp',
      'Isis': 'aspects/438_isis.webp'
    };
    
    // Check if we have a direct match
    if (aspectImageMap[cardName]) {
      return aspectImageMap[cardName];
    }
    
    // Fallback to fuzzy matching if no direct match
    const cardNameSnake = this.convertToSnakeCase(cardName);
    const availableImages = this.getAvailableAspectImages();
    
    // Try partial word matching
    const words = cardNameSnake.split('_').filter(word => word.length > 2);
    for (const imageFile of availableImages) {
      const imageName = imageFile.replace('.webp', '');
      const matchingWords = words.filter(word => imageName.includes(word));
      if (matchingWords.length >= words.length * 0.7) {
        return imageFile;
      }
    }
    
    // Try fuzzy matching
    for (const imageFile of availableImages) {
      const imageName = imageFile.replace('.webp', '');
      if (this.levenshteinDistance(cardNameSnake, imageName) <= 3) {
        return imageFile;
      }
    }
    
    return 'unknown_aspect.webp';
  }

  private getAvailableAspectImages(): string[] {
    // Return a list of available aspect image files (IDs 434-438)
    return [
      "specials/434_aspect_1.webp", "specials/435_aspect_2.webp", "specials/436_aspect_3.webp", 
      "specials/437_aspect_4.webp", "specials/438_aspect_5.webp"
    ];
  }

  private async loadAdvancedUniverse(): Promise<void> {
    try {
      console.log('📖 Loading advanced universe from file...');
      const filePath = path.join(process.cwd(), 'src/resources/cards/descriptions/overpower-erb-advanced-universe.md');
      
      if (!fs.existsSync(filePath)) {
        console.log('❌ Advanced universe file not found, skipping advanced universe loading');
        return;
      }

      console.log('📖 Reading advanced universe data from file...');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim().length > 0);

      let loadedCount = 0;
      let currentCharacter = '';

      for (const line of lines) {
        // Check if this is a character header
        if (line.startsWith('## ')) {
          currentCharacter = line.replace('## ', '').trim();
          continue;
        }

        // Skip header and separator lines
        if (line.startsWith('|') && !line.includes('----') && !line.includes('Card Name')) {
          const columns = line.split('|').map(col => col.trim());
          
          if (columns.length >= 5) { // Split by | creates 5+ elements for 4 columns
            const cardEffect = columns[4] || '';
            const isOnePerDeck = cardEffect.includes('**One Per Deck**');
            
            const advancedUniverse: AdvancedUniverse = {
              id: `advanced_universe_${this.nextAdvancedUniverseId++}`,
              name: columns[1],
              card_type: columns[2],
              character: currentCharacter,
              card_effect: cardEffect,
              image: this.getAdvancedUniverseImage(columns[1]),
              is_one_per_deck: isOnePerDeck
            };

            this.advancedUniverse.set(advancedUniverse.id, advancedUniverse);
            loadedCount++;
          }
        }
      }

      console.log(`🎉 Successfully loaded ${loadedCount} advanced universe cards into database!`);
      console.log('✅ Advanced universe loaded successfully');
    } catch (error) {
      console.error('❌ Error loading advanced universe:', error);
    }
  }

  private getAdvancedUniverseImage(cardName: string): string {
    // Direct mapping for advanced universe cards based on their specific names
    const advancedUniverseImageMap: { [key: string]: string } = {
      'Shards of the Staff': 'advanced-universe/192_shards_of_the_staff.webp',
      'Staff Fragments': 'advanced-universe/193_staff_fragments.webp',
      'Staff Head': 'advanced-universe/194_staff_head.webp'
    };
    
    // Check if we have a direct match
    if (advancedUniverseImageMap[cardName]) {
      return advancedUniverseImageMap[cardName];
    }
    
    return 'unknown_advanced_universe.webp';
  }

  private async loadTeamwork(): Promise<void> {
    try {
      console.log('📖 Loading teamwork from file...');
      const filePath = path.join(process.cwd(), 'src/resources/cards/descriptions/overpower-erb-universe-teamwork.md');
      
      if (!fs.existsSync(filePath)) {
        console.log('❌ Teamwork file not found, skipping teamwork loading');
        return;
      }

      console.log('📖 Reading teamwork data from file...');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim().length > 0);

      let loadedCount = 0;
      const totalLines = lines.length;

      for (const line of lines) {
        // Skip header and separator lines
        if (line.startsWith('|') && !line.includes('----') && !line.includes('Card Type')) {
          const columns = line.split('|').map(col => col.trim());
          
          if (columns.length >= 7) { // Split by | creates 7+ elements for 6 columns
            const teamwork: Teamwork = {
              id: `teamwork_${this.nextTeamworkId++}`,
              card_type: columns[1],
              to_use: columns[2],
              acts_as: columns[3],
              followup_attack_types: columns[4],
              first_attack_bonus: columns[5],
              second_attack_bonus: columns[6],
              image: this.getTeamworkImage(columns[2], columns[4], columns[5], columns[6]) // Use the "To Use" field to determine image
            };

            this.teamwork.set(teamwork.id, teamwork);
            loadedCount++;

            if (loadedCount % 5 === 0) {
              console.log(`   Loaded ${loadedCount}/${totalLines} teamwork cards...`);
            }
          }
        }
      }

      console.log(`🎉 Successfully loaded ${loadedCount} teamwork cards into database!`);
      console.log('✅ Teamwork loaded successfully');
    } catch (error) {
      console.error('❌ Error loading teamwork:', error);
    }
  }

  private getTeamworkImage(toUse: string, followupAttackTypes: string, firstAttackBonus: string, secondAttackBonus: string): string {
    // Direct mapping for teamwork cards based on their specific requirements and bonus types
    // This ensures each teamwork card gets its exact corresponding image
    
    // Create a unique key for each teamwork card
    const cardKey = `${toUse}_${followupAttackTypes}_${firstAttackBonus}_${secondAttackBonus}`;
    
    // Direct mapping to the actual image files you provided
    const teamworkImageMap: { [key: string]: string } = {
      // 6 Energy cards - UPDATED BONUSES
      '6 Energy_Combat + Intelligence_0_+1': 'teamwork-universe/398_6_energy_0c_1bf.webp',
      '6 Energy_Brute Force + Combat_0_+1': 'teamwork-universe/399_6_energy_0c_1i.webp',
      '6 Energy_Brute Force + Intelligence_0_+1': 'teamwork-universe/400_6_energy_0b_1i.webp',
      
      // 7 Energy cards - UPDATED BONUSES
      '7 Energy_Combat + Intelligence_+1_+1': 'teamwork-universe/401_7_energy_1c_1bf.webp',
      '7 Energy_Brute Force + Combat_+1_+1': 'teamwork-universe/402_7_energy_1c_1i.webp',
      '7 Energy_Brute Force + Intelligence_+1_+1': 'teamwork-universe/403_7_energy_1bf_1i.webp',
      
      // 8 Energy cards
      '8 Energy_Intelligence + Brute Force_+1_+2': 'teamwork-universe/404_8_energy_1c_2bf.webp',
      '8 Energy_Brute Force + Combat_+1_+2': 'teamwork-universe/405_8_energy_1c_2i.webp',
      '8 Energy_Brute Force + Intelligence_+1_+2': 'teamwork-universe/406_8_energy_1bf_2i.webp',
      
      // 6 Combat cards - UPDATED BONUSES
      '6 Combat_Energy + Intelligence_0_+1': 'teamwork-universe/407_6_combat_0e_1bf.webp',
      '6 Combat_Brute Force + Energy_0_+1': 'teamwork-universe/408_6_combat_0e_1i.webp',
      '6 Combat_Brute Force + Intelligence_0_+1': 'teamwork-universe/409_6_combat_0bf_1i.webp',
      
      // 7 Combat cards - UPDATED BONUSES
      '7 Combat_Energy + Intelligence_+1_+1': 'teamwork-universe/410_7_combat_1e_1bf.webp',
      '7 Combat_Brute Force + Energy_+1_+1': 'teamwork-universe/411_7_combat_1e_1i.webp',
      '7 Combat_Brute Force + Intelligence_+1_+1': 'teamwork-universe/412_7_combat_1bf_1i.webp',
      
      // 8 Combat cards
      '8 Combat_Energy + Intelligence_+1_+2': 'teamwork-universe/413_8_combat_1e_2bf.webp',
      '8 Combat_Brute Force + Energy_+1_+2': 'teamwork-universe/414_8_combat_1e_2i.webp',
      '8 Combat_Brute Force + Intelligence_+1_+2': 'teamwork-universe/415_8_combat_1bf_2i.webp',
      
      // 6 Brute Force cards - UPDATED BONUSES
      '6 Brute Force_Energy + Combat_0_+1': 'teamwork-universe/416_6_brute_force_0e_1c.webp',
      '6 Brute Force_Intelligence + Energy_0_+1': 'teamwork-universe/417_6_brute_force_0e_1i.webp',
      '6 Brute Force_Intelligence + Combat_0_+1': 'teamwork-universe/418_6_brute_force_0c_1i.webp',
      
      // 7 Brute Force cards - UPDATED BONUSES
      '7 Brute Force_Energy + Combat_+1_+1': 'teamwork-universe/419_7_brute_force_1e_1c.webp',
      '7 Brute Force_Intelligence + Energy_+1_+1': 'teamwork-universe/420_7_brute_force_1e_1i.webp',
      '7 Brute Force_Intelligence + Combat_+1_+1': 'teamwork-universe/421_7_brute_force_1c_1i.webp',
      
      // 8 Brute Force cards
      '8 Brute Force_Energy + Combat_+1_+2': 'teamwork-universe/422_8_brute_force_1e_2c.webp',
      '8 Brute Force_Intelligence + Energy_+1_+2': 'teamwork-universe/423_8_brute_force_1e_2i.webp',
      '8 Brute Force_Intelligence + Combat_+1_+2': 'teamwork-universe/424_8_brute_force_1e_2c.webp',
      
      // 6 Intelligence cards - UPDATED BONUSES
      '6 Intelligence_Brute Force + Combat_0_+1': 'teamwork-universe/425_6_intelligence_0e_1c.webp',
      '6 Intelligence_Brute Force + Energy_0_+1': 'teamwork-universe/426_6_intelligence_0e_1bf.webp',
      '6 Intelligence_Combat + Energy_0_+1': 'teamwork-universe/427_6_intelligence_0c_1bf.webp',
      
      // 7 Intelligence cards - UPDATED BONUSES
      '7 Intelligence_Brute Force + Combat_+1_+1': 'teamwork-universe/428_7_intelligence_1e_1c.webp',
      '7 Intelligence_Brute Force + Energy_+1_+1': 'teamwork-universe/429_7_intelligence_1e_1bf.webp',
      '7 Intelligence_Combat + Energy_+1_+1': 'teamwork-universe/430_7_intelligence_1c_1bf.webp',
      
      // 8 Intelligence cards
      '8 Intelligence_Brute Force + Combat_+1_+2': 'teamwork-universe/431_8_intelligence_1e_2c.webp',
      '8 Intelligence_Brute Force + Energy_+1_+2': 'teamwork-universe/432_8_intelligence_1e_2bf.webp',
      '8 Intelligence_Combat + Energy_+1_+2': 'teamwork-universe/433_8_intelligence_1c_2bf.webp',
      
      // Any-Power cards
      '6 Any-Power_Any-Power / Any-Power_0_0': 'teamwork-universe/481_7_anypower.webp',
      '7 Any-Power_Any-Power_0_+1': 'teamwork-universe/481_7_anypower.webp'
    };
    
    // Debug logging
    console.log(`🔍 Looking for teamwork image: ${cardKey}`);
    
    // Check if we have a direct match
    if (teamworkImageMap[cardKey]) {
      console.log(`✅ Direct match found: ${teamworkImageMap[cardKey]}`);
      return teamworkImageMap[cardKey];
    }
    
    console.log(`❌ No direct match found for: ${cardKey}`);
    console.log(`📋 Available keys: ${Object.keys(teamworkImageMap).join(', ')}`);
    
    // Fallback to the old logic if no direct match
    return this.getTeamworkImageFallback(toUse, followupAttackTypes, firstAttackBonus, secondAttackBonus);
  }
  
  private getTeamworkImageFallback(toUse: string, followupAttackTypes: string, firstAttackBonus: string, secondAttackBonus: string): string {
    // Parse the "To Use" field to get level and type
    const parts = toUse.split(' ');
    if (parts.length < 2) return 'unknown_teamwork.webp';
    
    const level = parts[0];
    const statType = parts[1].toLowerCase();
    
    // Map stat types to match the image file naming
    const statTypeMapping: { [key: string]: string } = {
      'energy': 'energy',
      'combat': 'combat', 
      'brute force': 'brute_force',
      'intelligence': 'intelligence',
      'any-power': 'anypower'
    };
    
    const mappedStatType = statTypeMapping[statType];
    if (!mappedStatType) return 'unknown_teamwork.webp';
    
    // Get available images and find the best match
    const availableImages = this.getAvailableTeamworkImages();
    
    // Debug logging
    console.log(`🔍 Fallback: Looking for teamwork image: ${toUse} -> ${mappedStatType} (level ${level})`);
    console.log(`📁 Available images: ${availableImages.length} total`);
    
    // First, try to find images that match the level and stat type exactly
    const levelTypeMatches = availableImages.filter(img => {
      const imgName = img.replace('.webp', '');
      const matches = imgName.includes(`_${level}_${mappedStatType}`) || 
                     imgName.includes(`_${level}_${mappedStatType.replace('_', '')}`);
      if (matches) {
        console.log(`✅ Found level/type match: ${img}`);
      }
      return matches;
    });
    
    console.log(`🎯 Level/type matches found: ${levelTypeMatches.length}`);
    
    if (levelTypeMatches.length > 0) {
      // If we have multiple matches, try to find the best one based on bonus types
      if (levelTypeMatches.length > 1) {
        // Parse followup attack types to get bonus type hints
        const bonusTypes = followupAttackTypes.toLowerCase().split(' + ');
        
        // Look for images that contain hints of the bonus types
        for (const img of levelTypeMatches) {
          const imgName = img.toLowerCase();
          let matchScore = 0;
          
          // Check if image name contains hints of the bonus types
          if (bonusTypes.some(type => imgName.includes(type.substring(0, 2)))) {
            matchScore += 1;
          }
          
          // Check if bonus amounts roughly match
          if (firstAttackBonus === '0' && imgName.includes('0')) matchScore += 1;
          if (firstAttackBonus === '+1' && imgName.includes('1')) matchScore += 1;
          if (secondAttackBonus === '0' && imgName.includes('0')) matchScore += 1;
          if (secondAttackBonus === '+1' && imgName.includes('1')) matchScore += 1;
          if (secondAttackBonus === '+2' && imgName.includes('2')) matchScore += 1;
          
          // If we found a good match, return it
          if (matchScore >= 2) {
            console.log(`🏆 Best match found: ${img} (score: ${matchScore})`);
            return img;
          }
        }
      }
      
      // Return the first match if no specific bonus matching found
      console.log(`📸 Using first level/type match: ${levelTypeMatches[0]}`);
      return levelTypeMatches[0];
    }
    
    // Fallback: try to find any image with the right stat type
    const statTypeMatches = availableImages.filter(img => 
      img.toLowerCase().includes(mappedStatType.replace('_', ''))
    );
    
    if (statTypeMatches.length > 0) {
      console.log(`🔄 Using stat type fallback: ${statTypeMatches[0]}`);
      return statTypeMatches[0];
    }
    
    console.log(`❌ No match found, using unknown placeholder`);
    return 'unknown_teamwork.webp';
  }

  private getAvailableTeamworkImages(): string[] {
    // Return a list of available teamwork image files
    // These are the Power cards from the image list you provided
    return [
      // Energy: 398-406
      "teamwork-universe/398_6_energy_0c_1bf.webp", "teamwork-universe/399_6_energy_0c_1i.webp", "teamwork-universe/400_6_energy_0b_1i.webp",
      "teamwork-universe/401_7_energy_1c_1bf.webp", "teamwork-universe/402_7_energy_1c_1i.webp", "teamwork-universe/403_7_energy_1bf_1i.webp",
      "teamwork-universe/404_8_energy_1c_2bf.webp", "teamwork-universe/405_8_energy_1c_2i.webp", "teamwork-universe/406_8_energy_1bf_2i.webp",
      
      // Combat: 407-415
      "teamwork-universe/407_6_combat_0e_1bf.webp", "teamwork-universe/408_6_combat_0e_1i.webp", "teamwork-universe/409_6_combat_0bf_1i.webp",
      "teamwork-universe/410_7_combat_1e_1bf.webp", "teamwork-universe/411_7_combat_1e_1i.webp", "teamwork-universe/412_7_combat_1bf_1i.webp",
      "teamwork-universe/413_8_combat_1e_2bf.webp", "teamwork-universe/414_8_combat_1e_2i.webp", "teamwork-universe/415_8_combat_1bf_2i.webp",
      
      // Brute Force: 416-424
      "teamwork-universe/416_6_brute_force_0e_1c.webp", "teamwork-universe/417_6_brute_force_0e_1i.webp", "teamwork-universe/418_6_brute_force_0c_1i.webp",
      "teamwork-universe/419_7_brute_force_1e_1c.webp", "teamwork-universe/420_7_brute_force_1e_1i.webp", "teamwork-universe/421_7_brute_force_1c_1i.webp",
      "teamwork-universe/422_8_brute_force_1e_2c.webp", "teamwork-universe/423_8_brute_force_1e_2i.webp", "teamwork-universe/424_8_brute_force_1c_2bf.webp",
      
      // Intelligence: 425-433
      "teamwork-universe/425_6_intelligence_0e_1c.webp", "teamwork-universe/426_6_intelligence_0e_1i.webp", "teamwork-universe/427_6_intelligence_0c_1i.webp",
      "teamwork-universe/428_7_intelligence_1e_1c.webp", "teamwork-universe/429_7_intelligence_1e_1i.webp", "teamwork-universe/430_7_intelligence_1c_1i.webp",
      "teamwork-universe/431_8_intelligence_1e_2c.webp", "teamwork-universe/432_8_intelligence_1e_2i.webp", "teamwork-universe/433_8_intelligence_1c_2bf.webp",
      
      // Any-Power: 481
      "teamwork-universe/481_7_anypower.webp"
    ];
  }

  private async loadAllyUniverse(): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), 'src/resources/cards/descriptions/overpower-erb-universe-ally.md');
      if (!fs.existsSync(filePath)) {
        console.log('❌ Ally Universe file not found, skipping');
        return;
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      for (const line of lines) {
        if (line.startsWith('|') && !line.includes('---') && !line.includes('Card Name')) {
          const cols = line.split('|').map(c => c.trim());
          if (cols.length >= 8) {
            const cardName = cols[1];
            const ally: AllyUniverse = {
              id: `ally_${this.nextAllyUniverseId++}`,
              card_name: cardName,
              card_type: cols[2],
              stat_to_use: cols[3],
              stat_type_to_use: cols[4],
              attack_value: cols[5],
              attack_type: cols[6],
              card_text: cols[7],
              image: this.getAllyUniverseImage(cardName, cols[4], cols[3])
            };
            this.allyUniverse.set(ally.id, ally);
          }
        }
      }
      console.log(`✅ Loaded ${this.allyUniverse.size} Ally Universe cards`);
    } catch (e) {
      console.error('Error loading Ally Universe:', e);
    }
  }

  private getAllyUniverseImage(cardName: string, statType: string, statToUse: string): string {
    // Try to map by stat first using known base set numbers (e.g., 324-331 shown)
    const baseMap: { [key: string]: string[] } = {
      'Energy': ['power-cards/324_5_energy.webp', 'power-cards/325_7_energy.webp'],
      'Combat': ['power-cards/326_5_combat.webp', 'power-cards/327_7_combat.webp'],
      'Brute Force': ['power-cards/328_5_brute_force.webp', 'power-cards/329_7_brute_force.webp'],
      'Intelligence': ['power-cards/330_5_intelligence.webp', 'power-cards/331_7_intelligence.webp']
    };
    const candidates = baseMap[statType] || [];
    if (candidates.length > 0) {
      const prefersSeven = /7\s*or\s*higher/i.test(statToUse);
      const prefersFive = /5\s*or\s*less/i.test(statToUse);
      if (prefersSeven && candidates[1]) return candidates[1];
      if (prefersFive && candidates[0]) return candidates[0];
      return candidates[0];
    }
    // Fallback unknown
    return 'unknown_ally_universe.webp';
  }

  private async loadTraining(): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), 'src/resources/cards/descriptions/overpower-erb-training.md');
      if (!fs.existsSync(filePath)) {
        console.log('❌ Training file not found, skipping');
        return;
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      for (const line of lines) {
        if (line.startsWith('|') && !line.includes('---') && !line.includes('Card Name')) {
          const cols = line.split('|').map(c => c.trim());
          if (cols.length >= 6) {
            const name = cols[1];
            const type1 = cols[2];
            const type2 = cols[3];
            const training: TrainingCard = {
              id: `training_${this.nextTrainingId++}`,
              card_name: name,
              type_1: type1,
              type_2: type2,
              value_to_use: cols[4],
              bonus: cols[5],
              image: this.getTrainingImage(type1, type2)
            };
            this.trainings.set(training.id, training);
          }
        }
      }
      console.log(`✅ Loaded ${this.trainings.size} Training cards`);
    } catch (e) {
      console.error('Error loading Training:', e);
    }
  }

  private getTrainingImage(type1: string, type2: string): string {
    // Map the two stats to one of the six combined 5+5 images (344-349)
    // Build key like 'energy_combat', sorted to match filenames order
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '_');
    const a = norm(type1);
    const b = norm(type2);
    const pair = [a, b].sort().join('_');
    const map: { [key: string]: string } = {
      'combat_energy': 'specials/344_5_energy_5_combat_4.webp',
      'brute_force_energy': 'specials/345_5_energy_5_brute_force_4.webp',
      'energy_intelligence': 'specials/346_5_energy_5_intelligence_4.webp',
      'brute_force_combat': 'specials/347_5_combat_5_brute_force_4.webp',
      'combat_intelligence': 'specials/348_5_combat_5_intelligence_4.webp',
      'brute_force_intelligence': 'specials/349_5_brute_force_5_intelligence_4.webp'
    };
    return map[pair] || 'unknown_training.webp';
  }

  private async loadBasicUniverse(): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), 'src/resources/cards/descriptions/overpower-erb-universe-basic.md');
      if (!fs.existsSync(filePath)) {
        console.log('❌ Basic Universe file not found, skipping');
        return;
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      for (const line of lines) {
        if (line.startsWith('|') && !line.includes('---') && !line.includes('Card Name')) {
          const cols = line.split('|').map(c => c.trim());
          if (cols.length >= 5) {
            const name = cols[1];
            const type = cols[2];
            const valueToUse = cols[3];
            const bonus = cols[4];
            const basicUniverse: BasicUniverse = {
              id: `basic_${this.nextBasicUniverseId++}`,
              card_name: name,
              type: type,
              value_to_use: valueToUse,
              bonus: bonus,
              image: this.getBasicUniverseImage(valueToUse, type, bonus)
            };
            this.basicUniverse.set(basicUniverse.id, basicUniverse);
          }
        }
      }
      console.log(`✅ Loaded ${this.basicUniverse.size} Basic Universe cards`);
    } catch (e) {
      console.error('Error loading Basic Universe:', e);
    }
  }

  private getBasicUniverseImage(valueToUse: string, type: string, bonus: string): string {
    // Extract the numeric value and bonus from the strings
    // valueToUse: "6 or greater" -> extract "6"
    // bonus: "+2" -> extract "2"
    const valueMatch = valueToUse.match(/(\d+)/);
    const bonusMatch = bonus.match(/(\d+)/);
    
    if (valueMatch && bonusMatch) {
      const value = valueMatch[1];
      const bonusValue = bonusMatch[1];
      const typeLower = type.toLowerCase().replace(/\s+/g, '_');
      
      // Map to the correct image IDs based on the pattern
      // Format: [ID]_[valueToUse]_[type]_[bonus].webp
      const imageMap: { [key: string]: string } = {
        // Energy cards
        '6_energy_2': 'specials/332_6_energy_2.webp',  // Ray Gun
        '6_energy_3': 'specials/333_6_energy_3.webp',  // Merlin's Wand
        '7_energy_3': 'specials/334_7_energy_3.webp',  // Lightning Bolt
        
        // Combat cards
        '6_combat_2': 'specials/335_6_combat_2.webp',  // Flintlock
        '6_combat_3': 'specials/336_6_combat_3.webp',  // Rapier
        '7_combat_3': 'specials/337_7_combat_3.webp',  // Longbow
        
        // Brute Force cards
        '6_brute_force_2': 'specials/338_6_brute_force_2.webp',  // Hyde's Serum
        '6_brute_force_3': 'specials/339_6_brute_force_3.webp',  // Trident
        '7_brute_force_3': 'specials/340_7_brute_force_3.webp',  // Tribuchet
        
        // Intelligence cards
        '6_intelligence_2': 'specials/341_6_intelligence_2.webp',  // Secret Identity
        '6_intelligence_3': 'specials/342_6_intelligence_3.webp',  // Advanced Technology
        '7_intelligence_3': 'specials/343_7_intelligence_3.webp'   // Magic Spell
      };
      
      const key = `${value}_${typeLower}_${bonusValue}`;
      return imageMap[key] || 'unknown_basic_universe.webp';
    }
    
    return 'unknown_basic_universe.webp';
  }

  private async loadPowerCards(): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), 'src/resources/cards/descriptions/overpower-erb-powercards.md');
      if (!fs.existsSync(filePath)) {
        console.log('❌ Power cards file not found, skipping');
        return;
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      let currentType: string | null = null;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Skip empty lines and table separators
        if (trimmed === '' || trimmed === '|----------|-----|') continue;
        
        // Check for section headers
        if (trimmed.startsWith('## ')) {
          currentType = trimmed.replace('## ', '').trim();
          continue;
        }
        
        // Skip table headers
        if (trimmed.includes('Power Type') || trimmed.includes('|--')) continue;
        
        // Parse table rows
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          const cols = trimmed.split('|').map(c => c.trim()).filter(Boolean);
          if (cols.length >= 2 && currentType && !isNaN(parseInt(cols[1]))) {
            const powerType = cols[0];
            const value = parseInt(cols[1]);
            
            if (powerType && value && !isNaN(value)) {
              const card: PowerCard = {
                id: `power_${this.nextPowerCardId++}`,
                power_type: powerType,
                value: value,
                image: this.getPowerCardImage(powerType, value)
              };
              this.powerCards.set(card.id, card);
            }
          }
        }
      }
      console.log(`✅ Loaded ${this.powerCards.size} power cards`);
    } catch (e) {
      console.error('Error loading power cards:', e);
    }
  }

  private getPowerCardImage(powerType: string, value: number): string {
    const type = powerType.toLowerCase().replace(/\s+/g, '_');
    if (type === 'any-power' || type === 'any_power') {
      if (value === 5) return 'specials/473_5_any-power.webp';
      if (value === 6) return 'specials/474_6_anypower.webp';
      if (value === 7) return 'specials/475_7_anypower.webp';
      if (value === 8) return 'specials/476_8_anypower.webp';
    }
    if (type === 'multi-power' || type === 'multi_power') {
      if (value === 3) return 'specials/477_3_multipower.webp';
      if (value === 4) return 'specials/478_4_multipower.webp';
      if (value === 5) return 'specials/479_5_multipower.webp';
    }
    const baseMap: { [key: string]: number } = {
      energy: 292,
      combat: 300,
      brute_force: 308,
      intelligence: 316
    };
    const base = baseMap[type] || 0;
    if (base > 0 && value >= 1 && value <= 8) {
      const num = base + (8 - value); // images go descending 8..1
      return `power-cards/${num}_${value}_${type}.webp`;
    }
    return 'unknown_power.webp';
  }

  // Statistics
  getStats() {
    return {
      users: this.users.size,
      decks: this.decks.size,
      characters: this.characters.size,
      locations: this.locations.size,
      specialCards: this.specialCards.size,
      missions: this.missions.size,
      events: this.events.size,
      aspects: this.aspects.size,
      advancedUniverse: this.advancedUniverse.size,
      teamwork: this.teamwork.size
    };
  }
}

export const database = new InMemoryDatabase();

