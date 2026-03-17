'use client';

import { useEffect, useState } from 'react';
import { hrService } from '@/services/hrService';
import { PageHeader } from '@/components/layouts/PageHeader';
import { Card, LoadingSpinner, ErrorAlert, EmptyState, Badge, SuccessAlert } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Employee } from '@/types';
import { extractApiError } from '@/lib/utils';

// ─── Reset Password Modal ────────────────────────────────────────────────────
interface ResetModalState {
  employee: Employee;
  status: 'confirm' | 'loading' | 'done';
  temporaryPassword?: string;
  error?: string;
}

interface ResetPasswordModalProps {
  modal: ResetModalState;
  onClose: () => void;
  onConfirm: () => void;
}

function ResetPasswordModal({ modal, onClose, onConfirm }: ResetPasswordModalProps) {
  const [copied, setCopied] = useState(false);

  function copyToClipboard() {
    if (modal.temporaryPassword) {
      navigator.clipboard.writeText(modal.temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={modal.status === 'loading' ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {/* Confirm state */}
        {modal.status === 'confirm' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Reset Password</h3>
                <p className="text-sm text-gray-500">This will generate a new temporary password</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="text-sm text-gray-700">
                You are about to reset the password for{' '}
                <span className="font-semibold text-gray-900">{modal.employee.name}</span>{' '}
                <span className="text-gray-400">({modal.employee.email})</span>.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                They will be required to change it on their next login.
              </p>
            </div>

            {modal.error && (
              <ErrorAlert message={modal.error} className="mb-4" />
            )}

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={onConfirm}>
                Reset Password
              </Button>
            </div>
          </>
        )}

        {/* Loading state */}
        {modal.status === 'loading' && (
          <div className="py-8 flex flex-col items-center gap-3">
            <LoadingSpinner size="md" />
            <p className="text-sm text-gray-500">Generating new password...</p>
          </div>
        )}

        {/* Done state — show the temporary password */}
        {modal.status === 'done' && modal.temporaryPassword && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Password Reset</h3>
                <p className="text-sm text-gray-500">Share this with the employee</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              New temporary password for{' '}
              <span className="font-semibold text-gray-800">{modal.employee.name}</span>:
            </p>

            {/* Password display */}
            <div className="flex items-center gap-2 bg-gray-900 rounded-xl px-4 py-3 mb-2">
              <code className="flex-1 text-emerald-400 font-mono text-base tracking-widest">
                {modal.temporaryPassword}
              </code>
              <button
                onClick={copyToClipboard}
                className="shrink-0 text-gray-400 hover:text-white transition-colors"
                title="Copy to clipboard"
              >
                {copied ? (
                  <svg className="h-5 w-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-5 flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              This password will not be shown again. Copy it before closing.
            </p>

            <Button className="w-full" onClick={onClose}>
              Done
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function HREmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filtered, setFiltered] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetModal, setResetModal] = useState<ResetModalState | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  useEffect(() => {
    hrService
      .listAllEmployees()
      .then((data) => {
        setEmployees(data);
        setFiltered(data);
      })
      .catch(() => setError('Failed to load employee list.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      employees.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q),
      ),
    );
  }, [search, employees]);

  function openResetModal(employee: Employee) {
    setResetSuccess(null);
    setResetModal({ employee, status: 'confirm' });
  }

  async function handleConfirmReset() {
    if (!resetModal) return;
    setResetModal(prev => prev ? { ...prev, status: 'loading', error: undefined } : null);
    try {
      const result = await hrService.resetEmployeePassword(resetModal.employee._id);
      setResetModal(prev => prev ? { ...prev, status: 'done', temporaryPassword: result.temporaryPassword } : null);
    } catch (err) {
      setResetModal(prev => prev
        ? { ...prev, status: 'confirm', error: extractApiError(err) }
        : null
      );
    }
  }

  function handleCloseModal() {
    if (resetModal?.status === 'done') {
      setResetSuccess(`Password for ${resetModal.employee.name} has been reset successfully.`);
    }
    setResetModal(null);
  }

  const scoreBar = (value: number, max = 100) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-400 rounded-full"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="text-xs text-gray-600 w-8 text-right">{value}</span>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${employees.length} total employees in the system`}
      />

      {resetSuccess && (
        <SuccessAlert message={resetSuccess} className="mb-4" />
      )}

      <Card padding="none">
        <div className="p-4 border-b border-gray-100">
          <Input
            placeholder="Search by name, email, department, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Loading employees..." />
          </div>
        ) : error ? (
          <div className="p-6"><ErrorAlert message={error} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search ? 'No results found' : 'No employees yet'}
            description={search ? 'Try a different search term.' : 'Upload an Excel file to import employees.'}
            icon={
              <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['ID', 'Name', 'Department', 'KPI Score', 'Attendance', 'Sales %', 'Peer Rating', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <Badge className="bg-gray-100 text-gray-600 border-gray-200 font-mono">
                        {emp.employeeId}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{emp.department}</td>
                    <td className="px-4 py-3 min-w-[120px]">{scoreBar(emp.kpiScore)}</td>
                    <td className="px-4 py-3 min-w-[120px]">{scoreBar(emp.attendancePercentage)}</td>
                    <td className="px-4 py-3 min-w-[120px]">{scoreBar(emp.salesAchievementPercentage)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg
                            key={s}
                            className={`h-3.5 w-3.5 ${s <= emp.peerRating ? 'text-amber-400' : 'text-gray-200'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-xs text-gray-500 ml-1">{emp.peerRating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openResetModal(emp)}
                        className="text-amber-600 hover:bg-amber-50 hover:text-amber-700 whitespace-nowrap"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Reset Password
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filtered.length} of {employees.length} employees
            </div>
          </div>
        )}
      </Card>

      {/* Reset Password Modal */}
      {resetModal && (
        <ResetPasswordModal
          modal={resetModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirmReset}
        />
      )}
    </div>
  );
}
