import axiosInstance from '@/lib/axios';
import {
  DepartmentPerformance,
  PopulatedAppraisal,
  SentimentStats,
} from '@/types';

// All analytics routes: /api/hr/analytics/*
export const analyticsService = {
  async getDepartmentPerformance(): Promise<DepartmentPerformance[]> {
    const { data } = await axiosInstance.get<{ departments: DepartmentPerformance[] }>(
      '/hr/analytics/department-performance',
    );
    return data.departments;
  },

  async getTopPerformers(limit = 5): Promise<PopulatedAppraisal[]> {
    const { data } = await axiosInstance.get<{ topPerformers: PopulatedAppraisal[] }>(
      `/hr/analytics/top-performers?limit=${limit}`,
    );
    return data.topPerformers;
  },

  async getBiasCases(): Promise<PopulatedAppraisal[]> {
    const { data } = await axiosInstance.get<{ biasCases: PopulatedAppraisal[] }>(
      '/hr/analytics/bias-cases',
    );
    return data.biasCases;
  },

  // Returns ONLY { averageSentimentScore: number, count: number }
  // There is no per-category breakdown from the backend
  async getAverageSentiment(): Promise<SentimentStats> {
    const { data } = await axiosInstance.get<SentimentStats>(
      '/hr/analytics/average-sentiment',
    );
    return data;
  },
};


