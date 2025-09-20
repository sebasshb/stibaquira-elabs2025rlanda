# Laboratorio Serverless (DynamoDB - Lambda - API Gateway)

[Ver vídeo guía](https://workshopde-videos-lab.s3.us-east-1.amazonaws.com/Lab_Serverless.mp4)

**Objetivo General:** Aprender a integrar servicios de AWS como DynamoDB, Lambda y API Gateway en una arquitectura serverless que simula una API de usuarios. Se desarrollará una función Lambda conectada a DynamoDB, expuesta mediante rutas en API Gateway y se validará su funcionamiento utilizando los métodos GET y POST desde el navegador y CloudShell. 



![Arquitectura AWS](https://raw.githubusercontent.com/iscatalan/arquitecturas/refs/heads/main/arquitectura%20serverless%20(1).png) 



**Tarea 1: Revisar tabla en DynamoDB**

En la consola de AWS, en el buscador superior escribe DynamoDB y haz clic en el servicio
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless1.png)

En el menú lateral izquierdo haz click en "Explorar Elementos". Para así llegar directamente a los elementos de la tabla. Para ello selecciona "Usuarios" 
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless2.png)

Verás que la tabla ya contiene 20 usuarios, algunos con contraseña y otros sin. El objetivo de este laboratorio será crear más usuarios mediante nuestras pruebas con Lambda y API Gateway
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless3.png)


**Tarea 2: Crear una nueva función Lambda**

En el buscador de la consola de AWS escribe Lambda y entra al servicio
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless4.png)

Haz clic en Crear función
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless5.png)

Selecciona "Crear desde cero" y luego nombrar tu función
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless6.png) 

Para tiempo de ejecución selecciona "Python 3.13" y en Arquitectura deja el valor otorgado por defecto
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless7.png)

En "Permisos" expande la sección apretando "Cambiar el rol de ejecución predeterminado". Luego selecciona "Uso de un rol existente" 
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless8.png)


En este laboratorio, el rol ya está creado previamente. Debes seleccionar el rol cuyo nombre contenga "LambdaExecutionRole"
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabAthena%20(26).png)
Este rol le otorga a tu función Lambda los permisos necesarios para interactuar con DynamoDB, específicamente para insertar y consultar elementos en la tabla "Usuarios".


Para terminar selecciona "Crear una función"
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless10.png)


**Tarea 3: Escribir el código de la función Lambda**

## [Descarga el script aquí](https://workshop-mo.s3.us-east-1.amazonaws.com/script_lambda.py)

Tu función Lambda ya está creada. El siguiente paso es agregar el código del script que permitirá realizar las operaciones GET y POST de este laboratorio.

Primero debes eliminar el código predeterminado
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless.png)

Luego debes insertar el script en el bloque de código. Una vez insertado debes presionar "Deploy" para aplicar los cambios
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(1)1111.png)


**Tarea 4: Probar la función Lambda** 

Para probar la función, dirígete a la sección "Probar" y mantén seleccionada la opción "Crear un nuevo evento" que aparece de forma predeterminada 
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(2).png)

En la sección Evento de prueba (JSON), primero elimina la plantilla que aparece por defecto. El objetivo es que el evento quede escrito en formato clave–valor, es decir, con los datos que realmente vas a enviar a la función
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(3).png)

Primero selecciona el método que usarás para la prueba. En este caso, elige "httpMethod": "GET" para consultar los nombres de usuario que ya están guardados en la tabla

```
{
  "httpMethod": "GET",
  "queryStringParameters": {
    "username": "Hugo"
  }
}
```
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(4).png) 

Haz clic en el botón Probar para ejecutar el primer evento. Al hacerlo, se mostrará el detalle de la ejecución de la función Lambda, donde podrás ver el resultado de la consulta:
- Si el usuario tiene contraseña, aparecerá reflejado en la respuesta con el valor "True"

- Si el usuario no tiene contraseña, quedará indicado con valor "False" 

En este ejemplo, la respuesta indica que el usuario “Hugo” sí tiene password
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(5).png)


Para verificar el resultado, vuelve al buscador y accede al servicio DynamoDB
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(6).png)


En el menú lateral selecciona "Explorar elementos" y luego elige la tabla "Usuarios". Allí podrás comprobar que efectivamente el usuario “Hugo” tiene contraseña registrada en la tabla
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(7).png)

Regresa a tu función Lambda y esta vez selecciona el método "httpMethod: POST". Este método se utilizará para crear e insertar un nuevo usuario en la tabla Usuarios. Asegúrate de preparar el evento JSON con los datos del nuevo usuario en formato clave–valor. Tal como se muestra a continuación: 

```
{
  "httpMethod": "POST",
  "body": "{ \"username\": \"Anto\", \"pais\": \"Chile\", \"mascotas\": \"2\", \"password\": \"Anto2234\" }"
}
```

![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(8).png)

Ejecuta nuevamente la prueba haciendo click en "Probar". Si la ejecución se realizó correctamente, la respuesta mostrará: Usuario agregado/actualizado correctamente. Esto indica que el nuevo usuario fue insertado exitosamente
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(9).png)

