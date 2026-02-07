import React, { useState } from 'react';

const PasswordInput = ({ 
  id, 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  disabled = false,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="password-input">
      <input
        className="auth-input"
        style={{ paddingRight: '3rem' }}
        type={showPassword ? 'text' : 'password'}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        {...props}
      />
      <button
        className="password-toggle"
        type="button"
        onClick={togglePasswordVisibility}
        disabled={disabled}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? '🙈' : '👁️'}
      </button>
    </div>
  );
};

export default PasswordInput;
