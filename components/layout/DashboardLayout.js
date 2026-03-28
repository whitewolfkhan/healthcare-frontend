'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FiHeart, FiMenu, FiX, FiLogOut, FiChevronDown, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuthStore from '../../lib/store';
import { authAPI } from '../../lib/api';
import NotificationPanel from '../ui/NotificationPanel';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function DashboardLayout({ children, navItems, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, logout, initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch {}
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const avatarUrl = user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${BACKEND_URL}${user.avatar}`) : null;
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U';

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <span className="text-gray-500 text-sm">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 shadow-lg z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:shadow-none flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiHeart className="text-white text-base" />
          </div>
          <div>
            <div className="font-bold text-gray-900 leading-tight">HealthCare</div>
            <div className="text-xs text-gray-400">Chattagram</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-gray-400 hover:text-gray-600">
            <FiX size={18} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm overflow-hidden flex-shrink-0">
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 text-sm truncate">{user ? `${user.firstName} ${user.lastName}` : 'User'}</div>
              <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}
              >
                <item.icon size={17} className="flex-shrink-0" />
                <span>{item.label}</span>
                {item.badge && <span className="ml-auto badge badge-red text-xs">{item.badge}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button onClick={handleLogout} className="sidebar-link-inactive w-full text-red-500 hover:bg-red-50 hover:text-red-600">
            <FiLogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden">
              <FiMenu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <NotificationPanel />

            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs overflow-hidden">
                  {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.firstName}</span>
                <FiChevronDown size={14} className="text-gray-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-50">
                    <div className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</div>
                    <div className="text-xs text-gray-400">{user?.email}</div>
                  </div>
                  <button onClick={() => { setUserMenuOpen(false); router.push(`/${user?.role}/profile`); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <FiUser size={14} /> My Profile
                  </button>
                  <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
