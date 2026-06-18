# Plan de Implementación de Backend Seguro (Node.js, Express, MySQL)

Este plan aborda las tareas de seguridad, arquitectura y configuración detalladas en `requerimientosLC.md`, priorizando código limpio, modular y listo para producción.

## User Review Required

> [!IMPORTANT]  
> Por favor, revisa la estructura de carpetas propuesta y las librerías que se instalarán. Confirma si estás de acuerdo para proceder a la ejecución de las tareas.

## Open Questions

> [!TIP]  
> 1. ¿Deseas utilizar `mysql2` nativo con consultas preparadas (como se menciona con `db.execute()`) o prefieres integrar un ORM como Sequelize? El plan actual asume el uso de `mysql2` directamente.
> 2. ¿Ya tienes una base de datos MySQL creada localmente para probar la conexión, o deseas que las credenciales en `.env.example` utilicen valores por defecto como `root` y una base de datos genérica?

## Proposed Changes

Implementaremos una arquitectura basada en capas (MVC parcial / API REST) integrando las medidas de seguridad requeridas.

### Estructura Base y Configuración Inicial

- **`package.json`**: Se inicializará el proyecto (`npm init -y`) y se instalarán las dependencias requeridas.
- Dependencias principales: `express`, `mysql2`, `helmet`, `express-rate-limit`, `bcrypt`, `jsonwebtoken`, `express-validator` (o Joi), `dotenv`.

### Archivos de Entorno y Git
#### [NEW] [.env](file:///c:/Users/Luis%20Chochom/Desktop/Proyecto-Dinamita.worktrees/LuisC/.env)
Contendrá las variables sensibles: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `PORT`.
#### [NEW] [.env.example](file:///c:/Users/Luis%20Chochom/Desktop/Proyecto-Dinamita.worktrees/LuisC/.env.example)
Plantilla con valores ficticios para el equipo de desarrollo.
#### [NEW] [.gitignore](file:///c:/Users/Luis%20Chochom/Desktop/Proyecto-Dinamita.worktrees/LuisC/.gitignore)
Excluirá la carpeta `node_modules/` y el archivo `.env`.

### Capa de Configuración (Base de Datos)
#### [NEW] [config/db.js](file:///c:/Users/Luis%20Chochom/Desktop/Proyecto-Dinamita.worktrees/LuisC/config/db.js)
Configuración de la conexión a MySQL usando un *pool* de conexiones para mayor rendimiento, preparado para utilizar `db.execute()` (Fase 3.1).

### Capa de Utilidades
#### [NEW] [utils/passwordHelper.js](file:///c:/Users/Luis%20Chochom/Desktop/Proyecto-Dinamita.worktrees/LuisC/utils/passwordHelper.js)
Funciones para aplicar *hashing* a contraseñas y compararlas utilizando `bcrypt` (Fase 2.1).

### Capa de Middlewares (Seguridad y Autenticación)
#### [NEW] [middlewares/authMiddleware.js](file:///c:/Users/Luis%20Chochom/Desktop/Proyecto-Dinamita.worktrees/LuisC/middlewares/authMiddleware.js)
Validación de JWT extrayendo el token del *Header* de Autorización (Fase 2.2).
#### [NEW] [middlewares/rateLimiter.js](file:///c:/Users/Luis%20Chochom/Desktop/Proyecto-Dinamita.worktrees/LuisC/middlewares/rateLimiter.js)
Limitador de solicitudes (brute-force) para rutas de autenticación usando `express-rate-limit` con mensaje personalizado en JSON (Fase 1.2).
#### [NEW] [middlewares/validatorMiddleware.js](file:///c:/Users/Luis%20Chochom/Desktop/Proyecto-Dinamita.worktrees/LuisC/middlewares/validatorMiddleware.js)
Funciones de validación y sanitización (contra XSS) usando `express-validator` (Fase 4.1).

### Capa de Controladores
#### [NEW] [controllers/authController.js](file:///c:/Users/Luis%20Chochom/Desktop/Proyecto-Dinamita.worktrees/LuisC/controllers/authController.js)
Lógica de registro (con sanitización, validación, bcrypt y db.execute) y login (con verificación bcrypt y generación de JWT).

### Capa de Rutas
#### [NEW] [routes/authRoutes.js](file:///c:/Users/Luis%20Chochom/Desktop/Proyecto-Dinamita.worktrees/LuisC/routes/authRoutes.js)
Definición de las rutas `/login` y `/register`, aplicando los middlewares de validación y rate-limiting.

### Punto de Entrada de la Aplicación
#### [NEW] [app.js](file:///c:/Users/Luis%20Chochom/Desktop/Proyecto-Dinamita.worktrees/LuisC/app.js)
Archivo principal que:
- Carga las variables de entorno (`dotenv`).
- Configura `helmet` desactivando `X-Powered-By` (Fase 1.1).
- Registra el parser de JSON de Express.
- Registra las rutas principales.
- Inicializa el servidor web.

## Verification Plan

### Manual Verification
1. Levantar el servidor y validar que el archivo `.env` se lea correctamente.
2. Hacer peticiones a las rutas de autenticación (`/api/auth/register`, `/api/auth/login`) con herramientas como Postman.
3. Verificar que las respuestas incluyan las cabeceras de `helmet` y no incluyan `X-Powered-By`.
4. Exceder el límite de peticiones (rate limiting) para validar la restricción tras 5 intentos.
5. Confirmar que la contraseña guardada en la base de datos se guarda como hash y se verifican correctamente los JWT para rutas protegidas.
