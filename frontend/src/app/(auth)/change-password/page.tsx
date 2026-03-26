'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorAlert, SuccessAlert } from '@/components/ui';
import { extractApiError } from '@/lib/utils';

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.currentPassword) errors.currentPassword = 'Current password is required';
  if (!values.newPassword) errors.newPassword = 'New password is required';
  else if (values.newPassword.length < 6) errors.newPassword = 'New password must be at least 6 characters';
  else if (values.newPassword === values.currentPassword) errors.newPassword = 'New password must be different from your current password';
  if (!values.confirmPassword) errors.confirmPassword = 'Please confirm your new password';
  else if (values.confirmPassword !== values.newPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

const ROLE_HOME: Record<string, string> = {
  HR: '/hr',
  Manager: '/manager',
  Employee: '/employee',
};

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateUser, logout } = useAuth();

  const [values, setValues] = useState<FormValues>({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !user.isFirstLogin) {
      router.replace(ROLE_HOME[user.role] ?? '/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: undefined }));
    if (apiError) setApiError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }

    setIsSubmitting(true);
    setApiError(null);
    try {
      await authService.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      updateUser({ isFirstLogin: false });
      setSuccess(true);
      setTimeout(() => { router.push(ROLE_HOME[user?.role ?? 'Employee']); }, 1800);
    } catch (err) {
      setApiError(extractApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">PA</div>
          <span className="text-white font-semibold text-lg">Appraisal System</span>
        </div>
        <div>
          <div className="h-14 w-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6">
            <svg className="h-7 w-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Secure your account</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your account was created with a temporary password. Please set a new password to protect your data before accessing the system.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-gray-400">
            {['At least 6 characters long', 'Different from your temporary password', 'Something only you know'].map(tip => (
              <li key={tip} className="flex items-center gap-2">
                <svg className="h-4 w-4 text-indigo-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {tip}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-gray-600">© {new Date().getFullYear()} Performance Appraisal System</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-12 bg-gray-50 min-h-screen lg:min-h-0">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">PA</div>
            <span className="font-semibold text-gray-800">Appraisal System</span>
          </div>

          <div className="mb-7 sm:mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-4">
              <svg className="h-3.5 w-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-amber-700">Action Required</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Set your password</h1>
            <p className="text-gray-500 text-sm">
              Welcome, <span className="font-medium text-gray-700">{user?.name}</span>! You must change your temporary password before continuing.
            </p>
          </div>

          {apiError && <ErrorAlert message={apiError} onDismiss={() => setApiError(null)} className="mb-6" />}
          {success && <SuccessAlert message="Password changed successfully! Redirecting to your dashboard..." className="mb-6" />}

          {!success && (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Input
                label="Temporary Password"
                type={showPasswords ? 'text' : 'password'}
                name="currentPassword"
                autoComplete="current-password"
                placeholder="Enter the password HR provided"
                value={values.currentPassword}
                onChange={handleChange}
                error={errors.currentPassword}
              />

              <div className="border-t border-gray-100 pt-4">
                <Input
                  label="New Password"
                  type={showPasswords ? 'text' : 'password'}
                  name="newPassword"
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={values.newPassword}
                  onChange={handleChange}
                  error={errors.newPassword}
                />
              </div>

              <Input
                label="Confirm New Password"
                type={showPasswords ? 'text' : 'password'}
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Repeat your new password"
                value={values.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />

              <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
                <input
                  type="checkbox"
                  checked={showPasswords}
                  onChange={e => setShowPasswords(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600">Show passwords</span>
              </label>

              <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full mt-2">
                Set New Password
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-400">
            Wrong account?{' '}
            <button onClick={logout} className="font-medium text-indigo-600 hover:text-indigo-700">
              Sign out
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
