import React, { createContext, useContext, useState, useEffect } from 'react';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      
      // Store tokens and user data
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('session_token', data.session_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.access_token);
      setUser(data.user);
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      const data = await response.json();
      return { success: true, user: data };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('session_token');
      localStorage.removeItem('user');
      
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Profile update failed');
      }

      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      
      return { success: true, user: data };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Password change failed');
      }

      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshTokenValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      setToken(data.access_token);
      
      return { success: true, token: data.access_token };
    } catch (error) {
      console.error('Token refresh error:', error);
      logout(); // Logout on refresh failure
      return { success: false, error: error.message };
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshToken,
    getAuthHeaders,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
