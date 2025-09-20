# Laboratorio ETL con AWS Glue

[Ver vídeo guía](https://workshopde-videos-lab.s3.us-east-1.amazonaws.com/Lab_glue.mp4)

**Objetivo General:**  Aprender a utilizar AWS Glue para construir y ejecutar trabajos ETL que permitan catalogar, transformar y limpiar datos almacenados en S3 y validar los resultados a través de consultas en Athena

![Arquitectura](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/Arq%20Lab%20Glue.png)

**Tarea 1: Extraer los datos en formato CSV para el laboratorio**

Descarga el archivo CSV netflix1.csv desde Kaggle:

**Link**: [Datos Netflix](https://www.kaggle.com/datasets/ariyoomotade/netflix-data-cleaning-analysis-and-visualization) 



**Tarea 2: Crear buckets en S3**

Como buena práctica debes crear 4 buckets. Esto sirve para que en el flujo ETL haya seguridad y organización de los datos. Cada bucket representa una etapa distinta del proceso

- Bucket 1(CSV): Aquí se almacenarán el archvio en formato CSV que utilizaremos como datos originales, ya sea datos crudos
- Bucket 2 (Glue + Athena): Guardará los outputs que generan nuestros trabajos en Glue y las consultas que ejecutamos en Athena. De este modo se guarda un historial sobre lo que se consultó y procesó
- Bucket 3 (Target de nuestro primer ETL Job): Aquí se guardará los resultados intermedios del primer trabajo ETL que será crear la tabla
- Bucket 4: (Target de nuestro segundo ETL Job): Aquí se guardará los resultados de las transformaciones y limpieza que haremos a nuestros datos


Como primer paso debes buscar S3 en la barra de búsqueda de la consola de AWS y hacer click en el servicio
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(27).png)

Ya adentro de S3 selecciona "Crear bucket"
![S3](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena.png)

Asigna un nombre a tu bucket y deja los demás ajustes con los valores por defecto
![S3](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue2.png)
![S3](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue3.png) 
![S3](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue4.png)

**Tarea 2.1: Crear más buckets del laboratorio**

Sigue los mismos pasos anteriores para crear los otros buckets. Deberías tener este resultado: 
![S3](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabServerless%20(1).png)


**Tarea 2.2: Cargar objeto a bucket 1**

En el bucket 1, carga el archivo "netflix1.csv" que descargaste de Kaggle. Para ello, selecciona el bucket y haz clic en "Cargar" para agregar el archivo, tal como se muestra a continuación
![S3](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue5.png)
![S3](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue6.png)
![S3](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue7.png)



**Tarea 3: Configurar permisos IAM**

En AWS, los permisos entre servicios son fundamentales para que puedan interactuar entre sí de manera segura. En este caso, necesitamos otorgarle a Glue los permisos necesarios para leer y escribir en todos nuestros buckets de S3 y crear/actualizar tablas en el Data Catalog

Para ello debes ir a IAM y crear un nuevo rol con los siguiente:

1) En el buscador de la consola de AWS escribe "IAM" e ingresa al servicio
![IAM](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabAthena%20(28).png)

2) Crear un nuevo rol y seleccionar Glue como caso de uso
![IAM](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue8.png)
![IAM](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue9.png)

3) Otorgar al rol la política AmazonS3FullAccess
![IAM](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue10.png)

4) Entrar al rol creado y agregar una política en modo JSON para otorgar permisos más específicos
![IAM](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue11.png) 

5) La política debe incluir s3:GetObject y s3:PutObject para todos los buckets. Se recomienda repetir la declaración de los buckets dos veces: Con * para que Glue pueda acceder a todos los objetos dentro del bucket. Y sin * para que Glue pueda acceder al bucket en sí, no solo a los objetos internos

6) La política también debe incluir los permisos necesarios para que Glue pueda crear y actualizar las tablas del Data Catalog

![IAM](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue19.png)
![IAM](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue52.png)

7) Nombra tu nueva política y haz click en "Guardar los cambios"
![IAM](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue21.png) 

**Tarea 4: Crear nuestra base de datos en Glue**

La base de datos servirá para almacenar la información de nuestros procesos ETL. Es el lugar donde se registran y crean las tablas y los datos transformados

En el buscador de la consola de AWS busca Glue y selecciona el servicio
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabAthena%20(29).png)


En el panel izquierdo de Glue, dentro de la sección Data Catalog, selecciona Databases
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue14.png)

