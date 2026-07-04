import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ShoppingBag, Package, AlertTriangle, ShoppingCart, Check } from 'lucide-react';
import { api } from '../../lib/api';
import { getImageUrl } from './VitrinePage';
import { useCart } from '../../context/CartContext';

interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  categoria: string;
  estoque: number;
  estoqueMin: number;
  imagemUrl?: string;
}

function formatPrice(preco: number) {
  return Number(preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ProdutoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { add, isInCart } = useCart();
  const { data: produto, isLoading, isError } = useQuery<Produto>({
    queryKey: ['vitrine', 'produto', id],
    queryFn: () => api.get(`/vitrine/produtos/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) return <DetalheSkeleton />;

  if (isError || !produto) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-8">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={32} className="text-white/30" />
          </div>
          <p className="text-lg font-semibold text-white/70 mb-1">Produto não encontrado</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-violet-400 text-sm font-medium hover:text-violet-300 transition"
          >
            Voltar para a loja
          </button>
        </div>
      </div>
    );
  }

  const imgUrl = getImageUrl(produto.imagemUrl);
  const semEstoque = produto.estoque === 0;
  const baixoEstoque = produto.estoque > 0 && produto.estoque <= produto.estoqueMin;
  const noCart = isInCart(produto.id);

  return (
    <div className="min-h-screen">

      {/* Header */}
      <header className="backdrop-blur-xl bg-white/10 border-b border-white/10 sticky top-0 z-30 shadow-lg shadow-black/30">
        <div className="flex items-center gap-3 px-4 h-14 max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition flex-shrink-0"
          >
            <ArrowLeft size={18} className="text-white/80" />
          </button>
          <p className="text-sm font-semibold text-white/90 truncate">{produto.nome}</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto md:px-4 md:py-6">
        <div className="md:flex md:gap-6 md:items-start">

          {/* Imagem */}
          <div className="md:w-5/12 md:flex-shrink-0">
            <div className="aspect-square overflow-hidden bg-white/5 md:rounded-2xl md:border md:border-white/10">
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt={produto.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">
                  <ShoppingBag size={80} />
                </div>
              )}
            </div>
          </div>

          {/* Info + CTA */}
          <div className="md:flex-1 space-y-3 md:space-y-4">

            {/* Info panel */}
            <div className="bg-white/10 backdrop-blur-md border-y md:border border-white/10 md:rounded-2xl px-5 py-6 space-y-4">

              {/* Categoria */}
              <span className="inline-block text-xs font-bold text-violet-300 bg-violet-500/20 border border-violet-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                {produto.categoria}
              </span>

              {/* Nome */}
              <h1 className="text-xl font-bold text-white leading-snug">
                {produto.nome}
              </h1>

              {/* Preço */}
              <p className="text-3xl font-extrabold text-violet-300">
                {formatPrice(produto.preco)}
              </p>

              {/* Status de estoque */}
              <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10">
                <Package size={16} className="text-white/40 flex-shrink-0" />
                <span className="text-sm text-white/50">Disponibilidade:</span>
                {semEstoque ? (
                  <span className="text-sm font-bold text-red-400">Esgotado</span>
                ) : baixoEstoque ? (
                  <span className="text-sm font-bold text-amber-400 flex items-center gap-1">
                    <AlertTriangle size={13} />
                    Últimas {produto.estoque} unidades
                  </span>
                ) : (
                  <span className="text-sm font-bold text-emerald-400">Em estoque</span>
                )}
              </div>

              {/* Descrição */}
              {produto.descricao && (
                <div>
                  <p className="text-xs font-semibold text-white/40 mb-2 uppercase tracking-wide">Descrição</p>
                  <p className="text-sm text-white/70 leading-relaxed">{produto.descricao}</p>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="bg-white/10 backdrop-blur-md border-y md:border border-white/10 md:rounded-2xl px-4 py-4 md:p-5 space-y-3">
              {semEstoque ? (
                <div className="w-full py-4 rounded-2xl text-center text-base font-bold bg-white/5 border border-white/10 text-white/30">
                  Produto esgotado
                </div>
              ) : noCart ? (
                <button
                  onClick={() => navigate(-1)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white text-base font-bold shadow-lg shadow-emerald-900/40 active:scale-95 transition-all"
                >
                  <Check size={20} />
                  Adicionado à reserva
                </button>
              ) : (
                <button
                  onClick={() => add({ id: produto.id, nome: produto.nome, preco: produto.preco, imagemUrl: produto.imagemUrl })}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-base font-bold shadow-lg shadow-violet-900/40 active:scale-95 transition-all"
                >
                  <ShoppingCart size={20} />
                  Adicionar à reserva
                </button>
              )}

              <button
                onClick={() => navigate('/')}
                className="w-full py-3.5 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 hover:border-white/25 text-sm font-semibold text-white/70 hover:text-white transition"
              >
                Continuar comprando
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function DetalheSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="backdrop-blur-xl bg-white/10 border-b border-white/10 h-14" />
      <div className="max-w-4xl mx-auto md:px-4 md:py-6">
        <div className="md:flex md:gap-6">
          <div className="md:w-5/12 aspect-square bg-white/10 md:rounded-2xl" />
          <div className="md:flex-1 space-y-3 mt-3 md:mt-0">
            <div className="bg-white/10 border-y md:border border-white/10 md:rounded-2xl px-5 py-6 space-y-4">
              <div className="h-5 w-24 bg-white/10 rounded-full" />
              <div className="h-7 bg-white/10 rounded w-3/4" />
              <div className="h-9 bg-white/10 rounded w-1/2" />
              <div className="h-14 bg-white/10 rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded w-full" />
                <div className="h-4 bg-white/10 rounded w-5/6" />
              </div>
            </div>
            <div className="bg-white/10 border-y md:border border-white/10 md:rounded-2xl px-4 py-4 space-y-3">
              <div className="h-14 bg-white/10 rounded-2xl" />
              <div className="h-12 bg-white/10 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
