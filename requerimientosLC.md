Fase 1: Protección de la Infraestructura Express (Middleware)
Tarea 1.1: Ofuscación y Cabeceras de Seguridad con helmet
Descripción: Configurar helmet para proteger la aplicación de vulnerabilidades web conocidas mediante la configuración correcta de cabeceras HTTP (XSS, Clickjacking, etc.).
Entregables:
[] Instalación de npm install helmet.
[] Inclusión del middleware en el archivo principal (app.js o server.js).
[] Deshabilitar explícitamente la cabecera X-Powered-By para no revelar que se usa Express.

Tarea 1.2: Mitigación de Ataques de Fuerza Bruta con express-rate-limit
Descripción: Limitar el número de solicitudes repetidas a endpoints sensibles (como /api/auth/login o /api/auth/register).
Entregables:
[] Instalación de npm install express-rate-limit.
[] Configuración de un límite estricto para rutas de autenticación (ej. máximo 5 a 10 intentos por cada 15 minutos por IP).
[] Mensaje de error personalizado en formato JSON: {"message": "Demasiados intentos, por favor intente más tarde."}.

Fase 2: Autenticación y Manejo de Sesiones
Tarea 2.1: Cifrado de Contraseñas con bcrypt
Descripción: Asegurar que ninguna contraseña se almacene en texto plano en la base de datos MySQL.
Entregables:
[] Instalación de npm install bcrypt.
[] Creación de una función utilitaria/helper para aplicar hashing con un factor de costo (salt rounds) de 10 o 12 antes de insertar en la base de datos.
[] Creación de la función de comparación (bcrypt.compare) para el proceso de login.

Tarea 2.2: Autenticación Segura con JWT (JSON Web Tokens)
Descripción: Implementar el flujo de emisión y validación de tokens para proteger las rutas privadas del sistema.
Entregables:
[] Instalación de npm install jsonwebtoken.
[] Generación de un token firmado que incluya únicamente datos no sensibles del usuario (ej. ID y rol) y un tiempo de expiración corto (ej. 1h o 2h).
[] Creación de un middleware de Express (ej. verifyToken.js) que intercepte las rutas protegidas, extraiga el token del Header Authorization (Bearer) y valide su autenticidad.


Fase 3: Seguridad en la Capa de Datos (MySQL)
Tarea 3.1: Prevención de SQL Injection (SQLi)
Descripción: Garantizar que todas las consultas a la base de datos MySQL utilicen consultas preparadas (queries parametrizadas) para neutralizar inyecciones de código.
Entregables:
[] Configuración del driver de la base de datos utilizando marcadores de posición (?) en lugar de concatenación directa de strings.
[] Priorizar el uso de db.execute() sobre db.query() ya que implementa consultas preparadas de forma nativa a nivel de servidor.

Fase 4: Sanetización y Configuración de Entorno
Tarea 4.1: Validación y Sanitización de Entradas (Inputs)
Descripción: Validar que los datos enviados por el usuario cumplan con el formato esperado y limpiar cualquier intento de Cross-Site Scripting (XSS).
entregable:
[] Uso de librerías como express-validator o joi para auditar los campos de req.body antes de procesarlos.
[] Escape de caracteres especiales en strings para evitar la ejecución de scripts maliciosos.

Tarea 4.2: Gestión de Variables de Entorno Seguras (.env)
Descripción: Aislar las credenciales críticas fuera del código fuente.
Entregables:
[] Instalación y configuración de dotenv.
[] Almacenar en el .env local: DB_PASSWORD, JWT_SECRET, puertos, etc.
[] Crear un archivo .env.example (con valores ficticios) para que tus 3 compañeros configuren sus propios entornos locales.
[] Crucial: Añadir .env al archivo .gitignore.

