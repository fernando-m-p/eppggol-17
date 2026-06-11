'use client';

import React, { useEffect, useState, use } from 'react';
import { useParams } from 'next/navigation';
import { Lock, Unlock, Check, AlertCircle, Loader2, Save, Trophy, Calendar } from 'lucide-react';

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
interface FinalPrediction {
  id: number;
  uid: string;
  campeao: string;
  segundo: string;
  terceiro: string;
  points: number;
}

interface Prediction {
  id: number;
  gameId: number;
  goalsA: number;
  goalsB: number;
  points: number;
}

interface Player {
  id: number;
  uid: string;
  name: string;
  predictions: Prediction[];
  finalPredictions: FinalPrediction[];
}

export default function PlayerPalpitePage() {
  const params = useParams();
  const uid = Array.isArray(params.uid) ? params.uid[0] : params.uid;

  const [player, setPlayer] = useState<Player | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lockCampPalpite, setlockCampPalpite] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ [gameId: number]: 'idle' | 'saving' | 'saved' | 'error' }>({});
  const [saveCampStatus, setSaveCampStatus] = useState<{ [uid: string]: 'idle' | 'saving' | 'saved' | 'error' }>({});
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Local state for predictions: gameId -> { goalsA, goalsB }
  const [localPreds, setLocalPreds] = useState<{ [gameId: number]: { goalsA: string; goalsB: string } }>({});
  // Local state for predictions: uid -> { campeao, segundo, terceiro }
  const [localCampPreds, setLocalCampPreds] = useState<{ [uid: string]: { campeao: string, segundo: string, terceiro: string } }>({});


  // Filter stage state: "Grupo" or "Mata-Mata"
  const [activeTab, setActiveTab] = useState<'grupo' | 'matamata'>('grupo');
  // Selected sub-group filter (A to L)
  const [activeGroup, setActiveGroup] = useState<string>('Grupo A');

  const fetchData = async () => {
    try {
      const [playerRes, gamesRes, teamsRes] = await Promise.all([
        fetch(`/api/users?uid=${uid}`),
        fetch('/api/games'),
        fetch('/api/teams'),
      ]);

      if (!playerRes.ok) {
        throw new Error('Jogador não encontrado');
      }

      const playerData = await playerRes.json();
      const gamesData = await gamesRes.json();
      const teamsData = await teamsRes.json();
      setPlayer(playerData);
      setGames(Array.isArray(gamesData) ? gamesData : []);
      setTeams(teamsData);
      // Populate local predictions map
      const predsMap: { [gameId: number]: { goalsA: string; goalsB: string } } = {};
      (playerData.predictions ?? []).forEach((pred: Prediction) => {
        predsMap[pred.gameId] = {
          goalsA: pred.goalsA.toString(),
          goalsB: pred.goalsB.toString()
        };
      });
      setLocalPreds(predsMap);
      setlockCampPalpite(getCountdown(campDate) != 'Jogo iniciado');
      const preadsCMap: { [uid: string]: { campeao: string, segundo: string, terceiro: string } } = {};
      (playerData.finalPredictions ?? []).forEach((predC: FinalPrediction) => {
        preadsCMap[playerData.uid] = {
          campeao: predC.campeao,
          segundo: predC.segundo,
          terceiro: predC.terceiro,
        }
      })
      setLocalCampPreds(preadsCMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {

    if (uid) {
      fetchData();
    }

  }, [uid]);

  const isLocked = (kickoffDate: string) => {
    const kickoff = new Date(kickoffDate).getTime();
    const now = Date.now();
    const tenMinutesInMs = 10 * 60 * 1000;
    return now >= (kickoff - tenMinutesInMs);
  };
  const campDate = "2026-06-10T23:59:59"; // Example date for championship prediction deadline

  const getCountdown = (dateStr: string) => {
    const target = new Date(dateStr).getTime() - (10 * 60 * 1000); // 10 minutes before kickoff;
    const diff = target - currentTime;

    if (diff <= 0) {

      return 'Jogo iniciado';

    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
  };

  // Debounced/Triggered save function
  const savePrediction = async (gameId: number, goalsAStr: string, goalsBStr: string) => {
    if (goalsAStr === '' || goalsBStr === '') return;

    setSaveStatus(prev => ({ ...prev, [gameId]: 'saving' }));

    try {
      const res = await fetch('/api/palpites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          gameId,
          goalsA: parseInt(goalsAStr),
          goalsB: parseInt(goalsBStr)
        })
      });

      if (!res.ok) {
        throw new Error('Erro ao salvar palpite');
      }

      setSaveStatus(prev => ({ ...prev, [gameId]: 'saved' }));
      // Transition back to idle after 2 seconds
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [gameId]: 'idle' }));
      }, 2000);
    } catch (e) {
      console.error(e);
      setSaveStatus(prev => ({ ...prev, [gameId]: 'error' }));
    }
  };

  // Debounced/Triggered save function
  const saveCampPrediction = async (uid: string, campeao: string, segundo: string, terceiro: string) => {
    // if (campeao === '' || segundo === '' || terceiro === '') return;

    setSaveCampStatus(prev => ({ ...prev, [uid]: 'saving' }));

    try {
      const res = await fetch('/api/campeoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          campeao,
          segundo,
          terceiro
        })
      });

      if (!res.ok) {
        throw new Error('Erro ao salvar palpite');
      }

      setSaveCampStatus(prev => ({ ...prev, [uid]: 'saved' }));
      // Transition back to idle after 2 seconds
      setTimeout(() => {
        setSaveCampStatus(prev => ({ ...prev, [uid]: 'idle' }));
      }, 2000);
    } catch (e) {
      console.error(e);
      setSaveCampStatus(prev => ({ ...prev, [uid]: 'error' }));
    }
  };



  const handleInputChange = (gameId: number, team: 'A' | 'B', value: string) => {
    // Only allow numbers or empty string
    if (value !== '' && !/^\d+$/.test(value)) return;

    setLocalPreds(prev => {
      const current = prev[gameId] || { goalsA: '', goalsB: '' };
      const updated = {
        ...current,
        goalsA: team === 'A' ? value : current.goalsA,
        goalsB: team === 'B' ? value : current.goalsB
      };

      // Auto-save if both fields have values
      if (updated.goalsA !== '' && updated.goalsB !== '') {
        savePrediction(gameId, updated.goalsA, updated.goalsB);
      }

      return {
        ...prev,
        [gameId]: updated
      };
    });
  };

  const handleCampChange = (uid: string, campeao: string, segundo: string, terceiro: string) => {
    // Only allow numbers or empty string
    setLocalCampPreds(prev => {
      const current = prev[uid] || { campeao: '', segundo: '', terceiro: '' };
      const updated = {
        ...current,
        campeao: campeao,
        segundo: segundo,
        terceiro: terceiro
      };

      // Auto-save if both fields have values
      if (updated.campeao !== '' || updated.segundo !== '' || updated.terceiro !== '') {
        saveCampPrediction(uid, updated.campeao, updated.segundo, updated.terceiro);
      }

      return {
        ...prev,
        [uid]: updated
      };
    });
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin h-12 w-12 text-emerald-500" />
        <p className="mt-4 text-slate-400 font-medium">Carregando seus palpites...</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center max-w-lg mx-auto border border-red-500/20">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Link Inválido</h3>
        <p className="text-slate-400 text-sm">
          Este link de acesso ao bolão não existe ou foi removido. Verifique com os administradores.
        </p>
      </div>
    );
  }

  // Calculate stats
  const totalPoints = player.predictions.reduce((acc, pred) => acc + (pred.points ?? 0), 0) + player.finalPredictions.reduce((acc, pred) => acc + (pred.points ?? 0), 0);

  // Group filter list (Group A to L)
  const groupNames = Array.from(new Set(games.filter(g => (g.stage ?? '').startsWith('Grupo')).map(g => g.stage))).sort();

  // Filter games based on current active tab and active group
  const filteredGames = (games ?? []).filter(game => {
    if (activeTab === 'grupo') {
      return game.stage === activeGroup;
    } else {
      return !game.stage.startsWith('Grupo');
    }
  });


  return (
    <div className="space-y-8">
      {/* Player Header Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border border-emerald-950/60 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/30">
            Link Exclusivo de Palpites
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-3">Olá, {player.name}!</h1>
          <p className="text-slate-400 text-xs mt-1 max-w-lg">
            Os palpites salvam automaticamente ao digitar. Os jogos são bloqueados para edição exatamente **10 minutos antes** do início.
          </p>
        </div>

        {/* Total Points Display */}
        <div className="flex items-center gap-4 bg-emerald-950/30 border border-emerald-900/40 p-4 rounded-2xl sm:min-w-[180px] justify-center shadow-lg">
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
            <Trophy className="text-amber-500 w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Seus Pontos</span>
            <span className="text-2xl font-black text-white">{totalPoints} <span className="text-xs font-bold text-slate-400">pts</span></span>
          </div>
        </div>
      </div>
      <div className="glass-panel rounded-2xl p-6 sm:p-8 flex flex-col gap-6 border border-emerald-950/60 shadow-2xl relative overflow-hidden">

        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/30">
            Palpites dos campeões
          </span>
          <div className="flex gap-4 flex-col sm:flex-row items-start text-slate-400 text-xs mt-1">

            {/* Campeão */}
            <div className="flex w-full flex-col items-center gap-1">
              <label className="text-[10px] font-bold text-slate-400">
                Campeão
              </label>
              <select
                disabled={!lockCampPalpite}
                value={localCampPreds[uid ?? ""]?.campeao ?? ""}
                onChange={(e) =>
                  handleCampChange(
                    uid ?? "",
                    e.target.value,
                    localCampPreds[uid ?? ""]?.segundo ?? "",
                    localCampPreds[uid ?? ""]?.terceiro ?? ""
                  )
                }
                className="w-full md:w-40 h-10 rounded-xl bg-emerald-950/30 border border-emerald-900/60 text-white text-center font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="" disabled>
                  Selecione
                </option>

                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>

            </div>

            {/* Segundo Lugar */}
            <div className="flex w-full flex-col items-center gap-1">
              <label className="text-[10px] font-bold text-slate-400">
                Segundo Lugar
              </label>
              <select
                disabled={!lockCampPalpite}
                value={localCampPreds[uid ?? ""]?.segundo ?? ""}
                onChange={(e) =>
                  handleCampChange(
                    uid ?? "",
                    localCampPreds[uid ?? ""]?.campeao ?? "",
                    e.target.value,
                    localCampPreds[uid ?? ""]?.terceiro ?? ""
                  )
                }
                className="w-full md:w-40 h-10 rounded-xl bg-emerald-950/30 border border-emerald-900/60 text-white text-center font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="" disabled>
                  Selecione
                </option>

                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>

            {/* Terceiro Lugar */}
            <div className="flex w-full flex-col items-center gap-1">
              <label className=" text-[10px] font-bold text-slate-400">
                Terceiro Lugar
              </label>
              <select
                value={localCampPreds[uid ?? ""]?.terceiro ?? ""}
                disabled={!lockCampPalpite}
                onChange={(e) =>
                  handleCampChange(
                    uid ?? "",
                    localCampPreds[uid ?? ""]?.campeao ?? "",
                    localCampPreds[uid ?? ""]?.segundo ?? "",
                    e.target.value,
                  )
                }
                className="w-full md:w-40 h-10 rounded-xl bg-emerald-950/30 border border-emerald-900/60 text-white text-center font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="" disabled>
                  Selecione
                </option>

                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>

          </div>
          {lockCampPalpite && (
            <div className="flex flex-col gap-4 items-start justify-center mt-4 sm:flex-row text-2xl text-slate-400">
              <span className="text-accent font-bold mt-1">
                ⏳ Palpite dos campeões fecha em {getCountdown(campDate)}
              </span>
            </div>
          )}
          {!lockCampPalpite && (
            <div className="flex flex-col gap-4 items-start justify-center mt-4 sm:flex-row text-2xl text-slate-400">
              <span className="text-red font-bold mt-1">
                ⏳ Palpite dos campeões encerrado
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Tabs */}
      <div className="flex flex-col space-y-4">
        <div className="flex border-b border-emerald-950/60 gap-4">
          <button
            onClick={() => setActiveTab('grupo')}
            className={`pb-3 text-base font-bold transition-all relative ${activeTab === 'grupo' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
          >
            Fase de Grupos
            {activeTab === 'grupo' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('matamata')}
            className={`pb-3 text-base font-bold transition-all relative ${activeTab === 'matamata' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
          >
            Fase Eliminatória (Mata-Mata)
            {activeTab === 'matamata' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500"></span>
            )}
          </button>
        </div>

        {/* Sub-groups (A-L) for group tab */}
        {activeTab === 'grupo' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {groupNames.map(groupName => (
              <button
                key={groupName}
                onClick={() => setActiveGroup(groupName)}
                className={`px-3.y py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${activeGroup === groupName
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

      {/* Games prediction grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGames.length === 0 ? (
          <div className="col-span-full text-center py-10 glass-panel rounded-2xl text-slate-500">
            Nenhum jogo nesta categoria.
          </div>
        ) : (
          filteredGames.map(game => {
            const locked = isLocked(game.date);
            const isFinished = game.status === 'finished';

            // Get prediction points
            const dbPred = player.predictions.find(p => p.gameId === game.id);
            const status = saveStatus[game.id] || 'idle';

            const pred = localPreds[game.id] || { goalsA: '', goalsB: '' };

            return (
              <div
                key={game.id}
                className={`glass-panel rounded-2xl p-5 border flex flex-col justify-between shadow-xl relative overflow-hidden transition-all duration-300 ${isFinished
                  ? dbPred?.points && dbPred.points > 1
                    ? 'border-amber-500/20 bg-amber-500/[0.01]'
                    : dbPred?.points && dbPred.points === 1
                      ? 'border-emerald-500/20 bg-emerald-500/[0.01]'
                      : 'border-slate-800 bg-black/10'
                  : locked
                    ? 'border-slate-900/60 bg-black/10'
                    : 'border-emerald-950 hover:border-emerald-800/40 bg-black/20'
                  }`}
              >
                {/* Top Info Header */}
                <div className="flex items-center justify-between border-b border-emerald-950/40 pb-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/20 text-emerald-400 font-bold">
                      {game.stage}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[180px]">
                      📍 {(game.stadium ?? '').split('(')[0]}
                    </span>
                  </div>

                  {/* Lock Indicator / Date */}
                  <div className="flex items-center gap-1">
                    {isFinished ? (
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded flex items-center gap-1">
                        Encerrado
                      </span>
                    ) : locked ? (
                      <span className="text-[10px] text-red-400 font-bold bg-red-950/30 border border-red-900/20 px-2 py-0.5 rounded flex items-center gap-1">
                        <Lock className="w-3 h-3 text-red-500" /> Bloqueado
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/20 px-2 py-0.5 rounded flex items-center gap-1">
                        <Unlock className="w-3 h-3 text-emerald-450" /> Aberto
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Score Editor Row */}
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
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={pred.goalsA}
                      onChange={(e) => handleInputChange(game.id, 'A', e.target.value)}
                      disabled={locked || isFinished}
                      placeholder="-"
                      className="w-10 h-10 rounded-xl bg-emerald-950/30 border border-emerald-900/60 text-center font-black text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:bg-slate-950/60 disabled:border-slate-800"
                    />
                    <span className="text-slate-600 font-bold">x</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={pred.goalsB}
                      onChange={(e) => handleInputChange(game.id, 'B', e.target.value)}
                      disabled={locked || isFinished}
                      placeholder="-"
                      className="w-10 h-10 rounded-xl bg-emerald-950/30 border border-emerald-900/60 text-center font-black text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:bg-slate-950/60 disabled:border-slate-800"
                    />
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

                {/* Footer Info / Autosave / Result */}
                <div className="mt-4 flex items-center justify-between text-xs border-t border-emerald-950/30 pt-3">
                  <div className="w-33 text-[10px] text-slate-550 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateTime(game.date)}


                  </div>

                  <button
                    disabled={locked || isFinished}
                    onClick={(e) => {
                      handleInputChange(game.id, 'B', Math.floor(Math.random() * 6).toString())
                      handleInputChange(game.id, 'A', Math.floor(Math.random() * 6).toString())
                    }}
                    className="w-33 px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold"
                  >
                    🎲 Aleatório
                  </button>
                  <div></div>
                  <div>
                    {isFinished ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                          Placar Real: {game.goalsA} x {game.goalsB}
                        </span>
                        <span className={`font-black px-2 py-0.5 rounded text-xs ${dbPred?.points && dbPred.points > 1
                          ? 'bg-amber-500/20 text-amber-400'
                          : dbPred?.points && dbPred.points === 1
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-900 text-slate-500'
                          }`}>
                          +{dbPred?.points || 0} pts
                        </span>
                      </div>
                    ) : (
                      <div className="min-h-[20px] flex items-center">
                        {status === 'saving' && (
                          <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Salvando...
                          </span>
                        )}
                        {status === 'saved' && (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
                            <Check className="w-3 h-3" /> Salvo!
                          </span>
                        )}
                        {status === 'error' && (
                          <span className="text-[10px] font-bold text-red-400 flex items-center gap-1 bg-red-950/20 px-2 py-0.5 rounded border border-red-900/30">
                            <AlertCircle className="w-3 h-3" /> Falha ao salvar
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-emerald-950/30 border-t flex items-center justify-center pt-3">
                  {isFinished ? (
                    <span className="text-red font-bold mt-1">
                      Palpite fechado
                    </span>
                  ) :
                    (
                      <span className="text-accent font-bold mt-1">
                        ⏳ Palpite fecha em {getCountdown(game.date)}
                      </span>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div >
  );
}
