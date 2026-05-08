import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { campeonatosApi } from '../services/api';
import { useClub } from '../context/ClubContext';

export default function Home() {
  const { club } = useClub();
  const [campeonatos, setCampeonatos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    campeonatosApi.list({})
      .then(setCampeonatos)
      .catch(() => setCampeonatos([]))
      .finally(() => setLoading(false));
  }, [club?.id]);

  const formatDate = (d) => new Date(d).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Agrupar campeonatos por estado
  const campeonatosPorEstado = {
    INSCRIPCIONES: campeonatos.filter(c => c.estado === 'INSCRIPCIONES'),
    EN_CURSO: campeonatos.filter(c => c.estado === 'EN_CURSO'),
    FINALIZADO: campeonatos.filter(c => c.estado === 'FINALIZADO'),
  };

  const estadoConfig = {
    INSCRIPCIONES: {
      label: 'Inscripciones Abiertas',
      tagBg: 'bg-blue-100 text-blue-700'
    },
    EN_CURSO: {
      label: 'En Curso',
      tagBg: 'bg-green-100 text-green-700'
    },
    FINALIZADO: {
      label: 'Finalizados',
      tagBg: 'bg-slate-200 text-slate-700'
    },
  };

  const renderizarGrupo = (estado, campeonatos) => {
    if (campeonatos.length === 0) return null;
    const config = estadoConfig[estado];

    return (
      <section key={estado} className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {config.label}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {campeonatos.length} {campeonatos.length === 1 ? 'torneo' : 'torneos'}
            </p>
          </div>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campeonatos.map((c) => (
            <motion.div
              key={c.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={`/campeonatos/${c.id}`}
                className="group card card-hover block overflow-hidden h-full"
              >
              <div className="h-2 bg-gradient-to-r from-padel to-padel-dark group-hover:from-padel-light group-hover:to-padel transition-colors" />
              <div className="p-6">
                <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold mb-3 ${config.tagBg}`}>
                  {config.label}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1 group-hover:text-yellow-600 transition line-clamp-2">
                  {c.nombre}
                </h3>
                {c.categorias?.length > 0 && (
                  <p className="text-xs text-slate-500 mb-3">
                    {c.categorias.map((cat) => cat.nombre || `${cat.categoria}ta ${cat.modalidad.charAt(0) + cat.modalidad.slice(1).toLowerCase()}`).join(' · ')}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-3 mt-3">
                  <span>{formatDate(c.fechaInicio)} — {formatDate(c.fechaFin)}</span>
                  <span>{c._count?.inscripciones ?? 0} inscriptos</span>
                </div>
              </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="mb-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          {/* Fondo decorativo */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-padel/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-padel-dark/20 rounded-full blur-[100px]"></div>
          </div>

          {/* Contenido */}
          <div className="relative z-10 px-6 py-20 sm:px-12 sm:py-24 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              Bienvenido a <br/>
              <span className="text-padel drop-shadow-[0_0_20px_rgba(204,255,0,0.4)]">
                Torneos Padel UY
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-light">
              La plataforma premium para gestionar y vivir tus torneos de pádel. 
              Inscripciones, cruces, partidos y horarios en un solo lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link 
                  to="/campeonatos"
                  className="btn-primary w-full block"
                >
                  Explorar Torneos →
                </Link>
              </motion.div>
              <a 
                href="#campeonatos"
                className="px-8 py-3 text-white font-medium hover:text-padel transition-colors"
              >
                Ver más ↓
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas rápidas */}
      {!loading && campeonatos.length > 0 && (
        <section className="mb-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="card p-8 text-center group">
            <div className="text-4xl font-black text-slate-900 dark:text-white group-hover:text-padel-dark transition-colors">{campeonatos.length}</div>
            <p className="text-slate-500 text-sm mt-3 font-medium uppercase tracking-wider">Torneos Totales</p>
          </div>
          <div className="card p-8 text-center group">
            <div className="text-4xl font-black text-blue-600 group-hover:text-blue-500 transition-colors">{campeonatosPorEstado.INSCRIPCIONES.length}</div>
            <p className="text-slate-500 text-sm mt-3 font-medium uppercase tracking-wider">En Inscripciones</p>
          </div>
          <div className="card p-8 text-center group">
            <div className="text-4xl font-black text-padel-dark group-hover:text-padel transition-colors">{campeonatosPorEstado.EN_CURSO.length}</div>
            <p className="text-slate-500 text-sm mt-3 font-medium uppercase tracking-wider">En Curso</p>
          </div>
          <div className="card p-8 text-center group">
            <div className="text-4xl font-black text-slate-400">{campeonatosPorEstado.FINALIZADO.length}</div>
            <p className="text-slate-500 text-sm mt-3 font-medium uppercase tracking-wider">Finalizados</p>
          </div>
        </section>
      )}

      {/* Sección de torneos */}
      <section id="campeonatos">
        {loading ? (
          <div className="text-slate-500 text-lg py-16 text-center">
            <p>Cargando campeonatos...</p>
          </div>
        ) : campeonatos.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No hay campeonatos disponibles</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Vuelve pronto para ver emocionantes torneos de pádel</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link 
                to="/campeonatos"
                className="block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
              >
                Explorar todas las secciones →
              </Link>
            </motion.div>
          </div>
        ) : (
          <>
            {renderizarGrupo('INSCRIPCIONES', campeonatosPorEstado.INSCRIPCIONES)}
            {renderizarGrupo('EN_CURSO', campeonatosPorEstado.EN_CURSO)}
            {renderizarGrupo('FINALIZADO', campeonatosPorEstado.FINALIZADO)}
          </>
        )}
      </section>
    </div>
  );
}
