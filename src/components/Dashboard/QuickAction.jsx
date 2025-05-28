import { useNavigate } from "react-router-dom";
import { Users, Building2, TrendingUp, Clock } from "lucide-react";

const QuickAction = ({ recentActivities = [], formatActivityTime }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="space-y-3">
          <button
            onClick={() => navigate("/students")}
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
            onClick={() => navigate("/universities")}
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
            onClick={() => navigate("/assessments")}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <TrendingUp className="text-primary-600 mr-3" size={20} />
              <div>
                <span className="font-medium">Create Assessment</span>
                <p className="text-sm text-gray-500">
                  Evaluate student profile
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="lg:col-span-2 card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activities
          </h3>
          <button
            onClick={() => navigate("/reports")}
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
                      <p className="text-xs text-gray-500">
                        {formatActivityTime(activity.time)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickAction;
