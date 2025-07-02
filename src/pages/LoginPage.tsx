import React, { useState } from 'react';
import '../index.css'; // Assuming you have a CSS file for styles
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, User, Shield, Eye, EyeOff, Star, BookOpen } from 'lucide-react';
import '../index.css';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [formData, setFormData] = useState({
    rollNo: '',
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const credentials = activeTab === 'student' 
        ? { rollNo: formData.rollNo, password: formData.password }
        : { username: formData.username, password: formData.password };
      
      await login(credentials, activeTab);
    } catch (error) {
      // Error is handled in the login function
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="login-container">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-yellow-900 opacity-90"></div>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <GraduationCap className="h-20 w-20 text-yellow-400 drop-shadow-lg" />
              <Star className="h-6 w-6 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="gold-text">AttendanceTracker</span>
          </h1>
          <p className="text-gray-300 text-lg">
            Your gateway to academic excellence
          </p>
          <div className="flex items-center justify-center mt-4 space-x-2">
            <BookOpen className="h-5 w-5 text-yellow-400" />
            <span className="text-yellow-400 font-medium">Student Management System</span>
          </div>
        </div>

        <div className="login-card animate-slide-up">
          {/* Tab Navigation */}
          <div className="flex mb-8 bg-gray-800 rounded-xl p-1 border border-yellow-500/20">
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'student'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg'
                  : 'text-gray-400 hover:text-yellow-400'
              }`}
            >
              <User className="h-5 w-5" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg'
                  : 'text-gray-400 hover:text-yellow-400'
              }`}
            >
              <Shield className="h-5 w-5" />
              <span>Admin</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'student' ? (
              <div>
                <label htmlFor="rollNo" className="block text-sm font-semibold text-yellow-400 mb-3">
                  Roll Number
                </label>
                <input
                  id="rollNo"
                  name="rollNo"
                  type="text"
                  required
                  value={formData.rollNo}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter your roll number"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-yellow-400 mb-3">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter your username"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-yellow-400 mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="loading-spinner w-5 h-5"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Sign In</span>
                  <Star className="h-4 w-4" />
                </div>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          {/* <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-yellow-500/20">
            <h4 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Demo Credentials
            </h4>
            <div className="text-xs text-gray-300 space-y-2">
              <div className="flex justify-between">
                <span className="text-yellow-400 font-medium">Admin:</span>
                <span>admin / admin123</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-400 font-medium">Student:</span>
                <span>ST001-ST005 / student123</span>
              </div>
            </div>
          </div> */}
        </div>

        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>© 2025 AttendanceTracker. Empowering Education.</p>
        </div>
      </div>
    </div>
  );
}