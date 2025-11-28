import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameScene } from './components/GameScene';
import { UI } from './components/UI';
import { GameState, FishConfig, PlayerStats, FishType, ShopItem, WeatherType, HighScoreEntry } from './types';
import { LEVEL_DURATION, SPAWN_RATES, FISH_SPECS, FISH_COLORS } from './constants';

const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper to spawn fish in schools
const spawnFish = (count: number, currentDepthBonus: number, luck: number): FishConfig[] => {
  const newFish: FishConfig[] = [];
  const colors = Object.values(FISH_COLORS);
  
  // Define 3-5 School Centers (Clusters)
  const clusters = [];
  const clusterCount = 3 + Math.floor(Math.random() * 3);
  for(let i=0; i<clusterCount; i++) {
      clusters.push({
          x: (Math.random() * 20) - 10,
          y: -2 - (Math.random() * 10)
      });
  }

  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let type = FishType.SMALL;
    
    // Adjusted Spawn Rates
    if (rand < SPAWN_RATES[FishType.LEGENDARY] * (1 + luck * 0.2)) type = FishType.LEGENDARY;
    else if (rand < 0.1 + SPAWN_RATES[FishType.MUTANT] * (1 + luck * 0.1)) type = FishType.MUTANT;
    else if (rand < 0.15 + SPAWN_RATES[FishType.GIANT]) type = FishType.GIANT;
    else if (rand < 0.25 + SPAWN_RATES[FishType.LARGE]) type = FishType.LARGE;
    else if (rand < 0.45 + SPAWN_RATES[FishType.MEDIUM]) type = FishType.MEDIUM;
    else if (rand < 0.7 + SPAWN_RATES[FishType.SMALL]) type = FishType.SMALL;
    else type = FishType.TINY;
    
    const spec = FISH_SPECS[type];
    
    // Pick vibrant random colors
    let color = colors[Math.floor(Math.random() * colors.length)];
    if (type === FishType.LEGENDARY) color = FISH_COLORS.GOLD;
    if (type === FishType.MUTANT) color = FISH_COLORS.NEON;
    if (type === FishType.GIANT) color = FISH_COLORS.DARK;

    // Assign to a cluster
    const cluster = clusters[Math.floor(Math.random() * clusters.length)];
    
    // Spread around cluster center
    const spreadX = (Math.random() - 0.5) * 6;
    const spreadY = (Math.random() - 0.5) * 3;
    
    const x = cluster.x + spreadX;
    const y = Math.max(-14, Math.min(-1, cluster.y + spreadY));

    newFish.push({
      id: generateId(),
      type,
      color,
      depth: y,
      speed: spec.speedBase + (Math.random() * 2),
      weight: spec.weight,
      basePrice: spec.basePrice,
      scale: [spec.scale, spec.scale, spec.scale],
      x,
      y,
      direction: Math.random() > 0.5 ? 1 : -1,
      schoolCenter: [cluster.x, cluster.y]
    });
  }
  return newFish;
};

const getWeatherForLevel = (level: number): WeatherType => {
    const rand = Math.random();
    if (level % 5 === 0) return 'RAINY'; // Every 5th level stormy
    if (rand < 0.2) return 'RAINY';
    if (rand < 0.4) return 'FOGGY';
    return 'SUNNY';
};

