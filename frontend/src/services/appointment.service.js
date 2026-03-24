import api from './api';

export const getAllAppointments = async () => {
  const response = await api.get('/appointment/all');
  return response.data;
};

export const getDoctorAppointments = async (doctorName) => {
  const response = await api.get(`/appointment/doctor/${doctorName}`);
  return response.data;
};

export const bookAppointment = async (appointmentData) => {
  // appointmentData: { patientName, doctorName, appointmentDate }
  const response = await api.post('/appointment/book', appointmentData);
  return response.data;
};

export const updateAppointment = async (id, appointmentData) => {
  const response = await api.put(`/appointment/update/${id}`, appointmentData);
  return response.data;
};

export const deleteAppointment = async (id) => {
  const response = await api.delete(`/appointment/delete/${id}`);
  return response.data;
};
