'use client';
import Link from 'next/link';
import { FiHeart, FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-teal-700 flex items-center justify-center p-4">
      <div className="text-center text-white">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center">
            <FiHeart className="text-white text-3xl" />
          </div>
        </div>
        <h1 className="text-8xl font-extrabold text-white/20 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-blue-200 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors">
          <FiArrowLeft size={16} /> Go Back Home
        </Link>
      </div>
    </div>
  );
}
