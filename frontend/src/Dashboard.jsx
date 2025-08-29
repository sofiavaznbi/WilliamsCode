


import React, { useState, useEffect, useRef } from "react";
import TopBar from "./components/TopBar";
import EnergyChartBlock from "./components/EnergyChartBlock";
import './styles/dashboard.css';

const costePorKwh = 0.18;

const Dashboard = () => {
  const [dark, setDark] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [data, setData] = useState([]);
  const [anomalías, setAnomalias] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [chartParams, setChartParams] = useState({ rango: '1h', startDate: '', endDate: '' });
  const wsRef = useRef(null);

  // Obtener dispositivos al cargar
  useEffect(() => {
    setLoadingDevices(true);
    fetch("/devices", { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(devs => {
        setDevices(devs);
        setSelectedDevice(devs[0]?.id || null);
        setLoadingDevices(false);
      });
  }, []);

  // Obtener mediciones del dispositivo seleccionado
  const fetchData = (opts = {}) => {
    if (!selectedDevice) return;
    setLoadingData(true);
    let url = `/consumption/${selectedDevice}`;
    const params = [];
    if (opts.startDate) params.push(`start=${opts.startDate}`);
    if (opts.endDate) params.push(`end=${opts.endDate}`);
    if (params.length) url += '?' + params.join('&');
    fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(rows => {
        setData(rows.reverse());
        setAnomalias(rows.filter(r => r.consumo > 2.5));
        setLoadingData(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [selectedDevice]);

  // WebSocket para actualizaciones en tiempo real
  useEffect(() => {
    wsRef.current = new window.WebSocket(`ws://${window.location.hostname}:4000`);
    wsRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "medicion" && msg.data.device_id === selectedDevice) {
        setData(prev => {
          const updated = [...prev.slice(-49), msg.data];
          // Filtrar según rango y fechas
          let filtered = updated;
          const now = Date.now();
          let rangoMs = 3600000;
          switch (chartParams.rango) {
            case '24h': rangoMs = 86400000; break;
            case '7d': rangoMs = 604800000; break;
            case '30d': rangoMs = 2592000000; break;
            default: rangoMs = 3600000;
          }
          if (chartParams.startDate && chartParams.endDate) {
            const start = new Date(chartParams.startDate).getTime();
            const end = new Date(chartParams.endDate).getTime();
            filtered = updated.filter(d => {
              const t = new Date(d.timestamp).getTime();
              return t >= start && t <= end;
            });
          } else {
            filtered = updated.filter(d => now - new Date(d.timestamp).getTime() <= rangoMs);
          }
          setAnomalias(filtered.filter(r => r.consumo > 2.5));
          return filtered;
        });
      }
    };
    return () => wsRef.current?.close();
  }, [selectedDevice, chartParams]);

  // Cálculos para paneles
  const consumoTotal = data.reduce((acc, d) => acc + (d.consumo || 0), 0);
  const potenciaMax = Math.max(0, ...data.map(d => d.potencia || 0));
  const ultimaMedicion = data[data.length - 1];
  const corrienteActual = ultimaMedicion?.corriente || 0;
  const estado = ultimaMedicion?.estado || 'ON';

  // Costes
  const costeHoy = consumoTotal * costePorKwh;
  const costeMes = costeHoy * 30;
  const costeAño = costeHoy * 365;

  // Recomendaciones y automatizaciones (ejemplo)
  const recomendaciones = [
    "Este dispositivo estuvo encendido 12h ayer, considera apagarlo antes para ahorrar 5,60€.",
    "Este dispositivo es responsable del 30% de tu factura este mes."
  ];
  const automatizaciones = [
    { if: "Consumo > 2000 W", then: "Apagar Sonoff POW" },
    { if: "Hora = 7:00 AM", then: "Encender Sonoff POW" }
  ];
  const alertas = [
    { tipo: "Power", valor: "2.000 W", accion: "Enviar notificación" },
    { tipo: "Control towel", valor: "", accion: "Have aftail camles" }
  ];

  return (
    <div className={dark ? "dashboard-main dark" : "dashboard-main"}>
      <TopBar />
      <div style={{textAlign:'right',margin:'8px 0'}}>
        <button onClick={() => setDark(d => !d)} style={{padding:'8px 16px',borderRadius:'8px',background:dark?'#222':'#eaf6ff',color:dark?'#fff':'#222',border:'none',cursor:'pointer'}}>
          {dark ? '🌞 Modo claro' : '🌙 Modo oscuro'}
        </button>
      </div>
      <div className="device-card">
        <div className="device-status">
          <span role="img" aria-label="power">{estado === 'ON' ? '🟦' : '⬜'}</span>
          <span>{estado}</span>
        </div>
        <div className="device-info">
          <div className="power">{ultimaMedicion?.potencia?.toFixed(2) || '--'} W</div>
          <div className="current">{corrienteActual?.toFixed(2) || '--'} A</div>
          <div style={{color:'#6b7a99',fontSize:'1rem'}}>{devices.find(d => d.id === selectedDevice)?.nombre || 'Dispositivo'}</div>
        </div>
      </div>
      <div className="section">
        <div className="section-title">Consumption</div>
        <EnergyChartBlock
          data={data}
          anomalías={anomalías}
          costePorKwh={costePorKwh}
          loading={loadingData}
          onRefresh={opts => {
            setChartParams(prev => ({ ...prev, ...opts }));
            fetchData(opts);
          }}
        />
      </div>
      <div className="section" style={{display:'flex',gap:'32px',flexWrap:'wrap'}}>
        <div className="cost-panel">
          <div className="section-title">Cost</div>
          <div>0,25 € €/kWh</div>
          <div>€{costeHoy.toFixed(2)} Today</div>
          <div>€{costeMes.toFixed(2)} Month</div>
          <div>€{costeAño.toFixed(2)} Year</div>
        </div>
        <div className="recommendations">
          <div className="section-title">Recommendations</div>
          {recomendaciones.map((r, i) => (
            <div className="recommendation-card" key={i}>{r}</div>
          ))}
        </div>
        <div className="automations">
          <div className="section-title">Automations</div>
          <button className="automation-card" style={{background:dark?'#222':'#fff',border:'1px solid #e0e7ef',color:dark?'#fff':'#222'}}>+ Create new automation</button>
          {automatizaciones.map((a, i) => (
            <div className="automation-card" key={i} style={{background:dark?'#222':'',color:dark?'#fff':'#222'}}><b>IF</b> {a.if}<br /><b>THEN</b> {a.then}</div>
          ))}
        </div>
        <div className="alerts">
          <div className="section-title">Alerts</div>
          {alertas.map((a, i) => (
            <div className="alert-card" key={i} style={{background:dark?'#222':'',color:dark?'#fff':'#222'}}><b>{a.tipo}</b> {a.valor} <br />{a.accion}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
