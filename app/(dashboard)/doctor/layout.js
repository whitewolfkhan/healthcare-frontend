'use client';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { FiHome, FiCalendar, FiUsers, FiFileText, FiList, FiUser } from 'react-icons/fi';

const navItems = [
  { href: '/doctor', label: 'Dashboard', icon: FiHome },
  { href: '/doctor/appointments', label: 'Appointments', icon: FiCalendar },
  { href: '/doctor/patients', label: 'My Patients', icon: FiUsers },
  { href: '/doctor/prescriptions', label: 'Prescriptions', icon: FiFileText },
  { href: '/doctor/lab-results', label: 'Lab Results', icon: FiList },
  { href: '/doctor/profile', label: 'My Profile', icon: FiUser },
];

export default function DoctorLayout({ children }) {
  return (
    <DashboardLayout navItems={navItems} title="Doctor Portal">
      {children}
    </DashboardLayout>
  );
}
