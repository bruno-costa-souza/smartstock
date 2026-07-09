import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Upload, X, ImageOff } from 'lucide-react';
import { api } from '../../../lib/api';
import { ESTOQUE_ATIVO } from '../../../lib/flags';
import { useToast } from '../../../context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  categoria: string;
  estoque: number;
  estoqueMin: number;
  imagemUrl?: string;
  ativo: boolean;
}

interface FormData {
  nome: string;
  descricao: string;
  preco: string;
  categoria: string;
  estoque: string;
  estoqueMin: string;
}

const FORM_EMPTY: FormData = { nome: '', descricao: '', preco: '', categoria: '', estoque: '0', estoqueMin: '5' };

function getImageUrl(imagemUrl?: string) {
  if (!imagemUrl) return null;
  return imagemUrl.startsWith('http') ? imagemUrl : `${API_URL}${imagemUrl}`;
}

function formatPrice(preco: number) {
  return Number(preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function estoqueColor(p: Produto) {
  if (p.estoque === 0) return 'text-red-400';
  if (p.estoque <= p.estoqueMin) return 'text-yellow-400';
  return 'text-green-400';
}

export function ProdutosAdminPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(FORM_EMPTY);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deletingProduto, setDeletingProduto] = useState<Produto | null>(null);

  const { data } = useQuery({
    queryKey: ['admin', 'produtos', page, search],
    queryFn: () =>
      api.get('/admin/produtos', { params: { page, limit: 20, search: search || undefined } }).then((r) => r.data),
  });

  const produtos: Produto[] = data?.data ?? [];
  const totalPages: number = data?.totalPages ?? 1;

  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao || undefined,
        preco: Number(formData.preco),
        categoria: formData.categoria,
        estoque: Number(formData.estoque),
        estoqueMin: Number(formData.estoqueMin),
      };
      let id = editingId;
      if (id) {
        await api.patch(`/admin/produtos/${id}`, payload);
      } else {
        const res = await api.post('/admin/produtos', payload);
        id = res.data.id;
      }
      if (imageFile && id) {
        const fd = new FormData();
        fd.append('imagem', imageFile);
        await api.post(`/admin/produtos/${id}/imagem`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'produtos'] });
      qc.invalidateQueries({ queryKey: ['vitrine'] });
      toast.success(editingId ? 'Produto atualizado!' : 'Produto criado!');
      closeModal();
    },
    onError: () => toast.error('Erro ao salvar produto'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/produtos/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'produtos'] });
      qc.invalidateQueries({ queryKey: ['vitrine'] });
      toast.success('Produto removido');
      setDeletingProduto(null);
    },
    onError: () => toast.error('Erro ao remover produto'),
  });

  function openCreate() {
    setEditingId(null);
    setForm(FORM_EMPTY);
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  }

  function openEdit(p: Produto) {
    setEditingId(p.id);
    setForm({
      nome: p.nome,
      descricao: p.descricao ?? '',
      preco: String(p.preco),
      categoria: p.categoria,
      estoque: String(p.estoque),
      estoqueMin: String(p.estoqueMin),
    });
    setImageFile(null);
    setImagePreview(getImageUrl(p.imagemUrl));
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function field(key: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function confirmDelete(p: Produto) {
    setDeletingProduto(p);
  }

  return (
    <div className="p-4 md:p-6">

      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-white">Produtos</h1>
          <p className="text-sm text-white/60 mt-0.5">Gerencie o catálogo da papelaria</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-glow text-white px-3 py-2 md:px-4 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Novo Produto</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>

      {/* Busca */}
      <input
        type="text"
        placeholder="Buscar produto..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full max-w-sm mb-4 px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand-400/60"
      />

      {/* ── Mobile: lista de cards ─────────────────────────── */}
      <div className="md:hidden space-y-2">
        {produtos.length === 0 ? (
          <p className="text-center text-white/45 text-sm py-10">Nenhum produto cadastrado</p>
        ) : (
          produtos.map((p) => {
            const imgUrl = getImageUrl(p.imagemUrl);
            return (
              <div key={p.id} className="bg-white/[0.07] backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-3 p-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
                  {imgUrl
                    ? <img src={imgUrl} alt={p.nome} className="w-full h-full object-cover" />
                    : <ImageOff size={16} className="text-white/30" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{p.nome}</p>
                  <p className="text-white/45 text-xs mt-0.5 truncate">
                    {p.categoria} · {formatPrice(p.preco)}
                  </p>
                  {ESTOQUE_ATIVO && (
                    <p className={`text-xs font-semibold mt-0.5 ${estoqueColor(p)}`}>
                      {p.estoque} un estoque
                    </p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(p)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/15 text-white/60 hover:text-white transition"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => confirmDelete(p)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-900/30 text-white/60 hover:text-red-400 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Desktop: tabela ───────────────────────────────── */}
      <div className="hidden md:block bg-white/[0.07] backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/60 text-xs uppercase">
              <th className="text-left px-4 py-3">Foto</th>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Categoria</th>
              <th className="text-right px-4 py-3">Preço</th>
              {ESTOQUE_ATIVO && <th className="text-right px-4 py-3">Estoque</th>}
              <th className="text-center px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => {
              const imgUrl = getImageUrl(p.imagemUrl);
              return (
                <tr key={p.id} className="border-b border-white/10 hover:bg-white/[0.06] transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                      {imgUrl
                        ? <img src={imgUrl} alt={p.nome} className="w-full h-full object-cover" />
                        : <ImageOff size={16} className="text-white/30" />
                      }
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{p.nome}</p>
                    {p.descricao && <p className="text-white/45 text-xs truncate max-w-[200px]">{p.descricao}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-brand-500/20 text-brand-300 rounded-full text-xs">{p.categoria}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-white">{formatPrice(p.preco)}</td>
                  {ESTOQUE_ATIVO && (
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${estoqueColor(p)}`}>{p.estoque}</span>
                      <span className="text-white/30 text-xs"> / min {p.estoqueMin}</span>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-white/15 rounded-lg text-white/60 hover:text-white transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => confirmDelete(p)} className="p-1.5 hover:bg-red-900/30 rounded-lg text-white/60 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {produtos.length === 0 && (
              <tr>
                <td colSpan={ESTOQUE_ATIVO ? 6 : 5} className="px-4 py-10 text-center text-white/45">Nenhum produto cadastrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg border border-white/15 text-sm text-white/60 disabled:opacity-40 hover:border-white/40">Anterior</button>
          <span className="px-3 py-1.5 text-sm text-white/45">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg border border-white/15 text-sm text-white/60 disabled:opacity-40 hover:border-white/40">Próxima</button>
        </div>
      )}

      {/* ── Modal ─────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="produto-modal-title" className="bg-[#101631]/90 backdrop-blur-2xl rounded-t-2xl sm:rounded-2xl border border-white/10 w-full sm:max-w-lg max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-[#101631]/95 backdrop-blur-2xl z-10">
              <h2 id="produto-modal-title" className="font-semibold text-white">{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-white/10 rounded-lg text-white/60"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-4">
              {/* Upload de imagem */}
              <div>
                <label className="block text-xs text-white/60 mb-2">Foto do produto</label>
                <div
                  className="aspect-video rounded-xl border-2 border-dashed border-white/15 flex items-center justify-center cursor-pointer hover:border-brand-400 transition-colors overflow-hidden bg-white/10"
                  onClick={() => fileRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/45">
                      <Upload size={24} />
                      <span className="text-xs">Toque para selecionar imagem</span>
                      <span className="text-xs text-white/30">JPG, PNG, WEBP — máx 5MB</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-white/60 mb-1">Nome *</label>
                  <input value={form.nome} onChange={(e) => field('nome', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand-400/60"
                    placeholder="Nome do produto" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-white/60 mb-1">Descrição</label>
                  <textarea value={form.descricao} onChange={(e) => field('descricao', e.target.value)} rows={2}
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand-400/60 resize-none"
                    placeholder="Descrição opcional" />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Categoria *</label>
                  <input value={form.categoria} onChange={(e) => field('categoria', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand-400/60"
                    placeholder="Ex: Cadernos" />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Preço (R$) *</label>
                  <input type="number" min="0" step="0.01" value={form.preco} onChange={(e) => field('preco', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand-400/60"
                    placeholder="0,00" />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Estoque inicial</label>
                  <input type="number" min="0" value={form.estoque} onChange={(e) => field('estoque', e.target.value)}
                    disabled={!ESTOQUE_ATIVO}
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-brand-400/60 disabled:opacity-40 disabled:cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Estoque mínimo</label>
                  <input type="number" min="0" value={form.estoqueMin} onChange={(e) => field('estoqueMin', e.target.value)}
                    disabled={!ESTOQUE_ATIVO}
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-brand-400/60 disabled:opacity-40 disabled:cursor-not-allowed" />
                </div>
                {!ESTOQUE_ATIVO && (
                  <p className="col-span-2 text-xs text-white/40">
                    Controle de estoque desativado por enquanto.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-white/10 sticky bottom-0 bg-[#101631]/95 backdrop-blur-2xl">
              <button onClick={closeModal} className="flex-1 py-3 rounded-xl border border-white/15 text-sm text-white/60 hover:bg-white/10 transition-colors">Cancelar</button>
              <button
                onClick={() => saveMutation.mutate(form)}
                disabled={saveMutation.isPending || !form.nome || !form.preco || !form.categoria}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-glow text-white text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de exclusão ─────────────────────────────── */}
      {deletingProduto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#101631]/90 backdrop-blur-2xl rounded-2xl border border-white/10 w-full max-w-sm p-5">
            <h2 className="font-semibold text-white mb-2">Remover produto</h2>
            <p className="text-sm text-white/60 mb-5">
              Tem certeza que deseja remover <span className="text-white font-medium">"{deletingProduto.nome}"</span>?
              Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingProduto(null)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 rounded-xl border border-white/15 text-sm text-white/60 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingProduto.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
