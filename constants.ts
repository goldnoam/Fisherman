import { FishType, ShopItem } from './types';

export const LEVEL_DURATION = 30; // seconds

export const FISH_COLORS = {
  RED: '#ef4444',
  ORANGE: '#f97316',
  AMBER: '#f59e0b',
  YELLOW: '#facc15',
  LIME: '#84cc16',
  GREEN: '#22c55e',
  EMERALD: '#10b981',
  TEAL: '#14b8a6',
  CYAN: '#06b6d4',
  SKY: '#0ea5e9',
  BLUE: '#3b82f6',
  INDIGO: '#6366f1',
  VIOLET: '#8b5cf6',
  PURPLE: '#a855f7',
  FUCHSIA: '#d946ef',
  PINK: '#ec4899',
  ROSE: '#f43f5e',
  NEON: '#39ff14', // Mutant
  DARK: '#1e1b4b', // Giant
  GOLD: '#ffd700'  // Legendary
};

export const SPAWN_RATES = {
  [FishType.TINY]: 0.25,
  [FishType.SMALL]: 0.25,
  [FishType.MEDIUM]: 0.20,
  [FishType.LARGE]: 0.10,
  [FishType.GIANT]: 0.08,
  [FishType.LEGENDARY]: 0.05,
  [FishType.MUTANT]: 0.07
};

export const FISH_SPECS = {
  [FishType.TINY]: { weight: 2, basePrice: 20, scale: 0.3, speedBase: 3.5 },
  [FishType.SMALL]: { weight: 10, basePrice: 50, scale: 0.5, speedBase: 2.5 },
  [FishType.MEDIUM]: { weight: 30, basePrice: 150, scale: 0.8, speedBase: 1.5 },
  [FishType.LARGE]: { weight: 60, basePrice: 400, scale: 1.2, speedBase: 0.8 },
  [FishType.GIANT]: { weight: 120, basePrice: 800, scale: 1.8, speedBase: 0.5 },
  [FishType.LEGENDARY]: { weight: 100, basePrice: 1500, scale: 1.5, speedBase: 2.0 },
  [FishType.MUTANT]: { weight: 40, basePrice: 2000, scale: 0.9, speedBase: 4.0 }
};

export const SHOP_ITEMS: ShopItem[] = [
  // Speed Upgrades
  { id: 'reel_1', name: 'Turbo Reel v1', description: 'Reel in fish 20% faster.', cost: 300, type: 'speed', value: 0.2 },
  { id: 'reel_2', name: 'Turbo Reel v2', description: 'Supercharged engine for heavy fish.', cost: 800, type: 'speed', value: 0.5 },
  { id: 'reel_3', name: 'Nuclear Reel', description: 'Hyper-speed hauling power.', cost: 2500, type: 'speed', value: 0.9 },
  { id: 'reel_4', name: 'Quantum Reel', description: 'Bends spacetime to fish.', cost: 6000, type: 'speed', value: 1.5 },
  { id: 'reel_5', name: 'Warp Drive', description: 'Instant retrieval tech.', cost: 12000, type: 'speed', value: 2.5 },
  
  // Hook Upgrades
  { id: 'hook_1', name: 'Titanium Hook', description: 'Larger hook hitbox for easier catches.', cost: 500, type: 'size', value: 0.5 },
  { id: 'hook_2', name: 'Magnet Hook', description: 'Even bigger catch radius.', cost: 1200, type: 'size', value: 1.0 },
  { id: 'hook_3', name: 'Magnet Hook XL', description: 'Serious attraction power.', cost: 2500, type: 'size', value: 1.5 },
  { id: 'hook_4', name: 'Black Hole', description: 'Massive gravitational pull.', cost: 5000, type: 'size', value: 2.5 },
  { id: 'hook_5', name: 'Poseidon\'s Fork', description: 'The god of seas favors you.', cost: 15000, type: 'size', value: 4.0 },

  // Luck Upgrades
  { id: 'luck_1', name: 'Shiny Lure', description: 'Attracts more rare fish.', cost: 1000, type: 'luck', value: 1 },
  { id: 'luck_2', name: 'Diamond Lure', description: 'Significantly boosts rare spawns.', cost: 2500, type: 'luck', value: 2.5 },
  { id: 'luck_3', name: 'Sonar', description: 'Tech that locates legendary fish.', cost: 4000, type: 'luck', value: 3.5 },
  { id: 'luck_4', name: 'Ancient Totem', description: 'Legendary fish flock to you.', cost: 8000, type: 'luck', value: 6 },
  { id: 'luck_5', name: 'Kraken Bait', description: 'Dangerously lucky.', cost: 20000, type: 'luck', value: 10 },

  // Cosmetics
  { id: 'shoes_1', name: 'Water Boots', description: 'Look cool on the dock.', cost: 200, type: 'cosmetic', value: 0 },
  { id: 'hat_1', name: 'Captain Hat', description: 'You are the captain now.', cost: 1500, type: 'cosmetic', value: 0 },
  { id: 'hat_2', name: 'Pirate Hat', description: 'Yarrr! A proper pirate look.', cost: 3000, type: 'cosmetic', value: 0 },
  { id: 'hat_3', name: 'Astro Helm', description: 'Space fishing gear.', cost: 5000, type: 'cosmetic', value: 0 },
  { id: 'hat_4', name: 'Golden Suit', description: 'For the richest anglers.', cost: 10000, type: 'cosmetic', value: 0 },
  { id: 'hat_5', name: 'Cyber Punk', description: 'Neon style for night fishing.', cost: 7500, type: 'cosmetic', value: 0 },
  { id: 'boat_1', name: 'Neon Hull', description: 'Glow in the dark boat.', cost: 4000, type: 'cosmetic', value: 0 },
  { id: 'boat_2', name: 'Golden Hull', description: 'Solid gold boat.', cost: 12000, type: 'cosmetic', value: 0 },
];

// --- Audio Synthesizer ---
// No external assets required. Pure Web Audio API.

let audioCtx: AudioContext | null = null;

const initAudio = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
};

export const playGameSound = (type: 'ui' | 'cast' | 'splash' | 'reel' | 'success' | 'thunder', intensity: number = 1.0) => {
    try {
        initAudio();
        if (!audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        switch (type) {
            case 'ui':
                // High blip
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'cast':
                // Swoosh
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.linearRampToValueAtTime(600, now + 0.3);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            case 'splash':
                // White noise burst approximation
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.linearRampToValueAtTime(20, now + 0.2);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                break;
            case 'reel':
                 // Mechanical clicking - Intensity changes pitch and volume
                 osc.type = 'square';
                 // Base freq 150, lower pitch for heavier load (higher intensity)
                 const freq = Math.max(80, 150 - (intensity * 30));
                 osc.frequency.setValueAtTime(freq, now);
                 
                 // Higher volume for higher intensity
                 const vol = 0.05 + (intensity * 0.05);
                 gainNode.gain.setValueAtTime(vol, now);
                 gainNode.gain.linearRampToValueAtTime(0, now + 0.05);
                 osc.start(now);
                 osc.stop(now + 0.05);
                 break;
            case 'success':
                // Coin/Win sound
                osc.type = 'sine';
                osc.frequency.setValueAtTime(500, now);
                osc.frequency.setValueAtTime(800, now + 0.1);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                break;
            case 'thunder':
                // Low rumble
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(80, now);
                osc.frequency.exponentialRampToValueAtTime(10, now + 1.5);
                gainNode.gain.setValueAtTime(0.5, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
                osc.start(now);
                osc.stop(now + 1.5);
                break;
        }

    } catch (e) {
        console.warn("Audio play failed", e);
    }
};