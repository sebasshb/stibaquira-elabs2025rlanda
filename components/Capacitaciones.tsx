import React, { useState, useEffect } from 'react';
import './Generaciones.css'; // Reutilizamos los mismos estilos

type Capacitacion = {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  pais: string;
  edad: number;
  fecha_inicio: string;
  fecha_termino: string;
  estado: string;
  programa: string;
};

type SortConfig = {
  key: keyof Capacitacion;
  direction: 'ascending' | 'descending';
};

const Capacitaciones = () => {
  const [datosCompletos, setDatosCompletos] = useState<Capacitacion[]>([]);
  const [datosFiltrados, setDatosFiltrados] = useState<Capacitacion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: 'edad', 
    direction: 'descending'
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar todos los datos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      setError(null);
      
      try {
        const response = await fetch('https://tu-api.com/capacitaciones');
        
        if (!response.ok) {
          throw new Error('Error al cargar los datos');
        }

        const data = await response.json();
        setDatosCompletos(data);
        setDatosFiltrados(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error desconocido');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Ordenar datos
  const sortedData = React.useMemo(() => {
    const sortableData = [...datosFiltrados];
    if (sortConfig) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [datosFiltrados, sortConfig]);

  // Filtrar datos basado en searchTerm
  useEffect(() => {
    if (!searchTerm) {
      setDatosFiltrados(datosCompletos);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const resultados = datosCompletos.filter(item => 
      item.nombres.toLowerCase().includes(term) ||
      item.apellidos.toLowerCase().includes(term) ||
      item.correo.toLowerCase().includes(term) ||
      item.pais.toLowerCase().includes(term) ||
      item.estado.toLowerCase().includes(term) ||
      item.id.toLowerCase().includes(term) ||
      item.programa.toLowerCase().includes(term)
    );
    
    setDatosFiltrados(resultados);
  }, [searchTerm, datosCompletos]);

  // Solicitar ordenación
  const requestSort = (key: keyof Capacitacion) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Estilo para encabezados ordenados
  const getSortIndicator = (key: keyof Capacitacion) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  return (
    <div className="generaciones-container">
      <h2 className="generaciones-header">👥 Participantes de Capacitaciones</h2>
      <p className="generaciones-description">
        Tabla con datos de participantes. Haz clic en los encabezados para ordenar la información
      </p>

      <div className="controles-superiores">
        <div className="filtros-container">
          <input
            type="text"
            placeholder="Buscar por nombre, país, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <div className="botones-generacion">
            <button className="boton-generacion seleccionado">
              Todos los participantes
            </button>
          </div>
        </div>
      </div>

      {cargando && <div className="loading-indicator">Cargando datos...</div>}
      {error && <div className="error-message">{error}</div>}

      {sortedData.length > 0 ? (
        <div className="tabla-container">
          <table className="tabla-generaciones">
            <thead>
              <tr>
                <th onClick={() => requestSort('id')}>
                  ID {getSortIndicator('id')}
                </th>
                <th onClick={() => requestSort('programa')}>
                  Programa {getSortIndicator('programa')}
                </th>
                <th onClick={() => requestSort('nombres')}>
                  Nombres {getSortIndicator('nombres')}
                </th>
                <th onClick={() => requestSort('apellidos')}>
                  Apellidos {getSortIndicator('apellidos')}
                </th>
                <th onClick={() => requestSort('correo')}>
                  Correo {getSortIndicator('correo')}
                </th>
                <th onClick={() => requestSort('telefono')}>
                  Teléfono {getSortIndicator('telefono')}
                </th>
                <th onClick={() => requestSort('pais')}>
                  País {getSortIndicator('pais')}
                </th>
                <th onClick={() => requestSort('edad')}>
                  Edad {getSortIndicator('edad')}
                </th>
                <th onClick={() => requestSort('fecha_inicio')}>
                  Inicio {getSortIndicator('fecha_inicio')}
                </th>
                <th onClick={() => requestSort('fecha_termino')}>
                  Término {getSortIndicator('fecha_termino')}
                </th>
                <th onClick={() => requestSort('estado')}>
                  Estado {getSortIndicator('estado')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item) => (
                <tr key={`${item.id}`}>
                  <td>{item.id}</td>
                  <td>{item.programa}</td>
                  <td>{item.nombres}</td>
                  <td>{item.apellidos}</td>
                  <td>
                    <a href={`mailto:${item.correo}`}>{item.correo}</a>
                  </td>
                  <td>{item.telefono}</td>
                  <td>{item.pais}</td>
                  <td className="edad-cell">{item.edad}</td>
                  <td>{new Date(item.fecha_inicio).toLocaleDateString()}</td>
                  <td>{new Date(item.fecha_termino).toLocaleDateString()}</td>
                  <td>
                    <span className={`estado-badge ${item.estado.toLowerCase()}`}>
                      {item.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="resultados-info">
            Mostrando {sortedData.length} de {datosCompletos.length} registros
            {searchTerm && ` - Filtrados por: "${searchTerm}"`}
          </div>
        </div>
      ) : (
        !cargando && <div className="no-results">
          {searchTerm ? `No se encontraron resultados para "${searchTerm}"` : 'No hay datos disponibles'}
        </div>
      )}
    </div>
  );
};

export default Capacitaciones;