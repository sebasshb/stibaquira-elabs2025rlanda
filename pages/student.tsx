'use client';
import React, { useState } from 'react';
import { signOut } from 'aws-amplify/auth';
import '../public/styles/admin.css';  // Reutilizamos el diseño de admin.css

const StudentPage = () => {
  const [activeSection, setActiveSection] = useState('inicio');

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  // Simulación de anuncios y archivos compartidos (esto se puede conectar a una base de datos)
  const announcements = [
    '📢 Examen de Matemáticas el próximo lunes.',
    '📢 Nueva guía de estudio disponible en la sección de archivos.',
  ];
  
  const sharedFiles = [
    { name: 'Guía de Álgebra.pdf', url: '#' },
    { name: 'Ejercicios de Física.docx', url: '#' },
  ];

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1 className="admin-title">🎓 Panel del Estudiante</h1>
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
            <h2>📖 Bienvenido al Panel de Estudiantes</h2>
            <p>Aquí puedes ver los anuncios y archivos compartidos por el administrador.</p>
          </div>
        )}

        {activeSection === 'anuncios' && (
          <div>
            <h2>📢 Anuncios</h2>
            <ul className="announcement-list">
              {announcements.map((announcement, index) => (
                <li key={index} className="announcement-item">{announcement}</li>
              ))}
            </ul>
          </div>
        )}

        {activeSection === 'archivos' && (
          <div>
            <h2>📂 Archivos Compartidos</h2>
            <ul className="announcement-list">
              {sharedFiles.map((file, index) => (
                <li key={index} className="announcement-item">
                  <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentPage;
