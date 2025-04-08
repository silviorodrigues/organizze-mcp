import { BankAccount } from "../models/organizze.models.js";

export class OrganizzeService {
  private readonly baseUrl = "https://api.organizze.com.br/rest/v2";

  // TODO: Replace by environment variable
  private readonly buildHeaders = () => ({
    Authorization: `Basic ${btoa(
      "organizze-username" + ":" + "organizze-api-key"
    )}`,
  });

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
        throw new Error(`Failed to query events: ${error.message}`);
      }
      throw new Error("Unknown error occurred");
    }
  }
}

export const organizzeService = new OrganizzeService();
