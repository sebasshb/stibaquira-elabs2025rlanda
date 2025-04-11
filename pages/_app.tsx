// _app.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import awsExports from '../src/aws-exports';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Amplify.configure(awsExports);
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
