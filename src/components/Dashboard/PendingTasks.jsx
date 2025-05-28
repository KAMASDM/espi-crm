import { useNavigate } from "react-router-dom";

const PendingTasks = ({ pendingTasks }) => {
  const navigate = useNavigate();
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Pending Tasks
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
          onClick={() => navigate("/students")}
        >
          <h4 className="font-medium text-yellow-900">Follow-ups Required</h4>
          <p className="text-2xl font-bold text-yellow-900 mt-1">
            {pendingTasks.followUps}
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            New enquiries awaiting response
          </p>
        </div>
        <div
          className="p-4 border border-blue-200 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => navigate("/assessments")}
        >
          <h4 className="font-medium text-blue-900">Pending Assessments</h4>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {pendingTasks.pendingApplications}
          </p>
          <p className="text-sm text-blue-700 mt-1">Assessments to review</p>
        </div>
        <div
          className="p-4 border border-green-200 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
          onClick={() => navigate("/payments")}
        >
          <h4 className="font-medium text-green-900">Payments Due</h4>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {pendingTasks.paymentsDue}
          </p>
          <p className="text-sm text-green-700 mt-1">Outstanding payments</p>
        </div>
      </div>
    </div>
  );
};

export default PendingTasks;
