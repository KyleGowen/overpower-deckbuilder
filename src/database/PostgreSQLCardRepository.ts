import { Pool } from 'pg';
import { CardRepository } from '../repository/CardRepository';
import {
  createCardRepositoryContext,
  type CardCache,
} from './card/context';
import * as character from './card/character';
import * as location from './card/location';
import * as battleground from './card/battleground';
import * as specialPower from './card/special-power';
import * as missionEvent from './card/mission-event';
import * as aspect from './card/aspect';
import * as universe from './card/universe';
import * as stats from './card/stats';

export class PostgreSQLCardRepository implements CardRepository {
  private pool: Pool;
  private cache: CardCache;
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly CARD_STATS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(pool: Pool) {
    this.pool = pool;
    this.cache = {
      characters: null,
      locations: null,
      battlegrounds: null,
      cacheTime: 0,
      cardStats: null,
      cardStatsCacheTime: 0,
    };
  }

  private getContext() {
    return createCardRepositoryContext(
      this.pool,
      this.cache,
      this.CACHE_TTL,
      this.CARD_STATS_CACHE_TTL
    );
  }

  public clearCaches(): void {
    this.cache.characters = null;
    this.cache.locations = null;
    this.cache.battlegrounds = null;
    this.cache.cacheTime = 0;
    this.cache.cardStats = null;
    this.cache.cardStatsCacheTime = 0;
    console.log('🧹 Card repository caches cleared');
  }

  async initialize(): Promise<void> {
    console.log('✅ PostgreSQL CardRepository initialized');
  }

  async getCharacterById(id: string) {
    return character.getCharacterById(this.getContext(), id);
  }

  async getAllCharacters() {
    return character.getAllCharacters(this.getContext());
  }

  async getCharacterEffectiveImage(
    characterId: string,
    _selectedAlternateImage?: string
  ) {
    return character.getCharacterEffectiveImage(this.getContext(), characterId);
  }

  async getSpecialCardById(id: string) {
    return specialPower.getSpecialCardById(this.getContext(), id);
  }

  async getAllSpecialCards() {
    return specialPower.getAllSpecialCards(this.getContext());
  }

  async getSpecialCardEffectiveImage(
    specialCardId: string,
    _selectedAlternateImage?: string
  ) {
    return specialPower.getSpecialCardEffectiveImage(
      this.getContext(),
      specialCardId
    );
  }

  async getPowerCardById(id: string) {
    return specialPower.getPowerCardById(this.getContext(), id);
  }

  async getAllPowerCards() {
    return specialPower.getAllPowerCards(this.getContext());
  }

  async getPowerCardEffectiveImage(
    powerCardId: string,
    _selectedAlternateImage?: string
  ) {
    return specialPower.getPowerCardEffectiveImage(
      this.getContext(),
      powerCardId
    );
  }

  async getLocationById(id: string) {
    return location.getLocationById(this.getContext(), id);
  }

  async getAllLocations() {
    return location.getAllLocations(this.getContext());
  }

  async getBattlegroundById(id: string) {
    return battleground.getBattlegroundById(this.getContext(), id);
  }

  async getAllBattlegrounds() {
    return battleground.getAllBattlegrounds(this.getContext());
  }

  async getMissionById(id: string) {
    return missionEvent.getMissionById(this.getContext(), id);
  }

  async getAllMissions() {
    return missionEvent.getAllMissions(this.getContext());
  }

  async getEventById(id: string) {
    return missionEvent.getEventById(this.getContext(), id);
  }

  async getAllEvents() {
    return missionEvent.getAllEvents(this.getContext());
  }

  async getAspectById(id: string) {
    return aspect.getAspectById(this.getContext(), id);
  }

  async getAllAspects() {
    return aspect.getAllAspects(this.getContext());
  }

  async getAdvancedUniverseById(id: string) {
    return universe.getAdvancedUniverseById(this.getContext(), id);
  }

  async getAllAdvancedUniverse() {
    return universe.getAllAdvancedUniverse(this.getContext());
  }

  async getTeamworkById(id: string) {
    return universe.getTeamworkById(this.getContext(), id);
  }

  async getAllTeamwork() {
    return universe.getAllTeamwork(this.getContext());
  }

  async getAllyUniverseById(id: string) {
    return universe.getAllyUniverseById(this.getContext(), id);
  }

  async getAllAllyUniverse() {
    return universe.getAllAllyUniverse(this.getContext());
  }

  async getTrainingById(id: string) {
    return universe.getTrainingById(this.getContext(), id);
  }

  async getAllTraining() {
    return universe.getAllTraining(this.getContext());
  }

  async getBasicUniverseById(id: string) {
    return universe.getBasicUniverseById(this.getContext(), id);
  }

  async getAllBasicUniverse() {
    return universe.getAllBasicUniverse(this.getContext());
  }

  async getCardStats() {
    return stats.getCardStats(this.getContext());
  }
}
