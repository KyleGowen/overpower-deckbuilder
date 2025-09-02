// Clean, simple database schema

// User table
export interface User {
  id: string;
  name: string;
  email: string;
}

// Deck table
export interface Deck {
  id: string;
  user_id: string;
  name: string;
}

// Character table (from overpower-erb-characters.md)
export interface Character {
  id: string;
  name: string;
  energy: number;
  combat: number;
  brute_force: number;
  intelligence: number;
  threat_level: number;
  special_abilities: string; // Can be empty string for no special ability
  image: string;
}

export interface Location {
  id: string;
  name: string;
  threat_level: number;
  special_ability: string;
  image: string;
}

// Card types for future expansion
export interface Card {
  id: string;
  type: 'character' | 'power' | 'special';
  data: Character | PowerCard | SpecialCard;
}

// (PowerCard defined later with full fields)

// Special card structure (from overpower-erb-specials.md)
export interface SpecialCard {
  id: string;
  name: string;
  card_type: string;
  character: string;
  card_effect: string;
  image: string;
  is_cataclysm: boolean;
}

export interface Mission {
  id: string;
  mission_set: string;
  card_name: string;
  image: string;
}

export interface Event {
  id: string;
  name: string;
  mission_set: string;
  game_effect: string;
  flavor_text: string;
  image: string;
}

export interface Aspect {
  id: string;
  card_name: string;
  card_type: string;
  location: string;
  card_effect: string;
  image: string;
  is_fortification: boolean;
  is_one_per_deck: boolean;
}

export interface AdvancedUniverse {
  id: string;
  name: string;
  card_type: string;
  character: string;
  card_effect: string;
  image: string;
  is_one_per_deck: boolean;
}

export interface Teamwork {
  id: string;
  card_type: string;
  to_use: string;
  acts_as: string;
  followup_attack_types: string;
  first_attack_bonus: string;
  second_attack_bonus: string;
  image: string;
}

export interface AllyUniverse {
  id: string;
  card_name: string;
  card_type: string;
  stat_to_use: string;          // e.g., "5 or less" or "7 or higher"
  stat_type_to_use: string;     // Energy | Combat | Brute Force | Intelligence
  attack_value: string;         // numeric as string to preserve formatting
  attack_type: string;          // Combat | Brute Force | Intelligence
  card_text: string;
  image: string;
}

export interface TrainingCard {
  id: string;
  card_name: string;
  type_1: string;      // Energy | Combat | Brute Force | Intelligence
  type_2: string;      // Energy | Combat | Brute Force | Intelligence
  value_to_use: string; // e.g., "5 or less"
  bonus: string;        // e.g., "+4"
  image: string;
}

export interface BasicUniverse {
  id: string;
  card_name: string;
  type: string;         // Energy | Combat | Brute Force | Intelligence
  value_to_use: string; // e.g., "6 or greater", "7 or greater"
  bonus: string;        // e.g., "+2", "+3"
  image: string;
}

export interface PowerCard {
  id: string;
  power_type: string;   // Energy | Combat | Brute Force | Intelligence | Any-Power | Multi-Power
  value: number;        // 1..8, or 3..5 for Multi-Power
  image: string;
}

// Deck management interfaces
export interface DeckCard {
  id: string;
  type: 'character' | 'location' | 'special' | 'mission' | 'event' | 'aspect' | 'advanced-universe' | 'teamwork' | 'ally-universe' | 'training' | 'basic-universe' | 'power';
  cardId: string; // The ID from the original card table
  quantity: number; // How many copies of this card
}

export interface DeckMetadata {
  id: string;
  name: string;
  description?: string;
  created: string; // ISO date string
  lastModified: string; // ISO date string
  cardCount: number; // Total number of cards in deck
}

export interface DeckData {
  metadata: DeckMetadata;
  cards: DeckCard[];
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

