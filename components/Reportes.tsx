import React from 'react';

type Generacion = 'MEX23' | 'CLSAN22' | 'CLSAN25';

const Reportes = () => {

  const convertirACSV = (datos: any[]) => {
    if (!datos.length) return '';

    const headers = Object.keys(datos[0]);
    const filas = datos.map(row =>
      headers.map(header => {
        const valor = row[header];
        if (typeof valor === 'string') {
          return `"${valor.replace(/"/g, '""')}"`;
        }
        return valor;
      }).join(',')
    );

    return [headers.join(','), ...filas].join('\n');
  };

  const manejarDescarga = async (generacion: Generacion) => {
    try {
      // 👇 siempre se consulta la misma tabla
      const response = await fetch(
        `https://zhkj4c2jmb.execute-api.us-east-1.amazonaws.com/dev/generaciones?tabla=Generaciones_ReStart`
      );

      if (!response.ok) {
        alert('Error al obtener datos');
        return;
      }

      const datos = await response.json();

      // 👇 Filtramos en el front por prefijo del id
      const filtrados = datos.filter((item: any) => {
        if (generacion === 'MEX23') return item.id.startsWith('mex');
        if (generacion === 'CLSAN22') return item.id.startsWith('clsan22');
        if (generacion === 'CLSAN25') return item.id.startsWith('clsan25');
        return false;
      });

      if (!filtrados.length) {
        alert(`No hay datos para ${generacion}`);
        return;
      }

      const csv = convertirACSV(filtrados);

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `participantes_${generacion}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error al descargar CSV:', error);
      alert('Error al descargar CSV');
    }
  };

  return (
    <div className="generaciones-container">
      <h2 className="generaciones-header">Selecciona la generación para descargar su archivo CSV</h2>
      <div className="botones-generacion">
        <button
          onClick={() => manejarDescarga('MEX23')}
          className="boton-generacion"
        >
          Descargar MEX23
        </button>
        <button
          onClick={() => manejarDescarga('CLSAN25')}
          className="boton-generacion"
        >
          Descargar CLSAN25
        </button>
        <button
          onClick={() => manejarDescarga('CLSAN22')}
          className="boton-generacion"
        >
          Descargar CLSAN22
        </button>
      </div>
    </div>
  );
};

export default Reportes;
