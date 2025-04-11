import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app';
import { Amplify } from 'aws-amplify';
import awsExports from '../src/aws-exports';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Creamos una copia limpia de la configuración
    const config = { 
      ...awsExports
    };
    
    // Eliminamos propiedades no estándar de manera segura
    if ('ssr' in config) {
      const { ssr, ...rest } = config;
      Amplify.configure(rest);
    } else {
      Amplify.configure(config);
    }
    
    console.log('Amplify configurado con GraphQL');
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;