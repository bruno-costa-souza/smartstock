import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search, ShoppingBag, Sparkles,
  ChevronLeft, ChevronRight, Menu, X, Tag,
  ShoppingCart, Plus, Minus, Trash2, Send, Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { ESTOQUE_ATIVO } from '../../lib/flags';
import { useCart } from '../../context/CartContext';
import { BrandLogo } from '../../components/BrandLogo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5511943852148';

interface Produto {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  estoque: number;
  imagemUrl?: string;
}

export function getImageUrl(imagemUrl?: string | null) {
  if (!imagemUrl) return null;
  if (imagemUrl.startsWith('http')) return imagemUrl;
  return `${API_URL}${imagemUrl}`;
}

function formatPrice(preco: number) {
  return Number(preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* ── Drawer do carrinho ──────────────────────────────── */
function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, count, total, remove, updateQty, clear } = useCart();
  const [nome, setNome] = useState('');

  function buildWhatsAppLink() {
    const linhas = items
      .map((i) => `• ${i.quantidade}x ${i.nome} — ${formatPrice(i.preco * i.quantidade)}`)
      .join('\n');
    const texto =
      `Olá! Gostaria de reservar os seguintes produtos:\n\n${linhas}\n\n` +
      `*Total: ${formatPrice(total)}*\n` +
      (nome ? `Nome: ${nome}` : '');
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(texto)}`;
  }

  function handleEnviar() {
    window.open(buildWhatsAppLink(), '_blank');
    clear();
    setNome('');
    onClose();
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Painel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm glass-strong z-50 shadow-2xl flex flex-col transition-transform duration-300 md:rounded-l-3xl ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-glow">
            <ShoppingCart size={17} className="text-white" />
          </div>
          <span className="font-display font-bold text-white flex-1">
            Minha reserva {count > 0 && <span className="text-brand-300">({count})</span>}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg btn-ghost"
          >
            <X size={18} />
          </button>
        </div>

        {/* Itens */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 pb-20">
              <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
                <ShoppingCart size={28} className="text-white/30" />
              </div>
              <p className="text-white/60 font-medium">Nenhum item ainda</p>
              <p className="text-white/40 text-sm mt-1">Adicione produtos para reservar</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {items.map((item) => {
                const imgUrl = getImageUrl(item.imagemUrl);
                return (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    {/* Thumb */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/10 border border-white/10 flex-shrink-0">
                      {imgUrl
                        ? <img src={imgUrl} alt={item.nome} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={18} className="text-white/30" /></div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/90 leading-snug line-clamp-2">{item.nome}</p>
                      <p className="text-sm font-display font-bold text-amber-300 mt-0.5">{formatPrice(item.preco * item.quantidade)}</p>
                    </div>

                    {/* Qty + remove */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <button onClick={() => remove(item.id)} className="text-white/30 hover:text-red-400 transition">
                        <Trash2 size={14} />
                      </button>
                      <div className="flex items-center gap-1 bg-white/10 border border-white/10 rounded-lg px-1 py-0.5">
                        <button
                          onClick={() => updateQty(item.id, item.quantidade - 1)}
                          className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white transition"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-semibold text-white w-5 text-center">{item.quantidade}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantidade + 1)}
                          className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white transition"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer com total + envio */}
        {items.length > 0 && (
          <div className="border-t border-white/10 p-5 space-y-4 flex-shrink-0">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Total da reserva</span>
              <span className="text-lg font-display font-bold text-white">{formatPrice(total)}</span>
            </div>

            {/* Nome */}
            <input
              type="text"
              placeholder="Seu nome (opcional)"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-3 glass-input"
            />

            {/* Botão WhatsApp */}
            <button
              onClick={handleEnviar}
              className="w-full flex items-center justify-center gap-2 btn-whatsapp py-4 rounded-2xl text-sm"
            >
              <Send size={18} />
              Enviar reserva no WhatsApp
            </button>

            <button
              onClick={() => { clear(); onClose(); }}
              className="w-full text-center text-xs text-white/30 hover:text-white/60 transition py-1"
            >
              Limpar carrinho
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Card de produto ─────────────────────────────────── */
function ProdutoCard({ produto }: { produto: Produto }) {
  const navigate = useNavigate();
  const { add, isInCart } = useCart();
  const imgUrl = getImageUrl(produto.imagemUrl);
  const semEstoque = ESTOQUE_ATIVO && produto.estoque === 0;
  const noCart = isInCart(produto.id);

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    add({ id: produto.id, nome: produto.nome, preco: produto.preco, imagemUrl: produto.imagemUrl });
  }

  return (
    <div
      className="group glass-card glass-card-hover hover:shadow-2xl hover:shadow-brand-900/40 hover:-translate-y-1 overflow-hidden cursor-pointer active:scale-95 flex flex-col animate-fade-up"
      onClick={() => navigate(`/produto/${produto.id}`)}
    >
      {/* Imagem */}
      <div className="aspect-square bg-white/5 overflow-hidden relative flex-shrink-0">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={produto.nome}
            className="w-full h-full object-cover md:transition-transform md:duration-500 md:group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={32} className="text-white/20" />
          </div>
        )}
        {semEstoque && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center pb-3">
            <span className="bg-white/90 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">Esgotado</span>
          </div>
        )}
        {noCart && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center shadow-glow">
            <Check size={13} className="text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-white/90 text-sm font-medium leading-snug line-clamp-2 flex-1 mb-2">
          {produto.nome}
        </p>
        <p className="text-amber-300 font-display font-bold text-base mb-2">{formatPrice(produto.preco)}</p>
        {ESTOQUE_ATIVO && produto.estoque > 0 && produto.estoque <= 5 && (
          <p className="text-amber-400 text-xs mb-2">Últimas {produto.estoque} unidades</p>
        )}

        {!semEstoque && (
          <button
            onClick={handleAdd}
            className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
              noCart
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                : 'btn-primary'
            }`}
          >
            {noCart ? '✓ Adicionado' : '+ Reservar'}
          </button>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="aspect-square bg-white/10" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-white/10 rounded w-full" />
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-5 bg-white/10 rounded w-1/2" />
        <div className="h-8 bg-white/10 rounded-xl" />
      </div>
    </div>
  );
}

