import axiosInstance from '@/lib/axios';
import { Employee, UploadSummary } from '@/types';

export const hrService = {
  async listAllEmployees(): Promise<Employee[]> {
    const { data } = await axiosInstance.get<{ employees: Employee[] }>('/hr/employees');
    return data.employees;
  },

  async uploadExcel(file: File): Promise<UploadSummary> {
    const formData = new FormData();
    formData.append('file', file); // backend expects field name: "file"
    // ⚠️ Do NOT set Content-Type manually — axios+FormData sets it
    // automatically WITH the required boundary string
    const { data } = await axiosInstance.post<UploadSummary>('/hr/upload-excel', formData);
    return data;
  },

  async resetEmployeePassword(employeeId: string): Promise<{ message: string; temporaryPassword: string }> {
    const { data } = await axiosInstance.post<{ message: string; temporaryPassword: string }>(
      `/hr/reset-employee-password/${employeeId}`
    );
    return data;
  },

  async downloadReport(): Promise<void> {
    const response = await axiosInstance.get('/hr/download-report', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `appraisal_report_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
