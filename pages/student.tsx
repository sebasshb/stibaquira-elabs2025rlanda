'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { generateClient } from 'aws-amplify/api';
import { signOut } from 'aws-amplify/auth';
import * as subscriptions from '../src/graphql/subscriptions';
import type { GraphQLSubscription } from '@aws-amplify/api';
import type { OnCreateAnunciosSubscription } from '../src/API';
import '../public/styles/admin.css';
import { useRouter } from 'next/navigation';

// Sonido de notificación
const notificationSound = 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos en milisegundos

const StudentPage = () => {
  const [ultimoAnuncio, setUltimoAnuncio] = useState<{
    content: string;
    id: string;
  } | null>(null);
  const [activeSection, setActiveSection] = useState('inicio');
  const audioRef = useRef<HTMLAudioElement>(null!);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef(Date.now()); // Cambiado a useRef
  const router = useRouter();

  // handleSignOut con useCallback
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  }, [router]);

  // Configurar temporizador de inactividad
  useEffect(() => {
    const setupInactivityTimer = () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      inactivityTimer.current = setTimeout(() => {
        handleSignOut();
      }, INACTIVITY_TIMEOUT);
    };

    // Eventos que resetearán el temporizador
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    const resetActivity = () => {
      lastActivityRef.current = Date.now(); // Usamos la ref en lugar del state
      setupInactivityTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, resetActivity);
    });

    // Iniciar el temporizador
    setupInactivityTimer();

    // Limpieza al desmontar
    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetActivity);
      });
    };
  }, [handleSignOut]); // Añadida handleSignOut como dependencia

  // Cargar el sonido
  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
    audioRef.current.volume = 0.3;
  }, []);

  // Suscripción a anuncios
  useEffect(() => {
    const client = generateClient();
    
    console.log('Iniciando suscripción a anuncios...');

    const subscription = client
      .graphql<GraphQLSubscription<OnCreateAnunciosSubscription>>({ 
        query: subscriptions.onCreateAnuncios
      })
      .subscribe({
        next: ({ data }) => {
          if (data?.onCreateAnuncios) {
            console.log('Nuevo anuncio recibido:', data.onCreateAnuncios);
            
            // Reproducir sonido
            audioRef.current.play().catch(e => console.warn('Error al reproducir sonido:', e));

            // Mostrar el anuncio
            setUltimoAnuncio({
              id: data.onCreateAnuncios.id,
              content: data.onCreateAnuncios.content || 'Nuevo anuncio'
            });
          }
        },
        error: (error) => {
          console.error('Error en suscripción:', error);
        }
      });

    return () => {
      console.log('Deteniendo suscripción...');
      subscription.unsubscribe();
    };
  }, []);

  const handleCerrarAnuncio = () => {
    setUltimoAnuncio(null);
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1 className="admin-title">📚 Panel del Estudiante</h1>
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
            <h2>🏫 Bienvenido al Panel del Estudiante</h2>
            <p>Aquí podrás ver los anuncios y archivos compartidos por los administradores.</p>
          </div>
        )}

        {activeSection === 'anuncios' && (
          <div>
            <h2>📢 Anuncios Recientes</h2>
            <p>Los anuncios aparecerán aquí cuando sean publicados.</p>
          </div>
        )}

        {activeSection === 'archivos' && (
          <div>
            <h2>📂 Archivos Compartidos</h2>
            <p>Aquí aparecerán los archivos compartidos por los administradores.</p>
          </div>
        )}
      </main>

      {/* Anuncio flotante - ahora es el único sistema de notificación */}
      {ultimoAnuncio && (
        <div className="announcement-overlay">
          <div className="announcement-modal">
            <button 
              onClick={handleCerrarAnuncio}
              className="announcement-close-button"
              aria-label="Cerrar anuncio"
            >
              ×
            </button>
            <h3>¡Nuevo Anuncio!</h3>
            <p className="announcement-content">
              {ultimoAnuncio.content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPage;