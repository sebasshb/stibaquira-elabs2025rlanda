import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports'; // Asegúrate de que la ruta sea correcta
import { generateClient } from 'aws-amplify/api';
import { createAnuncios } from './graphql/mutations';  // Importamos la mutación 'createAnuncios'

Amplify.configure(awsconfig);  // Configura Amplify

const client = generateClient();

// Log para verificar la configuración de AWS
console.log("awsconfig:", awsconfig);  // Verifica la configuración que se está utilizando

// Log para verificar que la mutación está bien definida
console.log("Mutación createAnuncios:", JSON.stringify(createAnuncios, null, 2)); // Mostrar la mutación en formato JSON

async function testAppSyncConnection() {
  try {
    // Definir la variable 'contenido' fuera del 'input'
    const contenido = "Mi primer anuncio";  // Contenido del anuncio

    // Datos a enviar a la mutación (según el esquema), ahora usando la variable 'contenido'
    const input = {
      id: "5",  // El ID que deseas asignar al nuevo anuncio
      content: contenido,  // Usamos la variable 'contenido'
      createdAt: "2023-04-04",  // Fecha de creación (en formato adecuado)
    };

    // Log para verificar los datos que estamos enviando
    console.log("Ejecutando mutación createAnuncios con los datos:", JSON.stringify(input, null, 2));

    // Ejecutamos la mutación con las variables
    const response = await client.graphql({
      query: createAnuncios,
      variables: { input }
    });

    // Log de la respuesta de la mutación
    console.log("✅ Mutación createAnuncios exitosa:", response);
  } catch (error: any) {
    console.error("❌ Error al conectar con AppSync:", error);
    console.error("Detalles completos del error:", error);
    if (error.errors) {
      console.error("Detalles de los errores:", JSON.stringify(error.errors, null, 2));
    }
  }
}

testAppSyncConnection();
