'use client';
import React, { useState } from 'react';
import { signOut } from 'aws-amplify/auth';
import '../public/styles/admin.css';  

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState('inicio'); // Manejo de secciones
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/'; // Redirige a la página de inicio
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  const handleAddAnnouncement = () => {
    if (newAnnouncement.trim() !== '') {
      setAnnouncements([...announcements, newAnnouncement]);
      setNewAnnouncement('');
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1 className="admin-title">📚 Panel de Administración</h1>
        <nav className="admin-nav">
          <button onClick={() => setActiveSection('inicio')} className="nav-item">🏠 Inicio</button>
          <button onClick={() => setActiveSection('anuncios')} className="nav-item">📢 Anuncios</button>
          <button onClick={() => setActiveSection('archivos')} className="nav-item">📂 Archivos</button>
          <button onClick={handleSignOut} className="admin-logout-button">🚪 Salir</button>
        </nav>
      </header>

      <main className="admin-main">
        {activeSection === 'inicio' && (
          <div>
            <h2>🏫 Bienvenido al Panel Administrativo</h2>
            <p>Desde aquí puedes gestionar anuncios y archivos para los estudiantes.</p>
          </div>
        )}

        {activeSection === 'anuncios' && (
          <div>
            <h2>📢 Gestionar Anuncios</h2>
            <input 
              type="text" 
              placeholder="Escribe un anuncio..." 
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
              className="input-text"
            />
            <button onClick={handleAddAnnouncement} className="button-primary">Publicar</button>
            <ul className="announcement-list">
              {announcements.map((announcement, index) => (
                <li key={index} className="announcement-item">{announcement}</li>
              ))}
            </ul>
          </div>
        )}

        {activeSection === 'archivos' && (
          <div>
            <h2>📂 Subir Archivos</h2>
            <input type="file" className="input-file" />
            <button className="button-primary">Subir</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
