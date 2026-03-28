'use client';
import { useState, useEffect, useRef } from 'react';
import { FiSave, FiMail, FiPhone, FiStar, FiClock, FiCamera, FiMapPin, FiHome } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { doctorAPI, departmentAPI, userAPI } from '../../../../lib/api';
import useAuthStore from '../../../../lib/store';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function DoctorProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [availableDays, setAvailableDays] = useState([]);
  const { user, updateProfile } = useAuthStore();
  const { register, handleSubmit, reset } = useForm();
  const fileInputRef = useRef(null);

  useEffect(() => {
    Promise.all([doctorAPI.getMyProfile(), departmentAPI.getDepartments()])
      .then(([p, d]) => {
        const doc = p.data.data;
        setProfile(doc);
        setDepartments(d.data.data || []);
        setAvailableDays(doc?.availableDays || []);
        if (doc?.user?.avatar) setAvatarPreview(BACKEND_URL + doc.user.avatar);
        reset({
          firstName: doc?.user?.firstName,
          lastName: doc?.user?.lastName,
          phone: doc?.user?.phone,
          specialization: doc?.specialization,
          bio: doc?.bio,
          consultationFee: doc?.consultationFee,
          experience: doc?.experience,
          availableTimeStart: doc?.availableTimeStart?.slice(0, 5),
          availableTimeEnd: doc?.availableTimeEnd?.slice(0, 5),
          isAvailable: doc?.isAvailable,
          clinicName: doc?.clinicName,
          clinicAddress: doc?.clinicAddress,
          clinicCity: doc?.clinicCity || 'Chattagram',
          clinicPhone: doc?.clinicPhone,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
      updateProfile({ avatar: res.data.data.avatar });
      toast.success('Profile photo updated!');
    } catch {
      toast.error('Failed to upload image');
      setAvatarPreview(profile?.user?.avatar ? BACKEND_URL + profile.user.avatar : null);
    } finally { setUploadingAvatar(false); }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await doctorAPI.updateMyProfile({ ...data, availableDays });
      toast.success('Profile updated successfully');
      updateProfile({ specialization: data.specialization, bio: data.bio });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const toggleDay = (day) => {
    setAvailableDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <h1 className="page-title">My Profile</h1>

      {/* Profile Header with Avatar Upload */}
      <div className="card flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-full overflow-hidden cursor-pointer group ring-4 ring-teal-100 hover:ring-teal-300 transition-all"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-2xl">
                {profile?.user?.firstName?.[0]}{profile?.user?.lastName?.[0]}
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
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center shadow-md hover:bg-teal-700 transition-colors"
          >
            <FiCamera size={13} className="text-white" />
          </button>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900">Dr. {profile?.user?.firstName} {profile?.user?.lastName}</h2>
          <p className="text-gray-500">{profile?.specialization}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1"><FiMail size={13} /> {profile?.user?.email}</span>
            {profile?.user?.phone && <span className="flex items-center gap-1"><FiPhone size={13} /> {profile?.user?.phone}</span>}
          </div>
          <div className="flex items-center gap-3 mt-2">
            {profile?.rating > 0 && <span className="flex items-center gap-1 text-amber-500 text-sm font-medium"><FiStar size={13} /> {profile?.rating}</span>}
            {profile?.experience && <span className="text-gray-400 text-xs">{profile.experience} years exp.</span>}
            <span className={`badge ${profile?.isAvailable ? 'badge-green' : 'badge-red'}`}>{profile?.isAvailable ? 'Available' : 'Unavailable'}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Click photo to change • Max 2MB</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Personal Information */}
        <div className="card">
          <h3 className="section-title">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">First Name</label><input {...register('firstName')} className="input-field" /></div>
            <div><label className="label">Last Name</label><input {...register('lastName')} className="input-field" /></div>
            <div><label className="label">Phone</label><input {...register('phone')} className="input-field" placeholder="+880..." /></div>
            <div><label className="label">Years of Experience</label><input {...register('experience')} type="number" className="input-field" /></div>
            <div className="col-span-2"><label className="label">Specialization</label><input {...register('specialization')} className="input-field" /></div>
            <div className="col-span-2"><label className="label">Consultation Fee (৳)</label><input {...register('consultationFee')} type="number" className="input-field" /></div>
            <div className="col-span-2"><label className="label">Bio</label><textarea {...register('bio')} rows={4} className="input-field resize-none" placeholder="Describe your experience, expertise..." /></div>
          </div>
        </div>

        {/* Hospital / Clinic Location */}
        <div className="card">
          <h3 className="section-title flex items-center gap-2"><FiHome size={16} className="text-teal-600" /> Hospital / Clinic Location</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Hospital / Clinic Name</label>
              <input {...register('clinicName')} className="input-field" placeholder="e.g. Chittagong Medical College Hospital" />
            </div>
            <div className="col-span-2">
              <label className="label">Street Address</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 text-gray-400" size={14} />
                <textarea {...register('clinicAddress')} rows={2} className="input-field pl-9 resize-none" placeholder="Building, Road, Area..." />
              </div>
            </div>
            <div>
              <label className="label">City</label>
              <input {...register('clinicCity')} className="input-field" defaultValue="Chattagram" />
            </div>
            <div>
              <label className="label">Clinic Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input {...register('clinicPhone')} className="input-field pl-9" placeholder="+880..." />
              </div>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="card">
          <h3 className="section-title">Availability</h3>
          <div className="flex items-center gap-3 mb-4">
            <input {...register('isAvailable')} type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600" id="isAvail" />
            <label htmlFor="isAvail" className="text-sm font-medium text-gray-700">Currently Available for Appointments</label>
          </div>

          <div className="mb-4">
            <label className="label">Available Days</label>
            <div className="flex flex-wrap gap-2">
              {days.map(day => (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${availableDays.includes(day) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Time</label>
              <div className="relative"><FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} /><input {...register('availableTimeStart')} type="time" className="input-field pl-9" /></div>
            </div>
            <div>
              <label className="label">End Time</label>
              <div className="relative"><FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} /><input {...register('availableTimeEnd')} type="time" className="input-field pl-9" /></div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</span> : <><FiSave size={16} /> Save Changes</>}
        </button>
      </form>
    </div>
  );
}
