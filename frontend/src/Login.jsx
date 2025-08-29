
// =============================================================
// Ficheiro: Login.jsx
// Descrição: Componente de autenticação do frontend React.
// Utilidade: Permite ao utilizador iniciar sessão ou registar-se no sistema IoT.
// =============================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarRegisto, setMostrarRegisto] = useState(false);
  const [nome, setNome] = useState('');
  const [erroRegisto, setErroRegisto] = useState('');
  const [sucessoRegisto, setSucessoRegisto] = useState('');
  const navigate = useNavigate();

  const validarEmail = (email) => {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    if (!validarEmail(email)) {
      setErro('Email inválido');
      return;
    }
    if (password.length < 4) {
      setErro('A palavra-passe deve ter pelo menos 4 caracteres');
      return;
    }
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        setErro(data.error || 'Erro ao iniciar sessão');
      }
    } catch (err) {
      setErro('Erro de ligação');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErroRegisto('');
    setSucessoRegisto('');
    if (!nome.trim()) {
      setErroRegisto('O nome é obrigatório');
      return;
    }
    if (!validarEmail(email)) {
      setErroRegisto('Email inválido');
      return;
    }
    if (password.length < 4) {
      setErroRegisto('A palavra-passe deve ter pelo menos 4 caracteres');
      return;
    }
    try {
      const res = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, password })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSucessoRegisto('Utilizador criado. Agora pode iniciar sessão.');
        setMostrarRegisto(false);
        setNome('');
        setEmail('');
        setPassword('');
      } else {
        setErroRegisto(data.error || 'Erro ao criar utilizador');
      }
    } catch (err) {
      setErroRegisto('Erro de ligação');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {!mostrarRegisto ? (
          <>
            <h2>Iniciar sessão</h2>
            <form onSubmit={handleSubmit}>
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              <input type="password" placeholder="Palavra-passe" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="submit">Entrar</button>
            </form>
            <button className="alt-btn" onClick={() => setMostrarRegisto(true)}>Criar conta</button>
            {erro && <div className="error">{erro}</div>}
            {sucessoRegisto && <div className="success">{sucessoRegisto}</div>}
          </>
        ) : (
          <>
            <h2>Registo</h2>
            <form onSubmit={handleSignup}>
              <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} required />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              <input type="password" placeholder="Palavra-passe" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="submit">Registar</button>
            </form>
            <button className="alt-btn" onClick={() => setMostrarRegisto(false)}>Voltar ao login</button>
            {erroRegisto && <div className="error">{erroRegisto}</div>}
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
