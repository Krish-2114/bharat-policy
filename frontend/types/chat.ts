export interface Source {
  policy_id: number;
  clause_id: number;
  clause_number: string;
  text: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  sources?: Source[];
}
