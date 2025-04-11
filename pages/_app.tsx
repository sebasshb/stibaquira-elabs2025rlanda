import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { configureAmplify } from '../src/lib/amplifyClient';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Inicialización básica, pero la lógica principal está en amplifyClient.ts
    configureAmplify().catch(console.error);
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;