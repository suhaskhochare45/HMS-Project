import api from './api';

export const getAllPatients = async () => {
  const response = await api.get('/patient/all');
  return response.data;
};

export const getReceptionistPatients = async () => {
  const response = await api.get('/receptionist/patients');
  return response.data;
};

export const getDoctorPatients = async () => {
  const response = await api.get('/doctor/patients');
  return response.data;
};

export const addPatient = async (patientData) => {
  const response = await api.post('/patient/add', patientData);
  return response.data;
};

export const updatePatient = async (id, patientData) => {
  const response = await api.put(`/patient/update/${id}`, patientData);
  return response.data;
};

export const deletePatient = async (id) => {
  const response = await api.delete(`/patient/delete/${id}`);
  return response.data;
};
