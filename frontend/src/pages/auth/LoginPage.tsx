import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { BrandLogo } from '../../components/BrandLogo';

const loginSchema = z.object({
  email: z.string().min(1, 'Usuário obrigatório'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      await login(data.email, data.password);
      navigate('/admin/produtos');
    } catch {
      setError('E-mail ou senha inválidos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8 space-y-3">
          <BrandLogo size="md" />
          <p className="text-white/50 text-sm flex items-center justify-center gap-1.5">
            <LockKeyhole size={13} />
            Área administrativa
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h2 className="text-lg font-display font-semibold text-white mb-6">Entrar no sistema</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm text-white/60 mb-1.5">E-mail</label>
              <input
                {...register('email')}
                id="login-email"
                type="email"
                placeholder="seu@email.com"
                className="w-full px-4 py-2.5 glass-input"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm text-white/60 mb-1.5">Senha</label>
              <input
                {...register('password')}
                id="login-password"
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 glass-input"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary rounded-xl py-3 text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href="/forgot-password" className="text-sm text-brand-300 hover:text-brand-200 transition">
              Esqueci minha senha
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          Smart Stock © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
