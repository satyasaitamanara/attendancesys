import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  GraduationCap, 
  User, 
  LogOut, 
  BarChart3, 
  Users, 
  Upload,
  UserCircle,
  Star,
  Crown
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const studentNavItems = [
    { path: '/student', label: 'Dashboard', icon: BarChart3 },
    { path: '/student/profile', label: 'Profile', icon: UserCircle },
  ];

  const adminNavItems = [
    { path: '/admin', label: 'Dashboard', icon: BarChart3 },
    { path: '/admin/students', label: 'Manage Students', icon: Users },
    { path: '/admin/upload', label: 'Upload Attendance', icon: Upload },
    { path: '/admin/profile', label: 'Profile', icon: UserCircle },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : studentNavItems;

  return (
    <nav className="navbar-gold shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={user?.role === 'admin' ? '/admin' : '/student'} className="flex items-center space-x-3 group">
              <div className="relative">
                <GraduationCap className="h-10 w-10 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300" />
                <Star className="h-4 w-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <span className="text-2xl font-bold gold-text">AttendanceTracker</span>
                <div className="text-xs text-yellow-400/80">Student Management System</div>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg'
                      : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-gray-800/50 rounded-lg px-4 py-2 border border-yellow-500/20">
              <div className="relative">
                {user?.role === 'admin' ? (
                  <Crown className="h-6 w-6 text-yellow-400" />
                ) : (
                  <User className="h-6 w-6 text-yellow-400" />
                )}
              </div>
              <div>
                <span className="text-sm font-semibold text-white">
                  {user?.name || user?.fullName || user?.username}
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    user?.role === 'admin' 
                      ? 'bg-yellow-400 text-black' 
                      : 'bg-blue-500 text-white'
                  }`}>
                    {user?.role}
                  </span>
                  {user?.role === 'student' && user?.attendancePercentage && (
                    <span className="text-xs text-yellow-400 font-medium">
                      {typeof user.attendancePercentage === 'number' 
                        ? user.attendancePercentage.toFixed(1) 
                        : parseFloat(user.attendancePercentage).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors duration-300 bg-gray-800/50 rounded-lg px-3 py-2 border border-red-500/20 hover:border-red-400/40"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden pb-3 pt-2 border-t border-yellow-500/20">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black'
                      : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}