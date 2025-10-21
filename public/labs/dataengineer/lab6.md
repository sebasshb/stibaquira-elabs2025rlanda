# Laboratorio Kinesis

**Objetivo General:**  Aprender a implementar un flujo completo de ingestión, transformación y análisis de datos en tiempo real usando servicios serverless de AWS (Kinesis, Firehose, Lambda, SNS, Glue y Athena) mediante IoT simulado. Esto incluye generar telemetría de sensores, procesar y almacenar los datos en S3, analizar métricas y enviar notificaciones automáticas vía SNS ante lecturas críticas (WARN o ERROR)

![Arquitectura](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Kinesis%20Lab%20arch.png)


**Tarea 1: Crear buckets en S3**

Para este laboratorio debes crear 3 buckets: 

- Bucket 1 (Data Stream Kinesis): Este bucket almacenará los datos crudos que provienen del flujo de Kinesis Data Stream y son entregados por Firehose en formato Apache Parquet. Aquí se guardarán los datos sin procesar, tal como llegan desde los dispositivos
- Bucket 2 (Data Firehose): Este bucket recibirá los datos filtrados y transformados por Firehose con apoyo de una función Lambda transformadora que filtra los datos de los dispositivos para entregar solo los que tienen error o en estado de alerta
- Bucket 3 (Resultados): Este bucket se utilizará para guardar los resultados de las consultas ejecutadas con Amazon Athena

Para comenzar, en la consola de AWS, escribe S3 en la barra de búsqueda y selecciona el servicio
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesiste.png)

Ya en S3, haz click en "Crear bucket"
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(1).png)

Asigna un nombre a tu bucket. Deja todas las demás opciones con sus valores predeterminados y haz click en "Create Bucket"
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(2).png)
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(3).png)


**Tarea 1.1: Crear otros buckets para el laboratorio**

Repite los mismos pasos para crear los 2 buckets que faltan

Tu panel debería tener 3 buckets creados y verse de la siguiente manera:
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(4).png)

**Tarea 1.2: Crear subcarpeta en bucket creado para la transformación de datos**

Para ello haz click en el bucket creado para que firehose mande los datos transformados.  Ingresa  y  selecciona "Crear carpeta"
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(5).png)

Debes asignarle un nombre a la carpeta, dejar las otras opciones en sus valores predeterminados y haz click en "Create carpeta"
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(7).png)


**Tarea 2: Crear Kinesis Stream**

En la barra de búsqueda de la consola de AWS, escribe Kinesis y selecciónalo
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(8).png)

Elige la opción de Kinesis Data Stream. Luego en "Crear data stream" 
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(9).png)

En Modo de capacidad, selecciona “Aprovisionado", de esa forma puedes definir manualmente la cantidad de shards. Para este laboratorio, crea solo 1 shard

**¿Qué es un shard?** 

Un shard representa una unidad de capacidad dentro del stream. Ya sea, cada shard define cuánta información puede manejar el flujo al mismo tiempo.Cada shard puede manejar hasta 1 MB/segundo de entrada y 2 MB/segundo de salida. También puede recibir hasta 1,000 registros por segundo
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(10).png)

Deja los demás parámetros con sus valores predeterminados y haz click en “Crear data stream”
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(11).png)


**Tarea 3: Examinar la función Lambda DeviceSimulator**

En la consola de AWS, escribe Lambda en la barra de búsqueda y selecciona el servicio
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(12).png)

Dentro del listado de funciones, haz click en “DeviceSimulator”
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(13).png)

El código de la Lambda DeviceSimulator simula dispositivos IoT que envían datos a Kinesis. Contiene lo siguiente: 

- num_devices: cantidad de dispositivos (10)
- msgs_per_device: cantidad de mensajes por dispositivos (2)
- device_id: sensor que envía la lectura
- ts: fecha/hora del envío
- battery
- status
- location
- temperature, humidity:métricas medidas
- status:estado: OK (normal), WARN (fuera de rango), ERROR (fallo)


![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(14).png)

En la pestaña “Configuración”, selecciona en el menú lateral izquierdo la opción “Variables de entorno”

_¿Qué es una variable de entorno? 
Son valores configurables que tu función Lambda puede leer durante su ejecución. Permiten conectar servicios  sin necesidad de modificar el código directamente_
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(15).png)


Edita la variable de entorno existente para conectar Kinesis stream con la lambda
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(16).png)

Escribe el nombre exacto de tu Kinesis Data stream y selecciona “Guardar”. Con esto, tu función Lambda quedará conectada a Kinesis
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(17).png)

