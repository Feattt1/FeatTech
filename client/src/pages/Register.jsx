import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', nombre: '', telefono: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { usuario, token } = await authApi.register(form);
      login(usuario, token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Crear cuenta</h1>
          <p className="text-slate-500">Completá tus datos para participar</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nombre completo</label>
              <input name="nombre" type="text" value={form.nombre} onChange={handleChange}
                placeholder="Tu nombre" required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-yellow-400 focus:outline-none text-slate-900 dark:text-slate-100 transition" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Correo electrónico</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="tu@email.com" required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-yellow-400 focus:outline-none text-slate-900 dark:text-slate-100 transition" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Contraseña</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="••••••••" required minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-yellow-400 focus:outline-none text-slate-900 dark:text-slate-100 transition" />
              <p className="text-xs text-slate-400 mt-1">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Teléfono (opcional)</label>
              <input name="telefono" type="tel" value={form.telefono} onChange={handleChange}
                placeholder="+598 912 345678"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-yellow-400 focus:outline-none text-slate-900 dark:text-slate-100 transition" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-slate-900 dark:text-slate-100 font-bold disabled:opacity-50 transition mt-2">
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
            <span className="text-xs text-slate-400">O</span>
            <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
          </div>

          <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-yellow-600 hover:text-yellow-700 font-semibold">
              Iniciá sesión
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-slate-400 text-xs">
          Al registrarte aceptás nuestros Términos de Servicio y Política de Privacidad
        </p>
      </div>
    </div>
  );
}