Nuevamente en la consola vuelve a DynamoDB y a la tabla "Usuarios". Ahí podrás verificar que el nuevo usuario fue insertado correctamente, tal como se muestra en la imagen:
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless10%20(2).png)
 

**Tarea 5: Crear una API en API Gateway**

En el buscador de la consola escribe API Gateway e ingresa al servicio
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(11).png) 

Selecciona "Crear una API"
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(12).png)

Elige "API REST" y "Crear"
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(13).png)

Nombra tu API (ej: APIUsuarios) y deja las demás opciones por defecto, luego "Crear API"
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(14).png) 

Con la API creada debes crear un recurso en API Gateway. Esto le indica a la API qué ruta debe escuchar para enviar las peticiones a tu función Lambda
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(15).png)

Nombra tu recurso y deja los demás elementos por defecto, luego selecciona "Crear recurso"
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(1)22.png)

Una vez creado el recurso, puedes comenzar a configurar las rutas mediante “Crear método”. Asegúrate de tener seleccionado el recurso y haz click en "Crear método"
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(17).png)

Para el tipo de método selecciona "GET"
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(18).png)

Selecciona "Función de Lambda"  como tipo de integración
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(19).png)

Activa “Lambda proxy integration”. Luego en "Función de Lambda" selecciona la función creada en este laboratorio en la tarea 2
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(20).png)

Deja las otras opciones por defecto. Y, selecciona "Crear método"
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(21).png)

Tu panel izquierdo debería verse así. Repite el paso anterior para crear un nuevo método, esta vez seleccionando POST
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(22).png)

Con los métodos GET y POST ya creados, tu panel debería verse así. Para publicar la API haz clic en “Implementar API” o "Deploy API"
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(23).png)

Selecciona “Nueva etapa”, asigna un nombre y haz clic en "Implementar" para publicar la API
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(24)11.png)



*Deploy significa publicar oficialmente tu API. Antes del deploy, todo (recursos, rutas, métodos e integraciones) está solo guardado como borrador Al hacer el deploy, las rutas se activan y se genera un Invoke URL que puedes usar para probar la API en el navegador, Postman o desde código.*



Copia tú "URL de invocación"
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(25).png)


**Tarea 6: Probar API en el navegador y CloudShell**

Para probar el método GET y consultar si un usuario tiene contraseña en la tabla "Usuarios" debes abrir tu navegador. Y, pegar la URL de invocación con la siguiente estructura:

*InvokeURL/nombreRecurso?username=<"nombre del usuario">*


Esto mostrará en pantalla true o false, según si el usuario tiene contraseña registrada.

En este ejemplo, el usuario Hugo sí tiene contraseña. Para confirmarlo, vuelve a la consola y revisa la tabla "Usuarios" en DynamoDB, como se muestra a continuación: 
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(26).png)

Para probar el método POST, debes ir a CloudShell (el ícono de terminal ubicado en la parte superior derecha de la consola de AWS). Ahí podrás ejecutar el comando que enviará la solicitud POST e insertará un nuevo usuario en la tabla Usuarios.
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(27).png)

Pega el siguiente comando en CloudShell, reemplazando InvokeURL por el que obtuviste al implementar tu API. Este comando envía una solicitud POST que inserta un nuevo usuario llamado Roberto, con pais, color favorito y contraseña:

```
curl -X POST InvokeURL + /nombreRecurso \
  -H "Content-Type: application/json" \
  -d '{"username":"Roberto", "pais":"Chile", "color_favorito":"verde", "password":"robert34"}'
  ```


![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(28).png)


Así se debería ver tu comando en CloudShell
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(29).png)

Vuelve a DynamoDB, entra a la tabla "Usuarios" y explora sus elementos.
Ahí podrás confirmar si es que se ha insertado una nueva fila con los datos del nuevo usuario
![Serverless](https://raw.githubusercontent.com/iscatalan/labserverlesspic/refs/heads/main/LabServerless%20(30).png)



# ¡Felicidades, has completado el laboratorio!

##

**DESAFÍO FINAL: Crea tu propia API con GET y POST**

Usando el mismo flujo que desarrollaste en este laboratorio, crea una nueva API para manejar un conjunto de datos distinto. Por ejemplo, podrías crear una API para administrar libros de una biblioteca (con campos como título, autor, año). Debes crear una tabla DynamoDB nueva, separada de la tabla “Usuarios” que usaste en el laboratorio.

Tu API debe cumplir con lo siguiente:

1. Usar método POST para agregar nuevos registros a DynamoDB
2. Usar método GET para consultar un registro específico por su identificador o algún campo clave
3. Retornar mensajes personalizados en las respuestas (por ejemplo, “Libro agregado con éxito”)



**(OPCIONAL): Probar el flujo de API con Postman**

1. Instala Postman si no lo tienes. Es una herramienta muy útil para probar APIs

2. En API Gateway, busca la URL base para tu API (Invoke URL del stage + /nombreRecurso)

3. Para GET:

    - Ingresa el Invoke URL en Postman.

    - Usa la pestaña Params, agrega username como clave y el nombre del usuario como valor

4. Para POST:

    - Usa el mismo Invoke URL

    - Ve a la pestaña Body, selecciona raw y elige formato JSON

    - Ingresa los datos del nuevo registro en formato JSON
