import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import GoogleAuthProvider from '../components/providers/GoogleAuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HealthCare System - Chattagram',
  description: 'Comprehensive Healthcare Management System for Chattagram, Bangladesh',
  keywords: 'healthcare, hospital, doctors, appointments, medical records, Chattagram, Bangladesh',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleAuthProvider>
          {children}
        </GoogleAuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#fff', color: '#1f2937', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderRadius: '0.75rem', padding: '12px 16px', fontSize: '14px' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
