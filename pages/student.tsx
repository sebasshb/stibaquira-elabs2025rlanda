'use client';
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const LABS_DE_DATA_ENGINEER = [
  { name: 'Lab 1', md: '/labs/dataengineer/lab1.md', audio: '/labs/dataengineer/lab1.wav' },
  { name: 'Lab 2', md: '/labs/dataengineer/lab2.md', audio: '/labs/dataengineer/lab2.wav' },
  { name: 'Lab 3', md: '/labs/dataengineer/lab3.md', audio: '/labs/dataengineer/lab3.wav' },
  { name: 'Lab 4', md: '/labs/dataengineer/lab4.md', audio: '/labs/dataengineer/lab4.wav' },
];

// Perfiles de labs (escalable a futuro)
const LAB_PROFILES = [
  {
    key: 'dataengineer',
    label: 'Labs - Data Engineer',
    image: '/labs/dataengineer/profile.png', // Puedes poner la ruta de imagen aquí, déjalo preparado
    labs: LABS_DE_DATA_ENGINEER,
  },
  // Añade más perfiles aquí
];

const StudentPage = () => {
  // Estado navegación general
  const [activeSection, setActiveSection] = useState<'inicio' | 'anuncios' | 'labs'>('inicio');
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [selectedLab, setSelectedLab] = useState<number | null>(null);

  // Estado de recursos de lab
  const [markdown, setMarkdown] = useState<string>('');
  const [loadingMarkdown, setLoadingMarkdown] = useState(false);

  // Modal de confirmación para Start Lab
  const [showConfirmStart, setShowConfirmStart] = useState(false);
  const [startLabStatus, setStartLabStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Cuando cambias de sección, reinicia flujo de labs
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

  // Render principal
  return (
    <div className="admin-container">
      {/* Header / Cabecera */}
      <header className="admin-header">
        <div className="header-content">
          <h1 className="admin-title">📚 Panel del Estudiante</h1>
        </div>
        <nav className="admin-nav">
          <button onClick={() => setActiveSection('inicio')} className="nav-item">🏠 Inicio</button>
          <button onClick={() => setActiveSection('anuncios')} className="nav-item">📢 Anuncios</button>
          <button onClick={() => setActiveSection('labs')} className="nav-item">🧑‍💻 Laboratorios</button>
          <button onClick={() => { window.location.href = '/'; }} className="admin-logout-button">🚪 Salir</button>
        </nav>
      </header>

      {/* Main content */}
      <main className="admin-main">
        {/* Inicio */}
        {activeSection === 'inicio' && (
          <div>
            <h2>🏫 Bienvenido al Panel del Estudiante</h2>
            <p>Aquí podrás ver los anuncios y archivos compartidos por los administradores.</p>
          </div>
        )}

        {/* Anuncios */}
        {activeSection === 'anuncios' && (
          <div>
            <h2>📢 Anuncios Recientes</h2>
            <p>Acá iría tu lógica de anuncios...</p>
          </div>
        )}

        {/* Laboratorios - Wizard */}
        {activeSection === 'labs' && (
            <div
              className="wizard-labs"
              style={{
                maxWidth: 1040, // Más ancho
                margin: '0 auto',
                padding: '24px 32px',
                background: '#fff',
                borderRadius: 18,
                boxShadow: '0 2px 16px #0001',
                minHeight: 600,
              }}
            >
            {/* Paso 1: Selección de perfil */}
            {!selectedProfile && (
              <>
                <h2 style={{ textAlign: 'center', marginBottom: 28 }}>Selecciona el perfil de laboratorios</h2>
                <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {LAB_PROFILES.map((profile) => (
                    <div key={profile.key} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      background: '#2a2157', borderRadius: 14, padding: 28, minWidth: 220,
                      cursor: 'pointer', boxShadow: '0 2px 16px #0004', transition: 'transform 0.15s'
                    }}
                      onClick={() => setSelectedProfile(profile.key)}
                    >
                      {/* Imagen de perfil (por si la añades luego) */}
                      <div style={{
                        width: 70, height: 70, borderRadius: '50%', background: '#513c9e',
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
                  marginBottom: 18, background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer'
                }}>← Volver a la selección de perfiles</button>
                <h3 style={{ textAlign: 'center', marginBottom: 24 }}>Elige un laboratorio</h3>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {LAB_PROFILES.find((p) => p.key === selectedProfile)!.labs.map((lab, idx) => (
                    <div key={lab.md}
                      style={{
                        background: '#32296a', borderRadius: 12, padding: 22, minWidth: 190,
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        marginBottom: 15, cursor: 'pointer', boxShadow: '0 2px 12px #0002'
                      }}
                      onClick={() => setSelectedLab(idx)}
                    >
                      <span style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 10 }}>{lab.name}</span>
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
                  marginBottom: 20, background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer'
                }}>
                  ← Volver a la selección de laboratorios
                </button>
                <div>
                  <h3 style={{ marginBottom: 14 }}>
                    {LAB_PROFILES.find((p) => p.key === selectedProfile)!.labs[selectedLab].name}
                  </h3>
                  {/* Audio guía */}
                  <div style={{ marginBottom: 16, background: '#23234d', padding: '12px 18px', borderRadius: 10 }}>
                    <h4 style={{ margin: 0, marginBottom: 8, color: '#ebe6ff' }}>🎧 Escucha la guía del laboratorio</h4>
                    <audio controls src={LAB_PROFILES.find((p) => p.key === selectedProfile)!.labs[selectedLab].audio} style={{ width: '100%' }} />
                  </div>
                  {/* Markdown */}
                  <div style={{ width: '100%', overflow: 'hidden' }}>
                    <ReactMarkdown
                      components={{
                        img: ({ node, ...props }) => (
                          <img
                            {...props}
                            style={{
                              maxWidth: '100%',
                              height: 'auto',
                              display: 'block',
                              margin: '20px auto',
                              borderRadius: 12,
                              boxShadow: '0 2px 8px #0002',
                            }}
                            alt={props.alt || 'imagen'}
                          />
                        ),
                        // Puedes personalizar más tags aquí
                      }}
                    >
                      {loadingMarkdown ? 'Cargando guía del laboratorio...' : markdown}
                    </ReactMarkdown>
                  </div>
                  {/* Botón Start Lab */}
                  <button
                    onClick={() => setShowConfirmStart(true)}
                    className="start-lab-btn"
                    style={{
                      width: '100%', marginTop: 24, padding: '14px 0', fontSize: 18,
                      background: 'linear-gradient(to right, #421e80, #8b5cf6)',
                      color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    🚀 Start Lab
                  </button>
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
    </div>
  );
};

export default StudentPage;
