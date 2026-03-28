'use client';
import { useState, useEffect, useRef } from 'react';
import { FiUser, FiSave, FiMail, FiPhone, FiMapPin, FiPlus, FiX, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { patientAPI, authAPI, userAPI } from '../../../../lib/api';
import useAuthStore from '../../../../lib/store';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function PatientProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [allergies, setAllergies] = useState([]);
  const [chronicConditions, setChronicConditions] = useState([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');
  const { user, updateUser } = useAuthStore();
  const { register, handleSubmit, reset } = useForm();
  const fileInputRef = useRef(null);

  useEffect(() => {
    patientAPI.getMyProfile()
      .then(r => {
        const p = r.data.data;
        setAllergies(p.allergies || []);
        setChronicConditions(p.chronicConditions || []);
        if (p.user?.avatar) setAvatarPreview(BACKEND_URL + p.user.avatar);
        reset({
          firstName: p.user?.firstName,
          lastName: p.user?.lastName,
          phone: p.user?.phone,
          dateOfBirth: p.dateOfBirth,
          gender: p.gender,
          bloodGroup: p.bloodGroup,
          address: p.address,
          city: p.city || 'Chattagram',
          country: p.country || 'Bangladesh',
          emergencyContact: p.emergencyContact,
          emergencyContactName: p.emergencyContactName,
          height: p.height,
          weight: p.weight,
          occupation: p.occupation,
          insuranceProvider: p.insuranceProvider,
          insuranceNumber: p.insuranceNumber,
          notes: p.notes,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await patientAPI.updateMyProfile({ ...data, allergies, chronicConditions });
      updateUser({ firstName: data.firstName, lastName: data.lastName, phone: data.phone });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
    setUploadingAvatar(true);
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
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

  const addAllergy = () => {
    if (allergyInput.trim() && !allergies.includes(allergyInput.trim())) {
      setAllergies(a => [...a, allergyInput.trim()]);
      setAllergyInput('');
    }
  };
  const addCondition = () => {
    if (conditionInput.trim() && !chronicConditions.includes(conditionInput.trim())) {
      setChronicConditions(c => [...c, conditionInput.trim()]);
      setConditionInput('');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <h1 className="page-title">My Profile</h1>

      {/* Avatar */}
      <div className="card flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-full overflow-hidden cursor-pointer group ring-4 ring-primary-100 hover:ring-primary-300 transition-all"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
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
          <h2 className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1"><FiMail size={13} /> {user?.email}</div>
          <span className="badge badge-blue mt-1.5">Patient</span>
          <p className="text-xs text-gray-400 mt-1.5">Click photo to change • Max 2MB</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Personal Info */}
        <div className="card">
          <h3 className="section-title">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">First Name</label><input {...register('firstName', { required: true })} className="input-field" /></div>
            <div><label className="label">Last Name</label><input {...register('lastName', { required: true })} className="input-field" /></div>
            <div><label className="label">Phone Number</label><div className="relative"><FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} /><input {...register('phone')} className="input-field pl-9" placeholder="+880..." /></div></div>
            <div><label className="label">Occupation</label><input {...register('occupation')} className="input-field" placeholder="Your profession" /></div>
            <div><label className="label">Date of Birth</label><input {...register('dateOfBirth')} type="date" className="input-field" /></div>
            <div>
              <label className="label">Gender</label>
              <select {...register('gender')} className="input-field">
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Blood Group</label>
              <select {...register('bloodGroup')} className="input-field">
                <option value="">Select blood group</option>
                {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div><label className="label">Height (cm)</label><input {...register('height')} type="number" step="0.1" className="input-field" placeholder="170" /></div>
            <div><label className="label">Weight (kg)</label><input {...register('weight')} type="number" step="0.1" className="input-field" placeholder="65" /></div>
          </div>
        </div>

        {/* Address */}
        <div className="card">
          <h3 className="section-title">Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">Street Address</label><div className="relative"><FiMapPin className="absolute left-3 top-3 text-gray-400" size={14} /><textarea {...register('address')} rows={2} className="input-field pl-9 resize-none" placeholder="Street, Area" /></div></div>
            <div><label className="label">City</label><input {...register('city')} className="input-field" defaultValue="Chattagram" /></div>
            <div><label className="label">Country</label><input {...register('country')} className="input-field" defaultValue="Bangladesh" /></div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card">
          <h3 className="section-title">Emergency Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Contact Name</label><input {...register('emergencyContactName')} className="input-field" placeholder="Contact person name" /></div>
            <div><label className="label">Contact Phone</label><input {...register('emergencyContact')} className="input-field" placeholder="+880..." /></div>
          </div>
        </div>

        {/* Medical History */}
        <div className="card">
          <h3 className="section-title">Medical History</h3>

          <div className="mb-5">
            <label className="label">Known Allergies</label>
            <div className="flex gap-2 mb-2">
              <input value={allergyInput} onChange={e => setAllergyInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                placeholder="Add allergy and press Enter" className="input-field flex-1" />
              <button type="button" onClick={addAllergy} className="btn-secondary px-3"><FiPlus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergies.map((a, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-sm">
                  {a}
                  <button type="button" onClick={() => setAllergies(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-900 ml-1"><FiX size={12} /></button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Chronic Conditions</label>
            <div className="flex gap-2 mb-2">
              <input value={conditionInput} onChange={e => setConditionInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                placeholder="Add condition and press Enter" className="input-field flex-1" />
              <button type="button" onClick={addCondition} className="btn-secondary px-3"><FiPlus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {chronicConditions.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-sm">
                  {c}
                  <button type="button" onClick={() => setChronicConditions(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-amber-900 ml-1"><FiX size={12} /></button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Insurance */}
        <div className="card">
          <h3 className="section-title">Insurance Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Insurance Provider</label><input {...register('insuranceProvider')} className="input-field" placeholder="Insurance company name" /></div>
            <div><label className="label">Policy Number</label><input {...register('insuranceNumber')} className="input-field" placeholder="Policy/Member ID" /></div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <h3 className="section-title">Additional Notes</h3>
          <textarea {...register('notes')} rows={3} className="input-field resize-none" placeholder="Any additional information about your health..." />
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? (
            <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</span>
          ) : <><FiSave size={16} /> Save Profile</>}
        </button>
      </form>
    </div>
  );
}
