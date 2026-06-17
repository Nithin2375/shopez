import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password };
      const res = await registerApi(payload);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(236,72,153,0.12) 0%, transparent 70%)' }}>
      <div style={{ width: '100%', maxWidth: 460, padding: '40px 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 14px',
            background: 'linear-gradient(135deg,#8B5CF6,#EC4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', fontWeight: 800, color: '#fff',
            boxShadow: '0 8px 30px rgba(236,72,153,0.4)',
          }}>S</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Create <span className="gradient-text">Account</span></h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: '0.95rem' }}>Join ShopEZ for exclusive deals</p>
        </div>

        <div className="card" style={{ padding: '36px 32px' }}>
          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="input-group">
              <label htmlFor="reg-name">Full Name</label>
              <div className="input-icon">
                <span className="icon">👤</span>
                <input id="reg-name" className="input" type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="reg-email">Email Address</label>
              <div className="input-icon">
                <span className="icon">✉</span>
                <input id="reg-email" className="input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="reg-password">Password</label>
              <div className="input-icon">
                <span className="icon">🔒</span>
                <input id="reg-password" className="input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required minLength="6" />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="reg-confirm">Confirm Password</label>
              <div className="input-icon">
                <span className="icon">🔒</span>
                <input id="reg-confirm" className="input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" required minLength="6" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 10 }}>
              {loading ? '⏳ Creating Account...' : '✨ Sign Up'}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
