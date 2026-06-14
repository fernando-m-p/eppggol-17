'use client';

import { useEffect, useState } from 'react';
import { generateStandings, TeamStats, Game } from '../../lib/table';
import { Table2, Award, Calendar, Lock, Unlock, CheckCircle, RefreshCw, Eye } from 'lucide-react';
import { calculatePoints } from '@/lib/scoring';

export default function StandingsPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gameTab, setGameTab] = useState<'grupo' | 'matamata'>('grupo');
  const [activeGroup, setActiveGroup] = useState<string>('Grupo A');
  const [activeStage, setActiveStage] = useState<string>('16 avos de final');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const isLocked = (kickoffDate: string) => {
    const kickoff = new Date(kickoffDate).getTime();
    const now = Date.now();
    const tenMinutesInMs = 10 * 60 * 1000;
    return now >= (kickoff - tenMinutesInMs);
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
  }, [selectedGame]);

  const fetchData = async () => {
    try {
      const [gamesRes] = await Promise.all([
        fetch('/api/games/predictions')
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
  const fases = Array.from(new Set(games.filter(g => !g.stage?.startsWith('Grupo')).map(g => g.stage)));

  // Filter games based on current active tab and active group
  const filteredGames = games.filter(game => {
    if (gameTab === 'grupo') {
      return game.stage === activeGroup;
    } else {
      return game.stage === activeStage;
    }
  });
  const rawStandings =
    gameTab === 'grupo' ? generateStandings(filteredGames) : {};

  const standings = Array.isArray(rawStandings)
    ? rawStandings
    : Object.values(rawStandings);

  console.log(rawStandings);

  return (
    <div className="space-y-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-950/60 pb-6">
        <div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Table2 className="text-amber-500 w-8 h-8" />
            Classificação <span className="gold-gradient-text">da Copa</span>
          </h1>

          <p className="text-slate-400 text-sm mt-1">
            Acompanhe a classificação ao vivo e veja como está a classificação da copa.
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
              {gameTab === 'matamata' && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {fases.map(groupName => (
                    <button
                      key={groupName}
                      onClick={() => setActiveStage(groupName)}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div id="classificacao" className="col-span-2 text-center  rounded-2xl text-slate-550">
                {gameTab === 'grupo' && standings.length > 0 && (
                  <div className="rounded-xl border glass-panel border-emerald-900/40 overflow-hidden">

                    <table className="w-full text-sm">
                      <thead className="bg-emerald-900/40 text-slate-300 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-3 py-2 text-center">#</th>
                          <th className="px-4 py-2 text-left">Time</th>
                          <th className="px-2 py-2 text-center">Pts</th>
                          <th className="px-2 py-2 text-center">J</th>
                          <th className="px-2 py-2 text-center">V</th>
                          <th className="px-2 py-2 text-center">E</th>
                          <th className="px-2 py-2 text-center">D</th>
                          <th className="px-2 py-2 text-center">SG</th>
                        </tr>
                      </thead>

                      <tbody>
                        {standings.map((team, index) => {
                          const isQualified = index < 2;

                          return (
                            <tr
                              key={`${team.team}-${index}`}
                              className={`
                  border-b border-slate-800 
                  transition-all
                  hover:bg-emerald-900/20
                  ${isQualified ? 'bg-emerald-950/30' : ''}
                `}
                            >
                              {/* Posição */}
                              <td className="text-center font-bold py-3">
                                <span
                                  className={`
                      inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold
                      ${index < 2 ? 'bg-yellow-400 text-black' : ''}
                      ${index === 2 ? 'bg-gray-300 text-black' : ''}
                      ${index > 2 ? 'bg-slate-700 text-slate-200' : ''}
                    `}
                                >
                                  {index + 1}
                                </span>
                              </td>

                              {/* Time */}
                              <td className="px-4 py-3 flex items-center gap-2 font-medium">
                                <span className="text-lg">{team.flag}</span>
                                <span>{team.team}</span>
                              </td>

                              {/* Estatísticas */}
                              <td className="text-center font-bold text-emerald-400">
                                {team.points}
                              </td>
                              <td className="text-center text-slate-300">{team.played}</td>
                              <td className="text-center text-green-400">{team.wins}</td>
                              <td className="text-center text-yellow-300">{team.draws}</td>
                              <td className="text-center text-red-400">{team.losses}</td>
                              <td
                                className={`text-center font-semibold ${team.goalDiff > 0
                                  ? 'text-green-400'
                                  : team.goalDiff < 0
                                    ? 'text-red-400'
                                    : 'text-slate-300'
                                  }`}
                              >
                                {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Legenda */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 px-4 py-3 bg-slate-900/60">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                        <span>Classificados</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
              <div className={`${gameTab === 'grupo' ? 'col-span-1' : 'col-span-3'} text-center flex flex-col gap-4 rounded-2xl text-slate-550`}>

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
                        className={`glass-panel mb-2 rounded-2xl p-5 border flex flex-col justify-between shadow-xl transition-all duration-300 `}
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
                        <div className={` flex items-center text-xs border-t border-emerald-950/35 pt-3 ${game.status === 'live' ? 'justify-between' : 'justify-center'}`}>
                          {/* Status selectors */}
                          {isLocked(game.date) && <button
                            onClick={() => {
                              setSelectedGame(game)
                            }}
                            className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 border border-emerald-800/30 hover:text-white transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" /> Palpites
                          </button>
                          }
                          {
                            game.status === 'live' &&
                            <div className="flex items-center gap-2 px-3 py-1  ">

                              {/* Bolinha animada */}
                              <span className="relative flex h-3 w-3">
                                {/* Animação pulse */}
                                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>

                                {/* Bolinha fixa */}
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.6)]"></span>
                              </span>

                              {/* Texto */}
                              <span className="tracking-wide">AO VIVO</span>
                            </div>


                          }

                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </>
      )}

      {selectedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl glass-panel shadow-2xl border border-emerald-900/60 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-emerald-950/60 bg-emerald-950/40">
              <div>
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Acompanhamento</span>
                <h3 className="text-xl font-black text-white mt-0.5">Palpites de {selectedGame.teamA} x {selectedGame.teamB}</h3>
              </div>
              <button
                onClick={() => setSelectedGame(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-emerald-950 transition-all font-bold text-sm"
              >
                ✕ Fechar
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">

              {games.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Nenhum jogo encontrado no sistema.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedGame.predictions.map((prediction) => {
                    return (
                      <div
                        key={selectedGame.id + prediction.player.name}
                        className={`flex flex-col p-4 rounded-xl border border-emerald-950/60 bg-black/20 `}
                      >
                        {/* Phase & Stadium */}
                        <div className="flex items-center justify-between  text-slate-400 mb-2">
                          <h4 className="font-black text-white mt-0.5 green-gradient-text">{prediction.player.name}</h4>

                        </div>

                        {/* Match Row */}
                        <div className="flex items-center justify-between py-2">
                          {/* Team A */}
                          <div className="flex items-center space-x-2 w-[40%]">
                            <span className="text-xl">{selectedGame.flagA}</span>
                            <span className="text-sm font-bold text-white">{selectedGame.teamA}</span>
                          </div>

                          {/* Prediction display */}
                          <div className="flex flex-col items-center justify-center w-[20%] text-center">
                            <div className="text-base font-extrabold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-800/40">
                              {prediction.goalsA} x {prediction.goalsB}
                            </div>
                          </div>

                          {/* Team B */}
                          <div className="flex items-center justify-end space-x-2 w-[40%]">
                            <span className="text-sm font-bold text-white">{selectedGame.teamB}</span>
                            <span className="text-xl">{selectedGame.flagB}</span>
                          </div>
                        </div>

                        {/* Status / Points Info */}
                        <div className={`mt-3 flex items-center  text-xs border-t border-emerald-950/30 pt-2.5 ${selectedGame.status === 'live' ? 'justify-between' : 'justify-center'}`}>
                          {selectedGame.status === 'live' ?
                            (<>
                              <div className="flex items-center  gap-2 px-3 py-1  ">

                                {/* Bolinha animada */}
                                <span className="relative flex h-3 w-3">
                                  {/* Animação pulse */}
                                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>

                                  {/* Bolinha fixa */}
                                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.6)]"></span>
                                </span>

                                {/* Texto */}
                                <span className="tracking-wide">AO VIVO</span>

                              </div>
                              <span className="text-red-500 font-black px-2 py-0.5 rounded">
                                +{prediction?.points || 0} pts {" (Pontuação parcial)"}
                              </span>
                            </>
                            )
                            : (
                              <span className={`font-black px-2 py-0.5 rounded ${prediction.points >= 3 ? 'text-amber-400' : prediction.points == 1 ? 'text-slate-400' : 'text-white'}`}>
                                +{prediction?.points || 0} pts
                              </span>
                            )
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-black/40 border-t border-emerald-950/60 text-right">
              <button
                onClick={() => setSelectedGame(null)}
                className="px-4 py-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold hover:bg-emerald-900 hover:text-white transition-all text-sm"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



