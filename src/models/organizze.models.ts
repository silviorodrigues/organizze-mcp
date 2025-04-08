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
