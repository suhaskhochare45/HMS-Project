import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth.service';
import { getDoctorPatients } from '../services/patient.service';
import { getAllAppointments, deleteAppointment, updateAppointment } from '../services/appointment.service';
import api from '../services/api';

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashboardMessage, setDashboardMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  
  // Forms
  const [prescriptionForm, setPrescriptionForm] = useState({ patientName: '', medicine: '' });
  const [editingAppt, setEditingAppt] = useState(null);
  
  // Modal State
  const [viewingPrescription, setViewingPrescription] = useState(null);

  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, ptRes, aptRes, meRes] = await Promise.all([
        api.get('/doctor/dashboard').catch(() => ({ data: 'Systems Ready' })),
        getDoctorPatients().catch(() => []),
        api.get('/doctor/appointments').catch(() => ({data: []})),
        api.get('/auth/me').catch(() => ({data: null}))
      ]);
      setDashboardMessage(dashRes.data || dashRes);
      setPatients(ptRes || []);
      setAppointments(aptRes.data || []);
      setMe(meRes.data);
    } catch (err) {
      console.error('Failed to fetch doctor data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/doctor/add-prescription?patientName=${encodeURIComponent(prescriptionForm.patientName)}&medicine=${encodeURIComponent(prescriptionForm.medicine)}`);
      showMessage(`Prescription issued to ${prescriptionForm.patientName}`);
      setPrescriptionForm({ patientName: '', medicine: '' });
      fetchData(); // Refresh patient dataset to instantly load newer prescriptions
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to add prescription', 'error');
    }
  };

  // Appointment Actions
  const handleDeleteAppt = async (id) => {
    if(!window.confirm('Delete this appointment?')) return;
    try {
      await deleteAppointment(id);
      showMessage('Appointment deleted successfully');
      fetchData();
    } catch (err) {
      showMessage('Failed to delete appointment', 'error');
    }
  };

  const startEditAppt = (appt) => setEditingAppt(appt);

  const handleUpdateAppt = async (e) => {
    e.preventDefault();
    try {
      await updateAppointment(editingAppt.id, editingAppt);
      showMessage('Appointment updated successfully');
      setEditingAppt(null);
      fetchData();
    } catch (err) {
      showMessage('Failed to update appointment', 'error');
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>ERS Doctor</h2>
        </div>
        <nav className="sidebar-nav">
          <a href="#overview" className="nav-item">Overview</a>
          <a href="#appointments" className="nav-item">Manage Appointments</a>
          <a href="#patients" className="nav-item active">My Patients</a>
        </nav>
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%' }}>Logout</button>
        </div>
      </aside>
      
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Welcome, Dr. {me ? me.name : 'Doctor'}</h1>
          <span className="badge badge-secondary">Medical Professional</span>
        </div>

        {message.text && (
          <div style={{ padding: '1rem', backgroundColor: message.type === 'error' ? 'var(--danger)' : 'var(--secondary)', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            {message.text}
          </div>
        )}

        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
            {/* Top Cards */}
            <div id="overview" style={{ display: 'grid', gap: '2rem' }}>
              <div className="card glass-panel" style={{ borderLeft: '4px solid var(--secondary)' }}>
                <h3 style={{ color: 'var(--text-light)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Status</h3>
                <p style={{ fontSize: '1.125rem', marginTop: '0.5rem', fontWeight: '600' }}>{dashboardMessage}</p>
              </div>
              <div className="card glass-panel" style={{ borderLeft: '4px solid var(--primary)' }}>
                <h3 style={{ color: 'var(--text-light)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Total Patients Assigned</h3>
                <p style={{ fontSize: '2rem', marginTop: '0.5rem', fontWeight: '700' }}>{patients.length}</p>
              </div>
            </div>

            {/* Add Prescription */}
            <div className="card glass-panel">
              <h3 style={{ marginBottom: '1.5rem' }}>Issue Prescription</h3>
              <form onSubmit={handlePrescriptionSubmit}>
                <div className="form-group">
                  <label className="form-label">Patient Name</label>
                  <input type="text" className="form-control" value={prescriptionForm.patientName} onChange={(e) => setPrescriptionForm({...prescriptionForm, patientName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Medicine</label>
                  <input type="text" className="form-control" value={prescriptionForm.medicine} onChange={(e) => setPrescriptionForm({...prescriptionForm, medicine: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>Issue Prescription</button>
              </form>
            </div>
        </div>

        {/* Appointments Table */}
        <div id="appointments" className="card glass-panel" style={{ padding: '0', marginTop: '2rem' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0 }}>All Active Appointments</h3>
          </div>
          <div className="table-container" style={{ border: 'none', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient Name</th>
                  <th>Doctor Name</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? appointments.map(apt => (
                  <tr key={apt.id}>
                    <td>{apt.id}</td>
                    {editingAppt && editingAppt.id === apt.id ? (
                      <td colSpan="4" style={{ padding: '1rem' }}>
                        <form onSubmit={handleUpdateAppt} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input type="text" className="form-control" value={editingAppt.patientName} onChange={(e)=>setEditingAppt({...editingAppt, patientName: e.target.value})} required />
                          <input type="text" className="form-control" value={editingAppt.doctorName} onChange={(e)=>setEditingAppt({...editingAppt, doctorName: e.target.value})} required />
                          <input type="date" className="form-control" value={editingAppt.appointmentDate} onChange={(e)=>setEditingAppt({...editingAppt, appointmentDate: e.target.value})} required />
                          <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Save</button>
                          <button type="button" className="btn btn-secondary" onClick={() => setEditingAppt(null)}>Cancel</button>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td style={{ fontWeight: '500' }}>{apt.patientName}</td>
                        <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{apt.doctorName}</td>
                        <td><span className="badge badge-secondary">{apt.appointmentDate}</span></td>
                        <td>
                          <button onClick={() => startEditAppt(apt)} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', marginRight: '0.5rem' }}>Edit</button>
                          <button onClick={() => handleDeleteAppt(apt.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No appointments scheduled.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Patients Table */}
        <div id="patients" className="card glass-panel" style={{ padding: '0', marginTop: '2rem' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0 }}>My Patients Assigned</h3>
          </div>
          <div className="table-container" style={{ border: 'none', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Disease</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.length > 0 ? patients.map(pt => (
                  <tr key={pt.id}>
                    <td>{pt.id}</td>
                    <td style={{ fontWeight: '500' }}>{pt.name}</td>
                    <td>{pt.age}</td>
                    <td><span className="badge badge-accent">{pt.disease}</span></td>
                    <td>
                      <button 
                         onClick={() => setViewingPrescription(pt)} 
                         className="btn btn-primary" 
                         style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      >
                         View Prescription
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No patients assigned in database yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Modal for Viewing Prescription */}
        {viewingPrescription && (
          <div style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 
          }}>
            <div className="card glass-panel" style={{ 
                minWidth: '400px', maxWidth: '500px',
                backgroundColor: 'var(--surface)', position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <button 
                 onClick={() => setViewingPrescription(null)} 
                 style={{ 
                     position: 'absolute', top: '1rem', right: '1rem', 
                     background: 'none', border: 'none', fontSize: '1.5rem', 
                     cursor: 'pointer', color: 'var(--text-light)', transition: 'color 0.2s'
                 }}
              >&times;</button>
              <h2 style={{ marginBottom: '1.5rem', marginTop: 0, color: 'var(--primary)' }}>Prescription Details</h2>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ display: 'block', color: 'var(--text-light)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient Name</strong>
                <span style={{ fontSize: '1.2rem', fontWeight: '500' }}>{viewingPrescription.name}</span>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <strong style={{ display: 'block', color: 'var(--text-light)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Prescribed Medicine / Notes</strong>
                <div style={{ 
                    padding: '1rem', backgroundColor: 'var(--background)', 
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', 
                    minHeight: '80px', color: viewingPrescription.prescription ? 'var(--text)' : 'var(--text-light)' 
                }}>
                  {viewingPrescription.prescription || "No prescription has been issued yet for this patient."}
                </div>
              </div>
              <button onClick={() => setViewingPrescription(null)} className="btn btn-secondary" style={{ width: '100%', padding: '0.75rem' }}>Close Window</button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default DoctorDashboard;