**Tarea 4: Crear SNS para notificaciones**

_¿Por qué utilizaremos SNS? 
Es un servicio de mensajería que permite enviar notificaciones automáticas por ejemplo, correos electrónicos cuando ocurre un evento en AWS, como una alerta o una nueva lectura de datos._

En este laboratorio, SNS se usará para avisar cuando un dispositivo envíe lecturas anormales:

- WARN: valores cercanos a los límites

- ERROR: fallos graves o lecturas imposibles

Estará conectado a la segunda lambda que filtrará esos datos. 
De esta forma, cada vez que un sensor simulado reporte un estado de advertencia o error, se enviará automáticamente una notificación al correo configurado

Para esto, en la consola de AWS, escribe “SNS” en la barra de búsqueda y selecciona el servicio
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(18).png)

Asigna un nombre al canal de mensajes y selecciona “Next step”
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(19).png)

Deja seleccionado el tipo “Standard” y confirma el nombre
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(20).png)

Para recibir las notificaciones, crea una suscripción. Haz click en “Create subscription”
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(21).png)

En protocolo selecciona "Email" y en endpoint, escribe tu dirección de correo electrónico y selecciona "Crear una suscripción"
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(22).png)


**Revisa tu correo electrónico y confirma la suscripción desde el enlace que SNS te enviará**
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinessns%20(5).png)
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinessns%20(6).png)

Una vez creado el tema, copia el ARN. Será utilizado más adelante para conectar la próxima función Lambda con SNS y enviar notificaciones 
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(23).png)

**Tarea 5: Crear Lambda para filtrado de datos**

En la consola de AWS, escribe Lambda en la barra de búsqueda y selecciónalo
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(12).png)


Haz click en “Crear función”
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(24).png)

Selecciona “Crear desde cero”, asigna un nombre a tu función y en Runtime elige Python.
Deja el resto de las opciones con los valores predeterminados
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(25).png)

En la sección Permisos, selecciona “Crear un rol nuevo” y haz click en “Crear función”
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(26).png)

**Tarea 5.1: Agregar el código Lambda**

Descarga el script de la Lambda:
## [Descarga el script aquí](https://workshop-mo.s3.us-east-1.amazonaws.com/script_kinesis.py)


Elimina el código por defecto que crea Lambda
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(27).png)

Pega el código descargado en el bloque de código y revísalo. Haz click en “Deploy” para actualizar la función
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinessns%20(2).png)


**Tarea 5.2: Configurar timeout lambda**

Ve a Configuración general y haz click en Editar
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(29).png)

Cambia el timeout de 3 segundos a 1 minuto para que la Lambda tenga suficiente tiempo de ejecución.
Guarda los cambios
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(30).png)


**Tarea 5.3: Configurar role lambda para agregar SNS**

En la configuración de la Lambda, selecciona Permisos y haz click en el rol asociado
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(31).png)

Verifica que SNS no esté configurado. Para agregarlo, haz click en “Create inline policy”
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(32).png)

Selecciona JSON para editar la política 
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(33).png)

Agrega el permiso sns:Publish y especifica el ARN del tema SNS que copiaste anteriormente
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(34).png)

Asigna un nombre a la política y haz click en "Guardar política"
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(35).png)

**Tarea 5.4: Configurar variable de entorno SNS**

En esta Lambda, además de los permisos, la conexión con SNS se realiza mediante una variable de entorno. Ve a Variables de entorno y haz click  en "Editar"
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinessns%20(1).png)

Haz click en "Agregar variable de entorno". En **valor** coloca SNS_TOPIC_ARN y en **key** el valor del ARN del SNS Topic que copiaste anteriormente y que utilizaste en el paso anterior
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinessns%20(3).png)


**Tarea 6: Crear base de datos en Glue**

En la consola de AWS, busca Glue y selecciona el servicio
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(36).png)

En el panel izquierdo bajo Data Catalog, selecciona Base de datos y haz click en "Agregar base de datos"
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(37).png)

Asigna un nombre a tu base de datos y haz click en "Crear base de datos"
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(38).png)


**Tarea 7: Crear tablas en Athena**

Con la base de datos ya listo, debes crear 2 tablas en Athena. Para ello en la consola, busca Athena y selecciónalo
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(39).png)

Haz click en "Iniciar el editor de consultas"
![Kinesis](https://raw.githubusercontent.com/iscatalan/labathenapics/refs/heads/main/LabAthena%20(9).png)

Antes de crear tablas, configura el bucket de resultados de las queries. Para ello haz click en "Settings"
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(40).png)

