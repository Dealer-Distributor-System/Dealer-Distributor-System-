import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'dealer', // default role
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');
    
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/auth/register', formData);
      setSuccessMsg(response.data.message || 'Registration successful!');
      
      // Delay redirect slightly so user can see success message
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      setServerError(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { label: 'Dealer', value: 'dealer' },
    { label: 'Traveller', value: 'traveller' },
    { label: 'Admin', value: 'admin' },
  ];

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-16rem)] py-8 px-4">
      <div className="w-full max-w-md p-8 bg-surface rounded-[var(--radius-soft-lg)] shadow-soft-lg relative">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text mb-2">Create Account</h1>
          <p className="text-text-light text-sm">Join Prince Piping today</p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md">
            {serverError}
          </div>
        )}
        
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded-r-md">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            id="name"
            name="name"
            type="text"
            placeholder="Enter full name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />

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

          <div className="relative">
            <Select
              label="Account Role"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={roleOptions}
            />
          </div>

          <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
            Register
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-text-light">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:text-primary-hover hover:underline transition-colors">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
