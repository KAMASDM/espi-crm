import React, { useState } from "react";
import { Menu, User, LogOut, Shield } from "lucide-react";
import { signOutUser } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";

const Header = ({ setSidebarOpen }) => {
  const { user, userProfile } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.log("error", error);
    }
  };

  const getRoleBadge = (role) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-800";
    let roleName = "";

    if (role === "Superadmin") {
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      roleName = "Super Admin";
    } else if (role === "Branch Admin" || role === "Branch Manager") {
      bgColor = "bg-purple-100";
      textColor = "text-purple-800";
      roleName = "Branch Admin";
    } else if (role === "Counsellor" || role === "Processor") {
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      roleName = role === "Counsellor" ? "Counsellor" : "Processor";
    } else if (role === "Reception" || role === "Accountant") {
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      roleName = role === "Reception" ? "Receptionist" : "Accountant";
    } else if (role === "Agent") {
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      roleName = "Agent";
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
      >
        <Shield size={12} className="mr-1" /> {roleName}
      </span>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-0.5 rounded-lg hover:bg-gray-100"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-xs uppercase">
                  {user.displayName
                    ? user.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                    : ""}
                </div>
              )}
              <span className="text-sm font-medium text-gray-700">
                {user?.displayName}
                {userProfile?.role && (
                  <div className="mt-1">{getRoleBadge(userProfile.role)}</div>
                )}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.displayName}
                  </p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
