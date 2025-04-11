import 'bootstrap/dist/css/bootstrap.min.css';
import { Amplify } from 'aws-amplify';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import awsExports from '../src/aws-exports';

// Configuración compatible con AWS Amplify v6
const configureAmplify = () => {
  try {
    // 1. Intenta con aws-exports primero
    const config = {
      ...awsExports,
      ssr: true
    };

    // Limpieza de la configuración
    const { ssr, ...cleanConfig } = config;
    
    // Conversión de tipos para AWS Amplify v6 (¡nota el 'apiKey' en minúsculas!)
    const amplifyConfig = {
      API: {
        GraphQL: {
          endpoint: cleanConfig.aws_appsync_graphqlEndpoint,
          region: cleanConfig.aws_appsync_region,
          apiKey: cleanConfig.aws_appsync_apiKey,
          defaultAuthMode: 'apiKey' as const // Cambiado a minúsculas
        }
      },
      Auth: {
        Cognito: {
          userPoolId: cleanConfig.aws_user_pools_id,
          userPoolClientId: cleanConfig.aws_user_pools_web_client_id,
          identityPoolId: cleanConfig.aws_cognito_identity_pool_id
        }
      }
    };

    Amplify.configure(amplifyConfig);
    console.log('Amplify configurado:', Amplify.getConfig());
  } catch (error) {
    console.error('Error configurando Amplify:', error);
    
    // Configuración de respaldo con tipos correctos
    const backupConfig = {
      API: {
        GraphQL: {
          endpoint: process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT!,
          region: process.env.NEXT_PUBLIC_AWS_REGION!,
          apiKey: process.env.NEXT_PUBLIC_APPSYNC_API_KEY!,
          defaultAuthMode: 'apiKey' as const // Cambiado a minúsculas
        }
      },
      Auth: {
        Cognito: {
          userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,
          userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!,
          identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID!
        }
      }
    };

    Amplify.configure(backupConfig);
    console.warn('Usando configuración de respaldo');
  }
};

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    configureAmplify();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;