import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PasswordInput from '../common/PasswordInput';
import '../../styles/auth/Register.css';
import InfinityGlowBackground from '../../LandingPage/InfinityGlow';
import NavbarLanding from '../../LandingPage/NavbarLanding';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
    
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.length < 6) {
      setPasswordStrength('weak');
    } else if (password.length < 8) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone
      });
      
      if (result.success) {
        setSuccess('Registration successful! Please sign in.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container-register">
      <div className="navbar-wrapper-register">
        <NavbarLanding />
      </div>
      <div className="infinity-glow-background-register">
        <InfinityGlowBackground/>
      </div>
      
      <div className="container-register">
        <div className="card-register">
          <div className="card-header-register">
            <div className="icon-wrapper-register">
              <div className="emoji-icon-register">
                <img src="/leaf.png" alt="Leaf" className="emoji-icon-register" />
              </div>
            </div>
            <h1 className="card-title-register">
              Create Account
            </h1>
            <p className="card-description-register">Join FarmXpert to manage your farm with AI assistance</p>
          </div>

          <div className="form-content-register">
            {error && (
              <div className="alert-register alert-warning-register">
                <span className="alert-icon-register">⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="alert-register alert-success-register">
                <span className="alert-icon-register">✓</span>
                {success}
              </div>
            )}

            <div className="form-group-register">
              <label className="form-label-register">Full Name</label>
              <input 
                className="form-input-register" 
                type="text" 
                name="full_name"
                placeholder="Enter your full name" 
                value={formData.full_name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group-register">
              <label className="form-label-register">Username</label>
              <input 
                className="form-input-register" 
                type="text" 
                name="username"
                placeholder="Choose a username" 
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group-register">
              <label className="form-label-register">Email Address</label>
              <input 
                className="form-input-register" 
                type="email" 
                name="email"
                placeholder="Enter your email address" 
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group-register">
              <label className="form-label-register">Phone Number (Optional)</label>
              <input 
                className="form-input-register" 
                type="tel" 
                name="phone"
                placeholder="Enter your phone number" 
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group-register">
              <label className="form-label-register">Password</label>
              <PasswordInput
                className="form-input-register"
                name="password"
                placeholder="Create a password" 
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              {formData.password && (
                <div 
                  className="password-strength"
                  style={{
                    color: passwordStrength === 'strong' ? '#22c55e' : passwordStrength === 'medium' ? '#f59e0b' : '#ef4444'
                  }}
                >
                  Password strength: {passwordStrength}
                </div>
              )}
            </div>

            <div className="form-group-register">
              <label className="form-label-register">Confirm Password</label>
              <PasswordInput
                className="form-input-register"
                name="confirmPassword"
                placeholder="Confirm your password" 
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <button 
              type="button"
              onClick={handleSubmit}
              className="btn-register btn-primary-register" 
              disabled={loading || !formData.username || !formData.email || !formData.password || !formData.full_name}
            >
              {loading ? (
                <>
                  <div className="spinner-inline-register" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          <div className="signup-link-register">
            Already have an account?{" "}
            <Link to="/login" className="signup-link-highlight-register">
              Sign in here
            </Link>
          </div>

          <div className="demo-section-register">
            <p className="demo-title-register">Demo Accounts:</p>
            <div className="demo-content-register">
              <p>Farmer: farmer@demo.com</p>
              <p>Admin: admin@demo.com</p>
              <p className="demo-password-register">Password: any password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;