Ya dentro de "Settings" debes hacer click en "Manage"
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(41).png)

Selecciona el bucket que creaste con la finalidad de guardar los resultados de las queries. Con eso listo, guarda tu configuración
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(42).png)


**Tarea 7.1: Crear tabla para datos crudos de Kinesis Stream**

Vuelve al Editor de Athena y asegurate que estés dentro de la base de datos creada. Luego pega la siguiente consulta para crear tu primera tabla. Debes tener el nombre de la base de datos, asignarle  un nombre a tu tabla nueva y la ubicación de tu bucket destinado para los datos crudos de kinesis. Tal como se muestra a continuación:

```
CREATE EXTERNAL TABLE IF NOT EXISTS <nombre base de datos>.<nombre tabla nueva> (
  device_id string,
  ts string,
  temperature double,
  humidity int,
  battery int,
  status string,
  location struct<
    lat: double,
    lon: double
  >
)
STORED AS PARQUET
LOCATION 's3://<nombre bucket>/';
```

![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(43).png)

Con la consulta ya lista. Haz click en Run para ejecutar la consulta. Verás que la nueva tabla aparece en el panel izquierdo
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(44).png)


**Tarea 7.2: Crear tabla para datos filtrados de kinesis firehose**

Para esta segunda tabla, utiliza la misma estructura de la tabla anterior, cambiando el nombre de la tabla y la ubicación del bucket

**Es muy importante usar la subcarpeta que creaste en el bucket dedicado para estos datos, de lo contrario las consultas posteriores generarán errores**

```
CREATE EXTERNAL TABLE IF NOT EXISTS <nombre base de datos>.<nombre tabla nueva> (
  device_id string,
  ts string,
  temperature double,
  humidity int,
  battery int,
  status string,
  location struct<
    lat: double,
    lon: double
  >
)
STORED AS PARQUET
LOCATION 's3://<nombre bucket/nombresubcarpeta>/';
```

![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(45).png)

Nuevamente haz click en "Run" y verás que la nueva tabla aparece en el panel izquierdo
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(46).png)


**Tarea 8: Crear primer Data Firehose con datos que se transformarán en modo Parquet**

En la consola de AWS, busca Data Firehose y selecciónalo
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(47).png)

Haz click en "Crear Firehose Stream"
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(48).png)

1) Selecciona tu fuente, ya sea Kinesis Data Stream (donde llegan los datos simulados)
2) Selecciona a S3 como destino 
3) Asígnale un nombre a tu Firehose Stream
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(49).png)

4) En fuente debes buscar y hacer click en el Kinesis Data Stream creado anteriormente como fuente
5) Habilita solamente la **conversión**  del formato de los registros  y elige Apache Parquet para aumentar compatibilidad y facilitar consultas posteriores
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(50).png)

6) En la sección de Glue selecciona la región de "N. Virginia", tu base de datos y la tabla que creaste para el primer proceso de Kinesis Data Stream
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(51).png)

_Kinesis Data Firehose se conecta con Glue para conocer la estructura de los datos que recibe y para acelerar el proceso de transformación_

7) En configuración del destino selecciona tu bucket creado para el primer proceso de Kinesis Stream
8) Habilita el "delimitador de nueva línea". Esto sirve para que Firehose pueda reconocer dónde termina un registro y empieza el siguiente
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(52).png)

9) Haz click en "Sugerencias de almacenamiento en búfer..."
10) Deja Buffer size con su valor predeterminado
11) Al reducir el Buffer interval de 300 a 60 segundos, el flujo esperará como máximo 60 segundos antes de enviar los datos al destino. Por este motivo, puede haber un pequeño retraso antes de que los datos estén disponibles para consultas posteriores en Athena
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(53).png)
12) Los valores de encripción y backup déjalos en sus valores predeterminados. Haz click en "Create Firehose Stream" para finalizar
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(54).png)


**Tarea 9: Simular datos con "DeviceSimulator" Lambda**

En la consola de AWS, busca Lambda y selecciónalo
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(12).png)

Selecciona la función "Device Simulator"
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(13).png)
Haz click en Test y luego nuevamente en Test para ejecutar la simulación
¿Qué hará? Simulará datos de 5 dispositivos que entregan 2 mensajes cada uno
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(55).png)



**Tarea 10: Revisar los datos en Kinesis Data Stream**

En la consola de AWS vuelve a Kinesis
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(56).png)

