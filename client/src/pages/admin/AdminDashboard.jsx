import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { campeonatosApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useClub } from '../../context/ClubContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { club } = useClub();
  const [torneosTotales, setTorneosTotales] = useState(0);
  const [torneosActivos, setTorneosActivos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const torneos = await campeonatosApi.list();
        setTorneosTotales(torneos.length);
        setTorneosActivos(torneos.filter(t => t.estado !== 'FINALIZADO').length);
      } catch (err) {
        console.error('Error cargando torneos', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [club?.id]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">¡Hola, {user?.nombre?.split(' ')[0]}!</h1>
        <p className="text-slate-500">Bienvenido al panel de control de {club?.nombre || 'tu club'}.</p>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
            <span className="text-sm font-bold">ACT</span>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Torneos Activos</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {loading ? '-' : torneosActivos} <span className="text-sm font-normal text-slate-400">/ {torneosTotales}</span>
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">¿Qué querés gestionar hoy?</h2>
      
      {/* Tarjetas de acción rápida */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Link to="/admin/campeonatos" className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-padel hover:shadow-lg transition-all duration-300">
          <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-700 text-sm font-bold text-slate-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            TORNEOS
          </div>
          <h3 className="font-bold text-lg mb-1 group-hover:text-padel transition-colors">Mis Torneos</h3>
          <p className="text-sm text-slate-500 flex-1">Creá nuevos torneos o gestioná los existentes, inscripciones y partidos.</p>
          <span className="text-padel font-medium text-sm mt-4 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Ingresar <span>→</span>
          </span>
        </Link>

        <Link to="/admin/jugadores" className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-padel hover:shadow-lg transition-all duration-300">
          <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-700 text-sm font-bold text-slate-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            JUGADORES
          </div>
          <h3 className="font-bold text-lg mb-1 group-hover:text-padel transition-colors">Jugadores</h3>
          <p className="text-sm text-slate-500 flex-1">Administrá la base de datos de jugadores del club y sus categorías.</p>
          <span className="text-padel font-medium text-sm mt-4 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Ingresar <span>→</span>
          </span>
        </Link>

        <Link to="/admin/parejas" className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-padel hover:shadow-lg transition-all duration-300">
          <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-700 text-sm font-bold text-slate-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            PAREJAS
          </div>
          <h3 className="font-bold text-lg mb-1 group-hover:text-padel transition-colors">Parejas</h3>
          <p className="text-sm text-slate-500 flex-1">Revisá y gestioná las parejas registradas para competir.</p>
          <span className="text-padel font-medium text-sm mt-4 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Ingresar <span>→</span>
          </span>
        </Link>

        <Link to="/admin/clubs" className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-padel hover:shadow-lg transition-all duration-300">
          <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-700 text-sm font-bold text-slate-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            CLUB
          </div>
          <h3 className="font-bold text-lg mb-1 group-hover:text-padel transition-colors">Mi Club</h3>
          <p className="text-sm text-slate-500 flex-1">Configuración general de la información del club y otros administradores.</p>
          <span className="text-padel font-medium text-sm mt-4 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Ingresar <span>→</span>
          </span>
        </Link>

      </div>
    </div>
  );
}
