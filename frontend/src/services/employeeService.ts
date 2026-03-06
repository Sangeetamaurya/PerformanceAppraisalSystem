import axiosInstance from '@/lib/axios';
import { AppraisalReport } from '@/types';

export const employeeService = {
  async getMyReport(): Promise<AppraisalReport> {
    const { data } = await axiosInstance.get<AppraisalReport>('/employee/my-report');
    return data;
  },
};