Selecciona el Data Stream que creaste
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(57).png)
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(58).png)

Ve a "Data Viewer" para revisar los registros
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(59).png)

Selecciona el Shard disponible y en Starting position elige Trim Horizon. Esto significa que Kinesis leerá los registros desde el más antiguo disponible en el shard. Debes esperar unos segundos para que se actualice
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(60).png)

Haz click en "Get Records" para ver los datos simulados por la Lambda
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(61).png)

**Tarea 10: Revisar los datos en Athena** 

En la consola de AWS vuelve a Athena para revisar las tablas
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(39).png)

En el panel izquierdo, haz click en los tres puntos junto a la primera tabla que creaste y selecciona "Preview Table"
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(63).png)

Con lo anterior, Athena generará automáticamente una consulta que muestra los primeros 10 registros.
Esto te permite verificar que los datos estén correctamente estructurados.
Desde aquí podrás realizar consultas para analizar el estado de los dispositivos
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(64).png)


**Tarea 11: Crear segundo Data Firehose para utilizar el método de transformación con lambda**

1) En la consola de AWS, busca Data Firehose y selecciónalo
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(47).png)

2) Selecciona "Crear Firehose Stream"
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(65).png)

3) Configura la fuente de datos: Kinesis Data Stream
4) Elige el destino de tus datos: S3
5) Asígnale un nombre a tu Firehose Stream
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(66).png)
_En este Firehose, los datos se transformarán usando la Lambda de filtrado, de modo que solo se envíen al destino los registros de dispositivos que estén en estado WARN o ERROR_

6) En fuente debes buscar y hacer click en el kinesis stream que creaste para el laboratorio
7) Habilita la transformación de datos con lambda
8) Debes buscar y seleccionar la función lambda que creaste en el laboratorio. Esta lambda filtra los datos
9) Deja Buffer size con el valor predeterminado
10) En buffer interval cambialo a 60 segundos
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(70).png)

11) Habilita la conversión de formato de registros a Apache Parquet para mejorar compatibilidad y optimizar consultas posteriores
12) En la sección de Glue selecciona la región de "N. Virginia", tu base de datos y la tabla que creaste para el segundo proceso de filtrado de datos 
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(68).png)

13) En configuración del destino selecciona tu bucket creado para recibir los datos transformados
14) Habilita el "Delimitador de nueva línea"
15) Agrega un bucket prefix, en este caso debe ser el <"nombre de subcarpeta/">. El  prefix define la ruta dentro del bucket S3 donde Firehose guardará los datos procesados
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(69).png)

16) Deja los valores de encriptación y backup con sus valores predeterminados. Para terminar haz click en "Create Firehose Stream"
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(54)para%20firehose2.png)


**Tarea 12: Vuelve a simular datos en Lambda**

En la consola vuelve a Lambda y selecciona la función "DeviceSimulator" para  simular datos nuevos
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(13).png)

Haz click en Test y luego nuevamente en Test para ejecutar la simulación
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(55).png)


**Tarea 13: Revisar datos procesados en Athena**

Vuelve al servicio de Athena para revisar las tablas
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(39).png)

Ve al costado izquierdo y selecciona los tres puntos de la tabla dedicada para los datos transformados. Para ver una previa de los datos haz click en "Preview Table". Los datos pueden tardar unos segundos en actualizarse
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(62).png)

Athena generará una consulta automática y verás que los resultados incluyen solo los dispositivos que presentan fallas o están en alerta
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(67).png)

**Tarea 14: Revisar notificación SNS en Correo Electrónico** 

Cuando ejecutas Test en la Lambda de simulación, la Lambda transformadora:

- Filtrará los datos para enviar únicamente los registros WARN o ERROR al bucket destino
- Enviará una notificación al correo electrónico configurado en SNS a modo de alerta 
![Kinesis](https://raw.githubusercontent.com/iscatalan/LabKinesis/refs/heads/main/Labkinesis%20(71).png)

_________

_Detectar dispositivos con fallos o comportamientos fuera de rango permite anticipar problemas y prevenir fallas mayores. Por eso, establecer un flujo que notifique sobre los dispositivos con lecturas anómalas resulta clave para la detección de incidentes en tiempo real. Demuestra cómo la automatización y el análisis de datos permiten actuar rápidamente, mejorando la eficiencia y confiabilidad de los sistemas IoT_



**Puedes simular los datos en la lambda tantas veces como desees**


## ¡Felicidades, has completado el laboratorio!
