'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import './CostosGrafico.css';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Cuenta = {
  OU: string;
  AccountID: string;
  AccountName: string;
  Joined: string;
  Month: string;
  Total: number;
  Services: { [servicio: string]: number };
};

type ServicesData = {
  accountName: string;
  month: string;
  services: { [servicio: string]: number };
  total: number;
};

const CostosGrafico: React.FC = () => {
  const [rawData, setRawData] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOU, setSelectedOU] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [servicesData, setServicesData] = useState<ServicesData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://01my884079.execute-api.us-east-1.amazonaws.com/costs');
        const data: Cuenta[] = await res.json();
        setRawData(data);
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Scroll para centrar detalle cuando se abre
  useEffect(() => {
    if (servicesData) {
      const element = document.getElementById('cg-detail-panel');
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [servicesData]);

  if (loading) return <p className="cg-loading">Cargando gráficos...</p>;
  if (!rawData.length) return <p className="cg-placeholder">No hay datos disponibles</p>;

  const ous = [...new Set(rawData.map(acc => acc.OU))];
  const months = Array.from(new Set(rawData.map(acc => acc.Month))).sort();

  const colores = ['#FF6F00', '#FFB300', '#0F1181', '#0077B6', '#1C30A0', '#2A6F97', '#462267'];

  const ousToShow = selectedOU ? [selectedOU] : ous;
  const monthToShow = selectedMonth || months[0];
  const isDetail = !!servicesData || selectedOU;

  return (
    <div className="cg-container">
      {/* Filtros */}
      <div className="cg-filters">
        <select value={selectedOU} onChange={(e) => setSelectedOU(e.target.value)} className="cg-select">
          <option value="">Todas las OU</option>
          {ous.map(ou => <option key={ou} value={ou}>{ou}</option>)}
        </select>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="cg-select">
          <option value="">Selecciona mes</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
  <p className="costos-description">
         Haz click en la barra del gráfico para ver el detalle de sus gastos por servicio
    </p>

      {/* Contenedor principal de gráficos y detalle */}
      <div className={`cg-main ${isDetail ? 'cg-detail-mode' : ''}`}>
        {/* Gráficos */}
        <div className="cg-grid">
          {ousToShow.map((ou) => {
            const accountsInOU = rawData.filter(acc => acc.OU === ou && acc.Month === monthToShow);

            // Ajuste dinámico del ancho de barras según cantidad de cuentas
            const barraWidth = Math.min(0.5, 0.8 + 0.9/ accountsInOU.length);

            const traces = accountsInOU.map((acc, i) => ({
              x: [i],
              y: [acc.Total],
              type: 'bar',
              name: acc.AccountName,
              marker: { color: colores[i % colores.length] },
              hoverinfo: 'y+name',
              width: barraWidth
            }));

            const layout = {
              title: { text: `OU: ${ou}`, x: 0.5, xanchor: 'center', font: { color: '#333', size: 14 } },
              font: { color: '#333' },
              paper_bgcolor: '#f9f9f9',
              plot_bgcolor: '#ffffff',
              margin: { t: 50, l: 50, r: 50, b: 50 },
              xaxis: { visible: false },
              yaxis: { title: 'USD', tickformat: '$,.2f', tickfont: { size: 12 } },
              hovermode: 'closest',
              barmode: 'group',
              bargap: 0.2,
              bargroupgap: 0.05,
            };

            return (
              <div key={ou} className={`cg-plot-container ${isDetail ? 'cg-plot-detail' : ''}`}>
                <Plot
                  key={`${ou}-${monthToShow}-${accountsInOU.length}`} // fuerza rerender para click
                  data={traces}
                  layout={layout}
                  config={{ responsive: false, displayModeBar: false }}
                  className="cg-plot"
                  onClick={(eventData: any) => {
                    if (!eventData || !eventData.points) return;
                    const clickedAccountName = eventData.points[0].data.name;
                    const acc = accountsInOU.find(a => a.AccountName === clickedAccountName);
                    if (acc) {
                      setServicesData({
                        accountName: clickedAccountName,
                        month: monthToShow,
                        services: acc.Services,
                        total: acc.Total,
                      });
                    }
                  }}
                  onDoubleClick={() => setServicesData(null)}
                />
              </div>
            );
          })}
        </div>

  

        {/* Detalle */}
        {servicesData && (
          <div id="cg-detail-panel" className="cg-services-detail">
            <button onClick={() => setServicesData(null)}>Volver</button>
            <h3>{servicesData.accountName} ({servicesData.month})</h3>
            <p><strong>Total:</strong> ${servicesData.total.toFixed(2)}</p>
            <table>
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>USD</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(servicesData.services).map(([s, c]) => (
                  <tr key={s}>
                    <td>{s}</td>
                    <td>{c.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostosGrafico;
