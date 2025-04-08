import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
  BankAccount,
  Budget,
  Category,
  CreditCard,
} from "../models/organizze.models.js";

interface OrganizzeArgv {
  "organizze-username": string;
  "organizze-api-key": string;
  [key: string]: unknown;
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
