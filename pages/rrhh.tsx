'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { signOut, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import '../public/styles/admin.css';
import '../components/rrhh.css';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../src/app/context/ThemeToggle';
import Generaciones from '../components/Generaciones';
import Capacitaciones from '../components/Capacitaciones';
import Reportes from '../components/Reportes';
import DashboardGen from '../components/DashboardGen';
import DashboardCapacitaciones from '../components/DashboardCapacitaciones';
import DashboardWorkshop from '../components/DashboardWorkshop';
import CostosTabla from '../components/CostosTabla';
import CostosGrafico from '../components/CostosGrafico'
import Head from 'next/head';
import dynamic from 'next/dynamic'; // <-- Añadir dynamic

// Importa el AgentWidget de forma dinámica para evitar problemas de render en servidor (SSR)
const AgentWidget = dynamic(() => import('../components/chat/AgentWidget'), { ssr: false });

const INACTIVITY_TIMEOUT = 8 * 60 * 60 * 1000;  // 8 Horas

const rrhhPage = () => {
  const [ready, setReady] = useState(false); // 🔒 Gate de render

  const [activeSection, setActiveSection] = useState<'inicio' | 'dashboard' | 'modulos' | 'costos'>('inicio');
  const [activeModulo, setActiveModulo] = useState<'generaciones' | 'capacitaciones' | 'reportes' | null>(null);
  const [showModulosDropdown, setShowModulosDropdown] = useState(false);

  const [showDashboardsDropdown, setShowDashboardsDropdown] = useState(false);
  const [dashboardModulo, setDashboardModulo] = useState<'generaciones' | 'capacitaciones' | 'workshop' | ''>('');

  const [showCostosDropdown, setShowCostosDropdown] = useState(false);
  const [costosModulo, setCostosModulo] = useState<'tabla' | 'grafico' | null>(null);

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
        setReady(true); // ✅ sesión válida
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

  const handleSetSection = (section: 'inicio' | 'dashboard' | 'modulos' | 'costos') => {
    setActiveSection(section);
    setShowModulosDropdown(false);
    setShowDashboardsDropdown(false);
    setShowCostosDropdown(false);

    if (section !== 'modulos') setActiveModulo(null);
    if (section !== 'dashboard') setDashboardModulo('');
    if (section !== 'costos') setCostosModulo(null);
  };

  const toggleModulosDropdown = () => {
    setShowModulosDropdown(!showModulosDropdown);
    setActiveSection('modulos');
    setShowDashboardsDropdown(false);
    setShowCostosDropdown(false);
    if (!showModulosDropdown) setActiveModulo(null);
  };

  const toggleDashboardsDropdown = () => {
    setShowDashboardsDropdown(!showDashboardsDropdown);
    setActiveSection('dashboard');
    setShowModulosDropdown(false);
    setShowCostosDropdown(false);
    if (!showDashboardsDropdown) setDashboardModulo('');
  };

  const toggleCostosDropdown = () => {
    setShowCostosDropdown(!showCostosDropdown);
    setActiveSection('costos');
    setShowModulosDropdown(false);
    setShowDashboardsDropdown(false);
    if (!showCostosDropdown) setCostosModulo(null);
  };

  const handleSelectModulo = (modulo: 'generaciones' | 'capacitaciones' | 'reportes') => {
    setActiveModulo(modulo);
    setShowModulosDropdown(false);
  };

  const handleSelectDashboardModulo = (modulo: 'generaciones' | 'capacitaciones' | 'workshop') => {
    setDashboardModulo(modulo);
    setShowDashboardsDropdown(false);
  };

  const handleSelectCostosModulo = (modulo: 'tabla' | 'grafico') => {
    setCostosModulo(modulo);
    setShowCostosDropdown(false);
  };

  // ⛔️ No pintes nada hasta tener sesión verificada
  if (!ready) return null;

  return (
    <>
      <Head>
        <title>RRHH | Workshop M&amp;O</title>
      </Head>

      <div className="admin-container rrhh-scope">
        <header className="admin-header">
          <div className="header-content">
            <a href="/" className="header-logo" aria-label="Morris &amp; Opazo - inicio">
              <span className="sr-only">Morris &amp; Opazo</span>
            </a>
            <h1 className="admin-title">🧠Panel Recursos Humanos</h1>
            <ThemeToggle />
          </div>
          <nav className="admin-nav">

            <button
              onClick={() => handleSetSection('inicio')}
              className={`nav-item ${activeSection === 'inicio' ? 'active' : ''}`}
            >
              🏠 Inicio
            </button>

            {/* Dropdown: Dashboards */}
            <div className="dropdown">
              <button
                onClick={toggleDashboardsDropdown}
                className={`nav-item dropdown-toggle ${activeSection === 'dashboard' ? 'active' : ''}`}
                aria-haspopup="true"
                aria-expanded={showDashboardsDropdown}
              >
                📊 Dashboards ▼
              </button>
              {showDashboardsDropdown && (
                <ul className="dropdown-menu" role="menu">
                  <li>
                    <button
                      onClick={() => handleSelectDashboardModulo('generaciones')}
                      className={`dropdown-item ${dashboardModulo === 'generaciones' ? 'active' : ''}`}
                      role="menuitem"
                    >
                      Generaciones re/Start
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleSelectDashboardModulo('capacitaciones')}
                      className={`dropdown-item ${dashboardModulo === 'capacitaciones' ? 'active' : ''}`}
                      role="menuitem"
                    >
                      Capacitaciones externas
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleSelectDashboardModulo('workshop')}
                      className={`dropdown-item ${dashboardModulo === 'workshop' ? 'active' : ''}`}
                      role="menuitem"
                    >
                      Workshop
                    </button>
                  </li>
                </ul>
              )}
            </div>

            {/* Dropdown: Tablas */}
            <div className="dropdown">
              <button
                onClick={toggleModulosDropdown}
                className={`nav-item dropdown-toggle ${activeSection === 'modulos' ? 'active' : ''}`}
                aria-haspopup="true"
                aria-expanded={showModulosDropdown}
              >
                📂 Tablas ▼
              </button>
              {showModulosDropdown && (
                <ul className="dropdown-menu" role="menu">
                  <li>
                    <button
                      onClick={() => handleSelectModulo('generaciones')}
                      className={`dropdown-item ${activeModulo === 'generaciones' ? 'active' : ''}`}
                      role="menuitem"
                    >
                      Generaciones re/Start
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleSelectModulo('capacitaciones')}
                      className={`dropdown-item ${activeModulo === 'capacitaciones' ? 'active' : ''}`}
                      role="menuitem"
                    >
                      Capacitaciones externas
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleSelectModulo('reportes')}
                      className={`dropdown-item ${activeModulo === 'reportes' ? 'active' : ''}`}
                      role="menuitem"
                    >
                      Exportar datos (CSV)
                    </button>
                  </li>
                </ul>
              )}
            </div>

            {/* Dropdown: Costos */}
            <div className="dropdown">
              <button
                onClick={toggleCostosDropdown}
                className={`nav-item dropdown-toggle ${activeSection === 'costos' ? 'active' : ''}`}
                aria-haspopup="true"
                aria-expanded={showCostosDropdown}
              >
                💰 Costos ▼
              </button>
              {showCostosDropdown && (
                <ul className="dropdown-menu" role="menu">
                  <li>
                    <button
                      onClick={() => handleSelectCostosModulo('tabla')}
                      className={`dropdown-item ${costosModulo === 'tabla' ? 'active' : ''}`}
                      role="menuitem"
                    >
                      Seguimiento en Tabla
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleSelectCostosModulo('grafico')}
                      className={`dropdown-item ${costosModulo === 'grafico' ? 'active' : ''}`}
                      role="menuitem"
                    >
                      Seguimiento en Dashboard
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
              <p>Aquí podrás ver información y datos sobre los participantes.</p>
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

          {activeSection === 'costos' && (
            <div className="section-container content-wrapper">
              {!costosModulo && (
                <>
                  <h2>💰 Selecciona una vista de Costos</h2>
                  <p>Por favor, selecciona "Tabla" o "Dashboard" en el menú desplegable.</p>
                </>
              )}

              {costosModulo === 'tabla' && (
                <div>
                  <h2> SEGUIMIENTO DE GASTOS DE CUENTAS Y OU</h2>
                    <CostosTabla />
                </div>
              )}
              {costosModulo === 'grafico' && (
                <div>
                  <h2> DASHBOARD DE GASTOS POR OU</h2>
                  
                    <CostosGrafico />
                </div>
              )}
            </div>
          )}
        </main>

        <AgentWidget 
          // 🚨 
          apiEndpoint={process.env.NEXT_PUBLIC_RRHH_AGENT_API!}
          
          // Para RRHH, obtenemos el token JWT de la sesión de Cognito
          getAuthHeaderValue={async () => {
            try {
              const session = await fetchAuthSession();
              return session.tokens?.idToken?.toString() ?? null;
            } catch {
              return null;
            }
          }}
          
          // Para RRHH, la Lambda extrae la identidad del token, no necesita el sessionId en el body
          sendSessionIdInBody={false}
        />

      </div>
    </>
  );
};

export default rrhhPage;
