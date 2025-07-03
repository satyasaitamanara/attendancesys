import React, { useState } from 'react';
import PageLayout from '../components/Layout/PageLayout';
import { Upload, FileText, AlertCircle, CheckCircle, Download, Star, Cloud } from 'lucide-react';
import toast from 'react-hot-toast';
import '../index.css';

export default function UploadAttendance() {
  const [file, setFile] = useState<File | null>(null);
  const [month, setMonth] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const validateFile = (file: File) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a CSV or Excel file');
      return false;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB');
      return false;
    }

    return true;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !month) {
      toast.error('Please select a file and month');
      return;
    }

    setUploading(true);
    const token = localStorage.getItem('token');
    console.log("JWT Token:", token); // ✅ check this in browser console

    if (!token) {
      alert("User not logged in. Token is missing.");
      return;
    }


    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('month', month);

      const token = localStorage.getItem('token');
      

      const response = await fetch('https://attendancesys-yn0k.onrender.com/api/attendance/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      toast.success(`Successfully uploaded attendance for ${data.recordsProcessed} students`);
      setFile(null);
      setMonth('');
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `roll_no,working_days,present_days
'248865100001',22,20
'248865100002',22,18
'248865100003',22,21`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return now.toISOString().slice(0, 7); // YYYY-MM format
  };

  return (
    <PageLayout 
      title={
        <div className="flex items-center space-x-3">
          <Cloud className="h-8 w-8 text-yellow-400" />
          <span className="gold-text">Upload Attendance</span>
        </div>
      }
      subtitle="Import attendance data from CSV or Excel files with ease"
    >
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-400/30 rounded-xl p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-blue-400 mt-1 mr-4 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-blue-400 mb-3">File Format Requirements</h3>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-2" />
                  File must be in CSV or Excel format (.csv, .xlsx, .xls)
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-2" />
                  Required columns: "Roll No", "Working Days", "Present Days"
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-2" />
                  Roll numbers must match existing student records
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-2" />
                  Present days cannot exceed working days
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-2" />
                  Maximum file size: 5MB
                </li>
              </ul>
              <button
                onClick={downloadTemplate}
                className="btn-primary mt-4 inline-flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </button>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="card animate-slide-up">
          <div className="card-header">
            <div className="flex items-center">
              <Upload className="h-6 w-6 mr-3" />
              <h3 className="text-xl font-bold">Upload Attendance Data</h3>
            </div>
          </div>
          <div className="p-6">
            <form onSubmit={handleUpload} className="space-y-8">
              {/* Month Selection */}
              <div>
                <label htmlFor="month" className="block text-sm font-semibold text-yellow-400 mb-3">
                  Select Month
                </label>
                <input
                  type="month"
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  max={getCurrentMonth()}
                  className="input-field max-w-xs "
                  required
                />
              </div>

              {/* File Upload */}
                <label htmlFor="file_upload" className="block text-sm font-semibold text-yellow-400 mb-3">
                  Upload Attendance File
                </label>
             <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : file
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              {/* Only the label triggers the file upload */}
              <label
                htmlFor="file-upload"
                className="absolute inset-0 cursor-pointer z-10"
              ></label>

              {/* File input hidden */}
              <input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Upload content */}
              <div className="text-center pointer-events-none">
                {file ? (
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-800">{file.name}</p>
                      <p className="text-xs text-green-600">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600 hover:text-blue-500">
                          Click to upload
                        </span>{' '}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        CSV, XLSX, XLS up to 5MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>


              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!file || !month || uploading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <div className="flex items-center">
                      <div className="loading-spinner w-5 h-5 mr-2"></div>
                      Uploading...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Attendance
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sample Data Preview */}
        <div className="card animate-slide-up">
          <div className="card-header">
            <div className="flex items-center">
              <FileText className="h-6 w-6 mr-3" />
              <h3 className="text-xl font-bold">Sample Data Format</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Roll No</th>
                  <th className="px-6 py-4 text-left font-bold">Working Days</th>
                  <th className="px-6 py-4 text-left font-bold">Present Days</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900">
                <tr className="table-row">
                  <td className="px-6 py-4 font-semibold text-yellow-400">ST001</td>
                  <td className="px-6 py-4 text-white">22</td>
                  <td className="px-6 py-4 text-green-400 font-semibold">20</td>
                </tr>
                <tr className="table-row">
                  <td className="px-6 py-4 font-semibold text-yellow-400">ST002</td>
                  <td className="px-6 py-4 text-white">22</td>
                  <td className="px-6 py-4 text-green-400 font-semibold">18</td>
                </tr>
                <tr className="table-row">
                  <td className="px-6 py-4 font-semibold text-yellow-400">ST003</td>
                  <td className="px-6 py-4 text-white">22</td>
                  <td className="px-6 py-4 text-green-400 font-semibold">21</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
