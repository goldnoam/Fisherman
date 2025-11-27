import React, { useState } from 'react';
import { GameState, PlayerStats, ShopItem, HighScoreEntry } from '../types';
import { SHOP_ITEMS } from '../constants';
import { Coins, ShoppingBag, Anchor, ArrowRight, MousePointer2, Keyboard, Trophy, Skull } from 'lucide-react';
import { playGameSound } from '../constants';

interface UIProps {
  gameState: GameState;
  timeLeft: number;
  stats: PlayerStats;
  onStartLevel: () => void;
  onBuy: (item: ShopItem) => void;
  onRestart: () => void;
  message?: string;
  highScores: HighScoreEntry[];
  isNewHighScore?: boolean;
  onSubmitScore?: (name: string) => void;
  onPreview?: (item: ShopItem | null) => void;
  lastExpenses?: number;
}

export const UI = ({ 
    gameState, timeLeft, stats, onStartLevel, onBuy, onRestart, 
    message, highScores, isNewHighScore, onSubmitScore, onPreview, lastExpenses = 0 
}: UIProps) => {

  const [inputName, setInputName] = useState('');

  const handleStart = () => {
      playGameSound('ui');
      onStartLevel();
  };

  const handleBuy = (item: ShopItem) => {
      playGameSound('ui');
      onBuy(item);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (inputName.trim() && onSubmitScore) {
          playGameSound('ui');
          onSubmitScore(inputName.trim().substring(0, 10)); // Limit name length
      }
  };

  const CopyrightFooter = () => (
      <div className="absolute bottom-2 w-full text-center z-50 pointer-events-auto">
          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity">
              (C) NOAM GOLD AI 2025 • <a href="mailto:gold.noam@gmail.com" className="text-blue-400 hover:text-yellow-400 ml-1">Send Feedback</a>
          </p>
      </div>
  );

  if (gameState === GameState.START) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-900/90 text-white backdrop-blur-md z-50 p-4">
        <h1 className="text-4xl md:text-6xl mb-6 pixel-font text-yellow-400 drop-shadow-md text-center">GEMINI<br/>DEEP SEA TYCOON</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full mb-8">
            
            {/* Instructions Box */}
            <div className="bg-slate-800/90 p-6 rounded-xl border border-slate-600 shadow-2xl">
                <h2 className="text-xl text-blue-300 font-bold mb-4 flex items-center gap-2">
                    <Anchor className="w-5 h-5" /> HOW TO PLAY
                </h2>
                <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-3 bg-slate-700/50 p-2 rounded-lg">
                        <MousePointer2 className="text-white w-4 h-4" /> 
                        <span><strong>Click</strong> or <strong>SPACE</strong> to cast</span>
                    </li>
                    <li className="flex items-center gap-3 bg-slate-700/50 p-2 rounded-lg">
                        <div className="flex gap-1">
                            <span className="border px-1 rounded bg-slate-800">A</span>
                            <span className="border px-1 rounded bg-slate-800">D</span>
                        </div> 
                        <span>Move boat Left / Right</span>
                    </li>
                    <li className="bg-slate-700/50 p-2 rounded-lg text-slate-300">
                        Catch fish, earn money, buy upgrades. <br/>
                        <span className="text-red-400 font-bold">Beware:</span> You must pay daily rent!
                    </li>
                </ul>
                <div className="mt-6 flex justify-center">
                    <button 
                        onClick={handleStart}
                        className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold rounded-xl text-xl transition-all shadow-lg hover:scale-105"
                    >
                        START FISHING
                    </button>
                </div>
            </div>

            {/* High Score Table */}
            <div className="bg-slate-800/90 p-6 rounded-xl border border-yellow-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy size={100} className="text-yellow-500" />
                </div>
                <h2 className="text-xl text-yellow-400 font-bold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5" /> LEADERBOARD
                </h2>
                
                <div className="space-y-2">
                    {highScores.map((entry, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-slate-700/40 border border-slate-600/50">
                            <div className="flex items-center gap-3">
                                <span className={`font-mono font-bold w-6 text-center ${idx === 0 ? 'text-yellow-400 text-lg' : 'text-slate-400'}`}>
                                    {idx + 1}
                                </span>
                                <span className="font-bold text-slate-100">{entry.name}</span>
                            </div>
                            <span className="font-mono text-yellow-200">${entry.score.toLocaleString()}</span>
                        </div>
                    ))}
                    {highScores.length === 0 && (
                        <div className="text-center text-slate-500 py-8">No high scores yet. Be the first!</div>
                    )}
                </div>
            </div>
        </div>

        <CopyrightFooter />
      </div>
    );
  }

  if (gameState === GameState.GAME_OVER) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/95 text-white backdrop-blur-md z-50 p-4">
        <Skull size={60} className="text-red-500 mb-4 animate-bounce" />
        <h1 className="text-5xl mb-2 pixel-font text-red-500 drop-shadow-md text-center">GAME OVER</h1>
        <p className="text-red-200 mb-8">Bankrupt! Daily expenses exceeded funds.</p>

        <div className="bg-slate-900/80 p-8 rounded-xl border border-red-500/30 mb-8 text-center w-full max-w-md shadow-2xl">
             <p className="text-slate-400 text-sm uppercase font-bold mb-2">Final Score</p>
             <p className="text-4xl text-white font-bold mb-6">${stats.score.toLocaleString()}</p>
             
             {isNewHighScore ? (
                 <div className="animate-fade-in">
                     <p className="text-yellow-400 font-bold mb-2 flex items-center justify-center gap-2">
                         <Trophy size={20} /> NEW HIGH SCORE!
                     </p>
                     <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                         <input 
                            autoFocus
                            type="text" 
                            placeholder="Enter Name" 
                            value={inputName}
                            onChange={(e) => setInputName(e.target.value)}
                            maxLength={10}
                            className="bg-slate-800 border border-slate-600 text-white p-3 rounded text-center text-xl uppercase font-bold focus:border-yellow-400 outline-none"
                         />
                         <button type="submit" className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold py-3 rounded transition-colors">
                             SUBMIT SCORE
                         </button>
                     </form>
                 </div>
             ) : (
                 <div className="flex flex-col gap-2">
                     <p className="text-slate-500 text-sm">High Score to Beat</p>
                     <p className="text-xl text-yellow-400 font-bold mb-4">
                        ${highScores[0]?.score?.toLocaleString() || 0}
                     </p>
                     <button 
                        onClick={onRestart}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xl shadow-lg hover:scale-105 transition-all"
                    >
                        TRY AGAIN
                    </button>
                 </div>
             )}
        </div>
        <CopyrightFooter />
      </div>
    );
  }

  if (gameState === GameState.LEVEL_END) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 text-white z-50 p-8">
        <h2 className="text-4xl text-yellow-400 pixel-font mb-2">DAY {stats.level} COMPLETE</h2>
        
        {/* Financial Summary */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-600 mb-6 flex gap-4 md:gap-8 items-center text-sm md:text-base">
             <div className="text-center">
                 <p className="text-slate-400 text-xs uppercase font-bold">Funds</p>
                 <p className="text-2xl text-white font-bold">${stats.money + lastExpenses}</p>
             </div>
             <div className="text-red-400 font-bold text-xl">-</div>
             <div className="text-center">
                 <p className="text-red-400 text-xs uppercase font-bold">Daily Expenses</p>
                 <p className="text-2xl text-red-400 font-bold">${lastExpenses}</p>
             </div>
             <div className="text-white font-bold text-xl">=</div>
             <div className="text-center">
                 <p className="text-green-400 text-xs uppercase font-bold">Net Balance</p>
                 <p className="text-3xl text-green-400 font-bold">${stats.money}</p>
             </div>
        </div>
        
        <div className="w-full max-w-5xl bg-slate-800 rounded-xl p-6 mb-8 overflow-hidden flex flex-col h-[50vh] border border-slate-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-300">
                <ShoppingBag /> BOAT UPGRADES
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {SHOP_ITEMS.map(item => {
                    const owned = (item.type === 'speed' && stats.inventory.reelSpeed >= item.value) || 
                                  (item.type === 'size' && stats.inventory.hookSize >= item.value) ||
                                  (item.type === 'cosmetic' && stats.inventory.outfit === item.name);
                    const affordable = stats.money >= item.cost;
                    
                    return (
                        <button 
                            key={item.id}
                            disabled={owned || !affordable}
                            onClick={() => handleBuy(item)}
                            onMouseEnter={() => onPreview && onPreview(item)}
                            onMouseLeave={() => onPreview && onPreview(null)}
                            className={`p-4 rounded-lg border-2 text-left transition-all relative ${
                                owned ? 'border-green-500 bg-green-900/20 opacity-50' :
                                affordable ? 'border-blue-500 bg-slate-700 hover:bg-slate-600 hover:scale-105' : 'border-red-900 bg-slate-800 opacity-60'
                            }`}
                        >
                           <div className="flex justify-between items-start mb-2">
                               <span className="font-bold text-lg">{item.name}</span>
                               <span className="text-yellow-400 font-mono">${item.cost}</span>
                           </div>
                           <p className="text-sm text-slate-300 mb-2">{item.description}</p>
                           {owned && <span className="absolute bottom-2 right-2 text-green-500 font-bold text-xs">OWNED</span>}
                        </button>
                    );
                })}
            </div>
        </div>

        <button 
          onClick={handleStart}
          className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-2xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
        >
          NEXT DAY <ArrowRight />
        </button>
      </div>
    );
  }

  // HUD
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4">
      
      {/* Top Bar */}
      <div className="flex justify-between items-start">
         {/* Stats */}
         <div className="flex flex-col gap-2">
            <div className="bg-slate-900/80 text-white p-3 rounded-lg border-2 border-slate-700 backdrop-blur-md flex items-center gap-3 shadow-lg">
                <Coins className="text-yellow-400" />
                <span className="text-2xl font-mono font-bold">${stats.money}</span>
            </div>
            <div className="bg-slate-900/80 text-white p-2 rounded-lg border-2 border-slate-700 backdrop-blur-md flex items-center gap-3 shadow-lg w-fit">
                <Anchor size={18} className="text-blue-400" />
                <span className="text-sm font-mono text-slate-300">Day {stats.level}</span>
            </div>
         </div>

         {/* Timer */}
         <div className={`p-4 rounded-full border-4 font-bold text-3xl font-mono shadow-xl transition-colors ${timeLeft < 10 ? 'bg-red-600 border-red-800 text-white animate-pulse' : 'bg-white border-slate-300 text-slate-900'}`}>
            {timeLeft}
         </div>
      </div>

      {/* Message Toast */}
      {message && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-yellow-400 text-blue-900 px-6 py-2 rounded-full font-bold shadow-xl animate-bounce">
              {message}
          </div>
      )}
    </div>
  );
};
