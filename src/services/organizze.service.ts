import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
  BankAccount,
  Budget,
  Category,
  CreditCard,
  CreditCardInvoice,
  DetailedInvoice,
  Transaction,
} from "../models/organizze.models.js";

interface OrganizzeArgv {
  "organizze-username": string;
  "organizze-api-key": string;
  [key: string]: unknown;
}

interface OrganizzeDateRange {
  start_date: string;
  end_date: string;
}

export class OrganizzeService {
  private readonly baseUrl = "https://api.organizze.com.br/rest/v2";

  private readonly argv = yargs(hideBin(process.argv))
    .option("organizze-username", {
      type: "string",
      description: "Organizze username",
      demandOption: true,
    })
    .option("organizze-api-key", {
      type: "string",
      description: "Organizze API key",
      demandOption: true,
    })
    .help().argv as OrganizzeArgv;

  private readonly buildHeaders = () => {
    const username = this.argv["organizze-username"];
    const apiKey = this.argv["organizze-api-key"];

    return {
      Authorization: `Basic ${btoa(username + ":" + apiKey)}`,
    };
  };

  public async getBankAccounts(
    account_id?: number
  ): Promise<BankAccount[] | BankAccount> {
    try {
      let url = `${this.baseUrl}/accounts`;
      if (account_id) {
        url += `/${account_id}`;
      }

      const response = await fetch(url, {
        headers: this.buildHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return (await response.json()) as BankAccount[] | BankAccount;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get bank accounts: ${error.message}`);
      }

      throw new Error("Unknown error occurred");
    }
  }
  
  public async getTransactions(params?: {
    account_id?: number;
    date_range?: OrganizzeDateRange;
  }): Promise<Transaction[]> {
    try {
      let url = `${this.baseUrl}/transactions?`;

      if (params?.account_id) {
        url += `account_id=${params.account_id}&`;
      }

      if (params?.date_range) {
        url += `start_date=${params.date_range.start_date}&end_date=${params.date_range.end_date}&`;
      }

      const response = await fetch(url, {
        headers: this.buildHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return (await response.json()) as Transaction[];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get transactions: ${error.message}`);
      }

      throw new Error("Unknown error occurred");
    }
  }

  public async getTransaction(transaction_id: number): Promise<Transaction> {
    try {
      let url = `${this.baseUrl}/transactions/${transaction_id}`;

      const response = await fetch(url, {
        headers: this.buildHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return (await response.json()) as Transaction;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get transaction: ${error.message}`);
      }

      throw new Error("Unknown error occurred");
    }
  }

  public async getCreditCards(
    credit_card_id?: number
  ): Promise<CreditCard[] | CreditCard> {
    try {
      let url = `${this.baseUrl}/credit_cards`;

      if (credit_card_id) {
        url += `/${credit_card_id}`;
      }

      const response = await fetch(url, {
        headers: this.buildHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return (await response.json()) as CreditCard[] | CreditCard;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get credit cards: ${error.message}`);
      }

      throw new Error("Unknown error occurred");
    }
  }

  public async getCreditCardInvoices(credit_card_id: number, dateRange?: OrganizzeDateRange): Promise<CreditCardInvoice[]> {
    try {
      let url = `${this.baseUrl}/credit_cards/${credit_card_id}/invoices`;

      if (dateRange) {
        url += `?start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`;
      }

      const response = await fetch(url, {
        headers: this.buildHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return (await response.json()) as CreditCardInvoice[];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get credit cards invoices: ${error.message}`);
      }

      throw new Error("Unknown error occurred");
    }
  }

  public async getInvoiceDetails(credit_card_id: number, invoice_id: number): Promise<DetailedInvoice> {
    try {
      let url = `${this.baseUrl}/credit_cards/${credit_card_id}/invoices/${invoice_id}`;

      const response = await fetch(url, {
        headers: this.buildHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return (await response.json()) as DetailedInvoice;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get invoice details: ${error.message}`);
      }

      throw new Error("Unknown error occurred");
    }
  }

  public async getBudgets(year?: string, month?: string): Promise<Budget[]> {
    try {
      let url = `${this.baseUrl}/budgets`;

      if (year) {
        url += `/${year}`;
      }

      if (month) {
        url += `/${month}`;
      }

      const response = await fetch(url, {
        headers: this.buildHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return (await response.json()) as Budget[];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get events: ${error.message}`);
      }

      throw new Error("Unknown error occurred");
    }
  }

  public async getCategories(
    category_id?: number
  ): Promise<Category[] | Category> {
    try {
      let url = `${this.baseUrl}/categories`;

      if (category_id) {
        url += `/${category_id}`;
      }

      const response = await fetch(url, {
        headers: this.buildHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return (await response.json()) as Category[] | Category;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get categories: ${error.message}`);
      }

      throw new Error("Unknown error occurred");
    }
  }
}

export const organizzeService = new OrganizzeService();
