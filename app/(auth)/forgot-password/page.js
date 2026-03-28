'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiHeart, FiMail, FiArrowLeft, FiCheck, FiLink, FiExternalLink } from 'react-icons/fi';
import { authAPI } from '../../../lib/api';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState(null);
  const [devNote, setDevNote] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(data.email);
      setSent(true);
      if (res.data?.resetUrl) {
        setResetUrl(res.data.resetUrl);
        setDevNote(res.data.devNote);
      }
      toast.success(res.data?.message || 'Check your email for the reset link!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-white mb-1">Reset Password</h1>
          <p className="text-blue-200 text-sm">Enter your email to receive a reset link</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="text-emerald-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h3>

              {resetUrl ? (
                <div className="mt-4 text-left">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                    <p className="text-amber-800 text-sm font-semibold mb-1 flex items-center gap-1"><FiLink size={13} /> Dev Mode — Reset Link:</p>
                    <p className="text-amber-700 text-xs mb-3">{devNote}</p>
                    <a
                      href={resetUrl}
                      className="flex items-center gap-2 w-full justify-center bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
                    >
                      <FiExternalLink size={14} /> Click Here to Reset Password
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 mb-6">If the email address exists in our system, you'll receive a reset link shortly.</p>
              )}

              <Link href="/login" className="btn-primary w-full justify-center mt-2 block text-center py-2.5">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    {...register('email', { required: 'Email required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                    type="email" placeholder="you@example.com"
                    className={`input-field pl-10 ${errors.email ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading
                  ? <span className="flex items-center gap-2 justify-center"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</span>
                  : 'Send Reset Link'}
              </button>
              <p className="text-center text-xs text-gray-400">We'll send a link to reset your password</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