Luego, crear tu Base de datos. Para ello debes hacer click en "Add Database"
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue15.png)

Debes nombrarla y seleccionar "Create database" 
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue16.png)


**Tarea 5: Primer ETL Job (Tabla)**


Un ETL Job es un proceso que permite **extraer** datos desde una fuente, **transformarlos** según nuestras necesidades y finalmente **cargarlos** en un destino, como otra base de datos o un bucket de S3. 
Glue ofrece tres formas de crear un ETL Job:

1) Visual ETL: Permite construir el flujo de datos mediante una interfaz gráfica de arrastrar y soltar
2) Notebook: Usando Jupyter Notebooks integrados, se puede escribir código PySpark de forma interactiva
3) Script: Permite crear un ETL Job directamente escribiendo un script que Glue ejecutará



Entonces para este laboratorio debes seleccionar "ETL Jobs", y en este caso trabajaremos con la opción de "Visual ETL" 
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue17.png)


**Tarea 5.1: Crear una tabla a través de un job de Glue** 

El objetivo de este primer ETL Job es crear nuestra tabla

1) Primero debes seleccionar tu **source**, ya sea tu fuente de datos que en este caso es tu bucket S3 con los datos
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue22.png)

   Debes buscar y seleccionar el bucket de datos 
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue23.png)

   Escoger el bucket con los datos cargados
   ![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue24.png)

   Seleccionar el formato de los datos, en este caso CSV que están delimitados por ","
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue25.png)


2) Selecciona el rol IAM que configuraste anteriormente, para así otorgarle los permisos a Glue
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue26.png)

3) En **transform** elige "Change Schema" 
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue27.png)

   Se observan los encabezados de columnas, en este caso lo dejaremos tal cual para hacer nuestra tabla
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue28.png)

4) En la sección **target** debes seleccionar el destino donde se almacenará el resultado del proceso ETL
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue29.png)

   Debes tranformar los datos al formato Parquet, ya que permite un almacenamiento más eficiente y consultas más rápidas. Además, seleccionaremos el tipo de compresión Snappy, es el más recomendado porque ofrece un buen equilibrio entre velocidad y reducción de tamaño, siendo compatible con Parquet
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue30.png)


5) El target es S3. Ahora, debes indicar el bucket específico en el que se guardarán los datos transformados. Además, es necesario marcar la opción para crear una nueva tabla en el Data Catalog, lo que permitirá registrar la estructura de los datos. Finalmente, debes seleccionar la base de datos dentro del catálogo donde quedará asociada esta nueva tabla
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue31.png)

6) En este punto debes asignar un nombre a tu tabla. Para este laboratorio debes seleccionar 2 llaves de partición: type y country. Se utilizarán porque organizan los datos en el bucket de forma jerárquica, dividiéndolos en carpetas según los valores de las columnas elegidas. Para finalizar presiona "Save" y seleccionar "Run" para comenzar a crear nuestra tabla
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue32.png)

   Así debería verse el resultado del primer ETL Job
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue33.png)

**Tarea 5.2: Seleccionar tabla creada** 

En Data Catalog ve a la sección de tablas y selecciona la opción de "Table Data" y luego "Proceed". Lo que te llevará al servicio de Athena para hacer nuestras primeras consultas
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue34.png)

**Tarea 6: Revisar los resultados del primer ETL Job en Athena** 

Observa en el costado izquierdo que Athena esté correctamente asociada a tu base de datos y tabla

1) Como es la primera vez que usas Athena, te pedirá elegir un bucket S3 para guardar los resultados de tus consultas. Configura la ubicación del resultado de queries
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/Diagrama%20en%20blanco.png)

   Elige el bucket que creaste para los resultados de las queries
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/Diagrama%20en%20blanco%20(1).png)
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/Diagrama%20en%20blanco%20(2).png)

2) Una vez que cargaste la tabla en Athena, el siguiente paso es revisar el estado de los datos. Para eso es importante obtener una muestra de los datos con una query simple:

   SELECT * FROM nombre_tabla LIMIT 60;
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue35.png)


Esto te permitirá visualizar las primeras filas y tener una idea de cómo está estructurada la información

3) Al observar la salida, notarás que en algunos campos aparecen valores como “Not Given”, lo que significa que la información no está disponible. En este caso, se aprecia principalmente en los campos director y country
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue37.png)
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue36.png)


