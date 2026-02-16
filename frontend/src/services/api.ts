import axios from 'axios';
import { GapAssessment, MaturityAssessment, ActionItem, Evidence, RiskRegister } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const gapAssessmentService = {
  getAll: () => api.get<GapAssessment[]>('/gap-assessments'),
  getById: (id: number) => api.get<GapAssessment>(`/gap-assessments/${id}`),
  create: (data: Omit<GapAssessment, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<GapAssessment>('/gap-assessments', data),
  update: (id: number, data: Partial<GapAssessment>) =>
    api.put<GapAssessment>(`/gap-assessments/${id}`, data),
  delete: (id: number) => api.delete(`/gap-assessments/${id}`),
};

export const maturityAssessmentService = {
  getAll: () => api.get<MaturityAssessment[]>('/maturity-assessments'),
  getById: (id: number) => api.get<MaturityAssessment>(`/maturity-assessments/${id}`),
  create: (data: Omit<MaturityAssessment, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<MaturityAssessment>('/maturity-assessments', data),
  update: (id: number, data: Partial<MaturityAssessment>) =>
    api.put<MaturityAssessment>(`/maturity-assessments/${id}`, data),
  delete: (id: number) => api.delete(`/maturity-assessments/${id}`),
};

export const actionItemService = {
  getAll: () => api.get<ActionItem[]>('/action-items'),
  getById: (id: number) => api.get<ActionItem>(`/action-items/${id}`),
  create: (data: Omit<ActionItem, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<ActionItem>('/action-items', data),
  update: (id: number, data: Partial<ActionItem>) =>
    api.put<ActionItem>(`/action-items/${id}`, data),
  delete: (id: number) => api.delete(`/action-items/${id}`),
};

export const evidenceService = {
  getAll: () => api.get<Evidence[]>('/evidence'),
  getById: (id: number) => api.get<Evidence>(`/evidence/${id}`),
  create: (data: Omit<Evidence, 'id' | 'uploaded_at' | 'created_at' | 'updated_at'>) =>
    api.post<Evidence>('/evidence', data),
  update: (id: number, data: Partial<Evidence>) =>
    api.put<Evidence>(`/evidence/${id}`, data),
  delete: (id: number) => api.delete(`/evidence/${id}`),
};

export const riskService = {
  getAll: () => api.get<RiskRegister[]>('/risks'),
  getById: (id: number) => api.get<RiskRegister>(`/risks/${id}`),
  create: (data: Omit<RiskRegister, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<RiskRegister>('/risks', data),
  update: (id: number, data: Partial<RiskRegister>) =>
    api.put<RiskRegister>(`/risks/${id}`, data),
  delete: (id: number) => api.delete(`/risks/${id}`),
};
