# Scrum PROYECTO DINAMITA

## STACK 
### JavaScript, node 24.0, express, mysql2

## Sprints


## Roles

### Scrum Master
    - Alejandro Rivas

### Equipo de desarrollo
    - Luis Chochom
    - Maria Jose Castillo
    - Jose Julian Lopez
    - Alejandro Rivas

## Ceremonias
## Sprint Planning
    - Sprint goal
        Lograr una mejor organizacion mediante la creacion de una aplicacion WEB que nos permita gestionar el tiempo y la productividad, medido por los criterios del administrador.
    - Sprint Backlog
        Entregar un prototipo con:
        - Inicio de sesion
        - Creacion de usuarios, administrador y tareas
        - Asignaciones de tareas
        - Control de tiempos

### Daily meeting
    16/06/26
    ¿Qué hice ayer? (Avances del día anterior).
    Luis    
        - Analisis de estructura de la seguridad
    Maria Jose
        - Estructurar modulo de usuario
    Jose Julian
        - Analisis de estructura
    Alejandro
        - Analisis de estructura

    ¿Qué haré hoy? (Plan de trabajo para el día en curso).
    Luis
        - Implementacion de codigo 
    Maria Jose
        - Pruebas
    Jose Julian
        - Inicio de programacion
    Alejandro
        - Inicio de programacion

    ¿Tengo algún impedimento? (Bloqueos que retrasan el trabajo).
    Luis
        - N/A
    Maria Jose
        - N/A
    Jose Julian
        - N/A
    Alejandro
        - N/A


### Sprint review
    N/A aun

### Sprint technical review
    N/A aun

### Sprint retrospective
    N/A aun

----------------------------------------------------------------------------------------------------------------------------------------------------------------------
Aquí tienes el resumen consolidado de los tres contenidos. Se eliminaron las repeticiones y se unificaron los criterios para que sirva como una única fuente de verdad para el desarrollo.
## 1. Arquitectura y Seguridad

* Plataforma: Aplicación web Responsiva (optimizada para PC y Móvil).
* Control de Acceso: Login con usuario y contraseña, roles claros y capas de seguridad para evitar vulnerabilidades.
* Roles del Sistema:
* Administrador: Gestiona, asigna, frena procesos y visualiza métricas globales.
   * Colaborador: Planifica su día, ejecuta tareas principales/extras y visualiza sus puntos.

## 2. Gestión de Tareas (Módulo del Administrador)

* Creación: Formulario con Título, Descripción y una lista de colaboradores disponibles para asignar.
* Asignación: Al asignar una tarea, esta debe aparecer automáticamente en la vista del colaborador correspondiente.
* Control de Tiempo Global: El administrador tiene la potestad de "parar tareas" de forma general, lo que detiene el cronómetro y bloquea cualquier modificación de tiempo por parte del colaborador.

## 3. Ejecución de Tareas y Tiempo (Módulo del Colaborador)

* Tablero Visual: Vista ordenada con tres estados estrictos: Pendiente, En Proceso y Completado.
* Control de Cronómetro: Cada tarea tiene botones de Iniciar (Play), Pausar y Finalizar.
* Automatización por Tiempo: El cronómetro tiene un tiempo designado. Al finalizar dicho tiempo, la tarea se cierra y desaparece automáticamente del flujo activo.

## 4. Sistema de Gamificación y Recompensas (Puntos y Tareas Extras)

* Perfil del Usuario: Apartado que muestra el acumulado de puntos del colaborador.
* Metas de Incentivo: Visualización de metas de puntos semanales y visualización de recompensas mensuales.
* Desbloqueo de Tareas Extras: Las tareas extras (opcionales/bonos) solo se habilitan y visualizan cuando el colaborador ha completado con éxito el 100% de sus tareas principales. El colaborador puede autoasignarse estas tareas.

## 5. Métricas, Rendimiento e Inteligencia

* Dashboard General: Vista de progreso con estadísticas de productividad y porcentaje de tareas realizadas.
* Medición Cuantitativa: Registro exacto de cuánto tiempo tarda un colaborador en resolver cada tarea para medir su desempeño.
//* Algoritmo de Sugerencias: El sistema debe reconocer en qué áreas es bueno cada colaborador y emitir sugerencias automáticas de asignación.


----------------------------------------------------------------------------------------------------------------------------------------------------------------------
## 🚀 MVP: Objetivos de la Primera Semana
Para iniciar el desarrollo sin desvíos, el enfoque prioritario es habilitar estos tres componentes base:

   1. Login funcional con diferenciación de roles (Admin / Colaborador).
   2. Creación y asignación automática de tareas del Administrador al Colaborador.
   3. Control de tiempos básico (botones de Iniciar/Pausar y cronómetro activo en la tarea).

2. Cómo dividirse el trabajo en el "Sprint 0" (Primeros 3 días)Antes de programar las funciones de la empresa, dediquen un mini-ciclo a dejar listos los cimientos. Dividan el trabajo así:Tú (Persona 1): Diseña el diagrama de la Base de Datos (Tablas Usuarios y Tareas) y escribe los scripts de creación u ORM.Persona 3 (Backend): Configura el servidor base (Node.js, Python, etc.), la conexión a la base de datos que hiciste tú y monta la estructura de carpetas.Personas 2 y 4 (Frontend): Diseñan en papel o Figma el boceto rápido de la pantalla del Administrador y la pantalla del Colaborador. Configuran el proyecto base de Frontend (React, Vue, etc.).Si necesitas ayuda para planificar los siguientes pasos, crear una estructura de base de datos o definir las tareas específicas para tu equipo, avísame y lo desarrollamos juntos.