"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { analyticsService } from "@/services/analyticsService";
import { hrService } from "@/services/hrService";
import { PageHeader } from "@/components/layouts/PageHeader";
import {
  Card,
  StatCard,
  LoadingSpinner,
  ErrorAlert,
  Badge,
} from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import {
  DepartmentPerformance,
  PopulatedAppraisal,
  SentimentStats,
} from "@/types";
import { getPerformanceBadgeColor, getScoreColor } from "@/lib/utils";

export default function HRDashboard() {
  const { user } = useAuth();
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const [departments, setDepartments] = useState<DepartmentPerformance[]>([]);
  const [topPerformers, setTopPerformers] = useState<PopulatedAppraisal[]>([]);
  const [sentiment, setSentiment] = useState<SentimentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadSuccess(false);
    try {
      await hrService.downloadReport();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch {
      setDownloadError("Failed to download report. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

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
        setError("Failed to load dashboard data. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  if (error) return <ErrorAlert message={error} className="mt-4" />;

  return (
    <div>
      <PageHeader
        title={`Good morning, ${user?.name?.split(" ")[0]} 👋`}
        subtitle="Here's an overview of your organization's performance"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard
          label="Total Employees"
          value={employeeCount ?? "—"}
          accentClass="bg-indigo-50 text-indigo-600"
          icon={
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
        />
        <StatCard
          label="Departments"
          value={departments.length}
          accentClass="bg-violet-50 text-violet-600"
          icon={
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          }
        />
        <StatCard
          label="Avg Sentiment"
          value={sentiment ? sentiment.averageSentimentScore.toFixed(2) : "—"}
          accentClass="bg-emerald-50 text-emerald-600"
          icon={
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          label="Appraisals"
          value={sentiment?.count ?? "—"}
          accentClass="bg-amber-50 text-amber-600"
          icon={
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">
              Department Performance
            </h2>
            <Link
              href="/hr/analytics"
              className="text-xs text-indigo-600 hover:underline"
            >
              View all →
            </Link>
          </div>
          {departments.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              No data yet — submit appraisals first.
            </p>
          ) : (
            <div className="space-y-3">
              {departments.slice(0, 5).map((dept) => (
                <div key={dept.department}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 truncate mr-2">
                      {dept.department}
                    </span>
                    <span
                      className={`font-semibold shrink-0 ${getScoreColor(dept.averageFinalScore)}`}
                    >
                      {dept.averageFinalScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(dept.averageFinalScore, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">
              Top Performers
            </h2>
            <Link
              href="/hr/analytics"
              className="text-xs text-indigo-600 hover:underline"
            >
              View all →
            </Link>
          </div>
          {topPerformers.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              No appraisal data yet.
            </p>
          ) : (
            <div className="space-y-3">
              {topPerformers.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {p.employee?.name ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {p.employee?.department ?? "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-bold ${getScoreColor(p.finalScore)}`}
                    >
                      {p.finalScore.toFixed(1)}
                    </p>
                    <Badge
                      className={getPerformanceBadgeColor(
                        p.performanceCategory,
                      )}
                    >
                      {p.performanceCategory}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-4 sm:mt-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">
              Download Performance Report
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Generate a full PDF report with department performance, top
              performers, bias detection summary and complete employee appraisal
              records — ready to send to higher authorities.
            </p>
          </div>
          <button
            onClick={handleDownloadReport}
            disabled={isDownloading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
          >
            {isDownloading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download PDF Report
              </>
            )}
          </button>
        </div>

        {downloadSuccess && (
          <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Report downloaded successfully!
          </div>
        )}
        {downloadError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            {downloadError}
          </div>
        )}
      </Card>
      {/* <Card>
        <h2 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              href: "/hr/employees",
              label: "View Employees",
              color: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700",
            },
            {
              href: "/hr/upload",
              label: "Upload Excel",
              color: "bg-violet-50 hover:bg-violet-100 text-violet-700",
            },
            {
              href: "/hr/analytics",
              label: "Analytics",
              color: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700",
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex items-center justify-center py-3 px-4 rounded-lg text-sm font-medium transition-colors ${action.color}`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </Card> */}
    </div>
  );
}
