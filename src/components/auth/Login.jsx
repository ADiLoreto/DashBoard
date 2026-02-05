import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const doSubmit = async () => {
    setError(null);
    setLoading(true);
    
    try {
      if (mode === 'login') {
        const res = await signIn(email, password);
        if (!res.ok) setError(res.error);
      } else {
        const res = await signUp(email, password, username);
        if (!res.ok) {
          setError(res.error);
        } else {
          setMode('login');
          setEmail('');
          setPassword('');
          setUsername('');
          setError('Registrazione completata! Controlla la tua email. Ora accedi.');
        }
      }
    } catch (err) {
      setError(err.message || 'Errore durante l\'autenticazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
      <div style={{ background: 'var(--bg-light)', padding: 24, borderRadius: 12, width: 420 }}>
        <h2>{mode === 'login' ? 'Accedi' : 'Registrati'}</h2>
        {error && <div style={{ color: mode === 'register' && mode === 'login' ? 'green' : 'red', marginBottom: 12 }}>{error}</div>}
        {mode === 'register' && (
          <input 
            placeholder="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            disabled={loading}
            style={{ width: '100%', padding: 8, marginBottom: 8 }} 
          />
        )}
        <input 
          placeholder="Email" 
          type="email"
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          disabled={loading}
          style={{ width: '100%', padding: 8, marginBottom: 8 }} 
        />
        <input 
          placeholder="Password" 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          disabled={loading}
          style={{ width: '100%', padding: 8, marginBottom: 8 }} 
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={doSubmit} 
            disabled={loading}
            style={{ padding: '8px 12px', background: 'var(--accent-cyan)', color: 'var(--bg-dark)', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Caricamento...' : (mode === 'login' ? 'Accedi' : 'Registrati')}
          </button>
          <button 
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }} 
            disabled={loading}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {mode === 'login' ? 'Crea account' : 'Ho già un account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
