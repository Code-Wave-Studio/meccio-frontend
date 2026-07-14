import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowRight, Loader2, Lock, Mail, Phone, ShieldCheck } from 'lucide-react';
import SEO from '@/components/SEO';
import OtpInput from '@/components/OtpInput';
import { AuthLayout, FieldLabel, getApiError, useOtpCooldown } from '@/components/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { postAuthPath } from '@/lib/adminAuth';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

type LoginMode = 'password' | 'otp';

interface LoginForm {
  email: string;
  password: string;
}

interface OtpLoginForm {
  identifier: string;
  otp: string;
}

interface RegisterForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  otp: string;
}

function useAuthRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return (user: { role: string }) => {
    const redirect = searchParams.get('redirect');
    navigate(postAuthPath(user as import('@/types').User, redirect), { replace: true });
  };
}

export default function LoginPage() {
  const { user, isLoading, login, loginWithOtp } = useAuth();
  const navigateAfterAuth = useAuthRedirect();
  const [mode, setMode] = useState<LoginMode>('password');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const { cooldown, startCooldown, canResend } = useOtpCooldown();

  const passwordForm = useForm<LoginForm>();
  const otpForm = useForm<OtpLoginForm>();

  if (!isLoading && user) {
    return <Navigate to={postAuthPath(user)} replace />;
  }

  const onPasswordLogin = async (data: LoginForm) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(user.role === 'admin' || user.role === 'staff' ? 'Welcome, Admin' : 'Welcome back');
      navigateAfterAuth(user);
    } catch (err) {
      toast.error(getApiError(err, 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  const sendLoginOtp = async () => {
    const identifier = otpForm.getValues('identifier')?.trim();
    if (!identifier) {
      toast.error('Enter your email or mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.sendLoginOtp(identifier);
      setOtpSent(true);
      startCooldown();
      toast.success('Verification code sent to your email');
      if (import.meta.env.DEV && res.data.data?.debug_otp) {
        toast(`Dev OTP: ${res.data.data.debug_otp}`, { icon: '🔑', duration: 10000 });
      }
    } catch (err) {
      toast.error(getApiError(err, 'Could not send OTP'));
    } finally {
      setLoading(false);
    }
  };

  const onOtpLogin = async () => {
    const identifier = otpForm.getValues('identifier')?.trim();
    if (!identifier || otpValue.length !== 6) {
      toast.error('Enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const user = await loginWithOtp(identifier, otpValue);
      toast.success(user.role === 'admin' || user.role === 'staff' ? 'Welcome, Admin' : 'Welcome back');
      navigateAfterAuth(user);
    } catch (err) {
      toast.error(getApiError(err, 'Invalid or expired code'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: LoginMode) => {
    setMode(next);
    setOtpSent(false);
    setOtpValue('');
  };

  return (
    <>
      <SEO title="Sign In" noindex />
      <AuthLayout
        title="Welcome Back"
        subtitle="Sign in to your MECCIO account"
        footer={
          <>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-gold-dark hover:underline font-medium">
              Create one
            </Link>
          </>
        }
      >
        {/* Mode toggle */}
        <div className="flex rounded-sm border border-sand/50 p-1 mb-8 bg-white">
          <button
            type="button"
            onClick={() => switchMode('password')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-[0.12em] transition-all ${
              mode === 'password' ? 'bg-charcoal text-cream' : 'text-stone hover:text-charcoal'
            }`}
          >
            <Lock size={14} />
            Password
          </button>
          <button
            type="button"
            onClick={() => switchMode('otp')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-[0.12em] transition-all ${
              mode === 'otp' ? 'bg-charcoal text-cream' : 'text-stone hover:text-charcoal'
            }`}
          >
            <ShieldCheck size={14} />
            Login with OTP
          </button>
        </div>

        {mode === 'password' ? (
          <form onSubmit={passwordForm.handleSubmit(onPasswordLogin)} className="space-y-5">
            <div>
              <FieldLabel required>Email</FieldLabel>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
                <input
                  {...passwordForm.register('email', { required: true })}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input-luxury pl-11"
                />
              </div>
            </div>
            <div>
              <FieldLabel required>Password</FieldLabel>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
                <input
                  {...passwordForm.register('password', { required: true })}
                  type="password"
                  autoComplete="current-password"
                  placeholder="Your password"
                  className="input-luxury pl-11"
                />
              </div>
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-stone hover:text-gold-dark transition-colors">
                Forgot password?
              </Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            <div>
              <FieldLabel required>Email or Mobile</FieldLabel>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
                <input
                  {...otpForm.register('identifier', { required: true })}
                  type="text"
                  placeholder="Email or mobile number"
                  className="input-luxury pl-11"
                />
              </div>
              <p className="text-xs text-stone mt-2">OTP will be sent to your registered email</p>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={sendLoginOtp}
                disabled={loading}
                className="btn-primary w-full disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send OTP'}
              </button>
            ) : (
              <>
                <div className="p-5 bg-white border border-sand/40">
                  <p className="text-center text-sm text-stone mb-4">Enter the 6-digit code sent to your email</p>
                  <OtpInput value={otpValue} onChange={setOtpValue} disabled={loading} />
                </div>

                <button
                  type="button"
                  onClick={onOtpLogin}
                  disabled={loading || otpValue.length !== 6}
                  className="btn-primary w-full disabled:opacity-60"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Sign In'}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtpValue(''); }}
                    className="text-stone hover:text-charcoal transition-colors"
                  >
                    Change email/phone
                  </button>
                  <button
                    type="button"
                    onClick={sendLoginOtp}
                    disabled={!canResend || loading}
                    className="text-gold-dark hover:underline disabled:opacity-50"
                  >
                    {canResend ? 'Resend code' : `Resend in ${cooldown}s`}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </AuthLayout>
    </>
  );
}

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigateAfterAuth = useAuthRedirect();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const { cooldown, startCooldown, canResend } = useOtpCooldown();

  const { register, handleSubmit, watch, getValues, formState: { errors } } = useForm<RegisterForm>();

  const email = watch('email');
  const phone = watch('phone');

  const sendOtp = async () => {
    const emailVal = getValues('email')?.trim();
    const phoneVal = getValues('phone')?.trim();

    if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      toast.error('Enter a valid email first');
      return;
    }
    if (!phoneVal || phoneVal.replace(/\D/g, '').length < 8) {
      toast.error('Enter a valid mobile number first');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.sendRegisterOtp({ email: emailVal, phone: phoneVal });
      setOtpSent(true);
      startCooldown();
      toast.success('Verification code sent to your email');
      if (import.meta.env.DEV && res.data.data?.debug_otp) {
        toast(`Dev OTP: ${res.data.data.debug_otp}`, { icon: '🔑', duration: 10000 });
      }
    } catch (err) {
      toast.error(getApiError(err, 'Could not send verification code'));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    if (!otpSent || otpValue.length !== 6) {
      toast.error('Please verify your email with the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser({ ...data, otp: otpValue });
      toast.success('Account created successfully');
      navigateAfterAuth(user);
    } catch (err) {
      toast.error(getApiError(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Create Account" noindex />
      <AuthLayout
        title="Create Account"
        subtitle="Join MECCIO for a personalized luxury experience"
        footer={
          <>
            Already have an account?{' '}
            <Link to="/login" className="text-gold-dark hover:underline font-medium">
              Sign in
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>First Name</FieldLabel>
              <input
                {...register('first_name', { required: 'Required' })}
                placeholder="First name"
                className="input-luxury"
              />
              {errors.first_name && <p className="text-xs text-red-600 mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <FieldLabel required>Last Name</FieldLabel>
              <input
                {...register('last_name', { required: 'Required' })}
                placeholder="Last name"
                className="input-luxury"
              />
              {errors.last_name && <p className="text-xs text-red-600 mt-1">{errors.last_name.message}</p>}
            </div>
          </div>

          <div>
            <FieldLabel required>Email</FieldLabel>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
              <input
                {...register('email', { required: 'Email required' })}
                type="email"
                placeholder="you@example.com"
                disabled={otpSent}
                className="input-luxury pl-11"
              />
            </div>
          </div>

          <div>
            <FieldLabel required>Mobile Number</FieldLabel>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
              <input
                {...register('phone', {
                  required: 'Mobile number required',
                  minLength: { value: 8, message: 'Enter a valid number' },
                })}
                type="tel"
                placeholder="+91 98765 43210"
                disabled={otpSent}
                className="input-luxury pl-11"
              />
            </div>
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
          </div>

          {/* Email OTP verification */}
          <div className="p-5 bg-white border border-sand/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${otpSent && otpValue.length === 6 ? 'bg-gold/20' : 'bg-ivory'}`}>
                <ShieldCheck size={16} className={otpSent && otpValue.length === 6 ? 'text-gold-dark' : 'text-stone'} />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal">Verify your email</p>
                <p className="text-xs text-stone">We&apos;ll send a 6-digit code to your email</p>
              </div>
              {otpSent && otpValue.length === 6 && (
                <span className="ml-auto text-xs uppercase tracking-wider text-gold-dark font-medium">Ready</span>
              )}
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={sendOtp}
                disabled={loading || !email || !phone}
                className="btn-outline w-full text-xs disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Verification Code'}
              </button>
            ) : (
              <>
                <OtpInput value={otpValue} onChange={setOtpValue} disabled={loading} />
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={!canResend || loading}
                  className="w-full text-sm text-gold-dark hover:underline disabled:opacity-50"
                >
                  {canResend ? 'Resend code' : `Resend in ${cooldown}s`}
                </button>
              </>
            )}
          </div>

          <div>
            <FieldLabel required>Password</FieldLabel>
            <input
              {...register('password', { required: true, minLength: 8 })}
              type="password"
              placeholder="Min. 8 characters"
              className="input-luxury"
            />
          </div>
          <div>
            <FieldLabel required>Confirm Password</FieldLabel>
            <input
              {...register('password_confirmation', {
                required: 'Please confirm your password',
                validate: (value) => value === watch('password') || 'Passwords do not match',
              })}
              type="password"
              placeholder="Repeat password"
              className="input-luxury"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !otpSent || otpValue.length !== 6}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {(!otpSent || otpValue.length !== 6) && (
            <p className="text-xs text-center text-stone">Send and enter the email OTP to create your account</p>
          )}
        </form>
      </AuthLayout>
    </>
  );
}

interface ResetPasswordForm {
  password: string;
  password_confirmation: string;
}

export function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<{ email: string }>();
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    watch: watchReset,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordForm>();

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
      toast.success('Check your email for reset instructions');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordForm) => {
    if (!token) return;
    setLoading(true);
    try {
      await authApi.resetPassword({ token, ...data });
      setDone(true);
      toast.success('Password reset successfully');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(getApiError(err, 'Invalid or expired reset link'));
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return (
      <>
        <SEO title="Set New Password" noindex />
        <AuthLayout
          title="Set New Password"
          subtitle="Choose a new password for your account"
          footer={
            <Link to="/login" className="text-gold-dark hover:underline">
              Back to Sign In
            </Link>
          }
        >
          {done ? (
            <div className="p-6 bg-white border border-sand/40 text-center">
              <ShieldCheck size={32} className="mx-auto text-gold mb-4" />
              <p className="text-charcoal mb-2">Password updated</p>
              <p className="text-sm text-stone">Redirecting you to sign in&hellip;</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReset(onResetSubmit)} className="space-y-5">
              <div>
                <FieldLabel required>New Password</FieldLabel>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
                  <input
                    {...registerReset('password', {
                      required: 'Enter a new password',
                      minLength: { value: 8, message: 'Min. 8 characters' },
                    })}
                    type="password"
                    autoComplete="new-password"
                    placeholder="New password"
                    className="input-luxury pl-11"
                  />
                </div>
                {resetErrors.password && <p className="text-xs text-red-600 mt-1">{resetErrors.password.message}</p>}
              </div>
              <div>
                <FieldLabel required>Confirm Password</FieldLabel>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
                  <input
                    {...registerReset('password_confirmation', {
                      required: 'Confirm your new password',
                      validate: (value) => value === watchReset('password') || 'Passwords do not match',
                    })}
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat new password"
                    className="input-luxury pl-11"
                  />
                </div>
                {resetErrors.password_confirmation && <p className="text-xs text-red-600 mt-1">{resetErrors.password_confirmation.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          )}
        </AuthLayout>
      </>
    );
  }

  return (
    <>
      <SEO title="Forgot Password" noindex />
      <AuthLayout
        title="Reset Password"
        subtitle="We'll send you instructions to reset your password"
        footer={
          <Link to="/login" className="text-gold-dark hover:underline">
            Back to Sign In
          </Link>
        }
      >
        {sent ? (
          <div className="p-6 bg-white border border-sand/40 text-center">
            <Mail size={32} className="mx-auto text-gold mb-4" />
            <p className="text-charcoal mb-2">Check your inbox</p>
            <p className="text-sm text-stone">If an account exists, you&apos;ll receive reset instructions shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <FieldLabel required>Email</FieldLabel>
              <input {...register('email', { required: true })} type="email" placeholder="you@example.com" className="input-luxury" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>
        )}
      </AuthLayout>
    </>
  );
}
