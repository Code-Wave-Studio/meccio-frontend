import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, KeyRound, Loader2, Lock, Mail, Phone, Shield, User } from 'lucide-react';
import { authApi, resolveMediaUrl } from '@/lib/api';
import { getApiError } from '@/components/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import type { User as AuthUser } from '@/types';
import toast from 'react-hot-toast';

interface ProfileForm {
  first_name: string;
  last_name: string;
  phone: string;
}

interface PasswordForm {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export default function DashboardProfile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    watch: watchPw,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm<PasswordForm>();

  if (!user) return null;

  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  const avatarUrl = user.avatar ? resolveMediaUrl(user.avatar) : null;

  const onSubmit = async (data: ProfileForm) => {
    setLoading(true);
    try {
      const res = await authApi.updateProfile({ ...data });
      updateUser(res.data.data as AuthUser);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getApiError(err, 'Could not update profile'));
    } finally {
      setLoading(false);
    }
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setAvatarLoading(true);
    try {
      const res = await authApi.uploadAvatar(file);
      updateUser(res.data.data as AuthUser);
      toast.success('Photo updated');
    } catch (err) {
      toast.error(getApiError(err, 'Could not upload photo'));
    } finally {
      setAvatarLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onChangePassword = async (data: PasswordForm) => {
    setPwLoading(true);
    try {
      await authApi.changePassword({ ...data });
      toast.success('Password changed successfully');
      resetPw();
    } catch (err) {
      toast.error(getApiError(err, 'Could not change password'));
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white border border-sand/40 p-4 sm:p-6 md:p-8">
        <h2 className="font-display text-xl sm:text-2xl text-charcoal mb-1">Profile Settings</h2>
        <p className="text-xs sm:text-sm text-stone mb-6 sm:mb-8">Update your personal information</p>

        <div className="flex items-center gap-4 mb-8">
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${user.first_name} ${user.last_name}`}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border border-sand/50"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-charcoal text-gold flex items-center justify-center font-display text-xl">
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={avatarLoading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gold text-espresso flex items-center justify-center border-2 border-white disabled:opacity-60"
              aria-label="Upload profile photo"
            >
              {avatarLoading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={onAvatarChange}
            />
          </div>
          <div>
            <p className="font-medium text-charcoal text-sm sm:text-base">Profile photo</p>
            <p className="text-xs text-stone mt-1">JPG, PNG or WEBP. Tap the camera icon to upload.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-stone mb-2">First Name *</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
                <input {...register('first_name', { required: 'Required' })} className="input-luxury pl-11" />
              </div>
              {errors.first_name && <p className="text-xs text-red-600 mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-stone mb-2">Last Name *</label>
              <input {...register('last_name', { required: 'Required' })} className="input-luxury" />
              {errors.last_name && <p className="text-xs text-red-600 mt-1">{errors.last_name.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.14em] text-stone mb-2">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
              <input value={user.email} disabled className="input-luxury pl-11 bg-ivory/60 text-stone cursor-not-allowed" />
            </div>
            <p className="text-xs text-stone mt-2">Email cannot be changed. Contact support if you need assistance.</p>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.14em] text-stone mb-2">Phone</label>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
              <input {...register('phone')} type="tel" placeholder="+1 555 000 0000" className="input-luxury pl-11" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="bg-white border border-sand/40 p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-3 mb-1">
          <KeyRound size={18} className="text-gold-dark shrink-0" />
          <h2 className="font-display text-xl sm:text-2xl text-charcoal">Change Password</h2>
        </div>
        <p className="text-xs sm:text-sm text-stone mb-6 sm:mb-8">Update your account password. Use at least 8 characters.</p>

        <form onSubmit={handleSubmitPw(onChangePassword)} className="space-y-5 max-w-lg">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.14em] text-stone mb-2">Current Password *</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
              <input
                {...registerPw('current_password', { required: 'Enter your current password' })}
                type="password"
                autoComplete="current-password"
                placeholder="Current password"
                className="input-luxury pl-11"
              />
            </div>
            {pwErrors.current_password && <p className="text-xs text-red-600 mt-1">{pwErrors.current_password.message}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-stone mb-2">New Password *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
                <input
                  {...registerPw('password', {
                    required: 'Enter a new password',
                    minLength: { value: 8, message: 'Min. 8 characters' },
                  })}
                  type="password"
                  autoComplete="new-password"
                  placeholder="New password"
                  className="input-luxury pl-11"
                />
              </div>
              {pwErrors.password && <p className="text-xs text-red-600 mt-1">{pwErrors.password.message}</p>}
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-stone mb-2">Confirm Password *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
                <input
                  {...registerPw('password_confirmation', {
                    required: 'Confirm your new password',
                    validate: (value) => value === watchPw('password') || 'Passwords do not match',
                  })}
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat new password"
                  className="input-luxury pl-11"
                />
              </div>
              {pwErrors.password_confirmation && <p className="text-xs text-red-600 mt-1">{pwErrors.password_confirmation.message}</p>}
            </div>
          </div>

          <button type="submit" disabled={pwLoading} className="btn-primary disabled:opacity-60">
            {pwLoading ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
          </button>
        </form>
      </div>

      <div className="bg-white border border-sand/40 p-4 sm:p-6 md:p-8">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-ivory flex items-center justify-center text-gold-dark shrink-0">
            <Shield size={18} />
          </div>
          <div>
            <h3 className="font-display text-lg sm:text-xl text-charcoal mb-2">Account Security</h3>
            <p className="text-sm text-stone mb-4">
              Your account is protected with secure login. Use OTP or password sign-in, and keep your credentials private.
            </p>
            <p className="text-xs text-stone uppercase tracking-[0.12em]">
              Role: <span className="text-charcoal capitalize">{user.role}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
