import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth.service';
import { getAllPatients, deletePatient } from '../services/patient.service';
import api from '../services/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [me, setMe] = useState(null);
  
  const [activeTab, setActiveTab] = useState('users');
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const usersRes = await api.get('/admin/all-users').catch(() => ({data: []}));
      setUsers(usersRes.data);
      
      const rolesRes = await api.get('/admin/roles').catch(() => ({data: []}));
      setRoles(rolesRes.data);
      
      const permsRes = await api.get('/admin/permissions').catch(() => ({data: []}));
      setPermissions(permsRes.data);

      const ptRes = await api.get('/admin/patients').catch(() => ({data: []}));
      setPatients(ptRes.data || []);

      const meRes = await api.get('/auth/me').catch(() => ({data: null}));
      setMe(meRes.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
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

  // --- User CRUD ---
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/update-role/${userId}?newRole=${newRole}`);
      showMessage('User role updated successfully');
      fetchData();
    } catch (err) {
      showMessage('Failed to update role', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if(!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await api.delete(`/admin/delete-user/${id}`);
      showMessage('User deleted successfully');
      fetchData();
    } catch (err) {
      showMessage('Failed to delete user', 'error');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/update-user/${editingUser.id}`, {
        name: editingUser.name,
        email: editingUser.email
      });
      showMessage('User details updated successfully');
      setEditingUser(null);
      fetchData();
    } catch (err) {
      showMessage('Failed to update user', 'error');
    }
  };

  // --- Patient Logic ---
  const handleDeletePatientAdmin = async (id) => {
    if(!window.confirm('Delete this patient from the master database?')) return;
    try {
      await deletePatient(id);
      showMessage('Patient deleted successfully');
      fetchData();
    } catch (err) {
      showMessage('Failed to delete. Enable "MANAGE_PATIENTS" for ADMIN in the Roles tab first!', 'error');
    }
  };

  // --- Role Permissions ---
  const handlePermissionToggle = async (roleName, currentPermissions, toggledPermission) => {
    const hasPermission = currentPermissions.some(p => p.name === toggledPermission);
    let newPermNames = [];
    if (hasPermission) {
      newPermNames = currentPermissions.filter(p => p.name !== toggledPermission).map(p => p.name);
    } else {
      newPermNames = [...currentPermissions.map(p => p.name), toggledPermission];
    }

    try {
      await api.put(`/admin/roles/${roleName}/permissions`, newPermNames);
      showMessage(`Permissions updated for ${roleName}`);
      fetchData();
    } catch (err) {
       showMessage('Failed to update role permissions', 'error');
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>ERS System</h2>
        </div>
        <nav className="sidebar-nav">
          <a href="#users" className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('users'); }}>Users Management</a>
          <a href="#roles" className={`nav-item ${activeTab === 'roles' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('roles'); }}>Roles & Permissions</a>
          <a href="#patients" className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('patients'); }}>Patients Database</a>
        </nav>
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%' }}>Logout</button>
        </div>
      </aside>
      
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Welcome, {me ? me.name : 'Admin'}</h1>
          <span className="badge badge-primary">Super Admin</span>
        </div>

        {message.text && (
          <div style={{ padding: '1rem', backgroundColor: message.type === 'error' ? 'var(--danger)' : 'var(--success)', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            {message.text}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
            <div className="card glass-panel" style={{ padding: '0' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0 }}>Registered System Users</h3>
              </div>
              <div className="table-container" style={{ border: 'none', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        {editingUser && editingUser.id === user.id ? (
                          <td colSpan="4">
                            <form onSubmit={handleUpdateUser} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 0' }}>
                              <input type="text" className="form-control" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} required />
                              <input type="email" className="form-control" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} required />
                              <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>Save</button>
                              <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)} style={{ padding: '0.4rem 1rem' }}>Cancel</button>
                            </form>
                          </td>
                        ) : (
                          <>
                            <td style={{ fontWeight: '500' }}>{user.name}</td>
                            <td style={{ color: 'var(--text-light)' }}>{user.email}</td>
                            <td>
                              <select 
                                className="form-control" 
                                style={{ padding: '0.4rem', width: '130px' }}
                                value={user.role?.name || ''} 
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              >
                                {roles.length > 0 ? roles.map(r => (
                                   <option key={r.name} value={r.name}>{r.name}</option>
                                )) : (
                                   <>
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="DOCTOR">DOCTOR</option>
                                    <option value="RECEPTIONIST">RECEPTIONIST</option>
                                   </>
                                )}
                              </select>
                            </td>
                            <td>
                              <button onClick={() => setEditingUser(user)} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', marginRight: '0.5rem' }}>Edit</button>
                              <button onClick={() => handleDeleteUser(user.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Delete</button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
            <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              <div className="card glass-panel" style={{ gridColumn: '1 / -1', padding: '1rem', backgroundColor: 'rgba(79,70,229,0.05)' }}>
                  <p style={{ margin: 0, fontWeight: 500, color: 'var(--primary)', textAlign: 'center' }}>
                     Click any toggle to INSTANTLY grant or revoke permissions across the entire application ecosystem. 
                  </p>
              </div>
              {roles.map(role => (
                 <div key={role.name} className="card glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem', color: 'var(--primary)', letterSpacing: '1px' }}>
                       ROLE: {role.name}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                      {permissions.map(perm => {
                          const isAssigned = role.permissions?.some(p => p.name === perm.name);
                          return (
                            <label key={perm.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '0.75rem', backgroundColor: isAssigned ? 'var(--bg-lighter)' : 'transparent', borderRadius: 'var(--radius-md)', transition: 'background-color 0.2s', border: isAssigned ? '1px solid var(--secondary)' : '1px solid var(--border)' }}>
                                <input 
                                  type="checkbox" 
                                  checked={isAssigned || false}
                                  onChange={() => handlePermissionToggle(role.name, role.permissions || [], perm.name)}
                                  style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '0.95rem', fontWeight: isAssigned ? '600' : '400', color: isAssigned ? 'var(--text)' : 'var(--text-light)' }}>
                                   {perm.name.replace(/_/g, ' ')}
                                </span>
                            </label>
                          );
                      })}
                    </div>
                 </div>
              ))}
            </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
            <div className="card glass-panel" style={{ padding: '0' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0 }}>Master Patient Database</h3>
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
                            onClick={() => handleDeletePatientAdmin(pt.id)} 
                            className="btn btn-danger" 
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No patients found in the database.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
