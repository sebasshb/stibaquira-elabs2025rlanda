# Laboratorio Athena Quest

[Ver vídeo guía](https://workshopde-videos-lab.s3.us-east-1.amazonaws.com/lab_athena.mp4)

**Objetivo General:**  Aprender a usar los servicios de almacenamiento y análisis de datos en AWS, ya sea Amazon S3 y Amazon Athena para guardar datos y realizar consultas SQL que permitan explorar y analizar información.

**Introducción:**  S3 es un servicio de almacenamiento que permite guardar objetos de forma segura y escalable. La información se organiza en buckets y cada uno debe tener un nombre único a nivel global, es decir, no puede repetirse en ninguna otra cuenta de AWS del mundo. Además, por seguridad los buckets deben estar configurados para bloquear el acceso público. Esto evita que los datos sean visibles para cualquier persona y protege la privacidad de la información. 

Athena es un servicio de consulta que permite analizar datos directamente desde Amazon S3 usando SQL. No requiere configurar ni administrar servidores, lo que facilita hacer consultas rápidas y flexibles. Athena es ideal para explorar grandes cantidades de datos almacenados en formato CSV, JSON, Parquet, entre otros. 

Cada vez que ejecutas una consulta en Athena, los resultados deben almacenarse en algún lugar, y por defecto, Athena los guarda en un bucket S3. Este paso es obligatorio porque Athena necesita escribirlos en un archivo que puedas revisar, descargar o reutilizar más adelante. Es por eso que en este laboratorio debes crear dos buckets S3 uno para los datos de origen que vas a consultar y otro para los resultados de las consultas que ejecutes con Athena.

![S3](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/Arquitectura%20Athena.png)

**Tarea 1: Extraer los datos para el trabajo del laboratorio**

- Debes descargar los datos books.csv con temática de libros: [Link de descarga](https://workshop-mo.s3.us-east-1.amazonaws.com/libros_laboratorio.csv)

**Tarea 2: Crear un bucket S3 para los datos del Laboratorio**

- Debes ir a S3 y crear un nuevo bucket S3. Solo debes insertar un nombre para tu bucket, los demás valores debes dejarlos tal cual

![S3](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/athena%20(16).jpg)

**Tarea 2.1: Debes cargar tus datos al bucket recién creado**

- Tienes que abrir el bucket creado y seleccionar “Cargar”. Luego, "Agregar Archivos" para subir tu archivo con los datos

![S3](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/athena%20(1).jpg)

![S3](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/athena%20(4).jpg)

**Tarea 3: Crear un bucket para guardar los resultados de las consultas de Athena**

- Crea un nuevo bucket en S3, igual al que generaste en la tarea 2 en que solo lo nombraste y los demás valores los dejaste tal cual. Este bucket será utilizado exclusivamente para almacenar los resultados de las consultas de Athena

![S3](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/Captura%20de%20pantalla%202025-07-17%20215631.png) 

**Tarea 4: Configurar la ubicación de los resultados de las consultas en Athena**
 
- Debes ir a Athena y seleccionar la opción “Iniciar el editor de consultas”, asegurándote de que esté seleccionada la opción “Consulte sus datos con Trino SQL”.
Trino SQL te permite consultar datos almacenados en S3 usando sentencias SQL, de manera rápida y sin necesidad de configurar servidores.

- Antes de crear la tabla, es necesario configurar la ubicación de los resultados de las consultas en S3. Para ello, deberás vincular esta configuración con el bucket que creaste en la tarea 3 (el dedicado exclusivamente a resultados de Athena).

![S3](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/athena%20(5).jpg) 

![S3](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/athena%20(6).jpg) 

**Tarea 5: Crear tabla en Athena**
- Para crear una tabla en Athena, primero selecciona la opción “Datos del bucket S3”, lo que indica que la tabla se construirá a partir de los datos almacenados en ese bucket. A continuación, debes asignar un nombre a la tabla y luego seleccionar “Crear una base de datos” para nombrarla también. Mantén todos los demás campos y configuraciones tal como están por defecto

![S3](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/athena%20(10).jpg)

- Luego, debes seleccionar el conjunto de datos y elegir el bucket de S3 donde previamente guardaste el archivo CSV que contiene la información para la tabla

![S3](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/athena%20(11).jpg)

- Ahora, en el tipo de tabla, deja la opción por defecto que es “Apache Hive”, pero cambia el formato de archivo a CSV.
El resto de las configuraciones deben mantenerse por defecto, sin realizar ningún cambio 

![S3](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/athena%20(12).jpg)

- En los detalles de la tabla, debes nombrar todas las columnas correspondientes a los datos. Puedes agregarlas una por una o seleccionar la opción “Agregar columnas en bloque”, donde podrás ingresar todas las columnas de forma rápida usando el formato:
<“nombre” tipo, “nombre” tipo, ...>
Por ejemplo, en este caso deberás escribir:
autor string, libro string, year int 

![S3](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/athena%20(13).jpg)

- Finalmente, podrás ver la vista previa de la consulta. Para concluir el proceso, simplemente selecciona “Crear tabla”

![S3](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/athena%20(14).jpg)

**Tarea 6: Realizar consultas de tipo SQL en Athena**
- Antes de comenzar a realizar las consultas SQL, debes asegurarte de tener seleccionada la base de datos y la tabla correspondientes. Esto garantiza que las consultas se ejecuten sobre la tabla correcta

![S3](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/athena%20(15).jpg)

- Ya configurado lo anterior puedes comenzar a realizar consultas SQL y responder a las siguientes preguntas:
  
  **1.¿Cuáles son todos los libros en la base de datos?** 
  
  *Respuesta:*

  SELECT * FROM tablalibros;

![S3](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/Captura%20de%20pantalla%202025-07-17%20233322.png)

![S3](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/Captura%20de%20pantalla%202025-07-17%20233952.png)

  **2. ¿Qué libros escribió “Dean Koontz”?**

  *Respuesta:*
  
  SELECT * 
  
  FROM tablalibros
  
  WHERE autor = 'Dean Koontz';


  **3.¿Qué libros fueron publicados después del año 2000?**

   *Respuesta:*

  SELECT * 
  
  FROM tablalibros
  
  WHERE year > 2000;

  **4. ¿Cuáles son todos los autores únicos que hay en la base de datos?**

   *Respuesta:*

  SELECT DISTINCT autor 
  
  FROM tablalibros;

  **5. ¿Cuáles son los libros ordenados desde el más antiguo al más reciente?**

  *Respuesta:*

  SELECT * 
  
  FROM tablalibros
  
  ORDER BY year ASC;


  **6. ¿Qué libros fueron publicados en el año 1999?**

   *Respuesta:*

  SELECT libro, year
  
  FROM tablalibros
  
  WHERE year = 1999;




*Comentario adicional*: Para eliminar una tabla en SQL se utiliza el comando DROP TABLE nombre_tabla, mientras que para eliminar una base de datos se usa DROP DATABASE nombre_base_de_datos. Es importante tener en cuenta que, antes de eliminar una base de datos, se deben eliminar todas las tablas que contiene. De lo contrario, se generará un error.

  

**¡Felicidades, has completado el laboratorio!**