4) Para dimensionar el problema, puedes contar cuántos registros contienen este valor con la siguiente consulta: 
   ```bash
   SELECT

   COUNT_IF(type = 'Not Given') AS not_given_type,

    COUNT_IF(title = 'Not Given') AS not_given_title,

   COUNT_IF(director = 'Not Given') AS not_given_director,

   COUNT_IF(country = 'Not Given') AS not_given_country,

   COUNT_IF(date_added = 'Not Given') AS not_given_date_added,

   COUNT_IF(release_year = 'Not Given') AS not_given_release_year,

   COUNT_IF(rating = 'Not Given') AS not_given_rating,

   COUNT_IF(duration = 'Not Given') AS not_given_duration,

   COUNT_IF(listed_in = 'Not Given') AS not_given_listed_in

   FROM "AwsDataCatalog"."glue-db-movies"."tabla-netflix"; (Adaptar según tus datos)
   ```

   ![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue38.png)

5) Luego con una query revisa la cantidad de datos duplicados:
   ```bash
   SELECT *

   FROM "AwsDataCatalog"."glue-db-movies"."tabla-netflix"

   WHERE title IN (

   SELECT title

   FROM "AwsDataCatalog"."glue-db-movies"."tabla-netflix"

   GROUP BY title

   HAVING COUNT(*) > 1

   )  

   ORDER BY title;
   ```

   ![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue39.png)

_El trabajo con datos no es solo almacenarlos, sino analizarlos de manera crítica a través de consultas (queries). Estas permiten explorar el estado de la información recogida y plantear preguntas como: ¿Debemos conservar todos los datos?, ¿Es necesario transformarlos a otro formato?, ¿O, quizás eliminarlos si no aportan valor, en el caso de datos Null? Este proceso de cuestionamiento es parte esencial de la limpieza y preparación de datos, ya que aporta a que la información resultante sea de calidad y esté lista para un análisis más profundo. No existe una única respuesta “correcta”, la decisión depende del contexto del análisis y del tipo de dato._

6) Sigue explorando los datos mediante queries que consideres relevantes para comprender su estructura, calidad y contenido. En base a estas observaciones, se diseñará el ETL Job 2, aplicando las transformaciones y decisiones necesarias para preparar los datos

**Tarea 7: ETL Job 2 (Transformaciones)**

Regresa a ETL Jobs, crea un nuevo job, asígnale un nombre y continúa con la configuración de la transformación:

1) Selecciona nuevamente tu fuente de datos. En este caso elige la base de datos y tabla ya creada en Data Catalog como tu **source** 
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue40.png)

2) Como primer **transform** elimina los duplicados
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue41.png)

3) En el segundo **transform** elimina la columna rating, ya que se determinó que no es necesaria para el análisis de este caso. Esto nos permite simplificar la estructura de los datos y enfocarnos solo en la información que consideramos relevante
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue42.png)

4) Es importante asociar el permiso de IAM creado en los pasos anteriores
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue44.png)

5) Realiza tu primer **custom transform** que es un espacio para escribir código propio para definir cómo quieres transformar los datos. Utiliza PySpark para transformar los datos de forma flexible, y así modificar o crear columnas según necesitemos
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue45.png)

### [Descarga el script aquí](https://workshop-mo.s3.us-east-1.amazonaws.com/script_glue.py) 


¿Qué hace el script anterior? Se encarga de limpiar y estandarizar los datos. Sus principales funciones son:

a) Manejo de valores nulos: convierte campos que contienen "Not given" en valores Null, para que los datos sean consistentes y puedan ser procesados correctamente en análisis posteriores

b) Transformación de fechas: renombra la columna "date_added" a "date_original" para mantener claridad sobre su contenido, luego crea nuevamente "date_added" convirtiéndola a tipo fecha con formato "M/d/yyyy" para facilitar operaciones temporales, y finalmente extrae solo el año en la columna "year_added_netflix" que ayudaría a analizar tendencias por año de manera rápida y sencilla

 _En **custom transform** eres libre de agregarle más parámetros, según creas necesarios_. 

6) Inserta el script en el bloque de código
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue462.png)


7) En **transform** debes seleccionar "Select from Collection". Esto es necesario porque el Custom Transform en Glue devuelve un DynamicFrameCollection (un conjunto de datos con varias salidas). Así con esto eliges explícitamente cuál de esos resultados usar en las siguientes etapas, asegurando que se procese el dataset transformado y no el original
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue461.png)