export default function App() {
  // Game State
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [timeLeft, setTimeLeft] = useState(LEVEL_DURATION);
  const [fishes, setFishes] = useState<FishConfig[]>([]);
  const [toastMessage, setToastMessage] = useState<string | undefined>(undefined);
  const [weather, setWeather] = useState<WeatherType>('SUNNY');
  const [lastExpenses, setLastExpenses] = useState(0);
  
  // High Score State
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  
  // Shop Preview State
  const [previewItem, setPreviewItem] = useState<ShopItem | null>(null);

  // Player State
  const [stats, setStats] = useState<PlayerStats>({
    money: 0,
    level: 1,
    score: 0,
    inventory: {
      reelSpeed: 0,
      hookSize: 0,
      luck: 0,
      outfit: 'Standard'
    }
  });

  // Calculate effective inventory (including previews)
  const effectiveInventory = useMemo(() => {
    if (!previewItem) return stats.inventory;
    
    const tempInv = { ...stats.inventory };
    
    if (previewItem.type === 'cosmetic') {
        tempInv.outfit = previewItem.name;
    }
    else if (previewItem.type === 'size') {
        tempInv.hookSize = previewItem.value; 
    }
    else if (previewItem.type === 'speed') {
        tempInv.reelSpeed = previewItem.value;
    }
    else if (previewItem.type === 'luck') {
        tempInv.luck = previewItem.value;
    }
    
    return tempInv;
  }, [stats.inventory, previewItem]);

  // Load High Scores
  useEffect(() => {
    const stored = localStorage.getItem('gemini_fish_highscores');
    if (stored) {
      setHighScores(JSON.parse(stored));
    } else {
      setHighScores([
          { name: "Capt. Nemo", score: 5000 },
          { name: "Ahab", score: 3000 },
          { name: "Ishmael", score: 1500 },
      ]);
    }
  }, []);

  // --- Game Loop Logic ---

  const checkHighScore = (finalScore: number) => {
      // Check if score is higher than the lowest score in top 5, or if list is not full
      if (highScores.length < 5 || finalScore > highScores[highScores.length - 1].score) {
          setIsNewHighScore(true);
      } else {
          setIsNewHighScore(false);
      }
  };

  const handleSubmitScore = (name: string) => {
      const newEntry = { name, score: stats.score };
      const newList = [...highScores, newEntry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
      
      setHighScores(newList);
      localStorage.setItem('gemini_fish_highscores', JSON.stringify(newList));
      setIsNewHighScore(false);
  };

  // Handle Level End & Expenses
  const handleLevelEnd = useCallback(() => {
      // Calculate daily expenses (Rent/Fuel)
      const expenses = 50 + (stats.level * 20); // Increases with level
      
      setStats(prev => {
          const newMoney = prev.money - expenses;
          
          if (newMoney < 0) {
             setGameState(GameState.GAME_OVER);
             // Use prev.score because score hasn't changed here
             checkHighScore(prev.score);
             return { ...prev, money: newMoney }; 
          }
          
          setGameState(GameState.LEVEL_END);
          return { ...prev, money: newMoney };
      });
      setLastExpenses(expenses);
  }, [stats.level, highScores]); 

  useEffect(() => {
      if (gameState === GameState.GAME_OVER) {
          if (highScores.length < 5 || stats.score > highScores[highScores.length - 1].score) {
              setIsNewHighScore(true);
          }
      }
  }, [gameState, stats.score, highScores]);


  // Timer
  useEffect(() => {
    let timer: number;
    if (gameState === GameState.PLAYING) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  // Check Timer for Level End
  useEffect(() => {
      if (timeLeft === 0 && gameState === GameState.PLAYING) {
          handleLevelEnd();
      }
  }, [timeLeft, gameState, handleLevelEnd]);

  // Level Start Sequence
  const handleStartLevel = () => {
    if (gameState === GameState.START || gameState === GameState.LEVEL_END) {
        // 0. Set Weather
        const newWeather = getWeatherForLevel(stats.level);
        setWeather(newWeather);
        
        // 1. Spawn Fish
        const fishCount = 12 + (stats.level * 2); 
        const spawned = spawnFish(Math.min(60, fishCount), 0, stats.inventory.luck);
        setFishes(spawned);
        
        // 2. Reset Timer
        setTimeLeft(LEVEL_DURATION);
        
        // 3. Start
        setGameState(GameState.PLAYING);
    }
  };

  const handleCatch = (fish: FishConfig) => {
    const value = fish.basePrice;

    setStats(prev => ({
      ...prev,
      money: prev.money + value,
      score: prev.score + value
    }));
    
    showToast(`Caught ${fish.type}! +$${value}`);
    
    // Spawn replacement
    setTimeout(() => {
         setFishes(prev => [...prev, ...spawnFish(1, 0, stats.inventory.luck)]);
    }, 1000);
  };

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(undefined), 2000);
  };

  const handleBuy = (item: ShopItem) => {
      if (stats.money >= item.cost) {
          setStats(prev => {
              const newInv = { ...prev.inventory };
              // Simple replacement logic for upgrades
              if (item.type === 'speed') newInv.reelSpeed = Math.max(newInv.reelSpeed, item.value);
              if (item.type === 'size') newInv.hookSize = Math.max(newInv.hookSize, item.value);
              if (item.type === 'luck') newInv.luck = Math.max(newInv.luck, item.value);
              if (item.type === 'cosmetic') newInv.outfit = item.name;
              
              return {
                  ...prev,
                  money: prev.money - item.cost,
                  inventory: newInv
              };
          });
      }
  };
  
  const handleNextDay = () => {
      setStats(prev => ({ ...prev, level: prev.level + 1 }));
      handleStartLevel();
  };

  const handleRestart = () => {
      window.location.reload();
  };

  return (
    <div className="w-full h-screen bg-slate-900 relative overflow-hidden">
      <GameScene 
        gameState={gameState} 
        fishes={fishes} 
        setFishes={setFishes} 
        onCatch={handleCatch}
        inventory={effectiveInventory}
        weather={weather}
      />
      <UI 
        gameState={gameState} 
        timeLeft={timeLeft} 
        stats={stats} 
        onStartLevel={gameState === GameState.LEVEL_END ? handleNextDay : handleStartLevel}
        onBuy={handleBuy}
        onRestart={handleRestart}
        message={toastMessage}
        highScores={highScores}
        isNewHighScore={isNewHighScore}
        onSubmitScore={handleSubmitScore}
        onPreview={setPreviewItem}
        lastExpenses={lastExpenses}
      />
    </div>
  );
}