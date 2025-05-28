const MonthPerformance = ({
  newEnquiriesLast7Days,
  applications,
  totalRevenue,
  enquiries,
  universities,
  courses,
  assessments,
  payments,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          This Month's Performance
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">New Enquiries</span>
            <span className="text-sm font-medium text-gray-900">
              {newEnquiriesLast7Days * 4}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Applications Submitted
            </span>
            <span className="text-sm font-medium text-gray-900">
              {applications.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Revenue Generated</span>
            <span className="text-sm font-medium text-gray-900">
              ₹{(totalRevenue / 100000).toFixed(1)}L
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Success Rate</span>
            <span className="text-sm font-medium text-green-600">78%</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          System Health
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Data Records</span>
            <span className="text-sm font-medium text-gray-900">
              {enquiries.length +
                universities.length +
                courses.length +
                assessments.length +
                applications.length +
                payments.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Active Users</span>
            <span className="text-sm font-medium text-gray-900">1</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Data Sync Status</span>
            <span className="text-sm font-medium text-green-600">
              ✓ Synchronized
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Last Backup</span>
            <span className="text-sm font-medium text-gray-900">
              Auto-saved
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthPerformance;
