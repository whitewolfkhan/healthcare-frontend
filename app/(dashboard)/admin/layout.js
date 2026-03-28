'use client';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { FiHome, FiUsers, FiActivity, FiGrid, FiUser } from 'react-icons/fi';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: FiHome },
  { href: '/admin/users', label: 'User Management', icon: FiUsers },
  { href: '/admin/departments', label: 'Departments', icon: FiGrid },
  { href: '/admin/analytics', label: 'Analytics', icon: FiActivity },
  { href: '/admin/profile', label: 'My Profile', icon: FiUser },
];

export default function AdminLayout({ children }) {
  return (
    <DashboardLayout navItems={navItems} title="Admin Panel">
      {children}
    </DashboardLayout>
  );
}
