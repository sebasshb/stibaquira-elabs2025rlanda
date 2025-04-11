import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app';
import { Amplify } from 'aws-amplify';
import awsExports from '../src/aws-exports';

// Configura Amplify para SSR (v6)
Amplify.configure(awsExports, {
  ssr: true
});

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;