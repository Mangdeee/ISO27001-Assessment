export interface GapAssessment {
  id: number;
  category: string;
  section: string;
  standard_ref: string;
  assessment_question: string;
  compliance: string;
  notes: string;
  target_date?: string | null;
  action_item_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: string;
  due_date?: string | null;
  completed_date?: string | null;
  gap_assessment_id?: number | null;
  maturity_assessment_id?: number | null;
  category: string;
  file_name?: string | null;
  file_path?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  clause_reference?: string | null;
  annex_reference?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: number;
  title: string;
  description: string;
  file_name: string;
  file_path: string;
  file_size?: number | null;
  file_type: string;
  gap_assessment_id?: number | null;
  maturity_assessment_id?: number | null;
  clause_reference: string;
  annex_reference: string;
  uploaded_by: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export interface RiskRegister {
  id: number;
  risk_id: string;
  title: string;
  description: string;
  category: string;
  likelihood: string;
  impact: string;
  risk_level: string;
  current_controls: string;
  treatment_plan: string;
  treatment_status: string;
  owner: string;
  target_date?: string | null;
  gap_assessment_id?: number | null;
  annex_a_controls: string;
  created_at: string;
  updated_at: string;
}

export interface MaturityAssessment {
  id: number;
  category: string;
  section: string;
  standard_ref: string;
  assessment_question: string;
  current_maturity_level: string;
  current_maturity_score: number | null;
  current_maturity_comments: string;
  target_maturity_level: string;
  target_maturity_score: number | null;
  target_maturity_comments: string;
  created_at: string;
  updated_at: string;
}
