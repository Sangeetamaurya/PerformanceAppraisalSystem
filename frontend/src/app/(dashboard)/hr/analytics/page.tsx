'use client';

import { useEffect, useState } from 'react';
import { analyticsService } from '@/services/analyticsService';
import { PageHeader } from '@/components/layouts/PageHeader';
import { Card, LoadingSpinner, ErrorAlert, Badge, StatCard } from '@/components/ui';
import { DepartmentPerformance, PopulatedAppraisal, SentimentStats } from '@/types';
import { getPerformanceBadgeColor, getSentimentColor, getScoreColor } from '@/lib/utils';

export default function HRAnalyticsPage() {
  const [departments, setDepartments] = useState<DepartmentPerformance[]>([]);
  const [topPerformers, setTopPerformers] = useState<PopulatedAppraisal[]>([]);
  const [biasCases, setBiasCases] = useState<PopulatedAppraisal[]>([]);
  const [sentiment, setSentiment] = useState<SentimentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      analyticsService.getDepartmentPerformance(),
      analyticsService.getTopPerformers(10),
      analyticsService.getBiasCases(),
      analyticsService.getAverageSentiment(),
    ])
      .then(([depts, performers, bias, sent]) => {
        setDepartments(depts);
        setTopPerformers(performers);
        setBiasCases(bias);
        setSentiment(sent);
      })
      .catch(() => setError('Failed to load analytics data.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading analytics..." /></div>;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Organization-wide performance insights" />

      {sentiment && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <StatCard
            label="Avg. Sentiment"
            value={sentiment.averageSentimentScore.toFixed(4)}
            accentClass="bg-indigo-50 text-indigo-600"
            icon={<svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            label="Total Appraisals"
            value={sentiment.count}
            accentClass="bg-violet-50 text-violet-600"
            icon={<svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <Card>
          <h2 className="font-semibold text-gray-900 mb-5 text-sm sm:text-base">Department Performance</h2>
          {departments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No appraisals submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {departments.map((dept) => (
                <div key={dept.department}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-700 truncate mr-2">{dept.department}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400 hidden sm:inline">{dept.count} appraisals</span>
                      <span className={`text-sm font-bold ${getScoreColor(dept.averageFinalScore)}`}>{dept.averageFinalScore.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(dept.averageFinalScore, 100)}%`, background: `hsl(${(dept.averageFinalScore / 100) * 120}, 65%, 50%)` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-gray-900 mb-5 text-sm sm:text-base">Top Performers</h2>
          {topPerformers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No appraisals submitted yet.</p>
          ) : (
            <div className="space-y-2.5">
              {topPerformers.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3 py-1.5">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i < 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.employee?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{p.employee?.department ?? '—'}</p>
                  </div>
                  <div className="shrink-0 text-right">
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
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Bias Detection Cases</h2>
          {biasCases.length > 0 && (
            <Badge className="bg-red-100 text-red-700 border-red-200">{biasCases.length} flagged</Badge>
          )}
        </div>
        {biasCases.length === 0 ? (
          <div className="flex items-center gap-3 py-6 text-emerald-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm font-medium">No bias cases detected. All appraisals look fair.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Employee', 'Department', 'Manager Rating', 'Sentiment', 'Final Score'].map((h) => (
                      <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {biasCases.map((bc) => (
                    <tr key={bc._id} className="hover:bg-red-50/40 transition-colors">
                      <td className="px-3 py-2.5 font-medium text-gray-900">{bc.employee?.name ?? '—'}</td>
                      <td className="px-3 py-2.5 text-gray-500">{bc.employee?.department ?? '—'}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <svg key={s} className={`h-3.5 w-3.5 ${s <= bc.managerRating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2.5"><span className={`font-medium ${getSentimentColor(bc.sentimentCategory)}`}>{bc.sentimentCategory}</span></td>
                      <td className="px-3 py-2.5"><span className={`font-bold ${getScoreColor(bc.finalScore)}`}>{bc.finalScore.toFixed(1)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {biasCases.map((bc) => (
                <div key={bc._id} className="bg-red-50/40 rounded-lg p-3 border border-red-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{bc.employee?.name ?? '—'}</p>
                      <p className="text-xs text-gray-500">{bc.employee?.department ?? '—'}</p>
                    </div>
                    <span className={`font-bold text-sm ${getScoreColor(bc.finalScore)}`}>{bc.finalScore.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <svg key={s} className={`h-3.5 w-3.5 ${s <= bc.managerRating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className={`text-xs font-medium ${getSentimentColor(bc.sentimentCategory)}`}>{bc.sentimentCategory}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
