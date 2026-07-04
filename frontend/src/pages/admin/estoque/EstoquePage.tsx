import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PackagePlus, PackageMinus, AlertTriangle, Package, X } from 'lucide-react';
import { api } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';

interface ProdutoResumo {
  id: string;
  nome: string;
  categoria: string;
  estoque: number;
  estoqueMin: number;
  preco: number;
  imagemUrl?: string;
}

interface ResumoEstoque {
  total: number;
  baixoEstoque: ProdutoResumo[];
  semEstoque: ProdutoResumo[];
  produtos: ProdutoResumo[];
}

interface Movimentacao {
  id: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
  quantidade: number;
  motivo?: string;
  estoqueApos: number;
  createdAt: string;
  produto: { nome: string; categoria: string };
}

type ModalTipo = 'ENTRADA' | 'SAIDA' | null;

export function EstoquePage() {
  const qc = useQueryClient();
  const toast = useToast();

  const [modal, setModal] = useState<ModalTipo>(null);
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [motivo, setMotivo] = useState('');

  const { data: resumo } = useQuery<ResumoEstoque>({
    queryKey: ['admin', 'estoque', 'resumo'],
    queryFn: () => api.get('/admin/estoque/resumo').then((r) => r.data),
  });

  const { data: historico } = useQuery({
    queryKey: ['admin', 'estoque', 'historico'],
    queryFn: () => api.get('/admin/estoque/historico', { params: { limit: 30 } }).then((r) => r.data),
  });

  const movimentos: Movimentacao[] = historico?.data ?? [];

  const movMutation = useMutation({
    mutationFn: () =>
      api.post(`/admin/estoque/${modal === 'ENTRADA' ? 'entrada' : 'saida'}`, {
        produtoId,
        quantidade: Number(quantidade),
        motivo: motivo || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'estoque'] });
      qc.invalidateQueries({ queryKey: ['vitrine'] });
      toast.success(modal === 'ENTRADA' ? 'Entrada registrada!' : 'Saída registrada!');
      setModal(null);
      setProdutoId('');
      setQuantidade('1');
      setMotivo('');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Erro ao registrar movimentação'),
  });

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-white">Estoque</h1>
          <p className="text-sm text-gray-400 mt-0.5">Controle de entradas e saídas</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setModal('ENTRADA')}
            className="flex items-center gap-1.5 bg-green-700 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <PackagePlus size={16} />
            <span className="hidden sm:inline">Entrada</span>
          </button>
          <button
            onClick={() => setModal('SAIDA')}
            className="flex items-center gap-1.5 bg-red-700 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <PackageMinus size={16} />
            <span className="hidden sm:inline">Saída</span>
          </button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2"><Package size={14} /> Total de produtos</div>
          <p className="text-2xl font-bold text-white">{resumo?.total ?? '—'}</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-yellow-900/40 p-4">
          <div className="flex items-center gap-2 text-yellow-400 text-xs mb-2"><AlertTriangle size={14} /> Baixo estoque</div>
          <p className="text-2xl font-bold text-yellow-400">{resumo?.baixoEstoque.length ?? '—'}</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-red-900/40 p-4">
          <div className="flex items-center gap-2 text-red-400 text-xs mb-2"><AlertTriangle size={14} /> Sem estoque</div>
          <p className="text-2xl font-bold text-red-400">{resumo?.semEstoque.length ?? '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas de estoque */}
        {(resumo?.semEstoque.length || 0) + (resumo?.baixoEstoque.length || 0) > 0 && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h2 className="text-sm font-semibold text-white mb-3">Alertas de estoque</h2>
            <div className="space-y-2">
              {[...(resumo?.semEstoque ?? []), ...(resumo?.baixoEstoque ?? [])].map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-800">
                  <div>
                    <p className="text-sm text-white">{p.nome}</p>
                    <p className="text-xs text-gray-500">{p.categoria}</p>
                  </div>
                  <span className={`text-sm font-bold ${p.estoque === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {p.estoque} un
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Histórico */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-white">Últimas movimentações</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {movimentos.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">Nenhuma movimentação ainda</p>
            ) : (
              movimentos.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${m.tipo === 'ENTRADA' ? 'bg-green-900/40' : 'bg-red-900/40'}`}>
                    {m.tipo === 'ENTRADA' ? <PackagePlus size={14} className="text-green-400" /> : <PackageMinus size={14} className="text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{m.produto.nome}</p>
                    <p className="text-xs text-gray-500">{m.motivo || m.tipo} · estoque: {m.estoqueApos}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${m.tipo === 'ENTRADA' ? 'text-green-400' : 'text-red-400'}`}>
                      {m.tipo === 'ENTRADA' ? '+' : '-'}{m.quantidade}
                    </p>
                    <p className="text-xs text-gray-600">{new Date(m.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal entrada/saída */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className={`font-semibold ${modal === 'ENTRADA' ? 'text-green-400' : 'text-red-400'}`}>
                {modal === 'ENTRADA' ? 'Registrar Entrada' : 'Registrar Saída'}
              </h2>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Produto *</label>
                <select
                  value={produtoId}
                  onChange={(e) => setProdutoId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecione um produto...</option>
                  {(resumo?.produtos ?? []).map((p) => (
                    <option key={p.id} value={p.id}>{p.nome} (estoque: {p.estoque})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Quantidade *</label>
                <input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Motivo (opcional)</label>
                <input
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder={modal === 'ENTRADA' ? 'Ex: Compra fornecedor' : 'Ex: Venda balcão'}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-800">
              <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-lg border border-gray-700 text-sm text-gray-400 hover:bg-gray-800 transition-colors">Cancelar</button>
              <button
                onClick={() => movMutation.mutate()}
                disabled={movMutation.isPending || !produtoId || !quantidade}
                className={`flex-1 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 transition-colors ${modal === 'ENTRADA' ? 'bg-green-700 hover:bg-green-600' : 'bg-red-700 hover:bg-red-600'}`}
              >
                {movMutation.isPending ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
