
// =============================================================
// Ficheiro: Dashboard.jsx
// Descrição: Componente principal do painel de controlo do frontend React.
// Utilidade: Mostra dispositivos, gráficos de consumo, recomendações, automatizações e alertas.
// =============================================================

import React, { useState, useEffect, useRef } from "react";
import TopBar from "./components/TopBar";
import EnergyChartBlock from "./components/EnergyChartBlock";
import './styles/dashboard.css';

const custoPorKwh = 0.18;

const Dashboard = () => {
  const [escuro, setEscuro] = useState(false);
  const [dispositivos, setDispositivos] = useState([]);
  const [dispositivoSelecionado, setDispositivoSelecionado] = useState(null);
  const [carregandoDispositivos, setCarregandoDispositivos] = useState(true);
  const [dados, setDados] = useState([]);
  const [anomalias, setAnomalias] = useState([]);
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [parametrosGrafico, setParametrosGrafico] = useState({ intervalo: '1h', dataInicio: '', dataFim: '' });
  const wsRef = useRef(null);

  // Obter dispositivos ao carregar
  useEffect(() => {
    setCarregandoDispositivos(true);
    fetch("/devices", { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(devs => {
        setDispositivos(devs);
        setDispositivoSelecionado(devs[0]?.id || null);
        setCarregandoDispositivos(false);
      });
  }, []);

  // Obter medições do dispositivo selecionado
  const obterDados = (opts = {}) => {
    if (!dispositivoSelecionado) return;
    setCarregandoDados(true);
    let url = `/consumption/${dispositivoSelecionado}`;
    const params = [];
    if (opts.dataInicio) params.push(`start=${opts.dataInicio}`);
    if (opts.dataFim) params.push(`end=${opts.dataFim}`);
    if (params.length) url += '?' + params.join('&');
    fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(rows => {
        setDados(rows.reverse());
        setAnomalias(rows.filter(r => r.consumo > 2.5));
        setCarregandoDados(false);
      });
  };

  useEffect(() => {
    obterDados();
  }, [dispositivoSelecionado]);

  // WebSocket para atualizações em tempo real
  useEffect(() => {
    wsRef.current = new window.WebSocket(`ws://${window.location.hostname}:4000`);
    wsRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "medicao" && msg.data.device_id === dispositivoSelecionado) {
        setDados(prev => {
          const atualizado = [...prev.slice(-49), msg.data];
          // Filtrar conforme intervalo e datas
          let filtrado = atualizado;
          const agora = Date.now();
          let intervaloMs = 3600000;
          switch (parametrosGrafico.intervalo) {
            case '24h': intervaloMs = 86400000; break;
            case '7d': intervaloMs = 604800000; break;
            case '30d': intervaloMs = 2592000000; break;
            default: intervaloMs = 3600000;
          }
          if (parametrosGrafico.dataInicio && parametrosGrafico.dataFim) {
            const inicio = new Date(parametrosGrafico.dataInicio).getTime();
            const fim = new Date(parametrosGrafico.dataFim).getTime();
            filtrado = atualizado.filter(d => {
              const t = new Date(d.timestamp).getTime();
              return t >= inicio && t <= fim;
            });
          } else {
            filtrado = atualizado.filter(d => agora - new Date(d.timestamp).getTime() <= intervaloMs);
          }
          setAnomalias(filtrado.filter(r => r.consumo > 2.5));
          return filtrado;
        });
      }
    };
    return () => wsRef.current?.close();
  }, [dispositivoSelecionado, parametrosGrafico]);

  // Cálculos para os painéis
  const consumoTotal = dados.reduce((acc, d) => acc + (d.consumo || 0), 0);
  const potenciaMax = Math.max(0, ...dados.map(d => d.potencia || 0));
  const ultimaMedicao = dados[dados.length - 1];
  const correnteAtual = ultimaMedicao?.corrente || 0;
  const estado = ultimaMedicao?.estado || 'ON';

  // Custos
  const custoHoje = consumoTotal * custoPorKwh;
  const custoMes = custoHoje * 30;
  const custoAno = custoHoje * 365;

  // Recomendações e automatizações (exemplo)
  const recomendacoes = [
    "Este dispositivo esteve ligado 12h ontem, considere desligá-lo antes para poupar 5,60€.",
    "Este dispositivo é responsável por 30% da sua fatura este mês."
  ];
  const automatizacoes = [
    { if: "Consumo > 2000 W", then: "Desligar Sonoff POW" },
    { if: "Hora = 7:00 AM", then: "Ligar Sonoff POW" }
  ];
  const alertas = [
    { tipo: "Potência", valor: "2.000 W", acao: "Enviar notificação" },
    { tipo: "Control towel", valor: "", acao: "Ação personalizada" }
  ];

  return (
    <div className={escuro ? "dashboard-main dark" : "dashboard-main"}>
      <TopBar />
      <div style={{textAlign:'right',margin:'8px 0'}}>
        <button onClick={() => setEscuro(d => !d)} style={{padding:'8px 16px',borderRadius:'8px',background:escuro?'#222':'#eaf6ff',color:escuro?'#fff':'#222',border:'none',cursor:'pointer'}}>
          {escuro ? '🌞 Modo claro' : '🌙 Modo escuro'}
        </button>
      </div>
      <div className="device-card">
        <div className="device-status">
          <span role="img" aria-label="power">{estado === 'ON' ? '🟦' : '⬜'}</span>
          <span>{estado}</span>
        </div>
        <div className="device-info">
          <div className="power">{ultimaMedicao?.potencia?.toFixed(2) || '--'} W</div>
          <div className="current">{correnteAtual?.toFixed(2) || '--'} A</div>
          <div style={{color:'#6b7a99',fontSize:'1rem'}}>{dispositivos.find(d => d.id === dispositivoSelecionado)?.nome || 'Dispositivo'}</div>
        </div>
      </div>
      <div className="section">
        <div className="section-title">Consumo</div>
        <EnergyChartBlock
          data={dados}
          anomalías={anomalias}
          costePorKwh={custoPorKwh}
          loading={carregandoDados}
          onRefresh={opts => {
            setParametrosGrafico(prev => ({ ...prev, ...opts }));
            obterDados(opts);
          }}
        />
      </div>
      <div className="section" style={{display:'flex',gap:'32px',flexWrap:'wrap'}}>
        <div className="cost-panel">
          <div className="section-title">Custo</div>
          <div>0,25 € €/kWh</div>
          <div>€{custoHoje.toFixed(2)} Hoje</div>
          <div>€{custoMes.toFixed(2)} Mês</div>
          <div>€{custoAno.toFixed(2)} Ano</div>
        </div>
        <div className="recommendations">
          <div className="section-title">Recomendações</div>
          {recomendacoes.map((r, i) => (
            <div className="recommendation-card" key={i}>{r}</div>
          ))}
        </div>
        <div className="automations">
          <div className="section-title">Automatizações</div>
          <button className="automation-card" style={{background:escuro?'#222':'#fff',border:'1px solid #e0e7ef',color:escuro?'#fff':'#222'}}>+ Criar nova automatização</button>
          {automatizacoes.map((a, i) => (
            <div className="automation-card" key={i} style={{background:escuro?'#222':'',color:escuro?'#fff':'#222'}}><b>SE</b> {a.if}<br /><b>ENTÃO</b> {a.then}</div>
          ))}
        </div>
        <div className="alerts">
          <div className="section-title">Alertas</div>
          {alertas.map((a, i) => (
            <div className="alert-card" key={i} style={{background:escuro?'#222':'',color:escuro?'#fff':'#222'}}><b>{a.tipo}</b> {a.valor} <br />{a.acao}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
