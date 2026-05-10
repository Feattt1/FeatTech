import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIAS = [
  { valor: 1, label: '1ra — Elite / Profesional' },
  { valor: 2, label: '2da — Avanzado alto' },
  { valor: 3, label: '3ra — Avanzado' },
  { valor: 4, label: '4ta — Intermedio alto' },
  { valor: 5, label: '5ta — Intermedio' },
  { valor: 6, label: '6ta — Principiante avanzado' },
  { valor: 7, label: '7ma — Principiante' },
];

export default function Register() {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    categoria: '5',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    try {
      const { usuario, token } = await authApi.googleLogin(credentialResponse.credential);
      login(usuario, token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al registrarse con Google');
    }
  };

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.nombre.trim()) return setError('El nombre es obligatorio');
    if (!form.apellido.trim()) return setError('El apellido es obligatorio');
    if (!form.telefono.trim()) return setError('El teléfono de contacto es obligatorio');
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    if (form.password !== form.confirmPassword) return setError('Las contraseñas no coinciden');

    setLoading(true);
    try {
      const { usuario, token } = await authApi.register({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email,
        password: form.password,
        telefono: form.telefono.trim(),
        categoria: parseInt(form.categoria, 10),
      });
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
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Crear cuenta</h1>
          <p className="text-slate-500">Completá todos tus datos para participar en torneos</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">

          {/* Google — registro rápido */}
          <div className="mb-6">
            <p className="text-xs text-center text-slate-400 mb-3 font-medium uppercase tracking-wider">Registro instantáneo</p>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('No se pudo registrar con Google')}
                shape="rectangular"
                size="large"
                width="400"
                text="signup_with"
                locale="es"
              />
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">Tu cuenta de Google se vincula automáticamente</p>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
            <span className="text-xs text-slate-400 font-medium">o registrate con email</span>
            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  name="nombre" type="text" value={form.nombre} onChange={handleChange}
                  placeholder="Juan" required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 text-slate-900 dark:text-slate-100 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  name="apellido" type="text" value={form.apellido} onChange={handleChange}
                  placeholder="García" required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 text-slate-900 dark:text-slate-100 transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <input
                name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="juan@email.com" required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 text-slate-900 dark:text-slate-100 transition"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Teléfono / Celular <span className="text-red-500">*</span>
              </label>
              <input
                name="telefono" type="tel" value={form.telefono} onChange={handleChange}
                placeholder="+598 912 345 678" required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 text-slate-900 dark:text-slate-100 transition"
              />
              <p className="text-xs text-slate-400 mt-1">Para que los organizadores puedan contactarte</p>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tu categoría de juego <span className="text-red-500">*</span>
              </label>
              <select
                name="categoria" value={form.categoria} onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 text-slate-900 dark:text-slate-100 transition"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.valor} value={c.valor}>{c.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">Podés actualizarla luego desde tu perfil</p>
            </div>

            {/* Contraseña */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  name="password" type="password" value={form.password} onChange={handleChange}
                  placeholder="••••••••" required minLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 text-slate-900 dark:text-slate-100 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirmar <span className="text-red-500">*</span>
                </label>
                <input
                  name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                  placeholder="••••••••" required minLength={6}
                  className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 transition text-slate-900 dark:text-slate-100 ${
                    form.confirmPassword && form.password !== form.confirmPassword
                      ? 'border-red-400 focus:ring-red-400/20'
                      : 'border-slate-300 dark:border-slate-600 focus:border-yellow-400 focus:ring-yellow-400/20'
                  }`}
                />
              </div>
            </div>
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-xs text-red-500 -mt-3">Las contraseñas no coinciden</p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold disabled:opacity-50 transition mt-2 text-base"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
            <span className="text-xs text-slate-400">¿Ya tenés cuenta?</span>
            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
          </div>

          <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
            <Link to="/login" className="text-yellow-600 hover:text-yellow-700 font-semibold">
              Iniciá sesión aquí
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
