'use client';
import React, { useEffect, useState } from 'react';
import { signIn, signOut, fetchAuthSession } from 'aws-amplify/auth';
import '../public/styles/admin.css';
import ThemeToggle from '../src/app/context/ThemeToggle';
import { useRouter } from 'next/router';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🧹 Limpieza local (sin red) + prefetch de rutas
  useEffect(() => {
    signOut().catch(() => {}); // limpia storage local sin contactar Cognito
    router.prefetch('/student');
    router.prefetch('/admin');
  }, [router]);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const username = email.trim().toLowerCase();

      // 🔐 Un solo flujo de auth (ajústalo al que uses en tu App Client)
      const userData = await signIn({
        username,
        password,
        options: { authFlowType: 'USER_PASSWORD_AUTH' },
      });

      if (!userData?.isSignedIn) {
        throw new Error('No se pudo completar el inicio de sesión.');
      }

      // 🎯 Toma el rol desde el ID token (sin fetchUserAttributes)
      const { tokens } = await fetchAuthSession();
      const payload = (tokens?.idToken?.payload || {}) as any;
      const userType =
        payload['custom:tipo'] ||
        (Array.isArray(payload['cognito:groups']) ? payload['cognito:groups'][0] : undefined);

      if (userType === 'admin') router.replace('/admin');
      else if (userType === 'student') router.replace('/student');
      else setError('Rol de usuario no reconocido');
    } catch (err: any) {
      const name = err?.name || err?.__type || 'AuthError';
      const msg =
        name === 'NotAuthorizedException' ? 'Credenciales incorrectas'
        : name === 'UserNotConfirmedException' ? 'Debes confirmar tu correo'
        : name === 'PasswordResetRequiredException' ? 'Debes cambiar la contraseña'
        : err?.message || 'Error desconocido';
      setError(`${msg} (${name})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-logo" aria-label="Logo Empresa" role="img" />

      <div className="login-container">
        <ThemeToggle />
        <h2 className="login-title">Iniciar Sesión</h2>

        <div className="form-container">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
          />
          <button
            onClick={handleLogin}
            className="submit-btn"
            disabled={!email || !password || loading}
          >
            {loading ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </div>

        {error && (
          <div className="error-container">
            <p className="error-msg">{error}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default LoginPage;

// 🛡️ No cache del HTML de login
export async function getServerSideProps({ res }: any) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  return { props: {} };
}
