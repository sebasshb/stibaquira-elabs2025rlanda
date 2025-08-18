// src/pages/_app.tsx
import { Amplify } from 'aws-amplify';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '../src/app/context/ThemeProvider';
import awsExports from '../src/aws-exports';

// ✅ Configura Amplify una sola vez al cargar el bundle
Amplify.configure(awsExports);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
