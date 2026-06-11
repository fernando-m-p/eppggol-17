import { useEffect, useState } from 'react';
import {generateStandings, TeamStats, Game} from '../../lib/table';
import { Award, Calendar, Eye, Loader2, RefreshCw, Save, Trophy } from 'lucide-react';

export default function StandingsPage(){
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [gameTab, setGameTab] = useState<'grupo' | 'matamata'>('grupo');
    const [activeGroup, setActiveGroup] = useState<string>('Grupo A');
    
    
    
    const fetchData = async () => {
      try {
        const [gamesRes] = await Promise.all([
          fetch('/api/games')
        ]);
        const gamesData = await gamesRes.json();
  
        setGames(Array.isArray(gamesData) ? gamesData : []);
        
      } catch (e) {
        console.error('Error fetching data:', e);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
  
    useEffect(() => {
      fetchData();
    }, []);

    const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <p className="mt-4 text-slate-400 font-medium">Carregando classificação...</p>
      </div>
    );
  }

// Group filter list (Group A to L)
  const groupNames = Array.from(new Set(games.filter(g => g.stage?.startsWith('Grupo')).map(g => g.stage))).sort();

  // Filter games based on current active tab and active group
  const filteredGames = games.filter(game => {
    if (gameTab === 'grupo') {
      return game.stage === activeGroup;
    } else {
      return !game.stage?.startsWith('Grupo');
    }
  });
  
  return (
    <div className="space-y-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-950/60 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Trophy className="text-amber-500 w-8 h-8" />
            Classificação <span className="gold-gradient-text">Geral</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Veja as pontuações e acompanhe os palpites dos adversários em tempo real.
          </p>
        </div>
        <div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-sm text-emerald-400 font-semibold hover:bg-emerald-900/60 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {filteredGames.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center max-w-lg mx-auto">
          <Award className="w-16 h-16 text-emerald-800/80 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum jogador cadastrado</h3>
          <p className="text-slate-400 text-sm">
            Os administradores ainda não adicionaram participantes a este bolão.
          </p>
        </div>
      ) : (
        <>
          
        /* Launch Results Section */
        <div className="space-y-6">
          {/* Sub tabs to filter games list */}
          <div className="flex flex-col space-y-4">
            <div className="flex border-b border-emerald-950/60 gap-4">
              <button
                onClick={() => setGameTab('grupo')}
                className={`pb-3 text-sm font-bold transition-all relative ${gameTab === 'grupo' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                Fase de Grupos
                {gameTab === 'grupo' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500"></span>
                )}
              </button>
              <button
                onClick={() => setGameTab('matamata')}
                className={`pb-3 text-sm font-bold transition-all relative ${gameTab === 'matamata' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                Mata-Mata
                {gameTab === 'matamata' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500"></span>
                )}
              </button>
            </div>

            {/* Sub-groups scroll for group tab */}
            {gameTab === 'grupo' && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {groupNames.map(groupName => (
                  <button
                    key={groupName}
                    onClick={() => setActiveGroup(groupName)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${activeGroup === groupName
                      ? 'bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-emerald-950/40 text-slate-400 border-emerald-900/30 hover:text-white hover:bg-emerald-950/80'
                      }`}
                  >
                    {groupName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admin Games Score Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {games.length === 0 ? (
              <div className="col-span-full text-center py-10 glass-panel rounded-2xl text-slate-550">
                Nenhum jogo nesta categoria.
              </div>
            ) : (
              filteredGames.map((game) => {
                
                const formatKickoff = (dateStr: string) => {
                  const d = new Date(dateStr);
                  return d.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                };

                return (
                  <div
                    key={game.id}
                    className={`glass-panel rounded-2xl p-5 border flex flex-col justify-between shadow-xl transition-all duration-300 `}
                  >
                    {/* Collapsible card header */}
                    <div className="flex items-center justify-between border-b border-emerald-950/45 pb-3 mb-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/20 text-emerald-450 font-bold">
                          {game.stage}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                          📍 {game.stadium.split('(')[0]}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-450 font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {formatKickoff(game.date)}
                      </div>
                    </div>

                    {/* Team Rows and Inputs */}
                    <div className="flex items-center justify-between py-2">
                      {/* Team A */}
                      <div className="flex items-center space-x-3 w-[38%]">
                        <span className="text-3xl">{game.flagA}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-extrabold text-white truncate">{game.teamA}</span>
                          <span className="text-[10px] text-slate-500 font-bold tracking-wider">{game.abbrevA}</span>
                        </div>
                      </div>

                      {/* Inputs */}
                      <div className="flex items-center justify-center space-x-2 w-[24%]">
                        
                        <span className="font-black text-white">{game.goalsA}</span>
                        <span className="text-slate-600 font-bold">x</span>
                        <span className="font-black text-white">{game.goalsB}</span>
                        
                      </div>

                      {/* Team B */}
                      <div className="flex items-center justify-end space-x-3 w-[38%] text-right">
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-extrabold text-white truncate">{game.teamB}</span>
                          <span className="text-[10px] text-slate-500 font-bold tracking-wider">{game.abbrevB}</span>
                        </div>
                        <span className="text-3xl">{game.flagB}</span>
                      </div>
                    </div>

                    {/* Status updater and action button */}
                    <div className="mt-4 flex items-center justify-between text-xs border-t border-emerald-950/35 pt-3">
                      {/* Status selectors */}
                      <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-emerald-950">
                        {game.status}
                      </div>

                      
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      
        </>
      )}

      
    </div>
  );
}

  

