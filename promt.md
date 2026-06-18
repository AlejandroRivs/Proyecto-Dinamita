<role>
Actúa como un programador experto en JavaScript, node.js y mysql
</role>

<context>
Estoy realizando un proyecto sobre una To-Do list y necesito crear el apartado de creacion de tarea, necesito que en este apartado se integre la opcion de crear, eliminar, agregar descripcion, agregar tiempo sugerido  y un apartado en el que se vean los usuarios disponibles para realizar la tarea, esto va ser en base a los usuarios que esten registrados, la opcion de crear y asignar tareas solo la puede realizar un administrador, quiero que crees un boton que me diriga a un panel de administrador en el que pueda ver todas las tareas creadas, a quien se le asigne y el estado de cada tarea(pendiente, finalizada y en revision) quiero que se me permita en cada tarea que fue enviada se ponga en estado de revision y despues en el mismo panel de admin yo poder auditar la tarea y luego de eso  poder presionar un boton que ponga el estado de la tarea en finalizado, por favor utiliza mysql2, node.js24.0. JavaScript para realizar todo, html, css, express pero no tan avanzado 
</context>

<task>
Escribe un script de JavaScript que simule el apartado de agregar tareas 
1. validar que el usuario que esta realizando esta tarea sea el administrador.
2. comprobar que los datos ingresados en la descripcion y el titulo de la tarea sean validos, permite el ingreso de numeros y letras 
3. Validar los usuarios que estan disponibles y sin ninguna tarea pendiente para poder asignarle la nueva tarea .
4.Crea una base de datos en mysql donde se guardaran los datos de este apartado y conectala al programa
5. Si todo está bien asignarle la tarea y que en la base de datos se guarde el usuario al que se le asigno la tarea , el tiempo asignado  y el titulo de la tarea que se le asigno y el estado en el que se encuentra la tarea .
6. en el apartado del panel de administracion quiero que despues de auditatar la tarea y darla por finalizada se modifique el estado en la base de datos y en el panel de administrador  
</task>

<constrains>
* No uses cosas avanzadas . Solo herramientas básicas y necesarias de stack que te di 
* Pon comentarios sencillos pero explicativo  en el código explicando qué hace cada parte importante.
* Usa nombres de variables que sean descriptivas
</constrains>

<outopu_format>
Por favor, muestra la respuesta de la siguiente manera
1. El código completo dentro de un bloque limpio para poder copiarlo.
2. Una explicación muy corta y con palabras sencillas de cómo funciona el programa
3. sugerencias de cambio 
4. me vas a dar un archivo ordenado de la manera en que te dare en la captura de pantalla
</outopu_format>