/* ── Drawer de categorias (mobile) ───────────────────── */
function CatDrawer({
  open, onClose, categorias, categoriaAtiva, onSelect,
}: {
  open: boolean; onClose: () => void;
  categorias: string[]; categoriaAtiva: string;
  onSelect: (cat: string) => void;
}) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div className={`fixed top-0 left-0 h-full w-72 glass-strong z-50 shadow-2xl flex flex-col transition-transform duration-300 rounded-r-3xl ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10 flex-shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center shadow-glow">
            <Tag size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-white flex-1">Categorias</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg btn-ghost">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          {['Todos', ...categorias].map((cat) => {
            const active = cat === 'Todos' ? !categoriaAtiva : categoriaAtiva === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelect(cat === 'Todos' ? '' : cat)}
                className={`flex items-center gap-3 w-full px-5 py-3.5 text-sm font-medium text-left transition-all ${
                  active
                    ? 'bg-brand-600/20 text-white border-r-4 border-brand-400'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Tag size={14} className={active ? 'text-brand-300' : 'text-white/40'} />
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ── Página principal ────────────────────────────────── */
export function VitrinePage() {
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [page, setPage] = useState(1);
  const [catDrawerOpen, setCatDrawerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const catsRef = useRef<HTMLDivElement>(null);
  const { count, total: cartTotal } = useCart();

  const { data: categorias = [] } = useQuery<string[]>({
    queryKey: ['vitrine', 'categorias'],
    queryFn: () => api.get('/vitrine/categorias').then((r) => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['vitrine', 'produtos', page, search, categoria],
    queryFn: () =>
      api.get('/vitrine/produtos', {
        params: { page, limit: 20, search: search || undefined, categoria: categoria || undefined },
      }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const produtos: Produto[] = data?.data ?? [];
  const totalPages: number = data?.totalPages ?? 1;
  const total: number = data?.total ?? 0;

  function selectCategoria(cat: string) {
    setCategoria(cat);
    setPage(1);
    setCatDrawerOpen(false);
  }

  function scrollCats(dir: number) {
    catsRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen">

      {/* ── Header ──────────────────────────────────────── */}
      <header className="glass-strong border-x-0 border-t-0 sticky top-0 z-30 shadow-lg shadow-black/30">

        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex items-center gap-2 px-3 py-3">
            <button
              onClick={() => setCatDrawerOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl btn-ghost"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center justify-center flex-1">
              <BrandLogo size="sm" />
            </div>
            <button
              onClick={() => setMobileSearchOpen((v) => !v)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition ${
                mobileSearchOpen ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'btn-ghost'
              }`}
            >
              <Search size={19} />
            </button>
            {/* Carrinho mobile */}
            <button onClick={() => setCartOpen(true)} className="relative w-10 h-10 flex items-center justify-center rounded-xl btn-ghost">
              <ShoppingCart size={19} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-gradient-to-br from-sky-400 to-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-glow">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>
          </div>
          {mobileSearchOpen && (
            <div className="px-3 pb-3 animate-fade-in">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar produtos..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-9 py-3 glass-input"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(''); setPage(1); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
          )}
          {/* Pílulas de categoria — mobile */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-3 pb-3">
            {['Todos', ...categorias].map((cat) => {
              const active = cat === 'Todos' ? !categoria : categoria === cat;
              return (
                <button
                  key={cat}
                  onClick={() => selectCategoria(cat === 'Todos' ? '' : cat)}
                  className={`pill ${active ? 'pill-active' : 'pill-idle'}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block max-w-5xl mx-auto px-4 py-4 space-y-4">
          <div className="flex items-center gap-4">
            <BrandLogo size="md" />
            <div className="relative flex-1 max-w-xl mx-auto">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 glass-input"
              />
            </div>
            {/* Carrinho desktop */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 btn-primary px-4 py-2.5 rounded-xl text-sm"
            >
              <ShoppingCart size={16} />
              {count > 0 ? `${count} item${count > 1 ? 's' : ''}` : 'Reserva'}
            </button>
          </div>
        </div>

        {/* Category pills — desktop */}
        <div className="hidden md:flex items-center gap-1 max-w-5xl mx-auto px-4 pb-3">
          <button
            onClick={() => scrollCats(-1)}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full btn-ghost"
          >
            <ChevronLeft size={14} />
          </button>
          <div ref={catsRef} className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5 flex-1">
            {['Todos', ...categorias].map((cat) => {
              const active = cat === 'Todos' ? !categoria : categoria === cat;
              return (
                <button
                  key={cat}
                  onClick={() => selectCategoria(cat === 'Todos' ? '' : cat)}
                  className={`pill ${active ? 'pill-active' : 'pill-idle'}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => scrollCats(1)}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full btn-ghost"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </header>

      {/* Drawers */}
      <CatDrawer
        open={catDrawerOpen}
        onClose={() => setCatDrawerOpen(false)}
        categorias={categorias}
        categoriaAtiva={categoria}
        onSelect={selectCategoria}
      />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Conteúdo */}
      <main className="max-w-5xl mx-auto px-3 md:px-4 py-4 md:py-6">

        {/* Faixa de boas-vindas */}
        {!search && !categoria && page === 1 && (
          <div className="glass-card relative overflow-hidden px-5 py-5 md:px-8 md:py-4 mb-5 animate-fade-up">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-8 w-36 h-36 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
            <div className="relative flex items-center gap-3">
              <Sparkles size={20} className="text-yellow-200 flex-shrink-0 hidden sm:block" />
              <div>
                <h1 className="font-display font-bold text-lg md:text-2xl text-white leading-tight">
                  Papelaria &amp; presentes com carinho
                </h1>
                <p className="text-white/60 text-xs md:text-sm mt-1">
                  Escolha seus produtos, reserve pelo WhatsApp e retire na loja. Simples assim. ✨
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && total > 0 && (
          <p className="text-xs text-white/40 mb-3">
            {total} produto{total !== 1 ? 's' : ''}{categoria && ` em ${categoria}`}{search && ` para "${search}"`}
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : produtos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-4">
              <ShoppingBag size={36} className="text-white/30" />
            </div>
            <p className="text-white/70 font-semibold text-base mb-1">Nenhum produto encontrado</p>
            {(search || categoria) && (
              <button
                onClick={() => { setSearch(''); setCategoria(''); setPage(1); }}
                className="mt-3 text-brand-300 hover:text-brand-200 text-sm font-medium transition"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {produtos.map((p) => <ProdutoCard key={p.id} produto={p} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 pb-4">
            <button
              disabled={page === 1}
              onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-10 h-10 flex items-center justify-center rounded-xl btn-ghost disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition ${
                  n === page ? 'btn-primary' : 'btn-ghost'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-10 h-10 flex items-center justify-center rounded-xl btn-ghost disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </main>

      {/* ── Barra flutuante da reserva (mobile) ─────────── */}
      {count > 0 && !cartOpen && (
        <div className="md:hidden fixed bottom-4 inset-x-3 z-30 animate-fade-up">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full flex items-center justify-between glass-strong rounded-2xl px-5 py-4 shadow-2xl shadow-black/50 active:scale-[0.98] transition"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="w-6 h-6 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center text-[11px] font-bold shadow-glow">
                {count > 9 ? '9+' : count}
              </span>
              Ver minha reserva
            </span>
            <span className="font-display font-bold text-amber-300">{formatPrice(cartTotal)}</span>
          </button>
        </div>
      )}

      <footer className="border-t border-white/10 mt-6">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col items-center gap-3 text-center">
          <BrandLogo size="sm" />
          <p className="text-xs text-white/30">
            Materiais escolares, de escritório e presentes &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
