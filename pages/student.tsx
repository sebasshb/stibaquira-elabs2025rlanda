'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { generateClient } from 'aws-amplify/api';
import { signOut } from 'aws-amplify/auth';
import * as subscriptions from '../src/graphql/subscriptions';
import { listUltimos5Anuncios } from '../src/graphql/queries';
import type { GraphQLSubscription, GraphQLQuery } from '@aws-amplify/api';
import type { OnCreateAnunciosSubscription, Anuncios, AnunciosConnection } from '../src/API';
import '../public/styles/admin.css';
import { useRouter } from 'next/navigation';

// Sonido de notificación
const notificationSound = 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos en milisegundos

interface Anuncio {
  id: string;
  content: string | null;
  createdAt: string | null;
}

const StudentPage = () => {
  const [ultimoAnuncio, setUltimoAnuncio] = useState<{
    content: string;
    id: string;
  } | null>(null);
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [activeSection, setActiveSection] = useState('inicio');
  const [loadingAnuncios, setLoadingAnuncios] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null!);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef(Date.now());
  const router = useRouter();

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

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    const resetActivity = () => {
      lastActivityRef.current = Date.now();
      setupInactivityTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, resetActivity);
    });

    setupInactivityTimer();

    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetActivity);
      });
    };
  }, [handleSignOut]);

  // Cargar el sonido
  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
    audioRef.current.volume = 0.3;
  }, []);

  // Cargar anuncios iniciales
  const fetchAnuncios = useCallback(async () => {
    try {
      setLoadingAnuncios(true);
      const client = generateClient();
      const result = await client.graphql<GraphQLQuery<{ listAnuncios: AnunciosConnection }>>({
        query: listUltimos5Anuncios
      });
      
      if (result.data?.listAnuncios?.items) {
        const items = result.data.listAnuncios.items.filter((item): item is Anuncios => item !== null);
        setAnuncios(items);
      }
    } catch (error) {
      console.error('Error al cargar anuncios:', error);
    } finally {
      setLoadingAnuncios(false);
    }
  }, []);

  // Cargar anuncios cuando se entra a la sección
  useEffect(() => {
    if (activeSection === 'anuncios') {
      fetchAnuncios();
    }
  }, [activeSection, fetchAnuncios]);

  // Suscripción a nuevos anuncios
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
            
            audioRef.current.play().catch(e => console.warn('Error al reproducir sonido:', e));

            setUltimoAnuncio({
              id: data.onCreateAnuncios.id,
              content: data.onCreateAnuncios.content || 'Nuevo anuncio'
            });

            // Actualizar la lista de anuncios si estamos en esa sección
            if (activeSection === 'anuncios') {
              fetchAnuncios();
            }
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
  }, [activeSection, fetchAnuncios]);

  const handleCerrarAnuncio = () => {
    setUltimoAnuncio(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Fecha desconocida';
    
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1 className="admin-title">📚 Panel del Estudiante</h1>
        <nav className="admin-nav">
          <button onClick={() => setActiveSection('inicio')} className="nav-item">🏠 Inicio</button>
          <button onClick={() => setActiveSection('anuncios')} className="nav-item">📢 Anuncios</button>
          <button onClick={() => setActiveSection('lab1')} className="nav-item">🧪 Lab1</button>
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
          <div className="anuncios-container">
            <h2>📢 Anuncios Recientes</h2>
            
            {loadingAnuncios ? (
              <p>Cargando anuncios...</p>
            ) : anuncios.length === 0 ? (
              <p>No hay anuncios recientes.</p>
            ) : (
              <ul className="anuncios-list">
                {anuncios.map((anuncio) => (
                  <li key={anuncio.id} className="anuncio-item">
                    <div className="anuncio-content">
                      {anuncio.content || 'Anuncio sin contenido'}
                    </div>
                    <div className="anuncio-date">
                      {formatDate(anuncio.createdAt)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeSection === 'lab1' && (
          <div className="pdf-viewer-container">
            <h2>🧪 Laboratorio 1</h2>
            <div className="pdf-actions">
              <a 
                href="https://d-9067c9ba63.awsapps.com/start/#/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="external-link-button"
              >
                🔗 Acceso a AWS SSO
              </a>
            </div>
            
            <div className="pdf-embed-container">
              <div style={{ 
                position: 'relative', 
                width: '100%', 
                height: 0, 
                paddingTop: '56.2500%',
                paddingBottom: 0, 
                boxShadow: '0 2px 8px 0 rgba(63,69,81,0.16)', 
                marginTop: '1.6em', 
                marginBottom: '0.9em', 
                overflow: 'hidden',
                borderRadius: '8px', 
                willChange: 'transform'
              }}>
                <iframe 
                  loading="lazy" 
                  style={{ 
                    position: 'absolute', 
                    width: '100%', 
                    height: '100%', 
                    top: 0, 
                    left: 0, 
                    border: 'none', 
                    padding: 0,
                    margin: 0 
                  }}
                  src="https://www.canva.com/design/DAGkK7P_NtI/wZywW3PyxrVWwHLXWeXtLw/view?embed" 
                  allowFullScreen
                >
                </iframe>
              </div>
            </div>
          </div>
        )}
      </main>

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