import { type FormEvent, useState } from 'react';
import logo from '../assets/logo.svg';
import { registerUser, loginUser } from '../data/users';
import './LoginForm.css';

type AuthMode = 'login' | 'register';

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loginData, setLoginData] = useState<LoginFormData>({ email: '', password: '' });
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const validateLogin = (): boolean => {
    const next: FormErrors = {};

    if (!loginData.email.trim()) {
      next.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      next.email = 'Enter a valid email address';
    }

    if (!loginData.password) {
      next.password = 'Password is required';
    } else if (loginData.password.length < 6) {
      next.password = 'Password must be at least 6 characters';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateRegister = (): boolean => {
    const next: FormErrors = {};

    if (!registerData.name.trim()) {
      next.name = 'Full name is required';
    } else if (registerData.name.trim().length < 2) {
      next.name = 'Name must be at least 2 characters';
    }

    if (!registerData.email.trim()) {
      next.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      next.email = 'Enter a valid email address';
    }

    if (!registerData.password) {
      next.password = 'Password is required';
    } else if (registerData.password.length < 6) {
      next.password = 'Password must be at least 6 characters';
    }

    if (!registerData.confirmPassword) {
      next.confirmPassword = 'Please confirm your password';
    } else if (registerData.password !== registerData.confirmPassword) {
      next.confirmPassword = 'Passwords do not match';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateLogin()) {
      const result = loginUser(loginData.email, loginData.password);
      if (result.ok) {
        onLogin();
      } else {
        setErrors({ email: result.error });
      }
    }
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateRegister()) {
      const result = registerUser(registerData.name, registerData.email, registerData.password);
      if (result.ok) {
        setRegisterSuccess(true);
      } else {
        setErrors({ email: result.error });
      }
    }
  };

  const handleLoginChange = (field: keyof LoginFormData, value: string) => {
    setLoginData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleRegisterChange = (field: keyof RegisterFormData, value: string) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setRegisterSuccess(false);
  };

  return (
    <div className="login-card">
      <div className="login-header">
        <div className="login-logo">
          <img src={logo} alt="M-PRO CAFE logo" />
        </div>
        <h1>Welcome to M-PRO CAFE</h1>
        <p>{mode === 'login' ? 'Enter your credentials to continue' : 'Create a new account to get started'}</p>
      </div>

      {mode === 'login' ? (
        <form onSubmit={handleLoginSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={loginData.email}
              onChange={(e) => handleLoginChange('email', e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className={errors.email ? 'has-error' : ''}
            />
            {errors.email && <span className="login-error">{errors.email}</span>}
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={loginData.password}
              onChange={(e) => handleLoginChange('password', e.target.value)}
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
      ) : registerSuccess ? (
        <div className="login-success">
          <div className="login-icon check">✓</div>
          <h2>Account Created!</h2>
          <p>Your account has been created successfully.</p>
          <button
            type="button"
            className="login-submit"
            onClick={onLogin}
          >
            Sign in now
          </button>
        </div>
      ) : (
        <form onSubmit={handleRegisterSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              type="text"
              value={registerData.name}
              onChange={(e) => handleRegisterChange('name', e.target.value)}
              placeholder="John Doe"
              autoComplete="name"
              className={errors.name ? 'has-error' : ''}
            />
            {errors.name && <span className="login-error">{errors.name}</span>}
          </div>

          <div className="login-field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              value={registerData.email}
              onChange={(e) => handleRegisterChange('email', e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className={errors.email ? 'has-error' : ''}
            />
            {errors.email && <span className="login-error">{errors.email}</span>}
          </div>

          <div className="login-field">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              value={registerData.password}
              onChange={(e) => handleRegisterChange('password', e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className={errors.password ? 'has-error' : ''}
            />
            {errors.password && <span className="login-error">{errors.password}</span>}
          </div>

          <div className="login-field">
            <label htmlFor="register-confirm-password">Confirm Password</label>
            <input
              id="register-confirm-password"
              type="password"
              value={registerData.confirmPassword}
              onChange={(e) => handleRegisterChange('confirmPassword', e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className={errors.confirmPassword ? 'has-error' : ''}
            />
            {errors.confirmPassword && <span className="login-error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="login-submit">
            Create Account
          </button>
        </form>
      )}

      <div className="login-toggle">
        {mode === 'login' ? (
          <p>
            Don't have an account?{' '}
            <button type="button" className="login-toggle-btn" onClick={() => switchMode('register')}>
              Create one
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button type="button" className="login-toggle-btn" onClick={() => switchMode('login')}>
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default LoginForm;
