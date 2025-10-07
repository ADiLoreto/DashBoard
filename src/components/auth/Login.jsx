import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const { login, register } = useContext(AuthContext);
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);

  const doSubmit = async () => {
    setError(null);
    if (mode === 'login') {
      const res = login({ username, password });
      if (!res.ok) setError(res.error);
    } else {
      const res = register({ username, password, displayName });
      if (!res.ok) setError(res.error);
      else setMode('login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
      <div style={{ background: 'var(--bg-light)', padding: 24, borderRadius: 12, width: 420 }}>
        <h2>{mode === 'login' ? 'Accedi' : 'Registrati'}</h2>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {mode === 'register' && (
          <input placeholder="Nome visualizzato" value={displayName} onChange={e => setDisplayName(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        )}
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={doSubmit} style={{ padding: '8px 12px', background: 'var(--accent-cyan)', color: 'var(--bg-dark)' }}>{mode === 'login' ? 'Accedi' : 'Registrati'}</button>
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>{mode === 'login' ? 'Crea account' : 'Ho già un account'}</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
