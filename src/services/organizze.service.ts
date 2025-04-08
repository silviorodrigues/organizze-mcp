import { BankAccount, Budget, Category } from "../models/organizze.models.js";

export class OrganizzeService {
  private readonly baseUrl = "https://api.organizze.com.br/rest/v2";

  // TODO: Replace by environment variables
  private readonly buildHeaders = () => {
    const username = process.env.ORGANIZZE_USERNAME;
    const apiKey = process.env.ORGANIZZE_API_KEY;

    return {
      Authorization: `Basic ${btoa(username + ":" + apiKey)}`,
    };
  };

  public async getBankAccounts(): Promise<BankAccount[]> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts`, {
        headers: this.buildHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return (await response.json()) as BankAccount[];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get bank accounts: ${error.message}`);
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

  public async getCategories(category_id?: number): Promise<Category[] | Category> {
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
