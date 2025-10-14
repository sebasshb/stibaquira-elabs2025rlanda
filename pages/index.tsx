'use client';
import React, { useEffect, useState } from 'react';
import { signIn, signOut, fetchAuthSession } from 'aws-amplify/auth';
import '../public/styles/admin.css';
import ThemeToggle from '../src/app/context/ThemeToggle';
import { useRouter } from 'next/router';

type Role = 'student' | 'admin' | 'rrhh';

const API_AUTH_URL = 'https://s4gc7qoqd5.execute-api.us-east-1.amazonaws.com/auth'; // del script.js

const LoginPage = () => {
  const [role, setRole] = useState<Role>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🧹 Limpieza local (sin red) + prefetch
  useEffect(() => {
    signOut().catch(() => {}); // limpia storage local de Amplify sin llamar a Cognito
    router.prefetch('/student');
    router.prefetch('/admin');
  }, [router]);

  async function loginStudentViaApi(username: string, pass: string) {
    // La llamada fetch no cambia
    const res = await fetch(API_AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        data: { identifier: username, password: pass },
      }),
    });

    let data: any = {};
    try { data = await res.json(); } catch {}

    if (!res.ok) {
      if (res.status === 401) throw new Error('Credenciales incorrectas');
      throw new Error(data?.message || `Error HTTP: ${res.status}`);
    }

    // --- CAMBIO CLAVE ---
    // Guardamos la respuesta COMPLETA de la Lambda, que ahora incluye el objeto 'session'.
    localStorage.setItem('studentSession', JSON.stringify(data));
    
    // Devolvemos la respuesta completa.
    return data;
  }

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const username = email.trim().toLowerCase();

      if (role === 'student') {
        // 🔐 Estudiante: API + DynamoDB (sin Cognito)
        // La variable ahora es 'data' para reflejar que es la respuesta completa.
        const data = await loginStudentViaApi(username, password);
        
        // La validación ahora es más robusta: comprueba que existan el usuario y el sessionId.
        if (!data?.user?.email || !data?.session?.sessionId) {
          throw new Error('Respuesta de autenticación inválida');
        }
        
        router.replace('/student');
        return;
      }

      // 🔐 Admin / RRHH: Cognito
      const userData = await signIn({
        username,
        password,
        options: { authFlowType: 'USER_PASSWORD_AUTH' },
      });

      if (!userData?.isSignedIn) {
        throw new Error('No se pudo completar el inicio de sesión.');
      }

      // Leer rol desde el ID token
      const { tokens } = await fetchAuthSession();
      const payload = (tokens?.idToken?.payload || {}) as any;
      const tokenRole =
        payload['custom:tipo'] ||
        (Array.isArray(payload['cognito:groups']) ? payload['cognito:groups'][0] : undefined);

      // Enforce: si seleccionó RRHH debe tener rol rrhh; si seleccionó admin, rol admin.
      if (role === 'admin' && tokenRole !== 'admin') {
        setError('Tu cuenta no tiene rol admin');
        return;
      }
      if (role === 'rrhh' && tokenRole !== 'rrhh') {
        setError('Tu cuenta no tiene rol RRHH');
        return;
      }

      // Redirigir por rol
      if (role === 'admin') router.replace('/admin');
      else if (role === 'rrhh') router.replace('/rrhh'); // ruta futura
      else setError('Rol no reconocido');
    } catch (err: any) {
      const name = err?.name || err?.__type || 'AuthError';
      const msg =
        err?.message === 'Credenciales incorrectas' ? err.message
        : name === 'NotAuthorizedException' ? 'Credenciales incorrectas'
        : name === 'UserNotConfirmedException' ? 'Debes confirmar tu correo'
        : name === 'PasswordResetRequiredException' ? 'Debes cambiar la contraseña'
        : err?.message || 'Error desconocido';
      setError(`${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-logo" aria-label="Logo Empresa" role="img" />

      <div className="login-container">
        <ThemeToggle />
        <h2 className="login-title">Login</h2>

        {/* Selector de rol */}
        <div className="role-switch" style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`role-chip ${role === 'student' ? 'selected' : ''}`}
            aria-pressed={role === 'student'}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`role-chip ${role === 'admin' ? 'selected' : ''}`}
            aria-pressed={role === 'admin'}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setRole('rrhh')}
            className={`role-chip ${role === 'rrhh' ? 'selected' : ''}`}
            aria-pressed={role === 'rrhh'}
          >
            RRHH
          </button>
        </div>

        <div className="form-container">
          <input
            type="email"
            placeholder={role === 'student' ? 'Email' : 'Email'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />
          <input
            type="password"
            placeholder="Password"
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
            {loading ? 'Loading...' : 'Iniciar Sesión'}
          </button>
        </div>

        {error && (
          <div className="error-container">
            <p className="error-msg">{error}</p>
          </div>
        )}

        {/* Ayuda visual del rol activo */}
        <p style={{ textAlign: 'center', marginTop: 10, fontSize: 12, opacity: 0.8 }}>
          Role: <strong>{role.toUpperCase()}</strong>
        </p>
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
