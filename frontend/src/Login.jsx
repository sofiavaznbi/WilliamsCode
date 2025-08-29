
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [nombre, setNombre] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError('Email no válido');
      return;
    }
    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
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
        setError(data.error || 'Error de login');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess('');
    if (!nombre.trim()) {
      setSignupError('El nombre es obligatorio');
      return;
    }
    if (!validateEmail(email)) {
      setSignupError('Email no válido');
      return;
    }
    if (password.length < 4) {
      setSignupError('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    try {
      const res = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSignupSuccess('Usuario creado. Ahora puedes iniciar sesión.');
        setShowSignup(false);
        setNombre('');
        setEmail('');
        setPassword('');
      } else {
        setSignupError(data.error || 'Error al crear usuario');
      }
    } catch (err) {
      setSignupError('Error de conexión');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {!showSignup ? (
          <>
            <h2>Iniciar sesión</h2>
            <form onSubmit={handleSubmit}>
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="submit">Entrar</button>
            </form>
            <button className="alt-btn" onClick={() => setShowSignup(true)}>Crear cuenta</button>
            {error && <div className="error">{error}</div>}
            {signupSuccess && <div className="success">{signupSuccess}</div>}
          </>
        ) : (
          <>
            <h2>Registro</h2>
            <form onSubmit={handleSignup}>
              <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="submit">Registrarse</button>
            </form>
            <button className="alt-btn" onClick={() => setShowSignup(false)}>Volver a login</button>
            {signupError && <div className="error">{signupError}</div>}
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
