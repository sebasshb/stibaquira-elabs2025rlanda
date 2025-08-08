'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { createPortal } from 'react-dom';

import { generateClient } from 'aws-amplify/api';
import { signOut, fetchUserAttributes } from 'aws-amplify/auth';
import * as subscriptions from '../src/graphql/subscriptions';
import { listUltimos5Anuncios } from '../src/graphql/queries';
import type { GraphQLSubscription, GraphQLQuery } from '@aws-amplify/api';
import type { OnCreateAnunciosSubscription, Anuncios, AnunciosConnection } from '../src/API';
import '../public/styles/admin.css';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../src/app/context/ThemeToggle';

const notificationSound = 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

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
    image: '/labs/dataengineer/profile.png',
    labs: LABS_DE_DATA_ENGINEER,
  },
];

const StudentPage = () => {
  const [ultimoAnuncio, setUltimoAnuncio] = useState<{ content: string; id: string } | null>(null);
  const [anuncios, setAnuncios] = useState<Anuncios[]>([]);
  const [loadingAnuncios, setLoadingAnuncios] = useState(false);
  const [activeSection, setActiveSection] = useState<'inicio' | 'anuncios' | 'labs'>('inicio');
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [selectedLab, setSelectedLab] = useState<number | null>(null);
  const [markdown, setMarkdown] = useState<string>('');
  const [loadingMarkdown, setLoadingMarkdown] = useState(false);
  const [showConfirmStart, setShowConfirmStart] = useState(false);
  const [startLabStatus, setStartLabStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null!);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef(Date.now());
  const router = useRouter();

  // 🔹 NUEVO: email del usuario autenticado (obtenido desde Cognito, no desde la URL)
  const [userEmail, setUserEmail] = useState<string>('');

  // Estado para lightbox de imágenes
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  }, [router]);

  // 🔹 NUEVO: cargar atributos del usuario (email) al montar
  useEffect(() => {
    (async () => {
      try {
        const attrs = await fetchUserAttributes();
        if (attrs?.email) setUserEmail(attrs.email);
      } catch (e) {
        console.error('No se pudieron obtener los atributos del usuario:', e);
      }
    })();
  }, []);

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

  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
    audioRef.current.volume = 0.3;
  }, []);

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

  useEffect(() => {
    if (activeSection === 'anuncios') fetchAnuncios();
  }, [activeSection, fetchAnuncios]);

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

  useEffect(() => {
    setSelectedProfile(null);
    setSelectedLab(null);
    setMarkdown('');
    setLoadingMarkdown(false);
    setShowConfirmStart(false);
    setStartLabStatus('idle');
    setErrorMsg('');
  }, [activeSection]);

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

  const handleConfirmStartLab = async () => {
    setStartLabStatus('loading');
    setErrorMsg('');
    try {
      setTimeout(() => {
        setStartLabStatus('success');
      }, 800);
    } catch (err: any) {
      setStartLabStatus('error');
      setErrorMsg(err.message || 'Error al iniciar laboratorio');
    }
  };

  // Manejo de tecla Esc y bloqueo de scroll cuando el lightbox está abierto
  useEffect(() => {
    if (!lightboxImage) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxImage(null);
    };
    document.addEventListener('keydown', onKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [lightboxImage]);

  // Render del overlay con Portal para ocupar toda la pantalla real
  const renderLightbox = () => {
    if (!lightboxImage || typeof window === 'undefined') return null;
    return createPortal(
      <div
        className="image-lightbox-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Imagen ampliada"
        onClick={() => setLightboxImage(null)}
      >
        <img
          className="image-lightbox-img"
          src={lightboxImage.src}
          alt={lightboxImage.alt || 'imagen ampliada'}
          onClick={(e) => e.stopPropagation()}
        />
      </div>,
      document.body
    );
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-content">
          <h1 className="admin-title">📚 Panel del Estudiante</h1>
          <ThemeToggle />
        </div>
        <nav className="admin-nav">
          <button onClick={() => setActiveSection('inicio')} className="nav-item">🏠 Inicio</button>
          <button onClick={() => setActiveSection('anuncios')} className="nav-item">📢 Anuncios</button>
          <button onClick={() => setActiveSection('labs')} className="nav-item">🧑‍💻 Laboratorios</button>
          <button onClick={handleSignOut} className="admin-logout-button">🚪 Salir</button>
        </nav>
      </header>

      <main className="admin-main">
        {activeSection === 'inicio' && (
          <div className="section-container">
            <h2>🏫 Bienvenido al Panel del Estudiante</h2>
            <p>Aquí podrás ver los anuncios y archivos compartidos por los administradores.</p>
            {/* Si lo necesitas para debugging:
            {userEmail && <p>Sesión: {userEmail}</p>} */}
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

        {activeSection === 'labs' && (
          <div className="wizard-labs">
            {/* Paso 1: Selección de perfil */}
            {!selectedProfile && (
              <>
                <h2 style={{ textAlign: 'center', marginBottom: 30, marginTop: 20 }}>Selecciona el perfil de laboratorios</h2>
                <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {LAB_PROFILES.map((profile) => (
                    <div
                      key={profile.key}
                      className="wizard-profile-box"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: 14,
                        padding: 28,
                        minWidth: 220,
                        cursor: 'pointer',
                        boxShadow: '0 2px 16px var(--shadow-color)',
                        transition: 'transform 0.15s'
                      }}
                      onClick={() => setSelectedProfile(profile.key)}
                    >
                      {/* Imagen de perfil */}
                      <div style={{
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: 'var(--light-color)',
                        marginBottom: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {profile.image
                          ? <img src={profile.image} alt={profile.label} style={{ width: 60, height: 60, borderRadius: '50%' }} />
                          : <span style={{ fontSize: 32 }}>🧑‍💻</span>
                        }
                      </div>
                      <span style={{ fontSize: 19, fontWeight: 600, color: 'var(--dark-color)', textAlign: 'center' }}>
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
                  marginBottom: 0,
                  background: 'none',
                  border: 'none',
                  color: 'var(--secondary-color)',
                  cursor: 'pointer'
                }}>← Volver a la selección de perfiles</button>
                <h3 style={{ textAlign: 'center', color: 'var(--primary-color)', marginBottom: 27, marginTop: 0, fontSize: 23 }}>Elige un laboratorio</h3>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {LAB_PROFILES.find((p) => p.key === selectedProfile)!.labs.map((lab, idx) => (
                    <div
                      key={lab.md}
                      className="wizard-lab-box"
                      style={{
                        borderRadius: 12,
                        padding: 22,
                        minWidth: 190,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginBottom: 15,
                        cursor: 'pointer',
                        boxShadow: '0 2px 12px var(--shadow-color)'
                      }}
                      onClick={() => setSelectedLab(idx)}
                    >
                      <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--dark-color)', marginBottom: 10 }}>{lab.name}</span>
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
                  marginBottom: 10, marginTop: 0, background: 'none', border: 'none', color: 'var(--secondary-color)', cursor: 'pointer'
                }}>
                  ← Volver a la selección de laboratorios
                </button>
                {/* Sticky barra superior con audio + startlab */}
                <div
                  className="wizard-audio-bar"
                  style={{
                    position: 'sticky',
                    top: 16,
                    zIndex: 10,
                    borderRadius: 12,
                    boxShadow: '0 2px 8px var(--shadow-color)',
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
                    color: 'var(--dark-color)',
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
                      background: 'linear-gradient(to right, var(--secondary-color), var(--primary-color))',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 9,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px var(--shadow-color)',
                      minWidth: 120,
                      minHeight: 40,
                      marginLeft: 12
                    }}
                  >
                    🚀 Start Lab
                  </button>
                </div>
                <div className="section-container">
                  <h3 style={{ marginBottom: 0, color: 'var(--secondary-color)', fontSize: 14 }}>
                    {LAB_PROFILES.find((p) => p.key === selectedProfile)!.labs[selectedLab].name}
                  </h3>
                  <div style={{ width: '90%', textAlign: 'justify', fontSize: 17, marginLeft: 'auto', marginRight: 'auto', overflow: 'hidden' }}>
                    <ReactMarkdown
                      components={{
                        // Imágenes clicables para abrir lightbox
                        img: ({ node, ...props }) => (
                          <img
                            {...props}
                            onClick={() => {
                              if (props.src) {
                                setLightboxImage({ src: typeof props.src === 'string' ? props.src : URL.createObjectURL(props.src), alt: props.alt ?? 'imagen' });
                              }
                            }}
                            style={{
                              maxWidth: '70%',
                              display: 'block',
                              margin: '40px auto',
                              borderRadius: 12,
                              boxShadow: '0 2px 8px var(--shadow-color)',
                              cursor: 'zoom-in',
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
                  background: 'var(--primary-color)',
                  borderRadius: 16,
                  boxShadow: '0 6px 24px var(--shadow-color)',
                  padding: 28,
                  minWidth: 320,
                  maxWidth: 380,
                  color: '#fff',
                  position: 'relative',
                  textAlign: 'center'
                }}>
                  <button onClick={() => setShowConfirmStart(false)} style={{
                    position: 'absolute', top: 8, right: 16, background: 'transparent', color: '#fff', fontSize: 24, border: 'none', cursor: 'pointer'
                  }}>×</button>
                  <h2>¿Seguro que quieres iniciar este laboratorio?</h2>
                  <p>Se te asignará un entorno temporal y se te llevará a la consola de AWS (si la API responde correctamente).</p>
                  {startLabStatus === 'idle' && (
                    <button onClick={handleConfirmStartLab} style={{
                      marginTop: 18, padding: '13px 26px', fontSize: 18, borderRadius: 8,
                      background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))', color: '#fff',
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

      {/* Lightbox con Portal montado en <body> */}
      {renderLightbox()}
    </div>
  );
};

export default StudentPage;
