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
  special_abilities: string;
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

// Special card structure (placeholder for future)
export interface SpecialCard {
  id: string;
  name: string;
  effect: string;
  type: string;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

