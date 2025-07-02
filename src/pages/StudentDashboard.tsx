import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageLayout from '../components/Layout/PageLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Clock, Award, BookOpen, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import '../index.css';

interface AttendanceRecord {
  id: string;
  month: string;
  working_days: number;
  present_days: number;
  created_at: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://attendancesys-yn0k.onrender.com/api/attendance/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch attendance records');
      }

      const data = await response.json();
      setAttendanceRecords(data);
    } catch (error) {
      toast.error('Failed to load attendance records');
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const chartData = attendanceRecords.map(record => ({
    month: formatMonth(record.month),
    present: record.present_days,
    absent: record.working_days - record.present_days,
    percentage: Math.round((record.present_days / record.working_days) * 100),
  }));

  const totalWorkingDays = attendanceRecords.reduce((sum, record) => sum + record.working_days, 0);
  const totalPresentDays = attendanceRecords.reduce((sum, record) => sum + record.present_days, 0);
  const totalAbsentDays = totalWorkingDays - totalPresentDays;

  const pieData = [
    { name: 'Present', value: totalPresentDays, color: '#10b981' },
    { name: 'Absent', value: totalAbsentDays, color: '#ef4444' },
  ];

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 90) return { status: 'Excellent', color: 'text-green-400', bgColor: 'badge-excellent' };
    if (percentage >= 80) return { status: 'Good', color: 'text-blue-400', bgColor: 'badge-good' };
    if (percentage >= 75) return { status: 'Average', color: 'text-yellow-400', bgColor: 'badge-average' };
    return { status: 'Poor', color: 'text-red-400', bgColor: 'badge-poor' };
  };

  // Safe attendance percentage handling
  const attendancePercentage = user?.attendancePercentage || 0;
  const safeAttendancePercentage = typeof attendancePercentage === 'number' ? attendancePercentage : parseFloat(attendancePercentage) || 0;
  const attendanceStatus = getAttendanceStatus(safeAttendancePercentage);

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
          <Star className="h-8 w-8 text-yellow-400" />
          <span className="gold-text">Welcome back, {user?.name}!</span>
        </div>
      }
      subtitle="Track your academic journey with detailed attendance insights"
    >
      <div className="space-y-8 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card hover-lift">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl">
                <TrendingUp className="h-8 w-8 text-black" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Overall Attendance</p>
                <p className="text-3xl font-bold gold-text">
                  {safeAttendancePercentage.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${attendanceStatus.bgColor}`}>
              {attendanceStatus.status}
            </div>
          </div>

          <div className="stat-card hover-lift">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Present Days</p>
                <p className="text-3xl font-bold text-green-400">{totalPresentDays}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Days attended</p>
          </div>

          <div className="stat-card hover-lift">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Absent Days</p>
                <p className="text-3xl font-bold text-red-400">{totalAbsentDays}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Days missed</p>
          </div>

          <div className="stat-card hover-lift">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Days</p>
                <p className="text-3xl font-bold text-purple-400">{totalWorkingDays}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Working days</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Attendance Chart */}
          <div className="chart-container animate-slide-up">
            <div className="flex items-center mb-6">
              <BarChart className="h-6 w-6 text-yellow-400 mr-3" />
              <h3 className="text-xl font-bold gold-text">Monthly Attendance</h3>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(251, 191, 36, 0.2)" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: '#e5e7eb' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: '#e5e7eb' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #fbbf24',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="present" fill="#10b981" name="Present Days" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="#ef4444" name="Absent Days" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-400">
                <div className="text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-lg">No attendance data available</p>
                  <p className="text-sm mt-2">Your records will appear here once uploaded</p>
                </div>
              </div>
            )}
          </div>

          {/* Attendance Distribution */}
          <div className="chart-container animate-slide-up">
            <div className="flex items-center mb-6">
              <Award className="h-6 w-6 text-yellow-400 mr-3" />
              <h3 className="text-xl font-bold gold-text">Attendance Distribution</h3>
            </div>
            {totalWorkingDays > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #fbbf24',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-8 mt-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-300">Present ({totalPresentDays})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-gray-300">Absent ({totalAbsentDays})</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-400">
                <div className="text-center">
                  <Award className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-lg">No attendance data available</p>
                  <p className="text-sm mt-2">Your distribution will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Attendance Records */}
        <div className="card animate-slide-up">
          <div className="card-header">
            <h3 className="text-xl font-bold">Recent Attendance Records</h3>
          </div>
          <div className="overflow-x-auto">
            {attendanceRecords.length > 0 ? (
              <table className="min-w-full">
                <thead className="table-header">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Month</th>
                    <th className="px-6 py-4 text-left font-bold">Working Days</th>
                    <th className="px-6 py-4 text-left font-bold">Present Days</th>
                    <th className="px-6 py-4 text-left font-bold">Absent Days</th>
                    <th className="px-6 py-4 text-left font-bold">Percentage</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900">
                  {attendanceRecords.map((record) => {
                    const percentage = Math.round((record.present_days / record.working_days) * 100);
                    const status = getAttendanceStatus(percentage);
                    
                    return (
                      <tr key={record.id} className="table-row">
                        <td className="px-6 py-4 font-medium text-yellow-400">
                          {formatMonth(record.month)}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {record.working_days}
                        </td>
                        <td className="px-6 py-4 text-green-400 font-semibold">
                          {record.present_days}
                        </td>
                        <td className="px-6 py-4 text-red-400 font-semibold">
                          {record.working_days - record.present_days}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${status.bgColor}`}>
                            {percentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-16 text-center text-gray-400">
                <Calendar className="h-16 w-16 mx-auto mb-6 text-gray-600" />
                <p className="text-xl mb-2">No attendance records found</p>
                <p className="text-gray-500">Your attendance records will appear here once uploaded by admin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
