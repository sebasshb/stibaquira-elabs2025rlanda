import React, { useState, useEffect } from 'react';
import './Generaciones.css';

type Generacion = {
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
  generacion: 'MEX23' | 'CLSAN22'| 'CLSAN25';
  cloud_practitioner: string;
};

type SortConfig = {
  key: keyof Generacion;
  direction: 'ascending' | 'descending';
};

const Generaciones = () => {
  const [datosCompletos, setDatosCompletos] = useState<Generacion[]>([]);
  const [datosFiltrados, setDatosFiltrados] = useState<Generacion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'edad',
    direction: 'descending',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const cargarTodosLosDatos = async () => {
      setCargando(true);
      setError(null);

      try {
        const response = await fetch(
            'https://zhkj4c2jmb.execute-api.us-east-1.amazonaws.com/dev/generaciones?tabla=Generaciones_ReStart'
        
        );

        if (!response.ok) {
          throw new Error('Error al cargar los datos');
        }

        const data = await response.json();

        const datosConGeneracion = data.map((item: any) => {
        let generacion = 'DESCONOCIDA';
        if (item.id.startsWith('mex')) generacion = 'MEX23';
        else if (item.id.startsWith('clsan22')) generacion = 'CLSAN22';
        else if (item.id.startsWith('clsan25')) generacion = 'CLSAN25';

        return {
          ...item,
          generacion,
          cloud_practitioner: item.cloud_practitioner ?? 'No especificado',
          fecha_inicio: item.fecha_inicio ?? 'No especificado',
          fecha_termino: item.fecha_termino ?? 'No especificado',
          edad: typeof item.edad === 'number' ? item.edad : 0,
          telefono: item.telefono ?? 'No especificado',
        };
      });

        setDatosCompletos(datosConGeneracion);
        setDatosFiltrados(datosConGeneracion);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error desconocido');
      } finally {
        setCargando(false);
      }
    };

    cargarTodosLosDatos();
  }, []);

  const sortedData = React.useMemo(() => {
    const sortableData = [...datosFiltrados];
    if (sortConfig) {
      sortableData.sort((a, b) => {
        const aKey = a[sortConfig.key];
        const bKey = b[sortConfig.key];

        if (aKey === undefined || bKey === undefined) return 0;

        if (typeof aKey === 'string' && typeof bKey === 'string') {
          return sortConfig.direction === 'ascending'
            ? aKey.localeCompare(bKey)
            : bKey.localeCompare(aKey);
        }

        if (aKey < bKey) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aKey > bKey) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [datosFiltrados, sortConfig]);

  useEffect(() => {
    if (!searchTerm) {
      setDatosFiltrados(datosCompletos);
      return;
    }

    const term = searchTerm.toLowerCase();
    const resultados = datosCompletos.filter((item) =>
      item.nombres.toLowerCase().includes(term) ||
      item.apellidos.toLowerCase().includes(term) ||
      item.correo.toLowerCase().includes(term) ||
      item.pais.toLowerCase().includes(term) ||
      item.estado.toLowerCase().includes(term) ||
      item.id.toLowerCase().includes(term) ||
      item.cloud_practitioner.toLowerCase().includes(term) ||
      item.generacion.toLowerCase().includes(term)
    );

    setDatosFiltrados(resultados);
  }, [searchTerm, datosCompletos]);

  const requestSort = (key: keyof Generacion) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof Generacion) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  const filtrarPorGeneracion = (
    generacion: 'MEX23' | 'CLSAN25' |'CLSAN22' | 'todas'
  ) => {
    if (generacion === 'todas') {
      setDatosFiltrados(datosCompletos);
    } else {
      const filtrados = datosCompletos.filter(
        (item) => item.generacion === generacion
      );
      setDatosFiltrados(filtrados);
    }
  };

  const getCloudPractitionerClass = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'si') {
      return 'si'; // naranja
    }
    if (statusLower === 'pendiente') {
      return 'pendiente'; // azul
    }
    if (statusLower === 'no') {
      return 'no'; // negro
    }
    return 'no'; // default a negro si es otro valor
  };

  return (
    <div className="generaciones-container">
      <h2 className="generaciones-header">👥 Participantes Programa re/Start</h2>
      <p className="generaciones-description">
        Tabla con datos de participantes. Haz clic en los encabezados para ordenar
        la información
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
            <button
              onClick={() => filtrarPorGeneracion('todas')}
              className="boton-generacion"
            >
              Todos los participantes
            </button>
            <button
              onClick={() => filtrarPorGeneracion('MEX23')}
              className="boton-generacion"
            >
              Generación MEX23
            </button>
            <button
              onClick={() => filtrarPorGeneracion('CLSAN25')}
              className="boton-generacion"
            >
              Generación CLSAN25
            </button>
            <button
              onClick={() => filtrarPorGeneracion('CLSAN22')}
              className="boton-generacion"
            >
              Generación CLSAN22
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
                  Id{getSortIndicator('id')}
                </th>
                <th onClick={() => requestSort('generacion')}>
                  Generación{getSortIndicator('generacion')}
                </th>
                <th onClick={() => requestSort('nombres')}>
                  Nombres{getSortIndicator('nombres')}
                </th>
                <th onClick={() => requestSort('apellidos')}>
                  Apellidos{getSortIndicator('apellidos')}
                </th>
                <th onClick={() => requestSort('correo')}>
                  Correo{getSortIndicator('correo')}
                </th>
                <th onClick={() => requestSort('telefono')}>
                  Teléfono{getSortIndicator('telefono')}
                </th>
                <th onClick={() => requestSort('pais')}>
                  País{getSortIndicator('pais')}
                </th>
                <th onClick={() => requestSort('edad')}>
                  Edad{getSortIndicator('edad')}
                </th>
                <th onClick={() => requestSort('fecha_inicio')}>
                  Inicio{getSortIndicator('fecha_inicio')}
                </th>
                <th onClick={() => requestSort('fecha_termino')}>
                  Término{getSortIndicator('fecha_termino')}
                </th>
                <th onClick={() => requestSort('estado')}>
                  Estado{getSortIndicator('estado')}
                </th>
                <th onClick={() => requestSort('cloud_practitioner')}>
                  Cloud Practitioner{getSortIndicator('cloud_practitioner')}
                </th>
              </tr>
            </thead>
            <tbody>
            {sortedData.map((item) => (
            <tr key={`${item.generacion}-${item.id}`}>
            <td>{item.id}</td>
            <td>{item.generacion}</td>
            <td>{item.nombres}</td>
            <td>{item.apellidos}</td>
            <td>
            <a href={`mailto:${item.correo}`}>{item.correo}</a>
            </td>
            <td>{item.telefono}</td>
            <td>{item.pais}</td>

            {/* Edad seguro */}
             <td className="edad-cell">{typeof item.edad === 'number' ? item.edad : 'N/A'}</td>

            {/* Fechas seguras */}
            <td>
            {item.fecha_inicio && !isNaN(new Date(item.fecha_inicio).getTime())
            ? new Date(item.fecha_inicio).toLocaleDateString()
            : 'N/A'}
            </td>
            <td>
            {item.fecha_termino && !isNaN(new Date(item.fecha_termino).getTime())
            ? new Date(item.fecha_termino).toLocaleDateString()
            : 'N/A'}
            </td>

            <td>
            <span className={`estado-badge ${item.estado.toLowerCase()}`}>
             {item.estado}
            </span>
            </td>
            <td>
            <span
            className={`cloud-practitioner-badge ${getCloudPractitionerClass(
              item.cloud_practitioner || ''
            )}`}
        >
            {item.cloud_practitioner || 'No especificado'}
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
        !cargando && (
          <div className="no-results">
            {searchTerm
              ? `No se encontraron resultados para "${searchTerm}"`
              : 'No hay datos disponibles'}
          </div>
        )
      )}
    </div>
  );
};

export default Generaciones;
