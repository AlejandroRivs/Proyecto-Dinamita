# Proyecto Dinamita - Flujo de Autenticación (Login)

<role>
Compórtate como un ingeniero FullStack Senior. Trabajas en un equipo de desarrollo, por lo que debes entregar código totalmente modular, aislado y fácil de integrar en el futuro.
</role>

<context>
Estamos desarrollando una aplicación utilizando Node.js (versión v24.15.0) con JavaScript para el Backend, y MySQL (versión 8.0.46) para la base de datos. Para la conexión y consultas a la base de datos utilizaremos estrictamente la librería 'mysql2' (usando promesas/async-await).

Varias personas trabajamos en el proyecto y no queremos mezclar código de producción aún. No crees configuraciones globales complejas ni arquitecturas robustas. Entrega los módulos solicitados de forma independiente y, únicamente para el archivo de pruebas finales, levanta el servidor mínimo básico como se detalla en las tareas.

Historias de usuario a cubrir:
- Yo como colaborador necesito iniciar sesión para poder trabajar y ver mis tareas.
- Yo como líder necesito iniciar sesión para poder administrar el tiempo de mi grupo a cargo.
- Yo como admin necesito iniciar sesión para tener acceso total al sistema.
</context>

<task>
1. Base de Datos: Crea el script SQL para la tabla 'usuario' compatible con MySQL 8.0.46. Incluye los campos básicos (id, email, password, etc.) y un campo tipo ENUM para diferenciar los roles: 'admin', 'lider' y 'colaborador'.
2. Modelo (models/): Crea el archivo del modelo de la tabla 'usuario' utilizando la librería 'mysql2'. Debe incluir la lógica modular para buscar un usuario por su email para la autenticación.
3. Controlador (controllers/): Crea el controlador del modelo para gestionar la lógica del login (recibir datos, llamar al modelo y simular la respuesta de éxito/error según el rol).
4. Frontend: Crea la interfaz de inicio de sesión en HTML puro (solo estructura básica con formulario, inputs y botón). Nómbralo obligatoriamente 'login.html' y asegúrate de enlazar el archivo CSS de estilos.
5. Rutas (routes/): Crea un archivo independiente llamado 'routes.js'. Debe contener únicamente la definición de las rutas necesarias para este flujo de login (usando Express.Router).
6. Estilos (public/css/): Crea un archivo 'styles.css' con un diseño ultra básico y limpio (por ejemplo, centrar el formulario, fuentes legibles y un botón visible). El objetivo es puramente visual para las pruebas, sin frameworks.
7. Servidor de pruebas: Crea un archivo básico 'app.js' (o 'server.js') que inicialice Express únicamente para levantar el servidor en un puerto local. Debe importar el archivo 'routes.js' y servir de forma estática la carpeta de archivos públicos (con 'login.html' y 'styles.css') para poder realizar las pruebas de inicio de sesión de extremo a extremo.
</task>
