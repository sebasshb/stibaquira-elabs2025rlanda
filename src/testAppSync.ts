import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import { generateClient } from 'aws-amplify/api';
import { createAnuncios } from './graphql/mutations';

Amplify.configure(awsconfig);

const client = generateClient();

// Log para verificar la configuración de AWS
console.log("awsconfig:", awsconfig);

// Log para verificar la mutación
console.log("Mutación createAnuncios:", JSON.stringify(createAnuncios, null, 2));

async function testAppSyncConnection() {
  try {
    const contenido = "Mi primer anuncio";

    const input = {
      id: "5",
      content: contenido,
      createdAt: "2023-04-03",
    };

    console.log("Ejecutando mutación createAnuncios con los datos:", JSON.stringify(input, null, 2));

    const response = await client.graphql({
      query: createAnuncios,
      variables: { input }
    });

    console.log("✅ Mutación createAnuncios exitosa:", response);
  } catch (error: unknown) {
    console.error("❌ Error al conectar con AppSync:", error);
    
    if (error instanceof Error) {
      console.error("Mensaje de error:", error.message);
    }

    if (typeof error === 'object' && error !== null && 'errors' in error) {
      console.error("Detalles de los errores:", JSON.stringify(error.errors, null, 2));
    }
  }
}

testAppSyncConnection();