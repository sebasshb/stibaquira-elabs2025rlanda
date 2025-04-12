// src/pages/_app.tsx
import { Amplify } from 'aws-amplify';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { ThemeProvider } from '../src/app/context/ThemeProvider'; // Nuevo import

// Configuración segura para todos los entornos
const configureAmplify = () => {
  const isProd = process.env.NODE_ENV === 'production';
  
  const graphqlConfig = {
    endpoint: isProd 
      ? process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT!
      : process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT || 'https://wozkdm52wbbofozgb4wybcxo6m.appsync-api.us-east-1.amazonaws.com/graphql',
    region: isProd
      ? process.env.NEXT_PUBLIC_AWS_REGION!
      : process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    apiKey: isProd
      ? process.env.NEXT_PUBLIC_APPSYNC_API_KEY!
      : process.env.NEXT_PUBLIC_APPSYNC_API_KEY || 'da2-iixru3au65bfxdo5c57o5zmytq',
    defaultAuthMode: 'apiKey' as const
  };

  const authConfig = {
    userPoolId: isProd
      ? process.env.NEXT_PUBLIC_USER_POOL_ID!
      : process.env.NEXT_PUBLIC_USER_POOL_ID || 'us-east-1_286IFgoGt',
    userPoolClientId: isProd
      ? process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!
      : process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '2lhc218m2ua8835f9tsogo95uh',
    identityPoolId: isProd
      ? process.env.NEXT_PUBLIC_IDENTITY_POOL_ID!
      : process.env.NEXT_PUBLIC_IDENTITY_POOL_ID || 'us-east-1:1bb1f48f-0b0b-4d94-8806-f66c417c7852'
  };

  Amplify.configure({
    API: {
      GraphQL: graphqlConfig
    },
    Auth: {
      Cognito: authConfig
    }
  });

  console.log('Amplify Config:', {
    API: {
      GraphQL: {
        ...graphqlConfig,
        apiKey: '***' + graphqlConfig.apiKey?.slice(-4)
      }
    },
    Auth: {
      Cognito: authConfig
    }
  });
};

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    configureAmplify();
  }, []);

  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;