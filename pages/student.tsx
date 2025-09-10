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
import Head from 'next/head';
import dynamic from 'next/dynamic';
const MorrisNews = dynamic(() => import('../components/MorrisNews'), { ssr: false });
const AgentWidget = dynamic(() => import('../components/chat/AgentWidget'), { ssr: false });

const notificationSound = '/sounds/notification.mp3';

const INACTIVITY_TIMEOUT = 8 * 60 * 60 * 1000; // 8 horas

// Activará el uso del índice cuando lo creemos en AWS Console
const USE_INDEX =
  process.env.NEXT_PUBLIC_USE_ANUNCIO_INDEX === '1' ||
  process.env.NEXT_PUBLIC_USE_ANUNCIO_INDEX === 'true';

// Query del índice: byTypeCreatedAt (AppSync resolver contra GSI en DynamoDB)
const ANUNCIOS_BY_TYPE = /* GraphQL */ `
  query AnunciosByTypeCreatedAt(
    $type: String!
    $sortDirection: ModelSortDirection
    $limit: Int
  ) {
    anunciosByTypeCreatedAt(
      type: $type
      sortDirection: $sortDirection
      limit: $limit
    ) {
      items {
        id
        content
        createdAt
      }
    }
  }
`;

type AnunciosByTypeResp = {
  anunciosByTypeCreatedAt?: {
    items: (Anuncios | null)[];
  } | null;
};

const mergeSortTop5 = (prev: Anuncios[], incoming: Anuncios[]) => {
  const map = new Map<string, Anuncios>();
  for (const a of prev) map.set(a.id, a);
  for (const a of incoming) map.set(a.id, a);
  const merged = Array.from(map.values());
  merged.sort((a, b) => {
    const da = a.createdAt ? Date.parse(a.createdAt) : 0;
    const db = b.createdAt ? Date.parse(b.createdAt) : 0;
    return db - da;
  });
  return merged.slice(0, 5);
};


// Query cruda con variables para paginar y traer createdAt
const LIST_ANUNCIOS_PAGED = /* GraphQL */ `
  query ListAnuncios($limit: Int, $nextToken: String) {
    listAnuncios(limit: $limit, nextToken: $nextToken) {
      items {
        id
        content
        createdAt
      }
      nextToken
    }
  }
`;

// Parámetros de paginación
const PAGE_SIZE = 50;   // ítems por página
const MAX_PAGES = 3;    // hasta 150 ítems

// Tipos fuertes para la respuesta y variables de la query
type ListAnunciosResponse = {
  listAnuncios?: {
    items: (Anuncios | null)[];
    nextToken?: string | null;
  } | null;
};
type ListAnunciosVars = {
  limit?: number | null;
  nextToken?: string | null;
};


const LABS_DE_DATA_ENGINEER = [
  { name: 'Lab RDS',       md: '/labs/dataengineer/lab1.md', audio: '/labs/dataengineer/lab1.wav', image: '/labs/dataengineer/thumbnails/rds.png' },
  { name: 'Lab DMS',       md: '/labs/dataengineer/lab2.md', audio: '/labs/dataengineer/lab2.wav', image: '/labs/dataengineer/thumbnails/dms.png' },
  { name: 'Lab Serverless',md: '/labs/dataengineer/lab3.md', audio: '/labs/dataengineer/lab3.wav', image: '/labs/dataengineer/thumbnails/serverless.png' },
  { name: 'Lab Athena',    md: '/labs/dataengineer/lab4.md', audio: '/labs/dataengineer/lab4.wav', image: '/labs/dataengineer/thumbnails/athena.png' },
  { name: 'Lab Glue ETL',    md: '/labs/dataengineer/lab5.md', audio: '/labs/dataengineer/lab5.wav', image: '/labs/dataengineer/thumbnails/glue.png' },
];

