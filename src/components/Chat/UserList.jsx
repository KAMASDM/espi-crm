import React from "react";
import { Circle } from "lucide-react";

const UserList = ({ users }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "text-green-500";
      case "away":
        return "text-yellow-500";
      case "offline":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "online":
        return "Online";
      case "away":
        return "Away";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="p-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Team Members</h4>
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
          >
            <div className="relative">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {user.name[0]}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1">
                <Circle
                  size={12}
                  className={`${getStatusColor(user.status)} fill-current`}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className={`text-xs ${getStatusColor(user.status)}`}>
                {getStatusText(user.status)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
