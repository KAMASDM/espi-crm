import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, FileText, CreditCard, TrendingUp, Clock, Plus } from 'lucide-react';
import { 
  useEnquiries, 
  useUniversities, 
  useCourses, 
  useAssessments, 
  useApplications, 
  usePayments 
} from '../hooks/useFirestore';
import { useAuth } from '../context/AuthContext';
import { format, isToday, isYesterday, subDays } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get data from hooks
  const { data: enquiries } = useEnquiries();
  const { data: universities } = useUniversities();
  const { data: courses } = useCourses();
  const { data: assessments } = useAssessments();
  const { data: applications } = useApplications();
  const { data: payments } = usePayments();

  // Calculate statistics
  const totalRevenue = payments
    .filter(payment => payment.payment_status === 'Paid')
    .reduce((sum, payment) => sum + parseFloat(payment.payment_amount || 0), 0);

  const newEnquiriesLast7Days = enquiries.filter(enquiry => {
    if (!enquiry.createdAt) return false;
    const enquiryDate = enquiry.createdAt.toDate();
    return enquiryDate >= subDays(new Date(), 7);
  }).length;

  const totalActiveUniversities = universities.filter(uni => uni.Active).length;
  const totalActiveApplications = applications.filter(app => 
    ['Submitted', 'Under Review', 'Interview Scheduled'].includes(app.application_status)
  ).length;

  const stats = [
    {
      name: 'Total Students',
      value: enquiries.length.toString(),
      change: `+${newEnquiriesLast7Days}`,
      changeType: 'increase',
      changeText: 'new this week',
      icon: Users,
      color: 'bg-blue-500',
      href: '/students'
    },
    {
      name: 'Active Universities',
      value: totalActiveUniversities.toString(),
      change: `${universities.length}`,
      changeType: 'neutral',
      changeText: 'total partnerships',
      icon: Building2,
      color: 'bg-green-500',
      href: '/universities'
    },
    {
      name: 'Active Applications',
      value: totalActiveApplications.toString(),
      change: `${applications.length}`,
      changeType: 'neutral',
      changeText: 'total applications',
      icon: FileText,
      color: 'bg-purple-500',
      href: '/applications'
    },
    {
      name: 'Revenue',
      value: `₹${(totalRevenue / 100000).toFixed(1)}L`,
      change: '+15%',
      changeType: 'increase',
      changeText: 'from target',
      icon: CreditCard,
      color: 'bg-yellow-500',
      href: '/payments'
    }
  ];

  // Get recent activities
  const getRecentActivities = () => {
    const activities = [];

    // Recent enquiries
    enquiries
      .filter(enquiry => enquiry.createdAt)
      .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
      .slice(0, 3)
      .forEach(enquiry => {
        activities.push({
          id: `enquiry-${enquiry.id}`,
          type: 'enquiry',
          message: `New enquiry from ${enquiry.student_First_Name} ${enquiry.student_Last_Name}`,
          time: enquiry.createdAt.toDate(),
          icon: Users
        });
      });

    // Recent applications
    applications
      .filter(app => app.createdAt)
      .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
      .slice(0, 2)
      .forEach(app => {
        activities.push({
          id: `application-${app.id}`,
          type: 'application',
          message: `Application submitted for assessment ${app.application.slice(-8)}`,
          time: app.createdAt.toDate(),
          icon: FileText
        });
      });

    // Recent payments
    payments
      .filter(payment => payment.payment_date && payment.payment_status === 'Paid')
      .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
      .slice(0, 2)
      .forEach(payment => {
        activities.push({
          id: `payment-${payment.id}`,
          type: 'payment',
          message: `Payment received of ₹${parseFloat(payment.payment_amount).toLocaleString()}`,
          time: new Date(payment.payment_date),
          icon: CreditCard
        });
      });

    return activities
      .sort((a, b) => b.time - a.time)
      .slice(0, 5);
  };

  const formatActivityTime = (date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM dd');
    }
  };

  const recentActivities = getRecentActivities();

  // Get pending tasks
  const getPendingTasks = () => {
    const newEnquiries = enquiries.filter(enq => enq.enquiry_status === 'New').length;
    const pendingAssessments = assessments.filter(ass => ass.ass_status === 'Pending').length;
    const pendingPayments = payments.filter(pay => pay.payment_status === 'Pending').length;

    return {
      followUps: newEnquiries,
      pendingApplications: pendingAssessments,
      paymentsDue: pendingPayments
    };
  };

  const pendingTasks = getPendingTasks();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-gray-600">Here's what's happening with your education consultancy today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name} 
              className="card cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(stat.href)}
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <span className={`ml-2 text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{stat.changeText}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/students')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Users className="text-primary-600 mr-3" size={20} />
                <div>
                  <span className="font-medium">Add New Student</span>
                  <p className="text-sm text-gray-500">Create new enquiry</p>
                </div>
              </div>
            </button>
            <button 
              onClick={() => navigate('/universities')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Building2 className="text-primary-600 mr-3" size={20} />
                <div>
                  <span className="font-medium">Add University</span>
                  <p className="text-sm text-gray-500">New partnership</p>
                </div>
              </div>
            </button>
            <button 
              onClick={() => navigate('/assessments')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <TrendingUp className="text-primary-600 mr-3" size={20} />
                <div>
                  <span className="font-medium">Create Assessment</span>
                  <p className="text-sm text-gray-500">Evaluate student profile</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <button 
              onClick={() => navigate('/reports')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="mx-auto mb-2" size={48} />
                <p>No recent activities</p>
              </div>
            ) : (
              recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Icon className="text-gray-600" size={16} />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <div className="flex items-center mt-1">
                        <Clock className="text-gray-400 mr-1" size={12} />
                        <p className="text-xs text-gray-500">{formatActivityTime(activity.time)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
            onClick={() => navigate('/students')}
          >
            <h4 className="font-medium text-yellow-900">Follow-ups Required</h4>
            <p className="text-2xl font-bold text-yellow-900 mt-1">{pendingTasks.followUps}</p>
            <p className="text-sm text-yellow-700 mt-1">New enquiries awaiting response</p>
          </div>
          <div 
            className="p-4 border border-blue-200 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => navigate('/assessments')}
          >
            <h4 className="font-medium text-blue-900">Pending Assessments</h4>
            <p className="text-2xl font-bold text-blue-900 mt-1">{pendingTasks.pendingApplications}</p>
            <p className="text-sm text-blue-700 mt-1">Assessments to review</p>
          </div>
          <div 
            className="p-4 border border-green-200 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
            onClick={() => navigate('/payments')}
          >
            <h4 className="font-medium text-green-900">Payments Due</h4>
            <p className="text-2xl font-bold text-green-900 mt-1">{pendingTasks.paymentsDue}</p>
            <p className="text-sm text-green-700 mt-1">Outstanding payments</p>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month's Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Enquiries</span>
              <span className="text-sm font-medium text-gray-900">{newEnquiriesLast7Days * 4}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Applications Submitted</span>
              <span className="text-sm font-medium text-gray-900">{applications.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Revenue Generated</span>
              <span className="text-sm font-medium text-gray-900">₹{(totalRevenue / 100000).toFixed(1)}L</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-medium text-green-600">78%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Data Records</span>
              <span className="text-sm font-medium text-gray-900">
                {enquiries.length + universities.length + courses.length + assessments.length + applications.length + payments.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="text-sm font-medium text-gray-900">1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Data Sync Status</span>
              <span className="text-sm font-medium text-green-600">✓ Synchronized</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-sm font-medium text-gray-900">Auto-saved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;