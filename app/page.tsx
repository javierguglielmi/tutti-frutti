'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Users, ArrowRight, Play } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [avatar, setAvatar] = useState('🦊');

  const avatars = ['🦊', '🐱', '🐼', '🦁', '🦉', '🐸', '🐨', '🦄'];

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    const newRoomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    localStorage.setItem('tf_player', JSON.stringify({ name: userName, avatar, isHost: true }));
    router.push(`/room/${newRoomId}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !roomCode.trim()) return;
    localStorage.setItem('tf_player', JSON.stringify({ name: userName, avatar, isHost: false }));
    router.push(`/room/${roomCode.toUpperCase().trim()}`);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> En tiempo real
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            Tutti Frutti
          </h1>
          <p className="text-sm text-slate-400">
            Juega online con amigos desde donde estén.
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
          <button
            onClick={handleCreateRoom}
            disabled={!userName.trim()}
            className="w-full py-3.5 px-4 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Play className="w-5 h-5 fill-current" /> Crear Nueva Sala
          </button>

          <div className="relative py-2 flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase">o únete a una</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="CÓDIGO DE SALA"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 uppercase tracking-widest text-center text-sm font-mono focus:border-emerald-500 focus:outline-none text-slate-100"
            />
            <button
              onClick={handleJoinRoom}
              disabled={!userName.trim() || !roomCode.trim()}
              className="px-5 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 flex items-center gap-1.5 transition-all"
            >
              Unirse <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
