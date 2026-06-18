# Guía de Fusión e Integración (Merge) - Módulo de Control de Tiempo e Incentivos

Este documento detalla los pasos necesarios para integrar de forma limpia tu código (control de tiempo y gamificación) con el de tus compañeros de desarrollo al realizar el `merge` en Git.

---

## 1. Cambios en la Base de Datos (SQL)
Si tus compañeros ya tienen su propia tabla `tasks`, deberán ejecutar las siguientes consultas SQL en la base de datos compartida para agregar las columnas requeridas por tu módulo de productividad sin perder sus datos existentes:

```sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS complexity ENUM('Simple', 'Media', 'Compleja') DEFAULT 'Simple';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS points_awarded INT DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS total_duration_ms BIGINT DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_started_at DATETIME DEFAULT NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS global_locked BOOLEAN DEFAULT FALSE;
```

---

## 2. Variables de Entorno (`.env`)
Se deben añadir las siguientes variables al archivo `.env` del proyecto unificado para controlar de forma centralizada la gamificación:

```env
# Configuración del Sistema de Puntos (PP)
PP_POR_HORA_AHORRADA=10
PP_COMPLEJIDAD_SIMPLE=5
PP_COMPLEJIDAD_MEDIA=15
PP_COMPLEJIDAD_COMPLEJA=30
PP_PENALIZACION_ERROR=5
```

---

## 3. Dependencias de Node.js (`package.json`)
Asegúrate de que las siguientes dependencias estén instaladas en la rama principal:

```bash
npm install mysql2 express-session dotenv
```

---

## 4. Registro de Rutas en el Archivo Principal (`app.js` o `server.js`)
Si tus compañeros usan un archivo principal diferente, solo deben importar y montar los endpoints de tu módulo de esta manera:

```javascript
// 1. Importar Rutas
const loginRoutes = require('./routes/login');
const tareasRoutes = require('./routes/tareas');

// 2. Middleware de Sesiones (Requerido para el control de login y roles)
const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_SECRET || 'dinamita_secret_key_123',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// 3. Registrar rutas en la API
app.use('/api/auth', loginRoutes);
app.use('/api/tasks', tareasRoutes);

// 4. Servir la carpeta public (si no lo hacen ya)
app.use(express.static(path.join(__dirname, 'public')));
```

---

## 5. Checklist de Archivos Nuevos e Independientes
Estos son los archivos que has creado y que no deberían generar conflictos, ya que son exclusivos de tu funcionalidad:

* **Controladores:**
  - `controllers/taskController.js`
* **Modelos:**
  - `models/tareaModel.js`
* **Rutas:**
  - `routes/tareas.js`
* **Vistas y Estilos:**
  - `public/admin.html`
  - `public/colaborador.html`
  - `public/estilos_css/styles.css`
* **Utilidades:**
  - `utils/timeFormatter.js`
