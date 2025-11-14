# Laboratorio OpenSearch

**Objetivo General:**  Comprender el uso de Amazon OpenSearch Service (Serverless) como herramienta de análisis, practicando la creación de índices, la carga manual de datos mediante la API JSON y métodos HTTP (POST, GET, PUT), y el diseño de dashboards interactivos que permitan visualizar patrones y tendencias en los datos

![Arquitectura](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20arquitectura.png)


### **Tarea 1: Crear colección serverless**

Para comenzar, en la consola de AWS, escribe OpenSearch en la barra de búsqueda y selecciona el servicio
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(2).png)

Una vez dentro de Amazon OpenSearch, si aparece un error de permisos, revisa el panel lateral izquierdo y asegúrate de estar en **OpenSearch Serverless**. Luego, selecciona “Collections” para comenzar con la creación de una nueva colección
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(3).png)

1. Haz click en "Create Collection"
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(4).png)

2. Asigna un nombre a tu colección
3. En el campo "Type", selecciona “Search”

    **En OpenSearch Serverless hay 3 tipos de colecciones que puedes elegir:**

    Search: Se utiliza para almacenar, indexar y buscar datos textuales o estructurados. Ideal para crear dashboards, ejecutar búsquedas por palabras clave o analizar registros. 

    Time Series: Optimizada para analizar grandes volúmenes de datos semiestructurados generados por máquinas o eventos en tiempo casi real. Ideal para monitoreo y métricas que cambian constantemente. 

    Vector Search: Se utiliza para almacenar y buscar representaciones vectoriales de datos, como las que generan los modelos de IA. Ideal para búsquedas semánticas o sistemas de recomendación. 
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(5).png)

4. En seguridad selecciona "Easy Create". 
5. Desplázate hasta el final de la página y haz click en “Next” para continuar con el siguiente paso de configuración
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(6).png)
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(7).png)

6. Nuevamente, desplázate hasta el final de la página y haz click en "Next". Manteniendo los valores predeterminados, sin realizar cambios
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(8).png)
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(9).png)

7. En el último paso, revisa que toda la configuración esté correcta
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(10).png)

8. Haz click en “Submit” para crear la colección serverless. Demora un par de minutos en crearse
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(11).png)


### **Tarea 2: Activar OpenSearch Dashboards**

Una vez creada la colección serverless el siguiente paso es habilitar OpenSearch Dashboards que te permitirá visualizar y explorar los datos mediante gráficos y dashboard interactivos

1. Dirígete a la sección de "Network" y haz click en "Manage network access" para configurar los permisos de acceso al dashboard
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(12).png)
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(13).png)

2. Elige la colección que creaste y luego haz click en "Edit"
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(14).png)
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(15).png)

3. Debes habilitar el acceso a Opensearch Dashboards. Luego busca el nombre de tu colección y selecciónala tal como se muestra a continuación
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(16).png)

4. Con el panel de la izquierda puedes volver a tu colección. Haz click en “Dashboard” y luego selecciona la opción de Dashboard correspondiente a tu colección
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(17).png)

5. Se abrirá una nueva ventana en tu navegador mostrando OpenSearch Dashboards donde podrás explorar y visualizar tus datos de manera interactiva
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(18).png)


### **Tarea 3: Cargar datos usando la API de OpenSearch** 

Para efectos de este laboratorio, los datos serán simulados y se cargarán manualmente a través de la API de OpenSearch. Por ello, es necesario utilizar la estructura JSON y peticiones HTTP, ya sea PUT, POST, GET. Lo que permitirán indexar la información en la colección

Descarga los datos de este laboratorio en el siguiente link: 
### [Descargar](https://workshop-mo.s3.us-east-1.amazonaws.com/sales_data.json)

1. Haz click en la opción de "Interact wirh the OpenSearch API"
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(19).png)

2. Utiliza el método PUT para crear el índice con la siguiente estructura: 

``` 
PUT /sales-data
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "customer_id": { "type": "keyword" },
      "gender": { "type": "keyword" },
      "country": { "type": "keyword" },
      "category": { "type": "keyword" },
      "sales_amount": { "type": "double" },
      "quantity": { "type": "integer" },
      "date": { "type": "date" }
    }
  }
}


``` 

