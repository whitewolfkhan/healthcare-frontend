import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = Cookies.get('token') || localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  googleAuth: (credential) => api.post('/auth/google', { credential }),
};

// Patient APIs
export const patientAPI = {
  getMyProfile: () => api.get('/patients/me'),
  updateMyProfile: (data) => api.put('/patients/me', data),
  getDashboardStats: () => api.get('/patients/dashboard'),
  getAllPatients: (params) => api.get('/patients', { params }),
  getPatientById: (id) => api.get(`/patients/${id}`),
};

// Doctor APIs
export const doctorAPI = {
  getAllDoctors: (params) => api.get('/doctors', { params }),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  getMyProfile: () => api.get('/doctors/me'),
  updateMyProfile: (data) => api.put('/doctors/me', data),
  getDashboard: () => api.get('/doctors/dashboard'),
};

// Appointment APIs
export const appointmentAPI = {
  getAppointments: (params) => api.get('/appointments', { params }),
  createAppointment: (data) => api.post('/appointments', data),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  cancelAppointment: (id, reason) => api.patch(`/appointments/${id}/cancel`, { reason }),
  getAvailableSlots: (doctorId, date) => api.get('/appointments/slots', { params: { doctorId, date } }),
};

// Prescription APIs
export const prescriptionAPI = {
  getPrescriptions: (params) => api.get('/prescriptions', { params }),
  createPrescription: (data) => api.post('/prescriptions', data),
  getPrescriptionById: (id) => api.get(`/prescriptions/${id}`),
  updatePrescription: (id, data) => api.put(`/prescriptions/${id}`, data),
  deletePrescription: (id) => api.delete(`/prescriptions/${id}`),
};

// Lab Result APIs
export const labResultAPI = {
  getLabResults: (params) => api.get('/lab-results', { params }),
  createLabResult: (data) => api.post('/lab-results', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getLabResultById: (id) => api.get(`/lab-results/${id}`),
  updateLabResult: (id, data) => api.put(`/lab-results/${id}`, data),
  deleteLabResult: (id) => api.delete(`/lab-results/${id}`),
};

// Medical Image APIs
export const medicalImageAPI = {
  getMedicalImages: (params) => api.get('/medical-images', { params }),
  uploadImage: (data) => api.post('/medical-images', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getImageById: (id) => api.get(`/medical-images/${id}`),
  updateAnnotations: (id, data) => api.patch(`/medical-images/${id}/annotations`, data),
  deleteImage: (id) => api.delete(`/medical-images/${id}`),
};

// Medication APIs
export const medicationAPI = {
  getMedications: (params) => api.get('/medications', { params }),
  createMedication: (data) => api.post('/medications', data),
  getMedicationById: (id) => api.get(`/medications/${id}`),
  updateMedication: (id, data) => api.put(`/medications/${id}`, data),
  logAdherence: (id, data) => api.post(`/medications/${id}/adherence`, data),
  deleteMedication: (id) => api.delete(`/medications/${id}`),
};

// Vital Signs APIs
export const vitalAPI = {
  getVitals: (params) => api.get('/vitals', { params }),
  createVital: (data) => api.post('/vitals', data),
  getTrends: (params) => api.get('/vitals/trends', { params }),
  deleteVital: (id) => api.delete(`/vitals/${id}`),
};

// Department APIs
export const departmentAPI = {
  getDepartments: () => api.get('/departments'),
  getDepartmentById: (id) => api.get(`/departments/${id}`),
};

// Medical Record APIs
export const medicalRecordAPI = {
  getRecords: (params) => api.get('/medical-records', { params }),
  createRecord: (data) => api.post('/medical-records', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getRecordById: (id) => api.get(`/medical-records/${id}`),
  updateRecord: (id, data) => api.put(`/medical-records/${id}`, data),
  deleteRecord: (id) => api.delete(`/medical-records/${id}`),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
};

// User APIs
export const userAPI = {
  uploadAvatar: (formData) => api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProfile: (data) => api.put('/users/profile', data),
};

// Admin APIs
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (data) => api.post('/admin/departments', data),
  updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`),
};
