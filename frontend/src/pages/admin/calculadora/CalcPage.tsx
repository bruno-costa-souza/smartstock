import { useState, useMemo } from 'react';
import {
  Calculator, TrendingUp, TrendingDown, DollarSign,
  Percent, ChevronDown, Info, ArrowRight,
} from 'lucide-react';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function pct(v: number) {
  return `${v.toFixed(1)}%`;
}

/* ── Input numérico ──────────────────────────────────── */
function NumInput({
  label, value, onChange, prefix, suffix, hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-white/60 mb-1 font-medium">{label}</label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-white/45 text-sm font-medium pointer-events-none">{prefix}</span>
        )}
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full py-3 bg-white/10 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-brand-400/60 transition ${prefix ? 'pl-9 pr-4' : suffix ? 'pl-4 pr-9' : 'px-4'}`}
        />
        {suffix && (
          <span className="absolute right-3 text-white/45 text-sm font-medium pointer-events-none">{suffix}</span>
        )}
      </div>
      {hint && <p className="text-xs text-white/30 mt-1">{hint}</p>}
    </div>
  );
}

/* ── Chip de preset ──────────────────────────────────── */
function PresetChips({
  options, value, onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.label}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            value === o.value
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 shadow-glow text-white'
              : 'bg-white/10 text-white/60 border border-white/15 hover:border-brand-400'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ── Barra de margem ─────────────────────────────────── */
function MarginBar({ value, max = 60 }: { value: number; max?: number }) {
  const capped = Math.max(0, Math.min(value, max));
  const pct = (capped / max) * 100;

  const color =
    value < 0 ? 'bg-red-500' :
    value < 15 ? 'bg-orange-500' :
    value < 30 ? 'bg-yellow-500' :
    'bg-green-500';

  return (
    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ── Card de resultado ───────────────────────────────── */
function ResultCard({
  label, value, sub, color = 'text-white', large = false,
}: {
  label: string; value: string; sub?: string;
  color?: string; large?: boolean;
}) {
  return (
    <div className="bg-white/10 rounded-xl p-4 flex flex-col gap-1">
      <p className="text-xs text-white/60 font-medium">{label}</p>
      <p className={`font-bold ${large ? 'text-2xl' : 'text-xl'} ${color}`}>{value}</p>
      {sub && <p className="text-xs text-white/45">{sub}</p>}
    </div>
  );
}

/* ── Detalhe de dedução ──────────────────────────────── */
function DeductionRow({ label, value, negative = true }: { label: string; value: number; negative?: boolean }) {
  if (value === 0) return null;
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
      <span className="text-sm text-white/60">{label}</span>
      <span className={`text-sm font-semibold ${negative ? 'text-red-400' : 'text-green-400'}`}>
        {negative ? '- ' : '+ '}{fmt(value)}
      </span>
    </div>
  );
}

/* ── Página principal ────────────────────────────────── */
export function CalcPage() {
  // Entradas principais
  const [custo, setCusto] = useState('');
  const [venda, setVenda] = useState('');

  // Deduções
  const [imposto, setImposto] = useState('6');
  const [maquininha, setMaquininha] = useState('2.5');
  const [outrosCustos, setOutrosCustos] = useState('');
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);

  // Calculadora de preço sugerido
  const [custoSug, setCustoSug] = useState('');
  const [margemSug, setMargemSug] = useState('30');

  /* ── Cálculos ──────────────────────────────────────── */
  const calc = useMemo(() => {
    const c = parseFloat(custo) || 0;
    const v = parseFloat(venda) || 0;
    if (c === 0 && v === 0) return null;

    const lucro_bruto = v - c;
    const margem_bruta = v > 0 ? (lucro_bruto / v) * 100 : 0;
    const markup = c > 0 ? ((v / c) - 1) * 100 : 0;

    const val_imposto = v * (parseFloat(imposto) || 0) / 100;
    const val_maquininha = v * (parseFloat(maquininha) || 0) / 100;
    const val_outros = parseFloat(outrosCustos) || 0;
    const total_ded = val_imposto + val_maquininha + val_outros;

    const lucro_liquido = lucro_bruto - total_ded;
    const margem_liquida = v > 0 ? (lucro_liquido / v) * 100 : 0;

    return {
      custo: c, venda: v,
      lucro_bruto, margem_bruta, markup,
      val_imposto, val_maquininha, val_outros, total_ded,
      lucro_liquido, margem_liquida,
    };
  }, [custo, venda, imposto, maquininha, outrosCustos]);

  /* ── Preço sugerido ────────────────────────────────── */
  const sugerido = useMemo(() => {
    const c = parseFloat(custoSug) || 0;
    const m = parseFloat(margemSug) || 0;
    const imp = parseFloat(imposto) || 0;
    const maq = parseFloat(maquininha) || 0;
    if (c === 0) return null;
    // venda = custo / (1 - margem% - impostos% - maquininha%)
    const divisor = 1 - (m / 100) - (imp / 100) - (maq / 100);
    if (divisor <= 0) return null;
    const preco = c / divisor;
    const lucro = preco - c - preco * (imp / 100) - preco * (maq / 100);
    return { preco, lucro };
  }, [custoSug, margemSug, imposto, maquininha]);

  /* ── Cor da margem ─────────────────────────────────── */
  function marginColor(m: number) {
    if (m < 0) return 'text-red-400';
    if (m < 15) return 'text-orange-400';
    if (m < 30) return 'text-yellow-400';
    return 'text-green-400';
  }

  function marginLabel(m: number) {
    if (m < 0) return 'Prejuízo';
    if (m < 15) return 'Margem baixa';
    if (m < 30) return 'Margem boa';
    return 'Margem excelente';
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl">

      <div className="mb-6">
        <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
          <Calculator size={22} className="text-brand-300" />
          Calculadora de Lucro
        </h1>
        <p className="text-sm text-white/60 mt-0.5">Calcule o lucro bruto e líquido dos seus produtos em tempo real</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Coluna esquerda: inputs ─────────────────── */}
        <div className="space-y-5">

          {/* Preços */}
          <div className="bg-white/[0.07] backdrop-blur-xl rounded-2xl border border-white/10 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <DollarSign size={16} className="text-brand-300" /> Preços do produto
            </h2>
            <NumInput label="Custo do produto (quanto você paga)" value={custo} onChange={setCusto} prefix="R$" hint="Valor pago ao fornecedor ou custo de produção" />
            <NumInput label="Preço de venda (quanto você cobra)" value={venda} onChange={setVenda} prefix="R$" />

            {calc && calc.markup > 0 && (
              <div className="flex items-center gap-2 text-xs text-white/45 bg-white/10 rounded-lg px-3 py-2">
                <Info size={12} className="flex-shrink-0" />
                Markup aplicado: <span className="text-brand-300 font-semibold">{pct(calc.markup)}</span>
                {' '}— para cada R$ 1,00 de custo, você cobra R$ {(parseFloat(venda) / (parseFloat(custo) || 1)).toFixed(2)}
              </div>
            )}
          </div>

          {/* Deduções */}
          <div className="bg-white/[0.07] backdrop-blur-xl rounded-2xl border border-white/10 p-5 space-y-4">
            <button
              onClick={() => setMostrarDetalhes((v) => !v)}
              className="w-full flex items-center justify-between text-sm font-semibold text-white"
            >
              <span className="flex items-center gap-2">
                <Percent size={16} className="text-orange-400" /> Deduções (impostos e taxas)
              </span>
              <ChevronDown size={16} className={`text-white/45 transition-transform ${mostrarDetalhes ? 'rotate-180' : ''}`} />
            </button>

            {mostrarDetalhes && (
              <div className="space-y-4 pt-1">
                <div>
                  <p className="text-xs text-white/60 mb-2 font-medium">Regime tributário</p>
                  <PresetChips
                    value={imposto}
                    onChange={setImposto}
                    options={[
                      { label: 'MEI (0%)', value: '0' },
                      { label: 'Simples 4%', value: '4' },
                      { label: 'Simples 6%', value: '6' },
                      { label: 'Simples 8%', value: '8' },
                    ]}
                  />
                  <div className="mt-2">
                    <NumInput label="Ou personalize" value={imposto} onChange={setImposto} suffix="%" />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-white/60 mb-2 font-medium">Taxa da maquininha</p>
                  <PresetChips
                    value={maquininha}
                    onChange={setMaquininha}
                    options={[
                      { label: 'Dinheiro/Pix (0%)', value: '0' },
                      { label: 'Débito (1.5%)', value: '1.5' },
                      { label: 'Crédito (2.5%)', value: '2.5' },
                      { label: 'Crédito 12x (4%)', value: '4' },
                    ]}
                  />
                  <div className="mt-2">
                    <NumInput label="Ou personalize" value={maquininha} onChange={setMaquininha} suffix="%" />
                  </div>
                </div>

                <NumInput
                  label="Outros custos por produto (R$)"
                  value={outrosCustos}
                  onChange={setOutrosCustos}
                  prefix="R$"
                  hint="Embalagem, frete, comissão, etc."
                />
              </div>
            )}

            {!mostrarDetalhes && (
              <p className="text-xs text-white/30">
                Imposto: {imposto || 0}% · Maquininha: {maquininha || 0}%
                {outrosCustos ? ` · Outros: ${fmt(parseFloat(outrosCustos))}` : ''}
                {' '}— <button onClick={() => setMostrarDetalhes(true)} className="text-brand-400 hover:underline">personalizar</button>
              </p>
            )}
          </div>
        </div>

        {/* ── Coluna direita: resultados ──────────────── */}
        <div className="space-y-5">

          {!calc ? (
            <div className="bg-white/[0.07] backdrop-blur-xl rounded-2xl border border-white/10 p-8 flex flex-col items-center justify-center text-center h-64">
              <Calculator size={40} className="text-white/25 mb-3" />
              <p className="text-white/45 text-sm">Preencha o custo e o preço de venda</p>
              <p className="text-white/30 text-xs mt-1">Os resultados aparecem aqui em tempo real</p>
            </div>
          ) : (
            <>
              {/* Lucro bruto */}
              <div className="bg-white/[0.07] backdrop-blur-xl rounded-2xl border border-white/10 p-5 space-y-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-400" /> Lucro bruto
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <ResultCard
                    label="Lucro bruto"
                    value={fmt(calc.lucro_bruto)}
                    color={calc.lucro_bruto >= 0 ? 'text-green-400' : 'text-red-400'}
                    large
                  />
                  <ResultCard
                    label="Margem bruta"
                    value={pct(calc.margem_bruta)}
                    sub={calc.lucro_bruto >= 0 ? 'sobre o preço de venda' : 'abaixo do custo!'}
                    color={marginColor(calc.margem_bruta)}
                    large
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-white/45 mb-1.5">
                    <span>Margem bruta</span>
                    <span className={`font-semibold ${marginColor(calc.margem_bruta)}`}>
                      {marginLabel(calc.margem_bruta)}
                    </span>
                  </div>
                  <MarginBar value={calc.margem_bruta} />
                </div>
              </div>

              {/* Lucro líquido */}
              <div className="bg-white/[0.07] backdrop-blur-xl rounded-2xl border border-white/10 p-5 space-y-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TrendingDown size={16} className="text-orange-400" /> Deduções e lucro líquido
                </h2>

                {/* Breakdown */}
                <div className="bg-white/5 rounded-xl px-4 py-1">
                  <DeductionRow label={`Impostos (${imposto || 0}%)`} value={calc.val_imposto} />
                  <DeductionRow label={`Maquininha (${maquininha || 0}%)`} value={calc.val_maquininha} />
                  <DeductionRow label="Outros custos" value={calc.val_outros} />
                  {calc.total_ded === 0 && (
                    <p className="text-xs text-white/30 py-3 text-center">
                      Nenhuma dedução configurada —{' '}
                      <button onClick={() => setMostrarDetalhes(true)} className="text-brand-400 hover:underline">
                        adicionar
                      </button>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ResultCard
                    label="Lucro líquido"
                    value={fmt(calc.lucro_liquido)}
                    color={calc.lucro_liquido >= 0 ? 'text-green-400' : 'text-red-400'}
                    large
                  />
                  <ResultCard
                    label="Margem líquida"
                    value={pct(calc.margem_liquida)}
                    sub={marginLabel(calc.margem_liquida)}
                    color={marginColor(calc.margem_liquida)}
                    large
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-white/45 mb-1.5">
                    <span>Margem líquida</span>
                    <span className={`font-semibold ${marginColor(calc.margem_liquida)}`}>
                      {pct(calc.margem_liquida)}
                    </span>
                  </div>
                  <MarginBar value={calc.margem_liquida} />
                </div>

                {/* Resumo por venda */}
                <div className="bg-white/10 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-white/60 mb-2 font-semibold uppercase tracking-wide">Resumo por venda</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Preço de venda</span>
                    <span className="text-white font-medium">{fmt(calc.venda)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">— Custo do produto</span>
                    <span className="text-red-400">- {fmt(calc.custo)}</span>
                  </div>
                  {calc.total_ded > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">— Deduções totais</span>
                      <span className="text-orange-400">- {fmt(calc.total_ded)}</span>
                    </div>
                  )}
                  <div className="border-t border-white/15 mt-2 pt-2 flex justify-between text-sm font-bold">
                    <span className="text-white/80">= Lucro líquido</span>
                    <span className={calc.lucro_liquido >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {fmt(calc.lucro_liquido)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Calculadora de preço sugerido ──────────────── */}
      <div className="mt-6 bg-white/[0.07] backdrop-blur-xl rounded-2xl border border-brand-500/30 p-5">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
          <ArrowRight size={16} className="text-brand-300" />
          Qual preço cobrar para atingir uma margem?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <NumInput label="Custo do produto (R$)" value={custoSug} onChange={setCustoSug} prefix="R$" />
          <div>
            <p className="text-xs text-white/60 mb-2 font-medium">Margem líquida desejada</p>
            <PresetChips
              value={margemSug}
              onChange={setMargemSug}
              options={[
                { label: '20%', value: '20' },
                { label: '30%', value: '30' },
                { label: '40%', value: '40' },
                { label: '50%', value: '50' },
              ]}
            />
            <div className="mt-2">
              <NumInput label="" value={margemSug} onChange={setMargemSug} suffix="%" />
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4">
            {sugerido ? (
              <>
                <p className="text-xs text-white/60 mb-1">Preço sugerido</p>
                <p className="text-2xl font-bold text-brand-300">{fmt(sugerido.preco)}</p>
                <p className="text-xs text-white/45 mt-1">
                  Lucro líquido por venda: <span className="text-green-400 font-semibold">{fmt(sugerido.lucro)}</span>
                </p>
                <p className="text-xs text-white/30 mt-0.5">
                  Já descontando imposto ({imposto || 0}%) e maquininha ({maquininha || 0}%)
                </p>
              </>
            ) : (
              <p className="text-white/30 text-sm text-center py-3">
                Preencha o custo para ver o preço sugerido
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Legenda de margens */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { color: 'bg-red-500', label: 'Prejuízo', sub: '< 0%' },
          { color: 'bg-orange-500', label: 'Margem baixa', sub: '0% – 15%' },
          { color: 'bg-yellow-500', label: 'Margem boa', sub: '15% – 30%' },
          { color: 'bg-green-500', label: 'Excelente', sub: '> 30%' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2 bg-white/[0.07] backdrop-blur-xl rounded-xl px-3 py-2 border border-white/10">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${l.color}`} />
            <div>
              <p className="text-xs text-white font-medium leading-none">{l.label}</p>
              <p className="text-xs text-white/45">{l.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
