import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/auth/ForgotPassword.css';
import InfinityGlowBackground from '../../LandingPage/InfinityGlow';
import NavbarLanding from '../../LandingPage/NavbarLanding';

 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setEmail('');
      } else {
        setError(data.detail || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container-forgot">
      <div className="navbar-wrapper-forgot">
        <NavbarLanding />
      </div>
      
      <div className="infinity-glow-background-forgot">
        <InfinityGlowBackground/>
      </div>
      
      <div className="container-forgot">
        <div className="card-forgot">
          <div className="card-header-forgot">
            <div className="icon-wrapper-forgot">
              <div className="emoji-icon-forgot">
                🌾
              </div>
            </div>
            <h1 className="card-title-forgot">
              Forgot Password?
            </h1>
            <p className="card-description-forgot">No worries! Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          <div className="form-content-forgot">
            {error && (
              <div className="alert-forgot alert-warning-forgot">
                <span className="alert-icon-forgot">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert-forgot alert-success-forgot">
                <span className="alert-icon-forgot">✓</span>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group-forgot">
                <label className="form-label-forgot" htmlFor="email">Email Address</label>
                <input
                  className="form-input-forgot"
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                />
              </div>

              <button 
                type="submit"
                className="btn-forgot btn-primary-forgot" 
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <div className="spinner-inline-forgot" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </div>

          <div className="signup-link-forgot">
            Remember your password?{" "}
            <Link to="/login" className="signup-link-highlight-forgot">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
