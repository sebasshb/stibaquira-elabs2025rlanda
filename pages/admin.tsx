'use client';
import React, { useState } from 'react';
import { signOut } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import awsconfig from '../src/aws-exports'; // Asegúrate de que la ruta sea correcta
import { generateClient } from 'aws-amplify/api';
import { createAnuncios } from '../src/graphql/mutations'; // Importamos la mutación 'createAnuncios'
import '../public/styles/admin.css';
import { ToastContainer, toast } from 'react-toastify'; // Importamos ToastContainer y toast
import 'react-toastify/dist/ReactToastify.css'; // Importamos el estilo para las notificaciones

Amplify.configure(awsconfig); // Configura Amplify
const client = generateClient();

// Log para verificar la configuración de AWS
console.log("awsconfig:", awsconfig);  // Verifica la configuración que se está utilizando

// Log para verificar que la mutación está bien definida
console.log("Mutación createAnuncios:", JSON.stringify(createAnuncios, null, 2)); // Mostrar la mutación en formato JSON

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState('inicio'); // Manejo de secciones
  const [newAnnouncement, setNewAnnouncement] = useState(''); // Variable para el contenido del anuncio

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/'; // Redirige a la página de inicio
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  const handleAddAnnouncement = async () => {
    if (newAnnouncement.trim() !== '') {
      const content = newAnnouncement; // El contenido del anuncio
      const id = 3;  // ID fijo
      const createdAt = '2024-04';  // Fecha fija
  
      // Log para verificar los valores antes de enviarlos a AppSync
      console.log('Nuevo anuncio:', { content, id, createdAt });
  
      const input = {
        id: id.toString(),  // El ID debe ser string
        content: content,  // Usamos el contenido del anuncio
        createdAt: createdAt,  // Fecha de creación (en formato adecuado)
      };
  
      try {
        // Ejecutamos la mutación para crear el anuncio en AppSync
        const response = await client.graphql({
          query: createAnuncios,
          variables: { input }
        });
  
        // Log de la respuesta de la mutación
        console.log("✅ Mutación createAnuncios exitosa:", response);
        
        // Mostrar la notificación de éxito
        toast.success("¡Anuncio creado con éxito!");
        
        // Limpiar el input después de guardar
        setNewAnnouncement('');
      } catch (error: unknown) {
        // Verificar que el error sea de tipo 'Error'
        if (error instanceof Error) {
          console.error("❌ Error al conectar con AppSync:", error);
          console.error("Detalles completos del error:", error.message);
          if (error.stack) {
            console.error("Detalles de los errores:", error.stack);
          }
        } else {
          // En caso de que el error no sea una instancia de 'Error'
          console.error("❌ Error desconocido:", error);
        }
      }
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
          </div>
        )}

        {activeSection === 'archivos' && (
          <div>
            <h2>📂 Subir Archivos</h2>
            <input type="file" className="input-file" disabled />
            <button className="button-primary" disabled>Subir</button>
          </div>
        )}
      </main>

      {/* Agregar el contenedor de Toast en el fondo */}
      <ToastContainer />
    </div>
  );
};

export default AdminPage;