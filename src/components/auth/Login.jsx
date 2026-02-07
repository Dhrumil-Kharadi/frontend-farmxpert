import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PasswordInput from '../common/PasswordInput';
import '../../styles/auth/Login.css';
import InfinityGlowBackground from '../../LandingPage/InfinityGlow';
import NavbarLanding from '../../LandingPage/NavbarLanding';

// Loading spinner component
// eslint-disable-next-line no-unused-vars
const LoadingSpinner = () => (
  <div className="loading-spinner-login">
    <div className="spinner-login"></div>
  </div>
);

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await login(formData.username, formData.password);

      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard/farm-information');
        }, 1000);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container-login">
      <div className="navbar-wrapper-login">
        <NavbarLanding />
      </div>

      <div className="infinity-glow-background-login">
        <InfinityGlowBackground />
      </div>

      <div className="container-login">
        <div className="card-login">
          <div className="card-header-login">
            <div className="icon-wrapper-login">
              <div className="emoji-icon-login">
                <img src="/leaf.png" alt="Leaf" className="emoji-icon-login" />
              </div>
            </div>
            <h1 className="card-title-login">
              Welcome Back
            </h1>
            <p className="card-description-login">Sign in to access your farm management dashboard</p>
          </div>

          <div className="form-content-login">
            {error && (
              <div className="alert-login alert-warning-login">
                <span className="alert-icon-login">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert-login alert-success-login">
                <span className="alert-icon-login">✓</span>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group-login">
                <label className="form-label-login">Username or Email</label>
                <input
                  className="form-input-login"
                  type="text"
                  name="username"
                  placeholder="Enter your username or email"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="username"
                />
              </div>

              <div className="form-group-login">
                <label className="form-label-login">Password</label>
                <PasswordInput
                  className="form-input-login"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="forgot-password-login">
                <Link to="/forgot-password" className="forgot-link-login">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="btn-login btn-primary-login"
                disabled={loading || !formData.username || !formData.password}
              >
                {loading ? (
                  <>
                    <div className="spinner-inline-login" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>

          <div className="signup-link-login">
            Don't have an account?{" "}
            <Link to="/register" className="signup-link-highlight-login">
              Sign up here
            </Link>
          </div>

          <div className="demo-section-login">
            <p className="demo-title-login">Demo Accounts:</p>
            <div className="demo-content-login">
              <p>Farmer: farmer@demo.com</p>
              <p>Admin: admin@demo.com</p>
              <p className="demo-password-login">Password: any password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;