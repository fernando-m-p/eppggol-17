'use client';

import React, { useEffect, useState } from 'react';
import { Lock, Unlock, Copy, Check, Trash2, UserPlus, RefreshCw, AlertCircle, Save, Loader2, Calendar } from 'lucide-react';

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

interface Player {
  id: number;
  uid: string;
  name: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Admin tabs: "jogadores" | "jogos"
  const [adminTab, setAdminTab] = useState<'jogadores' | 'jogos'>('jogadores');

  // Player management states
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [creatingPlayer, setCreatingPlayer] = useState(false);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  // Game management states
  const [games, setGames] = useState<Game[]>([]);
  const [editScores, setEditScores] = useState<{ [gameId: number]: { goalsA: string; goalsB: string; status: string } }>({});
  const [savingGameId, setSavingGameId] = useState<number | null>(null);

  // Group filter for admin games tab
  const [gameTab, setGameTab] = useState<'grupo' | 'matamata'>('grupo');
  const [activeGroup, setActiveGroup] = useState<string>('Grupo A');

  // Check stored password in localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('eppggol_admin_pw');
    if (stored) {
      setPassword(stored);
      // Validate automatically
      validatePassword(stored);
    }
  }, []);

  const validatePassword = async (pw: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Try to fetch players as a test of authorization (using dummy POST or check API)
      // Since POST /api/users needs password, we can make a check call
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '', password: pw }) // sending empty name will return 400 if authorized, 401 if wrong pw
      });

      if (res.status === 401) {
        setIsAuthorized(false);
        setErrorMsg('Senha incorreta.');
        localStorage.removeItem('eppggol_admin_pw');
      } else {
        // 400 means name is required (password is correct!)
        // 200 means success (shouldn't happen with empty name)
        setIsAuthorized(true);
        localStorage.setItem('eppggol_admin_pw', pw);
        fetchAdminData(pw);
      }
    } catch (e) {
      setErrorMsg('Erro de conexão ao validar senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Digite a senha.');
      return;
    }
    validatePassword(password);
  };

  const fetchAdminData = async (pw: string) => {
    setRefreshing(true);
    try {
      // Fetch players and games
      const [ranking, playersRes, gamesRes] = await Promise.all([
        fetch('/api/ranking'), // ranking includes basic list, but wait, ranking excludes UIDs!
        // To manage players, we need UIDs to generate links!
        // Let's check: we need player UIDs. We can write a special endpoint or modify ranking / users.
        // Wait, did we return UIDs in the users route or somewhere?
        // Ah! In ranking route, we omitted UIDs. Let's verify: does our GET /api/users return all users with UIDs?
        // Let's create an admin endpoint or modify `/api/users` GET to return ALL players with UIDs if admin password is provided!
        // That is an excellent security measure! Let's check: in GET `/api/users`, if no `uid` is passed but a `password` parameter is provided, we can return the entire players list WITH UIDs!
        // Yes, this is a clean, secure approach. Let's make sure `/api/users?password=PW` returns all players with UIDs.
        // Let's implement that in `/api/users/route.ts` next, but for now let's write `/api/users?password=${pw}` fetch here.
        fetch(`/api/users?password=${pw}`),
        fetch('/api/games')
      ]);

      if (playersRes.status === 401) {
        setIsAuthorized(false);
        localStorage.removeItem('eppggol_admin_pw');
        return;
      }

      const playersData = await playersRes.json();
      const gamesData = await gamesRes.json();

      setPlayers(Array.isArray(playersData) ? playersData : []);
      setGames(Array.isArray(gamesData) ? gamesData : []);

      // Populate edit scores state
      const scoresMap: typeof editScores = {};
      gamesData.forEach((game: Game) => {
        scoresMap[game.id] = {
          goalsA: game.goalsA != null ? String(game.goalsA) : '',
          goalsB: game.goalsB != null ? String(game.goalsB) : '',
          status: game.status
        };
      });
      setEditScores(scoresMap);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    setCreatingPlayer(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlayerName.trim(), password })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao criar jogador');
      } else {
        setNewPlayerName('');
        fetchAdminData(password);
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao criar jogador');
    } finally {
      setCreatingPlayer(false);
    }
  };

  const handleDeletePlayer = async (playerId: number) => {
    if (!confirm('Deseja realmente excluir este jogador? Todos os seus palpites serão apagados permanentemente!')) return;

    try {
      const res = await fetch(`/api/users?id=${playerId}&password=${password}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao excluir jogador');
      } else {
        fetchAdminData(password);
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao excluir jogador');
    }
  };

  const handleGameScoreChange = (gameId: number, team: 'A' | 'B', value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) return;
    setEditScores(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        goalsA: team === 'A' ? value : prev[gameId].goalsA,
        goalsB: team === 'B' ? value : prev[gameId].goalsB
      }
    }));
  };

  const handleGameStatusChange = (gameId: number, status: string) => {
    setEditScores(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        status
      }
    }));
  };

  const handleSaveGame = async (gameId: number) => {
    const edit = editScores[gameId];
    if (!edit) return;

    setSavingGameId(gameId);
    try {
      const goalsA = edit.goalsA === '' ? null : parseInt(edit.goalsA);
      const goalsB = edit.goalsB === '' ? null : parseInt(edit.goalsB);

      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          goalsA,
          goalsB,
          status: edit.status,
          password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao salvar jogo');
      } else {
        // Update games list locally to show new goals
        setGames(prev =>
          prev.map(g => (g.id === gameId ? { ...g, goalsA, goalsB, status: edit.status } : g))
        );
        alert('Partida e pontuações atualizadas com sucesso!');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao salvar jogo');
    } finally {
      setSavingGameId(null);
    }
  };

  const copyToClipboard = (uid: string) => {
    const url = `${window.location.origin}/palpite/${uid}`;
    navigator.clipboard.writeText(url);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('eppggol_admin_pw');
    setIsAuthorized(false);
    setPassword('');
  };

  if (!isAuthorized) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md p-8 glass-panel rounded-2xl border border-emerald-950/60 shadow-2xl relative">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-4">
              <Lock className="text-emerald-450 w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white">Acesso Restrito</h1>
            <p className="text-slate-400 text-xs mt-1">
              Digite a senha de administrador para gerenciar o bolão.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Senha de Acesso</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha..."
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/60 focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600 transition-colors text-sm"
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/30 border border-red-900/30 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-extrabold transition-all text-sm shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" /> Validando...
                </>
              ) : (
                'Desbloquear Painel'
              )}
            </button>
          </form>
        </div>
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
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-950/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Unlock className="text-emerald-500 w-8 h-8" />
            Painel do <span className="green-gradient-text font-black">Administrador</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Cadastre jogadores, copie links de palpites e lance os resultados das partidas.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchAdminData(password)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-xs text-emerald-400 font-semibold hover:bg-emerald-900 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sincronizar
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg border border-red-950 bg-red-950/20 text-xs text-red-400 font-semibold hover:bg-red-950/50 hover:text-white transition-all"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Main Admin Tabs */}
      <div className="flex border-b border-emerald-950/60 gap-6">
        <button
          onClick={() => setAdminTab('jogadores')}
          className={`pb-3 text-base font-bold transition-all relative ${adminTab === 'jogadores' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
        >
          Gerenciar Jogadores
          {adminTab === 'jogadores' && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500"></span>
          )}
        </button>
        <button
          onClick={() => setAdminTab('jogos')}
          className={`pb-3 text-base font-bold transition-all relative ${adminTab === 'jogos' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
        >
          Lançar Resultados
          {adminTab === 'jogos' && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500"></span>
          )}
        </button>
      </div>

      {/* Admin Tab Contents */}
      {adminTab === 'jogadores' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Player Card */}
          <div className="lg:col-span-1 glass-panel rounded-2xl p-6 border border-emerald-950/60 shadow-xl h-fit">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-450" /> Cadastrar Jogador
            </h2>
            <form onSubmit={handleCreatePlayer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Nome do participante..."
                  className="w-full px-4 py-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/60 focus:outline-none focus:border-emerald-500 text-white placeholder-slate-650 transition-colors text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={creatingPlayer || !newPlayerName.trim()}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold transition-all text-sm"
              >
                {creatingPlayer ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" /> Salvando...
                  </>
                ) : (
                  'Criar Jogador'
                )}
              </button>
            </form>
          </div>

          {/* Players List Card */}
          <div className="lg:col-span-2 glass-panel rounded-2xl border border-emerald-950/60 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-emerald-950/60 bg-emerald-950/20">
              <h2 className="text-lg font-bold text-white">Participantes Ativos ({players.length})</h2>
            </div>

            {players.length === 0 ? (
              <p className="text-center text-slate-500 py-12 text-sm">Nenhum jogador cadastrado ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-emerald-950/60 text-slate-450 text-xs font-bold uppercase tracking-wider bg-black/10">
                      <th className="py-4 px-6">Jogador</th>
                      <th className="py-4 px-6">Link Exclusivo de Palpites</th>
                      <th className="py-4 px-6 text-center w-24">Excluir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-950/40">
                    {players.map((p) => {
                      const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/palpite/${p.uid}`;
                      return (
                        <tr key={p.id} className="hover:bg-emerald-950/10 transition-colors">
                          <td className="py-4 px-6 font-bold text-white">{p.name}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 max-w-[280px] sm:max-w-md bg-emerald-950/30 border border-emerald-900/40 rounded-lg py-1 px-2">
                              <span className="text-xs text-emerald-500 truncate select-all flex-1">{url}</span>
                              <button
                                onClick={() => copyToClipboard(p.uid)}
                                className="text-slate-400 hover:text-white p-1 rounded hover:bg-emerald-900/40 transition-all shrink-0"
                                title="Copiar link"
                              >
                                {copiedUid === p.uid ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => handleDeletePlayer(p.id)}
                              className="text-slate-500 hover:text-red-400 p-1.5 rounded hover:bg-red-950/20 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
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
            {filteredGames.length === 0 ? (
              <div className="col-span-full text-center py-10 glass-panel rounded-2xl text-slate-550">
                Nenhum jogo nesta categoria.
              </div>
            ) : (
              filteredGames.map((game) => {
                const edit = editScores[game.id] || { goalsA: '', goalsB: '', status: 'scheduled' };
                const isSaving = savingGameId === game.id;

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
                    className={`glass-panel rounded-2xl p-5 border flex flex-col justify-between shadow-xl transition-all duration-300 ${edit.status === 'finished'
                      ? 'border-emerald-500/20 bg-emerald-500/[0.01]'
                      : edit.status === 'live'
                        ? 'border-amber-500/20 bg-amber-500/[0.01]'
                        : 'border-emerald-950/60 bg-black/25'
                      }`}
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
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={edit.goalsA}
                          onChange={(e) => handleGameScoreChange(game.id, 'A', e.target.value)}
                          placeholder="-"
                          className="w-10 h-10 rounded-xl bg-emerald-950/30 border border-emerald-900/60 text-center font-black text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                        <span className="text-slate-600 font-bold">x</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={edit.goalsB}
                          onChange={(e) => handleGameScoreChange(game.id, 'B', e.target.value)}
                          placeholder="-"
                          className="w-10 h-10 rounded-xl bg-emerald-950/30 border border-emerald-900/60 text-center font-black text-white focus:outline-none focus:border-emerald-500 transition-colors"
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

                    {/* Status updater and action button */}
                    <div className="mt-4 flex items-center justify-between text-xs border-t border-emerald-950/35 pt-3">
                      {/* Status selectors */}
                      <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-emerald-950">
                        {['scheduled', 'live', 'finished'].map((st) => {
                          const active = edit.status === st;
                          const name = st === 'scheduled' ? 'Agendado' : st === 'live' ? 'Ao Vivo 🔴' : 'Encerrado';
                          return (
                            <button
                              key={st}
                              onClick={() => handleGameStatusChange(game.id, st)}
                              className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${active
                                ? st === 'finished'
                                  ? 'bg-emerald-500 text-black'
                                  : st === 'live'
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'bg-slate-800 text-white'
                                : 'text-slate-500 hover:text-slate-350'
                                }`}
                            >
                              {name}
                            </button>
                          );
                        })}
                      </div>

                      {/* Save Button */}
                      <button
                        onClick={() => handleSaveGame(game.id)}
                        disabled={isSaving}
                        className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-extrabold transition-all text-xs"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="animate-spin w-3 h-3" /> Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" /> Salvar Placar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
