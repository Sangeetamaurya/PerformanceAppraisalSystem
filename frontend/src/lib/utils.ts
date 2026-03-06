import { PerformanceCategory, SentimentCategory } from '@/types';

export function getPerformanceBadgeColor(category: PerformanceCategory): string {
  const map: Record<PerformanceCategory, string> = {
    Excellent: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Good: 'bg-blue-100 text-blue-800 border-blue-200',
    Average: 'bg-amber-100 text-amber-800 border-amber-200',
    'Needs Improvement': 'bg-red-100 text-red-800 border-red-200',
  };
  return map[category] ?? 'bg-gray-100 text-gray-700';
}

export function getSentimentColor(category: SentimentCategory): string {
  const map: Record<SentimentCategory, string> = {
    Positive: 'text-emerald-600',
    Neutral: 'text-amber-600',
    Negative: 'text-red-600',
  };
  return map[category] ?? 'text-gray-600';
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
}

export function extractApiError(error: unknown): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data
  ) {
    return String((error.response.data as { message: string }).message);
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}
