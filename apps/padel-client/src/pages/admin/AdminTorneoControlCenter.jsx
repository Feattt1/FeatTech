import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { campeonatosApi } from '../../services/api';

const MENU = [
  { path: 'resumen', label: 'Resumen' },
  { path: 'inscripciones', label: 'Inscripciones' },
  { path: 'grupos', label: 'Fase de Grupos' },
  { path: 'eliminatorias', label: 'Eliminatorias' },
  { path: 'horarios', label: 'Canchas y Horarios' },
  { path: 'ajustes', label: 'Ajustes del Torneo' },
];

export default function AdminTorneoControlCenter() {
  const { id } = useParams();
  const location = useLocation();
  const [campeonato, setCampeonato] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campeonatosApi.get(id)
      .then(setCampeonato)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8">Cargando centro de control...</div>;
  if (!campeonato) return <div className="p-8 text-red-500">Torneo no encontrado</div>;

  const currentPath = location.pathname.split('/').pop();
  const activeItem = MENU.find(m => m.path === currentPath) || MENU[0];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 -mx-4 sm:-mx-6 lg:-mx-8 -my-6 sm:-my-10">
      
      {/* Sidebar Lateral */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <Link to="/admin" className="text-xs text-slate-500 hover:text-blue-600 mb-2 inline-block font-medium">
            ← Volver al Panel
          </Link>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white leading-tight truncate" title={campeonato.nombre}>
            {campeonato.nombre}
          </h2>
          <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
            (campeonato.estado || 'INSCRIPCIONES') === 'INSCRIPCIONES' ? 'bg-blue-100 text-blue-700' :
            campeonato.estado === 'EN_CURSO' ? 'bg-green-100 text-green-700' :
            'bg-slate-200 text-slate-600'
          }`}>
            {(campeonato.estado || 'INSCRIPCIONES').replace('_', ' ')}
          </span>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {MENU.map(item => {
            const isActive = currentPath === item.path || (currentPath === id && item.path === 'resumen');
            return (
              <Link
                key={item.path}
                to={`/admin/campeonatos/${id}/${item.path}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-padel/20 text-slate-900 dark:text-padel border border-padel/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Link to={`/campeonatos/${id}`} className="flex items-center justify-center gap-2 w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition">
            Ver vista pública
          </Link>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-900 relative">
        <div className="max-w-5xl mx-auto">
          <header className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {activeItem.label}
            </h1>
          </header>
          
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <Outlet context={{ campeonato, setCampeonato }} />
          </div>
        </div>
      </main>

    </div>
  );
}
