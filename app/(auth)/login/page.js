'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiHeart, FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { authAPI } from '../../../lib/api';
import { setAuth, getDashboardPath } from '../../../lib/auth';
import useAuthStore from '../../../lib/store';
import GoogleAuthButton from '../../../components/ui/GoogleAuthButton';

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.login(data);
      const { user, token, refreshToken, profile } = res.data.data;
      setUser(user, token, profile);
      localStorage.setItem('refreshToken', refreshToken);
      toast.success(`Welcome back, ${user.firstName}!`);
      router.push(getDashboardPath(user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-teal-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <FiArrowLeft size={14} /> Back to home
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur border border-white/20 rounded-2xl flex items-center justify-center">
              <FiHeart className="text-white text-2xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Welcome Back</h1>
          <p className="text-blue-200">Sign in to your healthcare account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                  type="email"
                  placeholder="you@example.com"
                  className={`input-field pl-10 ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-primary-600 hover:text-primary-700 font-medium">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</span> : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Login */}
          <div className="mt-4">
            <GoogleAuthButton label="Continue with Google" />
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">Create one free</Link>
            </p>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-xl text-xs text-gray-600">
            <p className="font-semibold text-gray-700 mb-1">Demo Credentials:</p>
            <div className="space-y-0.5">
              <p>Patient: patient@healthcare.com / Patient@1234</p>
              <p>Doctor: rahman@healthcare.com / Doctor@1234</p>
              <p>Admin: admin@healthcare.com / Admin@1234</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