8) Selecciona tu **target**,nuevamente tu bucket S3. Al igual que en el ETL 1, se repiten los mismos pasos de transformación a formato Parquet con tipo de compresión Snappy
   ![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue47.png)

9) En tu target esta vez selecciona el bucket que fue destinado para almacenar los resultados del ETL 2. También selecciona la opción de "Create a table in Data Catalog..." Para crear una nueva tabla y escoge tu base de datos
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue499.png)


10) Como crearás una nueva tabla debes otorgarle un nombre. También seleccionar Partition Keys en type y country
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue488.png)

11)  Guarda tu ETL y ejecútalo. El flujo de tu ETL 2 debería verse similar a esto: 
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue51.png)


**Tarea 8: Validación Final en Athena**

Nuevamente debes ir a "tables" y en este caso seleccionar la nueva tabla que creaste y apretar "Table Data" y luego "Proceed" lo que te llevará nuevamente a Athena para realizar las consultas 
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue49.png)

Revisa el panel izquierdo y verifica que esté la nueva tabla
![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabGlue50.png)

_Al ejecutar queries es importante revisar si se eliminaron las columnas innecesarias y cómo se manejaron los valores NULL. En este caso, eliminar los registros con el campo director vacío implicaría perder películas o series completas, lo que afectaría el análisis. Por ello, en la segunda etapa del ETL los valores que aparecían como "Not given" fueron reemplazados por NULL, ya que "Not given" no es un estándar en análisis de datos. Dejar los valores como NULL permite que las herramientas y bases de datos interpreten correctamente la ausencia de información, evita confusiones al tratar "Not given" como un dato válido_

**Tarea 9: Análisis final de los datos transformados** 

Ya con una buena estructura en los datos, es posible realizar consultas que permitan responder preguntas clave como:

**Contenido**

1) ¿Cuántas películas y series se agregaron cada año?
  
   *Respuesta:*
   ```bash
   SELECT 
  
   year_added_netflix,
  
   type,
  
   COUNT(*) as contenido_agregado
  
   FROM "AwsDataCatalog"."glue-db-movies"."tabla-netflix-clean"
  
   WHERE year_added_netflix IS NOT NULL
  
   GROUP BY year_added_netflix, type
  
   ORDER BY year_added_netflix asc;
   ```



   **Ejemplo de la primera consulta:** ![ETL](https://raw.githubusercontent.com/iscatalan/LabGlue/refs/heads/main/LabServerless%20(2).png)

##

2) ¿Cómo se distribuyen las películas y series por país?

   *Respuesta:*
   ```bash
   SELECT 
   
   country,
   
   type,
   
   COUNT(*) as total
   
   FROM "AwsDataCatalog"."glue-db-movies"."tabla-netflix-clean"
   
   WHERE country IS NOT NULL
   
   GROUP BY country, type
   
   ORDER BY total DESC
   ```

   ****
##
3) ¿Cuáles son las películas y series clasificadas como comedias?

   *Respuesta:*
   ```bash
   SELECT 
   
   title,
   
   type,
   
   country,
   
   release_year,
   
   listed_in
   
   FROM "glue-db-movies"."tabla-netflix-clean"
   
   WHERE listed_in LIKE '%Comedies%'
   
   ORDER BY release_year DESC
   ```

   ***** 
4) ¿Cómo evolucionan las tendencias de producción a lo largo del tiempo usando el año de estreno?

   *Respuesta:*
   ```bash
   SELECT 
   
   release_year,
   
   type,
   
   COUNT(*) AS total
   
   FROM "AwsDataCatalog"."glue-db-movies"."tabla-netflix-clean"
   
   WHERE release_year IS NOT NULL
   
   GROUP BY release_year, type
   
   ORDER BY release_year ASC;
   ```


# DESAFÍO: REALIZAR CONSULTAS Y RESPONDER LAS SIGUIENTES PREGUNTAS:

**Directores**

5) ¿Qué directores aparecen más veces en el catálogo?

6) ¿Qué directores han producido contenido en Chile?

**Géneros** 

7) ¿Cuáles son los géneros más comunes en el catálogo?

8) ¿Cómo se distribuyen los géneros de películas y series por país?


   
Así, puedes seguir explorando los datos mediante consultas según las preguntas que se te ocurran


## ¡Felicidades, has completado el laboratorio!**