3. Una vez pegado el código, haz click en el ícono “Play” para ejecutar la solicitud y crear el índice
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(20).png)

4. Revisa el archivo que descargaste anteriormente y copia todo su contenido
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(21).png)

5. Para cargar todos los datos, utiliza el método POST junto con _bulk. La estructura funciona de la siguiente manera:

- Primero se escribe el índice con su nombre
- Luego, se colocan los datos en formato JSON
- Este patrón se intercala para todos los registros que quieras cargar

Entonces, escribe POST _bulk y luego pega todo el contenido del archivo que copiaste anteriormente. Esto permitirá cargar los datos de manera masiva en tu índice

**A continuación se muestra un fragmento con solo una parte de los datos para ilustrar la estructura:**

``` 
POST _bulk 
{"index": {"_index": "sales-data"}}
{"customer_id": "C0001", "gender": "Women", "country": "Argentina", "category": "Toys", "sales_amount": 461.59, "quantity": 7, "date": "2025-01-10T19:09:01"}
{"index": {"_index": "sales-data"}}
{"customer_id": "C0002", "gender": "Women", "country": "Brazil", "category": "Clothing", "sales_amount": 473.24, "quantity": 9, "date": "2025-12-11T17:32:39"}
``` 
6. Una vez pegado, haz click en el ícono “Play” para ejecutar la solicitud  e insertar los datos
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(22).png)

7. Verifica que los datos se hayan insertado correctamente utilizando el siguiente comando

``` 
GET sales-data/_count
``` 
Este comando devuelve el número total de datos presentes en el índice "sales-data". Si todo se cargó correctamente, el conteo debería coincidir con la cantidad de registros que pegaste mediante _bulk, o sea 1.000 valores
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(23).png)

### **Tarea 4: Crear un index pattern a partir de los datos** 

En el panel izquierdo, selecciona “Dashboard” para comenzar a crear los gráficos y visualizaciones de tus datos
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(24).png)

1. Para iniciar, debes crear un "Index Pattern" que es básicamente una plantilla que le dice a OpenSearch Dashboards qué datos del índice usar y cómo interpretarlos
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(25).png)

2. Escribre el nombre de tu índice con un * al final y haz click en "Next step" 
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(26).png)

3. En "Time Field" selecciona date como valor y selecciona "Create index pattern" 
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(27).png)

4. Vuelve al panel izquierdo para acceder a Dashboard
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(28).png)

5. Haz click en "Create new dashboard" 
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(29).png)


**_OpenSearch ofrece muchos tipos de visualizaciones para analizar los datos. En este laboratorio se mostrará ejemplos de cómo estructurarlos para crear un dashboard interactivo, pero eres libre de explorar los datos y crear tus propios gráficos_**


### **Tarea 5: Visualizar la proporción de género con un gráfico de torta** 

1. Debes crear un nuevo objeto en el dashboard, ya sea un gráfico o visualización, para comenzar a rellenar tu panel interactivo 
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(30).png)

2. En este caso, analizaremos la cantidad de clientes según el género. Para representar visualmente esta información, es ideal utilizar un gráfico de torta (Pie Chart), ya que permite ver de forma clara la proporción de cada género. Entonces, elige el ícono "Pie"
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(31).png)

3. Luego, selecciona tu índice como fuente de datos para la visualización. Esto permitirá que el gráfico utilice la información almacenada en tu colección 
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(32).png)

4. En Periodo, selecciona “5 years ago” como inicio y “now” como fin. Verás que si eliges un periodo menor, se mostrarán menos datos, ya que el gráfico solo incluirá los registros dentro del rango seleccionado. Con "Update" puedes ver esos cambios
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(33).png)

**_En OpenSearch, los datos se trabajan a partir de métricas, que son los valores que quieres mostrar en tu gráfico. Por ejemplo, puedes usar la suma de ventas (sales_amount) o simplemente contar la cantidad de ventas. Para que el gráfico muestre datos correctamente, primero debes elegir una agregación, como Sum o Count, que define cómo se van a calcular esos valores._**


**_En la sección de Buckets puedes agrupar los datos de distintas formas, como usando date histogram para fechas o terms para campos específicos. Por ejemplo, seleccionando género como term puedes ver la proporción de clientes masculinos y femeninos._**

