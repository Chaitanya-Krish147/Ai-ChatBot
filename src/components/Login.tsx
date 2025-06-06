import { useState, useEffect } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiAlertCircle } from 'react-icons/fi';

interface User {
  id: string;
  email: string;
  name: string;
  token: string;
}

interface LoginProps {
  onClose?: () => void;
  onSwitchToSignup: () => void;
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onClose, onSwitchToSignup, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  
  // Real-time validation
  useEffect(() => {
    const newErrors: typeof errors = {};
    
    if (email && !isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (password && password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
  }, [email, password]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate before submission
    if (!email || !password) {
      setErrors({
        ...errors,
        general: 'Please fill in all fields'
      });
      return;
    }
    
    if (errors.email || errors.password) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful login
      const mockUser = {
        id: '1',
        email: email,
        name: email.split('@')[0],
        token: 'mock-jwt-token'
      };
      
      // Store user data if remember me is checked
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(mockUser));
      } else {
        sessionStorage.setItem('user', JSON.stringify(mockUser));
      }
      
      onLoginSuccess(mockUser);
      
    } catch (error) {
      setErrors({
        general: 'Invalid email or password'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: Logo */}
      <div className="hidden md:flex w-1/2 h-full min-h-screen bg-white items-center justify-center">
        <img src="/StacXai2.png" alt="StacXai Logo" className="max-w-4xl w-13/14 object-contain" />
      </div>
      {/* Right: Form */}
      <div className="flex w-full md:w-1/2 h-full min-h-screen items-center justify-center bg-white px-4 py-12">
        <div className="w-full max-w-sm mx-auto">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
          <p className="text-center text-gray-500 mb-8">Use your email and password to sign in</p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Error Alert */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-600">{errors.general}</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full px-4 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-200'} rounded-md focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-gray-50`}
                  placeholder="user@gmail.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full px-4 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-200'} rounded-md focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-gray-50`}
                  placeholder="Password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="text-sm text-blue-600 hover:text-blue-500 bg-transparent border-none cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 rounded-md text-sm font-medium bg-black text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </div>

            {/* Sign up link */}
            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="font-semibold text-black hover:underline"
              >
                Sign up
              </button>{' '}
              for free.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 