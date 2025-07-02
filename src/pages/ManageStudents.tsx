import React, { useState, useEffect } from 'react';
import PageLayout from '../components/Layout/PageLayout';
import { Plus, Search, Edit, Trash2, Users, UserPlus, Star, Crown } from 'lucide-react';
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

export default function ManageStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data);
    } catch (error) {
      toast.error('Failed to load students');
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add student');
      }

      toast.success('Student added successfully');
      setShowAddModal(false);
      setFormData({ name: '', rollNo: '', email: '', password: '' });
      fetchStudents();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add student');
    } finally {
      setSubmitting(false);
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
          <Users className="h-8 w-8 text-yellow-400" />
          <span className="gold-text">Manage Students</span>
        </div>
      }
      subtitle="Add, edit, and manage student records with comprehensive attendance tracking"
    >
      <div className="space-y-8 animate-fade-in">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search students by name, roll number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 w-full sm:w-96"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add New Student
          </button>
        </div>

        {/* Students Table */}
        <div className="card animate-slide-up">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="h-6 w-6 mr-3" />
                <h3 className="text-xl font-bold">Student Records</h3>
              </div>
              <div className="text-black font-semibold">
                {filteredStudents.length} of {students.length} students
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {filteredStudents.length > 0 ? (
              <table className="min-w-full">
                <thead className="table-header">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Student</th>
                    <th className="px-6 py-4 text-left font-bold">Roll No</th>
                    <th className="px-6 py-4 text-left font-bold">Email</th>
                    <th className="px-6 py-4 text-left font-bold">Attendance</th>
                    <th className="px-6 py-4 text-left font-bold">Status</th>
                    <th className="px-6 py-4 text-left font-bold">Joined</th>
                    <th className="px-6 py-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900">
                  {filteredStudents.map((student) => {
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
                        <td className="px-6 py-4 font-bold text-yellow-400">
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
                        <td className="px-6 py-4 text-gray-300">
                          {new Date(student.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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
                {searchTerm ? (
                  <p className="text-gray-500 mb-6">Try adjusting your search terms</p>
                ) : (
                  <p className="text-gray-500 mb-6">Add your first student to get started</p>
                )}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary inline-flex items-center"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add Student
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up">
            <div className="card-header">
              <div className="flex items-center">
                <UserPlus className="h-6 w-6 mr-3" />
                <h3 className="text-xl font-bold">Add New Student</h3>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddStudent} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-yellow-400 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter student's full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-yellow-400 mb-2">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    className="input-field"
                    placeholder="Enter roll number (e.g., ST006)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-yellow-400 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-yellow-400 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    placeholder="Enter password"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="flex items-center">
                        <div className="loading-spinner w-4 h-4 mr-2"></div>
                        Adding...
                      </div>
                    ) : (
                      'Add Student'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}