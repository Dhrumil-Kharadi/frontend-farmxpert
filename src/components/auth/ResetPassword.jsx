import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PasswordInput from '../common/PasswordInput';
import '../../styles/auth/ResetPassword.css';
import InfinityGlowBackground from '../../LandingPage/InfinityGlow';
import NavbarLanding from '../../LandingPage/NavbarLanding';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState('');

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    const doVerify = async () => {
      if (!token) {
        setError('Invalid reset link. Please request a new password reset.');
        return;
      }
      // Verify token on component mount
      try {
        const response = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setError('Invalid or expired reset link. Please request a new password reset.');
        }
      } catch (err) {
        setTokenValid(false);
        setError('Failed to verify reset link. Please try again.');
      }
    };
    doVerify();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (error) setError('');

    // Check password strength
    if (name === 'newPassword') {
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
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
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
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: formData.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.detail || 'Failed to reset password');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="dashboard-container-reset">
        <div className="navbar-wrapper-reset">
          <NavbarLanding />
        </div>

        <div className="infinity-glow-background-reset">
          <InfinityGlowBackground />
        </div>

        <div className="container-reset">
          <div className="card-reset">
            <div className="card-header-reset">
              <div className="icon-wrapper-reset">
                <div className="emoji-icon-reset">
                  🌾
                </div>
              </div>
              <h1 className="card-title-reset">
                Invalid Reset Link
              </h1>
              <p className="card-description-reset">This password reset link is invalid or has expired.</p>
            </div>

            <div className="form-content-reset">
              {error && (
                <div className="alert-reset alert-warning-reset">
                  <span className="alert-icon-reset">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="signup-link-reset">
                <Link to="/forgot-password" className="signup-link-highlight-reset">
                  Request a new password reset
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tokenValid === null) {
    return (
      <div className="dashboard-container-reset">
        <div className="navbar-wrapper-reset">
          <NavbarLanding />
        </div>

        <div className="infinity-glow-background-reset">
          <InfinityGlowBackground />
        </div>

        <div className="container-reset">
          <div className="card-reset">
            <div className="card-header-reset">
              <div className="icon-wrapper-reset">
                <div className="emoji-icon-reset">
                  🌾
                </div>
              </div>
              <h1 className="card-title-reset">
                Verifying Reset Link...
              </h1>
              <p className="card-description-reset">Please wait while we verify your reset link.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container-reset">
      <div className="navbar-wrapper-reset">
        <NavbarLanding />
      </div>

      <div className="infinity-glow-background-reset">
        <InfinityGlowBackground />
      </div>

      <div className="container-reset">
        <div className="card-reset">
          <div className="card-header-reset">
            <div className="icon-wrapper-reset">
              <div className="emoji-icon-reset">
                🌾
              </div>
            </div>
            <h1 className="card-title-reset">
              Reset Your Password
            </h1>
            <p className="card-description-reset">Enter your new password below.</p>
          </div>

          <div className="form-content-reset">
            {error && (
              <div className="alert-reset alert-warning-reset">
                <span className="alert-icon-reset">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert-reset alert-success-reset">
                <span className="alert-icon-reset">✓</span>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group-reset">
                <label className="form-label-reset" htmlFor="newPassword">New Password</label>
                <PasswordInput
                  className="form-input-reset"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter your new password"
                  required
                  disabled={loading}
                />
                {formData.newPassword && (
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

              <div className="form-group-reset">
                <label className="form-label-reset" htmlFor="confirmPassword">Confirm New Password</label>
                <PasswordInput
                  className="form-input-reset"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn-reset btn-primary-reset"
                disabled={loading || !formData.newPassword || !formData.confirmPassword}
              >
                {loading ? (
                  <>
                    <div className="spinner-inline-reset" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </div>

          <div className="signup-link-reset">
            Remember your password?{" "}
            <Link to="/login" className="signup-link-highlight-reset">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
