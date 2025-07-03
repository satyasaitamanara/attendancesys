import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageLayout from '../components/Layout/PageLayout';
import { User, Mail, Hash, Calendar, Edit, Save, X, Eye, EyeOff, Star, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import '../index.css';

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const updateData: any = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch(`https://attendancesys-yn0k.onrender.com/api/profile/student/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      updateUser({ name: data.name, email: data.email });
      toast.success('Profile updated successfully');
      setEditing(false);
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setEditing(false);
  };

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 90) return { status: 'Excellent', color: 'text-green-400', bgColor: 'badge-excellent' };
    if (percentage >= 80) return { status: 'Good', color: 'text-blue-400', bgColor: 'badge-good' };
    if (percentage >= 75) return { status: 'Average', color: 'text-yellow-400', bgColor: 'badge-average' };
    return { status: 'Poor', color: 'text-red-400', bgColor: 'badge-poor' };
  };

  const attendancePercentage = user?.attendancePercentage || 0;
  const safeAttendancePercentage = typeof attendancePercentage === 'number' ? attendancePercentage : parseFloat(attendancePercentage) || 0;
  const attendanceStatus = getAttendanceStatus(safeAttendancePercentage);

  return (
    <PageLayout 
      title={
        <div className="flex items-center space-x-3">
          <User className="h-8 w-8 text-yellow-400" />
          <span className="gold-text">My Profile</span>
        </div>
      }
      subtitle="Manage your personal information and account settings"
    >
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card">
          {/* Profile Header */}
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-20 w-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mr-6">
                  <span className="text-3xl font-bold text-black">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-black/80">Student Profile</p>
                </div>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-secondary"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-yellow-400 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-yellow-400 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="border-t border-yellow-500/20 pt-6">
                  <h3 className="text-lg font-bold gold-text mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-yellow-400 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords ? 'text' : 'password'}
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                          className="input-field pr-12"
                          placeholder="Enter current password to change"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(!showPasswords)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors"
                        >
                          {showPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-yellow-400 mb-2">
                          New Password
                        </label>
                        <input
                          type={showPasswords ? 'text' : 'password'}
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          className="input-field"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-yellow-400 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type={showPasswords ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="input-field"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-yellow-500/20">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="loading-spinner w-4 h-4 mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="stat-card">
                    <div className="flex items-center">
                      <User className="h-6 w-6 text-yellow-400 mr-4" />
                      <div>
                        <p className="text-sm text-gray-400">Full Name</p>
                        <p className="font-semibold text-white text-lg">{user?.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="flex items-center">
                      <Hash className="h-6 w-6 text-yellow-400 mr-4" />
                      <div>
                        <p className="text-sm text-gray-400">Roll Number</p>
                        <p className="font-semibold text-yellow-400 text-lg">{user?.rollNo}</p>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="flex items-center">
                      <Mail className="h-6 w-6 text-yellow-400 mr-4" />
                      <div>
                        <p className="text-sm text-gray-400">Email Address</p>
                        <p className="font-semibold text-white text-lg">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="flex items-center">
                      <Calendar className="h-6 w-6 text-yellow-400 mr-4" />
                      <div>
                        <p className="text-sm text-gray-400">Account Type</p>
                        <p className="font-semibold text-white text-lg capitalize">{user?.role}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance Summary */}
                <div className="border-t border-yellow-500/20 pt-6">
                  <h3 className="text-lg font-bold gold-text mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Attendance Summary
                  </h3>
                  <div className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 rounded-xl p-6 border border-yellow-400/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Overall Attendance</p>
                        <p className="text-4xl font-bold gold-text">
                          {safeAttendancePercentage.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`px-4 py-2 rounded-full ${attendanceStatus.bgColor} mb-2`}>
                          <span className="text-sm font-semibold">
                            {attendanceStatus.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">Performance Status</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
