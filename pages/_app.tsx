import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app';
import { Amplify } from 'aws-amplify';
import awsExports from '../src/aws-exports';

// Configuración básica pero segura para SSR
if (typeof window !== 'undefined') {
  Amplify.configure(awsExports);
}

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;