// (Recuerda reemplazar los datos con los tuyos)
const LABS_DE_DEVOPS = [
  { name: 'Lab EKS', md: '/labs/devops/eks.md', audio: '/labs/devops/eks.mp4', image: '/labs/devops/thumbnails/eks.png' },
  { name: 'Lab ECS',  md: '/labs/devops/ecs.md', audio: '/labs/devops/lab2.wav', image: '/labs/devops/thumbnails/ecs.png' },
];

const LAB_PROFILES = [
  { key: 'dataengineer', label: 'Data Engineer', image: '/labs/dataengineer/profile.png', labs: LABS_DE_DATA_ENGINEER },
  { key: 'devops', label: 'DevOps Engineer', image: '/labs/devops/profile.png', labs: LABS_DE_DEVOPS },
];

// 🔗 Mapeo Lab → OU (desde tu plataforma antigua)
const labToOU: Record<string, string> = {
  '/labs/dataengineer/lab1.md': 'Workshop RDS DE',
  '/labs/dataengineer/lab2.md': 'Workshop Migration DE',
  '/labs/dataengineer/lab3.md': 'Workshop Serverless DE',
  '/labs/dataengineer/lab4.md': 'Workshop Athena Creation DE',
  '/labs/dataengineer/lab5.md': 'Workshop Glue DE',

  // --- NUEVO: Mapeo para los labs de DevOps ---
  '/labs/devops/eks.md': 'Workshop EKS DOP',
  '/labs/devops/lab2.md': 'Workshop ECS DOP',
};


