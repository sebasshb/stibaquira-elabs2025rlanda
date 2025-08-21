// pages/_app.tsx
import { Amplify } from 'aws-amplify';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from '../src/app/context/ThemeProvider';
import awsExports from '../src/aws-exports';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

// 👇 Importo tu CSS global para que el loader herede variables/estilos
import '../public/styles/admin.css';

Amplify.configure(awsExports);

// Loader visual con tus clases y variables
function LoadingScreen({ message = 'Validando sesión…' }: { message?: string }) {
  return (
    <div className="auth-guard-screen">
      <div className="auth-guard-card" role="status" aria-live="polite">
        <span className="auth-guard-spinner" />
        <div className="auth-guard-text">
          <h2>Un momento…</h2>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}

// Guard global: bloquea rutas protegidas y muestra loader también durante cambios de ruta
function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const isProtected = useMemo(() => {
    const p = router.pathname;
    return p.startsWith('/admin') || p.startsWith('/rrhh') || p.startsWith('/student');
  }, [router.pathname]);

  // Loader durante navegación hacia rutas protegidas (evita “pantalla blanca” post-login)
  useEffect(() => {
    const handleStart = (url: string) => {
      if (url.startsWith('/admin') || url.startsWith('/rrhh') || url.startsWith('/student')) {
        setNavigating(true);
      }
    };
    const handleDone = () => setNavigating(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleDone);
    router.events.on('routeChangeError', handleDone);
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleDone);
      router.events.off('routeChangeError', handleDone);
    };
  }, [router.events]);

  // Validación de sesión/rol
  useEffect(() => {
    let cancelled = false;

    async function validate() {
      if (!isProtected) {
        if (!cancelled) setReady(true);
        return;
      }

      try {
        // 1) Student: lookup instantáneo en localStorage → 0 flash
        if (router.pathname.startsWith('/student')) {
          try {
            const raw = typeof window !== 'undefined' ? localStorage.getItem('studentSession') : null;
            const session = raw ? JSON.parse(raw) : null;
            if (session?.email) {
              if (!cancelled) setReady(true);
              return;
            }
          } catch {
            /* sigue con Cognito */
          }
        }

        // 2) Cognito (rápido: tokens en caché)
        const attrs = await fetchUserAttributes().catch(() => null);
        const email = attrs?.email;
        if (!email) {
          if (!cancelled) {
            setReady(false);
            router.replace('/');
          }
          return;
        }

        // 3) Roles para admin/rrhh
        if (router.pathname.startsWith('/admin') || router.pathname.startsWith('/rrhh')) {
          const { tokens } = await fetchAuthSession();
          const payload = (tokens?.idToken?.payload || {}) as any;
          const tokenRole =
            payload['custom:tipo'] ||
            (Array.isArray(payload['cognito:groups']) ? payload['cognito:groups'][0] : undefined);

          if (router.pathname.startsWith('/admin') && tokenRole !== 'admin') {
            if (!cancelled) router.replace('/');
            return;
          }
          if (router.pathname.startsWith('/rrhh') && tokenRole !== 'rrhh') {
            if (!cancelled) router.replace('/');
            return;
          }
        }

        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) {
          setReady(false);
          router.replace('/');
        }
      }
    }

    setReady(false); // revalida al entrar/cambiar de ruta
    validate();
    return () => { cancelled = true; };
  }, [isProtected, router.pathname, router]);

  // Mostrar loader si:
  // - ruta protegida y aún no está validada, o
  // - estamos navegando hacia una protegida
  if ((isProtected && !ready) || navigating) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Head>
        <title>Workshop M&amp;O</title>
        <meta name="description" content="Workshop M&O" />
      </Head>
      <RouteGuard>
        <Component {...pageProps} />
      </RouteGuard>
    </ThemeProvider>
  );
}

export default MyApp;
