# 🚀 FeatTech Monorepo — Software Studio Portfolio

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20with-Vercel-black?logo=vercel&logoColor=white)](https://www.featwebs.com)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20(Neon)-blue?logo=postgresql&logoColor=white)](https://neon.tech)
[![ORM](https://img.shields.io/badge/ORM-Prisma-2b2b2b?logo=prisma&logoColor=white)](https://www.prisma.io)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20Express-00d8ff?logo=react&logoColor=white)](#-tecnologías)

Bienvenido al repositorio unificado de **FeatTech**, el software studio detrás de soluciones digitales de ultra-alta fidelidad. Este repositorio está estructurado como un monorepo administrado con npm workspaces, facilitando el desarrollo concurrente de múltiples aplicaciones bajo una misma base de código escalable.

---

## 📁 Estructura del Monorepo

Nuestra base de código está organizada bajo el directorio `/apps/`:

### 1. 🌐 FeatWebs Landing Page (`apps/featwebs-landing`)
*   **Propósito**: Sitio web corporativo premium para la captación de clientes de **FeatWebs** (`featwebs.com`).
*   **Estética**: Diseño inmersivo de ultra-alta fidelidad en modo oscuro, con gradientes sutiles HSL, Glassmorphism y micro-animaciones fluidas.
*   **Tecnologías**: React + Vite (JS) + CSS Vanilla con fuentes premium de Google (`Outfit` y `Plus Jakarta Sans`) e iconos vectoriales `lucide-react`.

### 2. 🎾 Torneos Pádel UY — App de Gestión Deportiva
*   **Cliente (`apps/padel-client`)**: Aplicación web responsiva de alta fidelidad diseñada en **React 18** + **Vite** + **Tailwind CSS**. Cuenta con soporte para torneos estándares e individuales de formato **Americano** con lógicas algorítmicas avanzadas de emparejamientos y rotaciones.
*   **Servidor (`apps/padel-server`)**: API REST robusta impulsada por **Express** y **Prisma ORM**, estructurada para el óptimo funcionamiento con funciones Lambdas serverless en Vercel y base de datos serverless en **Neon PostgreSQL**.

---

## 🛠️ Inicio Rápido en Desarrollo Local

### Requisitos Previos
*   **Node.js** (versión 20 o superior recomendado, compatible con Node 26)
*   **NPM** (versión 10 o superior)
*   Una instancia activa de **PostgreSQL** (como Neon en la nube)

### 1. Instalar todas las dependencias
Ejecuta el siguiente comando en la raíz del repositorio para instalar recursivamente las dependencias de todos los workspaces:
```bash
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` dentro de la carpeta `apps/padel-server/` tomando como referencia el archivo `apps/padel-server/.env.example`:
```ini
DATABASE_URL="postgres://..."
DATABASE_URL_UNPOOLED="postgres://..."
JWT_SECRET="una_clave_secreta_muy_larga"
GOOGLE_CLIENT_ID="tu_google_client_id"
```

### 3. Ejecución de Entornos Locales

Puedes iniciar los entornos de desarrollo de forma independiente o simultánea:

*   **Ejecutar TODO simultáneamente** (Landing + Cliente Pádel + Servidor API):
    ```bash
    npm run dev
    ```
*   **Ejecutar solo la Landing Page de FeatWebs** (Puerto `5173` o siguiente disponible):
    ```bash
    npm run dev:landing
    ```
*   **Ejecutar solo la App de Torneos Pádel** (Cliente en puerto `5173` y Servidor en puerto `3001`):
    ```bash
    npm run dev:client
    # En otra terminal:
    npm run dev:server
    ```

---

## 🌐 Estrategia de Despliegue en Vercel

El monorepo está perfectamente optimizado para compilarse y desplegarse en **Vercel** mediante tres proyectos independientes enlazados al mismo repositorio:

1.  **FeatWebs Landing Page**:
    *   **Directorio raíz**: `apps/featwebs-landing`
    *   **Dominios**: `www.featwebs.com` y `featwebs.com`
2.  **Torneos Pádel UY Frontend**:
    *   **Directorio raíz**: `apps/padel-client`
    *   **Dominios**: `torneos.featwebs.com` (Subdominio dedicado de alta fidelidad)
    *   *Incluye reglas SPA universal contra errores 404 en su vercel.json local.*
3.  **Torneos Pádel UY Backend**:
    *   **Directorio raíz**: `apps/padel-server`
    *   **Dominios**: `api.featwebs.com` (o la URL de backend dedicada)

---

Desarrollado y mantenido con orgullo por **FeatWebs** © 2026.