5. Entonces, selecciona “Count” en Aggregation para definir que queremos contar los registros. 

6. Luego, en Buckets para graficar el campo de género, elige “Terms” en "Aggregation". Y, finalmente, selecciona “gender” en "Field" que es el dato que queremos mostrar en el gráfico, ya sea representar la cantidad total de cada género. Tal como se muestra a continuación:
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(34).png)

7. El panel de “Options” sirve para editar la apariencia del gráfico. En este caso, selecciona “Show labels” para que los valores se muestren dentro del gráfico, haciendo la información más clara y fácil de interpretar para el espectador

8. Haciendo click en los círculos de colores, puedes cambiar los colores de cada categoría del gráfico según tus preferencias
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(35).png)

**_Para ver los cambios en tiempo real, después de configurar los parámetros, debes hacer click en “Update” al final de las opciones. Esto aplicará las modificaciones y actualizará la visualización_**
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(58).png)

8. Para guardar el gráfico, asígnale un nombre y luego haz click en “Save”
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(36).png)


9. Una vez creado el gráfico, si quieres volver a editarlo, selecciona el ícono de configuración que te permitirá modificar el gráfico, clonar el panel o cambiar el título
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(67).png)

### **Tarea 6: Almacenar panel de visualizaciones**

Para no perder los cambios realizados es una buena práctica guardar el panel que contendrá todos los gráficos de tu dashboard interactivo. Lo que permite consultarlo y modificarlo posteriormente

1. Para ello, en la parte derecha haz click en "Save" 
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(68).png)

2. Asígnale un nombre a tu dashboard interactivo y selecciona "Save"
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(54).png)

### **Tarea 7: Visualizar cantidad de ventas por categoría y género en un gráfico de barras horizontales**

1. Selecciona el ícono de "Barras Horizontales"
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(37).png)

2. Luego, selecciona tu índice como fuente de datos para la visualización. Esto permitirá que el gráfico utilice la información almacenada en tu colección 
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(32).png)

3. En las métricas del "Y-axis", selecciona “Count” en "Aggregation". Luego, para que el nombre del gráfico no aparezca como el valor por defecto (por ejemplo, sum_values), puedes editarlo en “Custom label” asignándole un nombre más claro como “Cantidad” o “Quantity” que será el que se muestre en el eje Y del gráfico

4. En X-axis, selecciona “Terms” como tipo de agregación y elige en "Field" la opción “categoria”, para que el gráfico muestre las distintas categorías de productos

5. Cambia el valor del tamaño en “size” de 5 a 10, de manera que se muestren todas las categorías en el gráfico
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(56).png)

6. Para mostrar más de un elemento en el mismo gráfico, como género y ventas por categoría, debes hacer click en “Add” y luego, agregar otra “Split Series”.
Esto te permite incluir un subvalor adicional que quieres graficar, mostrando más información en una sola visualización

7. Entonces, en "Sub aggregation" elige "Terms" y en "Field" selecciona "gender" y haz click en "Update" para ver los cambios

![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(39).png)


8. En "Settings" activa la opción “Show values on chart”. Esto hará que los valores se muestren directamente en el gráfico, haciendo la visualización más clara para quien la observe

9. Asígnale un nombre a tu gráfico y luego haz click en “Save and return” para guardarlo y regresar al dashboard
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(40).png)

10. Puedes visualizar los resultados directamente en el dashboard. Si deseas editar el gráfico, haz click en el ícono de configuración
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(57).png)



### **Tarea 8: Visualizar ventas por país a lo largo de 4 años en un gráfico de barras verticales** 

1. Selecciona la opción de "Barra vertical"
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(42).png)

2. Luego, selecciona tu índice como fuente de datos para la visualización. Esto permitirá que el gráfico utilice la información almacenada en tu colección 
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(32).png)

3. En la sección "Aggregation" del eje Y (Y-axis), selecciona "Sum" para que el campo(Field) "sales_amounts" se sume correctamente

4. En field elige "sales_amount"

5. En "Custom_label" asígnale un nombre a tu eje Y, como por ejemplo "Ventas Totales ($)" 

6. En la sección "Aggregation" del eje X (X-axis), selecciona "Date Histogram" que permite visualizar los datos por periodo. Luego, en el campo (Field) elige "date"

