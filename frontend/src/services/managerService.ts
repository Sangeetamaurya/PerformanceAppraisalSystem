import axiosInstance from '@/lib/axios';
import { AppraisalReport, CreateAppraisalPayload, Employee } from '@/types';

export const managerService = {
  async listEmployeesForManager(): Promise<Employee[]> {
    const { data } = await axiosInstance.get<{ employees: Employee[] }>('/manager/employees');
    return data.employees;
  },

  async createAppraisal(payload: CreateAppraisalPayload): Promise<AppraisalReport> {
    const { data } = await axiosInstance.post<{ appraisal: AppraisalReport }>(
      '/manager/appraisals',
      payload,
    );
    return data.appraisal;
  },
};
