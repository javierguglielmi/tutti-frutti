'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RoomState, Player, ThemeId } from '@/lib/types';
import { THEMES, DEFAULT_CATEGORIES } from '@/lib/constants';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Users,
  Clock,
  Play,
  Check,
  X,
  Settings2,
  Plus,
  Share2,
  Lock,
  UserX,
  AlertTriangle
} from 'lucide-react';

const LETTERS = 'ABCDEFGHIJLMNOPQRSTUV';

interface PageProps {
  params: {
    roomId: string;
  };
}

export default function RoomPage({ params }: PageProps) {
  const roomId = params.roomId;
  const router = useRouter();

  const [currentTheme, setCurrentTheme] = useState<ThemeId>('dark');
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [channel, setChannel] = useState<any>(null);

  const [isBanned, setIsBanned] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [isPinValidated, setIsPinValidated] = useState(false);
  const [pinError, setPinError] = useState(false);

  const [roomState, setRoomState] = useState<RoomState>({
    roomId,
    pin: undefined,
    hostId: '',
    phase: 'lobby',
    currentRound: 1,
    currentLetter: '',
    usedLetters: [],
    settings: {
      roundDuration: 60,
      totalRounds: 5,
      categories: [...DEFAULT_CATEGORIES],
    },
    players: [],
    bannedPlayerIds: [],
    results: {},
    stoppedBy: null,
  });

  const [myAnswers, setMyAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [rouletteLetter, setRouletteLetter] = useState('A');
  const [newCatInput, setNewCatInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('tf_theme') as ThemeId;
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const changeTheme = (newTheme: ThemeId) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('tf_theme', newTheme);
  };

  const t = THEMES[currentTheme] || THEMES.dark;

  useEffect(() => {
    const saved = localStorage.getItem('tf_player');
    if (!saved) {
      router.push('/');
      return;
    }
    const parsed = JSON.parse(saved);
    const player: Player = {
      id: Math.random().toString(36).substring(2, 9),
      name: parsed.name,
      avatar: parsed.avatar,
      isHost: Boolean(parsed.isHost),
      score: 0,
    };
    setCurrentUser(player);

    if (parsed.isHost && parsed.createdPin) {
      setRoomState((prev) => ({
        ...prev,
        pin: parsed.createdPin,
        hostId: player.id,
      }));
      setIsPinValidated(true);
    } else if (parsed.enteredPin) {
      setEnteredPin(parsed.enteredPin);
    }
  }, [router]);

  useEffect(() => {
    if (!currentUser) return;

    const ch = supabase.channel('room:' + roomId, {
      config: {
        presence: { key: currentUser.id },
        broadcast: { self: true },
      },
    });

    ch.on('broadcast', { event: 'STATE_SYNC' }, ({ payload }) => {
      const incomingState: RoomState = payload.state;
      setRoomState(incomingState);

      if (incomingState.bannedPlayerIds && incomingState.bannedPlayerIds.indexOf(currentUser.id) !== -1) {
        setIsBanned(true);
        ch.unsubscribe();
      }

      if (!currentUser.isHost && incomingState.pin) {
        setRoomState((prev) => ({ ...prev, pin: incomingState.pin }));
      }
    })
    .on('broadcast', { event: 'KICK_PLAYER' }, ({ payload }) => {
      if (payload.kickedPlayerId === currentUser.id) {
        setIsBanned(true);
        ch.unsubscribe();
      }
    })
    .on('broadcast', { event: 'STOP_PLAYING' }, ({ payload }) => {
      setRoomState((prev) => ({
        ...prev,
        phase: 'voting',
        stoppedBy: payload.stoppedBy,
      }));
    })
    .on('presence', { event: 'sync' }, () => {
      const presenceState = ch.presenceState();
      const active: Player[] = Object.values(presenceState)
        .flat()
        .map((p: any) => p.user)
        .filter((p: Player) => !(roomState.bannedPlayerIds && roomState.bannedPlayerIds.indexOf(p.id) !== -1));

      setRoomState((prev) => {
        const hostExists = active.some((p) => p.id === prev.hostId);
        const resolvedHostId = hostExists ? prev.hostId : (active[0]?.id || currentUser.id);

        const updatedPlayers = active.map((pl) => ({
          ...pl,
          isHost: pl.id === resolvedHostId,
        }));

        return {
          ...prev,
          hostId: resolvedHostId,
          players: updatedPlayers,
        };
      });
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await ch.track({ user: currentUser });
      }
    });

    setChannel(ch);

    return () => {
      ch.unsubscribe();
    };
  }, [currentUser, roomId]);

  useEffect(() => {
    if (currentUser && currentUser.isHost) {
      setIsPinValidated(true);
    } else if (!roomState.pin) {
      setIsPinValidated(true);
    } else if (enteredPin === roomState.pin) {
      setIsPinValidated(true);
      setPinError(false);
    }
  }, [roomState.pin, enteredPin, currentUser]);

  const broadcastNewState = (newState: RoomState) => {
    setRoomState(newState);
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'STATE_SYNC',
        payload: { state: newState },
      });
    }
  };

  const handleKickPlayer = (targetPlayerId: string) => {
    if (!currentUser || !currentUser.isHost) return;

    const updatedBanned = [...(roomState.bannedPlayerIds || []), targetPlayerId];
    const updatedPlayers = roomState.players.filter((p) => p.id !== targetPlayerId);

    const newState: RoomState = {
      ...roomState,
      players: updatedPlayers,
      bannedPlayerIds: updatedBanned,
    };

    broadcastNewState(newState);

    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'KICK_PLAYER',
        payload: { kickedPlayerId: targetPlayerId },
      });
    }
  };

  useEffect(() => {
    let timer: any;
    if (roomState.phase === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleCallStop('El tiempo');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [roomState.phase, timeLeft]);

  const startRoundRoulette = () => {
    const available = LETTERS.split('').filter((l) => roomState.usedLetters.indexOf(l) === -1);
    const chosen = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : 'A';

    const newState: RoomState = {
      ...roomState,
      phase: 'roulette',
      currentLetter: chosen,
      stoppedBy: null,
    };
    broadcastNewState(newState);

    let step = 0;
    const interval = setInterval(() => {
      setRouletteLetter(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
      step++;
      if (step > 15) {
        clearInterval(interval);
        setRouletteLetter(chosen);
        setTimeout(() => {
          const playingState: RoomState = {
            ...newState,
            phase: 'playing',
            usedLetters: [...roomState.usedLetters, chosen],
          };
          setTimeLeft(roomState.settings.roundDuration);
          setMyAnswers({});
          broadcastNewState(playingState);
        }, 1200);
      }
    }, 100);
  };

  const handleCallStop = (name?: string) => {
    const stopper = name || (currentUser ? currentUser.name : 'Alguien');
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'STOP_PLAYING',
        payload: { stoppedBy: stopper },
      });
    }
    setRoomState((prev) => ({
      ...prev,
      phase: 'voting',
      stoppedBy: stopper,
    }));
  };

  const addCategory = () => {
    if (!newCatInput.trim()) return;
    const updated = [...roomState.settings.categories, newCatInput.trim()];
    const newState = {
      ...roomState,
      settings: { ...roomState.settings, categories: updated },
    };
    broadcastNewState(newState);
    setNewCatInput('');
  };

  const removeCategory = (cat: string) => {
    const updated = roomState.settings.categories.filter((c) => c !== cat);
    const newState = {
      ...roomState,
      settings: { ...roomState.settings, categories: updated },
    };
    broadcastNewState(newState);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (isBanned) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-900/50 p-8 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-950/80 text-red-400 mx-auto flex items-center justify-center">
            <UserX className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-red-400">Acceso denegado</h2>
          <p className="text-slate-400 text-sm">
            Has sido expulsado de esta sala por el anfitrión.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-sm"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (roomState.pin && !isPinValidated && (!currentUser || !currentUser.isHost)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black">Sala Privada Protegida</h2>
            <p className="text-sm text-slate-400">
              Esta partida requiere un PIN de acceso establecido por el creador.
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              placeholder="Ingresa el PIN de 4 dígitos"
              maxLength={6}
              value={enteredPin}
              onChange={(e) => {
                setEnteredPin(e.target.value);
                setPinError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (enteredPin === roomState.pin) setIsPinValidated(true);
                  else setPinError(true);
                }
              }}
              className="w-full text-center text-xl font-mono tracking-widest px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-amber-400 focus:outline-none"
            />
            {pinError && (
              <p className="text-xs text-red-400 font-semibold flex items-center justify-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> PIN incorrecto. Inténtalo de nuevo.
              </p>
            )}
            <button
              onClick={() => {
                if (enteredPin === roomState.pin) setIsPinValidated(true);
                else setPinError(true);
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 font-bold text-slate-950 rounded-xl transition-all"
            >
              Desbloquear y Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t.bg} ${t.text} transition-colors duration-200`}>
      <header className={`border-b ${t.border} py-3 px-4 sm:px-8 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow">
            TF
          </div>
          <div>
            <div className="text-sm font-bold flex items-center gap-2">
              Sala: <span className="font-mono bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded text-xs">{roomId}</span>
              {roomState.pin && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  <Lock className="w-3 h-3" /> Privada
                </span>
              )}
            </div>
            <div className={`text-xs ${t.muted}`}>Ronda {roomState.currentRound} de {roomState.settings.totalRounds}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex rounded-xl p-1 border ${t.border} bg-black/5 dark:bg-white/5`}>
            {(['light', 'paper', 'dark', 'arcade'] as ThemeId[]).map((themeKey) => (
              <button
                key={themeKey}
                onClick={() => changeTheme(themeKey)}
                title={THEMES[themeKey].name}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  currentTheme === themeKey
                    ? `${t.accent} shadow-sm`
                    : `${t.muted} ${t.accentHover}`
                }`}
              >
                {themeKey === 'light' && '☀️ Luz'}
                {themeKey === 'paper' && '📜 Papel'}
                {themeKey === 'dark' && '🌙 Noche'}
                {themeKey === 'arcade' && '👾 Neón'}
              </button>
            ))}
          </div>

          <button
            onClick={copyShareLink}
            className={`p-2 rounded-xl border ${t.border} ${t.accentHover} text-xs flex items-center gap-1.5`}
            title="Copiar enlace de sala"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        {roomState.phase === 'lobby' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl border ${t.border} ${t.card}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-inherit">
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    Sala de Espera
                    {roomState.pin && (
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
                        PIN: {roomState.pin}
                      </span>
                    )}
                  </h2>
                  <p className={`text-sm ${t.muted}`}>Comparte el enlace y el PIN solo con tus amigos.</p>
                </div>
                {currentUser && currentUser.isHost && (
                  <button
                    onClick={startRoundRoulette}
                    className={`py-3 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 ${t.accent} shadow-lg`}
                  >
                    <Play className="w-5 h-5 fill-current" /> Iniciar Partida
                  </button>
                )}
              </div>

              <div className="py-6 border-b border-inherit">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Jugadores Conectados ({roomState.players.length || 1})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(roomState.players.length > 0 ? roomState.players : [currentUser]).map((p) => {
                    if (!p) return null;
                    const isSelf = p.id === (currentUser ? currentUser.id : '');
                    return (
                      <div
                        key={p.id}
                        className={`p-3.5 rounded-2xl border ${t.border} flex items-center justify-between bg-black/5 dark:bg-white/5`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className="text-2xl">{p.avatar || '🦊'}</span>
                          <div className="truncate">
                            <div className="font-semibold text-sm truncate flex items-center gap-1.5">
                              {p.name} {isSelf && <span className="text-xs opacity-60 font-normal">(Tú)</span>}
                            </div>
                            {p.isHost && (
                              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wide">
                                Anfitrión
                              </span>
                            )}
                          </div>
                        </div>

                        {currentUser && currentUser.isHost && !isSelf && (
                          <button
                            onClick={() => handleKickPlayer(p.id)}
                            title={`Expulsar a ${p.name}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <Settings2 className="w-4 h-4" /> Categorías de la Partida ({roomState.settings.categories.length})
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {roomState.settings.categories.map((cat) => (
                    <span
                      key={cat}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium border flex items-center gap-2 ${t.tagBg}`}
                    >
                      {cat}
                      {currentUser && currentUser.isHost && (
                        <button
                          onClick={() => removeCategory(cat)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                {currentUser && currentUser.isHost && (
                  <div className="flex gap-2 max-w-sm">
                    <input
                      type="text"
                      placeholder="Nueva categoría..."
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                      className={`flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none ${t.inputBg}`}
                    />
                    <button
                      onClick={addCategory}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 ${t.accent}`}
                    >
                      <Plus className="w-4 h-4" /> Añadir
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {roomState.phase === 'roulette' && (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-6">
            <h2 className="text-lg font-bold tracking-widest uppercase opacity-75">Sorteando Letra...</h2>
            <div className="w-32 h-32 rounded-3xl bg-indigo-600 text-white font-black text-7xl flex items-center justify-center shadow-2xl animate-bounce">
              {rouletteLetter}
            </div>
            <p className={`text-sm ${t.muted}`}>¡Preparen sus lápices y teclados!</p>
          </div>
        )}

        {roomState.phase === 'playing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-3xl flex items-center justify-center shadow-lg">
                  {roomState.currentLetter}
                </div>
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider opacity-75">Letra de la ronda</div>
                  <div className="text-xl font-black">Escribe con la "{roomState.currentLetter}"</div>
                </div>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${t.border} font-mono font-bold text-lg`}>
                <Clock className="w-5 h-5 text-amber-500" />
                {timeLeft}s
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roomState.settings.categories.map((cat) => {
                const val = myAnswers[cat] || '';
                const startsOk = val.trim().length > 0 && val.trim()[0].toUpperCase() === roomState.currentLetter;
                return (
                  <div key={cat} className={`p-4 rounded-2xl border ${t.border} ${t.card}`}>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                      {cat}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={`Palabra con ${roomState.currentLetter}...`}
                        value={val}
                        onChange={(e) => setMyAnswers({ ...myAnswers, [cat]: e.target.value })}
                        className={`w-full px-3 py-2.5 rounded-xl border text-base focus:outline-none ${t.inputBg}`}
                      />
                      {val.trim().length > 0 && (
                        <div className="absolute right-3 top-3 text-xs font-bold">
                          {startsOk ? (
                            <span className="text-emerald-500">✓</span>
                          ) : (
                            <span className="text-red-500">No empieza con {roomState.currentLetter}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 text-center">
              <button
                onClick={() => handleCallStop()}
                className="w-full sm:w-auto px-10 py-5 rounded-2xl font-black text-lg bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-xl shadow-red-500/25 uppercase tracking-wide transform hover:scale-[1.02] active:scale-95 transition-all"
              >
                🛑 ¡Basta para mí, basta para todos!
              </button>
            </div>
          </div>
        )}

        {roomState.phase === 'voting' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 text-xs font-bold uppercase">
                🛑 ¡Ronda detenida por {roomState.stoppedBy || 'alguien'}!
              </div>
              <h2 className="text-2xl font-black">Mesa de Corrección</h2>
              <p className={`text-sm ${t.muted}`}>Revisen sus respuestas: 10 pts si es única, 5 si se repite, 0 si no vale.</p>
            </div>

            <div className={`p-4 rounded-3xl border ${t.border} ${t.card} overflow-x-auto`}>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className={`border-b ${t.border}`}>
                    <th className="py-3 px-3 font-bold uppercase text-xs">Categoría</th>
                    <th className="py-3 px-3 font-bold uppercase text-xs">Tu Respuesta</th>
                    <th className="py-3 px-3 font-bold uppercase text-xs text-center">Puntaje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-inherit">
                  {roomState.settings.categories.map((cat) => {
                    const ans = myAnswers[cat] || '-';
                    return (
                      <tr key={cat}>
                        <td className="py-3 px-3 font-semibold">{cat}</td>
                        <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{ans}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex gap-1">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-600 font-bold text-xs">
                              10 pts
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {currentUser && currentUser.isHost && (
              <div className="text-center pt-4">
                <button
                  onClick={() => {
                    if (roomState.currentRound >= roomState.settings.totalRounds) {
                      broadcastNewState({ ...roomState, phase: 'podium' });
                      confetti();
                    } else {
                      broadcastNewState({
                        ...roomState,
                        currentRound: roomState.currentRound + 1,
                        phase: 'lobby',
                      });
                    }
                  }}
                  className={`py-3.5 px-8 rounded-2xl font-bold ${t.accent} shadow-lg`}
                >
                  {roomState.currentRound >= roomState.settings.totalRounds ? 'Ver Podio Final' : 'Siguiente Ronda'}
                </button>
              </div>
            )}
          </div>
        )}

        {roomState.phase === 'podium' && (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-6">
            <Trophy className="w-20 h-20 text-amber-500 animate-bounce" />
            <h2 className="text-3xl font-black">¡Fin de la Partida!</h2>
            <p className={`text-sm ${t.muted}`}>¡Gran juego a todos!</p>
            {currentUser && currentUser.isHost && (
              <button
                onClick={() => {
                  broadcastNewState({
                    ...roomState,
                    phase: 'lobby',
                    currentRound: 1,
                    usedLetters: [],
                  });
                }}
                className={`py-3 px-6 rounded-2xl font-bold ${t.accent}`}
              >
                Volver a Jugar
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
