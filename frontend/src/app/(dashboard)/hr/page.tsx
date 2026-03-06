'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { analyticsService } from '@/services/analyticsService';
import { hrService } from '@/services/hrService';
import { PageHeader } from '@/components/layouts/PageHeader';
import { Card, StatCard, LoadingSpinner, ErrorAlert, Badge } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { DepartmentPerformance, PopulatedAppraisal, SentimentStats } from '@/types';
import { getPerformanceBadgeColor, getScoreColor } from '@/lib/utils';

export default function HRDashboard() {
  const { user } = useAuth();
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const [departments, setDepartments] = useState<DepartmentPerformance[]>([]);
  const [topPerformers, setTopPerformers] = useState<PopulatedAppraisal[]>([]);
  const [sentiment, setSentiment] = useState<SentimentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [employees, depts, performers, sent] = await Promise.all([
          hrService.listAllEmployees(),
          analyticsService.getDepartmentPerformance(),
          analyticsService.getTopPerformers(5),
          analyticsService.getAverageSentiment(),
        ]);
        setEmployeeCount(employees.length);
        setDepartments(depts);
        setTopPerformers(performers);
        setSentiment(sent);
      } catch {
        setError('Failed to load dashboard data. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading dashboard..." /></div>;
  if (error) return <ErrorAlert message={error} className="mt-4" />;

  return (
    <div>
      <PageHeader
        title={`Good morning, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's an overview of your organization's performance"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Employees" value={employeeCount ?? '—'} accentClass="bg-indigo-50 text-indigo-600"
          icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard label="Departments" value={departments.length} accentClass="bg-violet-50 text-violet-600"
          icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
        <StatCard label="Avg Sentiment Score" value={sentiment ? sentiment.averageSentimentScore.toFixed(2) : '—'} accentClass="bg-emerald-50 text-emerald-600"
          icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard label="Total Appraisals" value={sentiment?.count ?? '—'} accentClass="bg-amber-50 text-amber-600"
          icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Department Performance</h2>
            <Link href="/hr/analytics" className="text-xs text-indigo-600 hover:underline">View all →</Link>
          </div>
          {departments.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No data yet — submit appraisals first.</p>
          ) : (
            <div className="space-y-3">
              {departments.slice(0, 5).map((dept) => (
                <div key={dept.department}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{dept.department}</span>
                    <span className={`font-semibold ${getScoreColor(dept.averageFinalScore)}`}>{dept.averageFinalScore.toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(dept.averageFinalScore, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Top Performers</h2>
            <Link href="/hr/analytics" className="text-xs text-indigo-600 hover:underline">View all →</Link>
          </div>
          {topPerformers.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No appraisal data yet.</p>
          ) : (
            <div className="space-y-3">
              {topPerformers.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>#{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.employee?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400 truncate">{p.employee?.department ?? '—'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${getScoreColor(p.finalScore)}`}>{p.finalScore.toFixed(1)}</p>
                    <Badge className={getPerformanceBadgeColor(p.performanceCategory)}>{p.performanceCategory}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: '/hr/employees', label: 'View Employees', color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700' },
            { href: '/hr/upload', label: 'Upload Excel', color: 'bg-violet-50 hover:bg-violet-100 text-violet-700' },
            { href: '/hr/analytics', label: 'Analytics', color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' },
          ].map((action) => (
            <Link key={action.href} href={action.href} className={`flex items-center justify-center py-3 px-4 rounded-lg text-sm font-medium transition-colors ${action.color}`}>
              {action.label}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
