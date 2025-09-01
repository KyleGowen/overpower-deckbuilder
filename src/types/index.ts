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

// Power card structure (placeholder for future)
export interface PowerCard {
  id: string;
  name: string;
  value: number;
  type: string;
}

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

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

