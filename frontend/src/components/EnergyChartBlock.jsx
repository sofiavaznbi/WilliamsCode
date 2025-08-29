
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush, ReferenceDot, Line, ResponsiveContainer } from 'recharts';
import ChartControls from './ChartControls';
import CustomTooltip from './CustomTooltip';

function exportCSV(data) {
  const header = Object.keys(data[0] || {}).join(',');
  const rows = data.map(d => Object.values(d).join(','));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'consumo.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function EnergyChartBlock({ data, anomalías, costePorKwh, loading, onRefresh }) {
  const [rango, setRango] = useState('1h');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showConsumo, setShowConsumo] = useState(true);
  const [showPotencia, setShowPotencia] = useState(false);
  const [showVoltaje, setShowVoltaje] = useState(false);
  const [showCorriente, setShowCorriente] = useState(false);

  const presets = useMemo(() => [
    { label: '1h', value: '1h' },
    { label: '24h', value: '24h' },
    { label: 'Semana', value: '7d' },
    { label: 'Mes', value: '30d' }
  ], []);

  // Label dinámico para el periodo
  const periodoLabel = useMemo(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return `Del ${start.toLocaleDateString()} al ${end.toLocaleDateString()}`;
    }
    switch (rango) {
      case '1h': return 'Última hora';
      case '24h': return 'Últimas 24 horas';
      case '7d': return 'Última semana';
      case '30d': return 'Último mes';
      default: return '';
    }
  }, [rango, startDate, endDate]);
  const rangoMs = useMemo(() => {
    switch (rango) {
      case '24h': return 86400000;
      case '7d': return 604800000;
      case '30d': return 2592000000;
      default: return 3600000;
    }
  }, [rango]);
  const now = useMemo(() => Date.now(), [data]);
  let datosFiltrados = useMemo(() => data.filter(d => now - new Date(d.timestamp).getTime() <= rangoMs), [data, now, rangoMs]);
  if (startDate && endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    datosFiltrados = data.filter(d => {
      const t = new Date(d.timestamp).getTime();
      return t >= start && t <= end;
    });
  }

  // Valores agregados
  const totalConsumo = datosFiltrados.reduce((acc, d) => acc + (d.consumo || 0), 0);
  const avgConsumo = datosFiltrados.length ? totalConsumo / datosFiltrados.length : 0;
  const totalPotencia = datosFiltrados.reduce((acc, d) => acc + (d.potencia || 0), 0);
  const avgPotencia = datosFiltrados.length ? totalPotencia / datosFiltrados.length : 0;

  // Responsive
  const chartWidth = window.innerWidth < 900 ? window.innerWidth - 40 : 800;

  return (
    <section className="energy-chart-block card">
  <h3>Consumo energético <span style={{fontWeight:'normal',color:'#888',fontSize:'1rem'}}>({periodoLabel})</span></h3>
      <div style={{display:'flex',gap:'16px',flexWrap:'wrap',alignItems:'center',marginBottom:'12px'}}>
        <ChartControls presets={presets} rango={rango} setRango={v => {
          setRango(v);
          setStartDate('');
          setEndDate('');
          if (onRefresh) onRefresh({ rango: v });
        }} />
        <label>Desde: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label>
        <label>Hasta: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></label>
        <button onClick={() => exportCSV(datosFiltrados)} style={{marginLeft:'auto'}}>Exportar CSV</button>
      </div>
      <div style={{marginBottom:'12px',display:'flex',gap:'16px',flexWrap:'wrap'}}>
        <label><input type="checkbox" checked={showConsumo} onChange={e => setShowConsumo(e.target.checked)} /> Consumo</label>
        <label><input type="checkbox" checked={showPotencia} onChange={e => setShowPotencia(e.target.checked)} /> Potencia</label>
        <label><input type="checkbox" checked={showVoltaje} onChange={e => setShowVoltaje(e.target.checked)} /> Voltaje</label>
        <label><input type="checkbox" checked={showCorriente} onChange={e => setShowCorriente(e.target.checked)} /> Corriente</label>
      </div>
      <div style={{marginBottom:'12px',display:'flex',gap:'32px',flexWrap:'wrap'}}>
        <div><b>Total consumo:</b> {totalConsumo.toFixed(2)} kWh</div>
        <div><b>Promedio consumo:</b> {avgConsumo.toFixed(2)} kWh</div>
        <div><b>Promedio potencia:</b> {avgPotencia.toFixed(2)} W</div>
      </div>
      {loading ? <div style={{textAlign:'center',margin:'32px'}}><span className="loader">Cargando datos...</span></div> : null}
      {!loading && datosFiltrados.length === 0 ? <div style={{textAlign:'center',margin:'32px',color:'#888'}}>No hay datos en el rango seleccionado.</div> : null}
      <div style={{width:'100%',maxWidth:'900px',margin:'0 auto',display:'flex',justifyContent:'center'}}>
        <ResponsiveContainer width={chartWidth} height={350}>
          <AreaChart
            data={datosFiltrados}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorConsumo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="colorPotencia" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="colorVoltaje" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ffc658" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="colorCorriente" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0088FE" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tickFormatter={t => {
              const date = new Date(t);
              if (rango === '1h') return date.toLocaleTimeString();
              if (rango === '24h') return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0,5);
              return date.toLocaleDateString();
            }} />
            <YAxis />
            <Tooltip content={<CustomTooltip costePorKwh={costePorKwh} anomalías={anomalías} />} />
            <Legend verticalAlign="top" height={36} />
            {showConsumo && <Area type="monotone" dataKey="consumo" stroke="#8884d8" fillOpacity={1} fill="url(#colorConsumo)" isAnimationActive={true} name="Consumo (kWh)" />}
            {showPotencia && <Line type="monotone" dataKey="potencia" stroke="#82ca9d" dot={false} name="Potencia (W)" />}
            {showVoltaje && <Line type="monotone" dataKey="voltaje" stroke="#ffc658" dot={false} name="Voltaje (V)" />}
            {showCorriente && <Line type="monotone" dataKey="corriente" stroke="#0088FE" dot={false} name="Corriente (A)" />}
            <Brush dataKey="timestamp" height={30} stroke="#8884d8" />
            {anomalías?.map(a => (
              <ReferenceDot key={a.timestamp} x={a.timestamp} y={a.consumo} r={6} fill="red" stroke="black" label={{ value: 'Anomalía', position: 'top', fill: 'red' }} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-legend" style={{marginTop:10,display:'flex',justifyContent:'center',gap:'20px',flexWrap:'wrap'}}>
        {showConsumo && <span style={{color:'#8884d8',fontWeight:'bold',fontSize:'1.1rem'}}>● Consumo</span>}
        {showPotencia && <span style={{color:'#82ca9d',fontWeight:'bold',fontSize:'1.1rem'}}>● Potencia</span>}
        {showVoltaje && <span style={{color:'#ffc658',fontWeight:'bold',fontSize:'1.1rem'}}>● Voltaje</span>}
        {showCorriente && <span style={{color:'#0088FE',fontWeight:'bold',fontSize:'1.1rem'}}>● Corriente</span>}
        <span style={{color:'red',fontWeight:'bold',fontSize:'1.1rem'}}>● Anomalía</span>
      </div>
    </section>
  );
}

export default EnergyChartBlock;
