'use client';

import { useRef, useState } from 'react';
import { hrService } from '@/services/hrService';
import { PageHeader } from '@/components/layouts/PageHeader';
import { Card, ErrorAlert, SuccessAlert } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { UploadSummary } from '@/types';
import { cn } from '@/lib/cn';

export default function HRUploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState<UploadSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(selectedFile: File) {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Only Excel files (.xlsx, .xls) are accepted.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be under 5 MB.');
      return;
    }
    setFile(selectedFile);
    setSummary(null);
    setError(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  }

  async function handleUpload() {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const result = await hrService.uploadExcel(file);
      setSummary(result);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg ?? 'Upload failed. Check your file format and try again.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Upload Employees" subtitle="Import employee data from an Excel spreadsheet" />

      <div className="max-w-2xl space-y-4 sm:space-y-6">
        {/* Column guide */}
        <Card className="bg-indigo-50 border-indigo-100">
          <div className="flex gap-3">
            <svg className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-indigo-800 mb-2">Required Excel columns</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {['employeeId','name','email','department','attendancePercentage','kpiScore','salesAchievementPercentage','peerRating'].map((col) => (
                  <code key={col} className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded font-mono">{col}</code>
                ))}
              </div>
              <p className="text-xs text-indigo-600">✓ Auto-creates an Employee user account with a generated password for each new row.</p>
            </div>
          </div>
        </Card>

        {/* Drop Zone */}
        <Card padding="none">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 p-8 sm:p-12',
              isDragging ? 'border-indigo-400 bg-indigo-50'
                : file ? 'border-emerald-300 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
            )}
          >
            <input ref={inputRef} type="file" accept=".xlsx,.xls" className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
            {file ? (
              <>
                <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800 break-all">{file.name}</p>
                  <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                </div>
              </>
            ) : (
              <>
                <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-700">Drop your Excel file here</p>
                  <p className="text-sm text-gray-400">or tap to browse · .xlsx or .xls · max 5 MB</p>
                </div>
              </>
            )}
          </div>
        </Card>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {summary && (
          <Card className="border-emerald-100">
            <h3 className="font-semibold text-gray-900 mb-3">Upload Complete</h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
              {[
                { label: 'Total Rows', value: summary.processed, color: 'text-gray-900' },
                { label: 'Succeeded', value: summary.success, color: 'text-emerald-700' },
                { label: 'Failed', value: summary.failed, color: summary.failed > 0 ? 'text-red-600' : 'text-gray-400' },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                  <p className={`text-xl sm:text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {summary.errors && summary.errors.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-red-600 mb-2">{summary.errors.length} row(s) had errors:</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {summary.errors.map((e, i) => (
                    <div key={i} className="flex gap-2 text-xs bg-red-50 px-3 py-1.5 rounded items-start">
                      <span className="font-bold text-red-500 shrink-0">Row {e.row}:</span>
                      <span className="text-red-700">{e.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summary.errors.length === 0 && (
              <SuccessAlert message="All rows processed successfully with no errors." />
            )}

            {summary.generatedAccounts && summary.generatedAccounts.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-indigo-700 mb-2">
                  🔑 {summary.generatedAccounts.length} employee login(s) auto-created — save these credentials:
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1.5 bg-indigo-50 rounded-lg p-3">
                  {summary.generatedAccounts.map((acc, i) => (
                    <div key={i} className="text-xs font-mono bg-white rounded px-3 py-1.5 border border-indigo-100 break-all">
                      <span className="text-gray-600">{acc.name}</span>
                      {' · '}
                      <span className="text-indigo-600">{acc.email}</span>
                      {' · '}
                      <span className="font-bold text-gray-800">{acc.generatedPassword}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        <Button size="lg" onClick={handleUpload} disabled={!file} isLoading={isUploading} className="w-full sm:w-auto">
          {isUploading ? 'Uploading...' : 'Upload & Import'}
        </Button>
      </div>
    </div>
  );
}
