import { create } from 'zustand';
import axios from 'axios';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from local storage
  const savedToken = localStorage.getItem('dtgen_token');
  
  if (savedToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
  }

  // Setup global Axios interceptor for 401
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Clear local storage and redirect or just clear state
        localStorage.removeItem('dtgen_token');
        delete axios.defaults.headers.common['Authorization'];
        set({ token: null, isAuthenticated: false });
      }
      return Promise.reject(error);
    }
  );

  return {
    token: savedToken,
    isAuthenticated: !!savedToken,
    
    login: (token: string) => {
      localStorage.setItem('dtgen_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ token, isAuthenticated: true });
    },
    
    logout: () => {
      localStorage.removeItem('dtgen_token');
      delete axios.defaults.headers.common['Authorization'];
      set({ token: null, isAuthenticated: false });
    }
  };
});
