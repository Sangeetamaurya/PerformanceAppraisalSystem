'use client';

import { useEffect, useState } from 'react';
import { employeeService } from '@/services/employeeService';
import { PageHeader } from '@/components/layouts/PageHeader';
import { Card, LoadingSpinner, ErrorAlert, Badge } from '@/components/ui';
import { AppraisalReport } from '@/types';
import {
  formatDate,
  getPerformanceBadgeColor,
  getScoreColor,
  getSentimentColor,
} from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

function ScoreRing({ score, label }: { score: number; label: string }) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke={clampedScore >= 80 ? '#10b981' : clampedScore >= 60 ? '#6366f1' : clampedScore >= 40 ? '#f59e0b' : '#ef4444'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold ${getScoreColor(clampedScore)}`}>{clampedScore}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 text-center">{label}</p>
    </div>
  );
}

export default function EmployeeReportPage() {
  const { user } = useAuth();
  const [report, setReport] = useState<AppraisalReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    employeeService
      .getMyReport()
      .then(setReport)
      .catch((err) => {
        const msg =
          err?.response?.data?.message ?? 'Could not load your appraisal report.';
        setError(msg);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner size="lg" className="py-24" text="Loading your report..." />;

  return (
    <div>
      <PageHeader
        title={`My Performance Report`}
        subtitle={report ? `Last updated: ${formatDate(report.createdAt)}` : `Welcome, ${user?.name}`}
      />

      {error ? (
        <Card className="border-amber-100 bg-amber-50">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-amber-800">No appraisal found</p>
              <p className="text-sm text-amber-700 mt-1">
                {error === 'Employee profile not linked to this user'
                  ? 'Your user account is not linked to an employee profile yet. Please contact HR.'
                  : 'Your manager hasn\'t submitted an appraisal for you yet. Check back later.'}
              </p>
            </div>
          </div>
        </Card>
      ) : report ? (
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-16 w-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-700 font-bold text-2xl shrink-0">
              {report.employee?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{report.employee?.name}</h2>
                  <p className="text-gray-500">{report.employee?.email}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {report.employee?.department} · ID: {report.employee?.employeeId}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {report.performanceCategory && (
                    <Badge className={`${getPerformanceBadgeColor(report.performanceCategory)} text-sm px-3 py-1`}>
                      {report.performanceCategory}
                    </Badge>
                  )}
                  {report.biasFlag && (
                    <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                      ⚠ Bias Flagged
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Score Rings */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-6">Performance Metrics</h3>
            <div className="flex justify-around flex-wrap gap-6">
              <ScoreRing score={report.finalScore} label="Final Score" />
              <ScoreRing score={report.kpiScore} label="KPI Score" />
              <ScoreRing score={report.attendancePercentage} label="Attendance" />
              <div className="flex flex-col items-center gap-2">
                <div className="h-24 w-24 bg-gray-50 rounded-full border-4 border-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl font-bold text-amber-500">{report.managerRating}</p>
                    <p className="text-xs text-gray-400">/5</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Manager Rating</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className={`h-24 w-24 rounded-full border-4 flex items-center justify-center ${report.sentimentCategory === 'Positive' ? 'bg-emerald-50 border-emerald-200' : report.sentimentCategory === 'Negative' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="text-center">
                    <p className="text-2xl">
                      {report.sentimentCategory === 'Positive' ? '😊' : report.sentimentCategory === 'Negative' ? '😟' : '😐'}
                    </p>
                  </div>
                </div>
                <p className={`text-xs font-medium ${getSentimentColor(report.sentimentCategory)}`}>
                  {report.sentimentCategory}
                </p>
              </div>
            </div>
          </Card>

          {/* Manager Feedback */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Manager Feedback</h3>
              {report.manager && (
                <p className="text-xs text-gray-400">by {report.manager.name}</p>
              )}
            </div>
            <blockquote className="border-l-4 border-indigo-200 pl-4 text-gray-700 italic leading-relaxed">
              "{report.managerFeedback}"
            </blockquote>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <span>Sentiment score: <span className={`font-semibold ${getSentimentColor(report.sentimentCategory)}`}>{report.sentimentScore?.toFixed(3)}</span></span>
              <span>·</span>
              <span>Category: <span className={`font-semibold ${getSentimentColor(report.sentimentCategory)}`}>{report.sentimentCategory}</span></span>
            </div>
          </Card>

          {/* Detailed Scores */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Detailed Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'KPI Score', value: report.kpiScore, max: 100 },
                { label: 'Attendance', value: report.attendancePercentage, max: 100 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className={`font-semibold ${getScoreColor(item.value)}`}>{item.value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${(item.value / item.max) * 100}%`,
                        background: `hsl(${(item.value / item.max) * 120}, 65%, 50%)`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
