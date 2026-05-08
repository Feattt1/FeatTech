# Documentación Completa — Championship Padel

> **Para quién es este documento:** Está escrito para alguien que está comenzando a programar y quiere entender cómo funciona esta aplicación completa: qué hace cada archivo, por qué existe, y cómo modificarla en el futuro.

---

## Tabla de Contenidos

1. [¿Qué hace esta aplicación?](#1-qué-hace-esta-aplicación)
2. [Estructura general del proyecto](#2-estructura-general-del-proyecto)
3. [Tecnologías usadas y por qué](#3-tecnologías-usadas-y-por-qué)
4. [La base de datos — cómo se guardan los datos](#4-la-base-de-datos--cómo-se-guardan-los-datos)
5. [El servidor (backend)](#5-el-servidor-backend)
6. [El cliente (frontend)](#6-el-cliente-frontend)
7. [Cómo funciona el sistema de login](#7-cómo-funciona-el-sistema-de-login)
8. [Flujo completo: un torneo de principio a fin](#8-flujo-completo-un-torneo-de-principio-a-fin)
9. [Cómo está desplegado en internet](#9-cómo-está-desplegado-en-internet)
10. [Guía para hacer cambios frecuentes](#10-guía-para-hacer-cambios-frecuentes)

---

## 1. ¿Qué hace esta aplicación?

Championship Padel es una plataforma web para gestionar **torneos de pádel**. Está pensada para clubes deportivos.

**Funciones principales:**
- Los clubes pueden crear y administrar torneos
- Las parejas de jugadores se inscriben a los torneos
- El sistema genera automáticamente los grupos y los partidos
- Los administradores del club cargan los resultados
- Las clasificaciones se actualizan automáticamente
- Los jugadores pueden ver su perfil, inscripciones y resultados

**Roles de usuario:**
| Rol | Qué puede hacer |
|-----|----------------|
| `ADMIN` | Crear clubes, asignar administradores de clubes. Es el "superusuario" de toda la plataforma. |
| `JUGADOR` | Registrarse, inscribirse a torneos, ver resultados. |
| `PUBLICO` | Solo puede ver información pública (sin cuenta). |

Un usuario con rol `JUGADOR` también puede ser **administrador de un club específico** — esto se gestiona por separado en la tabla `ClubAdmin`.

---

## 2. Estructura general del proyecto

```
PadelTournamentApp/          <- Carpeta raíz del proyecto
|
+-- package.json             <- Configuración del "workspace" (une cliente y servidor)
+-- vercel.json              <- Configuración para desplegar en Vercel (internet)
|
+-- client/                  <- FRONTEND: lo que ve el usuario en el navegador
|   +-- package.json         <- Dependencias del frontend
|   +-- vite.config.js       <- Configuración del servidor de desarrollo
|   +-- tailwind.config.js   <- Configuración de estilos
|   +-- src/
|       +-- main.jsx         <- Punto de entrada de React
|       +-- App.jsx          <- Todas las rutas/páginas de la app
|       +-- index.css        <- Estilos globales
|       +-- components/      <- Piezas reutilizables (ej: Layout con header y footer)
|       +-- context/         <- Estado global compartido (usuario, club seleccionado)
|       +-- services/
|       |   +-- api.js       <- Todas las llamadas al servidor
|       +-- pages/           <- Una carpeta por "pantalla" de la app
|           +-- Home.jsx
|           +-- Login.jsx
|           +-- Campeonatos.jsx
|           +-- admin/       <- Páginas solo para administradores
|
+-- server/                  <- BACKEND: el servidor que maneja los datos
    +-- index.js             <- Punto de entrada del servidor Express
    +-- config/
    |   +-- db.js            <- Conexión a la base de datos
    +-- middleware/
    |   +-- auth.js          <- Verifica quién hace cada pedido
    +-- prisma/
    |   +-- schema.prisma    <- Definición de la base de datos (tablas y columnas)
    |   +-- seed-demo.js     <- Script para cargar datos de demo
    +-- routes/              <- Una ruta por "recurso" de la API
        +-- auth.js          <- Login y registro
        +-- clubs.js         <- Gestión de clubes
        +-- campeonatos.js   <- Torneos (el más grande)
        +-- jugadores.js     <- Jugadores
        +-- parejas.js       <- Parejas (equipos)
        +-- partidos.js      <- Partidos y resultados
        +-- grupos.js        <- Clasificaciones de grupos
        +-- inscripciones.js <- Inscripciones a torneos
        +-- notificaciones.js
```

**¿Cómo se comunican el cliente y el servidor?**

El cliente (navegador) hace pedidos HTTP al servidor. Estos pedidos se llaman "requests" y tienen diferentes tipos:
- `GET` — pedir información (ej: "dame la lista de torneos")
- `POST` — crear algo nuevo (ej: "crea un nuevo torneo")
- `PUT` — modificar algo existente (ej: "actualiza el estado del torneo")
- `DELETE` — eliminar algo

El servidor responde con datos en formato **JSON** (texto estructurado que JavaScript puede leer fácilmente).

---

## 3. Tecnologías usadas y por qué

### Frontend (lo que se ve en el navegador)

| Tecnología | Para qué sirve |
|-----------|----------------|
| **React 18** | Biblioteca para construir interfaces. En vez de escribir HTML directamente, escribís componentes en JavaScript que React convierte a HTML. |
| **React Router v6** | Maneja las diferentes "páginas" de la app sin recargar el navegador (Single Page Application). |
| **Tailwind CSS** | Sistema de estilos. En vez de escribir CSS tradicional, usás clases como `text-blue-500` o `flex items-center` directamente en el HTML. |
| **Vite** | Herramienta de desarrollo que hace que los cambios en el código se vean instantáneamente en el navegador. |

### Backend (el servidor)

| Tecnología | Para qué sirve |
|-----------|----------------|
| **Node.js** | Permite ejecutar JavaScript en el servidor (fuera del navegador). |
| **Express** | Framework para Node.js. Hace fácil crear rutas de API como `/api/torneos` o `/api/jugadores`. |
| **Prisma** | ORM (Object-Relational Mapper). Permite hablar con la base de datos usando JavaScript en vez de SQL directamente. |
| **PostgreSQL** | La base de datos donde se guardan todos los datos (alojada en Neon, en la nube). |
| **JWT (JSON Web Tokens)** | Sistema de autenticación. El servidor genera un "token" (código cifrado) cuando el usuario inicia sesión. El cliente lo guarda y lo envía en cada pedido para identificarse. |
| **bcryptjs** | Hashea (cifra) las contraseñas antes de guardarlas. Nunca se guarda la contraseña en texto plano. |
| **express-validator** | Valida que los datos que llegan al servidor sean correctos (ej: que un email tenga formato de email, que un número sea positivo). |

---

## 4. La base de datos — cómo se guardan los datos

La base de datos está definida en `server/prisma/schema.prisma`. Cada `model` es una tabla en la base de datos.

### Diagrama de relaciones

```
Club
 +-- ClubAdmin (muchos admins por club)
 +-- Campeonato (muchos torneos por club)
 |    +-- CategoriaTorneo (ej: "5ta Masculino", "4ta Femenino")
 |    +-- Inscripcion (parejas inscriptas)
 |    +-- Grupo (grupos del torneo)
 |    |    +-- ClasificacionGrupo (puntos y stats de cada pareja)
 |    |    +-- Partido (partidos del grupo)
 |    |         +-- SetResultado (resultado por set: 6-3, 4-6, etc.)
 |    +-- DisponibilidadHoraria (franjas de disponibilidad de canchas)
 +-- Jugador (jugadores del club)
 +-- Pareja (parejas de jugadores)

Usuario
 +-- ClubAdmin (puede ser admin de varios clubs)
 +-- Jugador (perfil de jugador)
```

### Explicación de cada tabla

**`Club`** — Los clubes deportivos.
```
id        -> Identificador único (texto, autogenerado)
nombre    -> Nombre del club (único, no pueden repetirse)
createdAt -> Cuándo se creó
```

**`Usuario`** — Todas las personas que tienen cuenta.
```
id       -> Identificador único
email    -> Email (único)
password -> Contraseña hasheada (nunca en texto plano)
nombre   -> Nombre completo
rol      -> ADMIN, JUGADOR, o PUBLICO
```

**`Jugador`** — El perfil deportivo de un usuario.
> Un `Usuario` puede o no tener un `Jugador` asociado. Un usuario con rol ADMIN puro no necesita perfil de jugador.
```
usuarioId -> A qué usuario pertenece este perfil
clubId    -> A qué club está asociado (puede ser null)
categoria -> Nivel del 1 al 7 (7 es el mejor)
```

**`Pareja`** — Un equipo de dos jugadores.
```
jugador1Id -> ID del primer jugador
jugador2Id -> ID del segundo jugador
nombre     -> Nombre opcional de la pareja
tipoPareja -> ABIERTO, MASCULINO, o FEMENINO
```

**`Campeonato`** — Un torneo.
```
nombre     -> Nombre del torneo
clubId     -> Club que organiza
estado     -> INSCRIPCIONES -> EN_CURSO -> FINALIZADO
fechaInicio / fechaFin -> Fechas del torneo
fechaInscripcionInicio / Fin -> Período de inscripciones
```

**`CategoriaTorneo`** — Una categoría dentro de un torneo.
> Un torneo puede tener múltiples categorías. Por ejemplo: "5ta Masculino" y "4ta Femenino" son dos categorías dentro del mismo torneo.
```
campeonatoId -> A qué torneo pertenece
categoria    -> Número del 1 al 7
modalidad    -> MASCULINO, FEMENINO, o MIXTO
nombre       -> Nombre personalizado (si se deja vacío, se genera automáticamente)
```

**`Inscripcion`** — Una pareja inscripta en un torneo.
```
campeonatoId -> En qué torneo
parejaId     -> Qué pareja
estado       -> PENDIENTE -> ACEPTADA (o RECHAZADA, o LISTA_ESPERA)
posicionLista -> Posición en lista de espera (si corresponde)
```

**`Grupo`** — Un grupo de la fase de grupos (ej: "Grupo A", "Grupo B").
```
campeonatoId -> A qué torneo pertenece
categoriaId  -> A qué categoría pertenece (puede ser null)
nombre       -> "Grupo A", "Grupo B", etc.
```

**`ClasificacionGrupo`** — Los puntos y estadísticas de cada pareja en su grupo.
```
grupoId         -> En qué grupo
parejaId        -> Qué pareja
puntos          -> Puntos acumulados (3 por victoria)
partidosJugados -> Cuántos partidos jugó
setsGanados     -> Cuántos sets ganó en total
gamesGanados    -> Cuántos games ganó en total
```

**`Partido`** — Un partido entre dos parejas.
```
fase              -> GRUPOS, CUARTOS, SEMIS, o FINAL
parejaLocalId     -> Pareja "local" (lado izquierdo)
parejaVisitanteId -> Pareja "visitante" (lado derecho)
setsLocal         -> Sets ganados por el local (ej: 2)
setsVisitante     -> Sets ganados por el visitante (ej: 1)
estado            -> PENDIENTE -> EN_JUEGO -> FINALIZADO
fechaHora         -> Cuándo se juega
pista             -> En qué cancha
ordenRonda        -> Número de orden dentro de la ronda (para bracket)
```

**`SetResultado`** — El resultado de cada set individual.
> Permite guardar "6-3, 3-6, 7-5" en vez de solo "2-1".
```
partidoId      -> A qué partido pertenece
numeroSet      -> Número del set (1, 2, 3...)
gamesLocal     -> Games del local en este set
gamesVisitante -> Games del visitante en este set
```

**`DisponibilidadHoraria`** — Franjas de disponibilidad de canchas para el torneo.
```
campeonatoId    -> A qué torneo
fecha           -> Qué día
horaInicio      -> Desde qué hora (ej: "09:00")
horaFin         -> Hasta qué hora (ej: "21:00")
cantidadCanchas -> Cuántas canchas disponibles ese día
duracionMinutos -> Duración de cada partido en minutos
```

---

## 5. El servidor (backend)

### Punto de entrada: `server/index.js`

Este es el archivo principal del servidor. Hace tres cosas importantes:

**1. Configura CORS** — Controla desde qué sitios web se puede acceder al servidor.
```javascript
const allowedOrigins = ['http://localhost:5173', ...]; // en desarrollo
// En producción, se lee de la variable de entorno ALLOWED_ORIGINS
```
Sin esto, el navegador bloquearía los pedidos del cliente al servidor por seguridad.

**2. Configura Rate Limiting** — Limita cuántas peticiones puede hacer cada usuario por minuto.
```javascript
// Login: máximo 10 intentos por 15 minutos (protege contra ataques de fuerza bruta)
// API en general: máximo 300 requests por minuto
```

**3. Registra todas las rutas:**
```javascript
app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/campeonatos', campeonatosRoutes);
// etc.
```
Esto significa que cualquier pedido que llegue a `/api/clubs` lo maneja `clubsRoutes`, cualquiera a `/api/campeonatos` lo maneja `campeonatosRoutes`, y así.

---

### Conexión a la base de datos: `server/config/db.js`

```javascript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

**¿Por qué este patrón?** El servidor está en Vercel como "funciones serverless" (se reinicia con cada pedido). Sin este código, cada pedido crearía una nueva conexión a la base de datos, agotando las conexiones disponibles. Con `globalThis`, la conexión se reutiliza entre pedidos mientras el servidor esté "caliente" en memoria.

---

### Middleware de autenticación: `server/middleware/auth.js`

El **middleware** es código que se ejecuta *antes* de que llegue el pedido a la función que lo maneja. Sirve para verificar permisos.

**`authenticate`** — Verifica que el pedido tenga un token JWT válido:
```
Pedido llega con header: "Authorization: Bearer eyJhbGc..."
    |
    v
authenticate verifica el token con JWT_SECRET
    |
    v
Si es válido: busca el usuario en la BD y lo pone en req.user
    |
    v
El resto del código puede usar req.user.id, req.user.rol, etc.
```

**`requireClubAdmin`** — Verifica que el usuario sea admin del club al que pertenece el recurso:
```javascript
const esAdminPlataforma = req.user?.rol === 'ADMIN';
const esAdminClub = (req.user?.clubsAdmin || []).includes(clubId);
if (!esAdminPlataforma && !esAdminClub) {
  return res.status(403).json({ error: 'No tienes permiso...' });
}
```

**`setClubIdFromCampeonato`**, **`setClubIdFromPartido`**, etc. — Estos middlewares buscan en la BD a qué club pertenece el recurso que se está modificando, para que `requireClubAdmin` pueda verificar el permiso:
```
Pedido: PUT /api/campeonatos/demo-t-1
    |
    v
setClubIdFromCampeonato: busca el campeonato, obtiene su clubId
    |
    v
requireClubAdmin: verifica que el usuario sea admin de ese clubId
    |
    v
El handler modifica el campeonato
```

**`optionalAuth`** — Igual que `authenticate`, pero si no hay token, no da error — simplemente pone `req.user = null`. Útil para rutas que son públicas pero cambian el comportamiento si el usuario está logueado.

---

### Las rutas del servidor

#### `routes/auth.js` — Login y registro

**POST `/api/auth/register`**
1. Valida que email, password y nombre estén presentes
2. Verifica que el email no esté ya registrado
3. Hashea la contraseña con bcrypt (transforma "mipassword" en algo como "$2a$10$...")
4. Crea el usuario en la BD
5. Crea automáticamente un perfil de Jugador si el rol es JUGADOR
6. Genera un JWT token
7. Devuelve el usuario y el token

**POST `/api/auth/login`**
1. Busca el usuario por email
2. Compara la contraseña con el hash guardado (bcrypt.compare)
3. Si coincide, genera un nuevo JWT token
4. Devuelve el usuario y el token

#### `routes/clubs.js` — Gestión de clubes

**GET `/api/clubs`** — Lista todos los clubes (público, sin autenticación).

**POST `/api/clubs`** — Crea un club nuevo. Solo el `ADMIN` de plataforma puede hacer esto.

**POST `/api/clubs/:clubId/admins`** — Asigna un administrador a un club. Se puede enviar el email del usuario o su ID.

#### `routes/campeonatos.js` — El archivo más complejo

Este archivo tiene más de 400 líneas y gestiona todo el ciclo de vida de un torneo.

**GET `/api/campeonatos`**
- Lista los torneos. Acepta filtros por `clubId`, `estado`, y paginación.
- Es público (no requiere login).

**POST `/api/campeonatos`** (requiere ser admin del club)
- Crea un torneo nuevo.
- El campo `clubId` viene del cliente.

**PUT `/api/campeonatos/:id`** (requiere ser admin del club)
- Actualiza los datos del torneo: nombre, fechas, estado, etc.
- Cuando el estado cambia a `EN_CURSO`, el servidor valida que haya parejas inscriptas.

**POST `/api/campeonatos/:id/grupos`** — Genera los grupos del torneo.
> Ejemplo: Si hay 8 parejas y se piden 2 grupos, crea "Grupo A" y "Grupo B" con 4 parejas cada uno. Distribuye las parejas de forma balanceada.

**POST `/api/campeonatos/:id/partidos/grupos`** — Genera los partidos de la fase de grupos.
> Para cada grupo, genera todos los partidos en formato "todos contra todos" (round-robin). Con 4 parejas en un grupo, genera 6 partidos (4 x 3 / 2 = 6).

**POST `/api/campeonatos/:id/partidos/eliminatorias`** — Genera el bracket de eliminatorias.
> Toma los mejores clasificados de cada grupo y genera los cuadros de cuartos de final, semifinales y final. Los partidos se crean con `fase: 'CUARTOS'`, `'SEMIS'`, y `'FINAL'`.

#### `routes/partidos.js` — Partidos y resultados

**PUT `/api/partidos/:id/resultado`** — Carga el resultado de un partido.

Este es el endpoint más importante para el flujo del torneo. Recibe los sets:
```json
{
  "sets": [
    { "gamesLocal": 6, "gamesVisitante": 3 },
    { "gamesLocal": 4, "gamesVisitante": 6 },
    { "gamesLocal": 7, "gamesVisitante": 5 }
  ]
}
```

El servidor:
1. Calcula automáticamente quién ganó cada set (quien tiene más games)
2. Cuenta los sets ganados por cada pareja (2-1 en el ejemplo)
3. Guarda los sets individuales en `SetResultado`
4. Actualiza el `Partido` con el resultado global
5. Si es un partido de grupos: recalcula la clasificación del grupo
6. Si es el partido M1 de un grupo de 3 equipos: asigna automáticamente las parejas para M2 y M3
7. Si es cuartos o semis: avanza automáticamente al ganador al siguiente partido del bracket

**Función `recalcularClasificacionGrupo`** — Esta función se llama cada vez que se carga un resultado de grupo. Es **idempotente**: si se llama varias veces, siempre produce el mismo resultado correcto (en vez de acumular puntos, los recalcula desde cero leyendo todos los partidos finalizados).

**Función `avanzarGanadorBracket`** — Cuando termina un cuarto de final, esta función automáticamente pone al ganador en la semifinal correcta, buscando el partido por `fase`, `campeonatoId`, `categoriaId` y `ordenRonda`.

#### `routes/inscripciones.js` — Inscripciones

**POST `/api/inscripciones`** — Inscribe una pareja a un torneo.

Lógica importante:
- Los jugadores solo pueden inscribirse si el torneo está en estado `INSCRIPCIONES` y dentro del período de fechas
- Los administradores del club pueden inscribir parejas en cualquier momento
- Si el torneo tiene `maxParejas` y ya está lleno, la inscripción va a `LISTA_ESPERA`
- Usa transacción con `isolationLevel: 'Serializable'` para evitar inscripciones duplicadas en caso de dos pedidos simultáneos

#### `routes/grupos.js` — Clasificaciones

**GET `/api/grupos`** — Lista los grupos de un torneo con las clasificaciones ordenadas por puntos.

**GET `/api/grupos/:id`** — Detalle de un grupo: clasificación completa, partidos y datos del campeonato.

---

## 6. El cliente (frontend)

### Punto de entrada: `client/src/main.jsx`

Este es el primer archivo que se ejecuta. Monta toda la aplicación de React:

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>        // Habilita la navegación entre páginas
    <AuthProvider>       // Provee el estado de autenticación a toda la app
      <ClubProvider>     // Provee el club seleccionado a toda la app
        <App />          // El componente principal con todas las rutas
      </ClubProvider>
    </AuthProvider>
  </BrowserRouter>
);
```

Los "Providers" son contenedores que comparten información con todos sus componentes hijos. Es como una variable global, pero de manera organizada. Cualquier componente dentro puede acceder al estado usando `useAuth()` o `useClub()`.

---

### Enrutamiento: `client/src/App.jsx`

Define qué componente se muestra para cada URL:

```jsx
// Si no hay club seleccionado, muestra solo el selector de club
if (!club) return <SelectorClub />;

// Si hay club, muestra las rutas normales
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="campeonatos" element={<Campeonatos />} />
    <Route path="campeonatos/:id" element={<CampeonatoDetalle />} />

    // Rutas protegidas (requieren login)
    <Route path="mi-perfil" element={<PrivateRoute><MiPerfil /></PrivateRoute>} />

    // Rutas de admin (requieren ser admin del club)
    <Route path="admin/campeonatos" element={<PrivateRoute adminOnly><AdminCampeonatos /></PrivateRoute>} />
  </Route>
</Routes>
```

El `:id` en una ruta es un parámetro dinámico. Si la URL es `/campeonatos/demo-t-1`, entonces en el componente `CampeonatoDetalle` se puede leer `const { id } = useParams()` para obtener `"demo-t-1"`.

**`PrivateRoute`** — Componente que verifica si el usuario está logueado. Si no, redirige a `/login`. Si además tiene `adminOnly`, verifica que sea admin del club actual.

---

### Estado global: `client/src/context/`

#### `AuthContext.jsx` — Estado de autenticación

Mantiene quién está logueado. Guarda el token y los datos del usuario en `localStorage` (memoria del navegador que persiste entre recargas de página).

```javascript
const { user, loading, login, logout } = useAuth();
// user     -> objeto con id, email, nombre, rol, etc. (null si no está logueado)
// loading  -> true mientras se verifica si hay sesión guardada
// login(usuario, token) -> guarda en localStorage y actualiza el estado
// logout() -> borra de localStorage
```

**¿Por qué localStorage?** Porque si el usuario cierra la pestaña y vuelve, sigue logueado. La alternativa (guardar solo en memoria) haría que pierda la sesión cada vez que recarga la página.

#### `ClubContext.jsx` — Club seleccionado

Mantiene qué club está activo. La app requiere seleccionar un club antes de ver nada.

```javascript
const { club, clubs, selectClub, clearClub } = useClub();
// club      -> el club actualmente seleccionado
// clubs     -> lista de todos los clubes disponibles
// selectClub(c) -> cambia el club activo y lo guarda en localStorage
```

Al cargar la app:
1. Pide la lista de clubes al servidor
2. Si había un club guardado en localStorage, verifica que todavía exista en la BD
3. Si existe, lo restaura automáticamente
4. Si no existe (fue eliminado), pide que el usuario elija de nuevo

---

### Servicio de API: `client/src/services/api.js`

Este archivo centraliza **todas las llamadas al servidor**. En vez de escribir `fetch('/api/campeonatos')` en cada componente, se usa `campeonatosApi.list()`.

**Función base `request()`:**
```javascript
async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Error en la petición');
  return data;
}
```

Esta función:
1. Construye la URL completa (`/api` + path)
2. Agrega el token de autenticación en el header `Authorization`
3. Si la respuesta no es OK (código 400, 401, 403, 500...), lanza un error con el mensaje del servidor
4. Si es OK, devuelve los datos en formato JavaScript (objeto o array)

**`getHeaders()`** — Agrega el token JWT al header:
```javascript
const token = localStorage.getItem('padel_token');
headers['Authorization'] = `Bearer ${token}`;
```

**`getClubId()`** — Lee el club actual desde localStorage para incluirlo en los pedidos que lo necesitan.

**APIs exportadas — ejemplos de uso:**
```javascript
campeonatosApi.list()                         // GET /campeonatos?clubId=...
campeonatosApi.get(id)                        // GET /campeonatos/:id
campeonatosApi.create(data)                   // POST /campeonatos
campeonatosApi.update(id, data)               // PUT /campeonatos/:id
campeonatosApi.generarGrupos(id, cantidad)    // POST /campeonatos/:id/grupos
partidosApi.actualizarResultado(id, sets)     // PUT /partidos/:id/resultado
inscripcionesApi.inscribir(campId, parejaId)  // POST /inscripciones
```

---

### Páginas principales

#### `pages/admin/AdminCampeonatos.jsx`
Lista los torneos del club actual. Permite crear nuevos torneos y navegar al editor de cada uno.

#### `pages/admin/AdminCampeonatoEditar.jsx`
Formulario para crear o editar un torneo. Incluye:
- Datos básicos (nombre, fechas, descripción)
- Gestión de categorías
- Inscripción de parejas
- Botones para generar grupos, partidos de grupos, y eliminatorias
- Cambio de estado del torneo

#### `pages/admin/AdminPartidos.jsx`
Vista de los partidos del torneo. Muestra:
- Tabla de clasificación de grupos
- Lista de partidos con estado (pendiente/finalizado)
- Formulario para cargar resultados (sets individuales)

#### `pages/admin/AdminHorarios.jsx`
Gestión de horarios y canchas:
- Define la disponibilidad de canchas por día
- Asigna horarios automáticamente a los partidos

#### `pages/Campeonatos.jsx`
Vista pública de los torneos del club. Cualquier visitante puede verla sin login.

#### `pages/CampeonatoDetalle.jsx`
Detalle de un torneo: grupos, clasificaciones, partidos, y bracket de eliminatorias.

---

### Componente Layout: `components/Layout.jsx`

Es el "marco" que envuelve todas las páginas. Contiene:
- **Header** con el logo y la navegación
- **Área principal** donde se renderiza la página actual (via `<Outlet />` de React Router)
- **Footer**

La barra de navegación cambia según el rol del usuario:
- Si está logueado y es admin: muestra las opciones de administración
- Si está logueado como jugador: muestra "Mi perfil" e "Inscripciones"
- Si no está logueado: muestra "Iniciar sesión" y "Registrarse"

---

## 7. Cómo funciona el sistema de login

### Registro (primera vez)

```
Usuario llena formulario -> POST /api/auth/register
     |
     v
Servidor verifica que el email no exista
     |
     v
Servidor hashea la contraseña (bcrypt)
     |
     v
Servidor crea Usuario en BD
     |
     v
Si es JUGADOR, crea también el perfil Jugador
     |
     v
Servidor genera token JWT (contiene userId, expira en 7 días)
     |
     v
Cliente guarda token en localStorage
Cliente guarda datos del usuario en localStorage
     |
     v
Usuario está logueado
```

### Login

```
Usuario ingresa email y contraseña -> POST /api/auth/login
     |
     v
Servidor busca usuario por email
     |
     v
Servidor compara contraseña con el hash guardado (bcrypt.compare)
     |
     v
Si coincide: genera nuevo token JWT
     |
     v
Cliente guarda token y datos
```

### Cada pedido autenticado

```
Cliente envía: GET /api/partidos
con header: "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
     |
     v
Middleware authenticate:
  1. Extrae el token del header
  2. Lo verifica con JWT_SECRET (clave secreta del servidor)
  3. Decodifica el payload: { userId: "abc123", iat: ..., exp: ... }
  4. Busca el usuario en la BD
  5. Pone el usuario en req.user
     |
     v
El handler del endpoint ejecuta con acceso a req.user
```

### ¿Qué es un JWT?

Es un texto codificado en tres partes separadas por puntos:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9   <- HEADER (algoritmo usado)
.eyJ1c2VySWQiOiJhYmMxMjMiLCJpYXQiOjE   <- PAYLOAD (datos: userId, fecha)
.FIRMA                                   <- Firma que verifica integridad
```

El PAYLOAD contiene el `userId`. La FIRMA verifica que nadie modificó el token. Solo el servidor con el `JWT_SECRET` puede verificar la firma — por eso el secreto nunca debe ser público.

---

## 8. Flujo completo: un torneo de principio a fin

### 1. Crear el torneo
Admin va a `/admin/campeonatos/nuevo` -> llena el formulario -> `POST /api/campeonatos` -> se crea en la BD con estado `INSCRIPCIONES`.

### 2. Agregar categorías (opcional)
Admin agrega categorías como "5ta Masculino" -> `POST /api/campeonatos/:id/categorias`.

### 3. Inscribir parejas
Las parejas se inscriben vía `POST /api/inscripciones`. El admin puede inscribir cualquier pareja; los jugadores solo pueden inscribirse durante el período habilitado.

### 4. Generar grupos
Admin hace click en "Generar grupos" -> `POST /api/campeonatos/:id/grupos` con el número de grupos deseado.

El servidor:
- Divide las parejas inscriptas aceptadas entre los grupos
- Crea los registros `Grupo` en la BD
- Crea los registros `ClasificacionGrupo` para cada pareja en su grupo (todos empiezan con 0 puntos)

### 5. Generar partidos de grupos
Admin hace click en "Generar partidos" -> `POST /api/campeonatos/:id/partidos/grupos`.

El servidor genera todos los partidos en formato round-robin para cada grupo. Con 4 parejas (A, B, C, D) genera: A-B, A-C, A-D, B-C, B-D, C-D (6 partidos en total).

### 6. Cambiar estado a EN_CURSO
Admin cambia el estado del torneo -> `PUT /api/campeonatos/:id` con `{ estado: 'EN_CURSO' }`.

### 7. Cargar resultados
Para cada partido que termina, admin ingresa los sets:
```
Set 1: 6-3  (local gana)
Set 2: 4-6  (visitante gana)
Set 3: 7-5  (local gana)
Resultado: 2-1 (local gana el partido)
```
El servidor recalcula automáticamente la clasificación del grupo.

### 8. Generar eliminatorias
Cuando terminan todos los partidos de grupos, admin genera eliminatorias -> `POST /api/campeonatos/:id/partidos/eliminatorias`.

El servidor toma los primeros clasificados de cada grupo y los pone en el bracket de cuartos de final.

### 9. Cargar resultados de eliminatorias
Al cargar un resultado de cuartos o semis, `avanzarGanadorBracket` automáticamente pone al ganador en el siguiente partido del bracket.

### 10. Finalizar torneo
Admin cambia estado a `FINALIZADO`.

---

## 9. Cómo está desplegado en internet

La aplicación está en **Vercel**, que es un servicio de hosting para proyectos web.

Hay **dos deployments** en Vercel:
- **Frontend** (cliente): sirve los archivos HTML/CSS/JS del React
- **Backend** (servidor): corre las funciones serverless de Express

**¿Qué es "serverless"?**
En vez de tener un servidor que corre constantemente, el código del servidor se convierte en "funciones" que solo se ejecutan cuando llega un pedido. Es más barato pero el primer pedido puede ser más lento (hay que "despertar" la función — esto se llama "cold start").

**El archivo `server/api/[...path].js`** es el punto de entrada serverless:
```javascript
import serverless from 'serverless-http';
import app from '../index.js';
export default serverless(app); // Envuelve Express en el formato que entiende Vercel
```

**Variables de entorno necesarias para funcionar en producción:**
- `DATABASE_URL` — URL de conexión a la base de datos de Neon (con pooling)
- `DATABASE_URL_UNPOOLED` — URL sin pooling (para migraciones)
- `JWT_SECRET` — Clave secreta para firmar tokens (nunca compartirla ni subirla a git)
- `ALLOWED_ORIGINS` — URLs del frontend que pueden hacer pedidos al servidor

**La base de datos** está en **Neon** (PostgreSQL en la nube, plan gratuito). La URL incluye credenciales de acceso y está guardada como variable de entorno en Vercel.

---

## 10. Guía para hacer cambios frecuentes

### Agregar un campo nuevo a la base de datos

Ejemplo: agregar un campo `foto` (URL de imagen) al perfil del Jugador.

**Paso 1 — Modificar el schema** (`server/prisma/schema.prisma`):
```prisma
model Jugador {
  // ... campos existentes ...
  foto  String?  // agregar esta línea (? significa que es opcional)
}
```

**Paso 2 — Aplicar el cambio a la BD:**
```bash
cd server
npx prisma db push
```

**Paso 3 — Actualizar la ruta del servidor** (`server/routes/jugadores.js`):
Agregar `foto` en los campos que se leen y/o escriben.

**Paso 4 — Actualizar el cliente:**
Mostrar el campo `foto` en los componentes que muestran jugadores.

---

### Agregar una nueva página de administración

**Paso 1 — Crear el componente** (`client/src/pages/admin/AdminNuevaPagina.jsx`):
```jsx
import { useState, useEffect } from 'react';

export default function AdminNuevaPagina() {
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    // Cargar datos al montar el componente
    fetch('/api/mi-recurso')
      .then(r => r.json())
      .then(setDatos);
  }, []);

  return (
    <div>
      <h1>Mi nueva página</h1>
      {datos.map(d => <div key={d.id}>{d.nombre}</div>)}
    </div>
  );
}
```

**Paso 2 — Agregar la ruta** (`client/src/App.jsx`):
```jsx
import AdminNuevaPagina from './pages/admin/AdminNuevaPagina';

// Dentro de <Routes>:
<Route path="admin/nueva-pagina" element={
  <PrivateRoute adminOnly>
    <AdminNuevaPagina />
  </PrivateRoute>
} />
```

**Paso 3 — Agregar el link en la navegación** (`client/src/components/Layout.jsx`):
```jsx
<Link to="/admin/nueva-pagina">Nueva Página</Link>
```

---

### Agregar un endpoint nuevo al servidor

Ejemplo: endpoint para obtener estadísticas de un jugador.

**En el archivo de rutas** (`server/routes/jugadores.js`):
```javascript
router.get('/:id/estadisticas', param('id').notEmpty(), async (req, res) => {
  try {
    const { id } = req.params;

    const jugador = await prisma.jugador.findUnique({
      where: { id },
      include: { /* relaciones necesarias */ }
    });

    if (!jugador) return res.status(404).json({ error: 'Jugador no encontrado' });

    // Calcular estadísticas...
    const estadisticas = { /* ... */ };

    res.json(estadisticas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

**Agregar la llamada en el cliente** (`client/src/services/api.js`):
```javascript
export const jugadoresApi = {
  // ... métodos existentes ...
  getEstadisticas: (id) => request(`/jugadores/${id}/estadisticas`),
};
```

---

### Cambiar los textos o estilos de un componente

Los estilos usan **Tailwind CSS**. Cada clase de Tailwind es una abreviación de CSS:

| Clase Tailwind | CSS equivalente |
|---------------|----------------|
| `text-blue-500` | color azul |
| `bg-white` | fondo blanco |
| `flex` | display flex (alinear elementos en fila) |
| `items-center` | centrar verticalmente |
| `p-4` | padding (espacio interior) de 1rem |
| `mt-2` | margin-top (espacio exterior arriba) de 0.5rem |
| `rounded-lg` | bordes redondeados |
| `shadow` | sombra sutil |
| `font-bold` | texto en negrita |
| `text-sm` | texto pequeño |
| `hidden` | oculto |
| `sm:block` | visible solo en pantallas >= 640px |

Para cambiar un botón de azul a verde, buscás `bg-blue-500` y lo reemplazás por `bg-green-500`.

---

### Entender un error del servidor

Cuando el servidor responde con error, el cliente muestra el mensaje. Los errores más comunes:

| Código HTTP | Significado | Causa típica |
|------------|-------------|-------------|
| `400` | Bad Request | Los datos enviados son inválidos (validación falló) |
| `401` | Unauthorized | No hay token o el token expiró |
| `403` | Forbidden | El token es válido pero no tiene permiso |
| `404` | Not Found | El recurso no existe |
| `409` | Conflict | Conflicto (ej: email ya registrado, cancha ocupada) |
| `500` | Server Error | Error inesperado en el servidor (ver logs de Vercel) |

Para ver los errores detallados en producción: ir al dashboard de Vercel -> Functions -> Logs.

---

### Ejecutar el proyecto en desarrollo local

**Requisitos previos:**
- Node.js instalado
- Archivo `server/.env` con las variables de entorno

**Instalar dependencias:**
```bash
npm install
```

**Iniciar en modo desarrollo** (cliente en `:5173`, servidor en `:3001`):
```bash
npm run dev
```

**Cargar datos de demo:**
```bash
cd server && node prisma/seed-demo.js
```
Nota: puede tardar 1-2 minutos por la latencia con la base de datos en Neon.

**Regenerar el cliente de Prisma** (necesario después de cambiar el schema):
```bash
cd server && npx prisma generate
```

**Aplicar cambios del schema a la BD:**
```bash
cd server && npx prisma db push
```

---

*Documento generado el 2026-04-17.*
