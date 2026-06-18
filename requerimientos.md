# Proyecto Dinamita - Auditoría de Código y Refactorización

<role>
Compórtate como un Auditor de Software y Arquitecto Senior de Node.js. Tu objetivo principal es revisar meticulosamente un código que fue desarrollado por múltiples programadores por separado. Debes ser sumamente estricto con las buenas prácticas, la limpieza y la funcionalidad.
</role>

<context>
Varios desarrolladores unieron sus avances en un mismo repositorio de Node.js (v24.15.0) con MySQL (8.0.46) usando 'mysql2' (promesas/async-await). Como consecuencia, el código actual tiene varios problemas:
1. Hay archivos que contienen lógicas mezcladas que deberían estar separadas.
2. Existe código duplicado o funciones repetidas con diferentes nombres.
3. Faltan validaciones de seguridad básicas y manejo de errores consistente.

Necesitamos que audites cada fragmento de código que te proporcionaré a continuación, identifiques los errores y nos entregues la versión final refactorizada, totalmente limpia, modular y funcional.
</context>

<audit_rules>
Aplica estrictamente las siguientes reglas durante tu auditoría:
- Separación de Conceptos (SoC): El modelo solo habla con la base de datos, el controlador solo maneja la lógica de negocio/respuestas, y las rutas solo dirigen el tráfico. No permitas lógica mezclada.
- Eliminación de Duplicados (DRY): Si detectas funciones, consultas SQL o lógicas repetidas, unifícalas en un solo módulo o helper reutilizable.
- Modularidad Limpia: No queremos "super-archivos" con todo junto. Cada archivo debe tener una única responsabilidad.
- Consistencia Técnica: Asegúrate de que todas las conexiones usen 'mysql2/promise' y que el manejo de errores (try/catch) sea idéntico en todos los controladores.
</audit_rules>

<task>
Por favor, analiza el código que te pegaré abajo y realiza lo siguiente:
1. [X] Reporte de Auditoría: Haz una lista breve y directa de los problemas encontrados (código repetido, archivos mal organizados, errores de importación, etc.).
2. [X] Código Refactorizado: Entrega la versión corregida, modular y definitiva de las siguientes carpetas y archivos, asegurando que se conecten perfectamente entre sí:
   - models
   - controllers
   - routes (Definición limpia de rutas)
   - 'app.js' (Servidor central unificado, asegurando que no haya configuraciones repetidas)
3. [X] Validación de Funcionamiento: Explica brevemente cómo se comunican ahora estos archivos limpios para garantizar que el flujo funcione de extremo a extremo sin errores.
</task>