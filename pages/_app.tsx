import 'bootstrap/dist/css/bootstrap.min.css';  // Importa el archivo CSS de Bootstrap
import React from 'react';
import type { AppProps } from 'next/app';
import { Amplify } from 'aws-amplify';
import awsExports from '../src/aws-exports';

Amplify.configure(awsExports);  // Configura Amplify

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
