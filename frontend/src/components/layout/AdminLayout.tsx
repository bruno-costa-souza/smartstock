import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Package, BarChart3, LogOut, BookOpen, Menu, X, Calculator } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin/produtos', icon: Package, label: 'Produtos' },
  { to: '/admin/estoque', icon: BarChart3, label: 'Estoque' },
  { to: '/admin/calculadora', icon: Calculator, label: 'Calculadora' },
];

function SidebarContent({ onClose, onLogout, userNome, userEmail }: {
  onClose?: () => void;
  onLogout: () => void;
  userNome?: string;
  userEmail?: string;
}) {
  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800 flex-shrink-0">
        <BookOpen size={20} className="text-blue-400 flex-shrink-0" />
        <span className="font-bold text-white text-sm flex-1">Papelaria Admin</span>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-800 transition"
          >
            <X size={16} className="text-gray-400" />
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
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800">
        <div className="px-4 py-2 mb-1">
          <p className="text-xs text-gray-400 font-medium truncate">{userNome}</p>
          <p className="text-xs text-gray-600 truncate">{userEmail}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
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
    <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row">

      {/* ── Mobile: top bar ─────────────────────────────── */}
      <div className="md:hidden flex items-center gap-3 px-4 h-14 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-800 transition"
        >
          <Menu size={20} className="text-gray-300" />
        </button>
        <BookOpen size={18} className="text-blue-400 flex-shrink-0" />
        <span className="font-bold text-white text-sm flex-1">Papelaria Admin</span>
        <button
          onClick={handleLogout}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-800 transition"
        >
          <LogOut size={18} className="text-gray-400" />
        </button>
      </div>

      {/* ── Mobile: drawer overlay ───────────────────────── */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
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
      <aside className="hidden md:flex md:w-56 md:flex-col md:flex-shrink-0 border-r border-gray-800">
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
