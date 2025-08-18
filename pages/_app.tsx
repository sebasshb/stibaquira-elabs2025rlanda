// src/pages/_app.tsx
import { Amplify } from 'aws-amplify';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '../src/app/context/ThemeProvider';

// 👉 Fuente única de verdad: aws-exports del proyecto
import awsExports from '../src/aws-exports';

// ✅ Configura Amplify en top-level (más rápido, evita carreras)
Amplify.configure(awsExports);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
