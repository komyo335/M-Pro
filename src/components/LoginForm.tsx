import { type FormEvent, useState } from 'react';
import logo from '../assets/logo.svg';
import './LoginForm.css';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});

  const validate = (): boolean => {
    const next: LoginFormErrors = {};

    if (!formData.email.trim()) {
      next.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      next.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      next.password = 'Password is required';
    } else if (formData.password.length < 6) {
      next.password = 'Password must be at least 6 characters';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onLogin();
      // TODO: replace with real auth call
      console.log('Login submitted:', formData);
    }
  };

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="login-card">
      <div className="login-header">
        <div className="login-logo">
          <img src={logo} alt="M-PRO CAFE logo" />
        </div>
        <h1>Welcome to M-PRO CAFE</h1>
        <p>Enter your credentials to continue</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="login-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className={errors.email ? 'has-error' : ''}
          />
          {errors.email && <span className="login-error">{errors.email}</span>}
        </div>

        <div className="login-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className={errors.password ? 'has-error' : ''}
          />
          {errors.password && <span className="login-error">{errors.password}</span>}
        </div>

        <button type="submit" className="login-submit">
          Sign in
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
