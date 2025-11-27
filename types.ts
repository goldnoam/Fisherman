export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  LEVEL_END = 'LEVEL_END',
  GAME_OVER = 'GAME_OVER'
}

export enum FishType {
  TINY = 'Tiny',
  SMALL = 'Small',
  MEDIUM = 'Medium',
  LARGE = 'Large',
  GIANT = 'Giant',
  LEGENDARY = 'Legendary',
  MUTANT = 'Mutant'
}

export type WeatherType = 'SUNNY' | 'RAINY' | 'FOGGY';

export interface MarketTrend {
  headline: string;
  bonusColor: string;
  bonusType: FishType;
  multiplier: number;
}

export interface FishConfig {
  id: string;
  type: FishType;
  color: string;
  depth: number; // Y position spawn range
  speed: number;
  weight: number;
  basePrice: number;
  scale: [number, number, number];
  x: number;
  y: number;
  direction: 1 | -1;
  schoolCenter: [number, number]; // [x, y] target for schooling
}

export interface PlayerStats {
  money: number;
  level: number;
  score: number;
  inventory: {
    reelSpeed: number; // Higher is faster
    hookSize: number; // Bigger catch area
    luck: number; // Better spawn rates
    outfit: string; // Cosmetic
  };
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'speed' | 'size' | 'luck' | 'cosmetic';
  value: number; // Increment value
}

export interface HighScoreEntry {
  name: string;
  score: number;
}