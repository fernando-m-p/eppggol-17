'use client';

import React, { useEffect, useState } from 'react';
import { Award, Eye, Calendar, Lock, Unlock, Trophy, CheckCircle, RefreshCw } from 'lucide-react';
import { FinalPrediction } from '@prisma/client';

interface Game {
  id: number;
  stadium: string;
  stage: string;
  date: string;
  teamA: string;
  teamB: string;
  flagA: string;
  flagB: string;
  abbrevA: string;
  abbrevB: string;
  goalsA: number | null;
  goalsB: number | null;
  status: string;
}

interface PlayerPrediction {
  gameId: number;
  goalsA: number;
  goalsB: number;
  points: number;
  isExact: boolean;
  isOutcome: boolean;
}

interface PlayerRanking {
  id: number;
  name: string;
  totalPoints: number;
  exactCount: number;
  outcomeCount: number;
  predictions: PlayerPrediction[];
  finalPredictions: FinalPrediction[];

}

export default function RankingPage() {
  const [ranking, setRanking] = useState<PlayerRanking[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerRanking | null>(null);

  const fetchData = async () => {
    try {
      const [rankingRes, gamesRes] = await Promise.all([
        fetch('/api/ranking'),
        fetch('/api/games')
      ]);
      const rankingData = await rankingRes.json();
      const gamesData = await gamesRes.json();

      setRanking(Array.isArray(rankingData) ? rankingData : []);
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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <p className="mt-4 text-slate-400 font-medium">Carregando classificação...</p>
      </div>
    );
  }

  // Split top 3 and others
  const podium = ranking.slice(0, 3);
  const remainder = ranking.slice(3);

  // Re-order podium for layout visual flow: 2nd place (left), 1st place (center), 3rd place (right)
  const sortedPodium = [];
  if (podium[0]) sortedPodium.push({ player: podium[0], rank: 1 });
  if (podium[1]) sortedPodium.push({ player: podium[1], rank: 2 });
  if (podium[2]) sortedPodium.push({ player: podium[2], rank: 3 });

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

      {ranking.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center max-w-lg mx-auto">
          <Award className="w-16 h-16 text-emerald-800/80 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum jogador cadastrado</h3>
          <p className="text-slate-400 text-sm">
            Os administradores ainda não adicionaram participantes a este bolão.
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto px-4">
            {sortedPodium.map(({ player, rank }) => {
              const heightClass = rank === 1 ? ' border-amber-500/40 bg-amber-950/10' : rank === 2 ? ' border-slate-400/30 bg-slate-900/10' : ' border-amber-750/30 bg-amber-950/5';
              const medalColor = rank === 1 ? 'bg-amber-500 text-black shadow-amber-500/30' : rank === 2 ? 'bg-slate-400 text-black shadow-slate-450/20' : 'bg-amber-700 text-white shadow-amber-800/20';
              const rankName = rank === 1 ? '1º Lugar' : rank === 2 ? '2º Lugar' : '3º Lugar';

              return (
                <div
                  key={player.id}
                  className={`relative flex flex-col justify-between p-6 rounded-2xl glass-panel border ${heightClass} shadow-xl text-center group hover:scale-[1.02] transition-all duration-300`}
                >
                  {/* Rank Badge */}
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${medalColor}`}>
                    {rank}
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{rankName}</p>
                    <h3 className="text-lg font-extrabold text-white mt-1 group-hover:text-emerald-400 transition-colors">
                      {player.name}
                    </h3>
                  </div>

                  <div className="my-4">
                    <span className="text-4xl font-extrabold text-white">{player.totalPoints}</span>
                    <span className="text-xs text-slate-400 font-semibold ml-1">pts</span>
                  </div>

                  <div className="flex justify-around text-xs border-t border-emerald-950/40 pt-3 text-slate-400">
                    <div>
                      <span className="block font-bold text-white">{player.exactCount}</span>
                      <span>Placares</span>
                    </div>
                    <div>
                      <span className="block font-bold text-white">{player.outcomeCount}</span>
                      <span>Resultados</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPlayer(player)}
                    className="mt-4 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900 hover:text-white transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" /> Ver Palpites
                  </button>
                </div>
              );
            })}
          </div>

          {/* Standings Table for remainder */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-emerald-950/60 shadow-xl">
            <div className="px-6 py-4 border-b border-emerald-950/60 bg-emerald-950/20">
              <h2 className="text-lg font-bold text-white">Líderes e Classificados</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-emerald-950/60 text-slate-400 text-xs font-bold uppercase tracking-wider bg-black/10">
                    <th className="py-4 px-6 text-center w-16">Pos</th>
                    <th className="py-4 px-6">Jogador</th>
                    <th className="py-4 px-6 text-center">Placares Exatos</th>
                    <th className="py-4 px-6 text-center">Apenas Resultados</th>
                    <th className="py-4 px-6 text-center">Total Pontos</th>
                    <th className="py-4 px-6 text-center w-32">Palpites</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-950/40">
                  {ranking.map((player, idx) => {
                    const isTop3 = idx < 3;
                    return (
                      <tr
                        key={player.id}
                        className={`hover:bg-emerald-950/10 transition-colors ${isTop3 ? 'bg-emerald-950/5' : ''
                          }`}
                      >
                        <td className="py-4 px-6 text-center font-bold text-sm">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${idx === 0 ? 'bg-amber-500/20 text-amber-400' :
                            idx === 1 ? 'bg-slate-400/20 text-slate-350' :
                              idx === 2 ? 'bg-amber-700/25 text-amber-600' : 'text-slate-400'
                            }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-white text-base">
                          {player.name}
                        </td>
                        <td className="py-4 px-6 text-center text-sm font-semibold text-slate-300">
                          {player.exactCount}
                        </td>
                        <td className="py-4 px-6 text-center text-sm font-semibold text-slate-300">
                          {player.outcomeCount}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="text-emerald-400 font-extrabold text-base">{player.totalPoints} pts</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => setSelectedPlayer(player)}
                            className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 border border-emerald-800/30 hover:text-white transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" /> Espiar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Transparency Modal Drawer */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl glass-panel shadow-2xl border border-emerald-900/60 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-emerald-950/60 bg-emerald-950/40">
              <div>
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Acompanhamento</span>
                <h3 className="text-xl font-black text-white mt-0.5">Palpites de {selectedPlayer.name}</h3>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-emerald-950 transition-all font-bold text-sm"
              >
                ✕ Fechar
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedPlayer.finalPredictions.length === 0 ? "" :
                <div className="flex-1 p-6 space-y-4">
                  <h2 >Palpites dos Campeões</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className='flex flex-col p-4 rounded-xl border border-emerald-950/60 bg-black/20'>
                      <p className='flex gap-8'><label>
                        Campeão:
                      </label>
                        {selectedPlayer.finalPredictions[0].campeao}
                      </p>
                    </div>
                    <div className='flex flex-col p-4 rounded-xl border border-emerald-950/60 bg-black/20'>
                      <p className='flex gap-8'><label>
                        Vice:
                      </label>
                        {selectedPlayer.finalPredictions[0].segundo}
                      </p></div>
                    <div className='flex flex-col p-4 rounded-xl border border-emerald-950/60 bg-black/20'>
                      <p className='flex gap-8'><label>
                        3º Colocado:
                      </label>
                        {selectedPlayer.finalPredictions[0].terceiro}
                      </p></div>

                  </div>

                </div>}
              {games.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Nenhum jogo encontrado no sistema.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {games.map((game) => {
                    const prediction = selectedPlayer.predictions.find(p => p.gameId === game.id);
                    const locked = isLocked(game.date);
                    const isFinished = game.status === 'finished';

                    return (
                      <div
                        key={game.id}
                        className={`flex flex-col p-4 rounded-xl border ${isFinished
                          ? prediction?.isExact
                            ? 'border-amber-500/20 bg-amber-500/[0.02]'
                            : prediction?.isOutcome
                              ? 'border-emerald-500/20 bg-emerald-500/[0.01]'
                              : 'border-slate-800/40 bg-black/10'
                          : 'border-emerald-950/60 bg-black/20'
                          }`}
                      >
                        {/* Phase & Stadium */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-2">
                          <span className="bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/20 text-emerald-400">
                            {game.stage}
                          </span>
                          <span className="truncate max-w-[150px]" title={game.stadium}>
                            📍 {game.stadium.split('(')[0]}
                          </span>
                        </div>

                        {/* Match Row */}
                        <div className="flex items-center justify-between py-2">
                          {/* Team A */}
                          <div className="flex items-center space-x-2 w-[40%]">
                            <span className="text-xl">{game.flagA}</span>
                            <span className="text-sm font-bold text-white">{game.abbrevA}</span>
                          </div>

                          {/* Prediction display */}
                          <div className="flex flex-col items-center justify-center w-[20%] text-center">
                            {locked ? (
                              prediction ? (
                                <div className="text-base font-extrabold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-800/40">
                                  {prediction.goalsA} x {prediction.goalsB}
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-500 font-bold bg-slate-900/60 px-2 py-1 rounded">
                                  Sem palpite
                                </div>
                              )
                            ) : (
                              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold bg-emerald-950/10 px-2 py-1 rounded border border-emerald-950/30">
                                <Lock className="w-3 h-3 text-slate-500" /> Oculto
                              </div>
                            )}
                          </div>

                          {/* Team B */}
                          <div className="flex items-center justify-end space-x-2 w-[40%]">
                            <span className="text-sm font-bold text-white">{game.abbrevB}</span>
                            <span className="text-xl">{game.flagB}</span>
                          </div>
                        </div>

                        {/* Status / Points Info */}
                        <div className="mt-3 flex items-center justify-between text-xs border-t border-emerald-950/30 pt-2.5">
                          {isFinished ? (
                            <>
                              <span className="text-slate-400 flex items-center gap-1 font-semibold">
                                <CheckCircle className="w-3 h-3 text-emerald-500" />
                                Real: {game.goalsA} x {game.goalsB}
                              </span>
                              <span className={`font-black px-2 py-0.5 rounded ${prediction?.isExact
                                ? 'bg-amber-500/20 text-amber-400'
                                : prediction?.isOutcome
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-slate-900 text-slate-500'
                                }`}>
                                +{prediction?.points || 0} pts
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-slate-500 text-[10px] flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDateTime(game.date)}
                              </span>
                              {locked ? (
                                <span className="text-[10px] text-slate-400 font-bold bg-slate-800/40 px-2 py-0.5 rounded flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" /> Bloqueado
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-500 font-bold bg-emerald-950/20 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-900/30">
                                  <Unlock className="w-2.5 h-2.5 text-emerald-400" /> Aberto
                                </span>
                              )}
                            </>
                          )}
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
                onClick={() => setSelectedPlayer(null)}
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
