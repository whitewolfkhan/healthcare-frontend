'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiHeart, FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { authAPI } from '../../../lib/api';
import { setAuth, getDashboardPath } from '../../../lib/auth';
import useAuthStore from '../../../lib/store';
import GoogleAuthButton from '../../../components/ui/GoogleAuthButton';

const roles = [
  { value: 'patient', label: 'Patient', icon: '🧑‍⚕️', desc: 'Manage your health records & appointments' },
  { value: 'doctor', label: 'Doctor', icon: '👨‍⚕️', desc: 'Manage patients & consultations' },
];

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('patient');
  const router = useRouter();
  const { setUser } = useAuthStore();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { role: 'patient' } });
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.register({ ...data, role: selectedRole });
      const { user, token, refreshToken, profile } = res.data.data;
      setUser(user, token, profile);
      localStorage.setItem('refreshToken', refreshToken);
      toast.success('Account created successfully! Welcome!');
      router.push(getDashboardPath(user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-teal-700 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            <FiArrowLeft size={14} /> Back to home
          </Link>
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur border border-white/20 rounded-xl flex items-center justify-center">
              <FiHeart className="text-white text-xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Create Account</h1>
          <p className="text-blue-200 text-sm">Join our healthcare platform today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="label">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setSelectedRole(r.value)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${selectedRole === r.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  {selectedRole === r.value && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                      <FiCheck className="text-white" size={10} />
                    </div>
                  )}
                  <div className="text-2xl mb-1">{r.icon}</div>
                  <div className="font-semibold text-gray-800 text-sm">{r.label}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input {...register('firstName', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })}
                    placeholder="First name" className={`input-field pl-9 ${errors.firstName ? 'border-red-400' : ''}`} />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="label">Last Name</label>
                <input {...register('lastName', { required: 'Required' })}
                  placeholder="Last name" className={`input-field ${errors.lastName ? 'border-red-400' : ''}`} />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input {...register('email', { required: 'Email required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                  type="email" placeholder="you@example.com" className={`input-field pl-9 ${errors.email ? 'border-red-400' : ''}`} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input {...register('phone')} type="tel" placeholder="+880 1700-000000" className="input-field pl-9" />
              </div>
            </div>

            {selectedRole === 'doctor' && (
              <>
                <div>
                  <label className="label">Specialization</label>
                  <input {...register('specialization', { required: selectedRole === 'doctor' ? 'Required for doctors' : false })}
                    placeholder="e.g., Cardiologist, General Physician" className={`input-field ${errors.specialization ? 'border-red-400' : ''}`} />
                  {errors.specialization && <p className="text-red-500 text-xs mt-1">{errors.specialization.message}</p>}
                </div>
                <div>
                  <label className="label">BMDC License Number</label>
                  <input {...register('licenseNumber', { required: selectedRole === 'doctor' ? 'Required for doctors' : false })}
                    placeholder="BMDC-XXXX-XXXX" className={`input-field ${errors.licenseNumber ? 'border-red-400' : ''}`} />
                  {errors.licenseNumber && <p className="text-red-500 text-xs mt-1">{errors.licenseNumber.message}</p>}
                </div>
              </>
            )}

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })}
                  type={showPass ? 'text' : 'password'} placeholder="Min 8 characters"
                  className={`input-field pl-9 pr-10 ${errors.password ? 'border-red-400' : ''}`} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input {...register('confirmPassword', { required: 'Please confirm password', validate: v => v === password || 'Passwords do not match' })}
                  type="password" placeholder="Confirm your password"
                  className={`input-field pl-9 ${errors.confirmPassword ? 'border-red-400' : ''}`} />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start gap-2 text-sm">
              <input {...register('terms', { required: 'Please accept terms' })} type="checkbox" className="mt-0.5 rounded border-gray-300 text-primary-600" />
              <span className="text-gray-600">I agree to the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a></span>
            </div>
            {errors.terms && <p className="text-red-500 text-xs">{errors.terms.message}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</span> : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Register */}
          <div className="mt-4">
            <GoogleAuthButton label="Continue with Google" />
            <p className="text-xs text-gray-400 text-center mt-2">Google accounts register as Patient by default</p>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
