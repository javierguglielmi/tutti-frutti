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
    bg: 'bg-[#FBF8F1]',
    card: 'bg-[#FFFDF9] shadow-sm',
    border: 'border-[#E7DEC8]',
    text: 'text-[#2C2825]',
    muted: 'text-[#7D7565]',
    accent: 'bg-[#C85A32] hover:bg-[#B34B25] text-white',
    accentHover: 'hover:bg-[#F2ECE1]',
    inputBg: 'bg-[#FAF6ED] border-[#DDD3BC] focus:bg-white text-[#2C2825]',
    tagBg: 'bg-[#EFE9DC] text-[#4A433B] border-[#DDD3BC]',
    badge: 'bg-[#FBEAE2] text-[#A63C16] border-[#F2C5B3]'
  },
  dark: {
    id: 'dark',
    name: 'Noche Moderna',
    bg: 'bg-slate-950',
    card: 'bg-slate-900/90 shadow-xl',
    border: 'border-slate-800',
    text: 'text-slate-100',
    muted: 'text-slate-400',
    accent: 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold',
    accentHover: 'hover:bg-slate-800',
    inputBg: 'bg-slate-950/70 border-slate-800 focus:border-emerald-500 text-slate-100',
    tagBg: 'bg-slate-800/80 text-slate-300 border-slate-700',
    badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
  },
  arcade: {
    id: 'arcade',
    name: 'Neón Arcada',
    bg: 'bg-zinc-950',
    card: 'bg-zinc-900/90 shadow-2xl',
    border: 'border-fuchsia-900/40',
    text: 'text-zinc-100',
    muted: 'text-zinc-400',
    accent: 'bg-gradient-to-r from-fuchsia-600 to-cyan-500 hover:opacity-90 text-white font-bold',
    accentHover: 'hover:bg-zinc-800',
    inputBg: 'bg-black/60 border-zinc-800 focus:border-cyan-400 text-cyan-200',
    tagBg: 'bg-zinc-800/80 text-fuchsia-300 border-fuchsia-950',
    badge: 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-800'
  }
};
