'use client';
import { useState, useEffect, useRef } from 'react';
import { FiSave, FiMail, FiPhone, FiCamera, FiShield, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { userAPI, authAPI } from '../../../../lib/api';
import useAuthStore from '../../../../lib/store';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function AdminProfile() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const { user, updateUser } = useAuthStore();
  const { register, handleSubmit, reset } = useForm();
  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, watch } = useForm();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      if (user.avatar) setAvatarPreview(BACKEND_URL + user.avatar);
      reset({ firstName: user.firstName, lastName: user.lastName, phone: user.phone });
    }
  }, [user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
    setUploadingAvatar(true);
    setAvatarPreview(URL.createObjectURL(file));
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await userAPI.uploadAvatar(formData);
      updateUser({ avatar: res.data.data.avatar });
      toast.success('Profile photo updated!');
    } catch {
      toast.error('Failed to upload image');
      setAvatarPreview(user?.avatar ? BACKEND_URL + user.avatar : null);
    } finally { setUploadingAvatar(false); }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await userAPI.updateProfile(data);
      updateUser({ firstName: data.firstName, lastName: data.lastName, phone: data.phone });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const onChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await authAPI.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully!');
      resetPwd();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPassword(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <h1 className="page-title">Admin Profile</h1>

      {/* Profile Header with Avatar Upload */}
      <div className="card flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-full overflow-hidden cursor-pointer group ring-4 ring-blue-100 hover:ring-blue-300 transition-all"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Admin" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-primary-600 flex items-center justify-center text-white font-bold text-2xl">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadingAvatar
                ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <FiCamera size={20} className="text-white" />}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors"
          >
            <FiCamera size={13} className="text-white" />
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
            <span className="badge badge-purple flex items-center gap-1"><FiShield size={10} /> Admin</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1"><FiMail size={13} /> {user?.email}</div>
          {user?.phone && <div className="flex items-center gap-1 text-gray-500 text-sm mt-1"><FiPhone size={13} /> {user?.phone}</div>}
          <p className="text-xs text-gray-400 mt-1.5">Click photo to change • Max 2MB</p>
        </div>
      </div>

      {/* Personal Info Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card">
          <h3 className="section-title">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input {...register('firstName', { required: true })} className="input-field" />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input {...register('lastName', { required: true })} className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="label">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input {...register('phone')} className="input-field pl-9" placeholder="+880..." />
              </div>
            </div>
            <div className="col-span-2">
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input value={user?.email || ''} readOnly className="input-field pl-9 bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
          </div>
          <div className="mt-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</span> : <><FiSave size={16} /> Save Changes</>}
            </button>
          </div>
        </div>
      </form>

      {/* Change Password */}
      <form onSubmit={handlePwd(onChangePassword)}>
        <div className="card">
          <h3 className="section-title flex items-center gap-2"><FiLock size={16} className="text-gray-500" /> Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input {...regPwd('currentPassword', { required: true })} type="password" className="input-field" placeholder="Enter current password" />
            </div>
            <div>
              <label className="label">New Password</label>
              <input {...regPwd('newPassword', { required: true, minLength: 6 })} type="password" className="input-field" placeholder="Minimum 6 characters" />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input {...regPwd('confirmPassword', { required: true })} type="password" className="input-field" placeholder="Re-enter new password" />
            </div>
          </div>
          <div className="mt-4">
            <button type="submit" disabled={savingPassword} className="btn-secondary">
              {savingPassword ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> Updating...</span> : <><FiLock size={16} /> Update Password</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
