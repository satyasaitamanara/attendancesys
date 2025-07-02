import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/Layout/PageLayout';
import { Users, TrendingUp, AlertTriangle, Calendar, Plus, Upload, Eye, Star, Crown, BarChart } from 'lucide-react';
import toast from 'react-hot-toast';
import '../index.css';

interface Student {
  id: string;
  name: string;
  roll_no: string;
  email: string;
  attendance_percentage: number;
  created_at: string;
}

interface DashboardStats {
  totalStudents: number;
  averageAttendance: number;
  lowAttendanceCount: number;
  recentRecords: number;
}

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    averageAttendance: 0,
    lowAttendanceCount: 0,
    recentRecords: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch students and stats in parallel
      const [studentsResponse, statsResponse] = await Promise.all([
        fetch('http://attendancesys-yn0k.onrender.com/api/students', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('http://attendancesys-yn0k.onrender.com/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (!studentsResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [studentsData, statsData] = await Promise.all([
        studentsResponse.json(),
        statsResponse.json(),
      ]);

      setStudents(studentsData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 90) return { status: 'Excellent', color: 'text-green-400', bgColor: 'badge-excellent' };
    if (percentage >= 80) return { status: 'Good', color: 'text-blue-400', bgColor: 'badge-good' };
    if (percentage >= 75) return { status: 'Average', color: 'text-yellow-400', bgColor: 'badge-average' };
    return { status: 'Poor', color: 'text-red-400', bgColor: 'badge-poor' };
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={
        <div className="flex items-center space-x-3">
          <Crown className="h-8 w-8 text-yellow-400" />
          <span className="gold-text">Admin Dashboard</span>
        </div>
      }
      subtitle="Comprehensive overview of student attendance and system performance"
    >
      <div className="space-y-8 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card hover-lift">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Students</p>
                <p className="text-3xl font-bold text-blue-400">{stats.totalStudents}</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400">Registered students</div>
          </div>

          <div className="stat-card hover-lift">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Average Attendance</p>
                <p className="text-3xl font-bold text-green-400">{Number(stats.averageAttendance).toFixed(1)}%</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400">Overall performance</div>
          </div>

          <div className="stat-card hover-lift">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Low Attendance</p>
                <p className="text-3xl font-bold text-red-400">{stats.lowAttendanceCount}</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400">Students below 75%</div>
          </div>

          <div className="stat-card hover-lift">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">This Month</p>
                <p className="text-3xl font-bold text-purple-400">{stats.recentRecords}</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400">Records updated</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card animate-slide-up">
          <div className="card-header">
            <div className="flex items-center">
              <Star className="h-6 w-6 mr-3" />
              <h3 className="text-xl font-bold">Quick Actions</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/admin/students"
                className="group bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover-lift"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-white text-lg">Add Student</p>
                    <p className="text-blue-100 text-sm">Register new students</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/upload"
                className="group bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 hover-lift"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-white text-lg">Upload Attendance</p>
                    <p className="text-green-100 text-sm">Import CSV/Excel files</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/students"
                className="group bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 hover-lift"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-white text-lg">View All Students</p>
                    <p className="text-purple-100 text-sm">Manage student records</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Students */}
        <div className="card animate-slide-up">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart className="h-6 w-6 mr-3" />
                <h3 className="text-xl font-bold">Student Overview</h3>
              </div>
              <Link
                to="/admin/students"
                className="text-black hover:text-gray-800 font-semibold transition-colors"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            {students.length > 0 ? (
              <table className="min-w-full">
                <thead className="table-header">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Student</th>
                    <th className="px-6 py-4 text-left font-bold">Roll No</th>
                    <th className="px-6 py-4 text-left font-bold">Email</th>
                    <th className="px-6 py-4 text-left font-bold">Attendance</th>
                    <th className="px-6 py-4 text-left font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900">
                  {students.slice(0, 10).map((student) => {
                    const status = getAttendanceStatus(student.attendance_percentage);
                    
                    return (
                      <tr key={student.id} className="table-row">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-12 w-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                              <span className="text-lg font-bold text-black">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="font-semibold text-white">{student.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-yellow-400">
                          {student.roll_no}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 font-bold text-white">
                         {Number(student.attendance_percentage).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${status.bgColor}`}>
                            {status.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-16 text-center text-gray-400">
                <Users className="h-16 w-16 mx-auto mb-6 text-gray-600" />
                <p className="text-xl mb-2">No students found</p>
                <p className="text-gray-500 mb-6">Add your first student to get started</p>
                <Link
                  to="/admin/students"
                  className="btn-primary inline-flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Student
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
