'use client';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { FiHome, FiCalendar, FiFileText, FiActivity, FiImage, FiList, FiHeart, FiUser } from 'react-icons/fi';

const navItems = [
  { href: '/patient', label: 'Dashboard', icon: FiHome },
  { href: '/patient/appointments', label: 'Appointments', icon: FiCalendar },
  { href: '/patient/medical-records', label: 'Medical Records', icon: FiFileText },
  { href: '/patient/lab-results', label: 'Lab Results', icon: FiList },
  { href: '/patient/medical-images', label: 'Medical Images', icon: FiImage },
  { href: '/patient/medications', label: 'Medications', icon: FiHeart },
  { href: '/patient/vitals', label: 'Vital Signs', icon: FiActivity },
  { href: '/patient/profile', label: 'My Profile', icon: FiUser },
];

export default function PatientLayout({ children }) {
  return (
    <DashboardLayout navItems={navItems} title="Patient Portal">
      {children}
    </DashboardLayout>
  );
}
