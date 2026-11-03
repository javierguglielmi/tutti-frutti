import { ThemeId } from './types';

export const DEFAULT_CATEGORIES = [
  'Nombres',
  'Países o Ciudades',
  'Animales',
  'Frutas / Comidas',
  'Cosas / Objetos',
  'Colores',
  'Marcas',
  'Profesiones'
];

export const THEMES: Record<ThemeId, {
  id: ThemeId;
  name: string;
  bg: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accentHover: string;
  inputBg: string;
  tagBg: string;
  badge: string;
}> = {
  light: {
    id: 'light',
    name: 'Luz Editorial',
    bg: 'bg-slate-50',
    card: 'bg-white shadow-sm',
    border: 'border-slate-200',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    accent: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    accentHover: 'hover:bg-slate-100',
    inputBg: 'bg-slate-50 border-slate-300 focus:bg-white text-slate-900',
    tagBg: 'bg-slate-100 text-slate-700 border-slate-200',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  paper: {
    id: 'paper',
    name: 'Papel & Tinta',
    bg: 'bg-amber-50',
    card: 'bg-stone-50 shadow-sm',
    border: 'border-amber-200',
    text: 'text-stone-900',
    muted: 'text-stone-600',
    accent: 'bg-amber-700 hover:bg-amber-800 text-amber-50 font-bold',
    accentHover: 'hover:bg-amber-100',
    inputBg: 'bg-amber-100/60 border-amber-300 focus:bg-white text-stone-900',
    tagBg: 'bg-amber-100 text-stone-800 border-amber-200',
    badge: 'bg-amber-200 text-amber-900 border-amber-300'
  },
  dark: {
    id: 'dark',
    name: 'Noche Moderna',
    bg: 'bg-slate-950',
    card: 'bg-slate-900 shadow-xl',
    border: 'border-slate-800',
    text: 'text-slate-100',
    muted: 'text-slate-400',
    accent: 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold',
    accentHover: 'hover:bg-slate-800',
    inputBg: 'bg-slate-950 border-slate-800 focus:border-emerald-500 text-slate-100',
    tagBg: 'bg-slate-800 text-slate-300 border-slate-700',
    badge: 'bg-emerald-950 text-emerald-300 border-emerald-800'
  },
  arcade: {
    id: 'arcade',
    name: 'Neón Arcada',
    bg: 'bg-zinc-950',
    card: 'bg-zinc-900 border-2 border-fuchsia-800 shadow-2xl',
    border: 'border-fuchsia-800',
    text: 'text-fuchsia-100',
    muted: 'text-fuchsia-300',
    accent: 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black',
    accentHover: 'hover:bg-zinc-800',
    inputBg: 'bg-black border-cyan-500 focus:border-cyan-300 text-cyan-200',
    tagBg: 'bg-zinc-800 text-cyan-300 border-cyan-900',
    badge: 'bg-fuchsia-950 text-fuchsia-300 border-fuchsia-800'
  }
};
