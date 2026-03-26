'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layouts/Sidebar';
import { LoadingSpinner } from '@/components/ui';

const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  HR: ['/hr'],
  Manager: ['/manager'],
  Employee: ['/employee'],
};

const ROLE_HOME: Record<string, string> = {
  HR: '/hr',
  Manager: '/manager',
  Employee: '/employee',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }
    const allowedPrefixes = ROLE_ALLOWED_PREFIXES[user.role] ?? [];
    const isAllowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));
    if (!isAllowed) {
      router.replace(ROLE_HOME[user.role]);
    }
  }, [isAuthenticated, isLoading, user, router, pathname]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  const allowedPrefixes = ROLE_ALLOWED_PREFIXES[user.role] ?? [];
  const isAllowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));
  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Redirecting..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50 pt-14 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
