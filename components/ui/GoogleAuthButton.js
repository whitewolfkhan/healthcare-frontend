'use client';
import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { authAPI } from '../../lib/api';
import { getDashboardPath } from '../../lib/auth';
import useAuthStore from '../../lib/store';
import { useRouter } from 'next/navigation';

const GOOGLE_CONFIGURED =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID &&
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID !== 'your_google_client_id_here';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function GoogleAuthButton({ label = 'Continue with Google' }) {
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();

  const handleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await authAPI.googleAuth(credentialResponse.credential);
      const { user, token, refreshToken, profile } = res.data.data;
      setUser(user, token, profile);
      localStorage.setItem('refreshToken', refreshToken);
      toast.success(`Welcome, ${user.firstName}!`);
      router.push(getDashboardPath(user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  if (!GOOGLE_CONFIGURED) {
    return (
      <button
        type="button"
        onClick={() => toast('Google OAuth needs setup. Add GOOGLE_CLIENT_ID to .env files.', { icon: 'ℹ️' })}
        className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-2.5 px-4 text-gray-500 font-medium text-sm hover:bg-gray-50 transition-all"
      >
        <GoogleIcon />
        {label}
        <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-normal">Setup needed</span>
      </button>
    );
  }

  return (
    <div className="w-full">
      {loading ? (
        <div className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-2.5 px-4 text-gray-600 font-medium text-sm">
          <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          Signing in with Google...
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => toast.error('Google sign-in failed')}
          useOneTap={false}
          text="continue_with"
          shape="rectangular"
          logo_alignment="left"
          width="100%"
          theme="outline"
        />
      )}
    </div>
  );
}
