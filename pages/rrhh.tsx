'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { signOut, fetchUserAttributes } from 'aws-amplify/auth';
import '../public/styles/admin.css';        // Base global
import '../components/rrhh.css';    // Estilos específicos para esta página
import { useRouter } from 'next/navigation';
import ThemeToggle from '../src/app/context/ThemeToggle';
import Generaciones from '../components/Generaciones';
import Capacitaciones from '../components/Capacitaciones';
import Reportes from '../components/Reportes';
import DashboardGen from '../components/DashboardGen';
import DashboardCapacitaciones from '../components/DashboardCapacitaciones';
import DashboardWorkshop from '../components/DashboardWorkshop';
import Head from 'next/head';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos

const rrhhPage = () => {
  const [activeSection, setActiveSection] = useState<'inicio' | 'dashboard' | 'modulos'>('inicio');
  const [activeModulo, setActiveModulo] = useState<'generaciones' | 'capacitaciones' | 'reportes' | null>(null);
  const [showModulosDropdown, setShowModulosDropdown] = useState(false);

  const [showDashboardsDropdown, setShowDashboardsDropdown] = useState(false);
  const [dashboardModulo, setDashboardModulo] = useState<'generaciones' | 'capacitaciones' | 'workshop' | ''>('');

  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef(Date.now());
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  


  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  }, [router]);

  useEffect(() => {
    (async () => {
      try {
        const attrs = await fetchUserAttributes();
        if (!attrs?.email) {
          router.push('/');
          return;
        }
        setUserEmail(attrs.email);
      } catch {
        router.push('/');
      }
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

  const handleSetSection = (section: 'inicio' | 'dashboard' | 'modulos') => {
    setActiveSection(section);
    setShowModulosDropdown(false);
    setShowDashboardsDropdown(false);

    if (section !== 'modulos') setActiveModulo(null);
    if (section !== 'dashboard') setDashboardModulo('');
  };

  const toggleModulosDropdown = () => {
    setShowModulosDropdown(!showModulosDropdown);
    setActiveSection('modulos');
    setShowDashboardsDropdown(false);
    if (!showModulosDropdown) setActiveModulo(null);
  };

  const toggleDashboardsDropdown = () => {
    setShowDashboardsDropdown(!showDashboardsDropdown);
    setActiveSection('dashboard');
    setShowModulosDropdown(false);
    if (!showDashboardsDropdown) setDashboardModulo('');
  };

  const handleSelectModulo = (modulo: 'generaciones' | 'capacitaciones' | 'reportes') => {
    setActiveModulo(modulo);
    setShowModulosDropdown(false);
  };

  const handleSelectDashboardModulo = (modulo: 'generaciones' | 'capacitaciones' | 'workshop') => {
    setDashboardModulo(modulo);
    setShowDashboardsDropdown(false);
  };

  return (
    <>
      <Head>
        <title>Student | Workshop M&amp;O</title>
      </Head>
    <div className="admin-container">
      <header className="admin-header">
        <div
          className="header-content"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '22px 2vw 16px 2vw' }}
        >
          <h1 className="admin-title">Panel Recursos Humanos</h1>
          <ThemeToggle />
        </div>
        <nav className="admin-nav" style={{ gap: 12, color: 'white' }}>
          <button
            onClick={() => handleSetSection('inicio')}
            className="nav-item"
            style={{ fontWeight: activeSection === 'inicio' ? 'bold' : 'normal' }}
          >
            🏠 Inicio
          </button>

          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              onClick={toggleDashboardsDropdown}
              className="nav-item"
              style={{ fontWeight: activeSection === 'dashboard' ? 'bold' : 'normal' }}
              aria-haspopup="true"
              aria-expanded={showDashboardsDropdown}
            >
              📊 Dashboards ▼
            </button>
            {showDashboardsDropdown && (
              <ul
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  backgroundColor: 'white',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  borderRadius: 4,
                  padding: '8px 0',
                  margin: 0,
                  listStyle: 'none',
                  minWidth: 200,
                  zIndex: 1000,
                }}
              >
                <li>
                  <button
                    onClick={() => handleSelectDashboardModulo('generaciones')}
                    className="dropdown-item"
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      textAlign: 'left',
                      background: dashboardModulo === 'generaciones' ? '#eee' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Generaciones re/Start
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSelectDashboardModulo('capacitaciones')}
                    className="dropdown-item"
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      textAlign: 'left',
                      background: dashboardModulo === 'capacitaciones' ? '#eee' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Capacitaciones externas
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSelectDashboardModulo('workshop')}
                    className="dropdown-item"
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      textAlign: 'left',
                      background: dashboardModulo === 'workshop' ? '#eee' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Workshop
                  </button>
                </li>
              </ul>
            )}
          </div>

          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              onClick={toggleModulosDropdown}
              className="nav-item"
              style={{ fontWeight: activeSection === 'modulos' ? 'bold' : 'normal' }}
              aria-haspopup="true"
              aria-expanded={showModulosDropdown}
            >
              📂 Tablas ▼
            </button>
            {showModulosDropdown && (
              <ul
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  backgroundColor: 'white',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  borderRadius: 4,
                  padding: '8px 0',
                  margin: 0,
                  listStyle: 'none',
                  minWidth: 180,
                  zIndex: 1000,
                }}
              >
                <li>
                  <button
                    onClick={() => handleSelectModulo('generaciones')}
                    className="dropdown-item"
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      textAlign: 'left',
                      background: activeModulo === 'generaciones' ? '#eee' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Generaciones re/Start
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSelectModulo('capacitaciones')}
                    className="dropdown-item"
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      textAlign: 'left',
                      background: activeModulo === 'capacitaciones' ? '#eee' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Capacitaciones externas
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSelectModulo('reportes')}
                    className="dropdown-item"
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      textAlign: 'left',
                      background: activeModulo === 'reportes' ? '#eee' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Exportar datos (CSV)
                  </button>
                </li>
              </ul>
            )}
          </div>
          <button onClick={handleSignOut} className="admin-logout-button">
            🚪 Salir
          </button>
        </nav>
      </header>

      <main className="admin-main">
        {activeSection === 'inicio' && (
          <div className="section-container content-wrapper">
            <h2>🏫 Bienvenido al Panel de RRHH</h2>
            <p> Aquí podrás ver información y datos sobre los participantes</p>
          </div>
        )}

        {activeSection === 'dashboard' && (
          <div className="section-container content-wrapper">
            {dashboardModulo === '' && <p>Por favor, selecciona un módulo en Dashboards.</p>}
            {dashboardModulo === 'generaciones' && <DashboardGen />}
            {dashboardModulo === 'capacitaciones' && <DashboardCapacitaciones />}
            {dashboardModulo === 'workshop' && <DashboardWorkshop />}
          </div>
        )}

        {activeSection === 'modulos' && (
          <div className="section-container content-wrapper">
            {!activeModulo && (
              <>
                <h2>📂 Selecciona un módulo</h2>
                <p>Por favor, selecciona un módulo desde el menú desplegable para ver su contenido.</p>
              </>
            )}

            {activeModulo === 'generaciones' && <Generaciones />}
            {activeModulo === 'capacitaciones' && <Capacitaciones />}
            {activeModulo === 'reportes' && <Reportes />}
          </div>
        )}
      </main>
    </div>
    </>
  );
};

export default rrhhPage;
