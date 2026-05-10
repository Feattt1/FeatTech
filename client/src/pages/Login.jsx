import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { usuario, token } = await authApi.login(email, password);
      login(usuario, token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    try {
      const { usuario, token } = await authApi.googleLogin(credentialResponse.credential);
      login(usuario, token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión con Google');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">Bienvenido</h1>
          <p className="text-slate-500 dark:text-slate-400">Iniciá sesión para acceder a tus torneos</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">

          {/* Error banner */}
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-start gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          {/* Google Login — primero y destacado */}
          <div className="mb-6">
            <p className="text-xs text-center text-slate-400 mb-3 font-medium uppercase tracking-wider">Acceso rápido</p>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('No se pudo iniciar sesión con Google')}
                useOneTap={false}
                shape="rectangular"
                size="large"
                width="368"
                text="continue_with"
                locale="es"
              />
            </div>
          </div>

          {/* Divisor */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
            <span className="text-xs text-slate-400 font-medium">o con email y contraseña</span>
            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
          </div>

          {/* Formulario email/password */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 text-slate-900 dark:text-slate-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 text-slate-900 dark:text-slate-100 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold disabled:opacity-50 transition text-base mt-1"
            >
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </button>
          </form>

          {/* Link a registro */}
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-6">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="text-yellow-600 hover:text-yellow-700 font-semibold">
              Registrate gratis
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Demo admin</p>
          <p className="text-xs text-slate-400 font-mono">admin@torneos.local / admin123</p>
        </div>
      </div>
    </div>
  );
}
