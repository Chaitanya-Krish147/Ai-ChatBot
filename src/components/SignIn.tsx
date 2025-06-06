import React, { useState } from 'react';

interface SignInProps {
  onSwitch: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the sign in logic
    console.log('Sign in with:', email, password);
    // For demo purposes, we'll just clear the form
    setEmail('');
    setPassword('');
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2">Sign In</h2>
      <p className="text-gray-600 mb-6 text-center">Login to your account</p>
      
      <form onSubmit={handleSubmit} className="w-full">
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@acme.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
        >
          Sign In
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p>
          Don't have an account?{' '}
          <button 
            onClick={onSwitch}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Sign Up
          </button>
          {' '}instead.
        </p>
      </div>
    </div>
  );
};

export default SignIn;
