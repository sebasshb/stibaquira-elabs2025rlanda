import 'bootstrap/dist/css/bootstrap.min.css';
import { Amplify } from 'aws-amplify';
import awsExports from '../src/aws-exports';
import { useEffect } from 'react';
import type { AppProps } from 'next/app';

function safeConfigureAmplify() {
  try {
    Amplify.configure({ 
      ...awsExports,
      API: {
        GraphQL: {
          endpoint: awsExports.aws_appsync_graphqlEndpoint,
          region: awsExports.aws_project_region,
          defaultAuthMode: 'apiKey' // Tipo correcto
        }
      }
    });
  } catch (error) {
    console.error('Error configuring Amplify:', error);
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Configura Amplify solo en el cliente
    if (typeof window !== 'undefined') {
      safeConfigureAmplify();
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;