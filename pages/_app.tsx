// src/pages/_app.tsx
import { Amplify } from 'aws-amplify';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { ThemeProvider } from '../src/app/context/ThemeProvider';

// 👉 Fuente única de verdad: aws-exports del proyecto
import awsExports from '../src/aws-exports';

function configureAmplifyOnce() {
  // Configura Amplify con aws-exports (evitamos env vars y mapeos)
  Amplify.configure(awsExports);

  // Log útil (no expone secretos)
  try {
    const cfg: any = (Amplify as any).getConfig?.() || {};
    const auth = cfg?.Auth || cfg?.auth || {};
    const cognito = auth?.Cognito || {};
    console.log('Amplify Auth config:', {
      userPoolId: cognito.userPoolId || awsExports.aws_user_pools_id,
      userPoolClientId:
        '***' +
        String(cognito.userPoolClientId || awsExports.aws_user_pools_web_client_id).slice(-4),
      identityPoolId: cognito.identityPoolId || awsExports.aws_cognito_identity_pool_id,
    });
  } catch {
    // noop
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    configureAmplifyOnce();
  }, []);

  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
