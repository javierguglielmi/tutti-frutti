import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'bg-slate-50', 'bg-white', 'border-slate-200', 'text-slate-900', 'text-slate-500', 'bg-indigo-600', 'hover:bg-indigo-700', 'text-white', 'hover:bg-slate-100', 'bg-slate-100', 'text-slate-700', 'bg-indigo-50', 'text-indigo-700', 'border-indigo-200',
    'bg-amber-50', 'bg-stone-50', 'border-amber-200', 'border-amber-300', 'text-stone-900', 'text-stone-600', 'bg-amber-700', 'hover:bg-amber-800', 'text-amber-50', 'hover:bg-amber-100', 'bg-amber-100', 'text-stone-800', 'bg-amber-200', 'text-amber-900',
    'bg-slate-950', 'bg-slate-900', 'border-slate-800', 'text-slate-100', 'text-slate-400', 'bg-emerald-500', 'hover:bg-emerald-600', 'text-slate-950', 'hover:bg-slate-800', 'bg-slate-800', 'text-slate-300', 'border-slate-700', 'bg-emerald-950', 'text-emerald-300', 'border-emerald-800',
    'bg-zinc-950', 'bg-zinc-900', 'border-fuchsia-800', 'border-fuchsia-600', 'text-fuchsia-100', 'text-fuchsia-300', 'bg-fuchsia-600', 'hover:bg-fuchsia-500', 'hover:bg-zinc-800', 'bg-black', 'border-cyan-500', 'focus:border-cyan-300', 'text-cyan-200', 'text-cyan-300', 'border-cyan-900', 'bg-fuchsia-950'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
