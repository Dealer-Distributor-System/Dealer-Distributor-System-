import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import useAuth from '../../hooks/useAuth';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', formData);
      const { token, data: user } = response.data;
      
      // Update global auth state
      login(user, token);
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'dealer') {
        navigate('/products');
      } else if (user.role === 'traveller') {
        navigate('/traveller/dashboard');
      } else {
        navigate('/'); // Fallback
      }
    } catch (error) {
      setServerError(
        error.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-16rem)] px-4 py-8">
      <div className="w-full max-w-md p-8 bg-surface rounded-[var(--radius-soft-lg)] shadow-soft-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text mb-2">Welcome Back</h1>
          <p className="text-text-light text-sm">Please sign in to your account</p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            id="email"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />

          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-text-light flex flex-col gap-4">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:text-primary-hover hover:underline transition-colors">
              Register here
            </Link>
          </p>
          <div className="pt-4 border-t border-gray-100">
            <Link to="/" className="text-gray-400 hover:text-text transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
