"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { FaCheckCircle, FaHourglassHalf, FaUserSlash } from "react-icons/fa";
import "./DashboardCapacitaciones.css";

type Participante = {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  pais?: string;
  edad?: number;
  fecha_inicio?: string;
  fecha_termino?: string;
  estado: string; // Ejemplo: "En Curso", "Finalizado", "Pendiente"
  certificacion?: string; // Por ejemplo, algún certificado externo
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

export default function DashboardCapacitaciones() {
  const [datos, setDatos] = useState<Participante[]>([]); // Vacío porque no hay datos reales
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);

  // Función de carga de datos vacía o mock (podrías conectar tu API cuando haya datos)
  const cargarDatos = async () => {
    setLoading(true);
    setError(null);

    try {
      // Por ahora no cargamos nada real
      setDatos([]);
    } catch (e) {
      setError("Error al cargar datos (simulado)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrar datos según búsqueda y KPI seleccionado
  const datosFiltrados = useMemo(() => {
    let result = datos;

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          e.nombres?.toLowerCase().includes(term) ||
          e.apellidos?.toLowerCase().includes(term) ||
          e.correo?.toLowerCase().includes(term) ||
          e.pais?.toLowerCase().includes(term) ||
          e.estado?.toLowerCase().includes(term) ||
          e.id?.toLowerCase().includes(term) ||
          (e.certificacion?.toLowerCase() ?? "").includes(term)
      );
    }

    if (kpiFilter) {
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
        default:
          break;
      }
    }

    return result;
  }, [datos, searchTerm, kpiFilter]);

  // KPIs base con datos vacíos (0)
  const totalParticipantes = datosFiltrados.length;
  const aprobadosCount = datosFiltrados.filter((e) => e.estado === "Finalizado").length;
  const enCursoCount = datosFiltrados.filter((e) => e.estado === "En Curso" || e.estado === "Pendiente").length;
  const retiradosCount = datosFiltrados.filter((e) => e.estado === "Retirado").length;

  // Conteos para gráfico (vacío)
  const estadoCounts = {
    "En Curso": enCursoCount,
    Finalizado: aprobadosCount,
    Retirado: retiradosCount,
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard Capacitaciones Externas</h1>

      <div className="kpi-banner">
        <KPI
          title="Aprobados"
          value={aprobadosCount}
          icon={<FaCheckCircle />}
          color="#10ac84"
          tooltip="Participantes que finalizaron las capacitaciones"
          active={kpiFilter === "Aprobados"}
          onClick={() => setKpiFilter(kpiFilter === "Aprobados" ? null : "Aprobados")}
        />
        <KPI
          title="En Curso / Pendiente"
          value={enCursoCount}
          icon={<FaHourglassHalf />}
          color="#feca57"
          tooltip="Participantes activos"
          active={kpiFilter === "EnCurso"}
          onClick={() => setKpiFilter(kpiFilter === "EnCurso" ? null : "EnCurso")}
        />
        <KPI
          title="Retirados"
          value={retiradosCount}
          icon={<FaUserSlash />}
          color="#ff6b6b"
          tooltip="Participantes que abandonaron"
          active={kpiFilter === "Retirados"}
          onClick={() => setKpiFilter(kpiFilter === "Retirados" ? null : "Retirados")}
        />
      </div>

      <div className="controles">
        <input
          type="text"
          placeholder="Buscar por nombre, país, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-busqueda"
          disabled={loading}
        />
      </div>

      {loading && <p>Cargando datos...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && totalParticipantes === 0 && (
        <p style={{ fontStyle: "italic", color: "#555" }}>
          No hay datos disponibles para Capacitaciones Externas.
        </p>
      )}

      {!loading && !error && totalParticipantes > 0 && (
        <div className="graficos">
          <div className="grafico">
            <h3>Estado de Participantes</h3>
            <Plot
              data={[
                {
                  type: "bar",
                  x: Object.keys(estadoCounts),
                  y: Object.values(estadoCounts),
                  marker: { color: ["#feca57", "#10ac84", "#ff6b6b"] },
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
