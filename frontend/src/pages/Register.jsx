import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/auth.service';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'RECEPTIONIST'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      await register(formData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card glass-panel" style={{ maxWidth: '450px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '1.5rem' }}>
          Create an Account
        </h2>
        
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger)', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--secondary)', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              name="name"
              className="form-control" 
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              name="email"
              className="form-control" 
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              name="password"
              className="form-control" 
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Role</label>
            <select 
              name="role" 
              className="form-control" 
              value={formData.role} 
              onChange={handleChange}
            >
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="DOCTOR">Doctor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }} disabled={loading}>
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-light)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
