'use client';
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Amplify } from 'aws-amplify';
import { useRouter } from 'next/router';
import '../public/styles/admin.css';

const TestPage = () => {
  const [connectionStatus, setConnectionStatus] = useState('Probando conexión...');
  const [configDetails, setConfigDetails] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const testConnection = async () => {
      try {
        // 1. Verificar configuración de Amplify
        const amplifyConfig = Amplify.getConfig();
        setConfigDetails(amplifyConfig);
        console.log('Configuración de Amplify:', amplifyConfig);

        if (!amplifyConfig.API?.GraphQL) {
          throw new Error('No se encontró configuración GraphQL');
        }

        // 2. Intentar una operación simple (query o mutation)
        const client = generateClient();
        
        // Opcional: Si tienes una query de prueba, úsala aquí
        // Si no, haremos una prueba de conexión básica
        setConnectionStatus('Conectando al endpoint GraphQL...');
        
        // Test de conexión simple
        await client.graphql({ 
          query: `query { __schema { types { name } } }` 
        } as any);

        setConnectionStatus('✅ Conexión exitosa con AppSync');
        
        // Redirigir a admin después de 3 segundos si todo está bien
        setTimeout(() => {
          router.push('/admin');
        }, 3000);

      } catch (error) {
        console.error('Error en testConnection:', error);
        setConnectionStatus(`❌ Error de conexión: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="login-container">
      <h2 className="login-title">Prueba de Conexión</h2>
      <div className="connection-status">
        <p>{connectionStatus}</p>
        {configDetails && (
          <div className="config-details">
            <h4>Detalles de configuración:</h4>
            <pre>{JSON.stringify(configDetails, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPage;