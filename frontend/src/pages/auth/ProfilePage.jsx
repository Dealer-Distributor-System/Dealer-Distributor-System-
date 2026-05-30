import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { updateProfile, getProfile } from '../../api/userApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { User, Mail, Phone, MapPin, Shield, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleToggleEdit = () => {
    if (isEditing) {
      // Reset form data to user state if cancelling
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateProfile(formData);
      
      // Update local auth state with new user data
      const updatedUserRes = await getProfile();
      const updatedUser = updatedUserRes.data;
      
      // We need to update the context. login() usually sets the user.
      // But we don't want to change the token. 
      // If AuthContext's login only takes (userData, token), we pass current token.
      const token = localStorage.getItem('token');
      login(updatedUser, token);

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-text tracking-tight">Your Profile</h1>
          <p className="text-text-light mt-1">Manage your personal information and preferences.</p>
        </div>
        {!isEditing && (
          <Button 
            onClick={handleToggleEdit}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" /> Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Summary Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="text-center">
            <CardContent className="pt-8 pb-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold mx-auto mb-4 border-4 border-white shadow-soft">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-text-light mb-4">{user.email}</p>
              <Badge variant={user.role === 'admin' ? 'danger' : 'primary'} className="capitalize">
                {user.role}
              </Badge>
            </CardContent>
          </Card>

          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Security info
            </h3>
            <p className="text-xs text-text-light leading-relaxed">
              Your account is secured with role-based access control. As a <strong>{user.role}</strong>, you have access to specific features relevant to your operations.
            </p>
          </div>
        </div>

        {/* Right Side: Details Form */}
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" /> Full Name
                    </label>
                    <Input 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50/50 border-transparent shadow-none" : ""}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" /> Email Address
                    </label>
                    <Input 
                      value={user.email}
                      disabled
                      className="bg-gray-50/50 border-transparent shadow-none"
                    />
                    <p className="text-[10px] text-gray-400 mt-1 italic">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" /> Phone Number
                    </label>
                    <Input 
                      name="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50/50 border-transparent shadow-none" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" /> Account Role
                    </label>
                    <div className="h-10 flex items-center px-3 bg-gray-50/50 rounded-lg text-sm font-medium text-gray-600 border border-transparent capitalize">
                      {user.role}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" /> Shipping/Business Address
                  </label>
                  <textarea
                    name="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all ${
                      !isEditing 
                        ? "bg-gray-50/50 border-transparent shadow-none resize-none" 
                        : "border-gray-200 focus:ring-2 focus:ring-primary/20"
                    }`}
                    placeholder="Enter full address"
                  ></textarea>
                </div>

                {isEditing && (
                  <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                    <Button 
                      type="button"
                      onClick={handleToggleEdit}
                      variant="ghost"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      variant="primary"
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      {loading ? 'Saving...' : (
                        <><Save className="w-4 h-4" /> Save Changes</>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