const StudentPage = () => {
  const [ready, setReady] = useState(false); // 🔒 Gate de render

  const [ultimoAnuncio, setUltimoAnuncio] = useState<{ content: string; id: string } | null>(null);
  const [anuncios, setAnuncios] = useState<Anuncios[]>([]);
  const [loadingAnuncios, setLoadingAnuncios] = useState(false);
  const [activeSection, setActiveSection] = useState<'inicio' | 'anuncios' | 'labs' | 'novedades'>('inicio');
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

  const playBeep = () => {
    try {
      // Clona el <audio> base para permitir beeps “encadenados”
      const a = audioRef.current?.cloneNode(true) as HTMLAudioElement | null;
      if (a) {
        a.play().catch(e => console.warn('Error al reproducir beep:', e));
      }
    } catch (e) {
      console.warn('Error al clonar beep:', e);
    }
  };
  

  const [userEmail, setUserEmail] = useState<string>('');
  const [userFullName, setUserFullName] = useState<string>('');
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  const handleSignOut = useCallback(async () => {
    try {
      localStorage.removeItem('studentSession');
      await signOut().catch(() => {});
    } finally {
      router.push('/');
    }
  }, [router]);
  
  // 🔒 Verificar sesión al montar (Cognito o login API via localStorage)
  useEffect(() => {
    (async () => {
      // 1) Cognito
      try {
        const attrs = await fetchUserAttributes();
        if (attrs?.email) {
          setUserEmail(attrs.email);
  
          // Intenta obtener nombre completo desde Cognito
          const cognitoFullName =
            (attrs.name && attrs.name.trim()) ||
            ([attrs.given_name, attrs.family_name].filter(Boolean).join(' ').trim()) ||
            '';
  
          if (cognitoFullName) setUserFullName(cognitoFullName);
  
          setReady(true);
          return;
        }
      } catch {
        // puede ser sesión por API
      }
  
      // 2) Sesión por API (localStorage)
      try {
        const raw = localStorage.getItem('studentSession');
        const session = raw ? JSON.parse(raw) : null;
  
        if (session?.email) {
          setUserEmail(session.email);
  
          // Trata de leer nombre de varias formas comunes
          const sessionFullName =
            (session.fullName && session.fullName.trim()) ||
            (session.name && session.name.trim()) ||
            ([session.firstName, session.lastName].filter(Boolean).join(' ').trim()) ||
            '';
  
          if (sessionFullName) setUserFullName(sessionFullName);
  
          setReady(true);
          return;
        }
      } catch {
        // no-op
      }
  
      // 3) Sin sesión válida
      router.push('/');
    })();
  }, [router]);
  

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
    const audio = new Audio(notificationSound);
    audio.preload = 'auto';
    audio.volume = 0.3;
    audioRef.current = audio;
  
    // 🔓 Desbloquea al primer gesto del usuario
    const unlock = async () => {
      try {
        await audio.play();
        audio.pause();
        audio.currentTime = 0;
      } catch {}
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
  
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);
  

  const fetchAnuncios = React.useCallback(async () => {
    setLoadingAnuncios(true);
    const client = generateClient();
  
    try {
      // 1) Si el índice está activado (cuando lo creemos), úsalo
      if (USE_INDEX) {
        try {
          const res: { data?: AnunciosByTypeResp | null } =
            await client.graphql<GraphQLQuery<AnunciosByTypeResp>>({
              query: ANUNCIOS_BY_TYPE,
              variables: { type: 'ANUNCIO', sortDirection: 'DESC', limit: 5 },
            });
  
          const fromIndex = (res.data?.anunciosByTypeCreatedAt?.items ?? [])
            .filter((i): i is Anuncios => i !== null);
  
          if (fromIndex.length > 0) {
            setAnuncios(prev => mergeSortTop5(prev, fromIndex));
            return;
          }
        } catch (e) {
          console.warn('Índice no disponible aún; usando fallback paginado', e);
          // cae al fallback
        }
      }
  
      // 2) Fallback paginado (tu lógica actual, tipada)
      let acc: Anuncios[] = [];
      let nextToken: string | null | undefined = undefined;
      let pages = 0;
  
      type GraphQLResult<T> = { data?: T | null };
  
      do {
        const res: GraphQLResult<ListAnunciosResponse> =
          await client.graphql<GraphQLQuery<ListAnunciosResponse>>({
            query: LIST_ANUNCIOS_PAGED,
            variables: { limit: PAGE_SIZE, nextToken } as ListAnunciosVars,
          });
  
        const conn: ListAnunciosResponse['listAnuncios'] = res.data?.listAnuncios ?? null;
  
        const pageItems = (conn?.items ?? []).filter(
          (i: Anuncios | null): i is Anuncios => i !== null
        );
  
        acc = acc.concat(pageItems);
        nextToken = conn?.nextToken ?? null;
        pages += 1;
      } while (pages < MAX_PAGES && nextToken);
  
      setAnuncios(prev => mergeSortTop5(prev, acc));
    } catch (error) {
      console.error('Error al cargar anuncios:', error);
    } finally {
      setLoadingAnuncios(false);
    }
  }, []);
  

  useEffect(() => {
    if (activeSection !== 'anuncios') return;
  
    let cancelled = false;
  
    const run = async () => {
      await fetchAnuncios();                       // 1er fetch
      // pequeño backoff para cubrir lecturas eventualmente inconsistentes
      setTimeout(() => {
        if (!cancelled) fetchAnuncios();           // 2do fetch (merge + orden ya lo hace tu función)
      }, 1500);
    };
  
    run();
    return () => { cancelled = true; };
  }, [activeSection, fetchAnuncios]);
  

  useEffect(() => {
    const client = generateClient();
    const subscription = client
      .graphql<GraphQLSubscription<OnCreateAnunciosSubscription>>({
        query: subscriptions.onCreateAnuncios
      })
      .subscribe({
        next: ({ data }) => {
          const nuevo = data?.onCreateAnuncios;
          if (!nuevo) return;
  
          // Sonido + modal
          typeof playBeep === 'function'
            ? playBeep()
            : audioRef.current?.play().catch(e => console.warn('Error al reproducir sonido:', e));
  
          setUltimoAnuncio({
            id: nuevo.id,
            content: nuevo.content || 'Nuevo anuncio'
          });
  
          // Actualiza la lista en caliente (sin esperar al server)
          setAnuncios(prev => {
            const map = new Map<string, Anuncios>(prev.map(a => [a.id, a]));
            map.set(nuevo.id, {
              id: nuevo.id,
              content: nuevo.content ?? '',
              createdAt: nuevo.createdAt ?? new Date().toISOString()
            } as Anuncios);
  
            const merged = Array.from(map.values());
            merged.sort((a, b) => {
              const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return db - da;
            });
            return merged.slice(0, 5);
          });
  
          // (Opcional) Refresca del server unos segundos después para sincronizar
          // con más items que hayan entrado casi a la vez:
          setTimeout(() => {
            if (activeSection === 'anuncios') fetchAnuncios();
          }, 3000);
        },
        error: (error) => {
          console.error('Error en suscripción:', error);
        }
      });
  
    return () => subscription.unsubscribe();
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

  // Nombre a mostrar en el modal (fallback: parte del correo antes de @)
const getDisplayName = () => {
  if (userFullName && userFullName.trim()) return userFullName.trim();
  if (userEmail) return userEmail.split('@')[0];
  return 'Estudiante';
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
    if (selectedProfile && selectedLab !== null && LAB_PROFILES.some((p) => p.key === selectedProfile)) {
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
    if (selectedProfile === null || selectedLab === null) return;
  
    setStartLabStatus('loading');
    setErrorMsg('');
  
    try {
      const profile = LAB_PROFILES.find((p) => p.key === selectedProfile)!;
      const lab = profile.labs[selectedLab];
  
      // separar nombre y apellido para el payload
      const fullName = getDisplayName();
      const [nombre, ...apellidosArr] = fullName.split(' ').filter(Boolean);
      const apellido = apellidosArr.join(' ');
  
      const payload = {
        nombre: nombre || fullName || 'Estudiante',
        apellido: apellido || '',
        correo: userEmail,
        destination_ou: labToOU[lab.md] || 'Testing_Roberto'
      };
  
      const resp = await fetch('https://koezp60c46.execute-api.us-east-1.amazonaws.com/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
  
      const result = await resp.json();
      if (!resp.ok) throw new Error(result?.message || `HTTP ${resp.status}`);
  
      if (!result?.url_acceso_temporal) {
        throw new Error('No se recibió una URL de acceso válida');
      }
  
      setStartLabStatus('success');
      // abrir consola en pestaña nueva y cerrar modal
      setTimeout(() => {
        window.open(result.url_acceso_temporal, '_blank');
        setShowConfirmStart(false);
      }, 800);
    } catch (err: any) {
      setStartLabStatus('error');
      // mensajes amigables
      const msg = String(err?.message || err || 'Error al iniciar laboratorio');
      if (msg.includes('404') || /No hay cuentas disponibles/i.test(msg)) {
        setErrorMsg('❌ No hay cuentas disponibles en este momento. Intenta más tarde o elige otro laboratorio.');
      } else if (/Failed to fetch|NetworkError/i.test(msg)) {
        setErrorMsg('❌ Problema de conexión: verifica tu red o permisos CORS del endpoint.');
      } else {
        setErrorMsg(`❌ ${msg}`);
      }
    }
  };
  

  useEffect(() => {
    if (!lightboxImage) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxImage(null); };
    document.addEventListener('keydown', onKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [lightboxImage]);

  const renderLightbox = () => {
    if (!lightboxImage || typeof window === 'undefined') return null;
    return createPortal(
      <div className="image-lightbox-overlay" role="dialog" aria-modal="true" aria-label="Imagen ampliada" onClick={() => setLightboxImage(null)}>
        <img className="image-lightbox-img" src={lightboxImage.src} alt={lightboxImage.alt || 'imagen ampliada'} onClick={(e) => e.stopPropagation()} />
      </div>,
      document.body
    );
  };

  const renderConfirmAccess = () => {
    if (!showConfirmStart || typeof window === 'undefined' || selectedLab === null || !selectedProfile) return null;
  
    const profile = LAB_PROFILES.find((p) => p.key === selectedProfile)!;
    const lab = profile.labs[selectedLab];
    const displayName = getDisplayName();
    const ou = labToOU[lab.md] || 'Testing_Roberto';
  
    return createPortal(
      <div className="confirm-access-overlay" role="dialog" aria-modal="true" aria-label="Confirmar acceso al laboratorio" onClick={() => setShowConfirmStart(false)}>
        <div className="confirm-access-modal" onClick={(e) => e.stopPropagation()}>
          <button className="confirm-close-button" onClick={() => setShowConfirmStart(false)} aria-label="Cerrar">×</button>
          <h2>Confirmar Acceso al Laboratorio</h2>
  
          <p>Bienvenido <strong>{displayName}</strong> al <strong>{lab.name}</strong></p>
          <p>Ingresarás con el correo: <strong>{userEmail}</strong></p>
          <p>Entorno de trabajo: <strong>{ou}</strong></p>
  
          <button
            onClick={handleConfirmStartLab}
            disabled={startLabStatus === 'loading'}
            className="submit-btn"
            style={{ minWidth: 180, marginTop: 10 }}
          >
            {startLabStatus === 'loading' ? 'Procesando…' : 'Enviar Solicitud'}
          </button>
  
          {startLabStatus === 'success' && (
            <p className="success-msg" style={{ marginTop: 10, color: 'var(--secondary-color)' }}>
              ✅ ¡Éxito! Abriendo tu sesión temporal en AWS…
            </p>
          )}
          {errorMsg && <p className="error-msg" style={{ marginTop: 10 }}>{errorMsg}</p>}
        </div>
      </div>,
      document.body
    );
  };
  

  // ⛔️ No pintes nada hasta tener sesión verificada
  if (!ready) return null;

  return (
    <>
      <Head>
        <title>Student | Workshop M&amp;O</title>
      </Head>
      <div className="admin-container">
        <header className="admin-header">
          <div className="header-content">
            <a href="/" className="header-logo" aria-label="Morris &amp; Opazo - inicio">
              <span className="sr-only">Morris &amp; Opazo</span>
            </a>
            <h1 className="admin-title">📚 Panel del Estudiante</h1>
            <ThemeToggle />
          </div>
          <nav className="admin-nav">

            <button onClick={() => setActiveSection('inicio')} className="nav-item">🏠 Inicio</button>
            <button onClick={() => setActiveSection('novedades')} className="nav-item">📰 Novedades</button>
            <button onClick={() => setActiveSection('anuncios')} className="nav-item">📢 Anuncios</button>
            <button onClick={() => setActiveSection('labs')} className="nav-item">🧑‍💻 Laboratorios</button>
            <button onClick={handleSignOut} className="admin-logout-button">🚪 Salir</button>
          </nav>
        </header>

        <main className="admin-main">
          {activeSection === 'inicio' && (
            <>
              <div className="section-container">
                <h2>🏫 Bienvenido al Panel del Estudiante</h2>
                <p>Aquí podrás ver los anuncios y archivos compartidos por los administradores.</p>
              </div>
            </>
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
              {!selectedProfile && (
                <>
                  <h2 style={{ textAlign: 'center', marginBottom: 30, marginTop: 20 }}>Selecciona el perfil de laboratorios</h2>
                  <div className="profiles-grid">
                    {LAB_PROFILES.map((profile) => (
                      <button
                        key={profile.key}
                        className="wizard-profile-box image-card"
                        onClick={() => setSelectedProfile(profile.key)}
                        aria-label={profile.label}
                        type="button"
                      >
                        <img src={profile.image} alt={profile.label} className="profile-image" />
                        <div className="profile-caption">
                          <span className="profile-title">{profile.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selectedProfile && selectedLab === null && (
                <>
                  <button
                    onClick={() => setSelectedProfile(null)}
                    style={{ marginBottom: 0, background: 'none', border: 'none', color: 'var(--secondary-color)', cursor: 'pointer' }}
                  >
                    ← Volver a la selección de perfiles
                  </button>
                  <h3 style={{ textAlign: 'center', color: 'var(--primary-color)', marginBottom: 27, marginTop: 0, fontSize: 23 }}>
                    Elige un laboratorio
                  </h3>

                  <div className="labs-grid">
                    {LAB_PROFILES.find((p) => p.key === selectedProfile)!.labs.map((lab, idx) => (
                      <button
                        key={lab.md}
                        type="button"
                        className="lab-card"
                        onClick={() => setSelectedLab(idx)}
                        aria-label={lab.name}
                      >
                        <img src={lab.image} alt={lab.name} className="lab-card__img" />
                        <div className="lab-card__caption">
                          <span className="lab-card__title">{lab.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selectedProfile && selectedLab !== null && (
                <div>
                  <button
                    onClick={() => setSelectedLab(null)}
                    style={{ marginBottom: 10, marginTop: 0, background: 'none', border: 'none', color: 'var(--secondary-color)', cursor: 'pointer' }}
                  >
                    ← Volver a la selección de laboratorios
                  </button>

                  <div
                    className="wizard-audio-bar"
                    style={{
                      position: 'sticky', top: 16, zIndex: 10, borderRadius: 12,
                      boxShadow: '0 2px 8px var(--shadow-color)', marginBottom: 28, padding: '10px 10px',
                      display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', minHeight: 64,
                      maxWidth: 1400, marginLeft: 'auto', marginRight: 'auto',
                    }}
                  >
                    <h4 style={{ margin: '12px', marginRight: 12, color: 'var(--dark-color)', fontWeight: 600, fontSize: 16, whiteSpace: 'nowrap' }}>
                      🎧 Escucha la guía del laboratorio
                    </h4>
                    <audio
                      controls
                      src={LAB_PROFILES.find((p) => p.key === selectedProfile)!.labs[selectedLab].audio}
                      style={{ width: 800, minWidth: 120, maxWidth: 920, marginBottom: 0, padding: '20 100px', marginRight: 0, background: 'transparent' }}
                    />
                    <button
                      onClick={() => setShowConfirmStart(true)}
                      className="start-lab-btn"
                      style={{
                        padding: '8px 75px', fontSize: 15,
                        background: 'var(--start-lab-btn-gradient)',
                        color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 2px 8px var(--shadow-color)', minWidth: 120, minHeight: 40, marginLeft: 12
                      }}
                    >
                      🚀 Start Lab
                    </button>
                  </div>

                  <div className="section-container">
                    <h3 style={{ textAlign: 'left', marginBottom: 0, color: 'var(--secondary-color)', fontSize: 14 }}>
                      {LAB_PROFILES.find((p) => p.key === selectedProfile)!.labs[selectedLab].name}
                    </h3>

                    <div style={{ width: '90%', textAlign: 'justify', fontSize: 17, marginLeft: 'auto', marginRight: 'auto', overflow: 'hidden' }}>
                      <ReactMarkdown
                        components={{
                          a: ({ node, ...props }) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
                              {props.children}
                            </a>
                          ),
                          img: ({ node, ...props }) => (
                            <img
                              {...props}
                              onClick={() => {
                                if (props.src) {
                                  setLightboxImage({ src: typeof props.src === 'string' ? props.src : URL.createObjectURL(props.src), alt: props.alt ?? 'imagen' });
                                }
                              }}
                              style={{
                                maxWidth: '80%', display: 'block', margin: '40px auto', borderRadius: 12,
                                boxShadow: '0 2px 8px var(--shadow-color)', cursor: 'zoom-in',
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
            </div>
          )}
          {/* 🔄 NUEVA SECCIÓN: Novedades Morris & Opazo */}
          {activeSection === 'novedades' && (
            <div className="section-container">
              <MorrisNews />
            </div>
          )}
        </main>

        {ultimoAnuncio && (
          <div className="announcement-overlay">
            <div className="announcement-modal">
              <button onClick={handleCerrarAnuncio} className="announcement-close-button" aria-label="Cerrar anuncio">×</button>
              <h3>¡Nuevo Anuncio!</h3>
              <p className="announcement-content">{ultimoAnuncio.content}</p>
            </div>
          </div>
        )}

        {renderLightbox()}

        {renderConfirmAccess()}

        {/* Bot de soporte (Bedrock Agent) — flotante, no interfiere con el layout */}
        <AgentWidget />

      </div>
    </>
  );
};

export default StudentPage;
