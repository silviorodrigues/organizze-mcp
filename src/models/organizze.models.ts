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

export interface CreditCard {
  id: number;
  name: string;
  description: string | null;
  card_network: string;
  closing_day: number;
  due_day: number;
  limit_cents: number;
  archived: boolean;
  default: boolean;
  institution_id: string;
  institution_name: string | null;
  created_at: string;
  updated_at: string;
  type: "credit_card";
}

export interface Invoice {
  id: number;
  date: string;
  starting_date: string;
  closing_date: string;
  amount_cents: number;
  payment_amount_cents: number;
  balance_cents: number;
  previous_balance_cents: number;
  credit_card_id: number;
}
