'use client';
import React, { useState } from 'react';
import { signIn, fetchUserAttributes } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import awsExports from '../../aws-exports';

Amplify.configure(awsExports);

const LoginPage = () => {
  const [user, setUser] = useState<Partial<Record<string, string>> | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signIn({ username: email, password });
      const userData = await fetchUserAttributes();
      setUser(userData); // Ahora TypeScript lo acepta correctamente
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Contraseña" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Iniciar sesión</button>

      {user && (
        <div>
          <h3>Datos del Usuario:</h3>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
