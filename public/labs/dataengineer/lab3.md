# Laboratorio Serverless (DynamoDB - Lambda - API Gateway)

[Ver vídeo guía](https://workshopde-videos-lab.s3.us-east-1.amazonaws.com/Lab_Serverless.mp4)

**Objetivo General:** Aprender a integrar servicios de AWS como DynamoDB, Lambda y API Gateway en una arquitectura serverless que simula una API de usuarios. Se desarrollará una función Lambda conectada a DynamoDB, expuesta mediante rutas en API Gateway y se validará su funcionamiento utilizando los métodos GET y POST desde el navegador y CloudShell. 



![Arquitectura AWS](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/arquitectura%20serverless%20(1).png) 



**Tarea 1: Revisión de los recursos de laboratorio**

1. En DynamoDB deberías encontrar una tabla llamada “Usuarios” con datos ya preestablecidos. En la tabla hay 20 usuarios y sólo algunos tienen contraseñas. Para encontrar la tabla debes ir a DynamoDB, luego en "Explorar Elementos" y seleccionar el círculo de la tabla "Usuarios"
2. También, en IAM deberías encontrar un rol llamado "LambdaExecutionRole". Este rol otorga a la función Lambda los permisos necesarios para interactuar con DynamoDB, permitiéndole insertar y obtener elementos de la tabla Usuarios. Esto es fundamental tanto para levantar la tabla del laboratorio como para el correcto funcionamiento de tu nueva función. Al asignar este rol, estarás asegurando que la Lambda tenga los permisos adecuados para acceder a los recursos que necesita. 
3. Además, encontrarás una función Lambda llamada "ConfigUsuarios", ya creada, que carga automáticamente los datos necesarios para levantar el laboratorio con la tabla Usuarios preconfigurada.

**Tarea 2: Crear una nueva función Lambda**

- En Lambda, debes crear una nueva función
![Lambda](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/Captura%20de%20pantalla%202025-07-17%20144737.png)
- Debes nombrarla y en tiempo de ejecución seleccionar Python: 
![Lambda](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/Captura%20de%20pantalla%202025-07-17%20144749.png)
-La arquitectura dejarla tal cual. Luego en "Permisos" seleccionar "Cambiar el rol de ejecución predeterminado" y apretar "Uso de un rol existente" y seleccionar "LambdaExecutionRole"
![Lambda](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/Dise%C3%B1o%20sin%20t%C3%ADtulo.jpg)

**Tarea 3: Elaborar código de la función Lambda**
- Con lo anterior, la configuración de la función Lambda ya está lista. El siguiente paso es implementar el código que permitirá probar el flujo de las operaciones GET y POST sobre la tabla Usuarios
- Actualmente, hay un código preconfigurado, pero debes reemplazarlo por un código que incluya el manejo de ambos métodos (POST y GET), además de establecer la conexión con DynamoDB para insertar y consultar datos correctamente.

- Paso 1: Eliminar el código existente en el archivo lambda_function.py. 
- Paso 2: Agregar tu nuevo código, que incluya el flujo de las operaciones POST y GET, y la conexión con DynamoDB. 
- Paso 3: Verificar que el archivo esté guardado. Si aparece un círculo al lado de lambda_function.py, significa que aún no se ha guardado.
- Paso 4: Una vez guardado, haz clic en "Deploy" para aplicar los cambios y actualizar la función Lambda.

![Lambda](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/lambda.jpg)


**Tarea 4: Probar la función Lambda**
- Vamos a "Probar", creamos un nuevo evento y lo nombramos
![Lambda](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/imagenes.jpg) 
- Luego, debes insertar una solicitud en formato JSON según el tipo de operación que quieras probar. Primero, realiza una prueba con el método GET, cuyo objetivo es consultar qué "username" tienen contraseña registrada en la tabla Usuarios.
- Para ello debes en "Evento Json" rellenar con el tipo de solicitud y los parámetros necesarios. Después selecciona la opción "Test" o "Probar" para ejecutar la solicitud.
- En este caso, al consultar el usuario Hugo, el resultado es true, lo que indica que sí tiene contraseña registrada en la tabla Usuarios.
- Editamos el "username" a "Nacho". Vuelve a hacer click en "Test". Esta vez, el resultado será false, porque Nacho no tiene una contraseña registrada en la tabla
![Lambda](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/imagenes%20(1).jpg) 
- Ahora, para hacer la prueba con POST, se debe reemplazar el método HTTP por POST e incluye un objeto "body" con los datos que deseas insertar en la tabla Usuarios. 
- Luego seleccionar nuevamente la opción "Test" para ejecutar la solicitud. Confirmamos en la tabla Usuarios que se haya agregado un nuevo elemento, antes eran 20, ahora son 21 y efectivamente se agregó "Anto". Y, de esta forma puedes ir agregando nuevos usuarios a la tabla. 
![Lambda](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/imagenes%20(2).jpg)


**Tarea 5: Crear REST API**
- Debes ir a API Gateway y crear una REST API. Solo tienes que nombrarla, los demás valores dejalos tal cual
![API](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/Captura%20de%20pantalla%202025-07-17%20165553.png)
- Ya con tu API creada debes crear un recurso. ¿Qué significa eso? API Gateway necesita saber qué ruta debe escuchar para dirigir las peticiones a tu función Lambda. Si no defines un recurso, no puedes asociarle métodos ni conectar con tu Lambda
![API](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/imagenes%20(3).jpg)
- Con el recurso ya listo puedes comenzar a configurar tus rutas a través de "Crear método". Es importante que estés creando los métodos con el recurso seleccionado, que sea vea celeste así como en la foto en donde el recurso es "/Usuarios" 
![API](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/Dise%C3%B1o%20sin%20t%C3%ADtulo.png)
- Al momento de configurar el método debes seleccionar el tipo y repetir este proceso tanto para GET como para POST. Luego, seleccionar el tipo de integración la con la función lambda que creaste en la tarea 2. Y es muy importante que actives la "Lambda proxy integration". Como se ve a continuación en el ejemplo: 
![API](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/Dise%C3%B1o%20sin%20t%C3%ADtulo%20(1).png)
- Debes escoger la función lambda que creaste en este laboratorio
![API](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/imagenes%20(4).jpg)
- Ya con los métodos GET y POST creados debes seleccionar "Implementar API" o "Deploy API"
![API](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/imagenes%20(5).jpg)
- Al colocar Deploy, se te pedirá nombrar una etapa (stage)

¿Qué es hacer "Deploy"? Significa publicar oficialmente tu API. Hasta ese momento, todo lo que habías configurado (recursos, rutas, métodos, integraciones) estaba solo guardado como borrador dentro del panel de configuración de API Gateway.
Al hacer el deploy tus rutas comienzan a estar activas, también se genera una Invoke URL que puedes usar para probar tu API en el navegador, Postman o desde código.

- Entonces presionas "nueva etapa", la nombras, luego haces click en "Implementación" y eso te llevará al URL de invocación que servirá para hacer las pruebas. Debes copiar ese URL
![API](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/imagenes%20(12).jpg)


**Tarea 6: Probar API en el navegador y CloudShell**
 
- Para probar el método GET que servirá para consultar si un usuario tiene contraseña en la tabla Usuarios, debes abrir tu navegador y utilizar la siguiente estructura de URL: → invoke URL + /nombreRecurso + ?username=<nombre del usuario> de la tabla “Usuarios”. Esto te mostrará en pantalla true o false dependiendo de si el usuario tiene una contraseña registrada en la tabla Usuarios
![API](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/imagenes%20(8).jpg)

- En el caso de POST. Este método te permite insertar un nuevo usuario en tu tabla DynamoDB. Para ello debes seguir los siguientes pasos: 


1. Abre CloudShell: Haz clic en el icono de CloudShell (es un ícono de terminal) en la parte superior derecha de la consola de AWS.
2. Pega el siguiente comando en la terminal, reemplazando InvokeURL por el que obtuviste al implementar tu API. Este comando envía una solicitud POST para insertar un nuevo usuario llamado Roberto, con país, color favorito y contraseña.

![API](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/athena%20(17).jpg)

```
curl -X POST InvokeURL + /nombreRecurso \
  -H "Content-Type: application/json" \
  -d '{"username":"Roberto", "país":"Chile", "color_favorito":"verde", "password":"robert34"}'
  ```

3. Verifica la tabla DynamoDB: Verás que se ha insertado una nueva fila con los datos del usuario Roberto.

![API](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/athena%20(18).jpg)


**DESAFÍO FINAL: Crea tu propia API con GET y POST**
- Usando el mismo flujo que desarrollaste en este laboratorio, crea una nueva API para manejar un conjunto de datos distinto. Por ejemplo, podrías crear una API para administrar libros de una biblioteca (con campos como título, autor, año). Debes crear una tabla DynamoDB nueva, separada de la tabla “Usuarios” que usaste en el laboratorio.

- Tu API debe cumplir con lo siguiente:
1. Usar método POST para agregar nuevos registros a DynamoDB
2. Usar método GET para consultar un registro específico por su identificador o algún campo clave
3. Retornar mensajes personalizados en las respuestas (por ejemplo, “Libro agregado con éxito”)


**(Opcional) Tarea 8: Probar el flujo de API con Postman**

- Instala Postman si es que no lo tienes, es un programa útil para el trabajo con APIs
- Luego, en API Gateway busca la URL base para Postman que está conformada por el Invoke URL del stage + /(nombre de ruta GET o Post) 
- Para el caso de GET pones el URL en Postman y lo manejas desde “Params” con “username” y value 
- Para POST utilizas el mismo URL, cambias la ruta y te diriges a body en que llenas los datos que deseas insertar en modo JSON. 

**¡Felicidades, has completado el laboratorio!**

