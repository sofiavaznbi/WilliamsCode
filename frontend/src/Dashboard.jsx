// =============================================================
// Ficheiro: Dashboard.jsx
// Descrição: Componente principal do painel de controlo do frontend React.
// Utilidade: Mostra dispositivos, gráficos de consumo, recomendações, automatizações e alertas.
// =============================================================

import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import Toast from "./components/Toast";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import EnergyChartBlock from "./components/EnergyChartBlock";
import './styles/dashboard.css';

const custoPorKwh = 0.18;

const traducoes = {
  pt: {
    consumo: "Consumo",
    exportarCSV: "Exportar CSV",
    exportarPNG: "Exportar PNG",
    custo: "Custo",
    hoje: "Hoje",
    mes: "Mês",
    ano: "Ano",
    recomendacoes: "Recomendações",
    automatizacoes: "Automatizações",
    criarAutomatizacao: "+ Criar nova automatização",
    alertas: "Alertas",
    pesquisar: "Pesquisar dispositivo...",
    todos: "Todos",
    ligados: "Ligados",
    desligados: "Desligados",
    estadoConexao: "Estado da conexão",
    conectado: "🟢 Conectado",
    conectando: "🟡 A conectar...",
    reconectando: "🟠 A reconectar...",
    desconectado: "🔴 Desconectado",
    erro: "🔴 Erro",
    modoClaro: "🌞 Modo claro",
    modoEscuro: "🌙 Modo escuro",
    idioma: "Idioma",
    portugues: "Português",
    ingles: "Inglês"
  },
  en: {
    consumo: "Consumption",
    exportarCSV: "Export CSV",
    exportarPNG: "Export PNG",
    custo: "Cost",
    hoje: "Today",
    mes: "Month",
    ano: "Year",
    recomendacoes: "Recommendations",
    automatizacoes: "Automations",
    criarAutomatizacao: "+ Create new automation",
    alertas: "Alerts",
    pesquisar: "Search device...",
    todos: "All",
    ligados: "On",
    desligados: "Off",
    estadoConexao: "Connection status",
    conectado: "🟢 Connected",
    conectando: "🟡 Connecting...",
    reconectando: "🟠 Reconnecting...",
    desconectado: "🔴 Disconnected",
    erro: "🔴 Error",
    modoClaro: "🌞 Light mode",
    modoEscuro: "🌙 Dark mode",
    idioma: "Language",
    portugues: "Portuguese",
    ingles: "English"
  }
};

