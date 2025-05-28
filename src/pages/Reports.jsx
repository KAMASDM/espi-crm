import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  ResponsiveContainer
} from 'recharts';
import { 
  Download, 
  Filter, 
  Calendar,
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  FileText,
  Eye
} from 'lucide-react';
import { 
  useEnquiries, 
  useUniversities, 
  useCourses, 
  useAssessments, 
  useApplications, 
  usePayments 
} from '../hooks/useFirestore';

const Reports = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('30');
  const [selectedReport, setSelectedReport] = useState('overview');
  
  // Get data from hooks
  const { data: enquiries } = useEnquiries();
  const { data: universities } = useUniversities();
  const { data: courses } = useCourses();
  const { data: assessments } = useAssessments();
  const { data: applications } = useApplications();
  const { data: payments } = usePayments();

  // Sample data for charts (in real app, this would be calculated from actual data)
  const enrollmentData = [
    { month: 'Jan', students: 45, applications: 52 },
    { month: 'Feb', students: 52, applications: 61 },
    { month: 'Mar', students: 48, applications: 55 },
    { month: 'Apr', students: 61, applications: 72 },
    { month: 'May', students: 55, applications: 63 },
    { month: 'Jun', students: 67, applications: 78 },
  ];

  const countryData = [
    { name: 'Canada', value: 35, color: '#3B82F6' },
    { name: 'USA', value: 25, color: '#10B981' },
    { name: 'UK', value: 20, color: '#F59E0B' },
    { name: 'Australia', value: 15, color: '#EF4444' },
    { name: 'Germany', value: 5, color: '#8B5CF6' },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 125000, target: 120000 },
    { month: 'Feb', revenue: 135000, target: 130000 },
    { month: 'Mar', revenue: 148000, target: 140000 },
    { month: 'Apr', revenue: 162000, target: 150000 },
    { month: 'May', revenue: 158000, target: 160000 },
    { month: 'Jun', revenue: 175000, target: 170000 },
  ];

  const conversionData = [
    { stage: 'Enquiry', count: 856, percentage: 100 },
    { stage: 'Assessment', count: 534, percentage: 62 },
    { stage: 'Application', count: 324, percentage: 38 },
    { stage: 'Admission', count: 198, percentage: 23 },
    { stage: 'Visa', count: 145, percentage: 17 },
  ];

  const topUniversities = [
    { name: 'University of Toronto', applications: 45, admissions: 32 },
    { name: 'Harvard University', applications: 38, admissions: 15 },
    { name: 'Oxford University', applications: 34, admissions: 18 },
    { name: 'Stanford University', applications: 29, admissions: 12 },
    { name: 'MIT', applications: 25, admissions: 10 },
  ];

  const handleExport = (reportType) => {
    // TODO: Implement export functionality
    alert(`Exporting ${reportType} report...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your education consultancy performance</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          
          <button
            onClick={() => handleExport('comprehensive')}
            className="btn-secondary flex items-center"
          >
            <Download size={20} className="mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{enquiries.length}</p>
              <p className="text-sm text-green-600">+12% from last month</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Universities</p>
              <p className="text-2xl font-bold text-gray-900">{universities.length}</p>
              <p className="text-sm text-green-600">+3 new partnerships</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Building2 className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              <p className="text-sm text-green-600">+8% success rate</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FileText className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹12.5L</p>
              <p className="text-sm text-green-600">+15% from target</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: TrendingUp },
            { id: 'enrollment', name: 'Enrollment', icon: Users },
            { id: 'revenue', name: 'Revenue', icon: DollarSign },
            { id: 'performance', name: 'Performance', icon: BarChart },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedReport(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  selectedReport === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} className="mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Report Content */}
      <div className="space-y-6">
        {selectedReport === 'overview' && (
          <>
            {/* Student Enrollment Trends */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Student Enrollment Trends</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <Eye size={20} />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="students" stroke="#3B82F6" strokeWidth={2} name="Students" />
                  <Line type="monotone" dataKey="applications" stroke="#10B981" strokeWidth={2} name="Applications" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Country Preferences */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Country Preferences</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={countryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {countryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Conversion Funnel */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
                <div className="space-y-3">
                  {conversionData.map((stage, index) => (
                    <div key={stage.stage} className="flex items-center">
                      <div className="w-20 text-sm font-medium text-gray-700">{stage.stage}</div>
                      <div className="flex-1 mx-4">
                        <div className="bg-gray-200 rounded-full h-6">
                          <div
                            className="bg-gradient-to-r from-primary-500 to-primary-600 h-6 rounded-full flex items-center justify-center"
                            style={{ width: `${stage.percentage}%` }}
                          >
                            <span className="text-white text-xs font-medium">{stage.percentage}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-16 text-sm text-gray-600 text-right">{stage.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {selectedReport === 'enrollment' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Enrollment */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Enrollment</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="students" fill="#3B82F6" name="Enrolled Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Universities */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Universities by Applications</h3>
              <div className="space-y-4">
                {topUniversities.map((uni, index) => (
                  <div key={uni.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary-600 text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{uni.name}</p>
                        <p className="text-xs text-gray-500">{uni.applications} applications</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">{uni.admissions} admitted</p>
                      <p className="text-xs text-gray-500">
                        {Math.round((uni.admissions / uni.applications) * 100)}% success
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'revenue' && (
          <>
            {/* Revenue vs Target */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Target</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${value / 1000}K`} />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10B981" name="Actual Revenue" />
                  <Bar dataKey="target" fill="#E5E7EB" name="Target Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Counseling Revenue</h4>
                <p className="text-2xl font-bold text-gray-900">₹4.2L</p>
                <p className="text-sm text-green-600">+18% from last month</p>
              </div>
              <div className="card">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Application Revenue</h4>
                <p className="text-2xl font-bold text-gray-900">₹6.8L</p>
                <p className="text-sm text-green-600">+12% from last month</p>
              </div>
              <div className="card">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Visa Revenue</h4>
                <p className="text-2xl font-bold text-gray-900">₹1.5L</p>
                <p className="text-sm text-green-600">+25% from last month</p>
              </div>
            </div>
          </>
        )}

        {selectedReport === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Performance */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
              <div className="space-y-4">
                {[
                  { name: 'John Doe', applications: 45, success: 38, rate: 84 },
                  { name: 'Sarah Wilson', applications: 42, success: 35, rate: 83 },
                  { name: 'Mike Johnson', applications: 38, success: 30, rate: 79 },
                  { name: 'Lisa Chen', applications: 35, success: 26, rate: 74 },
                ].map((member) => (
                  <div key={member.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.applications} applications</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{member.rate}% success</p>
                      <p className="text-xs text-gray-500">{member.success} successful</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Processing Times */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Processing Times</h3>
              <div className="space-y-4">
                {[
                  { stage: 'Enquiry to Assessment', time: '2.3 days', status: 'good' },
                  { stage: 'Assessment to Application', time: '5.1 days', status: 'average' },
                  { stage: 'Application to Admission', time: '18.5 days', status: 'good' },
                  { stage: 'Admission to Visa', time: '12.2 days', status: 'average' },
                ].map((item) => (
                  <div key={item.stage} className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">{item.stage}</p>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">{item.time}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === 'good' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;