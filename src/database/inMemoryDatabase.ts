import { User, Deck, Character, Location, SpecialCard, Mission, Event, Aspect, AdvancedUniverse, Teamwork, AllyUniverse, TrainingCard, ApiResponse } from '../types';
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
    
    console.log('✅ Database initialization complete');
    console.log(`📊 Database loaded: ${this.characters.size} characters, ${this.locations.size} locations, ${this.specialCards.size} special cards, ${this.missions.size} missions, ${this.events.size} events, ${this.aspects.size} aspects, ${this.advancedUniverse.size} advanced universe, ${this.teamwork.size} teamwork, ${this.allyUniverse.size} ally universe, ${this.trainings.size} trainings`);
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
                             const character: Character = {
                   id: `char_${this.nextCharacterId++}`,
                   name: columns[1],
                   energy: parseInt(columns[2]) || 0,
                   combat: parseInt(columns[3]) || 0,
                   brute_force: parseInt(columns[4]) || 0,
                   intelligence: parseInt(columns[5]) || 0,
                   threat_level: parseInt(columns[6]) || 0,
                   special_abilities: columns[7] || '',
                   image: columns[8]
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
      "Dracula's Armory": '465_draculas_armory.webp',
      "Spartan Training Ground": '466_spartan_training_ground.webp',
      "The Round Table": '467_the_round_table.webp',
      "Barsoom": '468_barsoom.webp',
      "Asclepieion": '469_ascleipeion.webp',
      "221-B Baker St.": '470_221b_baker_st.webp',
      "Event Horizon: The Future": '471_horizon.webp',
      "The Land That Time Forgot": '472_the_land_that_time_forgot.webp'
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

  private getSpecialCardImage(cardName: string): string {
    // Convert card name to snake_case for intelligent matching
    const snakeCaseName = this.convertToSnakeCase(cardName);
    
    // First try to find an exact match with the snake_case name
    const availableImages = this.getAvailableSpecialCardImages();
    
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
      "439_heimdall.webp", "440_lady_of_the_lake.webp", "441_robin_hood_master_thief.webp",
      "442_tunupa.webp", "443_fairy_protection.webp", "444_loki.webp", "445_wrath_of_ra.webp",
      "446_valkyrie_skeggold.webp", "447_oni_and_succubus.webp", "448_bodhisattava_enlightened_one.webp",
      "449_mystical_energy.webp", "450_charge_into_battle.webp", "451_subjugate_the_meek.webp",
      "452_draconic_leadership.webp", "453_liliths_swarm.webp", "454_disorient_opponent.webp",
      "455_freya.webp", "456_grim_reaper.webp", "457_gunnr.webp", "458_hades.webp",
      "459_legendary_escape.webp", "460_merlins_magic.webp", "461_preternatural_healing.webp",
      "462_princess_and_the_pea.webp", "463_the_gemni.webp", "464_valkyrie_hilder.webp",
      
      // Character-specific special cards (001-291)
      "001_angry_mob_middle_ages.webp", "002_dont_let_it_get_away.webp", "003_mob_mentality.webp",
      "004_strength_in_numbers.webp", "005_swarm_them.webp", "006_pitchforks_and_torches.webp",
      "007_regent_of_the_crown.webp", "008_angry_mob_industrial_age.webp", "009_disrupt_supply_lines.webp",
      "010_union_power.webp", "011_angry_mob_modern_age.webp", "012_online_cyber_attack.webp",
      "013_ransom_your_secrets.webp", "014_anubis.webp", "015_book_of_the_dead.webp",
      "016_lord_of_the_sacred_land.webp", "017_shepherd_of_the_damned.webp", "018_syphon_strike.webp",
      "019__weighing_ofthe_heart.webp", "020_wither.webp", "021_billy_the_kid.webp",
      "022_head_for_mexico.webp", "023_ill_make_you_famous.webp", "024_pals.webp",
      "025_quick_draw.webp", "026_reap_the_whirlwind.webp", "027_regulators.webp",
      "028_captain_nemo.webp", "029_ethnologist.webp", "030_never_set_foot_on_dry_land.webp",
      "031_silent_running.webp", "032_ruthless_plunderer.webp", "033_the_nautilus.webp",
      "034_weapons_of_wrath_and_hatred.webp", "035_janjong_duare_mintep.webp", "036_on_the_razors_edge.webp",
      "037_telepathic_resistance.webp", "038_sometimes_piracy_is_the_best_option.webp", "039_t_ray_gun.webp",
      "040_telepathic_training.webp", "041_friend_to_foe.webp", "042_jacopo.webp",
      "043_ancient_one.webp", "044_devoted_follower.webp", "045_distracting_intervention.webp",
      "046_network_of_fanatics.webp", "047_the_call_of_cthulhu.webp", "048_the_sleeper_awakens.webp",
      "049_warrior_of_helium.webp", "050_diplomat_to_all_martians.webp", "051_fortune_of_helium.webp",
      "052_head_of_martian_science.webp", "053_protector_of_barsoom.webp", "054_champions_of_barsoom.webp",
      "055_all_chips_on_the_table.webp", "056_blackheath_rugby_star.webp", "057_british_army_surgeon.webp",
      "058_english_gentleman.webp", "059_not_a_bad_detective.webp", "060_always_there_for_a_friend.webp",
      "061_crimson_restoration.webp", "062_veil_of_deceit.webp", "063_lord_of_the_vampires.webp",
      "064_paralyzing_gaze.webp", "065_to_the_last_man.webp", "066_undead_flesh.webp",
      "067_decapitate.webp", "068_human_spine_whip.webp", "069_mark_of_the_headless.webp",
      "070_pumpkin_head.webp", "071_relentless_hessian.webp", "072_visage_of_terror.webp",
      "073_sowing_chaos.webp", "074_great_club.webp", "075_lion_skin_cloak.webp",
      "076_godly_prowess.webp", "077_protector_of_mankind.webp", "078_slaying_the_hydra.webp",
      "079_didnt_see_it_coming.webp", "080_hidden_sociopath.webp", "081_im_in_your_house.webp",
      "082_ive_murdered_before.webp", "083_one_at_a_time.webp", "084_run_and_hide.webp",
      "085_archimedes_q_porter.webp", "086_ethnoarchaeology.webp", "087_tenacious_pursuit.webp",
      "088_lady_of_the_jungle.webp", "089_not_without_my_friends.webp", "090_not_a_damsel_in_distress.webp",
      "091_angelic_visions.webp", "092_burned_at_the_stake.webp", "093_early_feminist_leader.webp",
      "094_inspirational_leadership.webp", "095_patron_saint_of_france.webp", "096_protection_of_saint_michael.webp",
      "097_dotar_sojat.webp", "098_immortality.webp", "099_leap_into_the_fray.webp",
      "100_lower_gravity.webp", "101_superhuman_endurance.webp", "102_virginia_fighting_man.webp",
      "103_excalibur.webp", "104_king_of_camelot.webp", "105_knights_of_the_round_table.webp",
      "106_legendary_partnership.webp", "107_heavy_is_the_head.webp", "108_lead_from_the_front.webp",
      "109_john_clayton_iii.webp", "110_jungle_survival.webp", "111_like_father_like_son.webp",
      "112_meriem_and_jackie_clayton.webp", "113_son_of_the_jungle.webp", "114_to_the_death.webp",
      "115_chivalrous_protector.webp", "116_for_guineveres_love.webp", "117_for_the_queen.webp",
      "118_knight_of_the_round_table.webp", "119_sword_and_shield.webp", "120_true_strike.webp",
      "121_300.webp", "122_baptized_in_combat.webp", "123_for_sparta.webp",
      "124_give_them_nothing.webp", "125_greatest_soldiers_in_history.webp", "126_shield_phalanx.webp",
      "127_archimedes.webp", "128_ascendant_mage.webp", "129_for_camelot.webp",
      "130_foretell_the_future.webp", "131_transmogrification.webp", "132_summon_the_elements.webp",
      "133_draculas_telepathic_connection.webp", "134_jonathan_harker_solicitor.webp", "135_nocturnal_hunter.webp",
      "136_the_hunger.webp", "137_tracking_movements.webp", "138_vampiric_celerity.webp",
      "139_apprentice_of_merlin.webp", "140_avalons_warmth.webp", "141_duality.webp",
      "142_enchantress_guile.webp", "143_shapeshifters_guise.webp", "144_teleportation_circle.webp",
      "145_overdose.webp", "146_sadistic_tendencies.webp", "147_set_loose.webp",
      "148_the_serum.webp", "149_trample.webp", "150_victorian_sophisticant.webp",
      "151_reclaim_the_waters.webp", "152_form_of_water.webp", "153_poseidons_might.webp",
      "154_rising_tides.webp", "155_trident.webp", "156_tsunami.webp",
      "157_complex_criminal_scheme.webp", "158_criminal_mastermind.webp", "159_future_plans.webp",
      "160_mathematical_genius.webp", "161_napoleon_of_crime.webp", "162_tactical_fighter.webp",
      "163_cult_of_menevis_bull.webp", "164_eye_of_sekmet.webp", "165_healing_waters_of_the_nile.webp",
      "166_band_of_merry_men.webp", "167_defender_of_the_people.webp", "168_hero_of_nottingham.webp",
      "169_master_archer.webp", "170_master_thief.webp", "171_steal_from_the_rich.webp",
      "172_flaming_arrows.webp", "173_i_command_an_army.webp", "174_read_the_bones.webp",
      "175_rule_by_fear.webp", "176_squeeze_the_commoners.webp", "177_taxes.webp",
      "178_battle_of_wits.webp", "179_brilliant_deduction.webp", "180_irene_adler.webp",
      "181_logical_reasoning.webp", "182_probability_evaluation.webp", "183_unpredictable_mind.webp",
      "184_cloud_surfing.webp", "185_godly_strength.webp", "186_grasp_of_the_five_elements.webp",
      "187_staff_of_the_monkey_king.webp", "188_stone_skin.webp", "189_transformation_trickery.webp",
      "190_avenging_my_love.webp", "191_barsoomian_warrior_statesman.webp", "192_four_armed_warrior.webp",
      "193_jeddak_of_thark.webp", "194_protector_of_the_incubator.webp", "195_sola.webp",
      "196_emotional_senses.webp", "197_jungle_tactics.webp", "198_lord_of_the_jungle.webp",
      "199_my_feet_are_like_hands.webp", "200_raised_by_mangani_apes.webp", "201_deceptive_maneuver.webp",
      "202_ancient_wisdom.webp", "203_fury_of_the_desert.webp", "204_pharaoh_of_the_fourth_dynasty.webp",
      "205_reinvigorated_by_fresh_organs.webp", "206_relentless_pursuit.webp", "207_the_eternal_journey.webp",
      "208_all_for_one.webp", "209_aramis.webp", "210_athos.webp",
      "211_dartagnan.webp", "212_porthos.webp", "213_valiant_charge.webp",
      "214_from_a_mile_away.webp", "215_futuristic_phaser.webp", "216_ill_already_be_gone.webp",
      "217_knowledge_of_tomorrow.webp", "218_harbingers_warning.webp", "219_the_tomorrow_doctor.webp",
      "220_doctor_professor_lawyer_scientist.webp", "221_monster_hunting_expert.webp", "222_crossbow_expert.webp",
      "223_right_tools_for_the_job.webp", "224_sacred_wafers_from_amsterdam.webp", "225_world_renowned_doctor.webp",
      "226_abner_perrys_lab_assistant.webp", "227_archery_knives_jiu_jitsu.webp", "228_chamston_hedding_estate.webp",
      "229_department_of_theoretical_physics.webp", "230_fires_of_halos.webp", "231_practical_physics.webp",
      "232_232.webp", "233_233.webp", "234_234.webp", "235_235.webp", "236_236.webp", "237_237.webp",
      "238_238.webp", "239_239.webp", "240_240.webp", "241_241.webp", "242_242.webp", "243_243.webp",
      "244_244.webp", "245_245.webp", "246_246.webp", "247_247.webp", "248_248.webp", "249_249.webp",
      "250_250.webp", "251_251.webp", "252_252.webp", "253_253.webp", "254_254.webp", "255_255.webp",
      "256_256.webp", "257_257.webp", "258_258.webp", "259_259.webp", "260_260.webp", "261_261.webp",
      "262_262.webp", "263_263.webp", "264_264.webp", "265_265.webp", "266_266.webp", "267_267.webp",
      "268_268.webp", "269_269.webp", "270_270.webp", "271_271.webp", "272_272.webp",
      "273_aquaphobic.webp", "274_feard_by_all_witches.webp", "275_i_will_have_those_silver_shoes.webp",
      "276_one_eye.webp", "277_harness_the_wind.webp", "278_wolves_crows_black_birds_en_237.webp",
      "279_279.webp", "280_a_jealous_god.webp", "281_banishment.webp", "282_hera.webp",
      "283_law_and_order.webp", "284_thunderbolt.webp", "285_285.webp", "286_3_quick_strokes.webp",
      "287_elite_swordsmanship.webp", "288_master_of_escape.webp", "289_ancestial_rapier.webp",
      "290_riches_of_don_diego_de_la_vega.webp", "291_reposte.webp", "292_292.webp", "293_293.webp",
      "294_294.webp", "295_295.webp", "296_296.webp", "297_297.webp", "298_298.webp", "299_299.webp",
      "300_300.webp", "301_301.webp", "302_302.webp", "303_303.webp", "304_304.webp", "305_305.webp",
      "306_306.webp", "307_307.webp", "308_308.webp", "309_309.webp", "310_310.webp", "311_311.webp",
      "312_312.webp", "313_313.webp", "314_314.webp", "315_315.webp", "316_316.webp", "317_317.webp",
      "318_318.webp", "319_319.webp", "320_320.webp", "321_321.webp", "322_322.webp", "323_323.webp",
      "324_324.webp", "325_325.webp", "326_326.webp", "327_327.webp", "328_328.webp", "329_329.webp",
      "330_330.webp", "331_331.webp", "332_332.webp", "333_333.webp", "334_334.webp", "335_335.webp",
      "336_336.webp", "337_337.webp", "338_338.webp", "339_339.webp", "340_340.webp", "341_341.webp",
      "342_342.webp", "343_343.webp", "344_344.webp", "345_345.webp", "346_346.webp", "347_347.webp",
      "348_348.webp", "349_349.webp", "350_350.webp", "351_351.webp", "352_352.webp", "353_353.webp",
      "354_354.webp", "355_355.webp", "356_356.webp", "357_357.webp", "358_358.webp", "359_359.webp",
      "360_360.webp", "361_361.webp", "362_362.webp", "363_363.webp", "364_364.webp", "365_365.webp",
      "366_366.webp", "367_367.webp", "368_368.webp", "369_369.webp", "370_370.webp", "371_371.webp",
      "372_372.webp", "373_373.webp", "374_374.webp", "375_375.webp", "376_376.webp", "377_377.webp",
      "378_378.webp", "379_379.webp", "380_380.webp", "381_381.webp", "382_382.webp", "383_383.webp",
      "384_384.webp", "385_385.webp", "386_386.webp", "387_387.webp", "388_388.webp", "389_389.webp",
      "390_390.webp", "391_391.webp", "392_392.webp", "393_393.webp", "394_394.webp", "395_395.webp",
      "396_396.webp", "397_397.webp", "398_398.webp", "399_399.webp", "400_400.webp", "401_401.webp",
      "402_402.webp", "403_403.webp", "404_404.webp", "405_405.webp", "406_406.webp", "407_407.webp",
      "408_408.webp", "409_409.webp", "410_410.webp", "411_411.webp", "412_412.webp", "413_413.webp",
      "414_414.webp", "415_415.webp", "416_416.webp", "417_417.webp", "418_418.webp", "419_419.webp",
      "420_420.webp", "421_421.webp", "422_422.webp", "423_423.webp", "424_424.webp", "425_425.webp",
      "426_426.webp", "427_427.webp", "428_428.webp", "429_429.webp", "430_430.webp", "431_431.webp",
      "432_432.webp", "433_433.webp", "434_434.webp", "435_435.webp", "436_436.webp", "437_437.webp",
      "438_438.webp"
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
      "350_call_of_cthulu_1.webp", "351_call_of_cthulu_2.webp", "352_call_of_cthulu_3.webp",
      "353_call_of_cthulu_4.webp", "354_call_of_cthulu_5.webp", "355_call_of_cthulu_6.webp",
      "356_call_of_cthulu_7.webp",
      // Tarzan King of the Jungle missions (362-368)
      "362_tarzan_king_of_the_jungle_1.webp", "363_tarzan_king_of_the_jungle_2.webp", "364_tarzan_king_of_the_jungle_3.webp",
      "365_tarzan_king_of_the_jungle_4.webp", "366_tarzan_king_of_the_jungle_5.webp", "367_tarzan_king_of_the_jungle_6.webp",
      "368_tarzan_king_of_the_jungle_7.webp",
      // Chronicles of Mars missions (374-380)
      "374_chronicles_of_mars_1.webp", "375_chronicles_of_mars_2.webp", "376_chronicles_of_mars_3.webp",
      "377_chronicles_of_mars_4.webp", "378_chronicles_of_mars_5.webp", "379_chronicles_of_mars_6.webp",
      "380_chronicles_of_mars_7.webp",
      // World Legends missions (386-392)
      "386_world_legends_1.webp", "387_world_legends_2.webp", "388_world_legends_3.webp",
      "389_world_legends_4.webp", "390_world_legends_5.webp", "391_world_legends_6.webp",
      "392_world_legends_7.webp"
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
      "357_a_desperate_gamble.webp", "358_the_cost_of_knowledge_is_sanity.webp", "359_stars_align.webp",
      // King of the Jungle events (after 368_tarzan_king_of_the_jungle_7.webp)
      "369_the_lost_city_of_opar.webp", "370_tarzan_the_terrible.webp", "371_the_power_of_gonfal.webp",
      // Chronicles of Mars events (after 380_chronicles_of_mars_7.webp)
      "381_giant_man_of_mars.webp", "382_the_battle_with_zod.webp", "383_eyes_in_the_dark.webp",
      // Time Wars: Rise of the Gods events (after 392_world_legends_7.webp)
      "393_rally_our_allies.webp", "394_second_chances.webp", "395_heroes_we_need.webp"
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
      'Amaru: Dragon Legend': '434_amaru_dragon_legend.webp',
      'Mallku': '435_mallku.webp',
      'Supay': '436_supay.webp',
      'Cheshire Cat': '437_cheshire_cat.webp',
      'Isis': '438_isis.webp'
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
      "434_aspect_1.webp", "435_aspect_2.webp", "436_aspect_3.webp", 
      "437_aspect_4.webp", "438_aspect_5.webp"
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
      'Shards of the Staff': '192_shards_of_the_staff.webp',
      'Staff Fragments': '193_staff_fragments.webp',
      'Staff Head': '194_staff_head.webp'
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
              image: this.getTeamworkImage(columns[2]) // Use the "To Use" field to determine image
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

  private getTeamworkImage(toUse: string): string {
    // Parse the "To Use" field to determine the image
    // Format: "6 Brute Force", "7 Combat", "8 Energy", etc.
    const parts = toUse.split(' ');
    if (parts.length < 2) return 'unknown_teamwork.webp';
    
    const level = parts[0];
    const statType = parts[1].toLowerCase();
    
    // Special handling for Power and Any-Power cards
    if (statType === 'any-power' || statType === 'power') {
      return '481_7_anypower.webp';
    }
    
    // Map stat types to image ranges
    const statTypeMapping: { [key: string]: string } = {
      'energy': 'energy',
      'combat': 'combat', 
      'brute': 'brute_force',
      'intelligence': 'intelligence'
    };
    
    const mappedStatType = statTypeMapping[statType];
    if (!mappedStatType) return 'unknown_teamwork.webp';
    
    // Find the appropriate image based on level and stat type
    // The images follow the pattern: [number]_[level]_[stat_type]_[identifier].webp
    const availableImages = this.getAvailableTeamworkImages();
    
    for (const imageFile of availableImages) {
      const imageName = imageFile.replace('.webp', '');
      if (imageName.includes(level) && imageName.includes(mappedStatType)) {
        return imageFile;
      }
    }
    
    return 'unknown_teamwork.webp';
  }

  private getAvailableTeamworkImages(): string[] {
    // Return a list of available teamwork image files
    // These are the Power cards from the image list you provided
    return [
      // Energy: 398-406
      "398_6_energy_0c_1bf.webp", "399_6_energy_0c_1i.webp", "400_6_energy_0b_1i.webp",
      "401_7_energy_1c_1bf.webp", "402_7_energy_1c_1i.webp", "403_7_energy_1bf_1i.webp",
      "404_8_energy_1c_2bf.webp", "405_8_energy_1c_2i.webp", "406_8_energy_1bf_2i.webp",
      
      // Combat: 407-415
      "407_6_combat_0e_1bf.webp", "408_6_combat_0e_1i.webp", "409_6_combat_0bf_1i.webp",
      "410_7_combat_1e_1bf.webp", "411_7_combat_1e_1i.webp", "412_7_combat_1bf_1i.webp",
      "413_8_combat_1e_2bf.webp", "414_8_combat_1e_2i.webp", "415_8_combat_1bf_2i.webp",
      
      // Brute Force: 416-424
      "416_6_brute_force_0e_1c.webp", "417_6_brute_force_0e_1i.webp", "418_6_brute_force_0c_1i.webp",
      "419_7_brute_force_1e_1c.webp", "420_7_brute_force_1e_1i.webp", "421_7_brute_force_1c_1i.webp",
      "422_8_brute_force_1e_2c.webp", "423_8_brute_force_1e_2i.webp", "424_8_brute_force_1c_2bf.webp",
      
      // Intelligence: 425-433
      "425_6_intelligence_0e_1c.webp", "426_6_intelligence_0e_1i.webp", "427_6_intelligence_0c_1i.webp",
      "428_7_intelligence_1e_1c.webp", "429_7_intelligence_1e_1i.webp", "430_7_intelligence_1c_1i.webp",
      "431_8_intelligence_1e_2c.webp", "432_8_intelligence_1e_2i.webp", "433_8_intelligence_1c_2bf.webp",
      
      // Any-Power: 481
      "481_7_anypower.webp"
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
      'Energy': ['324_5_energy.webp', '325_7_energy.webp'],
      'Combat': ['326_5_combat.webp', '327_7_combat.webp'],
      'Brute Force': ['328_5_brute_force.webp', '329_7_brute_force.webp'],
      'Intelligence': ['330_5_intelligence.webp', '331_7_intelligence.webp']
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
      'combat_energy': '344_5_energy_5_combat_4.webp',
      'brute_force_energy': '345_5_energy_5_brute_force_4.webp',
      'energy_intelligence': '346_5_energy_5_intelligence_4.webp',
      'brute_force_combat': '347_5_combat_5_brute_force_4.webp',
      'combat_intelligence': '348_5_combat_5_intelligence_4.webp',
      'brute_force_intelligence': '349_5_brute_force_5_intelligence_4.webp'
    };
    return map[pair] || 'unknown_training.webp';
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

