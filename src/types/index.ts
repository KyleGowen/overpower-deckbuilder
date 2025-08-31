// User types and interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

// Card types and interfaces
export interface Card {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  cost: number;
  power: number;
  defense: number;
  description: string;
  imageUrl?: string;
  set: string;
  cardNumber: string;
  // Character-specific stats
  energy?: number;
  combat?: number;
  bruteForce?: number;
  intelligence?: number;
  threatLevel?: number;
  specialAbilities?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpecialCard {
  id: string;
  cardName: string;
  cardType: string;
  character: string;
  cardEffect: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PowerCard {
  id: string;
  powerType: string;
  value: number;
  notes: string | undefined;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum CardType {
  CHARACTER = 'character',
  SPECIAL = 'special',
  POWER = 'power',
  VILLAIN = 'villain',
  HERO = 'hero',
  LOCATION = 'location',
  EVENT = 'event',
  SUPPORT = 'support'
}

export enum CardRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

// Deck types and interfaces
export interface Deck {
  id: string;
  name: string;
  description?: string;
  cards: DeckCard[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  userId: string;
}

export interface DeckCard {
  cardId: string;
  quantity: number;
}

export interface CreateDeckRequest {
  name: string;
  description?: string;
  cards: DeckCard[];
  isPublic?: boolean;
  userId?: string;
}

export interface UpdateDeckRequest {
  name?: string;
  description?: string;
  cards?: DeckCard[];
  isPublic?: boolean;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

