"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { FaCheckCircle, FaHourglassHalf, FaUserSlash, FaCloud } from "react-icons/fa";
import "./DashboardGen.css";

type Estudiante = {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  pais: string;
  edad: number;
  fecha_inicio: string;
  fecha_termino: string;
  estado: string; // Restart: "En Curso", "Finalizado", "Pendiente"
  generacion: "MEX23"| "CLSAN22" | "CLSAN25";
  cloud_practitioner: string; // "Si", "No", "Pendiente"
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
      <div className="kpi-info">
        
        <div className="kpi-icon" style={{ color }}>
        {icon}
         <div className="kpi-value">{value}</div>
      </div>
         <div className="kpi-title">{title}</div>
        
       
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [datos, setDatos] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generacionFiltro, setGeneracionFiltro] = useState<"todas" | "MEX23" | "CLSAN22"| "CLSAN25">("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);

  // Estado nuevo para país seleccionado en el mapa
  const [paisSeleccionado, setPaisSeleccionado] = useState<string | null>(null);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
      "https://zhkj4c2jmb.execute-api.us-east-1.amazonaws.com/dev/generaciones?tabla=Generaciones_ReStart"
      );

      if (!res.ok) {
      throw new Error("Error al cargar los datos");
    }

    const datos: Estudiante[] = await res.json();

    // Normalizar cloud_practitioner
    const datosNormalizados = datos.map((item: any) => ({
      ...item,
      cloud_practitioner: item.cloud_practitioner ?? "No",
    }));

    setDatos(datosNormalizados);
  } catch (e) {
    setError(e instanceof Error ? e.message : "Error desconocido");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  cargarDatos();
}, []);

  // Aplicar filtros: generación + búsqueda + KPI personalizado
  const datosFiltrados = useMemo(() => {
    let result = datos;

    if (generacionFiltro !== "todas") {
      result = result.filter((e) => e.generacion === generacionFiltro);
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          e.nombres.toLowerCase().includes(term) ||
          e.apellidos.toLowerCase().includes(term) ||
          e.correo.toLowerCase().includes(term) ||
          e.pais.toLowerCase().includes(term) ||
          e.estado.toLowerCase().includes(term) ||
          e.id.toLowerCase().includes(term) ||
          e.cloud_practitioner.toLowerCase().includes(term) 
      );
    }

    if (kpiFilter) {
      // Filtrar según KPI seleccionado
      switch (kpiFilter) {
        case "Aprobados":
          result = result.filter((e) => e.estado === "Finalizado");
          break;
        case "EnCurso":
          result = result.filter((e) => e.estado === "En Curso" || e.estado === "Pendiente");
          break;
        case "Retirados":
          result = result.filter((e) => e.estado === "Retirado");
          break;
        case "CloudSi":
          result = result.filter((e) => e.cloud_practitioner === "Si");
          break;
        default:
          break;
      }
    }

    return result;
  }, [datos, generacionFiltro, searchTerm, kpiFilter]);

  // Función para contar categorías
  const contar = (columna: keyof Estudiante, opciones: string[]) => {
    const conteo: Record<string, number> = {};
    opciones.forEach((op) => (conteo[op] = 0));
    datosFiltrados.forEach((e) => {
      if (opciones.includes(String(e[columna]))) {
        conteo[String(e[columna])] = (conteo[String(e[columna])] || 0) + 1;
      }
    });
    return conteo;
  };

  // KPIs base
  const totalEstudiantes = datosFiltrados.length;
  const aprobadosCount = datosFiltrados.filter((e) => e.estado === "Finalizado").length;
  const enCursoCount = datosFiltrados.filter((e) => e.estado === "En Curso" || e.estado === "Pendiente").length;
  const retiradosCount = datosFiltrados.filter((e) => e.estado === "Retirado").length;
  const cloudSiCount = datosFiltrados.filter((e) => e.cloud_practitioner === "Si").length;

  // KPIs para gráficos
  const cloudCounts = contar("cloud_practitioner", ["No", "Si", "Pendiente"]);
  const restartCounts = contar("estado", ["En Curso", "Finalizado", "Retirado"]);

  // Análisis por país para cloud practitioner seleccionado (gráfico pie -> mapa)
  const cloudPorPais = useMemo(() => {
    if (!categoriaSeleccionada) return null;

    const filtrados = datosFiltrados.filter(
      (e) => e.cloud_practitioner === categoriaSeleccionada
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

  // Conteo por país según filtro KPI (para otros posibles usos)
  const conteoPaisKpi = useMemo(() => {
    if (!kpiFilter) return null;
    const conteo: Record<string, number> = {};
    datosFiltrados.forEach((e) => {
      conteo[e.pais] = (conteo[e.pais] || 0) + 1;
    });
    return {
      paises: Object.keys(conteo),
      valores: Object.values(conteo),
    };
  }, [kpiFilter, datosFiltrados]);

  return (
    <div className="dashboard-container">
      <h1>Dashboard Participantes </h1>

      {/* Nuevo banner KPIs arriba */}
      <div className="kpi-banner">
        <KPI
          title="re/Start Aprobados"
          value={aprobadosCount}
          icon={<FaCheckCircle />}
          color="#10ac84"
          tooltip="Estudiantes que finalizaron el curso"
          active={kpiFilter === "Aprobados"}
          onClick={() => {
            setKpiFilter(kpiFilter === "Aprobados" ? null : "Aprobados");
            setCategoriaSeleccionada(null);
            setMapVisible(false);
            setPaisSeleccionado(null);
          }}
        />
        <KPI
          title="En Curso / Pendiente"
          value={enCursoCount}
          icon={<FaHourglassHalf />}
          color="#feca57"
          tooltip="Estudiantes actualmente activos"
          active={kpiFilter === "EnCurso"}
          onClick={() => {
            setKpiFilter(kpiFilter === "EnCurso" ? null : "EnCurso");
            setCategoriaSeleccionada(null);
            setMapVisible(false);
            setPaisSeleccionado(null);
          }}
        />
        <KPI
          title="Retirados"
          value={retiradosCount}
          icon={<FaUserSlash />}
          color="#ff6b6b"
          tooltip="Estudiantes que abandonaron el curso"
          active={kpiFilter === "Retirados"}
          onClick={() => {
            setKpiFilter(kpiFilter === "Retirados" ? null : "Retirados");
            setCategoriaSeleccionada(null);
            setMapVisible(false);
            setPaisSeleccionado(null);
          }}
        />
        <KPI
          title="Cloud Practitioner"
          value={cloudSiCount}
          icon={<FaCloud />}
          color="#1dd1a1"
          tooltip="Estudiantes certificados en Cloud Practitioner"
          active={kpiFilter === "CloudSi"}
          onClick={() => {
            setKpiFilter(kpiFilter === "CloudSi" ? null : "CloudSi");
            setCategoriaSeleccionada(null);
            setMapVisible(false);
            setPaisSeleccionado(null);
          }}
        />
      </div>

      {/* Controles filtro y búsqueda */}
      <div className="controles">
        <input
          type="text"
          placeholder="Buscar por nombre, país, generacion..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-busqueda"
        />
  
      </div>


      {loading && <p>Cargando datos...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="graficos">
          {/* Cloud Practitioner */}
          <div className="grafico">
            <h3>Cloud Practitioner</h3>
            <p className="info-mensaje">
              💡 Haz click en una sección del gráfico para ver la distribución por país (mapa grande).
            </p>

            <Plot
              data={[
                {
                  type: "pie",
                  labels: Object.keys(cloudCounts),
                  values: Object.values(cloudCounts),
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
          {cloudPorPais && mapVisible && (
            <div className="map-large">
              <div className="map-header">
                <h3>{`Mapa (América) - ${categoriaSeleccionada}`}</h3>
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
                     💡 Haz click en un país para ver los datos de los participantes
                  </p>

                <Plot
                  data={[
                    {
                      type: "choropleth",
                      locations: cloudPorPais.paises,
                      z: cloudPorPais.valores,
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
                          e.cloud_practitioner === categoriaSeleccionada
                      )
                      .map((e) => (
                        <li key={e.id}>
                          {e.nombres} {e.apellidos} — {e.correo}
                        </li>
                      ))}
                    {datosFiltrados.filter(
                      (e) =>
                        e.pais === paisSeleccionado &&
                        e.cloud_practitioner === categoriaSeleccionada
                    ).length === 0 && <p>No hay participantes en esta categoría y país.</p>}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Restart */}
          <div className="grafico">
            <h3>Participantes Re/Start</h3>
            <Plot
              data={[
                {
                  type: "bar",
                  x: Object.keys(restartCounts),
                  y: Object.values(restartCounts),
                  marker: { color: ["#54a0ff", "#10ac84", "#ff9f43"] },
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
