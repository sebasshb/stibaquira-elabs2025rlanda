'use client';
import React, { useState } from 'react';
import { signIn, fetchUserAttributes, confirmSignIn } from 'aws-amplify/auth';
import '../public/styles/admin.css';
import ThemeToggle from '../src/app/context/ThemeToggle';
import { useRouter } from 'next/router';

const LoginPage = () => {
  const [user, setUser] = useState<Partial<Record<string, string>> | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<'SIGN_IN' | 'NEW_PASSWORD_REQUIRED'>('SIGN_IN');
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      setError('');
      const username = email.trim().toLowerCase();
  
      // 1) Intento con SRP (por defecto)
      let userData = await signIn({ username, password });
  
      // 2) Si no quedó firmado, probamos USER_PASSWORD_AUTH (requiere permitirlo en el App client)
      if (!userData.isSignedIn) {
        try {
          userData = await signIn({
            username,
            password,
            options: { authFlowType: 'USER_PASSWORD_AUTH' },
          });
        } catch (e) {
          // dejamos que lo maneje el catch general
          throw e;
        }
      }
  
      // 3) Firmado OK -> ruta por rol
      if (userData.isSignedIn) {
        const attributes = await fetchUserAttributes();
        const userType = attributes['custom:tipo'];
        if (userType === 'admin') router.push('/admin');
        else if (userType === 'student') router.push('/student');
        else setError('Rol de usuario no reconocido');
        return;
      }
  
      // 4) Retos comunes (p.ej. FORCE_CHANGE_PASSWORD)
      if (userData.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setSession(userData);
        setStep('NEW_PASSWORD_REQUIRED');
        return;
      }
  
      setError('No se pudo completar el inicio de sesión.');
    } catch (err: any) {
      console.error('Error en login:', err);
      const name = err?.name || err?.__type || 'AuthError';
      const msg =
        name === 'NotAuthorizedException' ? 'Credenciales incorrectas'
        : name === 'PasswordResetRequiredException' ? 'Debes cambiar la contraseña'
        : name === 'UserNotConfirmedException' ? 'Debes confirmar tu correo'
        : name === 'UserNotFoundException' ? 'El usuario no existe'
        : err?.message || 'Error desconocido';
      setError(`${msg} (${name})`);
    }
  };
  

  const handleNewPasswordSubmit = async () => {
    try {
      if (!session) throw new Error('Sesión no disponible');
      await confirmSignIn({ challengeResponse: newPassword });
      setStep('SIGN_IN');
      setNewPassword('');
      setError('Contraseña actualizada. Inicia sesión nuevamente.');
    } catch (err: any) {
      const name = err?.name || err?.__type || 'AuthError';
      setError(
        `Error al actualizar contraseña: ${err?.message || 'desconocido'} (${name})`
      );
    }
  };

  return (
    <>
      {/* Logo afuera del contenedor */}
      <div className="login-logo" aria-label="Logo Empresa" role="img" />

      <div className="login-container">
        <ThemeToggle />
        <h2 className="login-title">Iniciar Sesión</h2>

        {step === 'SIGN_IN' ? (
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
              disabled={!email || !password}
            >
              Iniciar sesión
            </button>
          </div>
        ) : (
          <div className="form-container">
            <p className="password-message">Debes establecer una nueva contraseña</p>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              required
            />
            <button
              onClick={handleNewPasswordSubmit}
              className="submit-btn"
              disabled={!newPassword}
            >
              Cambiar contraseña
            </button>
          </div>
        )}

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
