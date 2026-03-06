'use client';

import { useEffect, useState } from 'react';
import { managerService } from '@/services/managerService';
import { PageHeader } from '@/components/layouts/PageHeader';
import { Card, LoadingSpinner, ErrorAlert, EmptyState, Badge } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Employee } from '@/types';

export default function ManagerEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filtered, setFiltered] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    managerService
      .listEmployeesForManager()
      .then((data) => { setEmployees(data); setFiltered(data); })
      .catch(() => setError('Failed to load team data.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(employees.filter(
      (e) => e.name.toLowerCase().includes(q) || e.department.toLowerCase().includes(q) || e.employeeId.toLowerCase().includes(q),
    ));
  }, [search, employees]);

  return (
    <div>
      <PageHeader title="My Team" subtitle={`${employees.length} team members`} />

      <Card padding="none">
        <div className="p-4 border-b border-gray-100">
          <Input placeholder="Search by name, department, or ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {isLoading ? (
          <LoadingSpinner className="py-20" text="Loading team..." />
        ) : error ? (
          <div className="p-6"><ErrorAlert message={error} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No team members found" description="Try adjusting your search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['Employee', 'Department', 'KPI', 'Attendance', 'Sales', 'Peer Rating'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{emp.name}</p>
                          <p className="text-xs text-gray-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-gray-100 text-gray-700 border-gray-200">{emp.department}</Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{emp.kpiScore}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{emp.attendancePercentage}%</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{emp.salesAchievementPercentage}%</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <svg key={s} className={`h-4 w-4 ${s <= emp.peerRating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
