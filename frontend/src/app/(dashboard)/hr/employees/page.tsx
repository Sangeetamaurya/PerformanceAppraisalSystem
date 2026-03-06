'use client';

import { useEffect, useState } from 'react';
import { hrService } from '@/services/hrService';
import { PageHeader } from '@/components/layouts/PageHeader';
import { Card, LoadingSpinner, ErrorAlert, EmptyState, Badge } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Employee } from '@/types';

export default function HREmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filtered, setFiltered] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                  {['ID', 'Name', 'Department', 'KPI Score', 'Attendance', 'Sales %', 'Peer Rating'].map((h) => (
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
    </div>
  );
}
