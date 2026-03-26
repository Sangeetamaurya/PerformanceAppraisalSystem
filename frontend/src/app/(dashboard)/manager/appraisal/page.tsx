'use client';

import { useEffect, useState } from 'react';
import { managerService } from '@/services/managerService';
import { PageHeader } from '@/components/layouts/PageHeader';
import { Card, LoadingSpinner, ErrorAlert, SuccessAlert } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Employee, AppraisalReport } from '@/types';
import { getPerformanceBadgeColor, getSentimentColor, getScoreColor } from '@/lib/utils';
import { Badge } from '@/components/ui';

interface FormValues {
  employeeId: string;
  managerRating: number;
  managerFeedback: string;
}

interface FormErrors {
  employeeId?: string;
  managerRating?: string;
  managerFeedback?: string;
}

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  if (!v.employeeId) e.employeeId = 'Please select an employee';
  if (!v.managerRating || v.managerRating < 1 || v.managerRating > 5) e.managerRating = 'Select a rating (1-5)';
  if (!v.managerFeedback.trim()) e.managerFeedback = 'Feedback is required';
  else if (v.managerFeedback.trim().length < 20) e.managerFeedback = 'Please provide at least 20 characters';
  return e;
}

export default function ManagerAppraisalPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [values, setValues] = useState<FormValues>({ employeeId: '', managerRating: 0, managerFeedback: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<AppraisalReport | null>(null);

  useEffect(() => {
    managerService.listEmployeesForManager()
      .then(setEmployees)
      .catch(() => setFetchError('Failed to load employees.'))
      .finally(() => setIsFetching(false));
  }, []);

  function handleChange(field: keyof FormValues, value: string | number) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (submitError) setSubmitError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }

    setIsSubmitting(true);
    try {
      const appraisal = await managerService.createAppraisal({
        employeeId: values.employeeId,
        managerRating: values.managerRating,
        managerFeedback: values.managerFeedback,
      });
      setResult(appraisal);
      setValues({ employeeId: '', managerRating: 0, managerFeedback: '' });
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setSubmitError(msg ?? 'Failed to submit appraisal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedEmployee = employees.find((e) => e._id === values.employeeId);

  if (isFetching) return <LoadingSpinner size="lg" className="py-24" text="Loading employees..." />;
  if (fetchError) return <ErrorAlert message={fetchError} />;

  return (
    <div>
      <PageHeader title="Submit Appraisal" subtitle="Rate and provide feedback for a team member" />

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Form */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-5">Appraisal Form</h2>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Select Employee</label>
              <select
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:ring-2 ${
                  errors.employeeId ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-gray-200 bg-white focus:border-indigo-400 focus:ring-indigo-100'
                }`}
                value={values.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
              >
                <option value="">— Choose a team member —</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.employeeId}) · {emp.department}
                  </option>
                ))}
              </select>
              {errors.employeeId && <p className="text-xs text-red-500">{errors.employeeId}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Manager Rating</label>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleChange('managerRating', star)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <svg
                      className={`h-8 w-8 sm:h-9 sm:w-9 transition-colors ${star <= values.managerRating ? 'text-amber-400' : 'text-gray-200 hover:text-amber-200'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                {values.managerRating > 0 && (
                  <span className="text-sm text-gray-500 self-center ml-1">
                    {['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'][values.managerRating]}
                  </span>
                )}
              </div>
              {errors.managerRating && <p className="text-xs text-red-500">{errors.managerRating}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Manager Feedback</label>
              <textarea
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 resize-none outline-none transition-colors focus:ring-2 ${
                  errors.managerFeedback ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-gray-200 bg-white focus:border-indigo-400 focus:ring-indigo-100'
                }`}
                rows={5}
                placeholder="Provide constructive, specific feedback about this employee's performance..."
                value={values.managerFeedback}
                onChange={(e) => handleChange('managerFeedback', e.target.value)}
              />
              <div className="flex justify-between">
                {errors.managerFeedback
                  ? <p className="text-xs text-red-500">{errors.managerFeedback}</p>
                  : <p className="text-xs text-gray-400">The AI system will analyze sentiment in this feedback.</p>
                }
                <p className="text-xs text-gray-400 shrink-0 ml-2">{values.managerFeedback.length} chars</p>
              </div>
            </div>

            {submitError && <ErrorAlert message={submitError} onDismiss={() => setSubmitError(null)} />}

            <Button type="submit" isLoading={isSubmitting} size="lg" className="w-full">
              Submit Appraisal
            </Button>
          </form>
        </Card>

        {/* Preview / Result Panel */}
        <div className="space-y-4">
          {selectedEmployee && !result && (
            <Card className="border-indigo-100 bg-indigo-50/30">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Selected Employee</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-base sm:text-lg shrink-0">
                  {selectedEmployee.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedEmployee.name}</p>
                  <p className="text-sm text-gray-500">{selectedEmployee.department} · {selectedEmployee.employeeId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: 'KPI Score', value: selectedEmployee.kpiScore },
                  { label: 'Attendance', value: `${selectedEmployee.attendancePercentage}%` },
                  { label: 'Sales %', value: `${selectedEmployee.salesAchievementPercentage}%` },
                  { label: 'Peer Rating', value: `${selectedEmployee.peerRating}/5` },
                ].map((item) => (
                  <div key={item.label} className="bg-white rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="font-semibold text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {result && (
            <Card className="border-emerald-100">
              <SuccessAlert message="Appraisal submitted successfully!" className="mb-4" />
              <h3 className="font-semibold text-gray-900 mb-4">Appraisal Results</h3>
              <div className="space-y-3">
                {[
                  { label: 'Employee', content: <span className="font-medium text-gray-900">{result.employee?.name}</span> },
                  { label: 'Final Score', content: <span className={`text-lg font-bold ${getScoreColor(result.finalScore)}`}>{result.finalScore?.toFixed(1)}</span> },
                  { label: 'Performance', content: result.performanceCategory && <Badge className={getPerformanceBadgeColor(result.performanceCategory)}>{result.performanceCategory}</Badge> },
                  { label: 'Sentiment', content: <span className={`font-semibold ${getSentimentColor(result.sentimentCategory)}`}>{result.sentimentCategory}</span> },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    {row.content}
                  </div>
                ))}
                {result.biasFlag && (
                  <div className="flex items-center gap-2 bg-red-50 rounded-lg px-3 py-2 text-sm text-red-600">
                    <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Bias flag raised on this appraisal
                  </div>
                )}
              </div>
              <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => setResult(null)}>
                Submit Another
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
