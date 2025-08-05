'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

import { generateClient } from 'aws-amplify/api';
import { signOut } from 'aws-amplify/auth';
import * as subscriptions from '../src/graphql/subscriptions';
import { listUltimos5Anuncios } from '../src/graphql/queries';
import type { GraphQLSubscription, GraphQLQuery } from '@aws-amplify/api';
import type { OnCreateAnunciosSubscription, Anuncios, AnunciosConnection } from '../src/API';
import '../public/styles/admin.css';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../src/app/context/ThemeToggle';

// Sonido de notificación
const notificationSound = 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos en milisegundos

// -------- Configuración de Labs ---------
const LABS_DE_DATA_ENGINEER = [
  { name: 'Laboratorio RDS', md: '/labs/dataengineer/lab1.md', audio: '/labs/dataengineer/lab1.wav' },
  { name: 'Laboratorio DMS', md: '/labs/dataengineer/lab2.md', audio: '/labs/dataengineer/lab2.wav' },
  { name: 'Lab Serverless', md: '/labs/dataengineer/lab3.md', audio: '/labs/dataengineer/lab3.wav' },
  { name: 'Lab Athena', md: '/labs/dataengineer/lab4.md', audio: '/labs/dataengineer/lab4.wav' },
];

const LAB_PROFILES = [
  {
    key: 'dataengineer',
    label: 'Labs - Data Engineer',
    image: '/labs/dataengineer/profile.png', // Preparado para soporte futuro de imagen de perfil
    labs: LABS_DE_DATA_ENGINEER,
  },
  // Puedes añadir más perfiles aquí fácilmente
];