const Dashboard = () => {
  // Estado para mostrar/ocultar paneles
  const [mostrarConsumo, setMostrarConsumo] = useState(true);
  const [mostrarCusto, setMostrarCusto] = useState(true);
  const [mostrarRecomendacoes, setMostrarRecomendacoes] = useState(true);
  const [mostrarAutomatizacoes, setMostrarAutomatizacoes] = useState(true);
  const [mostrarAlertas, setMostrarAlertas] = useState(true);
  const [idioma, setIdioma] = useState('pt');
  const [escuro, setEscuro] = useState(false);
  const [dispositivos, setDispositivos] = useState([]);
  const [dispositivoSelecionado, setDispositivoSelecionado] = useState(null);
  const [busca, setBusca] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [carregandoDispositivos, setCarregandoDispositivos] = useState(true);
  const [dados, setDados] = useState([]);
  const [anomalias, setAnomalias] = useState([]);
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [parametrosGrafico, setParametrosGrafico] = useState({ intervalo: '1h', dataInicio: '', dataFim: '' });
  const wsRef = useRef(null);
  const [toast, setToast] = useState(null); // Notificação em tempo real
  const [wsStatus, setWsStatus] = useState('connecting'); // Estado de conexão WebSocket

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

  // Função para exportar dados como CSV
  const exportarCSV = () => {
    if (!dados.length) return;
    const cabecalho = Object.keys(dados[0]).join(';');
    const linhas = dados.map(d => Object.values(d).join(';'));
    const conteudo = [cabecalho, ...linhas].join('\n');
    const blob = new Blob([conteudo], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consumo_${dispositivoSelecionado}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Função para exportar gráfico como PNG
  const exportarPNG = async () => {
    const grafico = document.querySelector('.energy-chart-block');
    if (!grafico) return;
    const canvas = await html2canvas(grafico);
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `grafico_${dispositivoSelecionado}_${new Date().toISOString().slice(0,10)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  useEffect(() => {
    let reconnectAttempts = 0;
    let ws;
    const connectWS = () => {
      ws = new window.WebSocket(`ws://${window.location.hostname}:4000`);
      wsRef.current = ws;
      setWsStatus('connecting');
      ws.onopen = () => setWsStatus('connected');
      ws.onclose = () => {
        setWsStatus('disconnected');
        // Reconexão automática
        if (reconnectAttempts < 10) {
          setTimeout(connectWS, 2000 * (reconnectAttempts + 1));
          reconnectAttempts++;
          setWsStatus('reconnecting');
        }
      };
      ws.onerror = () => setWsStatus('error');
      ws.onmessage = (event) => {
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
            // Notificação de anomalia
            if (msg.data.consumo > 2.5) {
              setToast({ message: `Anomalia detectada: Consumo elevado (${msg.data.consumo} kWh)`, type: 'error' });
            }
            setAnomalias(filtrado.filter(r => r.consumo > 2.5));
            return filtrado;
          });
        }
      };
    };
    connectWS();
    return () => ws?.close();
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

  const deviceListMemo = React.useMemo(() =>
    dispositivos
      .filter(d => d.nome?.toLowerCase().includes(busca.toLowerCase()))
      .filter(d => filtroEstado === 'todos' || (d.estado || 'ON') === filtroEstado)
      .map(d => (
        <button key={d.id} onClick={() => setDispositivoSelecionado(d.id)} style={{padding:'12px 18px',borderRadius:'8px',border:d.id===dispositivoSelecionado?'2px solid #0077ff':'1px solid #ccc',background:d.id===dispositivoSelecionado?'#eaf6ff':'#fff',color:'#222',fontWeight:'bold',cursor:'pointer'}}>
          {d.nome || 'Dispositivo'} <span style={{fontSize:'0.9rem',color:'#888'}}>({d.estado || 'ON'})</span>
        </button>
      ))
  , [dispositivos, busca, filtroEstado, dispositivoSelecionado]);

  return (
    <div className={escuro ? "dashboard-main dark" : "dashboard-main"} style={{display:'flex',flexDirection:'row',minHeight:'100vh'}}>
      <Sidebar escuro={escuro} setEscuro={setEscuro} handleLogout={() => { localStorage.removeItem('token'); window.location.reload(); }} />
      <div style={{position:'absolute',top:8,right:16,zIndex:1000}}>
        <label style={{fontWeight:'bold',marginRight:'8px'}}>{traducoes[idioma].idioma}:</label>
        <select value={idioma} onChange={e => setIdioma(e.target.value)} style={{padding:'4px 8px',borderRadius:'6px',border:'1px solid #0077ff'}}>
          <option value="pt">{traducoes[idioma].portugues}</option>
          <option value="en">{traducoes[idioma].ingles}</option>
        </select>
      </div>
      <div style={{flex:1,padding:'0 0 0 8px'}}>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <TopBar />
        <div style={{margin:'8px 0',textAlign:'left'}}>
          <span style={{padding:'6px 16px',borderRadius:'8px',background:'#eaf6ff',color:'#222',fontWeight:'bold'}}>
            {traducoes[idioma].estadoConexao}: {
              wsStatus === 'connected' ? traducoes[idioma].conectado :
              wsStatus === 'connecting' ? traducoes[idioma].conectando :
              wsStatus === 'reconnecting' ? traducoes[idioma].reconectando :
              wsStatus === 'disconnected' ? traducoes[idioma].desconectado :
              wsStatus === 'error' ? traducoes[idioma].erro : wsStatus
            }
          </span>
        </div>
  {/* O botão de alternância de tema agora está na Sidebar */}
  <div className="device-filter-panel" style={{margin:'16px 0',display:'flex',gap:'16px',alignItems:'center',flexWrap:'wrap'}}>
  <input type="text" placeholder={traducoes[idioma].pesquisar} value={busca} onChange={e => setBusca(e.target.value)} style={{padding:'8px',borderRadius:'6px',border:'1px solid #ccc'}} title={idioma==='pt' ? 'Filtre dispositivos por nome' : 'Filter devices by name'} />
  <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={{padding:'8px',borderRadius:'6px',border:'1px solid #ccc'}} title={idioma==='pt' ? 'Filtre dispositivos por estado' : 'Filter devices by state'}>
          <option value="todos">{traducoes[idioma].todos}</option>
          <option value="ON">{traducoes[idioma].ligados}</option>
          <option value="OFF">{traducoes[idioma].desligados}</option>
        </select>
      </div>
        <div className="device-list-panel" style={{marginBottom:'16px',display:'flex',gap:'16px',flexWrap:'wrap'}} title={idioma==='pt' ? 'Selecione um dispositivo para ver detalhes' : 'Select a device to view details'}>
          {deviceListMemo}
        </div>
  <div className="device-card" title={idioma==='pt' ? 'Informações detalhadas do dispositivo selecionado' : 'Detailed info of selected device'}>
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
  <div className="panel-controls" style={{margin:'16px 0',display:'flex',gap:'12px',flexWrap:'wrap'}} title={idioma==='pt' ? 'Personalize os painéis visíveis' : 'Customize visible panels'}>
  <label><input type="checkbox" checked={mostrarConsumo} onChange={e => setMostrarConsumo(e.target.checked)} /> {traducoes[idioma].consumo}</label>
  <label><input type="checkbox" checked={mostrarCusto} onChange={e => setMostrarCusto(e.target.checked)} /> {traducoes[idioma].custo}</label>
  <label><input type="checkbox" checked={mostrarRecomendacoes} onChange={e => setMostrarRecomendacoes(e.target.checked)} /> {traducoes[idioma].recomendacoes}</label>
  <label><input type="checkbox" checked={mostrarAutomatizacoes} onChange={e => setMostrarAutomatizacoes(e.target.checked)} /> {traducoes[idioma].automatizacoes}</label>
  <label><input type="checkbox" checked={mostrarAlertas} onChange={e => setMostrarAlertas(e.target.checked)} /> {traducoes[idioma].alertas}</label>
      </div>
        {mostrarConsumo && (
          <div className="section">
            <div className="section-title" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span>{traducoes[idioma].consumo}</span>
              <span>
                <button onClick={exportarCSV} style={{marginRight:'8px',padding:'6px 12px',borderRadius:'6px',border:'1px solid #0077ff',background:'#eaf6ff',color:'#0077ff',fontWeight:'bold',cursor:'pointer'}} title={idioma==='pt' ? 'Exporta os dados de consumo em formato CSV' : 'Export consumption data as CSV'}>{traducoes[idioma].exportarCSV}</button>
                <button onClick={exportarPNG} style={{padding:'6px 12px',borderRadius:'6px',border:'1px solid #0077ff',background:'#eaf6ff',color:'#0077ff',fontWeight:'bold',cursor:'pointer'}} title={idioma==='pt' ? 'Exporta o gráfico de consumo como imagem PNG' : 'Export consumption chart as PNG image'}>{traducoes[idioma].exportarPNG}</button>
              </span>
            </div>
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
        )}
        <div className="section" style={{display:'flex',gap:'32px',flexWrap:'wrap'}}>
          {mostrarCusto && (
            <div className="cost-panel">
              <div className="section-title">{traducoes[idioma].custo}</div>
              <div>0,25 € €/kWh</div>
              <div>€{custoHoje.toFixed(2)} {traducoes[idioma].hoje}</div>
              <div>€{custoMes.toFixed(2)} {traducoes[idioma].mes}</div>
              <div>€{custoAno.toFixed(2)} {traducoes[idioma].ano}</div>
            </div>
          )}
          {mostrarRecomendacoes && (
            <div className="recommendations">
              <div className="section-title">{traducoes[idioma].recomendacoes}</div>
              {recomendacoes.map((r, i) => (
                <div className="recommendation-card" key={i}>{r}</div>
              ))}
            </div>
          )}
          {mostrarAutomatizacoes && (
            <div className="automations">
              <div className="section-title">{traducoes[idioma].automatizacoes}</div>
              <button className="automation-card" style={{background:escuro?'#222':'#fff',border:'1px solid #e0e7ef',color:escuro?'#fff':'#222'}}>{traducoes[idioma].criarAutomatizacao}</button>
              {automatizacoes.map((a, i) => (
                <div className="automation-card" key={i} style={{background:escuro?'#222':'',color:escuro?'#fff':'#222'}}><b>SE</b> {a.if}<br /><b>ENTÃO</b> {a.then}</div>
              ))}
            </div>
          )}
          {mostrarAlertas && (
            <div className="alerts">
              <div className="section-title">{traducoes[idioma].alertas}</div>
              {alertas.map((a, i) => (
                <div className="alert-card" key={i} style={{background:escuro?'#222':'',color:escuro?'#fff':'#222'}}><b>{a.tipo}</b> {a.valor} <br />{a.acao}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
