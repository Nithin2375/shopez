import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login as loginApi } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi(form);
      login(res.data.user, res.data.token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 70%)' }}>
      <div style={{ width: '100%', maxWidth: 460, padding: '0 24px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 14px',
            background: 'linear-gradient(135deg,#8B5CF6,#EC4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', fontWeight: 800, color: '#fff',
            boxShadow: '0 8px 30px rgba(139,92,246,0.4)',
          }}>S</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Welcome <span className="gradient-text">Back</span></h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: '0.95rem' }}>Sign in to your ShopEZ account</p>
        </div>

        <div className="card" style={{ padding: '36px 32px' }}>
          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="input-group">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-icon">
                <span className="icon">✉</span>
                <input id="login-email" className="input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-icon">
                <span className="icon">🔒</span>
                <input id="login-password" className="input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <a href="#" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 500 }}>Forgot password?</a>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? '⏳ Signing in...' : '🔑 Sign In'}
            </button>
          </form>

          <div className="divider" />

          {/* Demo credentials */}
          <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 20, fontSize: '0.82rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 8 }}>Demo Credentials</div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 600, color: 'var(--text)' }}>User Account:</div>
              <div style={{ color: 'var(--text-muted)' }}>Email: <code style={{ color: 'var(--text)' }}>demo@shopez.com</code></div>
              <div style={{ color: 'var(--text-muted)' }}>Password: <code style={{ color: 'var(--text)' }}>demo1234</code></div>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text)' }}>Admin Account:</div>
              <div style={{ color: 'var(--text-muted)' }}>Email: <code style={{ color: 'var(--text)' }}>admin@shopez.com</code></div>
              <div style={{ color: 'var(--text-muted)' }}>Password: <code style={{ color: 'var(--text)' }}>admin123</code></div>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign Up Free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
