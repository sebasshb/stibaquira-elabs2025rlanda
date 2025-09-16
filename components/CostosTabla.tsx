'use client';

import React, { useEffect, useState } from 'react';
import './CostosTabla.css';

type Cuenta = {
  OU: string;
  AccountID: string;
  AccountName: string;
  Joined: string;
  Month: string;
  Total: number;
  Services: { [servicio: string]: number };
};

const CostosTabla = () => {
  const [rawData, setRawData] = useState<Cuenta[]>([]);
  const [currentFilters, setCurrentFilters] = useState<{ ou: string; month: string }>({ ou: '', month: '' });
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: 'Total' | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });
  const [serviceSort, setServiceSort] = useState<{ direction: 'asc' | 'desc' }>({ direction: 'asc' });

  const [ous, setOus] = useState<string[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://01my884079.execute-api.us-east-1.amazonaws.com/costs');
        let data: Cuenta[] = await res.json();

        // 🔹 Agrupar y eliminar duplicados por OU + AccountID + Month
        const grouped: Record<string, Cuenta> = {};
        data.forEach((acc) => {
          const key = `${acc.OU}-${acc.AccountID}-${acc.Month}`;
          if (!grouped[key]) {
            grouped[key] = { ...acc };
          } else {
            // Si ya existe, sumamos totales y combinamos servicios
            grouped[key].Total += acc.Total;
            grouped[key].Services = { ...grouped[key].Services, ...acc.Services };
          }
        });
        data = Object.values(grouped);

        setRawData(data);

        const ousSet = new Set<string>();
        const monthsSet = new Set<string>();
        data.forEach((acc) => {
          ousSet.add(acc.OU);
          monthsSet.add(acc.Month);
        });
        setOus([...ousSet]);
        setMonths([...monthsSet].sort());
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const applyFilters = (ou: string, month: string) => {
    setCurrentFilters({ ou, month });
    setSelectedAccount(null);
  };

  const drawAccounts = () => {
    let filteredAccounts = rawData
      .filter((acc) => !currentFilters.ou || acc.OU === currentFilters.ou)
      .filter((acc) => !currentFilters.month || acc.Month === currentFilters.month);

    if (sortConfig.key === 'Total') {
      filteredAccounts.sort((a, b) =>
        sortConfig.direction === 'asc' ? a.Total - b.Total : b.Total - a.Total
      );
    }

    return (
      <div className="costos-tabla-container">
        <table className="costos-tabla">
          <thead>
            <tr>
              <th>OU</th>
              <th>Cuenta</th>
              <th>Account ID</th>
              <th>Mes</th>
              <th
                style={{ cursor: 'pointer' }}
                onClick={() =>
                  setSortConfig({
                    key: 'Total',
                    direction: sortConfig.key === 'Total' && sortConfig.direction === 'asc' ? 'desc' : 'asc',
                  })
                }
              >
                Total USD {sortConfig.key === 'Total' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((acc) => (
              <tr
                key={`${acc.OU}-${acc.AccountID}-${acc.Month}`} // 🔹 clave única
                onClick={() => setSelectedAccount(acc.AccountID)}
                style={{ cursor: 'pointer' }}
              >
                <td>{acc.OU}</td>
                <td>{acc.AccountName}</td>
                <td>{acc.AccountID}</td>
                <td>{acc.Month}</td>
                <td>{acc.Total >= 5 ? <span className="badge-si">{acc.Total.toFixed(2)}</span> : acc.Total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const drawAccountDetail = () => {
    if (!selectedAccount) return null;
    const accountRecords = rawData.filter((acc) => acc.AccountID === selectedAccount);

    return (
      <div className="costos-tabla-container" style={{ textAlign: 'center' }}>
        <h2 className="costos-header">Detalle de gastos de {accountRecords[0]?.AccountName}</h2>
        {accountRecords.map((acc) => {
          if (currentFilters.month && acc.Month !== currentFilters.month) return null;

          const sortedServices = Object.entries(acc.Services).sort((a, b) =>
            serviceSort.direction === 'asc' ? a[1] - b[1] : b[1] - a[1]
          );

          return (
            <div key={acc.Month} style={{ marginBottom: '20px' }}>
              <h3>
                Mes: {acc.Month} - Total:{' '}
                {acc.Total >= 5 ? <span className="badge-si">{acc.Total.toFixed(2)}</span> : acc.Total.toFixed(2)} USD
              </h3>
              <table className="costos-tabla" style={{ margin: '0 auto' }}>
                <thead>
                  <tr>
                    <th>Servicio</th>
                    <th
                      style={{ cursor: 'pointer' }}
                      onClick={() =>
                        setServiceSort({ direction: serviceSort.direction === 'asc' ? 'desc' : 'asc' })
                      }
                    >
                      USD {serviceSort.direction === 'asc' ? '↑' : '↓'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedServices.map(([service, cost]) => (
                    <tr key={service}>
                      <td>{service}</td>
                      <td>{cost >= 5 ? <span className="badge-si">{cost.toFixed(2)}</span> : cost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
        <button className="boton-aplicar" onClick={() => setSelectedAccount(null)} style={{ marginTop: '15px' }}>
          ⬅ Volver a cuentas
        </button>
      </div>
    );
  };

  return (
    <div className="costos-container">
      <p className="costos-description">
        Filtra por OU o mes. Selecciona 'Total USD' para ordenar. Al elegir nombre de una cuenta, se muestran los gastos por servicio
      </p>

      {loading ? (
        <p style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '20px' }}>Cargando...</p>
      ) : (
        <>
          <div className="controles-costos">
            <select
              className="select-input"
              value={currentFilters.ou}
              onChange={(e) => applyFilters(e.target.value, currentFilters.month)}
            >
              <option value="">Todos los OU</option>
              {ous.map((ou) => (
                <option key={ou} value={ou}>{ou}</option>
              ))}
            </select>

            <select
              className="select-input"
              value={currentFilters.month}
              onChange={(e) => applyFilters(currentFilters.ou, e.target.value)}
            >
              <option value="">Todos los meses</option>
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <button className="boton-aplicar" onClick={() => applyFilters(currentFilters.ou, currentFilters.month)}>
              Aplicar filtros
            </button>
          </div>

          {selectedAccount ? drawAccountDetail() : drawAccounts()}
        </>
      )}
    </div>
  );
};

export default CostosTabla;
