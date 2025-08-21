"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { FaCheckCircle, FaHourglassHalf, FaUserSlash, FaFlask } from "react-icons/fa";
import "./DashboardWorkshop.css";

type Participante = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  pais: string;
  edad: number;
  fecha_ingreso: string;
  fecha_salida: string;
  estado: "Activo" | "Completado" | "Abandonado";
  workshop: "LAB001" | "LAB002";
  certificado_lab: "Si" | "No" | "Pendiente";
};

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type KPIProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  tooltip?: string;
  active?: boolean;
  onClick?: () => void;
};

function KPI({ title, value, icon, color, tooltip, active, onClick }: KPIProps) {
  return (
    <div
      className={`kpi-card ${active ? "activo" : ""}`}
      style={{ borderTop: `4px solid ${color}`, cursor: onClick ? "pointer" : "default" }}
      title={tooltip}
      onClick={onClick}
    >
      <div className="kpi-icon" style={{ color }}>
        {icon}
      </div>
      <div className="kpi-info">
        <div className="kpi-value">{value}</div>
        <div className="kpi-title">{title}</div>
      </div>
    </div>
  );
}

export default function DashboardWorkshop() {
  const [datos, setDatos] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workshopFiltro, setWorkshopFiltro] = useState<"todos" | "LAB001" | "LAB002">("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);
  const [paisSeleccionado, setPaisSeleccionado] = useState<string | null>(null);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);

    try {
      const [lab1Res, lab2Res] = await Promise.all([
        fetch("https://api.example.com/laboratorio?workshop=LAB001"),
        fetch("https://api.example.com/laboratorio?workshop=LAB002"),
      ]);

      if (!lab1Res.ok || !lab2Res.ok) {
        throw new Error("Error al cargar los datos del laboratorio");
      }

      const lab1Data = await lab1Res.json();
      const lab2Data = await lab2Res.json();

      const datosCompletos: Participante[] = [
        ...lab1Data.map((item: any) => ({
          ...item,
          workshop: "LAB001",
          certificado_lab: item.certificado_lab ?? "No",
        })),
        ...lab2Data.map((item: any) => ({
          ...item,
          workshop: "LAB002",
          certificado_lab: item.certificado_lab ?? "No",
        })),
      ];

      setDatos(datosCompletos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Aplicar filtros
  const datosFiltrados = useMemo(() => {
    let result = datos;

    if (workshopFiltro !== "todos") {
      result = result.filter((e) => e.workshop === workshopFiltro);
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          e.nombre.toLowerCase().includes(term) ||
          e.apellido.toLowerCase().includes(term) ||
          e.email.toLowerCase().includes(term) ||
          e.pais.toLowerCase().includes(term) ||
          e.estado.toLowerCase().includes(term) ||
          e.id.toLowerCase().includes(term) ||
          e.certificado_lab.toLowerCase().includes(term) ||
          e.workshop.toLowerCase().includes(term)
      );
    }

    if (kpiFilter) {
      switch (kpiFilter) {
        case "Completados":
          result = result.filter((e) => e.estado === "Completado");
          break;
        case "Activos":
          result = result.filter((e) => e.estado === "Activo");
          break;
        case "Abandonados":
          result = result.filter((e) => e.estado === "Abandonado");
          break;
        case "Certificados":
          result = result.filter((e) => e.certificado_lab === "Si");
          break;
        default:
          break;
      }
    }

    return result;
  }, [datos, workshopFiltro, searchTerm, kpiFilter]);

  // Contar por categoría
  const contar = (columna: keyof Participante, opciones: string[]) => {
    const conteo: Record<string, number> = {};
    opciones.forEach((op) => (conteo[op] = 0));
    datosFiltrados.forEach((e) => {
      if (opciones.includes(String(e[columna]))) {
        conteo[String(e[columna])] = (conteo[String(e[columna])] || 0) + 1;
      }
    });
    return conteo;
  };

  const totalParticipantes = datosFiltrados.length;
  const completadosCount = datosFiltrados.filter((e) => e.estado === "Completado").length;
  const activosCount = datosFiltrados.filter((e) => e.estado === "Activo").length;
  const abandonadosCount = datosFiltrados.filter((e) => e.estado === "Abandonado").length;
  const certificadosCount = datosFiltrados.filter((e) => e.certificado_lab === "Si").length;

  const certificadoCounts = contar("certificado_lab", ["No", "Si", "Pendiente"]);
  const estadoCounts = contar("estado", ["Activo", "Completado", "Abandonado"]);

  const certificadoPorPais = useMemo(() => {
    if (!categoriaSeleccionada) return null;

    const filtrados = datosFiltrados.filter(
      (e) => e.certificado_lab === categoriaSeleccionada
    );

    const conteo: Record<string, number> = {};
    filtrados.forEach((e) => {
      conteo[e.pais] = (conteo[e.pais] || 0) + 1;
    });

    return {
      paises: Object.keys(conteo),
      valores: Object.values(conteo),
    };
  }, [categoriaSeleccionada, datosFiltrados]);

  return (
    <div className="dashboard-container">
      <h1>Dashboard Participantes Workshop</h1>

      <div className="kpi-banner">
        <KPI
          title="Completados"
          value={completadosCount}
          icon={<FaCheckCircle />}
          color="#10ac84"
          tooltip="Participantes que completaron el workshop"
          active={kpiFilter === "Completados"}
          onClick={() => {
            setKpiFilter(kpiFilter === "Completados" ? null : "Completados");
            setCategoriaSeleccionada(null);
            setMapVisible(false);
            setPaisSeleccionado(null);
          }}
        />
        <KPI
          title="Activos"
          value={activosCount}
          icon={<FaHourglassHalf />}
          color="#feca57"
          tooltip="Participantes activos"
          active={kpiFilter === "Activos"}
          onClick={() => {
            setKpiFilter(kpiFilter === "Activos" ? null : "Activos");
            setCategoriaSeleccionada(null);
            setMapVisible(false);
            setPaisSeleccionado(null);
          }}
        />
        <KPI
          title="Abandonados"
          value={abandonadosCount}
          icon={<FaUserSlash />}
          color="#ff6b6b"
          tooltip="Participantes que abandonaron"
          active={kpiFilter === "Abandonados"}
          onClick={() => {
            setKpiFilter(kpiFilter === "Abandonados" ? null : "Abandonados");
            setCategoriaSeleccionada(null);
            setMapVisible(false);
            setPaisSeleccionado(null);
          }}
        />
        <KPI
          title="Certificados Lab"
          value={certificadosCount}
          icon={<FaFlask />}
          color="#1dd1a1"
          tooltip="Participantes con certificado del laboratorio"
          active={kpiFilter === "Certificados"}
          onClick={() => {
            setKpiFilter(kpiFilter === "Certificados" ? null : "Certificados");
            setCategoriaSeleccionada(null);
            setMapVisible(false);
            setPaisSeleccionado(null);
          }}
        />
      </div>

      <div className="controles">
        <input
          type="text"
          placeholder="Buscar por nombre, país, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-busqueda"
        />

        <div className="botones-filtro">
          <button
            className={workshopFiltro === "todos" ? "activo" : ""}
            onClick={() => setWorkshopFiltro("todos")}
          >
            Todos
          </button>
          <button
            className={workshopFiltro === "LAB001" ? "activo" : ""}
            onClick={() => setWorkshopFiltro("LAB001")}
          >
            LAB001
          </button>
          <button
            className={workshopFiltro === "LAB002" ? "activo" : ""}
            onClick={() => setWorkshopFiltro("LAB002")}
          >
            LAB002
          </button>
        </div>
      </div>

      {loading && <p>Cargando datos...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="graficos">
          {/* Certificado Lab */}
          <div className="grafico">
            <h3>Certificado de Laboratorio</h3>
            <p className="info-mensaje">
              💡 Haz click en una sección para ver distribución por país.
            </p>

            <Plot
              data={[
                {
                  type: "pie",
                  labels: Object.keys(certificadoCounts),
                  values: Object.values(certificadoCounts),
                  hole: 0.4,
                  marker: { colors: ["#ff6b6b", "#1dd1a1", "#feca57"] },
                },
              ]}
              layout={{ height: 300, margin: { t: 20, b: 20 } }}
              useResizeHandler
              style={{ width: "100%", height: "100%" }}
              onClick={(data) => {
                if (data && data.points && data.points[0]) {
                  const categoria = data.points[0].label;
                  setCategoriaSeleccionada(categoria);
                  setMapVisible(true);
                  setKpiFilter(null);
                  setPaisSeleccionado(null);
                }
              }}
            />
          </div>

          {/* Mapa grande + lista dinámica */}
          {certificadoPorPais && mapVisible && (
            <div className="map-large">
              <div className="map-header">
                <h3>{`Mapa - ${categoriaSeleccionada}`}</h3>
                {paisSeleccionado ? (
                  <button
                    className="btn-volver"
                    onClick={() => setPaisSeleccionado(null)}
                  >
                    ← Volver al mapa
                  </button>
                ) : (
                  <button
                    className="btn-volver"
                    onClick={() => {
                      setMapVisible(false);
                      setCategoriaSeleccionada(null);
                      setPaisSeleccionado(null);
                    }}
                  >
                    ← Volver al gráfico
                  </button>
                )}
              </div>

              {!paisSeleccionado ? (
                <>
                  <p style={{ textAlign: "center", fontStyle: "italic", marginBottom: "12px", color: "#555" }}>
                    💡 Haz click en un país para ver participantes
                  </p>

                  <Plot
                    data={[
                      {
                        type: "choropleth",
                        locations: certificadoPorPais.paises,
                        z: certificadoPorPais.valores,
                        locationmode: "country names",
                        colorscale: "Blues",
                        marker: { line: { color: "rgb(180,180,180)", width: 1 } },
                        colorbar: { title: "Cantidad" },
                      },
                    ]}
                    layout={{
                      height: 700,
                      geo: {
                        projection: { type: "natural earth" },
                        lonaxis: { range: [-170, -30] },
                        lataxis: { range: [-60, 80] },
                        showcoastlines: true,
                      },
                      margin: { t: 10, b: 10, l: 10, r: 10 },
                    }}
                    useResizeHandler
                    style={{ width: "100%", height: "700px" }}
                    onClick={(event) => {
                      if (event && event.points && event.points[0]?.location) {
                        setPaisSeleccionado(event.points[0].location);
                      }
                    }}
                  />
                </>
              ) : (
                <div className="lista-nombres" style={{ marginTop: 0 }}>
                  <h3>
                    Participantes con <em>{categoriaSeleccionada}</em> en <strong>{paisSeleccionado}</strong>
                  </h3>
                  <ul>
                    {datosFiltrados
                      .filter(
                        (e) =>
                          e.pais === paisSeleccionado &&
                          e.certificado_lab === categoriaSeleccionada
                      )
                      .map((e) => (
                        <li key={e.id}>
                          {e.nombre} {e.apellido} — {e.email}
                        </li>
                      ))}
                    {datosFiltrados.filter(
                      (e) =>
                        e.pais === paisSeleccionado &&
                        e.certificado_lab === categoriaSeleccionada
                    ).length === 0 && <p>No hay participantes en esta categoría y país.</p>}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Estado del participante */}
          <div className="grafico">
            <h3>Estado de Participantes</h3>
            <Plot
              data={[
                {
                  type: "bar",
                  x: Object.keys(estadoCounts),
                  y: Object.values(estadoCounts),
                  marker: { color: ["#54a0ff", "#10ac84", "#ff6b6b"] },
                },
              ]}
              layout={{
                height: 300,
                margin: { t: 20, b: 40 },
                xaxis: { title: "Estado" },
                yaxis: { title: "Cantidad" },
              }}
              useResizeHandler
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
