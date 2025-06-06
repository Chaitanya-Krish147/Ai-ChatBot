import React, { useState, useEffect } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiAlertCircle, FiCheck } from 'react-icons/fi';

interface SignupProps {
  onClose?: () => void;
  onSwitchToLogin: () => void;
  onSignupSuccess: (user: any) => void;
}

const Signup: React.FC<SignupProps> = ({ onClose, onSwitchToLogin, onSignupSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Real-time validation
  useEffect(() => {
    const newErrors: typeof errors = {};
    
    if (formData.name && formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      calculatePasswordStrength(formData.password);
    }
    
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
  }, [formData]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setErrors({
        ...errors,
        general: 'Please fill in all fields'
      });
      return;
    }
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    if (!agreeToTerms) {
      setErrors({
        ...errors,
        general: 'Please agree to the terms and conditions'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful signup
      const mockUser = {
        id: Date.now().toString(),
        email: formData.email,
        name: formData.name,
        token: 'mock-jwt-token'
      };
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      onSignupSuccess(mockUser);
      
    } catch (error) {
      setErrors({
        general: 'An error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: Logo */}
      <div className="hidden md:flex w-1/2 h-full min-h-screen bg-white items-center justify-center">
        <img src="/StacXai2.png" alt="StacXai Logo" className="max-w-4xl w-12/13 object-contain" />
      </div>
      {/* Right: Form */}
      <div className="flex w-full md:w-1/2 h-full min-h-screen items-center justify-center bg-white px-4 py-12">
        <div className="w-full max-w-sm mx-auto">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">Sign Up</h2>
          <p className="text-center text-gray-500 mb-8">Create your account to get started</p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Error Alert */}
              {errors.general && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
                  <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-600 dark:text-red-400">{errors.general}</span>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`block w-full px-4 py-3 border ${errors.name ? 'border-red-300' : 'border-gray-200'} rounded-md focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-gray-50`}
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full px-4 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-200'} rounded-md focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-gray-50`}
                  placeholder="Password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`block w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'} rounded-md focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-gray-50`}
                  placeholder="Confirm Password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-0.5"
                />
                <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  I agree to the{' '}
                  <a href="#" className="text-purple-600 hover:text-purple-500 dark:text-purple-400">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-purple-600 hover:text-purple-500 dark:text-purple-400">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 rounded-md text-sm font-medium bg-black text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing up...' : 'Sign up'}
                </button>
              </div>
            </div>

            {/* Sign in link */}
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="font-semibold text-black hover:underline"
                >
                  Sign in
                </button>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
