import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  X,
  Home,
  Users,
  BookOpen,
  FileText,
  Building2,
  BarChart3,
  Briefcase,
  CreditCard,
  ClipboardList,
  MessageCircle,
  GraduationCap,
  Users as UsersIcon,
  AlignJustify,
} from "lucide-react";
import { USER_ROLES } from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { userProfile } = useAuth();

  const baseNavigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
      roles: Object.values(USER_ROLES),
    },
    {
      name: "Students",
      href: "/students",
      icon: Users,
      roles: [
        USER_ROLES.SUPERADMIN,
        USER_ROLES.BRANCH_ADMIN,
        USER_ROLES.COUNSELLOR,
        USER_ROLES.RECEPTION,
        USER_ROLES.AGENT,
      ],
    },
    {
      name: "Assessments",
      href: "/assessments",
      icon: ClipboardList,
      roles: [
        USER_ROLES.SUPERADMIN,
        USER_ROLES.BRANCH_ADMIN,
        USER_ROLES.PROCESSOR,
      ],
    },
    {
      name: "Applications",
      href: "/applications",
      icon: FileText,
      roles: [
        USER_ROLES.SUPERADMIN,
        USER_ROLES.BRANCH_ADMIN,
        USER_ROLES.PROCESSOR,
      ],
    },
    {
      name: "Payments",
      href: "/payments",
      icon: CreditCard,
      roles: [
        USER_ROLES.SUPERADMIN,
        USER_ROLES.BRANCH_ADMIN,
        USER_ROLES.ACCOUNTANT,
      ],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
      roles: [USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN],
    },
    {
      name: "Universities",
      href: "/universities",
      icon: Building2,
      roles: [
        USER_ROLES.SUPERADMIN,
        USER_ROLES.BRANCH_ADMIN,
        USER_ROLES.COUNSELLOR,
        USER_ROLES.PROCESSOR,
      ],
    },
    {
      name: "Courses",
      href: "/courses",
      icon: BookOpen,
      roles: [
        USER_ROLES.SUPERADMIN,
        USER_ROLES.BRANCH_ADMIN,
        USER_ROLES.COUNSELLOR,
        USER_ROLES.PROCESSOR,
      ],
    },
    {
      name: "Services",
      href: "/services",
      icon: GraduationCap,
      roles: [
        USER_ROLES.SUPERADMIN,
        USER_ROLES.BRANCH_ADMIN,
        USER_ROLES.COUNSELLOR,
        USER_ROLES.PROCESSOR,
      ],
    },
    {
      name: "Application Status",
      href: "/applicationStatus",
      icon: AlignJustify,
      roles: [
        USER_ROLES.SUPERADMIN,
        USER_ROLES.BRANCH_ADMIN,
        USER_ROLES.COUNSELLOR,
        USER_ROLES.PROCESSOR,
      ],
    },
    {
      name: "Branches",
      href: "/branches",
      icon: Briefcase,
      roles: [USER_ROLES.SUPERADMIN],
    },
    {
      name: "Chat",
      href: "/chat",
      icon: MessageCircle,
      roles: Object.values(USER_ROLES),
    },
    {
      name: "Users",
      href: "/users",
      icon: UsersIcon,
      roles: [USER_ROLES.SUPERADMIN],
    },
  ];

  const navigation = [...baseNavigation].filter(
    (item) => userProfile && item.roles.includes(userProfile.role)
  );

  const isCurrentPage = (href) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:shadow-none md:border-r md:border-gray-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <GraduationCap className="text-primary-600" size={32} />
            <h2 className="ml-3 text-xl font-bold text-gray-900">ESPI-CRM</h2>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="mt-6 px-3 flex-1 overflow-y-auto pb-20">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const current = isCurrentPage(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    current
                      ? "bg-primary-100 text-primary-700 border-r-2 border-primary-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    size={20}
                    className={`mr-3 ${
                      current
                        ? "text-primary-700"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="text-xs text-gray-500 text-center">ESPI CRM v1.1</div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
