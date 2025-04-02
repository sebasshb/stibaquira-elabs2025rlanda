'use client';
import React, { useState } from 'react';
import { signIn, fetchUserAttributes, confirmSignIn } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import awsExports from '../src/aws-exports';
import { useRouter } from 'next/router';  // Importamos useRouter

Amplify.configure(awsExports);

const LoginPage = () => {
  const [user, setUser] = useState<Partial<Record<string, string>> | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<'SIGN_IN' | 'NEW_PASSWORD_REQUIRED'>('SIGN_IN');
  const [session, setSession] = useState<any>(null);
  const router = useRouter();  // Inicializamos useRouter

  const handleLogin = async () => {
    try {
      const userData = await signIn({ username: email, password });

      console.log("Usuario autenticado correctamente:", userData);

      if (userData.isSignedIn) {
        const attributes = await fetchUserAttributes();
        console.log('Atributos del usuario:', attributes);
        setUser(attributes);
        setError('');

        // Verifica el tipo de usuario y redirige
        const userType = attributes['custom:tipo']; // Obtén el tipo de usuario
        if (userType === 'admin') {
          router.push(`/admin?email=${email}`); // Usamos router.push para redirigir
        } else if (userType === 'student') {
          router.push(`/student?email=${email}`); // Usamos router.push para redirigir
        } else {
          setError('No se encontró un rol válido para el usuario.');
        }
      } else if (userData.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        console.warn('Se requiere nueva contraseña.');
        setSession(userData);
        setStep('NEW_PASSWORD_REQUIRED');
      } else {
        console.warn('Autenticación incompleta:', userData.nextStep);
        setError('Debes completar la autenticación. Revisa tu correo o configura MFA.');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'NotAuthorizedException') {
        console.warn('Credenciales incorrectas:', err.message);
        setError('Usuario o contraseña incorrectos.');
      } else {
        console.error('Error al iniciar sesión:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido al iniciar sesión');
      }
    }
  };

  const handleNewPasswordSubmit = async () => {
    try {
      if (!session) {
        setError('No hay sesión activa.');
        return;
      }

      await confirmSignIn({ challengeResponse: newPassword });

      console.log('Contraseña cambiada con éxito. Inicia sesión nuevamente.');
      setStep('SIGN_IN');
      setNewPassword('');
      setError('Contraseña cambiada. Inicia sesión nuevamente.');
    } catch (err) {
      console.error('Error al cambiar la contraseña:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cambiar la contraseña');
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Iniciar Sesión</h2>
      {step === 'SIGN_IN' ? (
        <div className="form-container">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
          <button onClick={handleLogin} className="submit-btn">Iniciar sesión</button>
        </div>
      ) : (
        <div className="form-container">
          <p>Debes establecer una nueva contraseña</p>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input-field"
          />
          <button onClick={handleNewPasswordSubmit} className="submit-btn">Cambiar contraseña</button>
        </div>
      )}

      {error && <p className="error-msg">{error}</p>}

      {user && (
        <div className="user-info">
          <h3>Datos del Usuario:</h3>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
