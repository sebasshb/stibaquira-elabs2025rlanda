import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app';
import { Amplify } from 'aws-amplify';
import awsExports from '../src/aws-exports';
import { useEffect } from 'react';
import Head from 'next/head';

// Configuración segura para Amplify v6
function configureAmplify() {
  try {
    Amplify.configure(awsExports, {
      ssr: true // Correcto: segundo parámetro
    });
  } catch (error) {
    console.error('Error configurando Amplify:', error);
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      configureAmplify();
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;