'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiHeart, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { authAPI } from '../../../lib/api';

function ResetForm() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    if (!token) { toast.error('Invalid reset link'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, password: data.password });
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-teal-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <FiArrowLeft size={14} /> Back to login
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur border border-white/20 rounded-2xl flex items-center justify-center">
              <FiHeart className="text-white text-2xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">New Password</h1>
          <p className="text-blue-200 text-sm">Enter your new password below</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="text-emerald-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h3>
              <p className="text-gray-500 mb-4">Redirecting to login...</p>
              <Link href="/login" className="btn-primary w-full justify-center">Go to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
                    type={showPass ? 'text' : 'password'} placeholder="New password (min 8 chars)"
                    className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input {...register('confirm', { required: 'Required', validate: v => v === password || 'Passwords do not match' })}
                    type="password" placeholder="Confirm new password"
                    className={`input-field pl-10 ${errors.confirm ? 'border-red-400' : ''}`} />
                </div>
                {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? <span className="flex items-center gap-2 justify-center"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resetting...</span> : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-primary-900 flex items-center justify-center"><div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" /></div>}>
      <ResetForm />
    </Suspense>
  );
}
