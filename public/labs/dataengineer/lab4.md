# Laboratorio Athena Quest

[Ver vídeo guía](https://workshopde-videos-lab.s3.us-east-1.amazonaws.com/lab_athena.mp4)

**Objetivo General:**  Aprender a usar Amazon S3 y Amazon Athena para almacenar datos y realizar consultas SQL que permitan explorar y analizar información de forma rápida y eficiente

**Introducción:**  

   -  Amazon S3: Servicio de almacenamiento seguro y escalable. Los datos se organizan en buckets, que deben tener nombres únicos a nivel global. Por seguridad, los buckets deben bloquear el acceso público para proteger la privacidad de la información

  - Amazon Athena: Servicio de consultas SQL que permite analizar datos directamente desde S3, sin necesidad de configurar servidores. Ideal para explorar grandes cantidades de datos en formatos como CSV, JSON o Parquet


Cada vez que ejecutas una consulta en Athena, los resultados deben almacenarse, y por defecto, Athena los guarda en un bucket S3. Este paso es obligatorio. Por ello, en este laboratorio se crearán 2 buckets: uno para los datos y otro para los resultados


![S3](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/Arquitectura%20Athena.png)

**Tarea 1: Extraer los datos para el trabajo del laboratorio**

Descarga el archivo books.csv con temática de libros: [Link de descarga](https://workshop-mo.s3.us-east-1.amazonaws.com/libros_laboratorio.csv)


**Tarea 2: Crear 2 buckets S3 para el Laboratorio**

En la Consola de AWS debes buscar S3 y hacer click en el servicio

![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(27).png)

Ya adentro de S3 debes seleccionar "Crear Bucket". Tal como se muestra a continuación: 
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena.png)


Asígnale un nombre a tu bucket. Todos los demás parámetros debes dejarlos con los valores predeterminados
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(1).png)


Selecciona "Crear Bucket"
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(2).png)


Debes crear el segundo bucket para los resultados de Athena. Para ello repite los pasos anteriores. Tu panel de buckets debería verse así: 
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(3).png)

**Tarea 3: Cargar los datos al bucket**

Selecciona tu bucket que fue creado para guardar los datos
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(4).png)

Ya adentro del bucket, presiona "Cargar"
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(5).png)

Se te abrirá otra página en donde debes seleccionar "Agregar archivos". Ahí tienes que subir "libros_laboratorio.csv"
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(6).png)

Para finalizar haz click en "Cargar". Debería verse así: 
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(7).png)


**Tarea 4: Entrar a Athena y definir ubicación de resultados**
 
En la consola de AWS busca "Athena" y selecciona el servicio
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(8).png)

Elige "Consulte sus datos con Trino SQL" y haz click en "Iniciar el editor de consultas"
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(9).png) 

Antes de crear tu tabla y consulta es necesario configurar la ubicación de los resultados. Para ello debes ir a "Editar ajustes"
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(10).png)

Haz clic en “Browse S3” para buscar y seleccionar el bucket que creaste exclusivamente para los resultados de Athena
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(11).png)
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(12).png)

Una vez elegido el bucket, asegúrate de guardar la configuración para que Athena almacene allí los resultados de todas tus consultas
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(13).png)


**Tarea 5: Crear tabla en Athena**


Con la configuración ya lista, procede a crear tu tabla en Athena. Para ello, selecciona la opción “Datos del bucket de S3”
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(14).png)

Asígnale un nombre a la tabla
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(15).png)

Selecciona "Crear una base de datos" y otorgale un nombre
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(16).png)

En la sección "Conjunto de datos", selecciona el bucket de S3 donde previamente cargaste tu archivo con los datos
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(17).png)

En "Formato de datos", mantén Apache Hive como tipo de tabla y cambia el formato de archivo a CSV. Deja el resto con valores por defecto
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(18).png)

En la sección “Detalles de la columna” debes nombrar cada columna y asignarle un tipo de dato, por ejemplo: autor string, libro string, year int. Esto indica a Athena cómo interpretar cada campo de tus datos al consultar la tabla
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(19).png)

Finalmente, revisa la vista previa de la consulta de la tabla y, para completar el proceso haz clic en “Crear tabla”
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(20).png)


**Tarea 6: Ejecutar consultas en Athena** 

Antes de ejecutar las consultas verifica en el panel izquierdo que tengas seleccionadas la base de datos y la tabla correspondientes. Esto asegura que las consultas se realicen sobre la tabla correcta
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(21).png)

Con la configuración lista, ya puedes comenzar a ejecutar consultas SQL para explorar tus datos, por ejemplo:
  
  **1. ¿Cuáles son todos los libros en la base de datos?** 
  
  *Respuesta:*
  ```bash
  SELECT * FROM tablalibros;
  ```

 Para ello, escribe la consulta en el editor y haz clic en "Ejecutar". Tal como se muestra a continuación: 
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(22).png)

Al ejecutar la consulta, los resultados se mostrarán directamente debajo del editor en forma de tabla, con las columnas y filas correspondientes a los datos consultados
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(23).png)

Continúa explorando los datos ejecutando consultas SQL para responder las siguientes preguntas, por ejemplo: 

  **2. ¿Qué libros escribió “Dean Koontz”?**

  *Respuesta:*
  
  ```bash
  SELECT * 
  
  FROM tablalibros
  
  WHERE autor = 'Dean Koontz';
  ```

![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(24).png)
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(25).png)


  **3. ¿Qué libros escribió “Dean Koontz”?**

  *Respuesta:*

  ```bash
  SELECT * 
  
  FROM tablalibros
  
  WHERE autor = 'Dean Koontz';
  ```


  **4. ¿Qué libros fueron publicados después del año 2000?**

   *Respuesta:*
  ```bash
  SELECT * 
  
  FROM tablalibros
  
  WHERE year > 2000;
  ```

  **5. ¿Cuáles son todos los autores únicos que hay en la base de datos?**

   *Respuesta:*

  ```bash
  SELECT DISTINCT autor 
  
  FROM tablalibros;
  ```

  **6. ¿Cuáles son los libros ordenados desde el más antiguo al más reciente?**

  *Respuesta:*

  ```bash
  SELECT * 
  
  FROM tablalibros
  
  ORDER BY year ASC;
  ```


  **7. ¿Qué libros fueron publicados en el año 1999?**

   *Respuesta:*
  ```bash
  SELECT libro, year
  
  FROM tablalibros
  
  WHERE year = 1999;
  ```



## ¡Felicidades, has completado el laboratorio!



