// src/components/common/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, Home, Users, Building2, BookOpen, ClipboardList, 
  FileText, CreditCard, BarChart3, MessageCircle, GraduationCap,
  Users as UsersIcon, // For User Management
  Briefcase // For Branch Management (example icon)
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; //
import { USER_ROLES } from '../../utils/constants'; //

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { userProfile } = useAuth(); // Get user profile for role checks

  const baseNavigation = [
    { name: 'Dashboard', href: '/', icon: Home, roles: Object.values(USER_ROLES) }, // Accessible by all
    { name: 'Students', href: '/students', icon: Users, roles: [USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.COUNSELLOR, USER_ROLES.RECEPTION] },
    { name: 'Universities', href: '/universities', icon: Building2, roles: [USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.COUNSELLOR, USER_ROLES.PROCESSOR] }, // Example, adjust roles
    { name: 'Courses', href: '/courses', icon: BookOpen, roles: [USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.COUNSELLOR, USER_ROLES.PROCESSOR] },
    { name: 'Assessments', href: '/assessments', icon: ClipboardList, roles: [USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.PROCESSOR, USER_ROLES.COUNSELLOR] },
    { name: 'Applications', href: '/applications', icon: FileText, roles: [USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.PROCESSOR, USER_ROLES.COUNSELLOR] },
    { name: 'Payments', href: '/payments', icon: CreditCard, roles: [USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.ACCOUNTANT, USER_ROLES.RECEPTION] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: [USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.BRANCH_MANAGER] },
    { name: 'Chat', href: '/chat', icon: MessageCircle, roles: Object.values(USER_ROLES) },
  ];
  
  const adminNavigation = [
     { name: 'User Management', href: '/user-management', icon: UsersIcon, roles: [USER_ROLES.SUPERADMIN, USER_ROLES.BRANCH_ADMIN] },
     { name: 'Branch Management', href: '/branch-management', icon: Briefcase, roles: [USER_ROLES.SUPERADMIN] },
  ];

  const navigation = [...baseNavigation, ...adminNavigation].filter(item => 
    userProfile && item.roles.includes(userProfile.role)
  );


  const isCurrentPage = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:shadow-none md:border-r md:border-gray-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <GraduationCap className="text-primary-600" size={32} />
            <h2 className="ml-3 text-xl font-bold text-gray-900">ESPI-CRM</h2>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <nav className="mt-6 px-3 flex-1 overflow-y-auto pb-20"> {/* Added flex-1, overflow-y-auto and padding-bottom */}
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
                    current ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} className={`mr-3 ${current ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white"> {/* Added bg-white for sticky footer */}
          <div className="text-xs text-gray-500 text-center">ESPI CRM v1.1</div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;