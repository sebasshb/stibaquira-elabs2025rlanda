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
        const currentConfig = Amplify.getConfig();
        setConfigDetails(currentConfig);
        
        if (!currentConfig.API?.GraphQL?.endpoint) {
          throw new Error('Configuración GraphQL incompleta');
        }

        setConnectionStatus('Conectando a GraphQL...');
        const client = generateClient();
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: El servidor no respondió')), 5000));
        
        const queryPromise = client.graphql({
          query: `query { __schema { types { name } } }`
        } as any);

        await Promise.race([queryPromise, timeoutPromise]);
        setConnectionStatus('✅ Conexión exitosa con AppSync');
        
        setTimeout(() => router.push('/admin'), 2000);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setConnectionStatus(`❌ Error: ${errorMessage}`);
        console.error('Error en testConnection:', error);
      }
    };

    testConnection();
  }, [router]);

  return (
    <div className="login-container">
      <h2 className="login-title">Prueba de Conexión</h2>
      <div className="connection-status">
        <p>{connectionStatus}</p>
        {configDetails && (
          <div className="config-details">
            <h4>Detalles de configuración:</h4>
            <pre>{JSON.stringify({
              ...configDetails,
              API: configDetails.API ? {
                ...configDetails.API,
                GraphQL: configDetails.API.GraphQL ? {
                  ...configDetails.API.GraphQL,
                  apiKey: '***' + (configDetails.API.GraphQL.apiKey?.slice(-4) || '')
                } : null
              } : null
            }, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPage;