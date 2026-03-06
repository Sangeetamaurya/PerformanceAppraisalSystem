'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { managerService } from '@/services/managerService';
import { PageHeader } from '@/components/layouts/PageHeader';
import { Card, LoadingSpinner, ErrorAlert, StatCard } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { Employee } from '@/types';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    managerService
      .listEmployeesForManager()
      .then(setEmployees)
      .catch(() => setError('Could not load team data.'))
      .finally(() => setIsLoading(false));
  }, []);

  const avgKpi = employees.length
    ? (employees.reduce((s, e) => s + e.kpiScore, 0) / employees.length).toFixed(1)
    : '—';
  const avgAttendance = employees.length
    ? (employees.reduce((s, e) => s + e.attendancePercentage, 0) / employees.length).toFixed(1)
    : '—';

  return (
    <div>
      <PageHeader
        title={`Hello, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Manage your team's appraisals and performance"
        action={
          <Link href="/manager/appraisal">
            <Button>+ Submit Appraisal</Button>
          </Link>
        }
      />

      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading team..." className="py-20" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Team Size"
              value={employees.length}
              accentClass="bg-indigo-50 text-indigo-600"
              icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            />
            <StatCard
              label="Avg. KPI Score"
              value={avgKpi}
              accentClass="bg-emerald-50 text-emerald-600"
              icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
            />
            <StatCard
              label="Avg. Attendance"
              value={`${avgAttendance}%`}
              accentClass="bg-violet-50 text-violet-600"
              icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            />
          </div>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Team Members</h2>
              <Link href="/manager/employees" className="text-xs text-indigo-600 hover:underline">View all →</Link>
            </div>
            <div className="space-y-2">
              {employees.slice(0, 6).map((emp) => (
                <div key={emp._id} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                  <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm shrink-0">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{emp.name}</p>
                    <p className="text-xs text-gray-400">{emp.department} · {emp.employeeId}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500">KPI: <span className="font-semibold text-gray-800">{emp.kpiScore}</span></p>
                    <p className="text-xs text-gray-500">Attendance: <span className="font-semibold text-gray-800">{emp.attendancePercentage}%</span></p>
                  </div>
                  <Link href="/manager/appraisal">
                    <Button variant="ghost" size="sm">Appraise</Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
