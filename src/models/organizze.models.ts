export interface BankAccount {
  id: number;
  name: string;
  description: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
  default: boolean;
  type: "checking" | "savings" | "other";
}

export interface Budget {
  id: number;
  amount_in_cents: number;
  category_id: number;
  date: string
  activity_type: number;
  total: number;
  predicted_total: number;
  percentage: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  parent_id: number;
  group_id: string;
  fixed: boolean;
  essential: boolean;
  default: boolean;
  uuid: string;
  kind: "expenses" | "earnings" | "none";
  archived: boolean;
}
