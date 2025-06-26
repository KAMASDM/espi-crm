import React, { useState } from "react";
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
  CalendarSync,
  ChartBarBig,
  Notebook,
  ChevronDown,
} from "lucide-react";
import { USER_ROLES } from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { userProfile } = useAuth();
  const [isMasterMenuOpen, setMasterMenuOpen] = useState(false);

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
      icon: ChartBarBig,
      roles: [
        USER_ROLES.SUPERADMIN,
        USER_ROLES.BRANCH_ADMIN,
        USER_ROLES.PROCESSOR,
      ],
    },
    {
      name: "Visa Applications",
      href: "/visaApplications",
      icon: CalendarSync,
      roles: [USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN],
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
      name: "Chat",
      href: "/chat",
      icon: MessageCircle,
      roles: Object.values(USER_ROLES),
    },
    {
      name: "Master",
      icon: Briefcase,
      roles: [
        USER_ROLES.SUPERADMIN,
        USER_ROLES.BRANCH_ADMIN,
        USER_ROLES.COUNSELLOR,
        USER_ROLES.PROCESSOR,
      ],
      children: [
        {
          name: "Visa Documents",
          href: "/visaDocuments",
          icon: Notebook,
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
          name: "Users",
          href: "/users",
          icon: UsersIcon,
          roles: [USER_ROLES.SUPERADMIN],
        },
      ],
    },
  ];

  const navigation = baseNavigation
    .map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter(
          (child) => userProfile && child.roles.includes(userProfile.role)
        );
        if (filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }
        return null;
      }
      return userProfile && item.roles.includes(userProfile.role) ? item : null;
    })
    .filter(Boolean);

  const isCurrentPage = (href) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const isMasterActive =
    baseNavigation
      .find((item) => item.name === "Master")
      ?.children?.some((child) => isCurrentPage(child.href)) || false;

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
              if (item.children) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setMasterMenuOpen(!isMasterMenuOpen)}
                      className={`w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isMasterActive
                          ? "bg-primary-100 text-primary-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon
                          size={20}
                          className={`mr-3 ${
                            isMasterActive
                              ? "text-primary-700"
                              : "text-gray-400 group-hover:text-gray-500"
                          }`}
                        />
                        {item.name}
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          isMasterMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isMasterMenuOpen && (
                      <div className="mt-1 space-y-1 pl-6">
                        {item.children.map((child) => {
                          const isChildCurrent = isCurrentPage(child.href);
                          return (
                            <Link
                              key={child.name}
                              to={child.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                isChildCurrent
                                  ? "bg-primary-50 text-primary-600"
                                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                              }`}
                            >
                              <child.icon
                                size={18}
                                className={`mr-3 ${
                                  isChildCurrent
                                    ? "text-primary-600"
                                    : "text-gray-400 group-hover:text-gray-500"
                                }`}
                              />
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
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
