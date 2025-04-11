'use client';
import React, { useState, useEffect } from 'react';
import { signOut } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import awsconfig from '../src/aws-exports';
import { generateClient } from 'aws-amplify/api';
import { createAnuncios } from '../src/graphql/mutations';
import '../public/styles/admin.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminPage = () => {
  // Estados
  const [activeSection, setActiveSection] = useState('inicio');
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [client, setClient] = useState<any>(null);
  const [isClientReady, setIsClientReady] = useState(false);
  
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Inicialización segura de Amplify
  useEffect(() => {
    Amplify.configure(awsconfig);
    setClient(generateClient());
    setIsClientReady(true);
  }, []);

  // Handlers
  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      toast.error('Error al cerrar sesión');
    }
  };

  const handleAddAnnouncement = async () => {
    if (!isClientReady) {
      toast.warn('El sistema no está completamente listo. Intente nuevamente en unos segundos.');
      return;
    }

    if (!newAnnouncement.trim()) {
      toast.warn('Escribe un anuncio antes de publicar');
      return;
    }

    const now = new Date();
    const input = {
      id: `${now.toLocaleDateString('es-PE')} ${now.toTimeString().slice(0, 5)}`,
      content: newAnnouncement,
      createdAt: now.toISOString().split('T')[0],
    };

    try {
      await client.graphql({
        query: createAnuncios,
        variables: { input }
      });
      
      toast.success("¡Anuncio publicado con éxito!");
      setNewAnnouncement('');
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Error al publicar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleCreateUser = async () => {
    // Validaciones
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      toast.warn('Completa todos los campos');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      toast.warn('Ingresa un email válido');
      return;
    }

    setIsCreatingUser(true);
    
    try {
      const response = await fetch('https://l04dgc4a87.execute-api.us-east-1.amazonaws.com/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: newUser.firstName,
          last_name: newUser.lastName,
          email: newUser.email
        })
      });

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      const data = await response.json();
      toast.success(`Usuario creado: ${data.identity_center.username}`);
      setNewUser({ firstName: '', lastName: '', email: '' });
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear usuario');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Render
  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1 className="admin-title">📚 Panel de Administración</h1>
        <nav className="admin-nav">
          <button onClick={() => setActiveSection('inicio')} className="nav-item">🏠 Inicio</button>
          <button onClick={() => setActiveSection('anuncios')} className="nav-item">📢 Anuncios</button>
          <button onClick={() => setActiveSection('archivos')} className="nav-item">📂 Archivos</button>
          <button onClick={() => setActiveSection('usuarios')} className="nav-item">👥 Usuarios</button>
          <button onClick={handleSignOut} className="admin-logout-button">🚪 Salir</button>
        </nav>
      </header>

      <main className="admin-main">
        {activeSection === 'inicio' && (
          <div className="section-container">
            <h2>🏫 Bienvenido al Panel Administrativo</h2>
            <p>Gestiona anuncios, archivos y usuarios desde este panel.</p>
          </div>
        )}

        {activeSection === 'anuncios' && (
          <div className="section-container">
            <h2>📢 Gestionar Anuncios</h2>
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Escribe tu anuncio aquí..." 
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                className="input-text"
              />
              <button 
                onClick={handleAddAnnouncement} 
                className="button-primary"
                disabled={!isClientReady || !newAnnouncement.trim()}
              >
                {isClientReady ? 'Publicar' : 'Cargando...'}
              </button>
            </div>
          </div>
        )}

        {activeSection === 'archivos' && (
          <div className="section-container">
            <h2>📂 Subir Archivos</h2>
            <div className="form-group">
              <input type="file" className="input-file" disabled />
              <button className="button-primary" disabled>Subir</button>
            </div>
          </div>
        )}

        {activeSection === 'usuarios' && (
          <div className="section-container">
            <h2>👥 Crear Nuevo Usuario</h2>
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                value={newUser.firstName}
                onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                className="input-text"
                placeholder="Ej: Juan"
              />
            </div>
            <div className="form-group">
              <label>Apellido:</label>
              <input
                type="text"
                value={newUser.lastName}
                onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                className="input-text"
                placeholder="Ej: Pérez"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="input-text"
                placeholder="Ej: usuario@dominio.com"
              />
            </div>
            <button 
              onClick={handleCreateUser} 
              className="button-primary"
              disabled={isCreatingUser}
            >
              {isCreatingUser ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        )}
      </main>

      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default AdminPage;