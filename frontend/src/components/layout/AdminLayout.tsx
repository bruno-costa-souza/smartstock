import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Package, BarChart3, LogOut, Menu, X, Calculator, KeyRound, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ESTOQUE_ATIVO } from '../../lib/flags';
import { BrandMark } from '../BrandLogo';

const NAV = [
  { to: '/admin/produtos', icon: Package, label: 'Produtos' },
  { to: '/admin/estoque', icon: BarChart3, label: 'Estoque' },
  { to: '/admin/calculadora', icon: Calculator, label: 'Calculadora' },
  { to: '/admin/senha', icon: KeyRound, label: 'Trocar Senha' },
].filter((item) => ESTOQUE_ATIVO || item.to !== '/admin/estoque');

function SidebarContent({ onClose, onLogout, userNome, userEmail }: {
  onClose?: () => void;
  onLogout: () => void;
  userNome?: string;
  userEmail?: string;
}) {
  return (
    <div className="flex flex-col h-full glass-strong border-y-0 border-l-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10 flex-shrink-0">
        <BrandMark className="flex-1" />
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg btn-ghost"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-glow'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <Store size={18} />
          Ver loja
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <div className="px-4 py-2 mb-1">
          <p className="text-xs text-white/60 font-medium truncate">{userNome}</p>
          <p className="text-xs text-white/30 truncate">{userEmail}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ── Mobile: top bar ─────────────────────────────── */}
      <div className="md:hidden flex items-center gap-3 px-4 h-14 glass-strong border-x-0 border-t-0 sticky top-0 z-30 flex-shrink-0">
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl btn-ghost"
        >
          <Menu size={19} />
        </button>
        <BrandMark className="flex-1" />
        <button
          onClick={handleLogout}
          className="w-9 h-9 flex items-center justify-center rounded-xl btn-ghost hover:text-red-400"
        >
          <LogOut size={17} />
        </button>
      </div>

      {/* ── Mobile: drawer overlay ───────────────────────── */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-64 z-50 md:hidden shadow-2xl">
            <SidebarContent
              onClose={() => setDrawerOpen(false)}
              onLogout={handleLogout}
              userNome={user?.nome}
              userEmail={user?.email}
            />
          </div>
        </>
      )}

      {/* ── Desktop: sidebar fixa ────────────────────────── */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:flex-shrink-0">
        <SidebarContent
          onLogout={handleLogout}
          userNome={user?.nome}
          userEmail={user?.email}
        />
      </aside>

      {/* ── Conteúdo principal ───────────────────────────── */}
      <main className="flex-1 overflow-auto min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
