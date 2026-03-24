import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth.service';
import { getReceptionistPatients, addPatient, deletePatient } from '../services/patient.service';
import { bookAppointment, getAllAppointments, deleteAppointment, updateAppointment } from '../services/appointment.service';
import api from '../services/api';

const ReceptionistDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  
  // Forms
  const [patientForm, setPatientForm] = useState({ name: '', age: '', disease: '' });
  const [appointmentForm, setAppointmentForm] = useState({ patientName: '', doctorName: '', appointmentDate: '' });
  
  // Edit State
  const [editingAppt, setEditingAppt] = useState(null);

  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ptData, aptData, docsData, meRes] = await Promise.all([
        getReceptionistPatients().catch(() => []),
        getAllAppointments().catch(() => []),
        api.get('/receptionist/doctors').catch(() => ({data: []})),
        api.get('/auth/me').catch(() => ({data: null}))
      ]);
      setPatients(ptData || []);
      setAppointments(aptData || []);
      setDoctors(docsData?.data || []);
      setMe(meRes?.data || null);
    } catch (err) {
      console.error('Failed to fetch data', err);
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

  // --- Patient Logic ---
  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      await addPatient(patientForm);
      showMessage('Patient added successfully');
      setPatientForm({ name: '', age: '', disease: '' });
      fetchData();
    } catch (err) {
      showMessage('Failed to add patient', 'error');
    }
  };

  const handleDeletePatient = async (id) => {
    try {
      await deletePatient(id);
      showMessage('Patient deleted successfully');
      fetchData();
    } catch (err) {
      showMessage('Failed to delete patient', 'error');
    }
  };

  // --- Appointment Logic ---
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await bookAppointment(appointmentForm);
      showMessage('Appointment booked successfully');
      setAppointmentForm({ patientName: '', doctorName: '', appointmentDate: '' });
      fetchData();
    } catch (err) {
      showMessage('Failed to book appointment', 'error');
    }
  };

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

  // When Edit is clicked, populate the form with appointment data
  const startEditAppt = (appt) => {
    setEditingAppt(appt);
  };

  // Handle Save Edit
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
          <h2>ERS Reception</h2>
        </div>
        <nav className="sidebar-nav">
          <a href="#patients" className="nav-item">Patients Database</a>
          <a href="#appointments" className="nav-item">Manage Appointments</a>
        </nav>
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%' }}>Logout</button>
        </div>
      </aside>
      
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Welcome, {me ? me.name : 'Receptionist'}</h1>
          <span className="badge badge-accent">Front Desk</span>
        </div>

        {message.text && (
          <div style={{ padding: '1rem', backgroundColor: message.type === 'error' ? 'var(--danger)' : 'var(--secondary)', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            {message.text}
          </div>
        )}

        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
          {/* Add Patient Form */}
          <div className="card glass-panel">
            <h3 style={{ marginBottom: '1.5rem' }}>Register New Patient</h3>
            <form onSubmit={handleAddPatient}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" value={patientForm.name} onChange={(e) => setPatientForm({...patientForm, name: e.target.value})} required />
              </div>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 2fr' }}>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input type="number" className="form-control" value={patientForm.age} onChange={(e) => setPatientForm({...patientForm, age: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Disease/Condition</label>
                  <input type="text" className="form-control" value={patientForm.disease} onChange={(e) => setPatientForm({...patientForm, disease: e.target.value})} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Add Patient</button>
            </form>
          </div>

          {/* Book Appointment Form */}
          <div className="card glass-panel">
            <h3 style={{ marginBottom: '1.5rem' }}>Book Appointment</h3>
            <form onSubmit={handleBookAppointment}>
              <div className="form-group">
                <label className="form-label">Patient Name</label>
                <select className="form-control" value={appointmentForm.patientName} onChange={(e) => setAppointmentForm({...appointmentForm, patientName: e.target.value})} required>
                  <option value="" disabled>Select Registered Patient</option>
                  {patients.map(p => <option key={p.id} value={p.name}>{p.name} (ID: {p.id})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Doctor Name</label>
                <select className="form-control" value={appointmentForm.doctorName} onChange={(e) => setAppointmentForm({...appointmentForm, doctorName: e.target.value})} required>
                  <option value="" disabled>Select Available Doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.name}>Dr. {d.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" value={appointmentForm.appointmentDate} onChange={(e) => setAppointmentForm({...appointmentForm, appointmentDate: e.target.value})} required />
              </div>
              <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none' }}>
                Book Appointment
              </button>
            </form>
          </div>
        </div>

        {/* Appointments Table */}
        <div id="appointments" className="card glass-panel" style={{ padding: '0', marginTop: '2rem' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0 }}>All Appointments</h3>
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
                    
                    {/* Inline Editing */}
                    {editingAppt && editingAppt.id === apt.id ? (
                      <td colSpan="4" style={{ padding: '1rem' }}>
                        <form onSubmit={handleUpdateAppt} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <select className="form-control" value={editingAppt.patientName} onChange={(e)=>setEditingAppt({...editingAppt, patientName: e.target.value})} required>
                            <option value={editingAppt.patientName}>{editingAppt.patientName}</option>
                            {patients.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                          </select>
                          <select className="form-control" value={editingAppt.doctorName} onChange={(e)=>setEditingAppt({...editingAppt, doctorName: e.target.value})} required>
                            <option value={editingAppt.doctorName}>Dr. {editingAppt.doctorName}</option>
                            {doctors.map(d => <option key={d.id} value={d.name}>Dr. {d.name}</option>)}
                          </select>
                          <input type="date" className="form-control" value={editingAppt.appointmentDate} onChange={(e)=>setEditingAppt({...editingAppt, appointmentDate: e.target.value})} required />
                          <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Save</button>
                          <button type="button" className="btn btn-secondary" onClick={() => setEditingAppt(null)}>Cancel</button>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td style={{ fontWeight: '500' }}>{apt.patientName}</td>
                        <td>{apt.doctorName}</td>
                        <td><span className="badge badge-primary">{apt.appointmentDate}</span></td>
                        <td>
                          <button onClick={() => startEditAppt(apt)} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', marginRight: '0.5rem' }}>Edit</button>
                          <button onClick={() => handleDeleteAppt(apt.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No appointments found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Patients Table */}
        <div id="patients" className="card glass-panel" style={{ padding: '0', marginTop: '2rem' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0 }}>Registered Patients</h3>
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
                      <button onClick={() => handleDeletePatient(pt.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No patients found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default ReceptionistDashboard;
