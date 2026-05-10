import { useState, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { inscripcionesApi, campeonatosApi } from '../../services/api';

export default function AdminTorneoResumen() {
  const { id } = useParams();
  const { campeonato, setCampeonato } = useOutletContext();
  const [stats, setStats] = useState({
    total: 0,
    aceptadas: 0,
    pendientes: 0,
    byCat: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const insc = await inscripcionesApi.list({ campeonatoId: id });
        const aceptadasList = insc.filter(i => i.estado === 'ACEPTADA');
        const byCat = {};
        aceptadasList.forEach(i => {
          const catId = i.categoriaId || (i.categoria && i.categoria.id);
          if (catId) {
            byCat[catId] = (byCat[catId] || 0) + 1;
          }
        });
        setStats({
          total: insc.length,
          aceptadas: aceptadasList.length,
          pendientes: insc.filter(i => i.estado === 'PENDIENTE').length,
          byCat
        });
      } catch (err) {
        console.error('Error cargando stats', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [id]);

  const handleToggleEstado = async () => {
    const nuevoEstado = campeonato.estado === 'INSCRIPCIONES' ? 'EN_CURSO' : 'FINALIZADO';
    if (!confirm(`¿Cambiar estado a ${nuevoEstado}?`)) return;
    
    try {
      const actualizado = await campeonatosApi.update(id, { estado: nuevoEstado });
      setCampeonato(actualizado);
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">
    <div className="h-20 bg-slate-100 rounded-xl" />
    <div className="h-40 bg-slate-100 rounded-xl" />
  </div>;

  return (
    <div className="space-y-6">
      {/* Metricas Rapidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Total Inscripciones</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">Aceptadas</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.aceptadas}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Pendientes</p>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.pendientes}</p>
        </div>
      </div>

      {/* Estado y Cupos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cupos por Categoría */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Cupos por Categoría</h3>
          <div className="space-y-3">
            {campeonato.categorias?.map(cat => {
              const inscritas = stats.byCat[cat.id] || 0;
              const max = cat.maxParejas || 0;
              const porcentaje = max > 0 ? (inscritas / max) * 100 : 0;
              
              return (
                <div key={cat.id} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{cat.nombre || `${cat.categoria}ta ${cat.modalidad}`}</span>
                    <span className="text-xs font-medium text-slate-500">
                      {max > 0 ? `${inscritas} / ${max}` : `${inscritas} inscritos`}
                    </span>
                  </div>
                  {max > 0 && (
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${porcentaje > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(porcentaje, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Acciones de Estado */}
        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-padel/20 flex items-center justify-center text-sm font-bold text-slate-700 dark:text-padel">
            {campeonato.estado === 'INSCRIPCIONES' ? 'INS' : campeonato.estado === 'EN_CURSO' ? 'CUR' : 'FIN'}
          </div>
          <div>
            <h4 className="font-bold text-xl uppercase tracking-tight">
              {campeonato.estado === 'INSCRIPCIONES' ? 'Inscripciones Abiertas' : 
               campeonato.estado === 'EN_CURSO' ? 'Torneo en Curso' : 'Torneo Finalizado'}
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              Gestioná el avance del torneo desde aquí.
            </p>
          </div>
          {campeonato.estado !== 'FINALIZADO' && (
            <button
              onClick={handleToggleEstado}
              className="w-full py-3 bg-slate-900 dark:bg-padel text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition shadow-lg"
            >
              {campeonato.estado === 'INSCRIPCIONES' ? 'Cerrar Inscripciones y Empezar' : 'Finalizar Torneo'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
