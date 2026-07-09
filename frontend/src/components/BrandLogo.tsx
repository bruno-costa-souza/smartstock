import { Sparkles } from 'lucide-react';

/*
 * Recria o letreiro "Josi | Papelaria & Presentes" em HTML/CSS
 * (o PNG original tem fundo preto chapado e perde nitidez ao escalar).
 */

const SIZES = {
  sm: { pill: 'px-4 py-1.5 gap-2.5', script: 'text-2xl', sub: 'text-[7px] tracking-[0.22em]' },
  md: { pill: 'px-5 py-2 gap-3', script: 'text-3xl', sub: 'text-[8px] tracking-[0.25em]' },
  lg: { pill: 'px-7 py-3 gap-4', script: 'text-5xl', sub: 'text-[11px] tracking-[0.3em]' },
} as const;

export function BrandLogo({ size = 'md' }: { size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <div
      className={`relative inline-flex items-center rounded-full bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 ring-1 ring-sky-300/60 shadow-glow select-none ${s.pill}`}
    >
      <span className={`font-script text-white leading-none drop-shadow-md pr-1 ${s.script}`}>
        Josi
      </span>
      <span className="w-px self-stretch bg-white/40" aria-hidden />
      <span className={`font-display font-bold text-yellow-200 leading-relaxed uppercase ${s.sub}`}>
        Papelaria
        <br />
        &amp; Presentes
      </span>
      {size === 'lg' && (
        <Sparkles size={16} className="absolute -top-1.5 -right-1 text-yellow-200 drop-shadow" />
      )}
    </div>
  );
}

/* Versão compacta sem pílula, para barras estreitas (admin) */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 select-none ${className}`}>
      <span className="font-script text-2xl leading-none text-sky-400">Josi</span>
      <span className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-yellow-200/80">
        Papelaria
      </span>
    </span>
  );
}
