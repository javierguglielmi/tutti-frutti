'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Play, Lock } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [avatar, setAvatar] = useState('🦊');

  const [enablePin, setEnablePin] = useState(false);
  const [createPin, setCreatePin] = useState('');
  const [joinPin, setJoinPin] = useState('');

  const avatars = ['🦊', '🐱', '🐼', '🦁', '🦉', '🐸', '🐨', '🦄'];

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    const newRoomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    
    localStorage.setItem(
      'tf_player',
      JSON.stringify({
        name: userName.trim(),
        avatar,
        isHost: true,
        createdPin: enablePin && createPin.trim().length > 0 ? createPin.trim() : null,
      })
    );
    router.push('/room/' + newRoomId);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !roomCode.trim()) return;
    localStorage.setItem(
      'tf_player',
      JSON.stringify({
        name: userName.trim(),
        avatar,
        isHost: false,
        enteredPin: joinPin.trim(),
      })
    );
    router.push('/room/' + roomCode.toUpperCase().trim());
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> En tiempo real & Privado
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            Tutti Frutti
          </h1>
          <p className="text-sm text-slate-400">
            Juega online con amigos en salas privadas.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
              Tu Nombre
            </label>
            <input
              type="text"
              placeholder="Ej: Javier"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-slate-100 text-base"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
              Elige tu Avatar
            </label>
            <div className="flex gap-2 justify-between">
              {avatars.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    avatar === av
                      ? 'bg-emerald-500/20 border-2 border-emerald-400 scale-110'
                      : 'bg-slate-950 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase text-slate-300 flex items-center gap-1.5 cursor-pointer">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Proteger con PIN de acceso
              </label>
              <input
                type="checkbox"
                checked={enablePin}
                onChange={(e) => setEnablePin(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
              />
            </div>

            {enablePin && (
              <div>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Define un PIN (ej: 1234)"
                  value={createPin}
                  onChange={(e) => setCreatePin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-sm text-center font-mono tracking-widest text-slate-100"
                />
              </div>
            )}

            <button
              onClick={handleCreateRoom}
              disabled={!userName.trim() || (enablePin && !createPin.trim())}
              className="w-full py-3.5 px-4 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Play className="w-5 h-5 fill-current" /> Crear Nueva Sala
            </button>
          </div>

          <div className="relative py-2 flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase">o unirse a una</span>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="CÓDIGO DE SALA"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 uppercase tracking-widest text-center text-sm font-mono focus:border-emerald-500 focus:outline-none text-slate-100"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="PIN (si es privada)"
                value={joinPin}
                onChange={(e) => setJoinPin(e.target.value)}
                className="w-1/2 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs font-mono tracking-wider focus:border-emerald-500 focus:outline-none text-slate-100"
              />
              <button
                onClick={handleJoinRoom}
                disabled={!userName.trim() || !roomCode.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 flex items-center justify-center gap-1.5 transition-all text-sm"
              >
                Unirse <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