7. Para mostrar los resultados en intervalos anuales selecciona la opción "Year"

8. En "Custom_label" asígnale un nombre a tu eje X, como por ejemplo "Periodo" 
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(50).png)

9. Para agregar un subvalor al gráfico y combinar elementos en la visualización y análisis selecciona "Split series"

10. En "Sub aggregation" selecciona "Terms" para un campo específico (Field) que en este caso será el de países, por lo que debes elegir la opción de "country"

11. Aumenta el "size" de 5 a 10 para que se visualicen todos los países en el gráfico. Una vez hecho, haz click en "Update" para poder ver los cambios
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(52).png)

12. En "Metrics & axes" verifica que "Chart type" esté en la opción de "bar" y en modo normal

13. Asígnale un nombre a tu gráfico y haz click en "Save and return" 
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(53).png)

14. Revisa el resultado de tu gráfico, puedes volver a configurarlo o cambiar los colores según sea necesario
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/Captura%20de%20pantalla%202025-11-11%20210642.png)

### **Tarea 9: Creación de Indicadores Clave o KPIs para la toma de decisiones** 

1. Haz click en ícono de "Metric"
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(69).png)

2. En “Metric”, selecciona como Aggregation la opción “Unique Count” que permite contar los valores únicos.
En este caso, queremos contar los países activos y que si se agregan más el gráfico se actualice automáticamente

3. En "Field" elige "country" 

4. En “Custom Label” asigna un nombre descriptivo que aparecerá debajo del número en el gráfico, por ejemplo: “Países”.
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(48).png)

5. Selecciona “Options” para configurar el tamaño de la letra y establece el valor en 34

6. Asígnale un nombre y haz click en "Save and return"
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(59).png)

7. Elige la opción de crear otro gráfico y haz click  ícono de "Metric" 
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(69).png)

8. Para mostrar el valor más alto de la suma de ventas por categoría, en Aggregation selecciona “Top Hit” y en Field elige “category” que es el dato que queremos revisar

9. Mantén los demás valores en su configuración predeterminada
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(60).png)

10. En "Options" desactiva la opción "Show title" por motivos visuales, para evitar que aparezca un valor debajo de "Electronics"

11. Configura el tamaño de la letra y establece el valor en 34. Haz click en "Save and return"
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(61).png)

12. Elige la opción de crear otro gráfico y haz click  ícono de "Metric" 
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(69).png)


13. Para visualizar la suma total de ventas, en Aggregation selecciona la opción "Sum" y en Field elige "sales_amount" 
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(65).png)

14. En "Options" desactiva la opción "Show title" por motivos visuales

15. Configura el tamaño de la letra y establece el valor en 34. 

16. Para finalizar haz click en "Save and return"
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(66).png)

Puedes agregar más KPIs, como la suma de compras para visualizar la cantidad total de ventas realizadas. También puedes incluir otros valores que consideres relevantes para el análisis de ventas

### **Tarea 10: Ajustar el tamaño de los gráficos en el dashboard**

Al crear y guardar cada gráfico habrás notado que se almacenan con un tamaño predeterminado. Por ejemplo, los KPIs suelen guardarse con un tamaño grande. Puedes ajustarlos según el tamaño que desees y arrastrarlos a la posición que prefieras dentro del dashboard. Como se muestra a continuación: 
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/Captura%20de%20pantalla%202025-11-11%20204207.png)


### **Tarea 11: Analizar el dashboard final y revisar los resultados** 

Luego de ajustar y acomodar los tamaños de los gráficos, puedes guardar todo tu panel interactivo desde la parte superior derecha para publicarlo. De esta manera, obtendrás un resultado como el siguiente:
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/Captura%20de%20pantalla%202025-11-11%20205753.png)
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(45).png)

### **Tarea 12: Interactuar con el Dashboard** 

Puedes interactuar con el gráfico. Por ejemplo, seleccionando un país dentro de las fechas predeterminadas para ver los resultados específicos de ese país, como ventas, divididas por género, categoría u otros criterios. Como puedes ver a continuación: 
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/opensearch%20(55).png)
![search](https://raw.githubusercontent.com/iscatalan/Labopensearch/refs/heads/main/Captura%20de%20pantalla%202025-11-11%20205928.png)