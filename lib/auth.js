import Cookies from 'js-cookie';

export const setAuth = (token, user) => {
  Cookies.set('token', token, { expires: 7, sameSite: 'strict' });
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = () => {
  Cookies.remove('token');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return Cookies.get('token') || localStorage.getItem('token');
};

export const isAuthenticated = () => !!getToken();

export const getDashboardPath = (role) => {
  const paths = { patient: '/patient', doctor: '/doctor', admin: '/admin' };
  return paths[role] || '/login';
};
