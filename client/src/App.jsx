import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Layout from './components/Layout';
import SelectorClub from './pages/SelectorClub';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Campeonatos from './pages/Campeonatos';
import CampeonatoDetalle from './pages/CampeonatoDetalle';
import MisInscripciones from './pages/MisInscripciones';
import MiPerfil from './pages/MiPerfil';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTorneoControlCenter from './pages/admin/AdminTorneoControlCenter';
import AdminTorneoResumen from './pages/admin/AdminTorneoResumen';
import AdminCampeonatos from './pages/admin/AdminCampeonatos';
import AdminCampeonatoEditar from './pages/admin/AdminCampeonatoEditar';
import AdminPartidos from './pages/admin/AdminPartidos';
import AdminGestionarPartidos from './pages/admin/AdminGestionarPartidos';
import AdminHorarios from './pages/admin/AdminHorarios';
import AdminJugadores from './pages/admin/AdminJugadores';
import AdminParejas from './pages/admin/AdminParejas';
import AdminClubs from './pages/admin/AdminClubs';
import Ranking from './pages/Ranking';
import Americano from './pages/Americano';
import { useAuth } from './context/AuthContext';
import { useClub } from './context/ClubContext';

function isAdminOfClub(user, club) {
  if (!user || !club) return false;
  return user.rol === 'ADMIN' || (user.clubsAdmin || []).includes(club.id);
}

function PrivateRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();
  const { club } = useClub();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdminOfClub(user, club)) return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { club } = useClub();
  
  if (!club) {
    // El Americano es accesible sin club seleccionado
    return (
      <Routes>
        <Route path="/americano" element={<Layout />}>
          <Route index element={<Americano />} />
        </Route>
          <Route path="*" element={
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
              <header className="text-white shadow-lg border-b border-slate-800 bg-slate-900 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex justify-between items-center">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-wider">
                    <span className="bg-gradient-to-r from-padel to-padel-dark bg-clip-text text-transparent">
                      Torneos Padel
                    </span>
                    <span className="text-white"> UY</span>
                  </h1>
                  <Link
                    to="/americano"
                    className="px-4 py-2 rounded-xl bg-padel hover:bg-padel-light text-slate-900 font-bold text-sm transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)] hover:shadow-neon"
                  >
                    🎾 Torneo Americano
                  </Link>
                </div>
              </header>
              <main className="flex-1 flex items-center justify-center">
                <SelectorClub />
              </main>
            <footer className="bg-slate-900 text-white py-8 mt-auto border-t border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-sm">
                <p>© {new Date().getFullYear()} Championship Padel</p>
              </div>
            </footer>
          </div>
        } />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="campeonatos" element={<Campeonatos />} />
        <Route path="campeonatos/:id" element={<CampeonatoDetalle />} />
        <Route path="ranking" element={<Ranking />} />
        <Route path="americano" element={<Americano />} />

        <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />

        <Route path="mi-perfil" element={
          <PrivateRoute>
            <MiPerfil />
          </PrivateRoute>
        } />
        <Route path="mis-inscripciones" element={
          <PrivateRoute>
            <MisInscripciones />
          </PrivateRoute>
        } />

        <Route path="admin" element={
          <PrivateRoute adminOnly>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="admin/campeonatos" element={
          <PrivateRoute adminOnly>
            <AdminCampeonatos />
          </PrivateRoute>
        } />
        <Route path="admin/jugadores" element={
          <PrivateRoute adminOnly>
            <AdminJugadores />
          </PrivateRoute>
        } />
        <Route path="admin/parejas" element={
          <PrivateRoute adminOnly>
            <AdminParejas />
          </PrivateRoute>
        } />
        <Route path="admin/clubs" element={
          <PrivateRoute adminOnly>
            <AdminClubs />
          </PrivateRoute>
        } />
        <Route path="admin/campeonatos/nuevo" element={
          <PrivateRoute adminOnly>
            <AdminCampeonatoEditar />
          </PrivateRoute>
        } />
        <Route path="admin/campeonatos/:id" element={
          <PrivateRoute adminOnly>
            <AdminTorneoControlCenter />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="resumen" replace />} />
          <Route path="resumen" element={<AdminTorneoResumen />} />
          <Route path="ajustes" element={<AdminCampeonatoEditar />} />
          <Route path="inscripciones" element={<AdminPartidos initTab="inscripciones" />} />
          <Route path="grupos" element={<AdminPartidos initTab="grupos" />} />
          <Route path="eliminatorias" element={<AdminPartidos initTab="eliminatorias" />} />
          <Route path="horarios" element={<AdminHorarios />} />
          <Route path="gestionar-partidos" element={<AdminGestionarPartidos />} />
          {/* Redirecciones de rutas viejas */}
          <Route path="partidos" element={<Navigate to="../inscripciones" replace />} />
        </Route>
        {/* Redirección de ruta vieja de edición */}
        <Route path="admin/campeonatos/:id/editar" element={<Navigate to="../ajustes" replace />} />
      </Route>
    </Routes>
  );
}
