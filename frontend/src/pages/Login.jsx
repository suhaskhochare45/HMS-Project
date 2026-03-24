import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const token = await login(email, password);
      // The backend returns a raw String JWT token
      localStorage.setItem('token', token);
      
      const decoded = jwtDecode(token);
      // Let's assume the token payload has { sub: 'email', role: 'ADMIN' }
      // The backend puts role as a claim (Spring Boot often puts it as authorities or a custom field)
      // Since our JwtUtil custom sets the role claim, let's extract it.
      // Wait, we need to handle if role is stored directly or inside a list.
      const userRole = decoded.role || decoded.authorities;
      localStorage.setItem('role', userRole);

      if (userRole === 'ADMIN') navigate('/admin');
      else if (userRole === 'DOCTOR') navigate('/doctor');
      else if (userRole === 'RECEPTIONIST') navigate('/receptionist');
      else navigate('/login');
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card glass-panel">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '1.75rem' }}>
          ERS Portal
        </h2>
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger)', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-light)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
