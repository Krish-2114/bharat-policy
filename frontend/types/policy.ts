export interface Policy {
  id: number;
  title: string;
  description?: string;
  created_at?: string;
  num_clauses?: number;
  file_type?: string;
}

export interface Clause {
  id: number;
  policy_id: number;
  clause_number: string;
  text: string;
}