// --------- Main Componente --------------
const StudentPage = () => {
  // Estado anuncios y notificaciones
  const [ultimoAnuncio, setUltimoAnuncio] = useState<{ content: string; id: string } | null>(null);
  const [anuncios, setAnuncios] = useState<Anuncios[]>([]);
  const [loadingAnuncios, setLoadingAnuncios] = useState(false);

  // Estado navegación general
  const [activeSection, setActiveSection] = useState<'inicio' | 'anuncios' | 'labs'>('inicio');
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [selectedLab, setSelectedLab] = useState<number | null>(null);

  // Estado recursos labs
  const [markdown, setMarkdown] = useState<string>('');
  const [loadingMarkdown, setLoadingMarkdown] = useState(false);

  // Modal confirmación start lab
  const [showConfirmStart, setShowConfirmStart] = useState(false);
  const [startLabStatus, setStartLabStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Refs y router
  const audioRef = useRef<HTMLAudioElement>(null!);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef(Date.now());
  const router = useRouter();

  // Cerrar sesión con Amplify y router
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  }, [router]);

  // Inactividad automática
  useEffect(() => {
    const setupInactivityTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => { handleSignOut(); }, INACTIVITY_TIMEOUT);
    };
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    const resetActivity = () => {
      lastActivityRef.current = Date.now();
      setupInactivityTimer();
    };
    events.forEach(event => window.addEventListener(event, resetActivity));
    setupInactivityTimer();
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach(event => window.removeEventListener(event, resetActivity));
    };
  }, [handleSignOut]);

  // Cargar sonido notificación
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
        const items = result.data.listAnuncios.items
          .filter((item): item is Anuncios => item !== null)
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 5);
        setAnuncios(items);
      }
    } catch (error) {
      console.error('Error al cargar anuncios:', error);
    } finally {
      setLoadingAnuncios(false);
    }
  }, []);

  // Cargar anuncios cuando entras a la sección
  useEffect(() => {
    if (activeSection === 'anuncios') fetchAnuncios();
  }, [activeSection, fetchAnuncios]);

  // Suscripción a nuevos anuncios (tiempo real)
  useEffect(() => {
    const client = generateClient();
    const subscription = client
      .graphql<GraphQLSubscription<OnCreateAnunciosSubscription>>({
        query: subscriptions.onCreateAnuncios
      })
      .subscribe({
        next: ({ data }) => {
          if (data?.onCreateAnuncios) {
            audioRef.current.play().catch(e => console.warn('Error al reproducir sonido:', e));
            setUltimoAnuncio({
              id: data.onCreateAnuncios.id,
              content: data.onCreateAnuncios.content || 'Nuevo anuncio'
            });
            if (activeSection === 'anuncios') fetchAnuncios();
          }
        },
        error: (error) => {
          console.error('Error en suscripción:', error);
        }
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [activeSection, fetchAnuncios]);

  const handleCerrarAnuncio = () => setUltimoAnuncio(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Fecha desconocida';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // --- Wizard Labs: limpiar flujo al cambiar de sección
  useEffect(() => {
    setSelectedProfile(null);
    setSelectedLab(null);
    setMarkdown('');
    setLoadingMarkdown(false);
    setShowConfirmStart(false);
    setStartLabStatus('idle');
    setErrorMsg('');
  }, [activeSection]);

  // Cargar el markdown cuando seleccionas lab
  useEffect(() => {
    if (
      selectedProfile &&
      selectedLab !== null &&
      LAB_PROFILES.some((p) => p.key === selectedProfile)
    ) {
      const profile = LAB_PROFILES.find((p) => p.key === selectedProfile)!;
      const lab = profile.labs[selectedLab];
      setLoadingMarkdown(true);
      fetch(lab.md)
        .then((res) => res.text())
        .then((text) => setMarkdown(text))
        .catch(() => setMarkdown('# Error al cargar la guía de laboratorio.'))
        .finally(() => setLoadingMarkdown(false));
    }
  }, [selectedProfile, selectedLab]);

  // Lógica para llamar tu API Lambda cuando confirma iniciar lab
  const handleConfirmStartLab = async () => {
    setStartLabStatus('loading');
    setErrorMsg('');
    try {
      // TODO: Ajusta aquí la llamada a tu API/Lambda (ejemplo usando fetch)
      setTimeout(() => {
        setStartLabStatus('success');
      }, 800); // Simula éxito
    } catch (err: any) {
      setStartLabStatus('error');
      setErrorMsg(err.message || 'Error al iniciar laboratorio');
    }
  };

  // Cambios de layout para ancho completo
  // Añade una clase extra al admin-container para ancho completo
  // Opcional: Puedes mover estos estilos a tu CSS si prefieres

  return (
    <div
      className="admin-container"
      style={{
        width: '87vw',
        maxWidth: '100vw',
        minHeight: '100vh',
        margin: '10px auto',
        padding: '0 0px',
        overflowX: 'hidden',
        background: 'var(--primary-bg, #f6f6f9)',
      }}
    >
      {/* Header / Cabecera */}
      <header
        className="admin-header"
        style={{
          width: '100%',
          maxWidth: '100vw',
          margin: 0,
          padding: '0 0 0 0',
        }}
      >
        <div className="header-content"
          style={{
            width: '100%',
            maxWidth: '100vw',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '22px 2vw 16px 2vw',
          }}
        >
          <h1 className="admin-title">📚 Panel del Estudiante</h1>
          <ThemeToggle />
        </div>
        <nav
          className="admin-nav"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            width: '100%',
            padding: '0 0 14px',
          }}
        >
          <button onClick={() => setActiveSection('inicio')} className="nav-item">🏠 Inicio</button>
          <button onClick={() => setActiveSection('anuncios')} className="nav-item">📢 Anuncios</button>
          <button onClick={() => setActiveSection('labs')} className="nav-item">🧑‍💻 Laboratorios</button>
          <button onClick={handleSignOut} className="admin-logout-button">🚪 Salir</button>
        </nav>
      </header>

      {/* Main content */}
      <main
        className="admin-main"
        style={{
          width: '100vw',
          maxWidth: '100vw',
          minHeight: '80vh',
          margin: '0 0px',
          padding: '0 0',
        }}
      >
        {/* Inicio */}
        {activeSection === 'inicio' && (
          <div style={{
            width: '100%',
            padding: '0 60px',
            boxSizing: 'border-box',
            maxWidth: 1400,
            margin: '0 135px'
          }}>
            <h2>🏫 Bienvenido al Panel del Estudiante</h2>
            <p>Aquí podrás ver los anuncios y archivos compartidos por los administradores.</p>
          </div>
        )}

        {/* Anuncios */}
        {activeSection === 'anuncios' && (
          <div
            className="anuncios-container"
            style={{
              width: '86%',
              padding: '0 80px',
              boxSizing: 'border-box',
              maxWidth: 1700,
              margin: '0 10px'
            }}
          >
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

        {/* Wizard Labs */}
        {activeSection === 'labs' && (
          <div
            className="wizard-labs"
            style={{
              width: '100%',
              maxWidth: 1630,
              margin: '0 19.6px',
              padding: '10px 2vw',
              background: '#fff',
              borderRadius: 22,
              boxShadow: '0 4px 32px #0096D1',
              minHeight: 650,
              boxSizing: 'border-box',
            }}
          >
            {/* Paso 1: Selección de perfil */}
            {!selectedProfile && (
              <>
                <h2 style={{ textAlign: 'center', marginBottom: 30, marginTop: 20}}>Selecciona el perfil de laboratorios</h2>
                <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {LAB_PROFILES.map((profile) => (
                    <div key={profile.key} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      background: '#0096D1', borderRadius: 14, padding: 28, minWidth: 220,
                      cursor: 'pointer', boxShadow: '0 2px 16px #0096D1', transition: 'transform 0.15s'
                    }}
                      onClick={() => setSelectedProfile(profile.key)}
                    >
                      {/* Imagen de perfil */}
                      <div style={{
                        width: 100, height: 100, borderRadius: '50%', background: '#E6F8FF',
                        marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {profile.image
                          ? <img src={profile.image} alt={profile.label} style={{ width: 60, height: 60, borderRadius: '50%' }} />
                          : <span style={{ fontSize: 32 }}>🧑‍💻</span>
                        }
                      </div>
                      <span style={{ fontSize: 19, fontWeight: 600, color: '#fff', textAlign: 'center' }}>
                        {profile.label}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Paso 2: Selección de laboratorio */}
            {selectedProfile && selectedLab === null && (
              <>
                <button onClick={() => setSelectedProfile(null)} style={{
                  marginBottom: 0, background: 'none', border: 'none', color: '#0096D1', cursor: 'pointer'
                }}>← Volver a la selección de perfiles</button>
                <h3 style={{ textAlign: 'center', marginBottom: 27, marginTop: 0 , fontSize: 23 }}>Elige un laboratorio</h3>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {LAB_PROFILES.find((p) => p.key === selectedProfile)!.labs.map((lab, idx) => (
                    <div key={lab.md}
                      style={{
                        background: '#0096D1', borderRadius: 12, padding: 22, minWidth: 190,
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        marginBottom: 15, cursor: 'pointer', boxShadow: '0 2px 12px #0096D1'
                      }}
                      onClick={() => setSelectedLab(idx)}
                    >
                      <span style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 10 }}>{lab.name}</span>
                      <span style={{ fontSize: 32 }}>🧪</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Paso 3: Contenido del laboratorio seleccionado */}
            {selectedProfile && selectedLab !== null && (
              <div>
                <button onClick={() => setSelectedLab(null)} style={{
                  marginBottom: 10, marginTop: 0, background: 'none', border: 'none', color: '#0096D1', cursor: 'pointer'
                }}>
                  ← Volver a la selección de laboratorios
                </button>
                {/* Sticky barra superior con audio + startlab */}
                <div style={{
                  position: 'sticky',
                  top: 16,
                  zIndex: 10,
                  background: '#00366B',
                  borderRadius: 12,
                  boxShadow: '0 2px 8px #0002',
                  marginBottom: 28,
                  padding: '10px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  flexWrap: 'wrap',
                  minHeight: 64,
                  maxWidth: 1400,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}>
                  <h4 style={{
                    margin: '12px',
                    marginRight: 12,
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: 16,
                    whiteSpace: 'nowrap'
                  }}>
                    🎧 Escucha la guía del laboratorio
                  </h4>
                  <audio controls
                    src={LAB_PROFILES.find((p) => p.key === selectedProfile)!.labs[selectedLab].audio}
                    style={{
                      width: 800,
                      minWidth: 120,
                      maxWidth: 920,
                      marginBottom: 0,
                      padding: '20 100px',
                      marginRight: 0,
                      background: 'transparent',
                    }}
                  />
                  <button
                    onClick={() => setShowConfirmStart(true)}
                    className="start-lab-btn"
                    style={{
                      padding: '8px 75px',
                      fontSize: 15,
                      background: 'linear-gradient(to right,rgb(49, 131, 255),rgb(37, 95, 255))',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 9,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px #0002',
                      minWidth: 120,
                      minHeight: 40,
                      marginLeft: 12
                    }}
                  >
                    🚀 Start Lab
                  </button>
                </div>
                <div style={{
                  width: '100%',
                  maxWidth: 1500,
                  marginLeft: '14px',
                  marginRight: 'auto'
                }}>
                  <h3 style={{ marginBottom: 0, color: '#737373', fontSize: 12}}>
                    {LAB_PROFILES.find((p) => p.key === selectedProfile)!.labs[selectedLab].name}
                  </h3>
                  <div style={{ width: '102%', overflow: 'hidden' }}>
                    <ReactMarkdown
                      components={{
                        img: ({ node, ...props }) => (
                          <img
                            {...props}
                            style={{
                              maxWidth: '80%',
                              height: 'auto',
                              display: 'block',
                              margin: '12px auto',
                              borderRadius: 12,
                              boxShadow: '0 2px 8px #0002',
                            }}
                            alt={props.alt || 'imagen'}
                          />
                        ),
                      }}
                    >
                      {loadingMarkdown ? 'Cargando guía del laboratorio...' : markdown}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 4: Confirmación de inicio de laboratorio */}
            {showConfirmStart && (
              <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
              }}>
                <div style={{
                  background: '#191942', borderRadius: 16, boxShadow: '0 6px 24px #0009',
                  padding: 28, minWidth: 320, maxWidth: 380, color: '#fff', position: 'relative', textAlign: 'center'
                }}>
                  <button onClick={() => setShowConfirmStart(false)} style={{
                    position: 'absolute', top: 8, right: 16, background: 'transparent', color: '#fff', fontSize: 24, border: 'none', cursor: 'pointer'
                  }}>×</button>
                  <h2>¿Seguro que quieres iniciar este laboratorio?</h2>
                  <p>Se te asignará un entorno temporal y se te llevará a la consola de AWS (si la API responde correctamente).</p>
                  {startLabStatus === 'idle' && (
                    <button onClick={handleConfirmStartLab} style={{
                      marginTop: 18, padding: '13px 26px', fontSize: 18, borderRadius: 8,
                      background: 'linear-gradient(to right, #421e80, #8b5cf6)', color: '#fff',
                      border: 'none', fontWeight: 700, cursor: 'pointer'
                    }}>Sí, iniciar laboratorio</button>
                  )}
                  {startLabStatus === 'loading' && <p>Procesando solicitud...</p>}
                  {startLabStatus === 'success' && <p style={{ color: '#4ade80' }}>¡Laboratorio iniciado con éxito!</p>}
                  {startLabStatus === 'error' && <p style={{ color: '#fb7185' }}>Error: {errorMsg}</p>}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Overlay para anuncios en tiempo real */}
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
