import React, { useState } from "react";
import moment from "moment";
import { Menu, LogOut, Shield, Bell, X, Eye, XCircle } from "lucide-react";
import { signOutUser } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";
import { USER_ROLES } from "../../utils/constants";
import { useNotifications } from "../../hooks/useNotifications";

const Header = ({ setSidebarOpen }) => {
  const { user, userProfile } = useAuth();
  const { unreadCount, notifications, deleteNotification } = useNotifications();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

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
    if (role === USER_ROLES.SUPERADMIN) {
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      roleName = "Super Admin";
    } else if (role === USER_ROLES.BRANCH_ADMIN) {
      bgColor = "bg-purple-100";
      textColor = "text-purple-800";
      roleName = "Branch Admin";
    } else if (
      role === USER_ROLES.COUNSELLOR ||
      role === USER_ROLES.PROCESSOR
    ) {
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      roleName = role === USER_ROLES.COUNSELLOR ? "Counsellor" : "Processor";
    } else if (
      role === USER_ROLES.RECEPTION ||
      role === USER_ROLES.ACCOUNTANT
    ) {
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      roleName = role === USER_ROLES.RECEPTION ? "Receptionist" : "Accountant";
    } else if (role === USER_ROLES.AGENT) {
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

  const isSuperadminOrBranchAdmin =
    userProfile?.role === USER_ROLES.SUPERADMIN ||
    userProfile?.role === USER_ROLES.BRANCH_ADMIN;

  const formatNotificationTime = (timestamp) => {
    if (!timestamp?.toDate) return "Just now";
    const now = moment();
    const notificationTime = moment(timestamp.toDate());
    const diffInMinutes = now.diff(notificationTime, "minutes");
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (now.isSame(notificationTime, "day"))
      return notificationTime.format("h:mm A");
    if (now.subtract(1, "day").isSame(notificationTime, "day"))
      return `Yesterday ${notificationTime.format("h:mm A")}`;
    if (now.isSame(notificationTime, "year"))
      return notificationTime.format("MMM D");
    return notificationTime.format("MMM D, YYYY");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isSuperadminOrBranchAdmin && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotificationMenu(!showNotificationMenu);
                  setShowUserMenu(false);
                }}
                className="p-2 rounded-full hover:bg-gray-100 relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Notifications"
                aria-label={`Notifications ${
                  unreadCount > 0 ? `(${unreadCount} unread)` : ""
                }`}
              >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white transform translate-x-1/4 -translate-y-1/4">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotificationMenu && (
                <div
                  className="fixed sm:absolute right-0 mt-2 w-full sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 divide-y divide-gray-200 max-h-[calc(100vh-8rem)] flex flex-col"
                  style={{ top: "2.5rem" }}
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Notifications {unreadCount > 0 && `(${unreadCount})`}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowNotificationMenu(false)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        aria-label="Close notifications"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="px-6 py-8 text-center">
                        <Bell
                          size={32}
                          className="mx-auto text-gray-400 mb-2"
                        />
                        <p className="text-gray-500">No notifications yet</p>
                        <p className="text-xs text-gray-400 mt-1">
                          We'll notify you when something arrives
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 transition-colors duration-150 ${
                            !notification.readBy?.includes(user.uid)
                              ? "bg-blue-50"
                              : "bg-white"
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between">
                                <p
                                  className={`text-sm ${
                                    !notification.readBy?.includes(user.uid)
                                      ? "font-semibold text-gray-900"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {notification.title}
                                </p>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                    className="text-red-500 hover:text-red-700 focus:outline-none"
                                    title="Delete"
                                    aria-label="Delete notification"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.body}
                              </p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-400">
                                  {formatNotificationTime(
                                    notification.timestamp
                                  )}
                                </span>
                                {notification.link && (
                                  <button
                                    onClick={() => {
                                      window.open(notification.link, "_blank");
                                    }}
                                    className="text-xs text-blue-600 hover:underline flex items-center focus:outline-none"
                                    aria-label="View notification details"
                                  >
                                    <Eye size={14} className="mr-1" />
                                    View
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotificationMenu(false);
              }}
              className="flex items-center space-x-2 sm:space-x-3 p-0.5 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="User menu"
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
              <span className="hidden sm:inline text-sm font-medium text-gray-700">
                {user?.displayName}
                {userProfile?.role && (
                  <div className="mt-1">{getRoleBadge(userProfile.role)}</div>
                )}
              </span>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.displayName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center focus:outline-none"
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
